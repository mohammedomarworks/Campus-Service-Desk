import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-2xl text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-wider text-gray-500">
          Campus Service Desk
        </p>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Report campus issues. Track progress. Confirm resolution.
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-gray-600">
          A structured platform for reporting and managing campus service
          issues.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/sign-in"
            className="rounded-lg bg-black px-5 py-3 font-medium text-white"
          >
            Sign in
          </Link>

          <Link
            href="/sign-up"
            className="rounded-lg border px-5 py-3 font-medium"
          >
            Create account
          </Link>
        </div>
      </div>
    </main>
  );
}