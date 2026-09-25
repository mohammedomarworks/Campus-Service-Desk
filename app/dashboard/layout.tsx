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

          <SignOutButton />
        </div>
      </header>

      {children}
    </div>
  );
}