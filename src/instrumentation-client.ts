import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only enable in production
  enabled: process.env.NODE_ENV === "production",

  // Enable logging
  enableLogs: true,

  // Capture 100% of errors
  tracesSampleRate: 1.0,

  // Capture 10% of sessions for replay
  replaysSessionSampleRate: 0.1,

  // Capture 100% of sessions with errors
  replaysOnErrorSampleRate: 1.0,

  // Don't send PII
  sendDefaultPii: false,

  // Filter out noisy errors
  ignoreErrors: [
    // Browser extensions
    /extensions\//i,
    /^chrome-extension:\/\//i,
    // Network errors (user's connection issue)
    "Network request failed",
    "Failed to fetch",
    "Load failed",
    // User cancelled
    "AbortError",
  ],

  integrations: [
    // Send console.warn and console.error to Sentry
    Sentry.consoleLoggingIntegration({ levels: ["warn", "error"] }),
  ],
});
