import {
  Home,
  Compass,
  LineChart,
  MessageCircleQuestion,
  LayoutDashboard,
  AlertTriangle,
  ClipboardCheck,
  Bot,
  FileText,
  BookMarked,
  Grid3x3,
  Gauge,
  ScrollText,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/lib/session";

export type NavItem = { label: string; href: string; icon: LucideIcon };
export type NavGroup = { label?: string; items: NavItem[] };

/**
 * Per-role sidebar navigation. Grouped, with an optional section label.
 * Contextual screens (an evidence panel, a single summary) are reached from
 * within a section, not listed here.
 */
export const NAV: Record<Role, NavGroup[]> = {
  student: [
    {
      items: [
        { label: "Home", href: "/student", icon: Home },
        { label: "New diagnostic", href: "/student/start", icon: Compass },
        { label: "Learn", href: "/student/learn", icon: GraduationCap },
      ],
    },
    {
      label: "Progress",
      items: [
        { label: "My insights", href: "/student/insights", icon: LineChart },
        {
          label: "Ask the consultant",
          href: "/student/consultant",
          icon: MessageCircleQuestion,
        },
      ],
    },
  ],
  teacher: [
    {
      items: [
        { label: "Dashboard", href: "/teacher", icon: LayoutDashboard },
      ],
    },
    {
      label: "Queues",
      items: [
        {
          label: "Escalations",
          href: "/teacher/escalations",
          icon: AlertTriangle,
        },
        {
          label: "Content review",
          href: "/teacher/content-review",
          icon: ClipboardCheck,
        },
      ],
    },
    {
      label: "Assist",
      items: [{ label: "AI consultant", href: "/teacher/consultant", icon: Bot }],
    },
  ],
  parent: [
    {
      items: [{ label: "Summaries", href: "/parent", icon: FileText }],
    },
  ],
  admin: [
    {
      items: [
        { label: "Overview", href: "/admin", icon: LayoutDashboard },
      ],
    },
    {
      label: "Content",
      items: [
        { label: "Catalogue", href: "/admin/catalogue", icon: BookMarked },
        { label: "Coverage", href: "/admin/coverage", icon: Grid3x3 },
        { label: "Provenance", href: "/admin/provenance", icon: ScrollText },
      ],
    },
    {
      label: "Insight",
      items: [
        { label: "Performance", href: "/admin/performance", icon: Gauge },
      ],
    },
  ],
};

/** Human labels for path segments, for the top-bar breadcrumb. */
export const SEGMENT_LABELS: Record<string, string> = {
  student: "Student",
  teacher: "Teacher",
  parent: "Parent",
  admin: "Admin",
  start: "New diagnostic",
  session: "Session",
  review: "Review",
  remediation: "Study note",
  learn: "Learn",
  verify: "Follow-up check",
  insights: "Insights",
  consultant: "AI consultant",
  escalations: "Escalations",
  "content-review": "Content review",
  agreement: "Two-reviewer check",
  students: "Students",
  summary: "Summary",
  catalogue: "Catalogue",
  coverage: "Coverage",
  performance: "Performance",
  provenance: "Provenance",
  A: "Scenario A",
  B: "Scenario B",
  C: "Scenario C",
  topic: "Topic",
  general: "Broad check",
};
