"use client";

import Link from "next/link";
import { AlertTriangle, ClipboardCheck, Bot, ChevronRight } from "lucide-react";
import { PageShell } from "@/components/app/PageShell";
import { AreaCard } from "@/components/app/AreaCard";
import {
  SectionHeading,
  StatTile,
  Surface,
  Th,
  Td,
} from "@/components/app/primitives";
import { StatusBadge, type SessionStatus } from "@/components/shared";
import { STUDENTS, type Student } from "@/fixtures/students";
import { useTeacherReviews } from "@/lib/teacher-review";

function effectiveStatus(
  student: Student,
  decisions: Record<string, string>,
): SessionStatus {
  const d = student.scenarioId ? decisions[student.scenarioId] : undefined;
  if (d === "approved" || d === "corrected" || d === "resolved") return "diagnosed";
  if (d === "rejected") return "awaiting-review";
  return student.status;
}

export default function TeacherDashboard() {
  const { decisions } = useTeacherReviews();

  const rows = STUDENTS.map((s) => ({
    student: s,
    status: effectiveStatus(s, decisions),
  }));

  const resolved = rows.filter((r) => r.status === "diagnosed").length;
  const escalated = rows.filter((r) => r.status === "escalated").length;
  const awaiting = rows.filter((r) => r.status === "awaiting-review").length;
  const attention = rows.filter(
    (r) => r.status === "awaiting-review" || r.status === "escalated",
  );

  return (
    <PageShell
      title="Class dashboard"
      description="Every diagnosis reaches you with its evidence before a student or parent sees it."
      wide
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <StatTile label="Awaiting review" value={awaiting} tone="info" />
        <StatTile label="Escalated" value={escalated} tone="warn" />
        <StatTile label="Resolved" value={resolved} tone="ok" />
      </div>

      <SectionHeading className="mt-8" count={attention.length}>
        Needs your attention
      </SectionHeading>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {attention.map(({ student, status }) => {
          const inner = (
            <>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">{student.name}</p>
                <StatusBadge status={status} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {cap(student.subject)} · {student.topicName}
              </p>
              {student.note ? (
                <p className="mt-2 text-xs text-muted-foreground">{student.note}</p>
              ) : null}
              <p className="mt-2 text-xs text-muted-foreground">
                {student.lastActivity}
              </p>
            </>
          );
          return student.scenarioId ? (
            <Link
              key={student.id}
              href={`/teacher/session/${student.scenarioId}`}
              className="group rounded-xl border border-border bg-card p-4 shadow-xs transition-colors hover:border-foreground/25"
            >
              {inner}
              <span className="mt-2.5 inline-flex items-center gap-1 text-xs font-medium">
                Open evidence
                <ChevronRight className="size-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ) : (
            <div
              key={student.id}
              className="rounded-xl border border-dashed border-border bg-muted/20 p-4"
            >
              {inner}
              <span className="mt-2.5 block text-xs text-muted-foreground">
                No session replay in this build
              </span>
            </div>
          );
        })}
      </div>

      <SectionHeading className="mt-8" count={rows.length}>
        Classes 9-B and 9-A
      </SectionHeading>
      <Surface className="mt-3 overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                <Th>Student</Th>
                <Th>Topic</Th>
                <Th>Status</Th>
                <Th>Last activity</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map(({ student, status }) => (
                <tr key={student.id} className="transition-colors hover:bg-muted/30">
                  <Td>
                    {student.scenarioId ? (
                      <Link
                        href={`/teacher/session/${student.scenarioId}`}
                        className="font-medium hover:underline"
                      >
                        {student.name}
                      </Link>
                    ) : (
                      <span className="font-medium">{student.name}</span>
                    )}
                    <span className="ml-1.5 text-xs text-muted-foreground">
                      {student.className}
                    </span>
                  </Td>
                  <Td className="text-muted-foreground">{student.topicName}</Td>
                  <Td>
                    <StatusBadge status={status} />
                  </Td>
                  <Td className="whitespace-nowrap text-muted-foreground">
                    {student.lastActivity}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Surface>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <AreaCard
          href="/teacher/escalations"
          icon={AlertTriangle}
          title="Escalations"
          description="Cases the engine would not guess on, with an AI-suggested explanation to weigh."
        />
        <AreaCard
          href="/teacher/content-review"
          icon={ClipboardCheck}
          title="Content review queue"
          description="New auto-generated questions waiting for approval before they go live."
        />
        <AreaCard
          href="/teacher/consultant"
          icon={Bot}
          title="AI consultant"
          description="Ask about a student or a class. Observations, always with their evidence."
        />
      </div>
    </PageShell>
  );
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
