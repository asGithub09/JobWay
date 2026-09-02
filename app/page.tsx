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

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />

      <main>
        <HeroSection />

        <TrustStats />

        <ExamSelector />

        <TestPrime />

        <PopularCourses />

        <StudyMaterial />

        <FreeResources />

        <AiTechCourses />

        <VernacularBanner />

        <AppDownload />

        <FAQ />
      </main>

      <SiteFooter />
    </div>
  );
}