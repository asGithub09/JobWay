"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface AdminBackButtonProps {
  fallback?: string;
  label?: string;
}

export function AdminBackButton({
  fallback = "/admin",
  label = "Back",
}: AdminBackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (
      typeof window !== "undefined" &&
      window.history.length > 1
    ) {
      router.back();
      return;
    }

    router.push(fallback);
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className="
        inline-flex
        items-center
        gap-2
        rounded-xl
        border
        border-slate-200
        bg-white
        px-3.5
        py-2
        text-sm
        font-semibold
        text-slate-700
        shadow-sm
        transition
        hover:border-violet-200
        hover:bg-violet-50
        hover:text-violet-700
        active:scale-[0.98]
      "
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </button>
  );
}