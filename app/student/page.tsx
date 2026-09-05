import Link from "next/link";
import {
  Compass,
  LineChart,
  MessageCircleQuestion,
  CalendarClock,
  ArrowRight,
} from "lucide-react";
import { PageShell } from "@/components/app/PageShell";
import { AreaCard } from "@/components/app/AreaCard";
import { SectionHeading } from "@/components/app/primitives";
import { StatusBadge } from "@/components/shared";
import { buttonVariants } from "@/components/ui/button";
import { ROLES } from "@/lib/roles";

export default function StudentHome() {
  const me = ROLES.student;
  return (
    <PageShell
      title={`Welcome back, ${me.person.split(" ")[0]}`}
      description="Start a diagnostic when a topic feels shaky. Everything you do here is reviewed by your teacher before it goes anywhere."
      actions={
        <Link href="/student/start" className={buttonVariants()}>
          New diagnostic
          <ArrowRight className="size-4" />
        </Link>
      }
    >
      <div className="grid gap-3 lg:grid-cols-2">
        <Link
          href="/student/verify/B"
          className="group flex items-center gap-3 rounded-xl border border-info/30 bg-info/5 p-4 shadow-xs transition-colors hover:border-info/50"
        >
          <CalendarClock className="size-5 shrink-0 text-info" />
          <div className="flex-1">
            <p className="text-sm font-semibold">Follow-up check due</p>
            <p className="text-xs text-muted-foreground">
              Rounding to decimal places · one quick question
            </p>
          </div>
          <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </Link>

        <Link
          href="/student/remediation/B"
          className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-xs transition-colors hover:border-foreground/25"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold">Last session</p>
              <StatusBadge status="diagnosed" />
            </div>
            <p className="text-xs text-muted-foreground">
              Rounding · study note ready to read
            </p>
          </div>
          <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <SectionHeading className="mt-8">Where to go next</SectionHeading>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <AreaCard
          href="/student/start"
          icon={Compass}
          title="New diagnostic"
          description="Pick a subject and topic, or run a broad check across a whole subject."
        />
        <AreaCard
          href="/student/insights"
          icon={LineChart}
          title="My learning-pace insights"
          description="How quickly you tend to resolve each kind of misconception, with the evidence behind it."
        />
        <AreaCard
          href="/student/consultant"
          icon={MessageCircleQuestion}
          title="Ask the AI consultant"
          description="Questions about what to focus on next. Answers are suggestions, not marks."
        />
      </div>
    </PageShell>
  );
}
