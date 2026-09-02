import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Mail,
  MapPin,
  Phone,
  PlayCircle,
  Send,
} from "lucide-react";

import { Container } from "@/components/shared/container";
import { BrandLogo } from "@/components/shared/brand-logo";

type FooterLink = {
  label: string;
  href: string;
};

type SocialLink = {
  label: string;
  shortLabel: string;
  href: string;
};

const EXAM_LINKS: FooterLink[] = [
  { label: "Banking Exams", href: "/exams/banking" },
  { label: "SSC & Railway", href: "/exams/ssc-railway" },
  { label: "UPSC & State PSC", href: "/exams/upsc-state-psc" },
  { label: "Teaching Exams", href: "/exams/teaching" },
  { label: "Engineering Exams", href: "/exams/engineering" },
  { label: "Private Jobs & Skilling", href: "/exams/private-skilling" },
];

const LEARNING_LINKS: FooterLink[] = [
  { label: "Online Courses", href: "/courses" },
  { label: "Test Series", href: "/test-series" },
  { label: "Mock Tests", href: "/mock-tests" },
  { label: "Study Material", href: "/books" },
  { label: "Current Affairs", href: "/current-affairs" },
  { label: "Free Resources", href: "/free-resources" },
];

const COMPANY_LINKS: FooterLink[] = [
  { label: "About JobWay", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "Careers", href: "/careers" },
  { label: "Help Center", href: "/help" },
  { label: "Download App", href: "/download-app" },
  { label: "Sitemap", href: "/sitemap" },
];

const LEGAL_LINKS: FooterLink[] = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Use", href: "/terms" },
  { label: "Refund Policy", href: "/refund-policy" },
];

const SOCIAL_LINKS: SocialLink[] = [
  {
    label: "JobWay on Facebook",
    shortLabel: "f",
    href: "/social/facebook",
  },
  {
    label: "JobWay on Instagram",
    shortLabel: "ig",
    href: "/social/instagram",
  },
  {
    label: "JobWay on YouTube",
    shortLabel: "yt",
    href: "/social/youtube",
  },
  {
    label: "JobWay on LinkedIn",
    shortLabel: "in",
    href: "/social/linkedin",
  },
  {
    label: "JobWay on X",
    shortLabel: "x",
    href: "/social/x",
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-slate-950 text-white">
      <Container size="wide">
        {/* Main footer */}
        <div className="grid gap-10 py-12 sm:py-14 lg:grid-cols-[1.35fr_1fr_1fr_1fr] lg:gap-12 lg:py-16">
          {/* Brand / Contact */}
          <div className="max-w-sm">
            <BrandLogo
              href="/"
              showTagline
              className="[&>span:last-child>span:first-child]:text-white"
            />

            <p className="mt-5 text-sm leading-6 text-slate-400">
              JobWay is built to bring courses, mock tests, study material,
              current affairs and practical preparation resources together in
              one learning platform.
            </p>

            <div className="mt-6 space-y-3">
              <Link
                href="/contact"
                className="flex items-center gap-3 text-xs font-semibold text-slate-400 transition hover:text-white"
              >
                <MapPin
                  className="h-4 w-4 shrink-0 text-[#E13032]"
                  aria-hidden="true"
                />
                <span>India</span>
              </Link>

              <Link
                href="tel:+919999999999"
                className="flex items-center gap-3 text-xs font-semibold text-slate-400 transition hover:text-white"
              >
                <Phone
                  className="h-4 w-4 shrink-0 text-[#E13032]"
                  aria-hidden="true"
                />
                <span>+91 99999 99999</span>
              </Link>

              <Link
                href="mailto:support@jobway.in"
                className="flex items-center gap-3 text-xs font-semibold text-slate-400 transition hover:text-white"
              >
                <Mail
                  className="h-4 w-4 shrink-0 text-[#E13032]"
                  aria-hidden="true"
                />
                <span>support@jobway.in</span>
              </Link>
            </div>

            {/* Social */}
            <div className="mt-7 flex items-center gap-2">
              {SOCIAL_LINKS.map((social) => (
                <Link
                  key={social.href}
                  href={social.href}
                  aria-label={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[10px] font-black uppercase text-slate-400 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-white focus-visible:outline-2 focus-visible:outline-[#E13032] focus-visible:outline-offset-2"
                >
                  {social.shortLabel}
                </Link>
              ))}
            </div>
          </div>

          <FooterColumn
            title="Exams"
            links={EXAM_LINKS}
          />

          <FooterColumn
            title="Learning"
            links={LEARNING_LINKS}
          />

          <FooterColumn
            title="Company"
            links={COMPANY_LINKS}
          />
        </div>

        {/* Newsletter + App */}
        <div className="border-t border-white/10 py-8">
          <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-center">
            {/* Newsletter */}
            <div>
              <div className="flex items-center gap-2">
                <Send
                  className="h-4 w-4 text-[#E13032]"
                  aria-hidden="true"
                />

                <h3 className="text-sm font-black text-white">
                  Stay updated with JobWay
                </h3>
              </div>

              <p className="mt-1.5 text-xs leading-5 text-slate-500">
                Get exam updates, preparation resources and important learning
                announcements.
              </p>

              <form
                action="/subscribe"
                method="post"
                className="mt-4 flex max-w-md flex-col gap-2 sm:flex-row"
              >
                <label
                  htmlFor="footer-email"
                  className="sr-only"
                >
                  Email address
                </label>

                <input
                  id="footer-email"
                  name="email"
                  type="email"
                  required
                  placeholder="Enter your email address"
                  autoComplete="email"
                  className="h-11 min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-medium text-white outline-none transition placeholder:text-slate-600 focus:border-red-500/60 focus:bg-white/10 focus:ring-2 focus:ring-red-500/10"
                />

                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#E13032] px-5 text-xs font-black text-white transition hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
                >
                  Subscribe

                  <ArrowRight
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  />
                </button>
              </form>
            </div>

            {/* App CTA */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E13032]">
                  <BookOpen
                    className="h-5 w-5 text-white"
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <p className="text-xs font-black text-white">
                    Learn on the go
                  </p>

                  <p className="mt-0.5 text-[10px] text-slate-500">
                    Download the JobWay app
                  </p>
                </div>
              </div>

              <Link
                href="/download-app"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-extrabold text-slate-300 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-[#E13032] focus-visible:outline-offset-2"
              >
                <PlayCircle
                  className="h-4 w-4"
                  aria-hidden="true"
                />
                Get the app
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright + Legal */}
        <div className="border-t border-white/10 py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-[11px] font-medium text-slate-600">
              © {new Date().getFullYear()} JobWay. All rights reserved.
            </p>

            <nav
              aria-label="Legal navigation"
              className="flex flex-wrap gap-x-5 gap-y-2"
            >
              {LEGAL_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[11px] font-semibold text-slate-500 transition hover:text-white focus-visible:outline-2 focus-visible:outline-[#E13032] focus-visible:outline-offset-2"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </Container>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: FooterLink[];
}) {
  return (
    <div>
      <h3 className="text-sm font-black text-white">
        {title}
      </h3>

      <ul className="mt-5 space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="group inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-white focus-visible:outline-2 focus-visible:outline-[#E13032] focus-visible:outline-offset-2"
            >
              <span>{link.label}</span>

              <ArrowRight
                className="h-3 w-3 -translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}