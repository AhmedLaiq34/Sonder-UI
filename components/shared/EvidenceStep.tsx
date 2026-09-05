import { cn } from "@/lib/utils";

/**
 * One row of the answer trace on the evidence panel: the question that was
 * asked, the answer the student gave, and the engine's one-line reason for
 * asking it. Repeats down T2. Part of the Full Evidence Trail (Feature 18).
 */
export function EvidenceStep({
  index,
  questionText,
  answerGiven,
  reasoning,
  isCurrent,
  className,
}: {
  index: number;
  questionText: string;
  answerGiven: string;
  reasoning: string;
  isCurrent?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex gap-3 py-4",
        isCurrent && "rounded-md bg-muted/50 px-3",
        className,
      )}
    >
      <div
        className={cn(
          "nums flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
          isCurrent
            ? "border-foreground bg-foreground text-background"
            : "border-border text-muted-foreground",
        )}
      >
        {index}
      </div>
      <div className="min-w-0 space-y-1.5">
        <p className="text-sm font-medium leading-snug">{questionText}</p>
        <p className="text-sm">
          <span className="text-muted-foreground">Answered </span>
          <span className="font-medium">{answerGiven}</span>
        </p>
        <p className="text-xs italic leading-relaxed text-muted-foreground">
          {reasoning}
        </p>
      </div>
    </div>
  );
}
