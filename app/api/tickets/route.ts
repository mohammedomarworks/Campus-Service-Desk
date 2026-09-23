import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { canCreateTicket } from "@/features/tickets/authorization";
import { createTicket, TicketReferenceError } from "@/features/tickets/service";
import { createTicketSchema } from "@/features/tickets/validation";

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user.isActive) {
    return NextResponse.json(
      {
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication is required.",
        },
      },
      { status: 401 },
    );
  }

  const role = session.user.role;

  if (!role || !canCreateTicket(role)) {
    return NextResponse.json(
      {
        error: {
          code: "FORBIDDEN",
          message: "Only students can create tickets.",
        },
      },
      { status: 403 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_JSON",
          message: "Request body must contain valid JSON.",
        },
      },
      { status: 400 },
    );
  }

  const result = createTicketSchema.safeParse(body);

  if (!result.success) {
    const fields: Record<string, string> = {};

    for (const issue of result.error.issues) {
      const field = issue.path[0];

      if (typeof field === "string" && !fields[field]) {
        fields[field] = issue.message;
      }
    }

    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "One or more fields are invalid.",
          fields,
        },
      },
      { status: 422 },
    );
  }

  try {
    const ticket = await createTicket(
      session.user.id,
      result.data,
    );

    return NextResponse.json(
      {
        data: ticket,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof TicketReferenceError) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_REFERENCE",
            message: "One or more selected options are unavailable.",
            fields: {
              [error.reference]: error.message,
            },
          },
        },
        { status: 422 },
      );
    }

    console.error("Failed to create ticket:", error);

    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Unable to create the ticket.",
        },
      },
      { status: 500 },
    );
  }
}