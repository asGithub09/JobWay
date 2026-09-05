import type { ReactNode } from "react";

type DashboardBadgeProps = {
  children: ReactNode;
  variant?:
    | "neutral"
    | "primary"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "purple";
  icon?: ReactNode;
  className?: string;
};

const variantClasses = {
  neutral:
    "border-slate-200 bg-slate-100 text-slate-600",
  primary:
    "border-red-100 bg-red-50 text-[#b91c1c]",
  success:
    "border-emerald-100 bg-emerald-50 text-emerald-700",
  warning:
    "border-amber-100 bg-amber-50 text-amber-700",
  danger:
    "border-rose-100 bg-rose-50 text-rose-700",
  info:
    "border-blue-100 bg-blue-50 text-blue-700",
  purple:
    "border-violet-100 bg-violet-50 text-violet-700",
};

export function DashboardBadge({
  children,
  variant = "neutral",
  icon,
  className = "",
}: DashboardBadgeProps) {
  return (
    <span
      className={`
        inline-flex
        min-h-7
        items-center
        gap-1.5
        rounded-full
        border
        px-2.5
        py-1
        text-[11px]
        font-extrabold
        leading-none
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}

      <span>{children}</span>
    </span>
  );
}