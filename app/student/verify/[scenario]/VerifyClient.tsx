"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, TriangleAlert } from "lucide-react";
import type { VerificationCheck } from "@/fixtures/scenarios/types";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function VerifyClient({ check }: { check: VerificationCheck }) {
  const [answered, setAnswered] = useState<string | null>(null);
  const held = answered === check.correctAnswer;

  if (!answered) {
    return (
      <div className="mt-6 max-w-lg">
        <h2 className="text-lg font-medium leading-snug">{check.questionText}</h2>
        <div className="mt-5 grid gap-2">
          {check.optionsShown.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setAnswered(opt)}
              className="rounded-lg border border-border bg-card px-4 py-3 text-left text-sm transition-colors hover:border-foreground/40 hover:bg-muted/50"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 max-w-lg space-y-4">
      <div
        className={cn(
          "flex gap-3 rounded-lg border p-4",
          held
            ? "border-ok/30 border-l-4 border-l-ok bg-ok/10"
            : "border-warn/40 border-l-4 border-l-warn bg-warn/10",
        )}
      >
        {held ? (
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-ok" />
        ) : (
          <TriangleAlert className="mt-0.5 size-5 shrink-0 text-warn-foreground dark:text-warn" />
        )}
        <div>
          <p
            className={cn(
              "text-sm font-semibold",
              held ? "text-ok" : "text-warn-foreground dark:text-warn",
            )}
          >
            {held ? "The fix held." : "This one slipped back."}
          </p>
          <p className="mt-1 text-sm text-foreground/80">
            {held
              ? "You answered this the right way. Nothing more to do on this misconception for now."
              : "Mr Shah has been notified and will pick this up with you again."}
          </p>
        </div>
      </div>
      <Link href="/student" className={buttonVariants({ variant: "outline" })}>
        Back to home
      </Link>
    </div>
  );
}
