import type { ReactNode } from "react";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "left",
  className = "",
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <div
      className={`mb-8 flex flex-col gap-5 ${
        centered
          ? "items-center text-center"
          : "items-start sm:flex-row sm:items-end sm:justify-between"
      } ${className}`}
    >
      <div className={centered ? "max-w-3xl" : "max-w-3xl"}>
        {eyebrow ? (
          <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#E13032]">
            {eyebrow}
          </p>
        ) : null}

        <h2 className="text-balance text-2xl font-black tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">
          {title}
        </h2>

        {description ? (
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base sm:leading-7">
            {description}
          </p>
        ) : null}
      </div>

      {action ? (
        <div className={centered ? "shrink-0" : "shrink-0"}>{action}</div>
      ) : null}
    </div>
  );
}