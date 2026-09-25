import "dotenv/config";
import test from "node:test";
import assert from "node:assert/strict";

import { GET } from "../../app/api/tickets/route.js";
import { auth } from "../../lib/auth.js";
import { prisma } from "../../lib/prisma.js";
import { TicketStatus } from "../../generated/prisma/client.js";

/**
 * Extracts a clean request `Cookie` header string (name=value)
 * from a `Set-Cookie` response header string, stripping response attributes
 * such as Path, HttpOnly, SameSite, and Max-Age.
 */
function toRequestCookie(setCookieHeader: string | null): string {
  if (!setCookieHeader) return "";
  return setCookieHeader.split(";")[0].trim();
}

test("API: GET /api/tickets requires authentication (401)", async () => {
  const req = new Request("http://localhost:3000/api/tickets");
  const res = await GET(req);
  assert.strictEqual(res.status, 401);

  const body = await res.json();
  assert.strictEqual(body.error.code, "UNAUTHORIZED");
  assert.strictEqual(body.error.message, "Authentication is required.");
});

test("API: GET /api/tickets validates input parameters and ownership isolation", async (t) => {
  const category = await prisma.category.findFirst({ where: { isActive: true } });
  const location = await prisma.location.findFirst({ where: { isActive: true } });

  if (!category || !location) {
    t.skip("Skipping test: category/location missing");
    return;
  }

  const createdUserIds: string[] = [];

  try {
    const studentEmail = `api-student-${Date.now()}@example.com`;
    const studentSignUp = await auth.api.signUpEmail({
      body: {
        email: studentEmail,
        password: "Password123!",
        name: "API Test Student",
      },
      asResponse: true,
    });
    const studentCookie = toRequestCookie(studentSignUp.headers.get("set-cookie"));

    const student = await prisma.user.findUniqueOrThrow({
      where: { email: studentEmail },
    });
    createdUserIds.push(student.id);

    const staffEmail = `api-staff-${Date.now()}@example.com`;
    const staffSignUp = await auth.api.signUpEmail({
      body: {
        email: staffEmail,
        password: "Password123!",
        name: "API Test Staff",
      },
      asResponse: true,
    });
    const staffCookie = toRequestCookie(staffSignUp.headers.get("set-cookie"));

    const staff = await prisma.user.findUniqueOrThrow({
      where: { email: staffEmail },
    });
    createdUserIds.push(staff.id);

    await prisma.user.update({
      where: { id: staff.id },
      data: { role: "STAFF" },
    });

    const otherStudentEmail = `api-other-${Date.now()}@example.com`;
    await auth.api.signUpEmail({
      body: {
        email: otherStudentEmail,
        password: "Password123!",
        name: "API Other Student",
      },
      asResponse: true,
    });

    const otherStudent = await prisma.user.findUniqueOrThrow({
      where: { email: otherStudentEmail },
    });
    createdUserIds.push(otherStudent.id);

    const studentTicket = await prisma.ticket.create({
      data: {
        ticketNumber: `MINE-${Date.now()}`,
        title: "My Broken Desk",
        description: "Leg is wobbling",
        status: TicketStatus.OPEN,
        priority: "LOW",
        reporterId: student.id,
        categoryId: category.id,
        locationId: location.id,
      },
    });

    await prisma.ticket.create({
      data: {
        ticketNumber: `OTHER-${Date.now()}`,
        title: "Other Student Secret Ticket",
        description: "Should not be visible to student",
        status: TicketStatus.OPEN,
        priority: "HIGH",
        reporterId: otherStudent.id,
        categoryId: category.id,
        locationId: location.id,
      },
    });

    // 1. Role check: Staff cannot access student ticket list (403 FORBIDDEN)
    const staffReq = new Request("http://localhost:3000/api/tickets", {
      headers: { cookie: staffCookie },
    });
    const staffRes = await GET(staffReq);
    assert.strictEqual(staffRes.status, 403);
    const staffBody = await staffRes.json();
    assert.strictEqual(staffBody.error.code, "FORBIDDEN");

    // 2. Validation error: invalid status returns 400 VALIDATION_ERROR
    const invalidStatusReq = new Request(
      "http://localhost:3000/api/tickets?status=MALICIOUS_STATUS",
      {
        headers: { cookie: studentCookie },
      },
    );
    const invalidStatusRes = await GET(invalidStatusReq);
    assert.strictEqual(invalidStatusRes.status, 400);
    const invalidStatusBody = await invalidStatusRes.json();
    assert.strictEqual(invalidStatusBody.error.code, "VALIDATION_ERROR");
    assert.ok(invalidStatusBody.error.fields.status);

    // 3. Validation error: invalid page returns 400 VALIDATION_ERROR
    const invalidPageReq = new Request("http://localhost:3000/api/tickets?page=0", {
      headers: { cookie: studentCookie },
    });
    const invalidPageRes = await GET(invalidPageReq);
    assert.strictEqual(invalidPageRes.status, 400);

    // 4. Successful ticket fetch for student: returns student's ticket
    const validReq = new Request("http://localhost:3000/api/tickets", {
      headers: { cookie: studentCookie },
    });
    const validRes = await GET(validReq);
    assert.strictEqual(validRes.status, 200);
    const validBody = await validRes.json();
    assert.strictEqual(validBody.data.length, 1);
    assert.strictEqual(validBody.data[0].id, studentTicket.id);
    assert.strictEqual(validBody.data[0].title, "My Broken Desk");
    assert.strictEqual(validBody.data[0].category.name, category.name);
    assert.strictEqual(validBody.data[0].location.name, location.name);
    assert.strictEqual(validBody.data[0].assignedStaff, null);
    assert.deepStrictEqual(validBody.pagination, {
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    });

    // 5. Tamper resistance: Passing reporterId query parameter does NOT leak otherStudent's tickets
    const tamperedReq = new Request(
      `http://localhost:3000/api/tickets?reporterId=${otherStudent.id}`,
      {
        headers: { cookie: studentCookie },
      },
    );
    const tamperedRes = await GET(tamperedReq);
    assert.strictEqual(tamperedRes.status, 200);
    const tamperedBody = await tamperedRes.json();
    assert.strictEqual(tamperedBody.data.length, 1);
    assert.strictEqual(tamperedBody.data[0].id, studentTicket.id); // Still only student's own ticket!
  } finally {
    if (createdUserIds.length > 0) {
      await prisma.ticketStatusHistory.deleteMany({
        where: { changedById: { in: createdUserIds } },
      });
      await prisma.ticket.deleteMany({
        where: {
          OR: [
            { reporterId: { in: createdUserIds } },
            { assignedStaffId: { in: createdUserIds } },
          ],
        },
      });
      await prisma.session.deleteMany({
        where: { userId: { in: createdUserIds } },
      });
      await prisma.account.deleteMany({
        where: { userId: { in: createdUserIds } },
      });
      await prisma.user.deleteMany({
        where: { id: { in: createdUserIds } },
      });
    }
    await prisma.$disconnect();
  }
});
