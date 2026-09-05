import type { ReactNode } from "react";

type DashboardEmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function DashboardEmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: DashboardEmptyStateProps) {
  return (
    <div
      className={`dashboard-glass-strong flex min-h-[220px] flex-col items-center justify-center rounded-2xl p-6 text-center ${className}`}
    >
      {icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          {icon}
        </div>
      )}

      <h3 className="mt-4 text-base font-black text-slate-900">
        {title}
      </h3>

      {description && (
        <p className="mt-1.5 max-w-md text-sm leading-6 text-slate-500">
          {description}
        </p>
      )}

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}