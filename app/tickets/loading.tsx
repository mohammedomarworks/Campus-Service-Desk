export default function TicketsLoading() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10 animate-pulse">
      <div className="mx-auto max-w-5xl">
        {/* Navigation & Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="h-4 w-32 rounded-sm bg-gray-200" />
          <div className="h-9 w-32 rounded-lg bg-gray-200" />
        </div>

        <div>
          <div className="h-8 w-44 rounded-sm bg-gray-300" />
          <div className="mt-2 h-4 w-80 rounded-sm bg-gray-200" />
        </div>

        {/* Status Filter Tabs Skeleton */}
        <div className="mt-6 flex flex-wrap gap-2 border-b border-gray-200 pb-4">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-8 w-20 rounded-lg bg-gray-200" />
          ))}
        </div>

        {/* Ticket List Skeleton */}
        <div className="mt-6 space-y-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-28 rounded-sm bg-gray-200" />
                    <div className="h-4 w-16 rounded-full bg-gray-200" />
                    <div className="h-4 w-16 rounded-full bg-gray-200" />
                  </div>
                  <div className="mt-3 h-6 w-64 rounded-sm bg-gray-200" />
                </div>
                <div className="h-4 w-20 rounded-sm bg-gray-200" />
              </div>

              <div className="mt-4 flex gap-6">
                <div className="h-4 w-32 rounded-sm bg-gray-200" />
                <div className="h-4 w-40 rounded-sm bg-gray-200" />
                <div className="h-4 w-28 rounded-sm bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
