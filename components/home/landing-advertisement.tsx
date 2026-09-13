"use client";

import { FormEvent, useEffect, useState } from "react";
import { X, Rocket, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { createLead } from "@/lib/api";

type Advertisement = {
  _id: string;
  name: string;
  imageUrl: string;
  title?: string;
  description?: string;
  ctaText: string;
  displayDelay: number;
  isActive: boolean;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export default function LandingAdvertisement() {
  const [advertisements, setAdvertisements] =
    useState<Advertisement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [leadOpen, setLeadOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [goal, setGoal] = useState<"government" | "private">("government");

  const advertisement = advertisements[currentIndex] || null;

  useEffect(() => {
    let cancelled = false;

    const loadAdvertisements = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/advertisements/active`,
          {
            cache: "no-store",
          },
        );

        const data = await response.json();

        if (!response.ok || !Array.isArray(data?.advertisements) || cancelled) {
          return;
        }

        setAdvertisements(data.advertisements as Advertisement[]);
        setCurrentIndex(0);
      } catch {
        // Advertisement is non-critical and must never block the landing page.
      }
    };

    loadAdvertisements();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!advertisement) {
      return;
    }

    let cancelled = false;

    setVisible(false);
    setLeadOpen(false);
    setSubmitted(false);
    setError("");

    const delay = Math.max(
      0,
      Number(advertisement.displayDelay || 0),
    );

    const timer = window.setTimeout(() => {
      if (cancelled) return;

      setVisible(true);

      window.dispatchEvent(
        new CustomEvent("jobway:landing-ad-ready"),
      );
    }, delay * 1000);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [advertisement]);

  const closeAdvertisement = () => {
    setVisible(false);
    setLeadOpen(false);
    setSubmitted(false);
    setError("");

    if (advertisements.length <= 1) {
      return;
    }

    window.setTimeout(() => {
      setCurrentIndex((previousIndex) =>
        (previousIndex + 1) % advertisements.length,
      );
    }, 10000);
  };

  const openLeadForm = () => {
    setLeadOpen(true);
    setError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      const response = await createLead({
        name,
        phone,
        email,
        goal,
        interests: ["job-ready-courses"],
        source: "landing-ad",
      });

      if (!response.success) {
        throw new Error(response.message || "Unable to submit your details.");
      }

      setSubmitted(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to submit your details.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!advertisement) {
    return null;
  }

  return (
    <div
      data-motion="landing-ad"
      data-ad-visible={visible ? "true" : "false"}
      className={
        visible
          ? "pointer-events-auto fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center"
          : "pointer-events-none fixed inset-0 z-[80] flex items-end justify-center p-4 opacity-0 sm:items-center"
      }
      aria-hidden={!visible}
    >
      <div
        data-motion-ad-backdrop
        className="absolute inset-0 bg-slate-950/15 backdrop-blur-[2px]"
        onClick={closeAdvertisement}
      />

      <div
        data-motion-ad-card
        className="relative w-full max-w-3xl overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.22)]"
      >
        <button
          type="button"
          onClick={closeAdvertisement}
          className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-500 shadow-sm backdrop-blur transition hover:bg-slate-100 hover:text-slate-900"
          aria-label="Close advertisement"
        >
          <X className="h-4 w-4" />
        </button>

        <div
          data-motion-ad-rocket
          aria-hidden="true"
          className="pointer-events-none absolute -left-16 top-1/2 z-10 -translate-y-1/2 opacity-0"
        >
          <div className="relative">
            <div className="absolute -left-8 top-1/2 h-10 w-24 -translate-y-1/2 rounded-full bg-cyan-300/50 blur-xl" />
            <Rocket className="h-10 w-10 rotate-90 text-cyan-600 drop-shadow-lg" />
          </div>
        </div>

        <div
          data-motion-ad-blast
          className="pointer-events-none absolute left-1/2 top-1/2 z-10 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-cyan-300 opacity-0"
        />

        <div className="grid md:grid-cols-[0.9fr_1.1fr]">
          <div className="relative min-h-[210px] overflow-hidden bg-slate-100 md:min-h-[320px]">
            <img
              src={advertisement.imageUrl}
              alt={advertisement.title || advertisement.name}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex flex-col justify-center p-6 sm:p-8">
            {!leadOpen ? (
              <>
                <span className="mb-3 inline-flex w-fit items-center gap-2 rounded-full bg-cyan-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-cyan-700">
                  <Rocket className="h-3 w-3" />
                  Featured opportunity
                </span>

                <h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                  {advertisement.title || advertisement.name}
                </h2>

                {advertisement.description && (
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {advertisement.description}
                  </p>
                )}

                <button
                  type="button"
                  onClick={openLeadForm}
                  className="mt-6 inline-flex w-fit items-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-cyan-200 transition hover:bg-cyan-700"
                >
                  {advertisement.ctaText || "Get Enrolled"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </>
            ) : submitted ? (
              <div className="py-4">
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />

                <h2 className="mt-4 text-2xl font-black text-slate-950">
                  Thanks! We&apos;ll contact you.
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Your enrollment interest has been sent to the JobWay team.
                </p>

                <button
                  type="button"
                  onClick={closeAdvertisement}
                  className="mt-6 rounded-xl bg-slate-900 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800"
                >
                  Continue to JobWay
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-black tracking-tight text-slate-950">
                  Get started with JobWay
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Share your details and our team will help you with enrollment.
                </p>

                <form onSubmit={handleSubmit} className="mt-5 space-y-3">
                  <input
                    required
                    minLength={2}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Full name"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-cyan-500"
                  />

                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      required
                      inputMode="numeric"
                      maxLength={10}
                      value={phone}
                      onChange={(event) =>
                        setPhone(
                          event.target.value.replace(/\D/g, "").slice(0, 10),
                        )
                      }
                      placeholder="10-digit mobile"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-cyan-500"
                    />

                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="Email address"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-cyan-500"
                    />
                  </div>

                  <select
                    value={goal}
                    onChange={(event) =>
                      setGoal(event.target.value as "government" | "private")
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-cyan-500"
                  >
                    <option value="government">
                      Government Jobs
                    </option>
                    <option value="private">
                      Private Jobs
                    </option>
                  </select>

                  {error && (
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-cyan-200 transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    {submitting ? "Submitting..." : "Submit Enrollment Interest"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

