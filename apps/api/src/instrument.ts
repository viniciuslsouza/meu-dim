import * as Sentry from "@sentry/node";

const dsn = process.env.SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
    beforeSend(event) {
      const data = event.request?.data;

      if (data && typeof data === "object" && !Array.isArray(data)) {
        delete (data as { email?: unknown }).email;
      }

      return event;
    }
  });
}
