import { AppDownload } from "@/components/home/app-download";
import { AiTechCourses } from "@/components/home/ai-tech-courses";
import { ExamSelector } from "@/components/home/exam-selector";
import { FAQ } from "@/components/home/faq";
import { FreeResources } from "@/components/home/free-resources";
import { HeroSection } from "@/components/home/hero-section";
import { PopularCourses } from "@/components/home/popular-courses";
import { StudyMaterial } from "@/components/home/study-material";
import { TestPrime } from "@/components/home/test-prime";
import { TrustStats } from "@/components/home/trust-stats";
import { VernacularBanner } from "@/components/home/vernacular-banner";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import LandingAdvertisement from "@/components/home/landing-advertisement";

export default function HomePage() {
  return (
    <div data-motion-page="landing" className="min-h-screen bg-slate-50">
      <SiteHeader />

      <main>
        <div data-motion="scale">
          <HeroSection />
        </div>

        <section data-motion="reveal">
          <TrustStats />
        </section>

        <section data-motion="reveal">
          <ExamSelector />
        </section>

        <section data-motion="reveal">
          <TestPrime />
        </section>

        <section data-motion="scale">
          <PopularCourses />
        </section>

        <section data-motion="reveal">
          <StudyMaterial />
        </section>

        <section data-motion="scale">
          <FreeResources />
        </section>

        <section data-motion="kinetic" data-motion-pin-section>
          <AiTechCourses />
        </section>

        <section data-motion="reveal">
          <VernacularBanner />
        </section>

        <section data-motion="scale">
          <AppDownload />
        </section>

        <section data-motion="reveal">
          <FAQ />
        </section>
      </main>

      <SiteFooter />
      <LandingAdvertisement />
    </div>
  );
}



