import { Calculator, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type VerificationKind = "computed" | "ai-proposed";

/**
 * Marks where a value came from. "Computed" = derived by a deterministic rule
 * (trustworthy on its own). "AI-proposed" = a model suggestion that still needs
 * a human to validate it. The two must never look the same.
 */
export function VerificationTag({
  kind,
  className,
}: {
  kind: VerificationKind;
  className?: string;
}) {
  const computed = kind === "computed";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wide",
        computed
          ? "bg-ok/10 text-ok"
          : "bg-ai/10 text-ai ring-1 ring-inset ring-ai/25",
        className,
      )}
    >
      {computed ? (
        <Calculator className="size-3" aria-hidden />
      ) : (
        <Sparkles className="size-3" aria-hidden />
      )}
      {computed ? "Computed" : "AI-proposed"}
    </span>
  );
}
