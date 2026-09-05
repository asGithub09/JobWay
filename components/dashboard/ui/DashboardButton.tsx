import type {
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

type DashboardButtonProps =
  ButtonHTMLAttributes<HTMLButtonElement> & {
    children: ReactNode;
    variant?:
      | "primary"
      | "secondary"
      | "ghost"
      | "danger"
      | "success";
    size?: "sm" | "md" | "lg";
    icon?: ReactNode;
  };

const variantClasses = {
  primary:
    "bg-[#E13032] text-white shadow-[0_8px_20px_rgba(225,48,50,0.18)] hover:bg-[#c9252a]",
  secondary:
    "bg-violet-600 text-white shadow-[0_8px_20px_rgba(124,58,237,0.16)] hover:bg-violet-700",
  ghost:
    "border border-slate-200 bg-white/70 text-slate-700 hover:border-red-200 hover:bg-red-50 hover:text-[#E13032]",
  danger:
    "bg-red-600 text-white shadow-[0_8px_20px_rgba(220,38,38,0.16)] hover:bg-red-700",
  success:
    "bg-emerald-600 text-white shadow-[0_8px_20px_rgba(5,150,105,0.16)] hover:bg-emerald-700",
};

const sizeClasses = {
  sm: "min-h-9 px-3 text-xs",
  md: "min-h-10 px-4 text-sm",
  lg: "min-h-11 px-5 text-sm",
};

export function DashboardButton({
  children,
  variant = "primary",
  size = "md",
  icon,
  className = "",
  type = "button",
  disabled,
  ...props
}: DashboardButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`
        dashboard-focus-ring
        inline-flex
        items-center
        justify-center
        gap-2
        rounded-xl
        font-bold
        transition-all
        duration-200
        hover:-translate-y-0.5
        active:translate-y-0
        disabled:cursor-not-allowed
        disabled:opacity-50
        disabled:hover:translate-y-0
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      {...props}
    >
      {icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}

      <span>{children}</span>
    </button>
  );
}