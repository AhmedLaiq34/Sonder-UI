import { notFound } from "next/navigation";
import { BookOpen } from "lucide-react";
import { PageShell } from "@/components/app/PageShell";
import { LEARN_PAGES, getLearnPage } from "@/fixtures/learn/pages";
import { ResourceFinder } from "@/components/learn/ResourceFinder";
import { ConceptChat } from "@/components/learn/ConceptChat";

export function generateStaticParams() {
  return LEARN_PAGES.map((p) => ({ subject: p.subject, code: p.code }));
}

export default async function LearnPageRoute({
  params,
}: {
  params: Promise<{ subject: string; code: string }>;
}) {
  const { subject, code } = await params;
  const page = getLearnPage(subject, code);
  if (!page) notFound();

  return (
    <PageShell
      eyebrow={`Learn · ${page.subject}`}
      title={page.title}
      description="Not tied to a diagnosis — read this any time you want to understand the concept."
      wide
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-6">
          <section id="notes" className="scroll-mt-6 rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <BookOpen className="size-4 text-muted-foreground" />
              What this is
            </div>
            <p className="mt-2 text-sm leading-relaxed text-foreground/85">{page.whatItIs}</p>

            <div className="mt-4 border-t border-border pt-4 text-sm font-semibold">
              How to think about it
            </div>
            <p className="mt-2 text-sm leading-relaxed text-foreground/85">{page.howToThink}</p>

            <div className="mt-4 space-y-1.5 rounded-lg bg-muted/40 p-3 text-xs">
              <p><span className="font-medium">Example: </span>{page.example.prompt}</p>
              <p><span className="font-medium text-warn-foreground dark:text-warn">The slip: </span>{page.example.wrongMove}</p>
              <p><span className="font-medium text-ok">The fix: </span>{page.example.rightMove}</p>
              <p><span className="font-medium">Answer: </span>{page.example.answer}</p>
            </div>
          </section>

          <section id="resources" className="scroll-mt-6">
            <h2 className="text-sm font-semibold">Recommended resources</h2>
            <div className="mt-2">
              <ResourceFinder query={page.searchQuery} resources={page.resources} />
            </div>
          </section>
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <h2 className="mb-2 text-sm font-semibold">Ask about this concept</h2>
          <ConceptChat chat={page.chat} />
        </div>
      </div>
    </PageShell>
  );
}
