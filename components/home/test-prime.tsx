"use client";

import Link from "next/link";

import "./test-prime.css";

const BENEFITS = [
  {
    icon: "/images/homepage-revamp/testprime/icon-mocktests.svg",
    title: "1.5 Lakh+ Mock Tests",
    description: "Covering SSC, Banking, UPSC, Railways & more",
  },
  {
    icon: "/images/homepage-revamp/testprime/icon-pyp.svg",
    title: "2,500+ Previous Year Papers",
    description: "Learn from previous year question papers",
  },
  {
    icon: "/images/homepage-revamp/testprime/icon-coverage.svg",
    title: "600+ Exam Coverage",
    description: "One subscription, every exam you're targeting",
  },
];

export function TestPrime() {
  return (
    <section
      className="jobway-testprime"
      data-testid="test-prime-banner"
      aria-labelledby="test-prime-heading"
    >
      {/* Subtle background grid */}
      <div
        className="jobway-testprime-grid"
        aria-hidden="true"
      />

      <div className="jobway-testprime-inner">
        {/* LEFT CONTENT */}
        <div className="jobway-testprime-content">
          {/* Test Prime wordmark */}
          <div className="jobway-testprime-wordmark">
            <span className="jobway-testprime-wordmark-text">
              Test
            </span>

            <img
              src="/images/homepage-revamp/testprime/prime-wordmark.svg"
              alt="Prime"
              className="jobway-testprime-wordmark-logo"
            />
          </div>

          {/* Main heading */}
          <h2
            id="test-prime-heading"
            className="jobway-testprime-title"
          >
            <span className="jobway-testprime-title-highlight">
              One Subscription,
            </span>
            <br />
            Every Mock Test You Need
          </h2>

          {/* Benefits */}
          <div className="jobway-testprime-benefits">
            {BENEFITS.map((benefit) => (
              <div
                key={benefit.title}
                className="jobway-testprime-benefit"
              >
                <span className="jobway-testprime-benefit-icon">
                  <img
                    src={benefit.icon}
                    alt=""
                    width={24}
                    height={24}
                  />
                </span>

                <div className="jobway-testprime-benefit-text">
                  <span className="jobway-testprime-benefit-title">
                    {benefit.title}
                  </span>

                  <span className="jobway-testprime-benefit-sub">
                    {benefit.description}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Link
            href="/test-series"
            className="jobway-testprime-cta"
            data-testid="test-prime-cta"
          >
            Explore Test Prime
          </Link>
        </div>

        {/* RIGHT IMAGE */}
        <div className="jobway-testprime-hero-wrap">
          <img
src="/images/homepage-revamp/testprime/hero-cluster.png"
alt="Test Prime — mock tests and exam preparation"
            className="jobway-testprime-hero"
            data-testid="tp-hero"
          />
        </div>
      </div>
    </section>
  );
}
