"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { chromeMode } from "@/lib/chrome";
import { TopBar } from "./TopBar";
import { WorkspaceNav } from "./WorkspaceNav";

/**
 * Persistent chrome. The document is the scroll container except on consultant
 * routes, where ChatFrame owns an inner scroller and main is overflow-hidden
 * so the page itself does not scroll.
 *
 * The header is always mounted on landing and product so crossing `/` and a
 * role home only swaps slots. The component gallery stays chrome-free.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const mode = chromeMode(pathname);
  const consultant = pathname.endsWith("/consultant");

  if (mode === "gallery") {
    return <div className="relative z-[1]">{children}</div>;
  }

  return (
    <div className="relative z-[1] min-h-dvh bg-transparent">
      <a
        href={mode === "landing" ? "#narrative" : "#main"}
        className="skip-link"
      >
        {mode === "landing" ? "Skip to how it works" : "Skip to content"}
      </a>

      <TopBar />

      {mode === "landing" ? (
        children
      ) : (
        <div className="flex min-w-0 w-full">
          <WorkspaceNav />
          <main
            id="main"
            tabIndex={-1}
            className={cn("min-w-0 flex-1", consultant ? "overflow-hidden" : "pb-28")}
          >
            {children}
          </main>
        </div>
      )}
    </div>
  );
}
