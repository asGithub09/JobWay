export const JOBWAY = {
  name: "JobWay",
  shortName: "JobWay",
  tagline: "Learn. Practice. Succeed.",
  description:
    "A modern learning platform for competitive examinations, career preparation, mock tests, courses and study resources.",
  supportEmail: "support@jobway.example",
} as const;

export const JOBWAY_COLORS = {
  brand: "#E13032",
  brandDark: "#B91C1C",
  brandLight: "#EF4444",
  brandSoft: "#FEF2F2",
  slate950: "#020617",
  slate900: "#0F172A",
  slate800: "#1E293B",
  slate700: "#334155",
  slate600: "#475569",
  slate500: "#64748B",
  slate400: "#94A3B8",
  slate300: "#CBD5E1",
  slate200: "#E2E8F0",
  slate100: "#F1F5F9",
  slate50: "#F8FAFC",
  white: "#FFFFFF",
  success: "#16A34A",
  warning: "#F59E0B",
  error: "#DC2626",
} as const;

export const EXAM_CATEGORIES = [
  {
    id: "banking",
    name: "Banking Exams",
    description: "Prepare for major banking examinations.",
  },
  {
    id: "ssc-railway",
    name: "SSC & Railway",
    description: "Complete preparation for SSC and Railway exams.",
  },
  {
    id: "upsc-state-psc",
    name: "UPSC & State PSC",
    description: "Civil services and state public service preparation.",
  },
  {
    id: "teaching",
    name: "Teaching",
    description: "Prepare for teaching and education-sector examinations.",
  },
  {
    id: "engineering",
    name: "Engineering",
    description: "Technical and engineering examination preparation.",
  },
  {
    id: "private-skilling",
    name: "Private Jobs & Skilling",
    description: "Build skills and prepare for private-sector careers.",
  },
] as const;

export const LEARNING_LANGUAGES = [
  {
    id: "english",
    name: "English",
    nativeName: "English",
  },
  {
    id: "hindi",
    name: "Hindi",
    nativeName: "हिंदी",
  },
  {
    id: "bengali",
    name: "Bengali",
    nativeName: "বাংলা",
  },
  {
    id: "marathi",
    name: "Marathi",
    nativeName: "मराठी",
  },
  {
    id: "tamil",
    name: "Tamil",
    nativeName: "தமிழ்",
  },
  {
    id: "telugu",
    name: "Telugu",
    nativeName: "తెలుగు",
  },
  {
    id: "kannada",
    name: "Kannada",
    nativeName: "ಕನ್ನಡ",
  },
  {
    id: "gujarati",
    name: "Gujarati",
    nativeName: "ગુજરાતી",
  },
  {
    id: "punjabi",
    name: "Punjabi",
    nativeName: "ਪੰਜਾਬੀ",
  },
  {
    id: "malayalam",
    name: "Malayalam",
    nativeName: "മലയാളം",
  },
  {
    id: "odia",
    name: "Odia",
    nativeName: "ଓଡ଼ିଆ",
  },
  {
    id: "assamese",
    name: "Assamese",
    nativeName: "অসমীয়া",
  },
] as const;

export const NAVIGATION_ITEMS = [
  {
    label: "Exams",
    href: "/exams",
  },
  {
    label: "Courses",
    href: "/courses",
  },
  {
    label: "Test Series",
    href: "/test-series",
  },
  {
    label: "Books",
    href: "/books",
  },
  {
    label: "Current Affairs",
    href: "/current-affairs",
  },
] as const;

export const SOCIAL_LINKS = [
  {
    label: "Facebook",
    href: "#",
  },
  {
    label: "Instagram",
    href: "#",
  },
  {
    label: "YouTube",
    href: "#",
  },
  {
    label: "LinkedIn",
    href: "#",
  },
  {
    label: "X",
    href: "#",
  },
] as const;