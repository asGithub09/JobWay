"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { DashboardNavbar } from "@/components/layout/DashboardNavbar";
import { EducatorSidebar } from "./EducatorSidebar";

interface EducatorShellProps {
  children: React.ReactNode;
}

export function EducatorShell({
  children,
}: EducatorShellProps) {
  const { user, isAuthenticated } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!isAuthenticated || !user) {
      window.location.href = "/login";
      return;
    }

    if (user.role !== "educator") {
      if (user.role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/dashboard";
      }

      return;
    }

    setAuthorized(true);
  }, [mounted, isAuthenticated, user]);

  if (!mounted || !authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8fc]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#E13032]" />

          <p className="text-sm font-semibold text-slate-600">
            Loading Educator Workspace...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <EducatorSidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="lg:pl-[270px]">
        <DashboardNavbar role="educator" onMenuClick={() => setMobileOpen(true)} />

        <main className="min-h-[calc(100vh-76px)]">
          {children}
        </main>
      </div>
    </div>
  );
}