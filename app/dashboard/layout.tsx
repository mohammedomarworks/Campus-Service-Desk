import { requireSession } from "@/lib/auth-guards";
import { SignOutButton } from "@/components/auth/sign-out-button";
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-semibold">Campus Service Desk</p>
            <p className="text-xs text-gray-500">
              {session.user.name} · {session.user.role}
            </p>
          </div>

          <button
            type="button"
            className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Sign out
          </button>
        </div>
      </header>

      {children}
    </div>
  );
}