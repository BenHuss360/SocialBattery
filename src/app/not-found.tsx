import Link from "next/link";
import { Battery } from "@/components/Battery";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="flex justify-center mb-6">
          <Battery level={1} size="lg" showLabel={false} />
        </div>

        <h1 className="text-2xl font-bold mb-2">Page not found</h1>
        <p className="text-muted mb-8">
          This page doesn&apos;t exist or the user hasn&apos;t claimed this username yet.
        </p>

        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full py-3 px-6 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors text-center"
          >
            Create your own battery
          </Link>
          <Link
            href="/"
            className="block text-sm text-muted hover:text-foreground transition-colors"
          >
            Go to homepage
          </Link>
        </div>
      </div>
    </main>
  );
}
