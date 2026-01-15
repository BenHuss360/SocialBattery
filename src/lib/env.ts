/**
 * Environment variable validation
 * Validates required env vars at startup to fail fast on misconfiguration
 */

function getRequiredEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getOptionalEnvVar(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}

// Only validate on server-side
export const env =
  typeof window === "undefined"
    ? {
        // Database
        POSTGRES_URL: getRequiredEnvVar("POSTGRES_URL"),

        // Auth
        AUTH_SECRET: getRequiredEnvVar("AUTH_SECRET"),
        AUTH_RESEND_KEY: getRequiredEnvVar("AUTH_RESEND_KEY"),

        // App URLs
        NEXTAUTH_URL: getOptionalEnvVar(
          "NEXTAUTH_URL",
          "http://localhost:3000"
        ),
        NEXT_PUBLIC_APP_URL: getOptionalEnvVar(
          "NEXT_PUBLIC_APP_URL",
          "http://localhost:3000"
        ),
      }
    : {
        // Client-side only has access to NEXT_PUBLIC_ vars
        NEXT_PUBLIC_APP_URL:
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      };

// Validate env vars on module load (server-side only)
if (typeof window === "undefined") {
  // This will throw if any required env var is missing
  Object.keys(env);
}
