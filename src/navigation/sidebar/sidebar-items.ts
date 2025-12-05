import { LayoutDashboard, Users, Calendar, Settings, FileText, BarChart, User, type LucideIcon } from "lucide-react";

export interface NavSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  subItems?: NavSubItem[];
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Main",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Students",
        url: "/students",
        icon: Users,
      },
      {
        title: "Attendance",
        url: "/calendar",
        icon: Calendar,
      },
      {
        title: "Reports",
        url: "/reports",
        icon: FileText,
        comingSoon: true,
      },
      {
        title: "Analytics",
        url: "/analytics",
        icon: BarChart,
        comingSoon: true,
      },
    ],
  },
  {
    id: 2,
    label: "Settings",
    items: [
      {
        title: "Profile",
        url: "/profile",
        icon: User,
      },
      {
        title: "Settings",
        url: "/settings",
        icon: Settings,
        comingSoon: true,
      },
    ],
  },
];
