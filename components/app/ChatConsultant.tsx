"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ConsultantConfig } from "@/fixtures/consultant/types";

type Msg = {
  id: string;
  from: "user" | "assistant";
  text: string;
  evidence?: string[];
};

const REPLY_MS = 750;
let uid = 0;
const nextId = () => `m${uid++}`;

export function ChatConsultant({ config }: { config: ConsultantConfig }) {
  const [messages, setMessages] = useState<Msg[]>([
    { id: nextId(), from: "assistant", ...config.greeting },
  ]);
  const [usedPromptIds, setUsedPromptIds] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState(false);
  const [input, setInput] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, pending]);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  function ask(question: string, promptId?: string) {
    if (pending) return;
    const q = question.trim();
    if (!q) return;

    const matched =
      config.prompts.find((p) => p.id === promptId) ??
      config.prompts.find(
        (p) => p.question.toLowerCase().trim() === q.toLowerCase(),
      );

    setMessages((m) => [...m, { id: nextId(), from: "user", text: q }]);
    setInput("");
    if (matched) setUsedPromptIds((s) => new Set(s).add(matched.id));
    setPending(true);

    timer.current = setTimeout(() => {
      const reply = matched?.reply ?? config.fallback;
      setMessages((m) => [
        ...m,
        { id: nextId(), from: "assistant", text: reply.text, evidence: reply.evidence },
      ]);
      setPending(false);
    }, REPLY_MS);
  }

  const openPrompts = config.prompts.filter((p) => !usedPromptIds.has(p.id));

  return (
    <div className="mx-auto flex h-[calc(100dvh-var(--header-height))] w-full max-w-2xl flex-col px-4 sm:px-6">
      <div className="flex items-center gap-2 border-b border-border py-3 text-sm">
        <span className="grid size-6 place-items-center rounded-md bg-muted">
          <Bot className="size-3.5 text-muted-foreground" />
        </span>
        <span className="font-medium">{config.personaLabel}</span>
        <span className="text-xs text-muted-foreground">
          · scripted · suggestions, not decisions
        </span>
      </div>

      <div className="app-scroll flex-1 space-y-4 overflow-y-auto py-5">
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              "flex",
              m.from === "user" ? "justify-end" : "justify-start",
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                m.from === "user"
                  ? "bg-foreground text-background"
                  : "bg-muted text-foreground",
              )}
            >
              <p>{m.text}</p>
              {m.evidence?.length ? (
                <div className="mt-2.5 rounded-lg bg-background/60 p-2.5">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Evidence
                  </p>
                  <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                    {m.evidence.map((e) => (
                      <li key={e} className="flex gap-1.5">
                        <span aria-hidden>·</span>
                        <span>{e}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        ))}

        {pending ? (
          <div className="flex justify-start">
            <div className="flex gap-1 rounded-2xl bg-muted px-4 py-3">
              <Dot /> <Dot delay="150ms" /> <Dot delay="300ms" />
            </div>
          </div>
        ) : null}
        <div ref={endRef} />
      </div>

      <div className="border-t border-border py-3">
        {openPrompts.length ? (
          <div className="mb-2 flex flex-wrap gap-2">
            {openPrompts.map((p) => (
              <button
                key={p.id}
                type="button"
                disabled={pending}
                onClick={() => ask(p.question, p.id)}
                className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground disabled:opacity-50"
              >
                {p.label}
              </button>
            ))}
          </div>
        ) : null}
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about a session or a topic…"
            className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
          />
          <Button type="submit" size="icon" disabled={pending || !input.trim()}>
            <Send className="size-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

function Dot({ delay = "0ms" }: { delay?: string }) {
  return (
    <span
      className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60"
      style={{ animationDelay: delay }}
    />
  );
}
