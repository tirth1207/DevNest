export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/10">
      <div className="container mx-auto py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-8 w-48 bg-muted animate-pulse rounded-lg" />
              <div className="h-4 w-64 bg-muted animate-pulse rounded-lg" />
            </div>
            <div className="h-10 w-32 bg-muted animate-pulse rounded-lg" />
          </div>

          <div className="h-24 bg-muted animate-pulse rounded-lg" />

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
