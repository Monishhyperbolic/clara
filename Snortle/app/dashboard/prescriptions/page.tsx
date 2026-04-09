"use client";
import { useState } from "react";

const activeMeds = [
  { name: "Metformin", dose: "500mg", frequency: "Twice daily", prescriber: "Dr. S. Patel, MD", refillDate: "Apr 20, 2026", daysLeft: 11, status: "active" },
  { name: "Atorvastatin", dose: "20mg", frequency: "Once nightly", prescriber: "Dr. S. Patel, MD", refillDate: "Apr 14, 2026", daysLeft: 5, status: "refill" },
  { name: "Vitamin D3", dose: "5000 IU", frequency: "Once daily", prescriber: "Dr. S. Patel, MD", refillDate: "May 1, 2026", daysLeft: 22, status: "active" },
];

interface RxDraft {
  draftNote: string;
  interactions: string[];
  warnings: string[];
  urgency: string;
  suggestedDose: string;
  clinicianNote: string;
}

export default function PrescriptionsPage() {
  const [tab, setTab] = useState<"active" | "request">("active");
  const [form, setForm] = useState({ medication: "", reason: "", currentMeds: "Metformin 500mg, Atorvastatin 20mg, Vitamin D3 5000IU", allergies: "Penicillin" });
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<RxDraft | null>(null);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function requestRefill() {
    if (!form.medication || !form.reason) return;
    setLoading(true);
    setError("");
    setDraft(null);
    try {
      const res = await fetch("/api/prescription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setDraft(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Request failed. Check your API key.");
    } finally {
      setLoading(false);
    }
  }

  const urgencyColor = (u: string) => ({
    routine: { bg: "var(--green-muted)", text: "var(--green)" },
    soon: { bg: "#FDF5E0", text: "#8A6B00" },
    urgent: { bg: "#FCEBEB", text: "#A32D2D" },
  }[u] ?? { bg: "var(--green-muted)", text: "var(--green)" });

  return (
    <div style={{ padding: "2.5rem 2.5rem 4rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ fontSize: "0.78rem", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "var(--green-light)", marginBottom: "0.25rem" }}>Clinician-Reviewed</div>
        <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "2.2rem", color: "var(--green)", letterSpacing: "-0.02em" }}>Prescriptions</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginTop: "0.25rem" }}>Manage active medications and request refills — reviewed by your clinician.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.75rem", background: "white", borderRadius: 12, padding: "0.3rem", border: "1px solid var(--border)", width: "fit-content" }}>
        {(["active","request"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "0.5rem 1.25rem", borderRadius: 9, border: "none", cursor: "pointer",
            background: tab === t ? "var(--green)" : "transparent",
            color: tab === t ? "var(--cream)" : "var(--text-muted)",
            fontSize: "0.88rem", fontWeight: tab === t ? 500 : 400, transition: "all 0.15s"
          }}>
            {t === "active" ? "Active Medications" : "Request Refill"}
          </button>
        ))}
      </div>

      {tab === "active" && (
        <div>
          {activeMeds.map((med, i) => (
            <div key={i} style={{ background: "white", borderRadius: 16, border: "1px solid var(--border)", padding: "1.25rem 1.5rem", marginBottom: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: med.status === "refill" ? "#FDF5E0" : "var(--green-muted)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>💊</div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: "0.95rem", color: "var(--text)" }}>{med.name} {med.dose}</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 2 }}>{med.frequency} · {med.prescriber}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ textAlign: "right" as const }}>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Refill by</div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 500, color: med.daysLeft <= 7 ? "#C8632A" : "var(--text)" }}>{med.refillDate} ({med.daysLeft}d)</div>
                </div>
                <span style={{ fontSize: "0.72rem", padding: "4px 10px", borderRadius: 100, fontWeight: 500, background: med.status === "refill" ? "#FDF5E0" : "var(--green-muted)", color: med.status === "refill" ? "#8A6B00" : "var(--green)" }}>
                  {med.status === "refill" ? "Refill due" : "Active"}
                </span>
                {med.status === "refill" && (
                  <button onClick={() => { setTab("request"); setForm(f => ({ ...f, medication: `${med.name} ${med.dose}` })); }} style={{ background: "var(--green)", color: "var(--cream)", border: "none", borderRadius: 100, padding: "0.4rem 1rem", fontSize: "0.8rem", cursor: "pointer" }}>
                    Request refill
                  </button>
                )}
              </div>
            </div>
          ))}
          <div style={{ background: "var(--cream-dark)", borderRadius: 16, padding: "1rem 1.5rem", fontSize: "0.82rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>🔒</span> All medications are reviewed and managed by your assigned clinician.
          </div>
        </div>
      )}

      {tab === "request" && !draft && (
        <div style={{ background: "white", borderRadius: 20, border: "1px solid var(--border)", padding: "2rem" }}>
          <div style={{ fontWeight: 500, fontSize: "1rem", marginBottom: "1.5rem", color: "var(--text)" }}>New Refill Request</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.82rem", fontWeight: 500, color: "var(--text-mid)", display: "block", marginBottom: "0.4rem" }}>Medication & Dose *</label>
              <input value={form.medication} onChange={e => setForm(f => ({ ...f, medication: e.target.value }))} placeholder="e.g. Atorvastatin 20mg" style={{ width: "100%", border: "1.5px solid var(--border)", borderRadius: 10, padding: "0.65rem 0.875rem", fontFamily: "'DM Sans',sans-serif", fontSize: "0.88rem", color: "var(--text)", background: "var(--cream)", outline: "none" }} />
            </div>
            <div>
              <label style={{ fontSize: "0.82rem", fontWeight: 500, color: "var(--text-mid)", display: "block", marginBottom: "0.4rem" }}>Reason for Refill *</label>
              <input value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} placeholder="e.g. Running low, ongoing maintenance" style={{ width: "100%", border: "1.5px solid var(--border)", borderRadius: 10, padding: "0.65rem 0.875rem", fontFamily: "'DM Sans',sans-serif", fontSize: "0.88rem", color: "var(--text)", background: "var(--cream)", outline: "none" }} />
            </div>
            <div>
              <label style={{ fontSize: "0.82rem", fontWeight: 500, color: "var(--text-mid)", display: "block", marginBottom: "0.4rem" }}>Current Medications</label>
              <input value={form.currentMeds} onChange={e => setForm(f => ({ ...f, currentMeds: e.target.value }))} style={{ width: "100%", border: "1.5px solid var(--border)", borderRadius: 10, padding: "0.65rem 0.875rem", fontFamily: "'DM Sans',sans-serif", fontSize: "0.88rem", color: "var(--text)", background: "var(--cream)", outline: "none" }} />
            </div>
            <div>
              <label style={{ fontSize: "0.82rem", fontWeight: 500, color: "var(--text-mid)", display: "block", marginBottom: "0.4rem" }}>Known Allergies</label>
              <input value={form.allergies} onChange={e => setForm(f => ({ ...f, allergies: e.target.value }))} style={{ width: "100%", border: "1.5px solid var(--border)", borderRadius: 10, padding: "0.65rem 0.875rem", fontFamily: "'DM Sans',sans-serif", fontSize: "0.88rem", color: "var(--text)", background: "var(--cream)", outline: "none" }} />
            </div>
          </div>
          {error && <div style={{ padding: "0.75rem", background: "#FCEBEB", borderRadius: 10, fontSize: "0.85rem", color: "#A32D2D", marginBottom: "1rem" }}>{error}</div>}
          <button onClick={requestRefill} disabled={!form.medication || !form.reason || loading} style={{ width: "100%", background: form.medication && form.reason ? "var(--green)" : "var(--green-muted)", color: form.medication && form.reason ? "var(--cream)" : "var(--text-muted)", border: "none", borderRadius: 12, padding: "0.875rem", fontSize: "0.95rem", fontWeight: 500, cursor: form.medication && form.reason ? "pointer" : "default" }}>
            {loading ? "Snortle is drafting your request..." : "Generate Refill Request →"}
          </button>
        </div>
      )}

      {draft && !submitted && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: "var(--green-muted)", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "1.5rem" }}>
            <span style={{ fontSize: "1.2rem" }}>✅</span>
            <div>
              <div style={{ fontWeight: 500, fontSize: "0.92rem", color: "var(--green)" }}>Request drafted by Snortle</div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Review below and submit for clinician approval</div>
            </div>
            <span style={{ marginLeft: "auto", fontSize: "0.72rem", fontWeight: 500, padding: "3px 10px", borderRadius: 100, background: urgencyColor(draft.urgency).bg, color: urgencyColor(draft.urgency).text }}>
              {draft.urgency}
            </span>
          </div>

          <div style={{ background: "white", borderRadius: 16, border: "1px solid var(--border)", padding: "1.5rem", marginBottom: "1rem" }}>
            <div style={{ fontSize: "0.82rem", fontWeight: 500, color: "var(--text-muted)", marginBottom: "0.5rem", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Draft Clinical Note</div>
            <div style={{ background: "var(--cream)", borderRadius: 10, padding: "1rem", fontSize: "0.88rem", color: "var(--text)", lineHeight: 1.7, whiteSpace: "pre-wrap" as const }}>{draft.draftNote}</div>
          </div>

          {draft.interactions?.length > 0 && (
            <div style={{ background: "#FDF5E0", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "1rem", border: "1px solid #F5C45020" }}>
              <div style={{ fontSize: "0.82rem", fontWeight: 500, color: "#8A6B00", marginBottom: "0.5rem" }}>⚠ Potential Interactions</div>
              {draft.interactions.map((d, i) => <div key={i} style={{ fontSize: "0.85rem", color: "var(--text-mid)", marginBottom: "0.25rem" }}>• {d}</div>)}
            </div>
          )}

          <div style={{ display: "flex", gap: "1rem" }}>
            <button onClick={() => setDraft(null)} style={{ flex: 1, background: "var(--cream-dark)", color: "var(--text-mid)", border: "none", borderRadius: 12, padding: "0.875rem", fontSize: "0.92rem", cursor: "pointer" }}>Edit request</button>
            <button onClick={() => setSubmitted(true)} style={{ flex: 2, background: "var(--green)", color: "var(--cream)", border: "none", borderRadius: 12, padding: "0.875rem", fontSize: "0.92rem", fontWeight: 500, cursor: "pointer" }}>Submit to clinician for review →</button>
          </div>
        </div>
      )}

      {submitted && (
        <div style={{ background: "var(--green)", borderRadius: 20, padding: "3rem", textAlign: "center" as const }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>✅</div>
          <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "1.8rem", color: "var(--cream)", marginBottom: "0.75rem" }}>Request submitted</h2>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.95rem", marginBottom: "1.5rem" }}>Your clinician will review and approve the refill, typically within a few hours.</p>
          <button onClick={() => { setSubmitted(false); setDraft(null); setForm(f => ({ ...f, medication: "", reason: "" })); setTab("active"); }} style={{ background: "var(--cream)", color: "var(--green)", border: "none", borderRadius: 100, padding: "0.75rem 2rem", fontSize: "0.92rem", fontWeight: 500, cursor: "pointer" }}>Back to medications</button>
        </div>
      )}
    </div>
  );
}
