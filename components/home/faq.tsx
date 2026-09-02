"use client";

import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  HelpCircle,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";

import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";

type FAQItem = {
  id: string;
  question: string;
  answer: string;
};

const FAQ_ITEMS: FAQItem[] = [
  {
    id: "what-is-jobway",
    question: "What is JobWay?",
    answer:
      "JobWay is a digital learning platform designed to help learners prepare for competitive examinations and career opportunities through courses, mock tests, study material, current affairs and practice resources.",
  },
  {
    id: "which-exams",
    question: "Which examinations can I prepare for on JobWay?",
    answer:
      "JobWay can organize preparation resources across major categories such as Banking, SSC and Railway, UPSC and State PSC, Teaching, Engineering and other career-focused examinations. The available courses and test series can vary by examination.",
  },
  {
    id: "free-resources",
    question: "Does JobWay provide free learning resources?",
    answer:
      "Yes. The platform includes free resources such as current affairs, selected live classes, previous year papers, quizzes and other preparation material. Premium courses and test products may provide additional content and features.",
  },
  {
    id: "mock-tests",
    question: "Can I take mock tests online?",
    answer:
      "Yes. JobWay is designed to provide online mock tests and practice sessions. Depending on the test series, learners can practice topic-wise or exam-style questions and review their performance.",
  },
  {
    id: "languages",
    question: "Can I learn in an Indian regional language?",
    answer:
      "JobWay is designed with multilingual learning in mind. Learning experiences can be organized in languages including Hindi, Bengali, Marathi, Tamil, Telugu, Gujarati, Kannada, Malayalam, Punjabi, Odia, Assamese, Urdu and English.",
  },
  {
    id: "courses",
    question: "How do I choose the right course?",
    answer:
      "Start by selecting your target examination and reviewing the course syllabus, duration, faculty information, included classes, study material and test access. Choose a course that matches your preparation level and examination timeline.",
  },
  {
    id: "app",
    question: "Can I use JobWay on my mobile phone?",
    answer:
      "Yes. JobWay is designed to provide a mobile-friendly learning experience so you can access courses, practice resources and preparation material from supported devices.",
  },
  {
    id: "progress",
    question: "Can I track my preparation progress?",
    answer:
      "The JobWay learning experience is designed around progress tracking, practice performance and consistent preparation. Specific progress features can depend on the course, test series or account experience.",
  },
  {
    id: "support",
    question: "How can I get help if I have a problem?",
    answer:
      "You can use the support and contact options available on the platform for assistance with account, course, payment or learning-related questions. Keep your registered details and relevant order information available when contacting support.",
  },
  {
    id: "refund",
    question: "Where can I find information about refunds and policies?",
    answer:
      "Refund eligibility and other purchase terms depend on the applicable product and policy. Before making a purchase, review the relevant product terms and the applicable refund or cancellation policy.",
  },
];

function FAQRow({
  item,
  isOpen,
  onToggle,
}: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const answerId = `${item.id}-answer`;

  return (
    <div
      className={`overflow-hidden rounded-[16px] border transition-all duration-300 ${
        isOpen
          ? "border-[#f0c6c7] bg-[#fff8f8] shadow-[0_8px_24px_rgba(225,48,50,0.06)]"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-[0_5px_18px_rgba(15,23,42,0.04)]"
      }`}
    >
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={answerId}
        onClick={onToggle}
        className="flex min-h-[68px] w-full items-center justify-between gap-5 px-5 py-4 text-left focus-visible:outline-2 focus-visible:outline-[#E13032] focus-visible:outline-offset-[-2px] sm:px-6 sm:py-5"
      >
        <span
          className={`pr-2 text-[13px] font-black leading-6 transition-colors duration-200 sm:text-[14px] ${
            isOpen ? "text-[#E13032]" : "text-slate-900"
          }`}
        >
          {item.question}
        </span>

        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
            isOpen
              ? "bg-[#E13032] text-white shadow-[0_5px_14px_rgba(225,48,50,0.20)]"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          />
        </span>
      </button>

      <div
        id={answerId}
        role="region"
        aria-hidden={!isOpen}
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
          isOpen
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="border-t border-red-100 px-5 pb-5 pt-4 sm:px-6">
            <p className="max-w-[760px] text-[13px] leading-6 text-slate-500 sm:text-sm sm:leading-6">
              {item.answer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FAQ() {
  const [openId, setOpenId] = useState<string | null>(
    FAQ_ITEMS[0]?.id ?? null,
  );

  const handleToggle = (id: string) => {
    setOpenId((currentId) => (currentId === id ? null : id));
  };

  return (
    <section
      aria-labelledby="faq-heading"
      className="relative overflow-hidden bg-[#f8f9fb] py-14 sm:py-16 lg:py-[72px]"
    >
      {/* Decorative background */}
      <div
        className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full bg-red-50/60 blur-3xl"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-orange-50/40 blur-3xl"
        aria-hidden="true"
      />

      <Container size="wide">
        <SectionHeading
          eyebrow="HELP & SUPPORT"
          title="Frequently asked questions"
          description="Find quick answers about JobWay, courses, mock tests, free resources, languages and the learning experience."
          action={
            <Link
              href="/help"
              className="inline-flex items-center gap-1.5 text-sm font-extrabold text-[#E13032] transition hover:text-[#B91C1C]"
            >
              Visit help center
              <ArrowRight
                className="h-4 w-4"
                aria-hidden="true"
              />
            </Link>
          }
        />

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-8">
          {/* Support card */}
          <aside className="rounded-[20px] border border-slate-200 bg-white p-6 shadow-[0_8px_25px_rgba(15,23,42,0.05)] sm:p-7 lg:sticky lg:top-28">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-[#E13032]">
              <HelpCircle
                className="h-6 w-6"
                aria-hidden="true"
              />
            </div>

            <h3 className="mt-5 text-xl font-black tracking-tight text-slate-950">
              Still have questions?
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Can&apos;t find what you&apos;re looking for? Our support
              resources can help you find the right information.
            </p>

            <div className="mt-6 space-y-2.5">
              <Link
                href="/help"
                className="group flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 transition-all duration-200 hover:border-red-100 hover:bg-red-50"
              >
                <span className="flex items-center gap-3">
                  <MessageCircle
                    className="h-4 w-4 text-[#E13032]"
                    aria-hidden="true"
                  />

                  <span className="text-xs font-extrabold text-slate-700">
                    Help Center
                  </span>
                </span>

                <ArrowRight
                  className="h-4 w-4 text-slate-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[#E13032]"
                  aria-hidden="true"
                />
              </Link>

              <Link
                href="/contact"
                className="group flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 transition-all duration-200 hover:border-red-100 hover:bg-red-50"
              >
                <span className="flex items-center gap-3">
                  <MessageCircle
                    className="h-4 w-4 text-slate-500 transition-colors group-hover:text-[#E13032]"
                    aria-hidden="true"
                  />

                  <span className="text-xs font-extrabold text-slate-700">
                    Contact Support
                  </span>
                </span>

                <ArrowRight
                  className="h-4 w-4 text-slate-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[#E13032]"
                  aria-hidden="true"
                />
              </Link>
            </div>

            <div className="mt-6 flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
              <ShieldCheck
                className="mt-0.5 h-4 w-4 shrink-0 text-green-600"
                aria-hidden="true"
              />

              <p className="text-[11px] font-semibold leading-5 text-slate-500">
                For account or purchase support, use the official support
                channels associated with your JobWay account.
              </p>
            </div>
          </aside>

          {/* FAQ list */}
          <div
            id="faq-list"
            className="space-y-2.5"
          >
            {FAQ_ITEMS.map((item) => (
              <FAQRow
                key={item.id}
                item={item}
                isOpen={openId === item.id}
                onToggle={() => handleToggle(item.id)}
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}