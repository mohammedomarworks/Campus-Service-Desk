import { requireRole } from "@/lib/auth-guards";

export default async function AdminDashboardPage() {
  const session = await requireRole("ADMIN");

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-medium text-gray-500">
          Admin Dashboard
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Welcome, {session.user.name}
        </h1>

        <div className="mt-8 rounded-xl border p-6">
          <p>
            <strong>Role:</strong> {session.user.role}
          </p>

          <p className="mt-2">
            Administrative functionality will be added here.
          </p>
        </div>
      </div>
    </main>
  );
}