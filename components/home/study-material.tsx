"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Book,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  FileText,
  GraduationCap,
  Languages,
  Star,
} from "lucide-react";

import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";

type MaterialCategory = {
  id: string;
  name: string;
  description: string;
  icon: typeof Book;
};

type Material = {
  id: string;
  category: string;
  title: string;
  description: string;
  badge: string;
  pages: string;
  language: string;
  rating: number;
  reviews: string;
  price: string;
  originalPrice: string;
};

const MATERIAL_CATEGORIES: MaterialCategory[] = [
  {
    id: "exam-books",
    name: "Exam Books",
    description: "Concepts & preparation",
    icon: BookOpen,
  },
  {
    id: "practice-books",
    name: "Practice Books",
    description: "Questions & exercises",
    icon: FileText,
  },
  {
    id: "current-affairs",
    name: "Current Affairs",
    description: "Updated exam material",
    icon: Languages,
  },
  {
    id: "revision",
    name: "Revision Material",
    description: "Quick revision resources",
    icon: GraduationCap,
  },
];

const MATERIALS: Material[] = [
  {
    id: "banking-complete-guide",
    category: "exam-books",
    title: "Banking Exams Complete Preparation Guide",
    description:
      "A structured preparation book covering important concepts, shortcuts and exam-oriented practice.",
    badge: "Bestseller",
    pages: "650+ pages",
    language: "English",
    rating: 4.8,
    reviews: "326",
    price: "₹499",
    originalPrice: "₹799",
  },
  {
    id: "ssc-mathematics",
    category: "exam-books",
    title: "SSC Mathematics Concept & Practice Book",
    description:
      "Build your mathematical fundamentals with chapter-wise concepts and carefully structured practice.",
    badge: "Popular",
    pages: "520+ pages",
    language: "English",
    rating: 4.7,
    reviews: "241",
    price: "₹449",
    originalPrice: "₹699",
  },
  {
    id: "reasoning-practice",
    category: "practice-books",
    title: "Reasoning Practice Workbook",
    description:
      "Practice important reasoning patterns with progressive difficulty and exam-focused questions.",
    badge: "New",
    pages: "420+ pages",
    language: "English",
    rating: 4.8,
    reviews: "184",
    price: "₹399",
    originalPrice: "₹649",
  },
  {
    id: "daily-current-affairs",
    category: "current-affairs",
    title: "Daily Current Affairs Compendium",
    description:
      "A focused collection of important current affairs prepared for competitive examination revision.",
    badge: "Updated",
    pages: "300+ pages",
    language: "English",
    rating: 4.9,
    reviews: "198",
    price: "₹299",
    originalPrice: "₹499",
  },
  {
    id: "teaching-revision",
    category: "revision",
    title: "Teaching Exams Quick Revision Notes",
    description:
      "Compact revision material designed to help you review important concepts efficiently before exams.",
    badge: "Value Pick",
    pages: "280+ pages",
    language: "English",
    rating: 4.7,
    reviews: "143",
    price: "₹249",
    originalPrice: "₹399",
  },
  {
    id: "english-grammar",
    category: "practice-books",
    title: "Competitive English Grammar & Practice",
    description:
      "Strengthen grammar, vocabulary and sentence-solving skills through structured exercises.",
    badge: "Popular",
    pages: "460+ pages",
    language: "English",
    rating: 4.8,
    reviews: "287",
    price: "₹399",
    originalPrice: "₹599",
  },
];

function MaterialArtwork({
  category,
  badge,
}: {
  category: string;
  badge: string;
}) {
  const icon =
    category === "current-affairs"
      ? Languages
      : category === "revision"
        ? GraduationCap
        : category === "practice-books"
          ? FileText
          : BookOpen;

  const Icon = icon;

  return (
    <div className="relative h-[190px] overflow-hidden bg-[#f1f4f7]">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 15% 15%, rgba(225,48,50,0.15), transparent 35%), radial-gradient(circle at 90% 90%, rgba(15,23,42,0.08), transparent 42%)",
        }}
        aria-hidden="true"
      />

      <div
        className="absolute -right-10 -top-10 h-36 w-36 rounded-full border-[22px] border-white/75"
        aria-hidden="true"
      />

      <div
        className="absolute -bottom-14 -left-10 h-40 w-40 rounded-full border-[28px] border-red-100/70"
        aria-hidden="true"
      />

      <div className="absolute left-1/2 top-1/2 flex h-[112px] w-[84px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[10px] bg-white shadow-[0_14px_30px_rgba(15,23,42,0.12)] transition duration-300 group-hover:-translate-y-[54%] group-hover:shadow-[0_18px_35px_rgba(15,23,42,0.16)]">
        <div className="absolute left-0 top-0 h-full w-1.5 rounded-l-[10px] bg-[#E13032]" />

        <div className="flex flex-col items-center">
          <Icon
            className="h-8 w-8 text-[#E13032]"
            aria-hidden="true"
          />

          <span className="mt-2 text-[9px] font-black uppercase tracking-wider text-slate-700">
            JobWay
          </span>

          <span className="mt-1 text-[7px] font-bold text-slate-400">
            Study Material
          </span>
        </div>
      </div>

      <span className="absolute left-4 top-4 rounded-full bg-[#E13032] px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-white shadow-md">
        {badge}
      </span>
    </div>
  );
}

function MaterialRating({
  rating,
  reviews,
}: {
  rating: number;
  reviews: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="flex items-center gap-0.5"
        aria-label={`${rating} out of 5 stars`}
      >
        {Array.from({ length: 5 }).map(
          (_, index) => (
            <Star
              key={index}
              className={`h-3.5 w-3.5 ${
                index < Math.round(rating)
                  ? "fill-amber-400 text-amber-400"
                  : "text-slate-200"
              }`}
              aria-hidden="true"
            />
          ),
        )}
      </div>

      <span className="text-xs font-black text-slate-700">
        {rating}
      </span>

      <span className="text-[10px] text-slate-400">
        ({reviews})
      </span>
    </div>
  );
}

function MaterialCard({
  material,
}: {
  material: Material;
}) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[18px] border border-[#e5e8ed] bg-white transition-all duration-300 hover:-translate-y-1 hover:border-red-100 hover:shadow-[0_16px_38px_rgba(15,23,42,0.10)]">
      <MaterialArtwork
        category={material.category}
        badge={material.badge}
      />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-[#f3f5f8] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[#66758a]">
            Study Material
          </span>

          <span className="text-[10px] font-bold text-slate-400">
            {material.pages}
          </span>
        </div>

        <h3 className="mt-4 line-clamp-2 min-h-[48px] text-[15px] font-black leading-6 tracking-tight text-slate-950 transition-colors group-hover:text-[#E13032]">
          {material.title}
        </h3>

        <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
          {material.description}
        </p>

        <div className="mt-4 flex items-center gap-4 text-[10px] font-semibold text-slate-400">
          <span className="flex items-center gap-1.5">
            <Languages
              className="h-3.5 w-3.5"
              aria-hidden="true"
            />
            {material.language}
          </span>

          <span className="flex items-center gap-1.5">
            <Book
              className="h-3.5 w-3.5"
              aria-hidden="true"
            />
            Printed
          </span>
        </div>

        <div className="mt-4 border-t border-slate-100 pt-4">
          <MaterialRating
            rating={material.rating}
            reviews={material.reviews}
          />
        </div>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black tracking-tight text-slate-950">
                {material.price}
              </span>

              <span className="text-xs text-slate-400 line-through">
                {material.originalPrice}
              </span>
            </div>

            <p className="mt-0.5 text-[10px] font-semibold text-green-600">
              Limited-time offer
            </p>
          </div>

          <Link
            href={`/books/${material.id}`}
            aria-label={`View ${material.title}`}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-[#E13032] transition-all duration-200 hover:bg-[#E13032] hover:text-white focus-visible:outline-2 focus-visible:outline-[#E13032] focus-visible:outline-offset-2"
          >
            <ChevronRight
              className="h-4 w-4"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function StudyMaterial() {
  const [activeCategory, setActiveCategory] =
    useState("exam-books");

  const filteredMaterials = MATERIALS.filter(
    (material) =>
      material.category === activeCategory,
  );

  const fallbackMaterials = MATERIALS.slice(
    0,
    4,
  );

  const displayedMaterials =
    filteredMaterials.length > 0
      ? filteredMaterials.slice(0, 4)
      : fallbackMaterials;

  return (
    <section
      aria-labelledby="study-material-heading"
      className="relative overflow-hidden bg-[#f8f9fb] py-14 sm:py-16 lg:py-[72px]"
    >
      <div
        className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full bg-red-50/60 blur-3xl"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-orange-50/50 blur-3xl"
        aria-hidden="true"
      />

      <Container size="wide">
        <SectionHeading
          eyebrow="BOOKS & STUDY MATERIAL"
          title="Prepare with the right material"
          description="Explore focused books and study resources designed to support concept building, practice and revision."
          action={
            <Link
              href="/books"
              className="inline-flex items-center gap-1.5 text-sm font-extrabold text-[#E13032] transition hover:text-[#B91C1C]"
            >
              Visit study store

              <ArrowRight
                className="h-4 w-4"
                aria-hidden="true"
              />
            </Link>
          }
        />

        {/* Category navigation */}
        <div className="mb-8 mt-8 overflow-x-auto pb-1 scrollbar-none">
          <div
            role="tablist"
            aria-label="Study material categories"
            className="flex min-w-max gap-2.5"
          >
            {MATERIAL_CATEGORIES.map(
              (category) => {
                const Icon = category.icon;
                const isActive =
                  category.id === activeCategory;

                return (
                  <button
                    key={category.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() =>
                      setActiveCategory(
                        category.id,
                      )
                    }
                    className={`group flex min-w-[205px] items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition-all duration-200 focus-visible:outline-2 focus-visible:outline-[#E13032] focus-visible:outline-offset-2 ${
                      isActive
                        ? "border-[#f1c2c3] bg-[#fff3f3] shadow-[0_6px_18px_rgba(225,48,50,0.07)]"
                        : "border-[#e2e7ed] bg-white hover:-translate-y-0.5 hover:border-red-100 hover:bg-[#fffafa] hover:shadow-[0_6px_18px_rgba(15,23,42,0.05)]"
                    }`}
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
                        isActive
                          ? "bg-[#E13032] text-white shadow-[0_6px_15px_rgba(225,48,50,0.18)]"
                          : "bg-[#f1f4f7] text-[#68788e] group-hover:bg-red-50 group-hover:text-[#E13032]"
                      }`}
                    >
                      <Icon
                        className="h-[18px] w-[18px]"
                        aria-hidden="true"
                      />
                    </span>

                    <span className="min-w-0">
                      <span
                        className={`block text-xs font-black ${
                          isActive
                            ? "text-[#E13032]"
                            : "text-slate-800"
                        }`}
                      >
                        {category.name}
                      </span>

                      <span className="mt-0.5 block text-[10px] font-medium text-slate-400">
                        {category.description}
                      </span>
                    </span>
                  </button>
                );
              },
            )}
          </div>
        </div>

        {/* Material cards */}
        <div
          key={activeCategory}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {displayedMaterials.map(
            (material) => (
              <MaterialCard
                key={material.id}
                material={material}
              />
            ),
          )}
        </div>

        {/* Bottom store CTA */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_5px_20px_rgba(15,23,42,0.04)] sm:flex-row sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <CheckCircle2
                className="h-5 w-5"
                aria-hidden="true"
              />
            </div>

            <div>
              <p className="text-sm font-extrabold text-slate-900">
                Quality learning material
              </p>

              <p className="mt-0.5 text-xs text-slate-400">
                Explore more books and preparation
                resources in the JobWay store.
              </p>
            </div>
          </div>

          <Link
            href="/books"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#171717] px-5 text-xs font-extrabold text-white transition hover:bg-[#2d2d2d] focus-visible:outline-2 focus-visible:outline-[#E13032] focus-visible:outline-offset-2"
          >
            Browse all books

            <ArrowRight
              className="h-3.5 w-3.5"
              aria-hidden="true"
            />
          </Link>
        </div>
      </Container>
    </section>
  );
}