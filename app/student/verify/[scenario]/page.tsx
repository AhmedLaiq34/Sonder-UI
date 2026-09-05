import { notFound } from "next/navigation";
import { CalendarClock } from "lucide-react";
import { getScenario } from "@/fixtures/scenarios";
import { PageShell } from "@/components/app/PageShell";
import { VerifyClient } from "./VerifyClient";

export function generateStaticParams() {
  return [{ scenario: "A" }, { scenario: "B" }];
}

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ scenario: string }>;
}) {
  const { scenario: id } = await params;
  const scenario = getScenario(id);
  const check = scenario?.verification;
  if (!scenario || !check) notFound();

  return (
    <PageShell
      eyebrow="Follow-up check · a few weeks later"
      title={scenario.topicName}
      description="This is not a new topic. It's one different question to check the earlier fix held."
    >
      <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
        <CalendarClock className="size-3.5" />
        {check.context}
      </div>
      <VerifyClient check={check} />
    </PageShell>
  );
}
