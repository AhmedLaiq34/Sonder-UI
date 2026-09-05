import { Hammer } from "lucide-react";
import { PageShell } from "./PageShell";

const CHECKPOINT_LABEL: Record<number, string> = {
  2: "Checkpoint 2 — Student flow",
  3: "Checkpoint 3 — Teacher workflow",
  4: "Checkpoint 4 — Parent & Admin",
};

/**
 * Stand-in for a screen that has a route (so navigation never 404s) but whose
 * real content lands in a later checkpoint.
 */
export function Placeholder({
  title,
  description,
  checkpoint,
}: {
  title: string;
  description: string;
  checkpoint: 2 | 3 | 4;
}) {
  return (
    <PageShell eyebrow="Not built yet" title={title} description={description}>
      <div className="flex items-center gap-3 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-6 text-sm text-muted-foreground">
        <Hammer className="size-4 shrink-0" />
        <span>Arrives in {CHECKPOINT_LABEL[checkpoint]}.</span>
      </div>
    </PageShell>
  );
}
