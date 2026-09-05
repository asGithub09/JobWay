import type { HTMLAttributes, ReactNode } from "react";

type DashboardCardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  variant?: "default" | "strong" | "gradient";
  padding?: "none" | "sm" | "md" | "lg";
};

const variantClasses = {
  default: "dashboard-glass",
  strong: "dashboard-glass-strong",
  gradient: "dashboard-gradient-primary text-white border-transparent",
};

const paddingClasses = {
  none: "",
  sm: "p-3",
  md: "p-5",
  lg: "p-6 sm:p-7",
};

export function DashboardCard({
  children,
  variant = "default",
  padding = "md",
  className = "",
  ...props
}: DashboardCardProps) {
  return (
    <div
      className={`rounded-2xl ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}