import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { CampaignBanner } from "@/components/layout/campaign-banner";
import { AuthProvider } from "@/context/AuthContext";
import StudentPortalShell from "@/components/student-portal/StudentPortalShell";
import GlobalPreloader from "@/components/GlobalPreloader";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "JobWay | Learn Smarter. Prepare Better.",
    template: "%s | JobWay",
  },
  description:
    "JobWay is a complete preparation platform for competitive examinations, offering courses, mock tests, study material and current affairs.",
  applicationName: "JobWay",
  keywords: [
    "JobWay",
    "competitive exams",
    "online courses",
    "mock tests",
    "test series",
    "study material",
    "current affairs",
    "exam preparation",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-slate-50 font-sans">
        <GlobalPreloader />

        <AuthProvider>
          <StudentPortalShell>
            {children}
          </StudentPortalShell>
        </AuthProvider>

        <CampaignBanner />
      </body>
    </html>
  );
}