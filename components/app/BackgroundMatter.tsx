"use client";

import dynamic from "next/dynamic";

const GenerativeArtScene = dynamic(
  () =>
    import("@/components/ui/anomalous-matter-hero").then(
      (m) => m.GenerativeArtScene,
    ),
  { ssr: false },
);

/**
 * Fixed wallpaper behind every route. Opacity keeps the neon field as ground,
 * not content. pointer-events none so it never intercepts the UI.
 */
export function BackgroundMatter() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 opacity-[0.14]"
    >
      <GenerativeArtScene />
    </div>
  );
}
