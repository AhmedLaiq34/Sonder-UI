"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "@/lib/session";
import { MusicProvider } from "@/lib/music";
import { BackgroundMatter } from "@/components/app/BackgroundMatter";

/**
 * There is no theme provider. This build is dark only: `globals.css` defines one
 * palette on :root and `app/layout.tsx` hardcodes class="dark" on <html>.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <MusicProvider>
        <BackgroundMatter />
        <TooltipProvider delay={200}>{children}</TooltipProvider>
        <Toaster />
      </MusicProvider>
    </SessionProvider>
  );
}
