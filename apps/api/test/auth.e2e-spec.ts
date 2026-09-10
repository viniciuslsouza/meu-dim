import {
  createHash,
  createHmac,
  randomUUID
} from "node:crypto";

import {
  type ExecutionContext,
  HttpException,
  type INestApplication,
  ValidationPipe
} from "@nestjs/common";
import { getQueueToken } from "@nestjs/bullmq";
import { Test } from "@nestjs/testing";
import cookieParser from "cookie-parser";
import request from "supertest";

import { AppModule } from "../src/app.module";
import { MailService } from "../src/mail/mail.service";
import { PaidGuard } from "../src/modules/auth/guards/paid.guard";
import { PdfProcessor } from "../src/modules/reports/pdf.processor";
import { PrismaService } from "../src/prisma/prisma.service";

jest.setTimeout(60_000);

describe("Auth and users (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let lastMagicLink = "";
  const emails = new Set<string>();
  const mailMock = {
    sendMagicLink: jest.fn(async (_to: string, link: string) => {
      lastMagicLink = link;
    }),
    sendPaymentConfirmed: jest.fn(async () => undefined)
  };

  const createEmail = (): string => {
    const email = `e2e-${randomUUID()}@example.com`;

    emails.add(email);
    return email;
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    })
      .overrideProvider(MailService)
      .useValue(mailMock)
      .overrideProvider(getQueueToken("pdf"))
      .useValue({ add: jest.fn() })
      .overrideProvider(PdfProcessor)
      .useValue({ process: jest.fn() })
      .compile();

    app = moduleRef.createNestApplication({ rawBody: true });
    app.use(cookieParser());
    app.setGlobalPrefix("v1");
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true
      })
    );
    await app.init();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    if (emails.size > 0) {
      await prisma.user.deleteMany({
        where: { email: { in: [...emails] } }
      });
    }
    await app.close();
  });

  beforeEach(() => {
    lastMagicLink = "";
    mailMock.sendMagicLink.mockClear();
    mailMock.sendPaymentConfirmed.mockClear();
  });

  it("requests a magic link without exposing account existence", async () => {
    const email = createEmail();

    await request(app.getHttpServer())
      .post("/v1/auth/magic-link")
      .send({ email })
      .expect(201)
      .expect({
        message: "Se o e-mail existir, você receberá um link em breve."
      });

    expect(mailMock.sendMagicLink).toHaveBeenCalledTimes(1);
    expect(lastMagicLink).toContain("/auth/callback?token=");
  });

  it("rejects invalid and expired magic links", async () => {
    await request(app.getHttpServer())
      .post("/v1/auth/verify")
      .send({ token: "a".repeat(64) })
      .expect(401);

    const email = createEmail();
    const user = await prisma.user.create({ data: { email } });
    const token = "b".repeat(64);

    await prisma.magicLink.create({
      data: {
        userId: user.id,
        tokenHash: createHash("sha256").update(token).digest("hex"),
        expiresAt: new Date(Date.now() - 60_000)
      }
    });

    await request(app.getHttpServer())
      .post("/v1/auth/verify")
      .send({ token })
      .expect(401);
  });

  it("completes login, refresh, profile, export and deletion", async () => {
    const email = createEmail();

    await request(app.getHttpServer())
      .post("/v1/auth/magic-link")
      .send({ email })
      .expect(201);

    const token = new URL(lastMagicLink).searchParams.get("token");

    expect(token).toBeTruthy();
    const verification = await request(app.getHttpServer())
      .post("/v1/auth/verify")
      .send({ token })
      .expect(200);
    const accessToken = verification.body.accessToken as string;
    const setCookieHeader = verification.headers["set-cookie"] as unknown;
    const refreshCookie = Array.isArray(setCookieHeader)
      ? String(setCookieHeader[0] ?? "")
      : String(setCookieHeader ?? "");

    expect(accessToken).toBeTruthy();
    expect(refreshCookie).toBeTruthy();
    expect(refreshCookie).toContain("refresh_token=");
    expect(refreshCookie).toContain("HttpOnly");
    expect(refreshCookie).toContain("SameSite=Strict");

    await request(app.getHttpServer())
      .post("/v1/auth/verify")
      .send({ token })
      .expect(401);

    await request(app.getHttpServer())
      .post("/v1/auth/refresh")
      .set("Cookie", refreshCookie)
      .expect(200)
      .expect(({ body }) => {
        expect(body.accessToken).toBeTruthy();
      });

    await request(app.getHttpServer())
      .get("/v1/users/me")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.email).toBe(email);
        expect(body).not.toHaveProperty("updatedAt");
      });

    await request(app.getHttpServer())
      .patch("/v1/users/me")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "Pessoa Teste" })
      .expect(200)
      .expect(({ body }) => {
        expect(body.name).toBe("Pessoa Teste");
      });

    await request(app.getHttpServer())
      .get("/v1/users/me/export")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect("Content-Disposition", /meu-dim-dados\.json/)
      .expect(200)
      .expect(({ body }) => {
        expect(body.user.email).toBe(email);
        expect(body.statements).toEqual([]);
        expect(body.debts).toEqual([]);
      });

    await request(app.getHttpServer())
      .delete("/v1/users/me")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    expect(
      await prisma.user.findUnique({ where: { email } })
    ).toBeNull();
  });

  it("exposes public rates and payoff simulation", async () => {
    await request(app.getHttpServer())
      .get("/v1/debts/reference-rates")
      .expect(200)
      .expect(({ body }) => {
        expect(body.rates).toHaveLength(4);
        expect(body.warning).toContain("Taxas de referência");
      });

    await request(app.getHttpServer())
      .post("/v1/plans/simulate")
      .send({
        debts: [
          {
            name: "Cartão",
            type: "CREDIT_CARD",
            balance: 1_000,
            monthlyRate: 0.1,
            minimumPayment: 100
          }
        ],
        monthlyBudget: 300
      })
      .expect(201)
      .expect(({ body }) => {
        expect(body.snowball.months).toBeGreaterThan(0);
        expect(body.avalanche.months).toBeGreaterThan(0);
        expect(body.snowball).not.toHaveProperty("schedule");
      });
  });

  it("stores statements, diagnoses and category corrections", async () => {
    const email = createEmail();

    await request(app.getHttpServer())
      .post("/v1/auth/magic-link")
      .send({ email })
      .expect(201);
    const token = new URL(lastMagicLink).searchParams.get("token");
    const verification = await request(app.getHttpServer())
      .post("/v1/auth/verify")
      .send({ token })
      .expect(200);
    const accessToken = verification.body.accessToken as string;
    const statementResponse = await request(app.getHttpServer())
      .post("/v1/statements")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        bank: "NUBANK",
        referenceMonth: "2026-09",
        total: 100,
        transactions: [
          {
            date: "2026-09-10",
            description: "Compra de teste",
            merchantKey: "IFOOD",
            amount: 100,
            category: "Mercado",
            isRecurring: false
          }
        ],
        warnings: []
      })
      .expect(201);
    const statementId = statementResponse.body.id as string;
    const transactionId = statementResponse.body.transactions[0].id as string;

    await request(app.getHttpServer())
      .get(`/v1/statements/${statementId}/diagnosis`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.healthScore).toBeGreaterThanOrEqual(0);
        expect(body.topOffenders[0].category).toBe("Mercado");
      });

    await request(app.getHttpServer())
      .patch(
        `/v1/statements/${statementId}/transactions/${transactionId}`
      )
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ category: "Lazer" })
      .expect(200)
      .expect(({ body }) => {
        expect(body.category).toBe("Lazer");
      });

    const user = await prisma.user.findUniqueOrThrow({ where: { email } });
    const rule = await prisma.userCategoryRule.findUnique({
      where: {
        userId_merchantKey: {
          userId: user.id,
          merchantKey: "IFOOD"
        }
      }
    });

    expect(rule?.category).toBe("Lazer");

    await request(app.getHttpServer())
      .post("/v1/plans")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        debts: [
          {
            name: "Cartão",
            type: "CREDIT_CARD",
            balance: 1_000,
            monthlyRate: 0.1,
            minimumPayment: 100
          }
        ],
        monthlyBudget: 300,
        chosenStrategy: "AVALANCHE"
      })
      .expect(402);
  });

  it("creates mock checkouts and activates a paid plan idempotently", async () => {
    const email = createEmail();

    await request(app.getHttpServer())
      .post("/v1/auth/magic-link")
      .send({ email })
      .expect(201);
    const token = new URL(lastMagicLink).searchParams.get("token");
    const verification = await request(app.getHttpServer())
      .post("/v1/auth/verify")
      .send({ token })
      .expect(200);
    const accessToken = verification.body.accessToken as string;
    const pixCheckout = await request(app.getHttpServer())
      .post("/v1/payments/checkout")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        product: "ONE_TIME_PLAN",
        provider: "MERCADOPAGO"
      })
      .expect(201);

    expect(pixCheckout.body.qrCode).toContain("MEUDIM-MOCK");
    const paymentId = pixCheckout.body.paymentId as string;

    await request(app.getHttpServer())
      .get(`/v1/payments/${paymentId}/status`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200)
      .expect({ status: "PENDING" });

    await request(app.getHttpServer())
      .post("/v1/payments/checkout")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        product: "SUBSCRIPTION",
        provider: "STRIPE"
      })
      .expect(201)
      .expect(({ body }) => {
        expect(body.paymentId).toBeTruthy();
        expect(body.url).toContain("/checkout/mock-stripe?");
      });

    const rawWebhook = JSON.stringify({
      type: "payment",
      data: {
        id: "mp-mock-approved",
        external_reference: paymentId,
        status: "approved"
      }
    });
    const signature = createHmac(
      "sha256",
      process.env.MP_WEBHOOK_SECRET ??
        process.env.PAYMENTS_MOCK_WEBHOOK_SECRET ??
        "development-mock-payments-secret"
    )
      .update(rawWebhook)
      .digest("hex");

    for (let attempt = 0; attempt < 2; attempt += 1) {
      await request(app.getHttpServer())
        .post("/v1/payments/webhooks/mercadopago")
        .set("Content-Type", "application/json")
        .set("X-Signature", signature)
        .send(rawWebhook)
        .expect(201)
        .expect({ status: "ok" });
    }

    await request(app.getHttpServer())
      .get(`/v1/payments/${paymentId}/status`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200)
      .expect({ status: "PAID" });
    const user = await prisma.user.findUniqueOrThrow({ where: { email } });

    expect(user.plan).toBe("ONE_TIME");
    expect(mailMock.sendPaymentConfirmed).toHaveBeenCalledTimes(1);
  });

  it("limits magic-link requests to ten per minute and IP", async () => {
    const responses = await Promise.all(
      Array.from({ length: 11 }, () => {
        const email = createEmail();

        return request(app.getHttpServer())
          .post("/v1/auth/magic-link")
          .set("X-Forwarded-For", "203.0.113.70")
          .send({ email });
      })
    );

    expect(responses.slice(0, 10).every(({ status }) => status === 201))
      .toBe(true);
    expect(responses[10]?.status).toBe(429);
  });

  it("blocks free users with the paid guard", () => {
    const guard = new PaidGuard();
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            id: "user-id",
            email: "free@example.com",
            name: null,
            plan: "FREE",
            planExpiresAt: null,
            createdAt: new Date()
          }
        })
      })
    } as unknown as ExecutionContext;

    try {
      guard.canActivate(context);
      throw new Error("PaidGuard deveria bloquear o usuário");
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect((error as HttpException).getStatus()).toBe(402);
    }
  });
});
