"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Send, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ChatEntry, LearnConceptChat, WorkedExample } from "@/fixtures/learn/types";

type Msg = {
  id: string;
  from: "user" | "assistant";
  text: string;
  example?: WorkedExample;
  followups?: ChatEntry[];
};

const REPLY_MS = 750;
let uid = 0;
const nextId = () => `lc${uid++}`;

/**
 * A concept-oriented chat (Feature 8c) — purpose-built, not a reuse of the
 * session-history `ChatConsultant`. Two persistent affordances ("explain it
 * simpler" / "give me a harder example") are always available, and any reply
 * with a worked example renders it inline rather than as plain text.
 */
export function ConceptChat({ chat }: { chat: LearnConceptChat }) {
  const [messages, setMessages] = useState<Msg[]>([
    { id: nextId(), from: "assistant", text: chat.greeting },
  ]);
  const [usedIds, setUsedIds] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState(false);
  const [input, setInput] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, pending]);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  function findEntry(id?: string, questionText?: string): ChatEntry | undefined {
    if (id) return chat.entries.find((e) => e.id === id);
    const q = questionText?.toLowerCase().trim();
    return chat.entries.find((e) => e.question.toLowerCase().trim() === q);
  }

  function ask(questionText: string, entryId?: string) {
    if (pending) return;
    const q = questionText.trim();
    if (!q) return;

    const matched = findEntry(entryId, q);

    setMessages((m) => [...m, { id: nextId(), from: "user", text: q }]);
    setInput("");
    if (matched) setUsedIds((s) => new Set(s).add(matched.id));
    setPending(true);

    timer.current = setTimeout(() => {
      const followups = matched?.followups
        ?.map((id) => chat.entries.find((e) => e.id === id))
        .filter((e): e is ChatEntry => !!e);

      setMessages((m) => [
        ...m,
        {
          id: nextId(),
          from: "assistant",
          text: matched?.answer ?? chat.fallback,
          example: matched?.example,
          followups,
        },
      ]);
      setPending(false);
    }, REPLY_MS);
  }

  const openPrompts = chat.entries.filter(
    (e) => e.id !== "simpler" && e.id !== "harder" && !usedIds.has(e.id),
  );

  return (
    <div id="chat" className="flex h-[32rem] w-full flex-col rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3 text-sm">
        <span className="grid size-6 place-items-center rounded-md bg-muted">
          <Bot className="size-3.5 text-muted-foreground" />
        </span>
        <span className="font-medium">Concept tutor</span>
        <span className="text-xs text-muted-foreground">· scripted · about this concept, not your sessions</span>
      </div>

      <div className="app-scroll flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {messages.map((m) => (
          <div key={m.id} className={cn("flex", m.from === "user" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                m.from === "user" ? "bg-foreground text-background" : "bg-muted text-foreground",
              )}
            >
              <p>{m.text}</p>

              {m.example ? (
                <div className="mt-2.5 space-y-1 rounded-lg bg-background/60 p-2.5 text-xs">
                  <p><span className="font-medium">Prompt: </span>{m.example.prompt}</p>
                  <p><span className="font-medium text-warn-foreground dark:text-warn">The slip: </span>{m.example.wrongMove}</p>
                  <p><span className="font-medium text-ok">The fix: </span>{m.example.rightMove}</p>
                  <p><span className="font-medium">Answer: </span>{m.example.answer}</p>
                </div>
              ) : null}

              {m.followups?.length ? (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {m.followups.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      disabled={pending}
                      onClick={() => ask(f.question, f.id)}
                      className="rounded-full border border-border/60 bg-background/60 px-2.5 py-1 text-xs transition-colors hover:border-foreground/40 disabled:opacity-50"
                    >
                      Next: {f.label}
                    </button>
                  ))}
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

      <div className="border-t border-border p-3">
        <div className="mb-2 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() => ask("Explain it simpler", "simpler")}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium transition-colors hover:border-foreground/40 disabled:opacity-50"
          >
            <Sparkles className="size-3" aria-hidden />
            Explain it simpler
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => ask("Give me a harder example", "harder")}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium transition-colors hover:border-foreground/40 disabled:opacity-50"
          >
            <Zap className="size-3" aria-hidden />
            Give me a harder example
          </button>
        </div>

        {openPrompts.length ? (
          <div className="mb-2 flex flex-wrap gap-2">
            {openPrompts.map((e) => (
              <button
                key={e.id}
                type="button"
                disabled={pending}
                onClick={() => ask(e.question, e.id)}
                className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground disabled:opacity-50"
              >
                {e.label}
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
            placeholder="Ask about this concept…"
            className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
          />
          <Button type="submit" size="icon" disabled={pending || !input.trim()}>
            <Send className="size-4" />
          </Button>
        </form>

        <p className="mt-2 text-center text-xs text-muted-foreground">
          <a href="#notes" className="underline-offset-2 hover:underline">Back to the notes</a>
          {" · "}
          <a href="#resources" className="underline-offset-2 hover:underline">See resources</a>
        </p>
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
