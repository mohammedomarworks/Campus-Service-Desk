import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const USER_ROLES = {
  STUDENT: "STUDENT",
  STAFF: "STAFF",
  ADMIN: "ADMIN",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export async function requireSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user.isActive) {
    redirect("/sign-in");
  }

  return session;
}

export async function requireRole(
  roles: UserRole | UserRole[],
) {
  const session = await requireSession();

  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  if (!allowedRoles.includes(session.user.role as UserRole)) {
    redirect("/unauthorized");
  }

  return session;
}