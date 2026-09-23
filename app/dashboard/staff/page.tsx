import { requireRole } from "@/lib/auth-guards";

export default async function StaffDashboardPage() {
  await requireRole("STAFF");

  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-medium text-gray-500">
          Staff Dashboard
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Your assigned service requests
        </h1>

        <p className="mt-3 max-w-2xl text-gray-600">
          Review assigned tickets, update progress, and provide resolutions.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-gray-500">Assigned</p>
            <p className="mt-2 text-3xl font-bold">0</p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-gray-500">In Progress</p>
            <p className="mt-2 text-3xl font-bold">0</p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-gray-500">Resolved</p>
            <p className="mt-2 text-3xl font-bold">0</p>
          </div>
        </div>
      </div>
    </main>
  );
}