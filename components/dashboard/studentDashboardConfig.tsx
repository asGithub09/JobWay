import {
  BarChart3,
  BookOpen,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Settings,
  ShoppingBag,
  Target,
  Trophy,
  UserRound,
} from "lucide-react";

import type { DashboardNavSection } from "./DashboardSidebar";

export const studentDashboardSections: DashboardNavSection[] = [
  {
    label: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: <LayoutDashboard className="h-[18px] w-[18px]" />,
        exact: true,
      },
      {
        label: "My Profile",
        href: "/dashboard/profile",
        icon: <UserRound className="h-[18px] w-[18px]" />,
      },
    ],
  },
  {
    label: "My Preparation",
    items: [
      {
        label: "My Courses",
        href: "/courses",
        icon: <BookOpen className="h-[18px] w-[18px]" />,
      },
      {
        label: "Test Series",
        href: "/test-series",
        icon: <ClipboardList className="h-[18px] w-[18px]" />,
      },
      {
        label: "Mock Tests",
        href: "/exams",
        icon: <Target className="h-[18px] w-[18px]" />,
      },
      {
        label: "Study Resources",
        href: "/resources",
        icon: <FileText className="h-[18px] w-[18px]" />,
      },
    ],
  },
  {
    label: "Performance",
    items: [
      {
        label: "My Performance",
        href: "/dashboard/performance",
        icon: <BarChart3 className="h-[18px] w-[18px]" />,
      },
      {
        label: "Achievements",
        href: "/dashboard/achievements",
        icon: <Trophy className="h-[18px] w-[18px]" />,
      },
    ],
  },
  {
    label: "Account",
    items: [
      {
        label: "My Purchases",
        href: "/dashboard/purchases",
        icon: <ShoppingBag className="h-[18px] w-[18px]" />,
      },
      {
        label: "Settings",
        href: "/dashboard/settings",
        icon: <Settings className="h-[18px] w-[18px]" />,
      },
    ],
  },
];