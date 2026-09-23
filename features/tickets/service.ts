import { prisma } from "@/lib/prisma";
import { TicketStatus } from "@/generated/prisma/client";
import type { CreateTicketInput } from "./validation";

export class TicketReferenceError extends Error {
  constructor(
    public reference: "categoryId" | "locationId",
    message: string,
  ) {
    super(message);
    this.name = "TicketReferenceError";
  }
}

function generateTicketNumber() {
  const year = new Date().getFullYear();
  const randomPart = crypto
    .randomUUID()
    .replaceAll("-", "")
    .slice(0, 12)
    .toUpperCase();

  return `CSD-${year}-${randomPart}`;
}

export async function createTicket(
  reporterId: string,
  input: CreateTicketInput,
) {
  const [category, location] = await Promise.all([
    prisma.category.findFirst({
      where: {
        id: input.categoryId,
        isActive: true,
      },
      select: {
        id: true,
      },
    }),

    prisma.location.findFirst({
      where: {
        id: input.locationId,
        isActive: true,
      },
      select: {
        id: true,
      },
    }),
  ]);

  if (!category) {
    throw new TicketReferenceError(
      "categoryId",
      "Selected category is unavailable.",
    );
  }

  if (!location) {
    throw new TicketReferenceError(
      "locationId",
      "Selected location is unavailable.",
    );
  }

  return prisma.$transaction(async (tx) => {
    const ticket = await tx.ticket.create({
      data: {
        ticketNumber: generateTicketNumber(),
        title: input.title,
        description: input.description,
        status: TicketStatus.OPEN,
        priority: "MEDIUM",
        reporterId,
        categoryId: category.id,
        locationId: location.id,
      },
      select: {
        id: true,
        ticketNumber: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        createdAt: true,
      },
    });

    await tx.ticketStatusHistory.create({
      data: {
        ticketId: ticket.id,
        fromStatus: null,
        toStatus: TicketStatus.OPEN,
        changedById: reporterId,
        note: "Ticket created.",
      },
    });

    return ticket;
  });
}