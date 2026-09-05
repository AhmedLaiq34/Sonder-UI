"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, type Role } from "@/lib/session";

/**
 * Wrap a role area's pages. Content always renders (so pages server-render
 * normally); this only runs two client-side corrections once the session is
 * known: bounce a signed-out visitor to the picker, and adopt the role of a
 * page that was deep-linked while signed in as someone else.
 */
export function RoleGate({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const { role: current, ready, signIn } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!current) router.replace("/");
    else if (current !== role) signIn(role);
  }, [ready, current, role, router, signIn]);

  return <>{children}</>;
}
