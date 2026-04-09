"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

const nav = [
  { href: "/dashboard",                    label: "Home",          icon: "⊞", color: "var(--sage-light)" },
  { href: "/dashboard/chat",               label: "AI Doctor",     icon: "💬", color: "var(--lavender)"   },
  { href: "/dashboard/labs",               label: "Lab Analysis",  icon: "🔬", color: "var(--blush)"      },
  { href: "/dashboard/prescriptions",      label: "Prescriptions", icon: "💊", color: "var(--amber-soft)" },
  { href: "/dashboard/longevity",          label: "Longevity",     icon: "📈", color: "var(--sage-light)" },
];

export default function Sidebar() {
  const path = usePathname();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [initials, setInitials] = useState("?");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      if (!data.user) return;
      const n = data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "User";
      setName(n); setEmail(data.user.email || "");
      setInitials(n.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0,2));
      if (data.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL || data.user.email?.endsWith("@admin")) setIsAdmin(true);
    });
  }, []);

  async function logout() {
    await createClient().auth.signOut();
    router.push("/auth/login"); router.refresh();
  }

  return (
    <aside style={{ width: 230, background: "var(--forest)", minHeight: "100vh", display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50, borderRight: "1px solid rgba(255,255,255,0.06)" }}>
      {/* Logo */}
      <div style={{ padding: "1.5rem 1.5rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <div style={{ fontFamily: "'Fraunces',serif", fontSize: "1.6rem", color: "#F5EFE0", letterSpacing: "-0.02em", lineHeight: 1 }}>Snortle</div>
          <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.35)", marginTop: "0.2rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>Health Platform</div>
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ padding: "0.75rem 0.75rem", flex: 1 }}>
        <div style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.25)", letterSpacing: "0.12em", textTransform: "uppercase", padding: "0.5rem 0.75rem 0.4rem" }}>Menu</div>
        {nav.map(({ href, label, icon, color }) => {
          const active = path === href || (href !== "/dashboard" && path.startsWith(href));
          return (
            <Link key={href} href={href} style={{ display: "flex", alignItems: "center", gap: "0.7rem", padding: "0.6rem 0.75rem", borderRadius: 10, marginBottom: 3, background: active ? "rgba(255,255,255,0.1)" : "transparent", color: active ? "#F5EFE0" : "rgba(255,255,255,0.5)", textDecoration: "none", fontSize: "0.875rem", fontWeight: active ? 500 : 400, transition: "all 0.15s" }}>
              <span style={{ width: 30, height: 30, borderRadius: 8, background: active ? color : "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", flexShrink: 0, transition: "all 0.15s" }}>{icon}</span>
              {label}
            </Link>
          );
        })}
        {isAdmin && (
          <>
            <div style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.25)", letterSpacing: "0.12em", textTransform: "uppercase", padding: "0.75rem 0.75rem 0.4rem", marginTop: "0.5rem" }}>Admin</div>
            <Link href="/admin" style={{ display: "flex", alignItems: "center", gap: "0.7rem", padding: "0.6rem 0.75rem", borderRadius: 10, background: path.startsWith("/admin") ? "rgba(255,255,255,0.1)" : "transparent", color: path.startsWith("/admin") ? "#F5EFE0" : "rgba(255,255,255,0.5)", textDecoration: "none", fontSize: "0.875rem" }}>
              <span style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(212,144,138,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem" }}>🔐</span>
              Admin Portal
            </Link>
          </>
        )}
      </nav>

      {/* User */}
      <div style={{ padding: "0.875rem 1rem", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.6rem" }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--sage-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.78rem", color: "var(--forest)", fontWeight: 600, flexShrink: 0 }}>{initials}</div>
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontSize: "0.82rem", color: "#F5EFE0", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name || "..."}</div>
            <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{email}</div>
          </div>
        </div>
        <button onClick={logout} style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "0.4rem", color: "rgba(255,255,255,0.45)", fontSize: "0.75rem", cursor: "pointer" }}>Sign out</button>
      </div>
    </aside>
  );
}
