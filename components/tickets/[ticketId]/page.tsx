import { notFound } from "next/navigation";

import { requireSession } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { canViewTicket } from "@/features/tickets/authorization";

export default async function TicketDetailsPage({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}) {
  const { ticketId } = await params;
  const session = await requireSession();

  const ticket = await prisma.ticket.findUnique({
    where: {
      id: ticketId,
    },
    include: {
      category: true,
      location: true,
      assignedStaff: {
        select: {
          id: true,
          name: true,
        },
      },
      reporter: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!ticket) {
    notFound();
  }

  const sessionUser = {
    id: session.user.id,
    role: session.user.role!,
  };

  if (!canViewTicket(sessionUser, ticket)) {
    notFound();
  }

  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">
              {ticket.ticketNumber}
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              {ticket.title}
            </h1>
          </div>

          <div className="rounded-full border px-4 py-2 text-sm font-medium">
            {ticket.status}
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-gray-500">Category</p>
            <p className="mt-1 font-medium">
              {ticket.category.name}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-gray-500">Location</p>
            <p className="mt-1 font-medium">
              {ticket.location.name}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-gray-500">Priority</p>
            <p className="mt-1 font-medium">
              {ticket.priority}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-gray-500">Assigned staff</p>
            <p className="mt-1 font-medium">
              {ticket.assignedStaff?.name ?? "Not assigned"}
            </p>
          </div>
        </div>

        <section className="mt-6 rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold">
            Description
          </h2>

          <p className="mt-3 whitespace-pre-wrap leading-7 text-gray-700">
            {ticket.description}
          </p>
        </section>

        <section className="mt-6 rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold">
            Ticket information
          </h2>

          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Reported by</dt>
              <dd className="font-medium">
                {ticket.reporter.name}
              </dd>
            </div>

            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Created</dt>
              <dd className="font-medium">
                {ticket.createdAt.toLocaleString()}
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </main>
  );
}