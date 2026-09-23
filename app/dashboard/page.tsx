import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold">
          Welcome, {session.user.name}
        </h1>

        <div className="mt-6 rounded-xl border p-6">
          <p>
            <strong>Email:</strong> {session.user.email}
          </p>

          <p className="mt-2">
            <strong>Role:</strong> {session.user.role}
          </p>

          <p className="mt-2">
            <strong>Active:</strong>{" "}
            {session.user.isActive ? "Yes" : "No"}
          </p>
        </div>
      </div>
    </main>
  );
}