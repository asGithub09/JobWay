import Link from "next/link";

type BrandLogoProps = {
  href?: string;
  showTagline?: boolean;
  compact?: boolean;
  className?: string;
};

export function BrandLogo({
  href = "/",
  showTagline = false,
  compact = false,
  className = "",
}: BrandLogoProps) {
  return (
    <Link
      href={href}
      aria-label="JobWay home"
      className={`inline-flex items-center gap-2.5 ${className}`}
    >
      <span
        aria-hidden="true"
        className={`flex shrink-0 items-center justify-center rounded-xl bg-[#E13032] font-black text-white shadow-[0_8px_24px_rgba(225,48,50,0.2)] ${
          compact ? "h-9 w-9 text-base" : "h-10 w-10 text-lg"
        }`}
      >
        J
      </span>

      <span className="flex flex-col">
        <span
          className={`font-black leading-none tracking-tight text-slate-950 ${
            compact ? "text-lg" : "text-xl"
          }`}
        >
          Job<span className="text-[#E13032]">Way</span>
        </span>

        {showTagline ? (
          <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
            Learn. Practice. Succeed.
          </span>
        ) : null}
      </span>
    </Link>
  );
}
