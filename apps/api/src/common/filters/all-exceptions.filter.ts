import { randomUUID } from "node:crypto";

import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  Logger,
  type ExceptionFilter
} from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { Prisma } from "@prisma/client";
import * as Sentry from "@sentry/node";

interface ErrorBody {
  statusCode: number;
  message: string;
  code: string;
  traceId: string;
  timestamp: string;
}

function httpCode(status: number): string {
  const codes: Partial<Record<number, string>> = {
    [HttpStatus.BAD_REQUEST]: "VALIDATION_ERROR",
    [HttpStatus.UNAUTHORIZED]: "UNAUTHORIZED",
    [HttpStatus.FORBIDDEN]: "FORBIDDEN",
    [HttpStatus.PAYMENT_REQUIRED]: "PAYMENT_REQUIRED",
    [HttpStatus.NOT_FOUND]: "NOT_FOUND",
    [HttpStatus.CONFLICT]: "CONFLICT",
    [HttpStatus.TOO_MANY_REQUESTS]: "RATE_LIMITED"
  };

  return codes[status] ?? "HTTP_ERROR";
}

function exceptionMessage(exception: HttpException): string {
  const response = exception.getResponse();

  if (typeof response === "string") {
    return response;
  }

  const message = (response as { message?: string | string[] }).message;

  if (Array.isArray(message)) {
    return message.join("; ");
  }

  return message ?? exception.message;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly adapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.adapterHost;
    const context = host.switchToHttp();
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Erro interno do servidor";
    let code = "INTERNAL_ERROR";

    if (
      exception instanceof Prisma.PrismaClientKnownRequestError &&
      exception.code === "P2002"
    ) {
      statusCode = HttpStatus.CONFLICT;
      message = "Já existe um registro com estes dados";
      code = "ALREADY_EXISTS";
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      message = exceptionMessage(exception);
      code = httpCode(statusCode);
    } else if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
    } else {
      this.logger.error("Exceção não identificada", exception);
    }

    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      Sentry.captureException(exception);
    }

    const body: ErrorBody = {
      statusCode,
      message,
      code,
      traceId: randomUUID(),
      timestamp: new Date().toISOString()
    };

    httpAdapter.reply(context.getResponse(), body, statusCode);
  }
}
