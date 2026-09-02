"use client";

import { Check, ChevronDown, Languages } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { LEARNING_LANGUAGES } from "@/lib/constants";

type LanguageSelectorProps = {
  value?: string;
  onChange?: (languageId: string) => void;
  compact?: boolean;
};

export function LanguageSelector({
  value = "english",
  onChange,
  compact = false,
}: LanguageSelectorProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedLanguage =
    LEARNING_LANGUAGES.find((language) => language.id === value) ??
    LEARNING_LANGUAGES[0];

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleLanguageChange = (languageId: string) => {
    onChange?.(languageId);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Select language. Current language: ${selectedLanguage.name}`}
        onClick={() => setOpen((current) => !current)}
        className={`inline-flex items-center gap-2 rounded-lg border border-transparent px-2.5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-200 hover:bg-slate-50 hover:text-[#E13032] focus-visible:outline-2 focus-visible:outline-[#E13032] focus-visible:outline-offset-2 ${
          compact ? "px-2" : ""
        }`}
      >
        <Languages
          className="h-4 w-4 shrink-0"
          aria-hidden="true"
        />

        <span className={compact ? "sr-only" : "hidden xl:inline"}>
          {selectedLanguage.nativeName}
        </span>

        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div
          role="listbox"
          aria-label="Available learning languages"
          className="absolute right-0 top-[calc(100%+8px)] z-[80] w-56 overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10"
        >
          <div className="mb-1 px-2.5 py-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Learning Language
            </p>
          </div>

          <div className="max-h-72 overflow-y-auto">
            {LEARNING_LANGUAGES.map((language) => {
              const isSelected = language.id === selectedLanguage.id;

              return (
                <button
                  key={language.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleLanguageChange(language.id)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition ${
                    isSelected
                      ? "bg-red-50 text-[#E13032]"
                      : "text-slate-700 hover:bg-slate-50 hover:text-[#E13032]"
                  }`}
                >
                  <span className="flex min-w-0 flex-col">
                    <span className="text-sm font-semibold">
                      {language.nativeName}
                    </span>
                    {language.nativeName !== language.name ? (
                      <span className="text-[11px] text-slate-400">
                        {language.name}
                      </span>
                    ) : null}
                  </span>

                  {isSelected ? (
                    <Check
                      className="h-4 w-4 shrink-0"
                      aria-hidden="true"
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}