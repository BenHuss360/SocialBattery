import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only enable in production
  enabled: process.env.NODE_ENV === "production",

  // Enable logging
  enableLogs: true,

  // Capture 100% of errors
  tracesSampleRate: 1.0,

  // Don't send PII
  sendDefaultPii: false,
});
