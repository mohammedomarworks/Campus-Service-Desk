import Link from "next/link";
import { requireRole } from "@/lib/auth-guards";
import { getStudentTickets } from "@/features/tickets/queries";
import { TicketStatus } from "@/generated/prisma/client";

const VALID_STATUSES: TicketStatus[] = [
  TicketStatus.OPEN,
  TicketStatus.ASSIGNED,
  TicketStatus.IN_PROGRESS,
  TicketStatus.RESOLVED,
  TicketStatus.CLOSED,
  TicketStatus.CANCELLED,
];

const FILTER_TABS: { label: string; value?: TicketStatus }[] = [
  { label: "All" },
  { label: "Open", value: TicketStatus.OPEN },
  { label: "Assigned", value: TicketStatus.ASSIGNED },
  { label: "In Progress", value: TicketStatus.IN_PROGRESS },
  { label: "Resolved", value: TicketStatus.RESOLVED },
  { label: "Closed", value: TicketStatus.CLOSED },
  { label: "Cancelled", value: TicketStatus.CANCELLED },
];

function getStatusBadgeClass(status: TicketStatus) {
  switch (status) {
    case "OPEN":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "ASSIGNED":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "IN_PROGRESS":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "RESOLVED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "CLOSED":
      return "bg-gray-100 text-gray-700 border-gray-200";
    case "CANCELLED":
      return "bg-rose-50 text-rose-700 border-rose-200";
  }
}

function getPriorityBadgeClass(priority: string) {
  switch (priority) {
    case "URGENT":
      return "bg-red-50 text-red-700 border-red-200";
    case "HIGH":
      return "bg-orange-50 text-orange-700 border-orange-200";
    case "MEDIUM":
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    case "LOW":
      return "bg-green-50 text-green-700 border-green-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

function buildPageUrl(page: number, status?: TicketStatus) {
  const params = new URLSearchParams();
  if (status) {
    params.set("status", status);
  }
  if (page > 1) {
    params.set("page", String(page));
  }
  const queryString = params.toString();
  return queryString ? `/tickets?${queryString}` : "/tickets";
}

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await requireRole("STUDENT");
  const resolvedSearchParams = await searchParams;

  const rawStatus =
    typeof resolvedSearchParams.status === "string"
      ? resolvedSearchParams.status
      : undefined;

  const rawPage =
    typeof resolvedSearchParams.page === "string"
      ? resolvedSearchParams.page
      : undefined;

  const selectedStatus =
    rawStatus && VALID_STATUSES.includes(rawStatus as TicketStatus)
      ? (rawStatus as TicketStatus)
      : undefined;

  const page = Math.max(1, parseInt(rawPage || "1", 10) || 1);
  const limit = 10;

  const { data: tickets, pagination } = await getStudentTickets(session.user.id, {
    page,
    limit,
    status: selectedStatus,
  });

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        {/* Navigation & Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/dashboard/student"
            className="text-sm font-medium text-gray-500 transition hover:text-black"
          >
            &larr; Back to Dashboard
          </Link>

          <Link
            href="/tickets/new"
            className="inline-flex items-center rounded-lg bg-black px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800"
          >
            Report an issue
          </Link>
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            My Tickets
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            View, track, and manage all campus service requests you have reported.
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 border-b border-gray-200 pb-4">
          {FILTER_TABS.map((tab) => {
            const isActive =
              (tab.value === undefined && selectedStatus === undefined) ||
              tab.value === selectedStatus;

            const href = tab.value ? `/tickets?status=${tab.value}` : "/tickets";

            return (
              <Link
                key={tab.label}
                href={href}
                className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-black text-white shadow-sm"
                    : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* Content Section */}
        <div className="mt-6">
          {tickets.length === 0 ? (
            /* Empty States */
            selectedStatus ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
                <p className="text-base font-semibold text-gray-900">
                  No tickets match this status.
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  You don&apos;t have any tickets currently marked as {selectedStatus}.
                </p>
                <div className="mt-6">
                  <Link
                    href="/tickets"
                    className="inline-flex rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
                  >
                    View all tickets
                  </Link>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
                <p className="text-base font-semibold text-gray-900">
                  You haven&apos;t reported any campus issues yet.
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  Have an issue in a classroom, lab, or dorm? Create a service request to get help.
                </p>
                <div className="mt-6">
                  <Link
                    href="/tickets/new"
                    className="inline-flex rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800"
                  >
                    Report an issue
                  </Link>
                </div>
              </div>
            )
          ) : (
            /* Ticket List */
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/tickets/${ticket.id}`}
                  className="group block rounded-xl border border-gray-200 bg-white p-5 shadow-xs transition hover:border-gray-400 hover:shadow-sm"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-gray-500">
                          {ticket.ticketNumber}
                        </span>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(
                            ticket.status,
                          )}`}
                        >
                          {ticket.status}
                        </span>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${getPriorityBadgeClass(
                            ticket.priority,
                          )}`}
                        >
                          {ticket.priority}
                        </span>
                      </div>

                      <h2 className="mt-2 text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition">
                        {ticket.title}
                      </h2>
                    </div>

                    <p className="text-xs text-gray-500 sm:text-right">
                      {new Date(ticket.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-gray-600">
                    <div>
                      <span className="text-gray-400">Category: </span>
                      <span className="font-medium text-gray-800">
                        {ticket.category.name}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-400">Location: </span>
                      <span className="font-medium text-gray-800">
                        {ticket.location.name}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-400">Assigned: </span>
                      <span className="font-medium text-gray-800">
                        {ticket.assignedStaff?.name ?? "Unassigned"}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-6 sm:flex-row">
                  <p className="text-sm text-gray-500">
                    Showing page <span className="font-medium">{pagination.page}</span> of{" "}
                    <span className="font-medium">{pagination.totalPages}</span> (
                    {pagination.total} total {pagination.total === 1 ? "ticket" : "tickets"})
                  </p>

                  <div className="flex items-center gap-2">
                    {pagination.page > 1 ? (
                      <Link
                        href={buildPageUrl(pagination.page - 1, selectedStatus)}
                        className="rounded-lg border border-gray-300 bg-white px-3.5 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                      >
                        Previous
                      </Link>
                    ) : (
                      <span className="cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-3.5 py-1.5 text-sm font-medium text-gray-400">
                        Previous
                      </span>
                    )}

                    {pagination.page < pagination.totalPages ? (
                      <Link
                        href={buildPageUrl(pagination.page + 1, selectedStatus)}
                        className="rounded-lg border border-gray-300 bg-white px-3.5 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                      >
                        Next
                      </Link>
                    ) : (
                      <span className="cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-3.5 py-1.5 text-sm font-medium text-gray-400">
                        Next
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
