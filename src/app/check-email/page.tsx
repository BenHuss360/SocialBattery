import { Battery } from "@/components/Battery";

export default function CheckEmailPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm text-center">
        <div className="flex justify-center mb-8">
          <Battery level={3} size="md" showLabel={false} />
        </div>

        <h1 className="text-2xl font-bold mb-2">Check your email</h1>
        <p className="text-muted mb-6">
          We sent you a magic link to sign in. Click the link in your email to
          continue.
        </p>

        <div className="p-4 bg-card rounded-lg border border-border">
          <p className="text-sm text-muted">
            Didn&apos;t receive an email? Check your spam folder or{" "}
            <a href="/login" className="text-accent hover:underline">
              try again
            </a>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
