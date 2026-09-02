"use client";

import Link from "next/link";
import React from "react";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  ChevronRight,
  GraduationCap,
  Landmark,
  ShieldCheck,
  Target,
  TestTube2,
  Users,
} from "lucide-react";

type MegaMenuId = "government" | "college" | "private" | "upsc";

type MegaCategory = {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
};

type MegaSubCategory = {
  id: string;
  label: string;
};

type ExamItem = {
  id: string;
  name: string;
  logo: string;
};

type DesktopNavigationProps = {
  activeCategory?: string;
  activeMegaMenu?: MegaMenuId | null;
  onMegaMenuOpen?: (menu: MegaMenuId) => void;
  onMegaMenuClose?: () => void;
  onMegaMenuHoverEnter?: () => void;
  onMegaMenuHoverLeave?: () => void;
};

const GOVERNMENT_CATEGORIES: MegaCategory[] = [
  {
    id: "banking",
    label: "Banking Exams",
    icon: BriefcaseBusiness,
  },
  {
    id: "ssc-railway",
    label: "SSC & Railway",
    icon: Target,
  },
  {
    id: "teaching",
    label: "Teaching Exams",
    icon: GraduationCap,
  },
  {
    id: "engineering",
    label: "Engineering Exams",
    icon: TestTube2,
  },
  {
    id: "agri-food",
    label: "Agriculture & Food",
    icon: Building2,
  },
];

const GOVERNMENT_SUB_CATEGORIES: Record<
  string,
  MegaSubCategory[]
> = {
  banking: [
    { id: "banking", label: "Banking Exams" },
    { id: "sbi", label: "SBI Exams" },
    { id: "ibps", label: "IBPS Exams" },
    { id: "rbi", label: "RBI & Regulatory Exams" },
    { id: "insurance", label: "Insurance Exams" },
  ],

  "ssc-railway": [
    { id: "ssc", label: "SSC Exams" },
    { id: "ssc-cgl", label: "SSC CGL" },
    { id: "ssc-chsl", label: "SSC CHSL" },
    { id: "railway", label: "Railway Exams" },
    { id: "rrb-ntpc", label: "RRB NTPC" },
    { id: "rrb-group-d", label: "RRB Group D" },
  ],

  teaching: [
    { id: "teaching", label: "Teaching Exams" },
    { id: "ctet", label: "CTET" },
    { id: "tet", label: "State TET" },
    { id: "kvs", label: "KVS" },
    { id: "nvs", label: "NVS" },
  ],

  engineering: [
    { id: "gate", label: "GATE" },
    { id: "ssc-je", label: "SSC JE" },
    { id: "rrb-je", label: "RRB JE" },
    { id: "ese", label: "Engineering Services" },
  ],

  "agri-food": [
    { id: "icar", label: "ICAR" },
    { id: "nabard", label: "NABARD" },
    { id: "fci", label: "FCI" },
    { id: "agriculture-exams", label: "Agriculture Exams" },
  ],
};

const GOVERNMENT_EXAMS: Record<string, ExamItem[]> = {
  banking: [
    { id: "sbi-po", name: "SBI PO", logo: "S" },
    { id: "sbi-clerk", name: "SBI Clerk", logo: "S" },
    { id: "ibps-po", name: "IBPS PO", logo: "I" },
    { id: "ibps-clerk", name: "IBPS Clerk", logo: "I" },
    { id: "rbi-grade-b", name: "RBI Grade B", logo: "R" },
    { id: "nabard-grade-a", name: "NABARD Grade A", logo: "N" },
    { id: "insurance", name: "Insurance Exams", logo: "I" },
    {
      id: "banking-foundation",
      name: "Banking Foundation",
      logo: "B",
    },
  ],

  "ssc-railway": [
    { id: "ssc-cgl", name: "SSC CGL", logo: "C" },
    { id: "ssc-chsl", name: "SSC CHSL", logo: "C" },
    { id: "ssc-mts", name: "SSC MTS", logo: "M" },
    { id: "ssc-gd", name: "SSC GD", logo: "G" },
    { id: "rrb-ntpc", name: "RRB NTPC", logo: "N" },
    { id: "rrb-group-d", name: "RRB Group D", logo: "R" },
    { id: "rrb-alp", name: "RRB ALP", logo: "A" },
    {
      id: "railway-foundation",
      name: "Railway Foundation",
      logo: "R",
    },
  ],

  teaching: [
    { id: "ctet", name: "CTET", logo: "C" },
    { id: "uptet", name: "UPTET", logo: "U" },
    { id: "reet", name: "REET", logo: "R" },
    { id: "csir-net", name: "CSIR NET", logo: "C" },
    { id: "kvs", name: "KVS", logo: "K" },
    { id: "nvs", name: "NVS", logo: "N" },
    { id: "dsssb", name: "DSSSB", logo: "D" },
  ],

  engineering: [
    { id: "gate", name: "GATE", logo: "G" },
    { id: "ssc-je", name: "SSC JE", logo: "J" },
    { id: "rrb-je", name: "RRB JE", logo: "R" },
    {
      id: "ese",
      name: "Engineering Services",
      logo: "E",
    },
  ],

  "agri-food": [
    { id: "icar", name: "ICAR", logo: "I" },
    { id: "nabard", name: "NABARD", logo: "N" },
    { id: "fci", name: "FCI", logo: "F" },
    {
      id: "agriculture-exams",
      name: "Agriculture Exams",
      logo: "A",
    },
  ],
};

const COLLEGE_CATEGORIES: MegaCategory[] = [
  {
    id: "ug-pg",
    label: "UG & PG Entrance Exams",
    icon: Landmark,
  },
];

const COLLEGE_SUB_CATEGORIES: Record<
  string,
  MegaSubCategory[]
> = {
  "ug-pg": [
    {
      id: "cuet-science",
      label: "Class 11, 12 & CUET UG Science",
    },
    {
      id: "cuet-commerce",
      label: "Class 11, 12 & CUET UG Commerce",
    },
    {
      id: "cuet-humanities",
      label: "Class 11, 12 & CUET UG Humanities",
    },
    {
      id: "cuet-hindi",
      label: "CUET UG Hindi Medium",
    },
    {
      id: "cuet-pg",
      label: "CUET PG",
    },
    {
      id: "law",
      label: "LAW Entrance (5yr & 3yr LLB)",
    },
  ],
};

const COLLEGE_EXAMS: Record<string, ExamItem[]> = {
  "ug-pg": [
    {
      id: "cuet-maha-pack",
      name: "CUET MAHA PACK",
      logo: "C",
    },
    {
      id: "cuet-science",
      name: "CUET SCIENCE",
      logo: "C",
    },
    {
      id: "cuet-commerce",
      name: "CUET COMMERCE",
      logo: "C",
    },
    {
      id: "cuet-arts",
      name: "CUET Arts",
      logo: "C",
    },
    {
      id: "cuet-language",
      name: "CUET LANGUAGE AND GENERAL TEST",
      logo: "C",
    },
    {
      id: "ug-career",
      name: "UG Career Guidance",
      logo: "G",
    },
    {
      id: "class-11-science",
      name: "Class 11th Science",
      logo: "A",
    },
    {
      id: "upsc-foundation",
      name: "UPSC Foundation",
      logo: "A",
    },
    {
      id: "ncet-science",
      name: "NCET Science",
      logo: "A",
    },
  ],
};

const PRIVATE_CATEGORIES: MegaCategory[] = [
  {
    id: "ai-tech",
    label: "AI & Tech Jobs",
    icon: Users,
  },
  {
    id: "private-bank",
    label: "Private Bank Jobs",
    icon: Users,
  },
  {
    id: "campus",
    label: "Campus Programs",
    icon: Users,
  },
];

const PRIVATE_SUB_CATEGORIES: Record<
  string,
  MegaSubCategory[]
> = {
  "ai-tech": [
    {
      id: "data-analytics",
      label: "Data Analytics",
    },
    {
      id: "gen-ai",
      label: "Gen AI",
    },
    {
      id: "digital-marketing",
      label: "Digital Marketing",
    },
    {
      id: "data-science",
      label: "Data Science",
    },
    {
      id: "full-stack",
      label: "Full Stack Development",
    },
    {
      id: "business-analytics",
      label: "Business Analytics",
    },
    {
      id: "cyber-security",
      label: "Cyber Security",
    },
  ],

  "private-bank": [
    {
      id: "private-banking",
      label: "Private Banking Careers",
    },
    {
      id: "sales",
      label: "Banking Sales Programs",
    },
    {
      id: "relationship-manager",
      label: "Relationship Manager",
    },
  ],

  campus: [
    {
      id: "campus-placement",
      label: "Campus Placement",
    },
    {
      id: "graduate-programs",
      label: "Graduate Programs",
    },
    {
      id: "career-readiness",
      label: "Career Readiness",
    },
  ],
};

const PRIVATE_EXAMS: Record<string, ExamItem[]> = {
  "ai-tech": [
    {
      id: "ibm-data-analytics",
      name: "IBM Certified Data Analytics",
      logo: "A",
    },
    {
      id: "ibm-self-paced",
      name: "Self Paced Data-Analytics",
      logo: "IBM",
    },
    {
      id: "prepup",
      name: "PrepUp",
      logo: "P",
    },
    {
      id: "adda-skills-giveaway",
      name: "Adda247 Skills Giveaway",
      logo: "S",
    },
  ],

  "private-bank": [
    {
      id: "private-bank-career",
      name: "Private Bank Career",
      logo: "B",
    },
    {
      id: "banking-sales",
      name: "Banking Sales",
      logo: "B",
    },
    {
      id: "banking-professional",
      name: "Banking Professional",
      logo: "B",
    },
  ],

  campus: [
    {
      id: "campus-placement",
      name: "Campus Placement",
      logo: "C",
    },
    {
      id: "graduate-career",
      name: "Graduate Career",
      logo: "G",
    },
    {
      id: "career-ready",
      name: "Career Ready",
      logo: "R",
    },
  ],
};

const UPSC_CATEGORIES: MegaCategory[] = [
  {
    id: "upsc",
    label: "UPSC & Civil Services",
    icon: ShieldCheck,
  },
  {
    id: "state-psc",
    label: "State PSC",
    icon: Landmark,
  },
  {
    id: "judiciary",
    label: "Judiciary Exams",
    icon: BookOpen,
  },
];

const UPSC_SUB_CATEGORIES: Record<
  string,
  MegaSubCategory[]
> = {
  upsc: [
    {
      id: "upsc-cse",
      label: "UPSC Civil Services",
    },
    {
      id: "upsc-foundation",
      label: "UPSC Foundation",
    },
    {
      id: "upsc-optional",
      label: "UPSC Optional Subjects",
    },
    {
      id: "upsc-csat",
      label: "UPSC CSAT",
    },
  ],

  "state-psc": [
    {
      id: "uppsc",
      label: "UPPSC",
    },
    {
      id: "bpsc",
      label: "BPSC",
    },
    {
      id: "mppsc",
      label: "MPPSC",
    },
    {
      id: "rpsc",
      label: "RPSC",
    },
  ],

  judiciary: [
    {
      id: "judiciary-foundation",
      label: "Judiciary Foundation",
    },
    {
      id: "judiciary-prelims",
      label: "Judiciary Prelims",
    },
    {
      id: "judiciary-mains",
      label: "Judiciary Mains",
    },
  ],
};

const UPSC_EXAMS: Record<string, ExamItem[]> = {
  upsc: [
    {
      id: "upsc-cse",
      name: "UPSC Civil Services",
      logo: "U",
    },
    {
      id: "upsc-foundation",
      name: "UPSC Foundation",
      logo: "U",
    },
    {
      id: "upsc-csat",
      name: "UPSC CSAT",
      logo: "C",
    },
    {
      id: "upsc-optional",
      name: "UPSC Optional",
      logo: "O",
    },
    {
      id: "upsc-epfo",
      name: "UPSC EPFO",
      logo: "E",
    },
    {
      id: "upsc-capf",
      name: "UPSC CAPF",
      logo: "C",
    },
  ],

  "state-psc": [
    {
      id: "uppsc",
      name: "UPPSC",
      logo: "U",
    },
    {
      id: "bpsc",
      name: "BPSC",
      logo: "B",
    },
    {
      id: "mppsc",
      name: "MPPSC",
      logo: "M",
    },
    {
      id: "rpsc",
      name: "RPSC",
      logo: "R",
    },
  ],

  judiciary: [
    {
      id: "judiciary-foundation",
      name: "Judiciary Foundation",
      logo: "J",
    },
    {
      id: "judiciary-prelims",
      name: "Judiciary Prelims",
      logo: "P",
    },
    {
      id: "judiciary-mains",
      name: "Judiciary Mains",
      logo: "M",
    },
  ],
};

function ExamLogo({
  value,
}: {
  value: string;
}) {
  return (
    <span
      aria-hidden="true"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-1 text-[11px] font-black text-[#E13032] transition-all duration-200 group-hover:border-red-100 group-hover:bg-red-50"
    >
      {value}
    </span>
  );
}

function getMenuData(menu: MegaMenuId) {
  if (menu === "college") {
    return {
      categories: COLLEGE_CATEGORIES,
      subCategories: COLLEGE_SUB_CATEGORIES,
      exams: COLLEGE_EXAMS,
      defaultCategory: "ug-pg",
    };
  }

  if (menu === "private") {
    return {
      categories: PRIVATE_CATEGORIES,
      subCategories: PRIVATE_SUB_CATEGORIES,
      exams: PRIVATE_EXAMS,
      defaultCategory: "ai-tech",
    };
  }

  if (menu === "upsc") {
    return {
      categories: UPSC_CATEGORIES,
      subCategories: UPSC_SUB_CATEGORIES,
      exams: UPSC_EXAMS,
      defaultCategory: "upsc",
    };
  }

  return {
    categories: GOVERNMENT_CATEGORIES,
    subCategories: GOVERNMENT_SUB_CATEGORIES,
    exams: GOVERNMENT_EXAMS,
    defaultCategory: "banking",
  };
}

function getMenuTitle(menu: MegaMenuId) {
  switch (menu) {
    case "college":
      return "College Entrance Exams";

    case "private":
      return "Private Jobs & Upskilling";

    case "upsc":
      return "UPSC, PSC & Judiciary";

    default:
      return "Government Jobs";
  }
}

function getMenuHref(
  menu: MegaMenuId,
  category: string,
) {
  switch (menu) {
    case "college":
      return `/exams/college-entrance/${category}`;

    case "private":
      return `/private-jobs/${category}`;

    case "upsc":
      return `/exams/upsc-state-psc/${category}`;

    default:
      return `/exams/${category}`;
  }
}

function getExamHref(
  menu: MegaMenuId,
  category: string,
  exam: string,
) {
  switch (menu) {
    case "college":
      return `/exams/college-entrance/${category}/${exam}`;

    case "private":
      return `/private-jobs/${category}/${exam}`;

    case "upsc":
      return `/exams/upsc-state-psc/${category}/${exam}`;

    default:
      return `/exams/${category}/${exam}`;
  }
}

export function DesktopNavigation({
  activeMegaMenu,
  onMegaMenuClose,
  onMegaMenuHoverEnter,
  onMegaMenuHoverLeave,
}: DesktopNavigationProps) {
  const handleMegaMenuClose =
    onMegaMenuClose ?? (() => undefined);

  const handleMegaMenuHoverEnter =
    onMegaMenuHoverEnter ?? (() => undefined);

  const handleMegaMenuHoverLeave =
    onMegaMenuHoverLeave ?? (() => undefined);

  const menuData = activeMegaMenu
    ? getMenuData(activeMegaMenu)
    : getMenuData("government");

  const [selectedCategory, setSelectedCategory] =
    React.useState(menuData.defaultCategory);

  const [selectedSubCategory, setSelectedSubCategory] =
    React.useState(
      menuData.subCategories[
        menuData.defaultCategory
      ]?.[0]?.id ?? "",
    );

  React.useEffect(() => {
    if (!activeMegaMenu) {
      return;
    }

    const nextData = getMenuData(activeMegaMenu);
    const nextCategory = nextData.defaultCategory;

    setSelectedCategory(nextCategory);

    setSelectedSubCategory(
      nextData.subCategories[nextCategory]?.[0]?.id ??
        "",
    );
  }, [activeMegaMenu]);

  const currentSubCategories =
    menuData.subCategories[selectedCategory] ?? [];

  const currentExams =
    menuData.exams[selectedCategory] ?? [];

  const handleCategoryChange = (
    categoryId: string,
  ) => {
    setSelectedCategory(categoryId);

    setSelectedSubCategory(
      menuData.subCategories[categoryId]?.[0]?.id ??
        "",
    );
  };

  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-full z-[80] hidden lg:block"
      onMouseEnter={handleMegaMenuHoverEnter}
      onMouseLeave={handleMegaMenuHoverLeave}
    >
      {/* Mega menu */}
      <div
        data-jobway-mega-panel
        aria-hidden={!activeMegaMenu}
        onMouseEnter={handleMegaMenuHoverEnter}
        onMouseLeave={handleMegaMenuHoverLeave}
        className={`pointer-events-auto absolute left-1/2 top-2 z-[80] w-[min(1180px,calc(100vw-32px))] -translate-x-1/2 overflow-hidden rounded-[18px] border border-slate-200/90 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.16),0_4px_14px_rgba(15,23,42,0.06)] transition-all duration-200 ease-out ${
          activeMegaMenu
            ? "visible translate-y-0 opacity-100"
            : "pointer-events-none invisible -translate-y-1.5 opacity-0"
        }`}
      >
        {/* Overlay */}
        <div
          className={`fixed inset-x-0 top-0 -z-10 h-screen bg-slate-950/20 backdrop-blur-[1px] transition-opacity duration-200 ${
            activeMegaMenu
              ? "opacity-100"
              : "pointer-events-none opacity-0"
          }`}
          onMouseDown={handleMegaMenuClose}
          aria-hidden="true"
        />

        <div className="grid max-h-[500px] min-h-[470px] grid-cols-[238px_300px_minmax(0,1fr)]">
          {/* Left column */}
          <div className="overflow-y-auto border-r border-slate-200/80 bg-slate-50/70 p-4 scrollbar-thin">
            <div className="mb-4 border-b border-slate-200/80 px-2 pb-3.5">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#E13032]">
                {getMenuTitle(
                  activeMegaMenu ?? "government",
                )}
              </p>

              <p className="mt-1 text-[11px] font-medium text-slate-500">
                Choose an exam category
              </p>
            </div>

            <div className="space-y-1">
              {menuData.categories.map((category) => {
                const Icon = category.icon;
                const selected =
                  selectedCategory === category.id;

                return (
                  <button
                    key={category.id}
                    type="button"
                    onMouseEnter={() =>
                      handleCategoryChange(category.id)
                    }
                    onFocus={() =>
                      handleCategoryChange(category.id)
                    }
                    onClick={() =>
                      handleCategoryChange(category.id)
                    }
                    className={`group flex w-full items-center gap-2.5 rounded-xl border px-3 py-3 text-left transition-all duration-150 ${
                      selected
                        ? "border-red-100 bg-white text-[#E13032] shadow-[0_2px_8px_rgba(15,23,42,0.05)]"
                        : "border-transparent text-slate-800 hover:border-slate-200/80 hover:bg-white"
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-150 ${
                        selected
                          ? "bg-[#E13032] text-white shadow-sm"
                          : "bg-white text-slate-400 group-hover:bg-red-50 group-hover:text-[#E13032]"
                      }`}
                    >
                      <Icon
                        className="h-4 w-4"
                        aria-hidden="true"
                      />
                    </span>

                    <span className="min-w-0 flex-1 text-[13px] font-semibold">
                      {category.label}
                    </span>

                    <ChevronRight
                      className={`h-3.5 w-3.5 shrink-0 transition-all duration-150 ${
                        selected
                          ? "translate-x-0.5 text-[#E13032]"
                          : "text-slate-300 group-hover:translate-x-0.5 group-hover:text-slate-500"
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Middle column */}
          <div className="overflow-y-auto border-r border-slate-200/80 bg-white p-5 scrollbar-thin">
            <div className="mb-5">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                Explore
              </p>

              <h3 className="mt-1 text-[18px] font-black tracking-tight text-slate-950">
                {
                  menuData.categories.find(
                    (item) =>
                      item.id === selectedCategory,
                  )?.label
                }
              </h3>
            </div>

            <div className="space-y-1">
              {currentSubCategories.map(
                (subcategory) => {
                  const selected =
                    selectedSubCategory ===
                    subcategory.id;

                  return (
                    <button
                      key={subcategory.id}
                      type="button"
                      onMouseEnter={() =>
                        setSelectedSubCategory(
                          subcategory.id,
                        )
                      }
                      onFocus={() =>
                        setSelectedSubCategory(
                          subcategory.id,
                        )
                      }
                      onClick={() =>
                        setSelectedSubCategory(
                          subcategory.id,
                        )
                      }
                      className={`group flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-all duration-150 ${
                        selected
                          ? "border-red-100 bg-red-50 text-[#E13032]"
                          : "border-transparent text-slate-700 hover:border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <span className="pr-2 text-[13px] font-semibold leading-5">
                        {subcategory.label}
                      </span>

                      <ChevronRight
                        className={`h-3.5 w-3.5 shrink-0 transition-transform duration-150 ${
                          selected
                            ? "translate-x-0.5 text-[#E13032]"
                            : "text-slate-300 group-hover:translate-x-0.5 group-hover:text-slate-500"
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  );
                },
              )}
            </div>

            <Link
              href={getMenuHref(
                activeMegaMenu ?? "government",
                selectedCategory,
              )}
              onClick={handleMegaMenuClose}
              className="mt-5 flex items-center justify-between rounded-lg bg-slate-50 px-3.5 py-2.5 text-[11px] font-bold text-slate-700 transition-all duration-200 hover:bg-red-50 hover:text-[#E13032]"
            >
              <span>View all exams</span>

              <ArrowRight
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />
            </Link>
          </div>

          {/* Right column */}
          <div className="min-w-0 overflow-y-auto bg-white p-6 scrollbar-thin">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                  Popular exams
                </p>

                <h3 className="mt-1 text-[18px] font-black tracking-tight text-slate-950">
                  Prepare with JobWay
                </h3>
              </div>

              <Link
                href={getMenuHref(
                  activeMegaMenu ?? "government",
                  selectedCategory,
                )}
                onClick={handleMegaMenuClose}
                className="hidden items-center gap-1 text-[11px] font-bold text-[#E13032] transition hover:gap-1.5 sm:inline-flex"
              >
                View all

                <ArrowRight
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-3 xl:grid-cols-4">
              {currentExams.map((exam) => (
                <Link
                  key={exam.id}
                  href={getExamHref(
                    activeMegaMenu ?? "government",
                    selectedCategory,
                    exam.id,
                  )}
                  onClick={handleMegaMenuClose}
                  className="group flex min-h-[100px] flex-col items-center justify-center rounded-xl border border-slate-200/90 bg-white p-3 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-red-200 hover:bg-red-50/40 hover:shadow-[0_8px_22px_rgba(15,23,42,0.07)]"
                >
                  <ExamLogo value={exam.logo} />

                  <span className="mt-2.5 line-clamp-2 text-[11px] font-bold leading-4.5 text-slate-700 transition-colors duration-200 group-hover:text-slate-950">
                    {exam.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}