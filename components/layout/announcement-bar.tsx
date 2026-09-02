import Link from "next/link";
import { ArrowRight, Sparkles, X } from "lucide-react";

type AnnouncementBarProps = {
  message?: string;
  actionLabel?: string;
  actionHref?: string;
  dismissible?: boolean;
};

export function AnnouncementBar({
  message = "Get access to expert-led courses, mock tests and daily exam preparation.",
  actionLabel = "Explore now",
  actionHref = "/courses",
  dismissible = false,
}: AnnouncementBarProps) {
  return (
    <div className="relative z-50 border-b border-red-900/20 bg-slate-950 text-white">
      <div className="mx-auto flex min-h-9 max-w-7xl items-center justify-center gap-2 px-4 py-2 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center justify-center gap-2 text-center">
          <Sparkles
            className="hidden h-3.5 w-3.5 shrink-0 text-red-400 sm:block"
            aria-hidden="true"
          />

          <p className="truncate text-[11px] font-medium leading-5 text-slate-200 sm:text-xs">
            {message}
          </p>

          {actionLabel && actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex shrink-0 items-center gap-1 text-[11px] font-bold text-red-400 underline decoration-red-400/50 underline-offset-2 transition hover:text-red-300 hover:decoration-red-300 sm:text-xs"
            >
              {actionLabel}
              <ArrowRight
                className="h-3 w-3"
                aria-hidden="true"
              />
            </Link>
          ) : null}
        </div>

        {dismissible ? (
          <button
            type="button"
            aria-label="Dismiss announcement"
            className="absolute right-3 rounded-md p-1 text-slate-400 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-red-400 sm:right-5"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </div>
  );
}