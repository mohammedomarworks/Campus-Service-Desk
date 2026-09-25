"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function TicketsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Tickets page error:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-16">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h1 className="mt-4 text-xl font-bold text-gray-900">
          Unable to load tickets
        </h1>

        <p className="mt-2 text-sm text-gray-600">
          We encountered a problem loading your tickets. Please try again or return to your dashboard.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800"
          >
            Try again
          </button>

          <Link
            href="/dashboard/student"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
