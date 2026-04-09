"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const recentLabs = [
  { name: "LDL Cholesterol", value: "142 mg/dL", status: "high", date: "Apr 2" },
  { name: "HbA1c",           value: "5.4%",      status: "normal", date: "Apr 2" },
  { name: "Vitamin D",       value: "42 ng/mL",  status: "normal", date: "Mar 15" },
  { name: "TSH",             value: "2.1 mIU/L", status: "normal", date: "Mar 15" },
];

const meds = [
  { name: "Metformin 500mg",   dose: "Twice daily",  daysLeft: 11, status: "active" },
  { name: "Atorvastatin 20mg", dose: "Once nightly", daysLeft: 5,  status: "refill" },
  { name: "Vitamin D3 5000IU", dose: "Once daily",   daysLeft: 22, status: "active" },
];

const actions = [
  { icon: "💬", label: "Ask Snortle", desc: "Health Q&A, 24/7",    href: "/dashboard/chat",          bg: "var(--lavender)" },
  { icon: "🔬", label: "Analyse Labs", desc: "Paste or upload PDF", href: "/dashboard/labs",          bg: "var(--blush)" },
  { icon: "💊", label: "Refill Rx",    desc: "Clinician-reviewed",  href: "/dashboard/prescriptions", bg: "var(--amber-soft)" },
  { icon: "📈", label: "Longevity",    desc: "Biological age",      href: "/dashboard/longevity",     bg: "var(--sage-light)" },
];

export default function DashboardPage() {
  const [name, setName] = useState("there");
  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      if (data.user) {
        const n = data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "there";
        setName(n.split(" ")[0]);
      }
    });
  }, []);

  const hour = new Date().getHours();
  const g = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div style={{ padding: "2rem 2.5rem 4rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.75rem" }}>
        <div style={{ fontSize: "0.7rem", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--sage)", marginBottom: "0.2rem" }}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </div>
        <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: "2rem", color: "var(--text)", letterSpacing: "-0.02em" }}>{g}, {name}</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginTop: "0.2rem" }}>Here&apos;s your health snapshot for today.</p>
      </div>

      {/* Quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "0.875rem", marginBottom: "1.75rem" }}>
        {actions.map(({ icon, label, desc, href, bg }) => (
          <Link key={href} href={href} style={{ background: "white", borderRadius: 16, border: "1px solid var(--border)", padding: "1.1rem", textDecoration: "none", display: "block", boxShadow: "var(--shadow)", transition: "transform 0.15s" }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", marginBottom: "0.65rem" }}>{icon}</div>
            <div style={{ fontWeight: 500, fontSize: "0.88rem", color: "var(--text)", marginBottom: "0.2rem" }}>{label}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{desc}</div>
          </Link>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
        {/* Labs */}
        <div style={{ background: "white", borderRadius: 20, border: "1px solid var(--border)", overflow: "hidden", boxShadow: "var(--shadow)" }}>
          <div style={{ padding: "1.1rem 1.5rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontWeight: 500, fontSize: "0.9rem" }}>Recent Labs</div>
            <Link href="/dashboard/labs" style={{ fontSize: "0.78rem", color: "var(--sage)", textDecoration: "none" }}>Analyse new →</Link>
          </div>
          {recentLabs.map(l => (
            <div key={l.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1.5rem", borderBottom: "1px solid var(--border)" }}>
              <div>
                <div style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--text)" }}>{l.name}</div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{l.date}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>{l.value}</span>
                <span style={{ fontSize: "0.68rem", padding: "2px 7px", borderRadius: 100, fontWeight: 500, background: l.status === "high" ? "var(--blush)" : "var(--sage-light)", color: l.status === "high" ? "var(--rose-deep)" : "var(--forest)" }}>
                  {l.status === "high" ? "↑ High" : "✓ OK"}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Meds */}
        <div style={{ background: "white", borderRadius: 20, border: "1px solid var(--border)", overflow: "hidden", boxShadow: "var(--shadow)" }}>
          <div style={{ padding: "1.1rem 1.5rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontWeight: 500, fontSize: "0.9rem" }}>Active Medications</div>
            <Link href="/dashboard/prescriptions" style={{ fontSize: "0.78rem", color: "var(--sage)", textDecoration: "none" }}>Manage →</Link>
          </div>
          {meds.map(m => (
            <div key={m.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.8rem 1.5rem", borderBottom: "1px solid var(--border)" }}>
              <div>
                <div style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--text)" }}>{m.name}</div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{m.dose}</div>
              </div>
              <span style={{ fontSize: "0.68rem", padding: "3px 8px", borderRadius: 100, fontWeight: 500, background: m.status === "refill" ? "var(--amber-soft)" : "var(--sage-light)", color: m.status === "refill" ? "var(--amber)" : "var(--forest)" }}>
                {m.status === "refill" ? `Refill ${m.daysLeft}d` : "Active"}
              </span>
            </div>
          ))}
        </div>

        {/* Longevity score */}
        <div style={{ background: "var(--forest)", borderRadius: 20, padding: "1.5rem", boxShadow: "var(--shadow)" }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.4)", marginBottom: "0.5rem" }}>Longevity Score</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem", marginBottom: "0.875rem" }}>
            <span style={{ fontFamily: "'Fraunces',serif", fontSize: "3.8rem", lineHeight: 1, color: "#F5EFE0", letterSpacing: "-0.03em" }}>74</span>
            <span style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.9rem", marginBottom: "0.6rem" }}>/100</span>
          </div>
          <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 4, height: 5, marginBottom: "0.875rem" }}>
            <div style={{ background: "var(--sage-light)", width: "74%", height: "100%", borderRadius: 4 }} />
          </div>
          <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.65)", marginBottom: "1.1rem" }}>
            Biological age: <strong style={{ color: "#F5EFE0" }}>31 yrs</strong> — 2 yrs below chronological
          </div>
          <Link href="/dashboard/longevity" style={{ display: "inline-block", background: "rgba(255,255,255,0.12)", color: "#F5EFE0", padding: "0.5rem 1.1rem", borderRadius: 100, fontSize: "0.78rem", textDecoration: "none" }}>Full report →</Link>
        </div>

        {/* Recommendations */}
        <div style={{ background: "white", borderRadius: 20, border: "1px solid var(--border)", padding: "1.25rem", boxShadow: "var(--shadow)" }}>
          <div style={{ fontWeight: 500, fontSize: "0.9rem", marginBottom: "0.25rem" }}>Snortle&apos;s Recommendations</div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "1rem" }}>Based on your recent results</div>
          {[
            { icon: "💊", text: "Discuss statin therapy — LDL above goal for your risk profile.", u: "soon" },
            { icon: "🥗", text: "Increase omega-3 intake to support lipid profile.", u: "routine" },
            { icon: "🏃", text: "30 min moderate cardio 3×/week lowers LDL by ~10%.", u: "routine" },
            { icon: "🔬", text: "Repeat lipid panel in 3 months after dietary changes.", u: "routine" },
          ].map((r, i) => (
            <div key={i} style={{ display: "flex", gap: "0.6rem", marginBottom: "0.7rem", padding: "0.65rem 0.75rem", background: "var(--cream-warm)", borderRadius: 10 }}>
              <span style={{ fontSize: "0.9rem", flexShrink: 0 }}>{r.icon}</span>
              <span style={{ fontSize: "0.82rem", color: "var(--text)", lineHeight: 1.5, flex: 1 }}>{r.text}</span>
              <span style={{ fontSize: "0.65rem", padding: "2px 7px", borderRadius: 100, fontWeight: 500, alignSelf: "flex-start", flexShrink: 0, background: r.u === "soon" ? "var(--amber-soft)" : "var(--sage-light)", color: r.u === "soon" ? "var(--amber)" : "var(--forest)" }}>{r.u}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
