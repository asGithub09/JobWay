"use client";

import Link from "next/link";
import {
  ArrowRight,
  Building2,
  BriefcaseBusiness,
  GraduationCap,
  Laptop,
  Landmark,
  Scale,
  School,
  ShieldCheck,
  TrainFront,
  Trophy,
} from "lucide-react";
import { useState } from "react";

type CategoryId =
  | "government"
  | "college"
  | "private"
  | "upsc";

type CardData = {
  title: string;
  description: string;
  href: string;
  featured?: boolean;
  image?: string;
};

type CategoryData = {
  id: CategoryId;
  label: string;
  image?: string;
  cards: CardData[];
};

const CATEGORIES: CategoryData[] = [
  {
    id: "government",
    label: "Government Jobs",
    
    cards: [
      {
        title: "Banking Exams",
        description:
          "SBI â€¢ IBPS â€¢ RRB â€¢ RBI â€¢ NABARD â€¢ JAIIB â€¢ CAIIB Exams",
        href: "/exams?category=Banking%20Exams",
        featured: true,
        
      },
      {
        title: "SSC & Railway Exams",
        description:
          "SSC CGL â€¢ CHSL â€¢ Railways â€¢ Other SSC â€¢ Police Exams",
        href: "/exams?category=SSC%20%26%20Railway",
        featured: true,
        
      },
      {
        title: "Agri & Food Science",
        description:
          "IBPS AFO â€¢ FSSAI â€¢ FCI â€¢ ICAR UG/PG â€¢ ASRB NET â€¢ Semester",
        href: "/exams?category=Agri%20%26%20Food%20Science",
      },
      {
        title: "Engineering Exams",
        description:
          "SSC JE â€¢ RRB JE â€¢ GATE â€¢ State & Central JE/AE Exams",
        href: "/exams?category=Engineering",
      },
      {
        title: "State Exams",
        description:
          "State PSC â€¢ Other State Level Exams",
        href: "/exams?category=State%20Exams",
      },
      {
        title: "Teaching, UGC, CSIR",
        description:
          "UGC NET â€¢ TET â€¢ TGT â€¢ PGT â€¢ CSIR NET â€¢ GATE",
        href: "/exams?category=Teaching",
      },
      {
        title: "Nursing & Pharma Exams",
        description:
          "Nursing â€¢ PHARMA â€¢ Nursing Entrance",
        href: "/exams?category=Nursing%20%26%20Pharma",
      },
    ],
  },

  {
    id: "college",
    label: "College Entrance Exams",
    
    cards: [
      {
        title: "UG & PG Entrance Exams",
        description:
          "Class 11, 12 & CUET UG Science â€¢ Commerce â€¢ Humanities â€¢ CUET PG â€¢ LAW Entrance â€¢ NEET Counselling â€¢ Study Offline",
        href: "/exams?category=College%20Entrance",
        featured: true,
        
      },
    ],
  },

  {
    id: "private",
    label: "Private Jobs & Upskilling",
    
    cards: [
      {
        title: "Private Bank Jobs",
        description:
          "Axis Bank â€¢ Kotak Bank",
        href: "/search?searchTerm=Private%20Bank%20Jobs&primaryFilter=true",
        featured: true,
        
      },
      {
        title: "AI & Tech Jobs",
        description:
          "Data Analytics â€¢ Gen AI â€¢ Digital Marketing â€¢ Data Science â€¢ Full Stack Development â€¢ Business Analytics â€¢ Cyber Security",
        href: "/search?searchTerm=AI%20%26%20Tech%20Jobs&primaryFilter=true",
        featured: true,
        
      },
      {
        title: "Campus Programs",
        description:
          "Campus Programs",
        href: "/search?searchTerm=Campus%20Programs&primaryFilter=true",
      },
    ],
  },

  {
    id: "upsc",
    label: "UPSC, PSC & Judiciary",
    
    cards: [
      {
        title: "UPSC Civil Services",
        description:
          "UPSC CSE â€¢ IAS â€¢ Civil Services Examination â€¢ Prelims â€¢ Mains",
        href: "/exams?category=UPSC",
        featured: true,
        
      },
      {
        title: "State PSC Exams",
        description:
          "State PSC â€¢ PCS â€¢ State Civil Services â€¢ Government Recruitment",
        href: "/exams?category=State%20PSC",
        featured: true,
        
      },
      {
        title: "Judiciary Exams",
        description:
          "Judicial Services â€¢ Civil Judge â€¢ Law Entrance & Judiciary Preparation",
        href: "/exams?category=Judiciary",
      },
    ],
  },
];

const CATEGORY_STYLES: Record<
  CategoryId,
  {
    border: string;
    text: string;
    activeBackground: string;
    panelBackground: string;
    iconBackground: string;
    iconColor: string;
    tabBackground: string;
    accent: string;
  }
> = {
  government: {
    border: "border-[#ef4444]",
    text: "text-[#dc2626]",
    activeBackground: "bg-[#fff4f4]",
    panelBackground: "bg-[#fff8f8]",
    iconBackground: "bg-[#fff1f1]",
    iconColor: "text-[#ef4444]",
    tabBackground: "bg-[#fff7f7]",
    accent: "from-[#ff5a1f] to-[#d91663]",
  },

  college: {
    border: "border-[#f2a900]",
    text: "text-[#c47c00]",
    activeBackground: "bg-[#fff9e9]",
    panelBackground: "bg-[#fffbf1]",
    iconBackground: "bg-[#fff5dc]",
    iconColor: "text-[#e09a00]",
    tabBackground: "bg-[#fffaf0]",
    accent: "from-[#ff8a00] to-[#e32956]",
  },

  private: {
    border: "border-[#2479ef]",
    text: "text-[#1265d8]",
    activeBackground: "bg-[#f1f7ff]",
    panelBackground: "bg-[#f6faff]",
    iconBackground: "bg-[#eaf3ff]",
    iconColor: "text-[#1874eb]",
    tabBackground: "bg-[#f7fbff]",
    accent: "from-[#ff741f] to-[#dd185d]",
  },

  upsc: {
    border: "border-[#5269aa]",
    text: "text-[#344c8f]",
    activeBackground: "bg-[#f4f6fc]",
    panelBackground: "bg-[#f8f9fd]",
    iconBackground: "bg-[#eef1fa]",
    iconColor: "text-[#5269aa]",
    tabBackground: "bg-[#f6f8fc]",
    accent: "from-[#ff641f] to-[#d91c61]",
  },
};

function CategoryGlyph({
  category,
}: {
  category: CategoryId;
}) {
  if (category === "government") {
    return (
      <Landmark
        className="h-6 w-6"
        aria-hidden="true"
      />
    );
  }

  if (category === "college") {
    return (
      <GraduationCap
        className="h-6 w-6"
        aria-hidden="true"
      />
    );
  }

  if (category === "private") {
    return (
      <Laptop
        className="h-6 w-6"
        aria-hidden="true"
      />
    );
  }

  return (
    <Scale
      className="h-6 w-6"
      aria-hidden="true"
    />
  );
}

function CardGlyph({
  title,
}: {
  title: string;
}) {
  const normalized = title.toLowerCase();

  if (
    normalized.includes("bank") ||
    normalized.includes("ssc") ||
    normalized.includes("railway") ||
    normalized.includes("state")
  ) {
    return (
      <Landmark
        className="h-5 w-5"
        aria-hidden="true"
      />
    );
  }

  if (
    normalized.includes("college") ||
    normalized.includes("entrance")
  ) {
    return (
      <GraduationCap
        className="h-5 w-5"
        aria-hidden="true"
      />
    );
  }

  if (
    normalized.includes("engineering") ||
    normalized.includes("tech") ||
    normalized.includes("ai")
  ) {
    return (
      <Laptop
        className="h-5 w-5"
        aria-hidden="true"
      />
    );
  }

  if (
    normalized.includes("teaching") ||
    normalized.includes("ugc") ||
    normalized.includes("nursing")
  ) {
    return (
      <School
        className="h-5 w-5"
        aria-hidden="true"
      />
    );
  }

  if (
    normalized.includes("upsc") ||
    normalized.includes("judiciary") ||
    normalized.includes("psc")
  ) {
    return (
      <Trophy
        className="h-5 w-5"
        aria-hidden="true"
      />
    );
  }

  return (
    <Building2
      className="h-5 w-5"
      aria-hidden="true"
    />
  );
}

function CategoryTab({
  category,
  active,
  onClick,
}: {
  category: CategoryData;
  active: boolean;
  onClick: () => void;
}) {
  const styles = CATEGORY_STYLES[category.id];

  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      aria-controls="category-panel"
      onClick={onClick}
      className={[
        "group relative flex h-[121px] w-full items-center justify-between overflow-hidden rounded-[14px] border-2 px-5 text-left",
        "transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-4",
        "focus-visible:ring-slate-200",
        active
          ? `${styles.border} ${styles.activeBackground} ${styles.text} shadow-sm`
          : "border-transparent bg-white text-slate-700 hover:border-slate-200 hover:bg-slate-50 hover:shadow-sm",
      ].join(" ")}
    >
      <span
        className={[
          "relative z-10 max-w-[150px] text-[14px] font-semibold leading-[1.35]",
          "sm:text-[15px]",
          active ? styles.text : "text-slate-700",
        ].join(" ")}
      >
        {category.label}
      </span>

      <span
        className={[
          "relative z-10 flex h-[83px] w-[83px] shrink-0 items-center justify-center",
          "overflow-hidden rounded-full bg-white",
          "shadow-[0_2px_8px_rgba(15,23,42,0.08)]",
          "ring-1 ring-black/[0.04]",
        ].join(" ")}
      >
        <img
          src={category.image}
          alt=""
          width={83}
          height={83}
          className="h-[83px] w-[83px] object-contain"
          loading="eager"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
        <span
          className={[
            "absolute inset-0 -z-10 flex items-center justify-center",
            styles.iconBackground,
            styles.iconColor,
          ].join(" ")}
        >
          <CategoryGlyph category={category.id} />
        </span>
      </span>
    </button>
  );
}

function CardImage({
  card,
}: {
  card: CardData;
}) {
  const [failed, setFailed] = useState(false);

  if (!card.image || failed) {
    return (
      <div className="absolute bottom-0 right-0 h-[150px] w-[150px] overflow-hidden">
        <div className="absolute -bottom-10 -right-10 h-[160px] w-[160px] rounded-full bg-gradient-to-br from-red-50 via-orange-50 to-pink-100" />

        <div className="absolute bottom-5 right-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#ef4444] shadow-sm ring-1 ring-black/5">
          <CardGlyph title={card.title} />
        </div>
      </div>
    );
  }

  return (
    <img
      src={card.image}
      alt=""
      width={159}
      height={171}
      className="absolute bottom-0 right-0 z-10 h-[171px] w-[159px] object-contain object-bottom transition-transform duration-300 group-hover:scale-[1.03]"
      loading="eager"
      aria-hidden="true"
      onError={() => setFailed(true)}
    />
  );
}

function CategoryCard({
  card,
  category,
}: {
  card: CardData;
  category: CategoryId;
}) {
  const styles = CATEGORY_STYLES[category];

  return (
    <Link
      href={card.href}
      className={[
        "group relative flex min-w-0 overflow-hidden rounded-[12px]",
        "bg-white p-4",
        "transition-all duration-200",
        "hover:-translate-y-0.5",
        "hover:shadow-[0_8px_28px_rgba(15,23,42,0.09)]",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200",
        card.featured
          ? "min-h-[252px]"
          : "min-h-[156px]",
      ].join(" ")}
    >
      <div
        className={[
          "relative z-20 flex min-w-0 flex-1 flex-col",
          card.image
            ? "pr-[145px] sm:pr-[155px]"
            : "",
        ].join(" ")}
      >
        <div className="flex items-start gap-3">
          <span
            className={[
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px]",
              styles.iconBackground,
              styles.iconColor,
            ].join(" ")}
          >
            <CardGlyph title={card.title} />
          </span>

          <h3 className="pt-1 text-[17px] font-bold leading-[1.3] tracking-[-0.02em] text-[#121212] sm:text-[18px]">
            {card.title}
          </h3>
        </div>

        <p className="mt-4 max-w-[100%] text-[11px] leading-[1.65] text-[#667085] sm:text-[12px]">
          {card.description}
        </p>

        <span
          className={[
            "mt-auto inline-flex w-fit items-center gap-2",
            "text-[11px] font-semibold",
            "transition-all duration-200",
            card.featured
              ? `rounded-full bg-gradient-to-r ${styles.accent} px-4 py-2 text-white shadow-sm group-hover:gap-3`
              : `pt-5 text-[#111827] group-hover:${styles.text}`,
          ].join(" ")}
        >
          Explore Exams

          <ArrowRight
            className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </span>
      </div>

      {card.image ? (
        <CardImage card={card} />
      ) : null}
    </Link>
  );
}

function EmptyCategory({
  category,
}: {
  category: CategoryData;
}) {
  const styles = CATEGORY_STYLES[category.id];

  return (
    <div className="rounded-[12px] bg-white p-10 text-center">
      <div
        className={[
          "mx-auto flex h-14 w-14 items-center justify-center rounded-2xl",
          styles.iconBackground,
          styles.iconColor,
        ].join(" ")}
      >
        <CategoryGlyph category={category.id} />
      </div>

      <h3 className="mt-4 text-lg font-bold text-[#111827]">
        {category.label}
      </h3>

      <p className="mt-2 text-sm text-[#667085]">
        Preparation content will be available soon.
      </p>
    </div>
  );
}

export function ExamSelector() {
  const [activeCategory, setActiveCategory] =
    useState<CategoryId>("government");

  const selectedCategory =
    CATEGORIES.find(
      (category) =>
        category.id === activeCategory,
    ) ?? CATEGORIES[0];

  const featuredCards =
    selectedCategory.cards.filter(
      (card) => card.featured,
    );

  const regularCards =
    selectedCategory.cards.filter(
      (card) => !card.featured,
    );

  const styles =
    CATEGORY_STYLES[activeCategory];

  return (
    <section
      aria-labelledby="exam-selector-heading"
      className="relative w-full bg-white py-12 sm:py-14 lg:py-16"
    >
      <div className="mx-auto w-full max-w-[1120px] px-4 sm:px-6 lg:px-0">
        {/* Heading */}
        <h2
          id="exam-selector-heading"
          className="text-[28px] font-bold leading-[1.2] tracking-[-0.035em] text-[#111111] sm:text-[32px] lg:text-[34px]"
        >
          What are you preparing for?
        </h2>

        {/* Category area */}
        <div className="mt-7">
          {/* Tabs */}
          <div
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
            role="tablist"
            aria-label="Exam categories"
          >
            {CATEGORIES.map((category) => (
              <CategoryTab
                key={category.id}
                category={category}
                active={
                  category.id === activeCategory
                }
                onClick={() =>
                  setActiveCategory(category.id)
                }
              />
            ))}
          </div>

          {/* Active panel */}
          <div
            id="category-panel"
            role="tabpanel"
            aria-live="polite"
            className={[
              "mt-0 overflow-hidden rounded-b-[14px]",
              "border-2 border-t-0",
              styles.border,
              styles.panelBackground,
            ].join(" ")}
          >
            <div className="p-4 sm:p-5 lg:p-6">
              {featuredCards.length > 0 ? (
                <>
                  {/* Featured cards */}
                  <div
                    className={[
                      "grid gap-5",
                      featuredCards.length === 1
                        ? "grid-cols-1"
                        : "grid-cols-1 lg:grid-cols-2",
                    ].join(" ")}
                  >
                    {featuredCards.map((card) => (
                      <CategoryCard
                        key={card.title}
                        card={card}
                        category={activeCategory}
                      />
                    ))}
                  </div>

                  {/* Regular cards */}
                  {regularCards.length > 0 ? (
                    <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {regularCards.map((card) => (
                        <CategoryCard
                          key={card.title}
                          card={card}
                          category={activeCategory}
                        />
                      ))}
                    </div>
                  ) : null}
                </>
              ) : (
                <EmptyCategory
                  category={selectedCategory}
                />
              )}
            </div>
          </div>
        </div>

        {/* All exams */}
        <div className="mt-8 flex items-center justify-center">
          <Link
            href="/exams"
            className="group inline-flex items-center gap-2 text-[12px] font-semibold text-[#697586] transition-colors hover:text-[#E13032]"
          >
            <BriefcaseBusiness
              className="h-4 w-4 text-[#E13032]"
              aria-hidden="true"
            />

            Explore all exams and preparation

            <ArrowRight
              className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </div>

        {/* Accessibility / preload */}
        <div className="sr-only">
          <ShieldCheck aria-hidden="true" />
          <TrainFront aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}


