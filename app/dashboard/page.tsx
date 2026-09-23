import { requireSession } from "@/lib/auth-guards";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await requireSession();

  switch (session.user.role) {
    case "STUDENT":
      redirect("/dashboard/student");

    case "STAFF":
      redirect("/dashboard/staff");

    case "ADMIN":
      redirect("/dashboard/admin");

    default:
      redirect("/unauthorized");
  }
}