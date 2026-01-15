"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Battery } from "@/components/Battery";

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  return (
    <div className="w-full max-w-sm text-center">
      <div className="flex justify-center mb-8">
        <Battery level={3} size="md" showLabel={false} />
      </div>

      <h1 className="text-2xl font-bold mb-2">Check your email</h1>
      <p className="text-muted mb-2">We sent a magic link to sign in.</p>
      {email && <p className="text-foreground font-medium mb-6">{email}</p>}
      {!email && <div className="mb-6" />}

      <div className="p-4 bg-card rounded-lg border border-border">
        <p className="text-sm text-muted">
          Didn&apos;t receive an email? Check your spam folder or{" "}
          <Link
            href={
              email ? `/login?email=${encodeURIComponent(email)}` : "/login"
            }
            className="text-accent hover:underline"
          >
            try again
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

export default function CheckEmailPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <Suspense
        fallback={
          <div className="w-full max-w-sm text-center">
            <div className="flex justify-center mb-8">
              <Battery level={3} size="md" showLabel={false} />
            </div>
            <h1 className="text-2xl font-bold mb-2">Check your email</h1>
            <p className="text-muted mb-6">We sent a magic link to sign in.</p>
          </div>
        }
      >
        <CheckEmailContent />
      </Suspense>
    </main>
  );
}
