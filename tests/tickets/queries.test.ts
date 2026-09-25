import "dotenv/config";
import test from "node:test";
import assert from "node:assert/strict";

import { canListStudentTickets } from "../../features/tickets/authorization.js";
import { ticketListQuerySchema } from "../../features/tickets/validation.js";
import {
  getStudentTickets,
  getStudentTicketStats,
} from "../../features/tickets/queries.js";
import { prisma } from "../../lib/prisma.js";
import { TicketStatus } from "../../generated/prisma/client.js";

test("Authorization: canListStudentTickets", () => {
  assert.strictEqual(canListStudentTickets("STUDENT"), true);
  assert.strictEqual(canListStudentTickets("STAFF"), false);
  assert.strictEqual(canListStudentTickets("ADMIN"), false);
  assert.strictEqual(canListStudentTickets("GUEST"), false);
  assert.strictEqual(canListStudentTickets(""), false);
});

test("Validation: ticketListQuerySchema handles defaults and query params", () => {
  // Defaults
  const defaultParsed = ticketListQuerySchema.safeParse({});
  assert.strictEqual(defaultParsed.success, true);
  if (defaultParsed.success) {
    assert.strictEqual(defaultParsed.data.page, 1);
    assert.strictEqual(defaultParsed.data.limit, 10);
    assert.strictEqual(defaultParsed.data.status, undefined);
  }

  // Valid status filtering
  for (const status of Object.values(TicketStatus)) {
    const parsed = ticketListQuerySchema.safeParse({ status });
    assert.strictEqual(parsed.success, true);
    if (parsed.success) {
      assert.strictEqual(parsed.data.status, status);
    }
  }

  // String page and limit coercion
  const coercedParsed = ticketListQuerySchema.safeParse({
    page: "3",
    limit: "25",
    status: "OPEN",
  });
  assert.strictEqual(coercedParsed.success, true);
  if (coercedParsed.success) {
    assert.strictEqual(coercedParsed.data.page, 3);
    assert.strictEqual(coercedParsed.data.limit, 25);
    assert.strictEqual(coercedParsed.data.status, "OPEN");
  }

  // Invalid status is safely rejected
  const invalidStatus = ticketListQuerySchema.safeParse({ status: "UNKNOWN_STATUS" });
  assert.strictEqual(invalidStatus.success, false);

  const maliciousStatus = ticketListQuerySchema.safeParse({
    status: "' OR 1=1 --",
  });
  assert.strictEqual(maliciousStatus.success, false);

  // Invalid page numbers are rejected
  const invalidPage = ticketListQuerySchema.safeParse({ page: "0" });
  assert.strictEqual(invalidPage.success, false);

  const negativePage = ticketListQuerySchema.safeParse({ page: "-5" });
  assert.strictEqual(negativePage.success, false);

  // Limit capped at 100
  const overLimit = ticketListQuerySchema.safeParse({ limit: "150" });
  assert.strictEqual(overLimit.success, false);

  // Tamper resistance: extra parameters like reporterId are not exposed as filter properties
  const tampered = ticketListQuerySchema.safeParse({
    reporterId: "another-student-id",
    userId: "admin-id",
  });
  assert.strictEqual(tampered.success, true);
  if (tampered.success) {
    assert.strictEqual("reporterId" in tampered.data, false);
    assert.strictEqual("userId" in tampered.data, false);
  }
});

test("Database: getStudentTickets and getStudentTicketStats", async (t) => {
  // Find or create test categories and locations
  const category = await prisma.category.findFirst({ where: { isActive: true } });
  const location = await prisma.location.findFirst({ where: { isActive: true } });

  if (!category || !location) {
    t.skip("Skipping DB tests: active category or location missing in DB.");
    return;
  }

  const createdUserIds: string[] = [];

  try {
    // Create two isolated test student users
    const testStudentA = await prisma.user.create({
      data: {
        email: `test-student-a-${Date.now()}@example.com`,
        name: "Test Student A",
        role: "STUDENT",
      },
    });
    createdUserIds.push(testStudentA.id);

    const testStudentB = await prisma.user.create({
      data: {
        email: `test-student-b-${Date.now()}@example.com`,
        name: "Test Student B",
        role: "STUDENT",
      },
    });
    createdUserIds.push(testStudentB.id);

    // 1. Initially, student A has 0 tickets and stats are all 0
    const emptyStats = await getStudentTicketStats(testStudentA.id);
    assert.deepStrictEqual(emptyStats, {
      open: 0,
      assigned: 0,
      inProgress: 0,
      resolved: 0,
      closed: 0,
      cancelled: 0,
      total: 0,
    });

    const emptyTickets = await getStudentTickets(testStudentA.id);
    assert.strictEqual(emptyTickets.data.length, 0);
    assert.deepStrictEqual(emptyTickets.pagination, {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    });

    // 2. Create tickets for student A with various statuses
    await prisma.ticket.createMany({
      data: [
        {
          ticketNumber: `TEST-A-1-${Date.now()}`,
          title: "Student A Open Ticket 1",
          description: "Description 1",
          status: TicketStatus.OPEN,
          priority: "LOW",
          reporterId: testStudentA.id,
          categoryId: category.id,
          locationId: location.id,
        },
        {
          ticketNumber: `TEST-A-2-${Date.now()}`,
          title: "Student A Open Ticket 2",
          description: "Description 2",
          status: TicketStatus.OPEN,
          priority: "MEDIUM",
          reporterId: testStudentA.id,
          categoryId: category.id,
          locationId: location.id,
        },
        {
          ticketNumber: `TEST-A-3-${Date.now()}`,
          title: "Student A In Progress Ticket",
          description: "Description 3",
          status: TicketStatus.IN_PROGRESS,
          priority: "HIGH",
          reporterId: testStudentA.id,
          categoryId: category.id,
          locationId: location.id,
        },
        {
          ticketNumber: `TEST-A-4-${Date.now()}`,
          title: "Student A Resolved Ticket",
          description: "Description 4",
          status: TicketStatus.RESOLVED,
          priority: "MEDIUM",
          reporterId: testStudentA.id,
          categoryId: category.id,
          locationId: location.id,
        },
        {
          ticketNumber: `TEST-A-5-${Date.now()}`,
          title: "Student A Closed Ticket",
          description: "Description 5",
          status: TicketStatus.CLOSED,
          priority: "LOW",
          reporterId: testStudentA.id,
          categoryId: category.id,
          locationId: location.id,
        },
      ],
    });

    // 3. Create a ticket for student B (to test isolation)
    await prisma.ticket.create({
      data: {
        ticketNumber: `TEST-B-1-${Date.now()}`,
        title: "Student B Ticket (Should Not Be Visible to A)",
        description: "Student B Description",
        status: TicketStatus.OPEN,
        priority: "HIGH",
        reporterId: testStudentB.id,
        categoryId: category.id,
        locationId: location.id,
      },
    });

    // Test Requirement 1: Student A receives ONLY their own tickets (5 tickets, not 6)
    const studentATickets = await getStudentTickets(testStudentA.id);
    assert.strictEqual(studentATickets.data.length, 5);
    assert.strictEqual(studentATickets.pagination.total, 5);
    assert.strictEqual(studentATickets.pagination.totalPages, 1);
    for (const ticket of studentATickets.data) {
      assert.ok(ticket.title.startsWith("Student A"));
      assert.ok(ticket.category.name);
      assert.ok(ticket.location.name);
    }

    // Test Requirement 2: Student B receives ONLY student B's ticket (1 ticket)
    const studentBTickets = await getStudentTickets(testStudentB.id);
    assert.strictEqual(studentBTickets.data.length, 1);
    assert.strictEqual(studentBTickets.data[0].title, "Student B Ticket (Should Not Be Visible to A)");

    // Test Requirement 3: Status filtering works
    const openTicketsA = await getStudentTickets(testStudentA.id, {
      status: TicketStatus.OPEN,
    });
    assert.strictEqual(openTicketsA.data.length, 2);
    assert.strictEqual(openTicketsA.pagination.total, 2);
    for (const ticket of openTicketsA.data) {
      assert.strictEqual(ticket.status, TicketStatus.OPEN);
    }

    const inProgressTicketsA = await getStudentTickets(testStudentA.id, {
      status: TicketStatus.IN_PROGRESS,
    });
    assert.strictEqual(inProgressTicketsA.data.length, 1);
    assert.strictEqual(inProgressTicketsA.data[0].status, TicketStatus.IN_PROGRESS);

    const cancelledTicketsA = await getStudentTickets(testStudentA.id, {
      status: TicketStatus.CANCELLED,
    });
    assert.strictEqual(cancelledTicketsA.data.length, 0);
    assert.strictEqual(cancelledTicketsA.pagination.total, 0);

    // Test Requirement 5: Pagination metadata is correct
    const page1 = await getStudentTickets(testStudentA.id, {
      page: 1,
      limit: 2,
    });
    assert.strictEqual(page1.data.length, 2);
    assert.deepStrictEqual(page1.pagination, {
      page: 1,
      limit: 2,
      total: 5,
      totalPages: 3,
    });

    const page2 = await getStudentTickets(testStudentA.id, {
      page: 2,
      limit: 2,
    });
    assert.strictEqual(page2.data.length, 2);
    assert.strictEqual(page2.pagination.page, 2);

    const page3 = await getStudentTickets(testStudentA.id, {
      page: 3,
      limit: 2,
    });
    assert.strictEqual(page3.data.length, 1);
    assert.strictEqual(page3.pagination.page, 3);

    // Test Dashboard: Statistics calculation with different ticket statuses
    const statsA = await getStudentTicketStats(testStudentA.id);
    assert.deepStrictEqual(statsA, {
      open: 2,
      assigned: 0,
      inProgress: 1,
      resolved: 1,
      closed: 1,
      cancelled: 0,
      total: 5,
    });

    const statsB = await getStudentTicketStats(testStudentB.id);
    assert.deepStrictEqual(statsB, {
      open: 1,
      assigned: 0,
      inProgress: 0,
      resolved: 0,
      closed: 0,
      cancelled: 0,
      total: 1,
    });
  } finally {
    // Clean up test data
    if (createdUserIds.length > 0) {
      await prisma.ticket.deleteMany({
        where: {
          reporterId: {
            in: createdUserIds,
          },
        },
      });
      await prisma.user.deleteMany({
        where: {
          id: {
            in: createdUserIds,
          },
        },
      });
    }
    await prisma.$disconnect();
  }
});
