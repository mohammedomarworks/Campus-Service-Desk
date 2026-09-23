import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { CreateTicketForm } from "@/components/tickets/create-ticket-form";

export default async function NewTicketPage() {
  await requireRole("STUDENT");

  const [categories, locations] = await Promise.all([
    prisma.category.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
      },
    }),

    prisma.location.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        {
          building: "asc",
        },
        {
          name: "asc",
        },
      ],
      select: {
        id: true,
        name: true,
      },
    }),
  ]);

  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-gray-500">
            Report an issue
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Create a service ticket
          </h1>

          <p className="mt-3 text-gray-600">
            Tell us what is wrong and where the issue occurred.
          </p>
        </div>

        {categories.length === 0 || locations.length === 0 ? (
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6 text-sm text-yellow-800">
            Ticket creation is temporarily unavailable because
            required categories or locations are not configured.
          </div>
        ) : (
          <div className="rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
            <CreateTicketForm
              categories={categories}
              locations={locations}
            />
          </div>
        )}
      </div>
    </main>
  );
}