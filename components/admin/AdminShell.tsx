"use client";

import { useState } from "react";

import { AdminNavbar } from "./AdminNavbar";
import { AdminSidebar } from "./AdminSidebar";

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({
  children,
}: AdminShellProps) {
  const [mobileOpen, setMobileOpen] =
    useState(false);

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <AdminSidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="lg:pl-[270px]">
        <AdminNavbar
          onMenuClick={() =>
            setMobileOpen(true)
          }
        />

        <main className="min-h-[calc(100vh-76px)]">
          {children}
        </main>
      </div>
    </div>
  );
}