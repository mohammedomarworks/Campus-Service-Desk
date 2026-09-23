import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="text-center">
        <p className="text-sm font-medium text-gray-500">
          403
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Access denied
        </h1>

        <p className="mt-3 text-gray-600">
          Your account does not have permission to access this page.
        </p>

        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded-lg bg-black px-5 py-3 font-medium text-white"
        >
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}