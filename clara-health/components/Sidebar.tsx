"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: "⊞" },
  { href: "/dashboard/chat", label: "AI Doctor", icon: "💬" },
  { href: "/dashboard/labs", label: "Lab Analysis", icon: "🔬" },
  { href: "/dashboard/prescriptions", label: "Prescriptions", icon: "💊" },
  { href: "/dashboard/longevity", label: "Longevity", icon: "📈" },
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <aside style={{ width: 220, background: "var(--green)", minHeight: "100vh", display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, bottom: 0 }}>
      <div style={{ padding: "1.5rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <Link href="/" style={{ fontFamily: "'DM Serif Display',serif", fontSize: "1.5rem", color: "var(--cream)", textDecoration: "none" }}>Clara</Link>
        <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.45)", marginTop: 2 }}>AI Health Platform</div>
      </div>
      <nav style={{ padding: "1rem 0.75rem", flex: 1 }}>
        {nav.map(({ href, label, icon }) => {
          const active = path === href || (href !== "/dashboard" && path.startsWith(href));
          return (
            <Link key={href} href={href} style={{
              display: "flex", alignItems: "center", gap: "0.75rem",
              padding: "0.65rem 0.75rem", borderRadius: 10, marginBottom: 4,
              background: active ? "rgba(255,255,255,0.12)" : "transparent",
              color: active ? "var(--cream)" : "rgba(255,255,255,0.6)",
              textDecoration: "none", fontSize: "0.88rem",
              fontWeight: active ? 500 : 400, transition: "all 0.15s"
            }}>
              <span style={{ fontSize: "1rem" }}>{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>
      <div style={{ padding: "1rem 1.25rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", color: "var(--cream)", fontWeight: 500 }}>MP</div>
          <div>
            <div style={{ fontSize: "0.82rem", color: "var(--cream)", fontWeight: 500 }}>Monish P.</div>
            <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)" }}>Pro plan</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
