import Link from "next/link";
import { requireRole } from "@/lib/auth-guards";
import { getStudentTicketStats } from "@/features/tickets/queries";

export default async function StudentDashboardPage() {
  const session = await requireRole("STUDENT");
  const stats = await getStudentTicketStats(session.user.id);

  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Student Dashboard
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Your campus service requests
            </h1>

            <p className="mt-2 max-w-2xl text-gray-600">
              Report a problem, track your existing tickets, and confirm resolutions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/tickets"
              className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
              My Tickets
            </Link>

            <Link
              href="/tickets/new"
              className="inline-flex items-center rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800"
            >
              Report an issue
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          <Link
            href="/tickets"
            className="group rounded-xl border bg-white p-5 transition hover:border-gray-400 hover:shadow-sm"
          >
            <p className="text-sm font-medium text-gray-500 group-hover:text-gray-900">
              Total
            </p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{stats.total}</p>
          </Link>

          <Link
            href="/tickets?status=OPEN"
            className="group rounded-xl border bg-white p-5 transition hover:border-blue-300 hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500 group-hover:text-blue-600">
                Open
              </p>
              <span className="h-2 w-2 rounded-full bg-blue-500" />
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900">{stats.open}</p>
          </Link>

          <Link
            href="/tickets?status=ASSIGNED"
            className="group rounded-xl border bg-white p-5 transition hover:border-purple-300 hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500 group-hover:text-purple-600">
                Assigned
              </p>
              <span className="h-2 w-2 rounded-full bg-purple-500" />
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900">{stats.assigned}</p>
          </Link>

          <Link
            href="/tickets?status=IN_PROGRESS"
            className="group rounded-xl border bg-white p-5 transition hover:border-amber-300 hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500 group-hover:text-amber-600">
                In Progress
              </p>
              <span className="h-2 w-2 rounded-full bg-amber-500" />
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {stats.inProgress}
            </p>
          </Link>

          <Link
            href="/tickets?status=RESOLVED"
            className="group rounded-xl border bg-white p-5 transition hover:border-emerald-300 hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500 group-hover:text-emerald-600">
                Resolved
              </p>
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900">{stats.resolved}</p>
          </Link>

          <Link
            href="/tickets?status=CLOSED"
            className="group rounded-xl border bg-white p-5 transition hover:border-gray-400 hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500 group-hover:text-gray-900">
                Closed
              </p>
              <span className="h-2 w-2 rounded-full bg-gray-400" />
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900">{stats.closed}</p>
          </Link>

          <Link
            href="/tickets?status=CANCELLED"
            className="group rounded-xl border bg-white p-5 transition hover:border-rose-300 hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500 group-hover:text-rose-600">
                Cancelled
              </p>
              <span className="h-2 w-2 rounded-full bg-rose-400" />
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900">{stats.cancelled}</p>
          </Link>
        </div>
      </div>
    </main>
  );
}