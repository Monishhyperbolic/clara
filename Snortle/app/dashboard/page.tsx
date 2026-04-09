"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const recentLabs = [
  { name: "LDL Cholesterol", value: "142 mg/dL", status: "high", date: "Apr 2, 2026" },
  { name: "HbA1c", value: "5.4%", status: "normal", date: "Apr 2, 2026" },
  { name: "Vitamin D", value: "42 ng/mL", status: "normal", date: "Mar 15, 2026" },
  { name: "TSH", value: "2.1 mIU/L", status: "normal", date: "Mar 15, 2026" },
];

const meds = [
  { name: "Metformin 500mg", dose: "Twice daily", refillIn: 12, status: "active" },
  { name: "Atorvastatin 20mg", dose: "Once nightly", refillIn: 5, status: "refill" },
  { name: "Vitamin D3 5000 IU", dose: "Once daily", refillIn: 20, status: "active" },
];

const quickActions = [
  { label: "Chat with Snortle", icon: "💬", href: "/dashboard/chat", desc: "Ask anything about your health" },
  { label: "Analyze Labs", icon: "🔬", href: "/dashboard/labs", desc: "Paste or upload lab results" },
  { label: "Request Refill", icon: "💊", href: "/dashboard/prescriptions", desc: "Draft a clinician-reviewed refill" },
  { label: "Longevity Score", icon: "📈", href: "/dashboard/longevity", desc: "See your biological age estimate" },
];

export default function DashboardPage() {
  const [userName, setUserName] = useState("there");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        const name = data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "there";
        setUserName(name.split(" ")[0]); // first name only
      }
    });
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div style={{ padding: "2.5rem 2.5rem 4rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ fontSize: "0.78rem", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "var(--green-light)", marginBottom: "0.25rem" }}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </div>
        <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "2.2rem", color: "var(--green)", letterSpacing: "-0.02em" }}>
          {greeting}, {userName}
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginTop: "0.25rem" }}>
          Here&apos;s your health summary for today.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem", marginBottom: "2rem" }}>
        {quickActions.map(({ label, icon, href, desc }) => (
          <Link key={href} href={href} style={{ background: "white", borderRadius: 16, border: "1px solid var(--border)", padding: "1.25rem", textDecoration: "none", display: "block" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.6rem" }}>{icon}</div>
            <div style={{ fontWeight: 500, fontSize: "0.92rem", color: "var(--text)", marginBottom: "0.25rem" }}>{label}</div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.4 }}>{desc}</div>
          </Link>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <div style={{ background: "white", borderRadius: 20, border: "1px solid var(--border)", overflow: "hidden" }}>
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 500, fontSize: "0.95rem" }}>Recent Lab Results</div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 2 }}>Last panel: Apr 2, 2026</div>
            </div>
            <Link href="/dashboard/labs" style={{ fontSize: "0.8rem", color: "var(--green-light)", textDecoration: "none" }}>View all →</Link>
          </div>
          <div>
            {recentLabs.map(lab => (
              <div key={lab.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1.5rem", borderBottom: "1px solid var(--border)" }}>
                <div>
                  <div style={{ fontSize: "0.88rem", fontWeight: 500 }}>{lab.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{lab.date}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <span style={{ fontSize: "0.88rem", fontWeight: 500 }}>{lab.value}</span>
                  <span style={{ fontSize: "0.7rem", padding: "2px 8px", borderRadius: 100, fontWeight: 500, background: lab.status === "high" ? "#FDECD9" : "var(--green-muted)", color: lab.status === "high" ? "#C8632A" : "var(--green)" }}>
                    {lab.status === "high" ? "↑ High" : "✓ Normal"}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: "1rem 1.5rem" }}>
            <Link href="/dashboard/labs" style={{ display: "block", textAlign: "center" as const, background: "var(--green-muted)", color: "var(--green)", padding: "0.6rem", borderRadius: 10, fontSize: "0.85rem", fontWeight: 500, textDecoration: "none" }}>Analyze new labs</Link>
          </div>
        </div>

        <div style={{ background: "white", borderRadius: 20, border: "1px solid var(--border)", overflow: "hidden" }}>
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 500, fontSize: "0.95rem" }}>Active Medications</div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 2 }}>3 active · 1 needs refill</div>
            </div>
            <Link href="/dashboard/prescriptions" style={{ fontSize: "0.8rem", color: "var(--green-light)", textDecoration: "none" }}>Manage →</Link>
          </div>
          <div>
            {meds.map(med => (
              <div key={med.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.875rem 1.5rem", borderBottom: "1px solid var(--border)" }}>
                <div>
                  <div style={{ fontSize: "0.88rem", fontWeight: 500 }}>{med.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{med.dose}</div>
                </div>
                <span style={{ fontSize: "0.72rem", padding: "3px 8px", borderRadius: 100, fontWeight: 500, background: med.status === "refill" ? "#FDF5E0" : "var(--green-muted)", color: med.status === "refill" ? "#8A6B00" : "var(--green)" }}>
                  {med.status === "refill" ? `Refill in ${med.refillIn}d` : "Active"}
                </span>
              </div>
            ))}
          </div>
          <div style={{ padding: "1rem 1.5rem" }}>
            <Link href="/dashboard/prescriptions" style={{ display: "block", textAlign: "center" as const, background: "var(--green-muted)", color: "var(--green)", padding: "0.6rem", borderRadius: 10, fontSize: "0.85rem", fontWeight: 500, textDecoration: "none" }}>Request refill</Link>
          </div>
        </div>

        <div style={{ background: "var(--green)", borderRadius: 20, padding: "1.5rem" }}>
          <div style={{ fontSize: "0.78rem", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.5)", marginBottom: "0.5rem" }}>Longevity Score</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "0.75rem", marginBottom: "1rem" }}>
            <span style={{ fontFamily: "'DM Serif Display',serif", fontSize: "4rem", lineHeight: 1, letterSpacing: "-0.03em", color: "var(--cream)" }}>74</span>
            <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem", marginBottom: "0.5rem" }}>/100</span>
          </div>
          <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 6, height: 6, marginBottom: "1rem" }}>
            <div style={{ background: "var(--cream)", width: "74%", height: "100%", borderRadius: 6 }} />
          </div>
          <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", marginBottom: "1.25rem" }}>
            Estimated biological age: <strong style={{ color: "var(--cream)" }}>31 years</strong>
          </div>
          <Link href="/dashboard/longevity" style={{ display: "inline-block", background: "rgba(255,255,255,0.15)", color: "var(--cream)", padding: "0.6rem 1.25rem", borderRadius: 100, fontSize: "0.82rem", textDecoration: "none" }}>View full report →</Link>
        </div>

        <div style={{ background: "white", borderRadius: 20, border: "1px solid var(--border)", padding: "1.5rem" }}>
          <div style={{ fontWeight: 500, fontSize: "0.95rem", marginBottom: "0.25rem" }}>Snortle&apos;s Recommendations</div>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>Based on your recent results</div>
          {[
            { icon: "💊", text: "Discuss statin therapy — LDL is above goal for your risk profile.", urgency: "soon" },
            { icon: "🥗", text: "Increase omega-3 intake to support your lipid profile.", urgency: "routine" },
            { icon: "🔬", text: "Repeat lipid panel in 3 months after dietary changes.", urgency: "routine" },
            { icon: "🏃", text: "Add 30 min of moderate cardio 3x/week for LDL reduction.", urgency: "routine" },
          ].map((r, i) => (
            <div key={i} style={{ display: "flex", gap: "0.75rem", marginBottom: "0.875rem", padding: "0.75rem", background: "var(--cream)", borderRadius: 10 }}>
              <span style={{ fontSize: "1rem", flexShrink: 0 }}>{r.icon}</span>
              <span style={{ fontSize: "0.85rem", color: "var(--text)", lineHeight: 1.5, flex: 1 }}>{r.text}</span>
              <span style={{ fontSize: "0.68rem", padding: "2px 8px", borderRadius: 100, fontWeight: 500, alignSelf: "flex-start", flexShrink: 0, background: r.urgency === "soon" ? "#FDF5E0" : "var(--green-muted)", color: r.urgency === "soon" ? "#8A6B00" : "var(--green)" }}>{r.urgency}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
