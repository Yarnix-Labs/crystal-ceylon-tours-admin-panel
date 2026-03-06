import { Skeleton } from "@/components/ui/skeleton";

/**
 * Full-page loading fallback for React Suspense (lazy-loaded routes).
 * Keeps layout shift minimal and matches app design.
 */
const PageLoader = () => (
  <div className="min-h-screen w-full flex flex-col bg-background" role="status" aria-label="Loading page">
    {/* Header placeholder */}
    <header className="border-b">
      <div className="container flex h-16 items-center gap-4 px-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-6 w-24 ml-auto" />
        <Skeleton className="h-6 w-24" />
      </div>
    </header>
    {/* Main content placeholder */}
    <main className="flex-1 container py-8 px-4">
      <div className="mx-auto max-w-4xl space-y-6">
        <Skeleton className="h-10 w-3/4 max-w-md" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="grid gap-4 sm:grid-cols-2 pt-4">
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>
      </div>
    </main>
  </div>
);

export default PageLoader;
