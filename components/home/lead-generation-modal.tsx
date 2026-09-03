"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  BookOpen,
  Briefcase,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Landmark,
  Mail,
  Phone,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { createLead } from "@/lib/api";

type Goal = "government" | "private";

type Interest =
  | "free-courses"
  | "job-ready-courses"
  | "mock-tests"
  | "job-updates";

type LeadGenerationModalProps = {
  isOpen?: boolean;
  open?: boolean;
  onClose?: () => void;
  destination?: string;
  redirectTo?: string;
  [key: string]: unknown;
};

const INTERESTS: {
  id: Interest;
  title: string;
  description: string;
  icon: typeof BookOpen;
}[] = [
  {
    id: "free-courses",
    title: "Free Courses",
    description: "Learn with quality free resources.",
    icon: BookOpen,
  },
  {
    id: "job-ready-courses",
    title: "Job Ready Courses",
    description: "Build skills that help you get hired.",
    icon: Briefcase,
  },
  {
    id: "mock-tests",
    title: "Mock Tests & Practice",
    description: "Practice with tests and improve your score.",
    icon: ClipboardCheck,
  },
  {
    id: "job-updates",
    title: "Job & Exam Updates",
    description: "Stay updated with opportunities and exams.",
    icon: Bell,
  },
];

export function LeadGenerationModal({
  isOpen,
  open,
  onClose,
  destination = "/",
  redirectTo,
}: LeadGenerationModalProps) {
  const visible = isOpen ?? open ?? false;

  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [interests, setInterests] = useState<Interest[]>([]);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setStep(1);
    setGoal(null);
    setName("");
    setPhone("");
    setEmail("");
    setInterests([]);
    setError("");
    setSubmitted(false);
    setSubmitting(false);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [visible, onClose]);

  if (!visible) {
    return null;
  }

  const handleGoalSelect = (selectedGoal: Goal) => {
    setGoal(selectedGoal);
    setError("");
    setStep(2);
  };

  const handleDetailsContinue = () => {
    setError("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const digits = phone.replace(/\D/g, "");

    if (!trimmedName) {
      setError("Please enter your full name.");
      return;
    }

    if (trimmedName.length < 2) {
      setError("Please enter a valid name.");
      return;
    }

    if (digits.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setName(trimmedName);
    setPhone(digits);
    setEmail(trimmedEmail);
    setStep(3);
  };

  const toggleInterest = (interest: Interest) => {
    setError("");

    setInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest],
    );
  };

  const handleSubmit = async () => {
    setError("");

    if (!goal) {
      setError("Please select what you are preparing for.");
      setStep(1);
      return;
    }

    if (interests.length === 0) {
      setError("Please select at least one area you are interested in.");
      return;
    }

    if (submitting) {
      return;
    }

    setSubmitting(true);

    try {
      await createLead({
        name: name.trim(),
        phone: phone.replace(/\D/g, ""),
        email: email.trim().toLowerCase(),
        goal,
        interests,
        source: "homepage-exam-selector",
      });

      setSubmitted(true);
    } catch (submitError) {
      console.error("Lead submission error:", submitError);

      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to submit your details. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleContinue = () => {
    const target = redirectTo || destination || "/";

    onClose?.();

    window.location.href = target;
  };

  const handleBackdropClick = (
    event: React.MouseEvent<HTMLDivElement>,
  ) => {
    if (event.target === event.currentTarget) {
      onClose?.();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-slate-900/35 p-4 backdrop-blur-md sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="jobway-lead-title"
      onMouseDown={handleBackdropClick}
    >
      <div className="relative w-full max-w-[720px] overflow-hidden rounded-[30px] border border-white/80 bg-white/90 shadow-[0_30px_100px_rgba(91,33,182,0.24)] backdrop-blur-2xl">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-violet-300/30 blur-3xl" />
          <div className="absolute -right-24 top-20 h-72 w-72 rounded-full bg-fuchsia-300/25 blur-3xl" />
          <div className="absolute bottom-[-120px] left-1/3 h-64 w-64 rounded-full bg-indigo-200/25 blur-3xl" />
        </div>

        <div className="relative z-10">
          <button
            type="button"
            onClick={() => onClose?.()}
            className="absolute right-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/80 bg-white/80 text-slate-500 shadow-[0_8px_25px_rgba(15,23,42,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="px-5 pb-7 pt-8 sm:px-9 sm:pb-9 sm:pt-10">
            {!submitted ? (
              <>
                <div className="pr-12">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-violet-700">
                    <Sparkles className="h-3.5 w-3.5" />
                    Personalised for you
                  </div>

                  <h2
                    id="jobway-lead-title"
                    className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl"
                  >
                    {step === 1 && "What are you aiming for?"}
                    {step === 2 && "Tell us a little about yourself"}
                    {step === 3 && "What would you like to explore?"}
                  </h2>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-[15px]">
                    {step === 1 &&
                      "Choose your career goal and we'll personalise your JobWay journey."}
                    {step === 2 &&
                      "Share your details so we can recommend the right learning opportunities."}
                    {step === 3 &&
                      "Select the resources that are most useful for your preparation."}
                  </p>
                </div>

                <div className="mt-7 flex items-center gap-2">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                        item <= step
                          ? "bg-gradient-to-r from-violet-600 to-fuchsia-500"
                          : "bg-slate-200"
                      }`}
                    />
                  ))}
                </div>

                {step === 1 && (
                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => handleGoalSelect("government")}
                      className={`group relative overflow-hidden rounded-2xl border p-5 text-left transition-all duration-200 hover:-translate-y-1 ${
                        goal === "government"
                          ? "border-violet-500 bg-violet-50 shadow-[0_18px_45px_rgba(124,58,237,0.18)]"
                          : "border-slate-200 bg-white/75 shadow-[0_10px_30px_rgba(15,23,42,0.06)] hover:border-violet-300 hover:shadow-[0_18px_45px_rgba(124,58,237,0.12)]"
                      }`}
                    >
                      <div className="absolute right-[-25px] top-[-25px] h-24 w-24 rounded-full bg-violet-200/40 blur-2xl transition-transform duration-300 group-hover:scale-125" />

                      <div className="relative flex items-start justify-between gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-[0_10px_25px_rgba(99,102,241,0.28)]">
                          <Landmark className="h-7 w-7" />
                        </div>

                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-full border ${
                            goal === "government"
                              ? "border-violet-500 bg-violet-600 text-white"
                              : "border-slate-200 bg-white text-transparent"
                          }`}
                        >
                          <Check className="h-4 w-4" />
                        </span>
                      </div>

                      <div className="relative mt-5">
                        <h3 className="text-lg font-black text-slate-950">
                          Government Job
                        </h3>

                        <p className="mt-1 text-sm leading-5 text-slate-500">
                          Prepare for SSC, Banking, Railways, UPSC and other government opportunities.
                        </p>
                      </div>

                      <div className="relative mt-5 inline-flex items-center gap-1.5 text-xs font-black text-violet-700">
                        Explore exams
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleGoalSelect("private")}
                      className={`group relative overflow-hidden rounded-2xl border p-5 text-left transition-all duration-200 hover:-translate-y-1 ${
                        goal === "private"
                          ? "border-fuchsia-500 bg-fuchsia-50 shadow-[0_18px_45px_rgba(217,70,239,0.18)]"
                          : "border-slate-200 bg-white/75 shadow-[0_10px_30px_rgba(15,23,42,0.06)] hover:border-fuchsia-300 hover:shadow-[0_18px_45px_rgba(217,70,239,0.12)]"
                      }`}
                    >
                      <div className="absolute right-[-25px] top-[-25px] h-24 w-24 rounded-full bg-fuchsia-200/40 blur-2xl transition-transform duration-300 group-hover:scale-125" />

                      <div className="relative flex items-start justify-between gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-600 to-pink-600 text-white shadow-[0_10px_25px_rgba(217,70,239,0.28)]">
                          <Briefcase className="h-7 w-7" />
                        </div>

                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-full border ${
                            goal === "private"
                              ? "border-fuchsia-500 bg-fuchsia-600 text-white"
                              : "border-slate-200 bg-white text-transparent"
                          }`}
                        >
                          <Check className="h-4 w-4" />
                        </span>
                      </div>

                      <div className="relative mt-5">
                        <h3 className="text-lg font-black text-slate-950">
                          Private Job
                        </h3>

                        <p className="mt-1 text-sm leading-5 text-slate-500">
                          Build practical skills and prepare for private-sector career opportunities.
                        </p>
                      </div>

                      <div className="relative mt-5 inline-flex items-center gap-1.5 text-xs font-black text-fuchsia-700">
                        Explore opportunities
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </div>
                    </button>
                  </div>
                )}

                {step === 2 && (
                  <div className="mt-8 space-y-4">
                    <div>
                      <label className="mb-2 block text-xs font-black uppercase tracking-[0.08em] text-slate-600">
                        Full Name
                      </label>

                      <div className="relative">
                        <UserRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-violet-500" />

                        <input
                          type="text"
                          value={name}
                          onChange={(event) => setName(event.target.value)}
                          placeholder="Enter your full name"
                          className="h-13 w-full rounded-2xl border border-slate-200 bg-white/80 pl-12 pr-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-black uppercase tracking-[0.08em] text-slate-600">
                        Mobile Number
                      </label>

                      <div className="relative">
                        <Phone className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-violet-500" />

                        <input
                          type="tel"
                          inputMode="numeric"
                          maxLength={10}
                          value={phone}
                          onChange={(event) =>
                            setPhone(
                              event.target.value
                                .replace(/\D/g, "")
                                .slice(0, 10),
                            )
                          }
                          placeholder="10-digit mobile number"
                          className="h-13 w-full rounded-2xl border border-slate-200 bg-white/80 pl-12 pr-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-black uppercase tracking-[0.08em] text-slate-600">
                        Email Address
                      </label>

                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-violet-500" />

                        <input
                          type="email"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          placeholder="Enter your email address"
                          className="h-13 w-full rounded-2xl border border-slate-200 bg-white/80 pl-12 pr-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    {INTERESTS.map((item) => {
                      const Icon = item.icon;
                      const selected = interests.includes(item.id);

                      return (
                        <button
                          type="button"
                          key={item.id}
                          onClick={() => toggleInterest(item.id)}
                          className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 ${
                            selected
                              ? "border-violet-400 bg-gradient-to-br from-violet-50 to-fuchsia-50 shadow-[0_14px_35px_rgba(124,58,237,0.12)]"
                              : "border-slate-200 bg-white/75 hover:border-violet-300 hover:bg-violet-50/40"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all ${
                                selected
                                  ? "bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-[0_8px_20px_rgba(124,58,237,0.25)]"
                                  : "bg-violet-50 text-violet-600"
                              }`}
                            >
                              <Icon className="h-5 w-5" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-sm font-black text-slate-900">
                                  {item.title}
                                </span>

                                <span
                                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                                    selected
                                      ? "border-violet-600 bg-violet-600 text-white"
                                      : "border-slate-200 bg-white text-transparent"
                                  }`}
                                >
                                  <Check className="h-3 w-3" />
                                </span>
                              </div>

                              <p className="mt-1 text-xs leading-5 text-slate-500">
                                {item.description}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {error && (
                  <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                    {error}
                  </div>
                )}

                <div className="mt-7 flex items-center justify-between gap-3">
                  {step > 1 ? (
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => {
                        setError("");
                        setStep(step - 1);
                      }}
                      className="inline-flex h-12 items-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 shadow-[0_8px_25px_rgba(15,23,42,0.07)] transition-all hover:-translate-y-0.5 hover:border-violet-300 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </button>
                  ) : (
                    <div />
                  )}

                  {step === 2 && (
                    <button
                      type="button"
                      onClick={handleDetailsContinue}
                      className="group relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 px-6 text-sm font-black text-white shadow-[0_12px_30px_rgba(124,58,237,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_35px_rgba(124,58,237,0.38)]"
                    >
                      <span className="absolute inset-x-0 top-0 h-px bg-white/70" />
                      Continue
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  )}

                  {step === 3 && (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="group relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 px-6 text-sm font-black text-white shadow-[0_12px_30px_rgba(124,58,237,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_35px_rgba(124,58,237,0.38)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                    >
                      <span className="absolute inset-x-0 top-0 h-px bg-white/70" />

                      {submitting ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Get Started
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="py-7 text-center sm:py-10">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-[0_18px_40px_rgba(124,58,237,0.28)]">
                  <CheckCircle2 className="h-10 w-10" />
                </div>

                <h2 className="mt-6 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                  You're all set!
                </h2>

                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500 sm:text-base">
                  Thanks, {name}. We've noted what you're looking for and can personalise your JobWay experience around your goals.
                </p>

                <div className="mx-auto mt-6 max-w-md rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-4 text-left">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm">
                      {goal === "government" ? (
                        <Landmark className="h-5 w-5" />
                      ) : (
                        <Briefcase className="h-5 w-5" />
                      )}
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-500">
                        Your goal
                      </p>

                      <p className="text-sm font-black text-slate-900">
                        {goal === "government"
                          ? "Government Job"
                          : "Private Job"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {interests.map((interest) => {
                      const item = INTERESTS.find(
                        (entry) => entry.id === interest,
                      );

                      return (
                        <span
                          key={interest}
                          className="rounded-full border border-violet-100 bg-white px-3 py-1.5 text-[11px] font-bold text-violet-700"
                        >
                          {item?.title}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleContinue}
                  className="group relative mt-7 inline-flex h-13 items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 px-7 text-sm font-black text-white shadow-[0_14px_35px_rgba(124,58,237,0.32)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(124,58,237,0.4)]"
                >
                  <span className="absolute inset-x-0 top-0 h-px bg-white/70" />
                  Continue to Exams
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeadGenerationModal;