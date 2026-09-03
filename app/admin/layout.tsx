"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { AdminShell } from "@/components/admin/AdminShell";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const {
    user,
    token,
    isAuthenticated,
  } = useAuth();

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.replace("/login");
      return;
    }

    if (user?.role !== "admin") {
      router.replace("/");
      return;
    }

    setChecking(false);
  }, [
    isAuthenticated,
    token,
    user,
    router,
    pathname,
  ]);

  /*
   * Keep the admin workspace hidden while authentication
   * and administrator permissions are being checked.
   */
  if (
    checking ||
    !isAuthenticated ||
    !token ||
    !user
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />

          <p className="mt-4 text-sm font-bold text-slate-500">
            Checking administrator access...
          </p>
        </div>
      </main>
    );
  }

  /*
   * Only users with the admin role can enter
   * the JobWay administration workspace.
   */
  if (user.role !== "admin") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-7 w-7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71 3L13.71 3.86a2 2 0 0 0-3.42 0Z"
              />
            </svg>
          </div>

          <h1 className="mt-5 text-xl font-black text-slate-950">
            Admin access required
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            You do not have permission to access the
            JobWay administration workspace.
          </p>
        </div>
      </main>
    );
  }

  return (
    <AdminShell>
      {children}
    </AdminShell>
  );
}