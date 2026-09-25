import { prisma } from "@/lib/prisma";
import { TicketStatus, Prisma } from "@/generated/prisma/client";

export type GetStudentTicketsOptions = {
  page?: number;
  limit?: number;
  status?: TicketStatus;
};

export type StudentTicketListItem = {
  id: string;
  ticketNumber: string;
  title: string;
  status: TicketStatus;
  priority: string;
  category: {
    name: string;
  };
  location: {
    name: string;
  };
  assignedStaff: {
    name: string;
  } | null;
  createdAt: Date;
};

export type PaginationMetadata = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type StudentTicketsResult = {
  data: StudentTicketListItem[];
  pagination: PaginationMetadata;
};

export async function getStudentTickets(
  studentId: string,
  options?: GetStudentTicketsOptions,
): Promise<StudentTicketsResult> {
  const page = Math.max(1, options?.page ?? 1);
  const limit = Math.max(1, Math.min(100, options?.limit ?? 10));
  const status = options?.status;

  const where: Prisma.TicketWhereInput = {
    reporterId: studentId,
    ...(status ? { status } : {}),
  };

  const [total, tickets] = await Promise.all([
    prisma.ticket.count({ where }),
    prisma.ticket.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        ticketNumber: true,
        title: true,
        status: true,
        priority: true,
        createdAt: true,
        category: {
          select: {
            name: true,
          },
        },
        location: {
          select: {
            name: true,
          },
        },
        assignedStaff: {
          select: {
            name: true,
          },
        },
      },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data: tickets,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

export type StudentTicketStats = {
  open: number;
  assigned: number;
  inProgress: number;
  resolved: number;
  closed: number;
  cancelled: number;
  total: number;
};

export async function getStudentTicketStats(
  studentId: string,
): Promise<StudentTicketStats> {
  const counts = await prisma.ticket.groupBy({
    by: ["status"],
    where: {
      reporterId: studentId,
    },
    _count: {
      _all: true,
    },
  });

  const statusMap: Record<TicketStatus, number> = {
    OPEN: 0,
    ASSIGNED: 0,
    IN_PROGRESS: 0,
    RESOLVED: 0,
    CLOSED: 0,
    CANCELLED: 0,
  };

  let total = 0;
  for (const row of counts) {
    statusMap[row.status] = row._count._all;
    total += row._count._all;
  }

  return {
    open: statusMap.OPEN,
    assigned: statusMap.ASSIGNED,
    inProgress: statusMap.IN_PROGRESS,
    resolved: statusMap.RESOLVED,
    closed: statusMap.CLOSED,
    cancelled: statusMap.CANCELLED,
    total,
  };
}
