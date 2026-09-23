import { requireRole } from "@/lib/auth-guards";

export default async function AdminDashboardPage() {
  await requireRole("ADMIN");

  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-medium text-gray-500">
          Admin Dashboard
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Campus Service Desk overview
        </h1>

        <p className="mt-3 max-w-2xl text-gray-600">
          Monitor tickets, assignments, categories, locations, and system
          activity.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-gray-500">Total Tickets</p>
            <p className="mt-2 text-3xl font-bold">0</p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-gray-500">Open</p>
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