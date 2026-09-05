import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, PlayCircle, ShieldCheck, GraduationCap } from "lucide-react";
import { getScenario } from "@/fixtures/scenarios";
import { learnPageHref } from "@/fixtures/learn/pages";
import { PageShell } from "@/components/app/PageShell";
import { buttonVariants } from "@/components/ui/button";
import { MarkReadButton } from "./MarkReadButton";

export function generateStaticParams() {
  return [{ scenario: "A" }, { scenario: "B" }];
}

export default async function RemediationPage({
  params,
}: {
  params: Promise<{ scenario: string }>;
}) {
  const { scenario: id } = await params;
  const scenario = getScenario(id);
  const note = scenario?.studyNote;
  if (!scenario || !note) notFound();
  const learnHref = learnPageHref(scenario.subject, note.code);

  return (
    <PageShell
      eyebrow="Your remediation"
      title={note.name}
      description={`For ${scenario.topicName}. Read this in your own time — it's yours to come back to.`}
    >
      <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
        <ShieldCheck className="size-3.5 text-ok" />
        Shared with you after your teacher reviewed the diagnosis.
      </div>

      <div className="mt-6 space-y-6">
        <section className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <BookOpen className="size-4 text-muted-foreground" />
            What was going on
          </div>
          <p className="mt-2 text-sm leading-relaxed text-foreground/85">
            {note.explanation}
          </p>
          <div className="mt-4 border-t border-border pt-4 text-sm font-semibold">
            How to think about it
          </div>
          <p className="mt-2 text-sm leading-relaxed text-foreground/85">
            {note.correction}
          </p>
        </section>

        <a
          href={note.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/30"
        >
          <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted">
            <PlayCircle className="size-6 text-foreground" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold">{note.videoTitle}</span>
            <span className="block truncate text-xs text-muted-foreground">
              Opens on YouTube
            </span>
          </span>
        </a>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        <MarkReadButton />
        {scenario.verification ? (
          <Link
            href={`/student/verify/${scenario.id}`}
            className={buttonVariants({ variant: "outline" })}
          >
            Preview the follow-up check
          </Link>
        ) : null}
        {learnHref ? (
          <Link href={learnHref} className={buttonVariants({ variant: "outline" })}>
            <GraduationCap className="size-4" />
            Learn more about this
          </Link>
        ) : null}
      </div>
    </PageShell>
  );
}
