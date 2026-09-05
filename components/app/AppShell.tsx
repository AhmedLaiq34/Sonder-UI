"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  PanelLeftClose,
  PanelLeft,
  Menu,
  X,
  ChevronsUpDown,
  LogOut,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession, type Role } from "@/lib/session";
import { ROLES, ROLE_ORDER } from "@/lib/roles";
import { NAV, type NavItem } from "@/lib/nav";
import { useLocalFlag } from "@/lib/local-flag";
import { Breadcrumb } from "./Breadcrumb";
import { ThemeToggle } from "./ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { role } = useSession();
  const [collapsed, setCollapsed] = useLocalFlag("sonder.sidebar.collapsed");
  const [mobileOpen, setMobileOpen] = useState(false);

  // Full-bleed routes: the role picker and dev tools carry no shell.
  const bare = pathname === "/" || pathname.startsWith("/dev");
  if (bare) return <>{children}</>;

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background">
      {/* desktop sidebar */}
      <aside
        className={cn(
          "hidden shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 md:flex",
          collapsed ? "w-[var(--sidebar-width-collapsed)]" : "w-[var(--sidebar-width)]",
        )}
      >
        <SidebarBody role={role} collapsed={collapsed} onNavigate={() => {}} />
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="flex h-10 items-center gap-2 border-t border-sidebar-border px-3 text-xs text-muted-foreground transition-colors hover:text-foreground"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeft className="size-4" />
          ) : (
            <>
              <PanelLeftClose className="size-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </aside>

      {/* mobile drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-[var(--sidebar-width)] flex-col border-r border-sidebar-border bg-sidebar">
            <div className="flex h-[var(--header-height)] items-center justify-between border-b border-sidebar-border px-3">
              <Brand />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            <SidebarBody
              role={role}
              collapsed={false}
              onNavigate={() => setMobileOpen(false)}
              hideBrand
            />
          </aside>
        </div>
      ) : null}

      {/* main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[var(--header-height)] shrink-0 items-center gap-3 border-b border-border bg-background/80 px-3 backdrop-blur sm:px-4">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="text-muted-foreground hover:text-foreground md:hidden"
          >
            <Menu className="size-5" />
          </button>
          <div className="min-w-0 flex-1">
            <Breadcrumb />
          </div>
          <ThemeToggle />
          <RoleMenu />
        </header>

        <main className="app-scroll flex-1 overflow-y-auto">
          <div key={pathname} className="page-enter">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function Brand({ collapsed }: { collapsed?: boolean }) {
  const { role } = useSession();
  const home = role ? ROLES[role].home : "/";
  return (
    <Link href={home} className="flex items-center gap-2 overflow-hidden">
      <span className="grid size-6 shrink-0 place-items-center rounded-md bg-foreground text-[13px] font-bold text-background">
        S
      </span>
      {!collapsed ? (
        <span className="truncate text-sm font-semibold tracking-tight">
          Sonder
        </span>
      ) : null}
    </Link>
  );
}

function SidebarBody({
  role,
  collapsed,
  onNavigate,
  hideBrand,
}: {
  role: Role | null;
  collapsed: boolean;
  onNavigate: () => void;
  hideBrand?: boolean;
}) {
  const pathname = usePathname();
  const groups = role ? NAV[role] : [];

  return (
    <div className="app-scroll flex flex-1 flex-col gap-4 overflow-y-auto py-3">
      {!hideBrand ? (
        <div className={cn("px-3", collapsed && "px-2")}>
          <Brand collapsed={collapsed} />
        </div>
      ) : null}

      {role ? (
        <p
          className={cn(
            "px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70",
            collapsed && "hidden",
          )}
        >
          {ROLES[role].label} workspace
        </p>
      ) : null}

      <nav className="flex flex-col gap-4">
        {groups.map((group, gi) => (
          <div key={gi} className="flex flex-col gap-0.5 px-2">
            {group.label && !collapsed ? (
              <p className="px-2 pb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
                {group.label}
              </p>
            ) : null}
            {group.items.map((item) => (
              <SidebarLink
                key={item.href}
                item={item}
                active={
                  item.href === (role ? ROLES[role].home : "/")
                    ? pathname === item.href
                    : pathname.startsWith(item.href)
                }
                collapsed={collapsed}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        ))}
      </nav>
    </div>
  );
}

function SidebarLink({
  item,
  active,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onNavigate: () => void;
}) {
  const Icon = item.icon;
  const link = (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors",
        collapsed && "justify-center",
        active
          ? "bg-sidebar-accent font-medium text-foreground"
          : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
      )}
    >
      <Icon className="size-4 shrink-0" />
      {!collapsed ? <span className="truncate">{item.label}</span> : null}
    </Link>
  );

  if (!collapsed) return link;
  return (
    <Tooltip>
      <TooltipTrigger render={link} />
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  );
}

function RoleMenu() {
  const { role, signIn, signOut } = useSession();
  const router = useRouter();
  if (!role) return null;
  const meta = ROLES[role];
  const initials = meta.person
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="sm" className="gap-2 pl-1.5 pr-2">
            <span className="grid size-6 place-items-center rounded-full bg-muted text-[11px] font-semibold">
              {initials}
            </span>
            <span className="hidden max-w-[12ch] truncate text-sm sm:inline">
              {meta.person}
            </span>
            <ChevronsUpDown className="size-3.5 text-muted-foreground" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-60">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{meta.person}</p>
          <p className="text-xs text-muted-foreground">{meta.context}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Switch workspace</DropdownMenuLabel>
          {ROLE_ORDER.map((r) => {
            const m = ROLES[r];
            const Icon = m.icon;
            return (
              <DropdownMenuItem
                key={r}
                onClick={() => {
                  signIn(r);
                  router.push(m.home);
                }}
              >
                <Icon className="size-4 text-muted-foreground" />
                <span className="flex-1">{m.label}</span>
                {r === role ? <Check className="size-3.5" /> : null}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            signOut();
            router.push("/");
          }}
        >
          <LogOut className="size-4 text-muted-foreground" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
