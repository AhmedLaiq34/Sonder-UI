import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { PageShell } from "@/components/app/PageShell";
import { MisconceptionCard } from "@/components/shared";
import { buttonVariants } from "@/components/ui/button";
import { catalogueForSubject } from "@/fixtures/catalogue";
import { getLearnPage } from "@/fixtures/learn/pages";
import type { Subject } from "@/fixtures/scenarios/types";

const SUBJECTS: Subject[] = ["mathematics", "physics", "chemistry"];

export default function LearnHub() {
  return (
    <PageShell
      title="Learn"
      description="Browse any misconception in the catalogue — notes, recommended resources, and a chat to ask about the concept. No diagnosis needed to look something up."
      wide
    >
      {SUBJECTS.map((subject) => {
        const entries = catalogueForSubject(subject);
        if (entries.length === 0) return null;
        return (
          <div key={subject} className="mt-8 first:mt-0">
            <h2 className="text-sm font-semibold capitalize">{subject}</h2>
            <div className="mt-2 grid gap-3 md:grid-cols-2">
              {entries.map((c) => {
                const built = !!getLearnPage(c.subject, c.code);
                return (
                  <MisconceptionCard
                    key={`${c.subject}-${c.code}`}
                    code={c.code}
                    name={c.name}
                    description={c.description}
                  >
                    {built ? (
                      <Link
                        href={`/student/learn/${c.subject}/${c.code}`}
                        className={buttonVariants({ variant: "outline", size: "sm" })}
                      >
                        Open
                        <ArrowRight className="size-3.5" />
                      </Link>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="size-3.5" />
                        Notes coming soon
                      </span>
                    )}
                  </MisconceptionCard>
                );
              })}
            </div>
          </div>
        );
      })}
    </PageShell>
  );
}
