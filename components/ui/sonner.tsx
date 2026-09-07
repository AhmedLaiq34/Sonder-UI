"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";
import { Check, AlertTriangle, Minus } from "lucide-react";

/**
 * Dark only, so the theme is hardcoded. Icons follow the plan's four status
 * buckets: confirmed, attention, inert. There is no error/red state anywhere
 * in this build, so `error` reuses the attention glyph.
 */
const Toaster = (props: ToasterProps) => (
  <Sonner
    theme="dark"
    className="toaster group"
    icons={{
      success: <Check className="size-4" strokeWidth={1.5} />,
      info: <Minus className="size-4" strokeWidth={1.5} />,
      warning: <AlertTriangle className="size-4" strokeWidth={1.5} />,
      error: <AlertTriangle className="size-4" strokeWidth={1.5} />,
      loading: <Minus className="size-4" strokeWidth={1.5} />,
    }}
    style={
      {
        "--normal-bg": "var(--card)",
        "--normal-text": "var(--foreground)",
        "--normal-border": "var(--border-strong)",
        "--border-radius": "0px",
        "--font-family": "var(--stack-sans)",
      } as React.CSSProperties
    }
    toastOptions={{ classNames: { toast: "cn-toast" } }}
    {...props}
  />
);

export { Toaster };
