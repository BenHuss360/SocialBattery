export default function SettingsLoading() {
  return (
    <main className="min-h-screen p-6">
      <div className="max-w-md mx-auto">
        {/* Header skeleton */}
        <div className="flex justify-between items-center mb-8">
          <div className="h-7 w-24 bg-card rounded animate-pulse" />
          <div className="h-4 w-32 bg-card rounded animate-pulse" />
        </div>

        {/* Visibility section skeleton */}
        <div className="bg-card rounded-xl border border-border p-6 mb-6">
          <div className="h-5 w-32 bg-background rounded animate-pulse mb-4" />
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3">
              <div className="w-5 h-5 bg-background rounded-full animate-pulse" />
              <div className="flex-1">
                <div className="h-5 w-16 bg-background rounded animate-pulse mb-1" />
                <div className="h-4 w-40 bg-background rounded animate-pulse" />
              </div>
            </div>
            <div className="flex items-center gap-3 p-3">
              <div className="w-5 h-5 bg-background rounded-full animate-pulse" />
              <div className="flex-1">
                <div className="h-5 w-20 bg-background rounded animate-pulse mb-1" />
                <div className="h-4 w-44 bg-background rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Theme section skeleton */}
        <div className="bg-card rounded-xl border border-border p-6 mb-6">
          <div className="h-5 w-16 bg-background rounded animate-pulse mb-4" />
          <div className="flex gap-2">
            <div className="flex-1 h-12 bg-background rounded-lg animate-pulse" />
            <div className="flex-1 h-12 bg-background rounded-lg animate-pulse" />
            <div className="flex-1 h-12 bg-background rounded-lg animate-pulse" />
          </div>
        </div>

        {/* Save indicator skeleton */}
        <div className="flex justify-center">
          <div className="h-4 w-40 bg-card rounded animate-pulse" />
        </div>
      </div>
    </main>
  );
}
