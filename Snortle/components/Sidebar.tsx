"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

const nav = [
  { href: "/dashboard",                 label: "Overview",      icon: "⊞" },
  { href: "/dashboard/chat",            label: "AI Doctor",     icon: "✦" },
  { href: "/dashboard/labs",            label: "Lab Analysis",  icon: "◎" },
  { href: "/dashboard/prescriptions",   label: "Prescriptions", icon: "⬡" },
  { href: "/dashboard/longevity",       label: "Longevity",     icon: "◈" },
];

export default function Sidebar() {
  const path = usePathname();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [initials, setInitials] = useState("?");

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      if (!data.user) return;
      const n = data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "User";
      setName(n); setEmail(data.user.email || "");
      setInitials(n.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2));
    });
  }, []);

  async function logout() {
    await createClient().auth.signOut();
    router.push("/auth/login"); router.refresh();
  }

  const isActive = (href: string) => href === "/dashboard" ? path === href : path.startsWith(href);

  return (
    <aside style={{
      width: 220, minHeight: "100vh", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50,
      background: "var(--teal-deep)",
      borderRight: "1px solid rgba(255,255,255,0.06)",
      display: "flex", flexDirection: "column",
    }}>
      {/* Logo */}
      <div style={{ padding: "1.5rem 1.5rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.65rem", color: "#F9F4EA", letterSpacing: "-0.01em", lineHeight: 1, fontStyle: "italic" }}>
            Snortle
          </div>
          <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.3)", marginTop: "0.3rem", letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "'Inter',sans-serif" }}>
            Health Platform
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ padding: "0.75rem 0.875rem", flex: 1 }}>
        <div style={{ fontSize: "0.58rem", fontWeight: 600, color: "rgba(255,255,255,0.22)", letterSpacing: "0.16em", textTransform: "uppercase", padding: "0.6rem 0.6rem 0.4rem" }}>
          Navigation
        </div>
        {nav.map(({ href, label, icon }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href} style={{
              display: "flex", alignItems: "center", gap: "0.7rem",
              padding: "0.6rem 0.75rem", borderRadius: 8, marginBottom: "2px",
              background: active ? "rgba(255,255,255,0.12)" : "transparent",
              color: active ? "#F9F4EA" : "rgba(255,255,255,0.5)",
              textDecoration: "none", fontSize: "0.85rem",
              fontWeight: active ? 500 : 400,
              transition: "background 0.15s, color 0.15s",
              borderLeft: active ? "2px solid var(--teal-mid)" : "2px solid transparent",
            }}>
              <span style={{ fontSize: "0.9rem", opacity: active ? 1 : 0.7, width: 18, textAlign: "center" as const }}>{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div style={{ padding: "0.875rem 1rem 1rem", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.7rem" }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--teal-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.72rem", color: "var(--teal-deep)", fontWeight: 700, flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ overflow: "hidden", flex: 1 }}>
            <div style={{ fontSize: "0.8rem", color: "#F9F4EA", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name || "Loading..."}</div>
            <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{email}</div>
          </div>
        </div>
        <button onClick={logout} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "0.38rem", color: "rgba(255,255,255,0.4)", fontSize: "0.72rem", cursor: "pointer" }}>
          Sign out
        </button>
      </div>
    </aside>
  );
}
