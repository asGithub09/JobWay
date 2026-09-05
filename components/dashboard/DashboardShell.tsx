"use client";

import "@/styles/dashboard.css";

import { useState, type ReactNode } from "react";

import {
  DashboardSidebar,
  type DashboardNavSection,
} from "./DashboardSidebar";

import { DashboardHeader } from "./DashboardHeader";

type DashboardShellProps = {
  children: ReactNode;
  sections: DashboardNavSection[];
  activeHref?: string;
  title?: string;
  subtitle?: string;
  brandLabel?: string;
  brandSubtitle?: string;
  showSearch?: boolean;
  showNotifications?: boolean;
  onLogout?: () => void;
};

export function DashboardShell({
  children,
  sections,
  activeHref,
  title = "Dashboard",
  subtitle,
  brandLabel = "JobWay",
  brandSubtitle = "STUDENT PORTAL",
  showSearch = true,
  showNotifications = true,
  onLogout,
}: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => {
    setMobileOpen(false);
  };

  return (
    <div className="dashboard-page dashboard-gradient-bg min-h-screen">
      {/* =====================================================
          MOBILE SIDEBAR
         ===================================================== */}

      {mobileOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <button
            type="button"
            aria-label="Close dashboard navigation"
            onClick={closeMobile}
            className="absolute inset-0 bg-slate-950/30 backdrop-blur-sm"
          />

          <aside className="relative flex h-full w-[290px] max-w-[88vw] flex-col border-r border-slate-200/70 bg-white/95 shadow-[20px_0_60px_rgba(15,23,42,0.16)] backdrop-blur-xl">
            <DashboardSidebar
              sections={sections}
              activeHref={activeHref}
              onNavigate={closeMobile}
              onClose={closeMobile}
              onLogout={onLogout}
              mobile
              brandLabel={brandLabel}
              brandSubtitle={brandSubtitle}
            />
          </aside>
        </div>
      )}

      {/* =====================================================
          DESKTOP SIDEBAR
         ===================================================== */}

      <aside
        className="
          fixed
          inset-y-0
          left-0
          z-40
          hidden
          w-[270px]
          border-r
          border-slate-200/70
          bg-white/90
          shadow-[8px_0_35px_rgba(15,23,42,0.045)]
          backdrop-blur-2xl
          lg:flex
        "
      >
        <DashboardSidebar
          sections={sections}
          activeHref={activeHref}
          onLogout={onLogout}
          brandLabel={brandLabel}
          brandSubtitle={brandSubtitle}
        />
      </aside>

      {/* =====================================================
          MAIN APPLICATION AREA

          IMPORTANT:
          The sidebar occupies exactly 270px.
          The main application begins immediately after it.
         ===================================================== */}

      <div className="min-w-0 lg:ml-[270px]">
        <DashboardHeader
          title={title}
          subtitle={subtitle}
          onMenuClick={() => setMobileOpen(true)}
          showSearch={showSearch}
          showNotifications={showNotifications}
        />

        <main className="dashboard-main">
          {children}
        </main>
      </div>
    </div>
  );
}