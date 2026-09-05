import { RouteTabs } from "@/components/app/RouteTabs";

export function AdminTabs() {
  return (
    <RouteTabs
      tabs={[
        { label: "Overview", href: "/admin" },
        { label: "Catalogue", href: "/admin/catalogue" },
        { label: "Coverage", href: "/admin/coverage" },
        { label: "Performance", href: "/admin/performance" },
        { label: "Provenance", href: "/admin/provenance" },
      ]}
    />
  );
}
