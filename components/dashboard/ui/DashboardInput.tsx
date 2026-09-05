import type {
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";

type DashboardInputProps =
  InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
    hint?: string;
    error?: string;
    icon?: ReactNode;
  };

export function DashboardInput({
  label,
  hint,
  error,
  icon,
  className = "",
  id,
  ...props
}: DashboardInputProps) {
  const inputId =
    id ||
    (label
      ? `dashboard-${label
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")}`
      : undefined);

  return (
    <div className="w-full">
      {label ? (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-xs font-extrabold text-slate-700"
        >
          {label}
        </label>
      ) : null}

      <div className="relative">
        {icon ? (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        ) : null}

        <input
          id={inputId}
          className={`
            dashboard-focus-ring
            min-h-11
            w-full
            rounded-xl
            border
            bg-white/80
            px-3.5
            text-sm
            font-medium
            text-slate-800
            shadow-sm
            outline-none
            transition-all
            placeholder:text-slate-400
            focus:border-red-300
            focus:bg-white
            focus:ring-4
            focus:ring-red-500/10
            disabled:cursor-not-allowed
            disabled:bg-slate-50
            disabled:opacity-60
            ${icon ? "pl-10" : ""}
            ${
              error
                ? "border-rose-300 focus:border-rose-400 focus:ring-rose-500/10"
                : "border-slate-200"
            }
            ${className}
          `}
          {...props}
        />
      </div>

      {error ? (
        <p className="mt-1.5 text-[11px] font-semibold text-rose-600">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-[11px] font-medium text-slate-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

type DashboardTextareaProps =
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label?: string;
    hint?: string;
    error?: string;
  };

export function DashboardTextarea({
  label,
  hint,
  error,
  className = "",
  id,
  ...props
}: DashboardTextareaProps) {
  const textareaId =
    id ||
    (label
      ? `dashboard-${label
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")}`
      : undefined);

  return (
    <div className="w-full">
      {label ? (
        <label
          htmlFor={textareaId}
          className="mb-1.5 block text-xs font-extrabold text-slate-700"
        >
          {label}
        </label>
      ) : null}

      <textarea
        id={textareaId}
        className={`
          dashboard-focus-ring
          min-h-28
          w-full
          resize-y
          rounded-xl
          border
          bg-white/80
          px-3.5
          py-3
          text-sm
          font-medium
          text-slate-800
          shadow-sm
          outline-none
          transition-all
          placeholder:text-slate-400
          focus:border-red-300
          focus:bg-white
          focus:ring-4
          focus:ring-red-500/10
          ${error ? "border-rose-300" : "border-slate-200"}
          ${className}
        `}
        {...props}
      />

      {error ? (
        <p className="mt-1.5 text-[11px] font-semibold text-rose-600">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-[11px] font-medium text-slate-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
}