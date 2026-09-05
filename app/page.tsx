"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useSession, type Role } from "@/lib/session";
import { ROLES, ROLE_ORDER } from "@/lib/roles";
import { cn } from "@/lib/utils";

export default function RolePicker() {
  const { signIn } = useSession();
  const router = useRouter();

  const enter = (role: Role) => {
    signIn(role);
    router.push(ROLES[role].home);
  };

  return (
    <main className="relative flex min-h-[100dvh] w-full flex-col">
      <div className="flex items-center gap-2 px-6 py-5">
        <span className="grid size-6 place-items-center rounded-md bg-foreground text-[13px] font-bold text-background">
          S
        </span>
        <span className="text-sm font-semibold tracking-tight">Sonder</span>
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 pb-16">
        <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Proof of concept
        </span>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-[2.5rem] sm:leading-[1.1]">
          Adaptive misconception diagnosis
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          One engine across Maths, Physics and Chemistry. Every result passes a
          teacher before a student or parent sees it. This build runs on scripted
          data — choose a workspace to sign in.
        </p>

        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          {ROLE_ORDER.map((role) => {
            const meta = ROLES[role];
            const Icon = meta.icon;
            return (
              <button
                key={role}
                type="button"
                onClick={() => enter(role)}
                className={cn(
                  "group flex flex-col gap-3 rounded-xl border border-border bg-card p-5 text-left",
                  "shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/25 hover:shadow-sm",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="grid size-9 place-items-center rounded-lg bg-muted text-foreground">
                    <Icon className="size-5" />
                  </span>
                  <ArrowRight className="size-4 -translate-x-1 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{meta.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {meta.person} · {meta.context}
                  </p>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {meta.blurb}
                </p>
              </button>
            );
          })}
        </div>

        <div className="mt-10 flex items-center gap-4 text-xs text-muted-foreground">
          <Link href="/dev/components" className="hover:text-foreground">
            Component gallery
          </Link>
          <span aria-hidden>·</span>
          <span>No real backend, auth or AI. Data is fixture-scripted.</span>
        </div>
      </div>
    </main>
  );
}
