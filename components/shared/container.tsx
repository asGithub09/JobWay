import type { HTMLAttributes } from "react";

type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  size?: "default" | "wide" | "narrow" | "full";
};

const sizeClasses: Record<
  NonNullable<ContainerProps["size"]>,
  string
> = {
  narrow: "max-w-[960px]",
  default: "max-w-[1200px]",
  wide: "max-w-[1440px]",
  full: "max-w-none",
};

export function Container({
  children,
  className = "",
  size = "default",
  ...props
}: ContainerProps) {
  return (
    <div
      className={[
        "mx-auto w-full",
        "px-4 sm:px-6 lg:px-8",
        sizeClasses[size],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}