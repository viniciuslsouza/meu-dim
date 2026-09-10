import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Resend } from "resend";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

@Injectable()
export class MailService {
  private readonly resend: Resend | null;

  constructor(private readonly config: ConfigService) {
    const apiKey = config.get<string>("RESEND_API_KEY");

    this.resend = apiKey ? new Resend(apiKey) : null;
  }

  async sendMagicLink(to: string, link: string): Promise<void> {
    if (!this.resend) {
      return;
    }

    const { error } = await this.resend.emails.send({
      from: this.config.getOrThrow<string>("EMAIL_FROM"),
      to,
      subject: "Seu link de acesso — Meu Dim",
      html: `
        <h2>Bem-vindo ao Meu Dim</h2>
        <p>Clique no link abaixo para entrar (válido por 15 minutos):</p>
        <a href="${escapeHtml(link)}" style="background:#0F766E;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;">
          Entrar no Meu Dim
        </a>
        <p>Se você não solicitou este link, ignore este e-mail.</p>
      `
    });

    if (error) {
      throw new Error(`Falha ao enviar link de acesso: ${error.message}`);
    }
  }

  async sendPaymentConfirmed(
    to: string,
    productName: string
  ): Promise<void> {
    if (!this.resend) {
      return;
    }

    const appUrl = this.config.getOrThrow<string>("APP_URL");
    const { error } = await this.resend.emails.send({
      from: this.config.getOrThrow<string>("EMAIL_FROM"),
      to,
      subject: "Pagamento confirmado — Meu Dim",
      html: `
        <h2>Seu pagamento foi confirmado!</h2>
        <p>O <strong>${escapeHtml(productName)}</strong> está liberado.</p>
        <a href="${escapeHtml(appUrl)}/plano">Ver meu plano de quitação</a>
      `
    });

    if (error) {
      throw new Error(
        `Falha ao enviar confirmação de pagamento: ${error.message}`
      );
    }
  }
}
