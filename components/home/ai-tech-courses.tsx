"use client";
import "./ai-tech-courses.css";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

type Program = {
  title: string;
  icon: string;
  poweredBy: string;
  stats: {
    value: string;
    label: string;
  }[];
  href: string;
};

const partnerLogos = [
  "https://cdn013.adda247.com/a950a430-9ee3-471b-bf5c-a3daeea18075.png",
  "https://cdn013.adda247.com/599390ac-3fa2-460f-8c42-4e079613ff0f.png",
  "https://cdn013.adda247.com/d15232c8-6b6f-4f18-a398-3cf4bb5b7697.png",
  "https://cdn013.adda247.com/86bc49d0-21fb-4d86-861d-bd7bb8b2dcd1.png",
  "https://cdn013.adda247.com/a1d93223-c4ea-4548-96e3-2c929739a7c9.png",
  "https://cdn013.adda247.com/38ecc550-6e24-4081-bd9f-6b6b8a799c88.png",
];

const hiringLogos = [
  "https://cdn013.adda247.com/b467a51e-32bb-4ca1-a997-9137589b17ab.png",
  "https://cdn013.adda247.com/87bdad37-5f49-4301-a978-fcfed8d08cc4.png",
  "https://cdn013.adda247.com/36028796-d686-44c9-b881-648a74f58407.png",
  "https://cdn013.adda247.com/721bdccf-6ece-471a-bd03-57d63f580994.png",
  "https://cdn013.adda247.com/e81c367c-93d4-4a77-b013-ce12ec3f6d36.png",
  "https://cdn013.adda247.com/c5bf665c-9d40-4280-8a51-25945daf3ce5.png",
  "https://cdn013.adda247.com/1814dcc6-51e7-44a5-bfe1-492b8c70b8fd.png",
  "https://cdn013.adda247.com/aa328867-dd7f-46ea-8188-562b027eb26b.png",
  "https://cdn013.adda247.com/d04fb65e-8c17-46e1-8537-7bb616c84b20.png",
  "https://cdn013.adda247.com/8699fb9a-57a4-4f28-a061-4177a60a228a.png",
];

const programs: Program[] = [
  {
    title: "Data Analytics with GenAI",
    icon:
      "https://cdn013.adda247.com/61544a46-5103-4d7f-9bcd-ec22c4dc077f.png",
    poweredBy:
      "https://cdn013.adda247.com/0af90fdb-081d-47f6-9e96-db363c7e1be0.png",
    stats: [
      { value: "6 Mon", label: "Live Class" },
      { value: "5.6 LPA", label: "Avg. Salary" },
      { value: "3-5", label: "Interviews" },
    ],
    href: "#",
  },
  {
    title: "Business Analyst with Google Cloud",
    icon:
      "https://cdn013.adda247.com/3e25494d-a4da-4709-97db-57a618a54540.png",
    poweredBy:
      "https://cdn013.adda247.com/09703f3f-b465-4510-9fdb-a3de9c4fd045.png",
    stats: [
      { value: "6 Mon", label: "Live Class" },
      { value: "12 LPA", label: "Highest Package" },
      { value: "12/08", label: "Next Batch" },
    ],
    href: "#",
  },
  {
    title: "Data Science with GenAI",
    icon:
      "https://cdn013.adda247.com/f78a8895-b35e-4c52-bc11-1c0c5fab7596.png",
    poweredBy:
      "https://cdn013.adda247.com/2fa4362a-6a59-414e-a724-9db00a7d635b.png",
    stats: [
      { value: "6 Mon", label: "Live Class" },
      { value: "6.3 LPA", label: "Avg. Salary" },
      { value: "5 Seats", label: "Left" },
    ],
    href: "#",
  },
  {
    title: "Priority Banking Program",
    icon:
      "https://cdn013.adda247.com/645ddb4a-2561-400a-afa0-43bcc812c058.png",
    poweredBy:
      "https://cdn013.adda247.com/7ef37f10-8e9c-4252-8155-e61236fc085f.png",
    stats: [
      { value: "6.3 LPA", label: "Starting Salary" },
      { value: "23 - 30", label: "Age" },
      { value: "100%", label: "Placement Rate" },
    ],
    href: "#",
  },
];

function LogoMarquee({
  logos,
  reverse = false,
}: {
  logos: string[];
  reverse?: boolean;
}) {
  const duplicated = [...logos, ...logos];

  return (
    <div className="jobway-logo-marquee">
      <div
        className={`jobway-logo-marquee-track ${
          reverse ? "jobway-logo-marquee-track-reverse" : ""
        }`}
      >
        {duplicated.map((logo, index) => (
          <div
            className="jobway-logo-item"
            key={`${logo}-${index}`}
          >
            <img
              src={logo}
              alt=""
              loading="eager"
              draggable={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AiTechCourses() {
  const [activeIndex, setActiveIndex] = useState(0);

  const previous = () => {
    setActiveIndex((current) =>
      current === 0
        ? programs.length - 1
        : current - 1,
    );
  };

  const next = () => {
    setActiveIndex((current) =>
      current === programs.length - 1
        ? 0
        : current + 1,
    );
  };

  const visiblePrograms = [
    programs[activeIndex],
    programs[(activeIndex + 1) % programs.length],
    programs[(activeIndex + 2) % programs.length],
  ];

  return (
    <section className="jobway-ai-tech-section">
      <div className="jobway-ai-tech-container">

        {/* Heading + partnerships */}
        <div className="jobway-ai-tech-header">
          <h2 className="jobway-ai-tech-heading">
            <strong>AI Tech Certification &amp; Banking</strong>{" "}
            Jobs Courses
          </h2>

          <div className="jobway-partners">
            <span className="jobway-partners-label">
              In Partnership with:
            </span>

            <LogoMarquee logos={partnerLogos} />
          </div>
        </div>

        {/* Course carousel */}
        <div className="jobway-program-carousel">
          <div className="jobway-program-grid">
            {visiblePrograms.map((program, index) => (
              <article
                className="jobway-program-card"
                key={`${program.title}-${index}`}
              >
                <div className="jobway-program-card-head">
                  <span className="jobway-program-icon">
                    <img
                      src={program.icon}
                      alt=""
                      width={24}
                      height={24}
                    />
                  </span>

                  <span className="jobway-powered">
                    <span>Powered By</span>

                    <img
                      src={program.poweredBy}
                      alt=""
                    />
                  </span>
                </div>

                <h3>{program.title}</h3>

                <span className="jobway-card-separator" />

                <div className="jobway-program-stats">
                  {program.stats.map((stat) => (
                    <div
                      className="jobway-program-stat"
                      key={stat.label}
                    >
                      <strong>{stat.value}</strong>
                      <span>{stat.label}</span>
                    </div>
                  ))}
                </div>

                <a
                  href={program.href}
                  className="jobway-program-cta"
                >
                  Know More
                </a>
              </article>
            ))}
          </div>

          <div className="jobway-program-navigation">
            <button
              type="button"
              onClick={previous}
              aria-label="Previous program"
            >
              <ArrowLeft />
            </button>

            <button
              type="button"
              onClick={next}
              aria-label="Next program"
            >
              <ArrowRight />
            </button>
          </div>
        </div>

        {/* Dots */}
        <div className="jobway-program-dots">
          {programs.map((program, index) => (
            <button
              key={program.title}
              type="button"
              aria-label={`Go to program ${index + 1}`}
              onClick={() => setActiveIndex(index)}
              className={
                index === activeIndex
                  ? "active"
                  : ""
              }
            />
          ))}
        </div>

        {/* Hiring */}
        <div className="jobway-hiring">
          <h2>
            Top companies hiring our graduates
          </h2>

          <LogoMarquee
            logos={hiringLogos}
            reverse
          />
        </div>
      </div>
    </section>
  );
}
