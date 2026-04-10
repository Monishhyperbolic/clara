"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface RxDraft { draftNote: string; interactions: string[]; warnings: string[]; urgency: string; suggestedDose: string; clinicianNote: string; }
interface SavedRefill { id: string; medication: string; status: string; created_at: string; urgency: string; admin_note?: string; }

const C = {
  ink: "#1C1409", inkMid: "#3D2E1A", inkMuted: "#7A6A52", inkGhost: "#B5A48A",
  parchment: "#FEFBF3", parchment2: "#F2EBD9", parchment3: "#E8DEC8",
  teal: "#1A5248", tealLight: "#C8EAE5", tealMid: "#5AADA0",
  border: "rgba(60,40,10,0.12)",
};

const activeMeds = [
  { name: "Metformin 500mg",   dose: "Twice daily",  prescriber: "Dr. S. Patel, MD", daysLeft: 11, status: "active" },
  { name: "Atorvastatin 20mg", dose: "Once nightly", prescriber: "Dr. S. Patel, MD", daysLeft: 5,  status: "refill" },
  { name: "Vitamin D3 5000IU", dose: "Once daily",   prescriber: "Dr. S. Patel, MD", daysLeft: 22, status: "active" },
];

const urgencyStyle: Record<string, { bg: string; text: string; border: string }> = {
  routine: { bg: C.tealLight,  text: C.teal,   border: C.tealMid  },
  soon:    { bg: "#FEF9E7",    text: "#7D4E00", border: "#F0C040"  },
  urgent:  { bg: "#FEF2F2",    text: "#991B1B", border: "#FCA5A5"  },
};
const statusStyle: Record<string, { bg: string; text: string; border: string }> = {
  pending:   { bg: "#FFFBEB",  text: "#92400E", border: "#FCD34D"  },
  approved:  { bg: "#ECFDF5",  text: "#065F46", border: "#34D399"  },
  rejected:  { bg: "#FEF2F2",  text: "#991B1B", border: "#FCA5A5"  },
  dispensed: { bg: "#EFF6FF",  text: "#1E40AF", border: "#93C5FD"  },
};

function Badge({ label, s }: { label: string; s: { bg: string; text: string; border: string } }) {
  return <span style={{ fontSize: "0.68rem", fontWeight: 700, padding: "2px 9px", borderRadius: 100, background: s.bg, color: s.text, border: `1.5px solid ${s.border}`, letterSpacing: "0.05em", textTransform: "uppercase" as const }}>{label}</span>;
}

export default function PrescriptionsPage() {
  const [tab, setTab] = useState<"active"|"request"|"history">("active");
  const [form, setForm] = useState({ medication: "", reason: "", currentMeds: "Metformin 500mg, Atorvastatin 20mg, Vitamin D3 5000IU", allergies: "Penicillin" });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<RxDraft | null>(null);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [history, setHistory] = useState<SavedRefill[]>([]);
  const [histLoading, setHistLoading] = useState(false);

  useEffect(() => { if (tab === "history") loadHistory(); }, [tab]);

  async function loadHistory() {
    setHistLoading(true);
    const supabase = createClient();
    const { data } = await supabase.from("refill_requests").select("id,medication,status,created_at,urgency,admin_note").order("created_at", { ascending: false });
    setHistory(data || []);
    setHistLoading(false);
  }

  async function requestRefill() {
    if (!form.medication || !form.reason) return;
    setLoading(true); setError(""); setDraft(null);
    try {
      const res = await fetch("/api/prescription", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error((await res.json()).error || "Request failed");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setDraft(data);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  }

  async function submitRefill() {
    if (!draft) return;
    setSaving(true);
    try {
      const res = await fetch("/api/refill", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ medication: form.medication, reason: form.reason, draftNote: draft.draftNote, urgency: draft.urgency, interactions: draft.interactions, warnings: draft.warnings }) });
      if (!res.ok) throw new Error((await res.json()).error || "Save failed");
      setSubmitted(true);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Save failed"); }
    finally { setSaving(false); }
  }

  const inp: React.CSSProperties = { width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "0.65rem 0.875rem", fontFamily: "'Inter',sans-serif", fontSize: "0.88rem", color: C.ink, background: C.parchment, outline: "none" };

  return (
    <div style={{ padding: "2rem 2.5rem 4rem", background: C.parchment, minHeight: "100vh", fontFamily: "'Inter',sans-serif" }}>

      {/* Page header */}
      <div style={{ marginBottom: "1.75rem" }}>
        <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: C.tealMid, marginBottom: "0.25rem" }}>Clinician-Reviewed</div>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "2rem", color: C.ink, letterSpacing: "-0.02em" }}>Prescriptions</h1>
        <p style={{ color: C.inkMuted, fontSize: "0.88rem", marginTop: "0.2rem" }}>Manage active medications and request refills — every request reviewed by your clinician.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.35rem", marginBottom: "1.75rem", background: "white", borderRadius: 12, padding: "0.3rem", border: `1.5px solid ${C.border}`, width: "fit-content", boxShadow: "0 1px 6px rgba(60,40,10,0.06)" }}>
        {(["active","request","history"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "0.48rem 1.1rem", borderRadius: 9, border: "none", cursor: "pointer", background: tab === t ? C.teal : "transparent", color: tab === t ? "#FEFBF3" : C.inkMuted, fontSize: "0.85rem", fontWeight: tab === t ? 600 : 400, transition: "all 0.15s" }}>
            {t === "active" ? "Active Meds" : t === "request" ? "Request Refill" : "My Requests"}
          </button>
        ))}
      </div>

      {/* ── ACTIVE MEDS ── */}
      {tab === "active" && (
        <div>
          {activeMeds.map((med, i) => (
            <div key={i} style={{ background: "white", borderRadius: 16, border: `1.5px solid ${C.border}`, padding: "1.1rem 1.5rem", marginBottom: "0.875rem", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 8px rgba(60,40,10,0.06)" }}>
              <div style={{ display: "flex", gap: "0.875rem", alignItems: "center" }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: med.status === "refill" ? "#FEF9E7" : C.tealLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", border: `1.5px solid ${med.status === "refill" ? "#F0C040" : C.tealMid}` }}>💊</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.92rem", color: C.ink }}>{med.name}</div>
                  <div style={{ fontSize: "0.75rem", color: C.inkMuted, marginTop: 2 }}>{med.dose} · {med.prescriber}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ textAlign: "right" as const }}>
                  <div style={{ fontSize: "0.72rem", color: C.inkGhost }}>Refill in</div>
                  <div style={{ fontSize: "0.88rem", fontWeight: 700, color: med.daysLeft <= 7 ? "#DC2626" : C.ink }}>{med.daysLeft} days</div>
                </div>
                <Badge label={med.status === "refill" ? "Refill due" : "Active"} s={med.status === "refill" ? urgencyStyle.soon : { bg: C.tealLight, text: C.teal, border: C.tealMid }} />
                {med.status === "refill" && (
                  <button onClick={() => { setTab("request"); setForm(f => ({ ...f, medication: med.name })); }} style={{ background: C.teal, color: "#FEFBF3", border: "none", borderRadius: 100, padding: "0.4rem 1rem", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }}>
                    Request →
                  </button>
                )}
              </div>
            </div>
          ))}
          <div style={{ background: C.parchment2, borderRadius: 12, padding: "0.875rem 1.25rem", fontSize: "0.8rem", color: C.inkMuted, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            🔒 All medications are managed and reviewed by your assigned clinician.
          </div>
        </div>
      )}

      {/* ── REQUEST REFILL ── */}
      {tab === "request" && !draft && !submitted && (
        <div style={{ background: "white", borderRadius: 20, border: `1.5px solid ${C.border}`, padding: "2rem", boxShadow: "0 2px 16px rgba(60,40,10,0.07)" }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 500, fontSize: "1.1rem", color: C.ink, marginBottom: "1.5rem" }}>New Refill Request</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
            {([["Medication & Dose *","medication","e.g. Atorvastatin 20mg"],["Reason for Refill *","reason","e.g. Running low, maintenance"],["Current Medications","currentMeds",""],["Known Allergies","allergies",""]] as [string,string,string][]).map(([label,key,ph]) => (
              <div key={key}>
                <label style={{ fontSize: "0.72rem", fontWeight: 700, color: C.inkMuted, display: "block", marginBottom: "0.35rem", textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>{label}</label>
                <input value={form[key as keyof typeof form]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={ph} style={inp} />
              </div>
            ))}
          </div>
          {error && <div style={{ padding: "0.75rem 1rem", background: "#FEF2F2", border: "1.5px solid #FCA5A5", borderRadius: 10, fontSize: "0.85rem", color: "#991B1B", marginBottom: "1rem" }}>{error}</div>}
          <button onClick={requestRefill} disabled={!form.medication || !form.reason || loading} style={{ width: "100%", background: form.medication && form.reason ? C.teal : C.parchment3, color: form.medication && form.reason ? "#FEFBF3" : C.inkGhost, border: "none", borderRadius: 12, padding: "0.9rem", fontSize: "0.95rem", fontWeight: 600, cursor: form.medication && form.reason ? "pointer" : "default", transition: "all 0.15s" }}>
            {loading ? "Snortle is drafting your request…" : "Generate Refill Request →"}
          </button>
        </div>
      )}

      {/* ── DRAFT REVIEW ── */}
      {draft && !submitted && (
        <div>
          <div style={{ background: "#ECFDF5", border: "1.5px solid #34D399", borderRadius: 14, padding: "1rem 1.25rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontSize: "1.2rem" }}>✅</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#065F46" }}>Draft ready — review before submitting</div>
              <div style={{ fontSize: "0.75rem", color: "#166534", marginTop: "0.1rem" }}>Will be saved and sent to your clinician for approval</div>
            </div>
            <Badge label={draft.urgency} s={urgencyStyle[draft.urgency] || urgencyStyle.routine} />
          </div>

          <div style={{ background: "white", borderRadius: 16, border: `1.5px solid ${C.border}`, padding: "1.5rem", marginBottom: "1rem", boxShadow: "0 1px 8px rgba(60,40,10,0.06)" }}>
            <div style={{ fontSize: "0.68rem", fontWeight: 700, color: C.inkGhost, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: "0.5rem" }}>Draft Clinical Note</div>
            <div style={{ background: C.parchment2, borderRadius: 10, padding: "1rem", fontSize: "0.88rem", color: C.inkMid, lineHeight: 1.7, whiteSpace: "pre-wrap" as const, border: `1px solid ${C.border}` }}>{draft.draftNote}</div>
          </div>

          {draft.interactions?.length > 0 && (
            <div style={{ background: "#FFFBEB", border: "1.5px solid #FCD34D", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "1rem" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#92400E", marginBottom: "0.4rem", letterSpacing: "0.08em", textTransform: "uppercase" as const }}>⚠ Potential Interactions</div>
              {draft.interactions.map((d, i) => <div key={i} style={{ fontSize: "0.85rem", color: "#78350F" }}>• {d}</div>)}
            </div>
          )}

          {error && <div style={{ padding: "0.75rem 1rem", background: "#FEF2F2", border: "1.5px solid #FCA5A5", borderRadius: 10, fontSize: "0.85rem", color: "#991B1B", marginBottom: "1rem" }}>{error}</div>}

          <div style={{ display: "flex", gap: "0.875rem" }}>
            <button onClick={() => setDraft(null)} style={{ flex: 1, background: C.parchment3, color: C.inkMid, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "0.875rem", fontSize: "0.9rem", fontWeight: 500, cursor: "pointer" }}>
              Edit request
            </button>
            <button onClick={submitRefill} disabled={saving} style={{ flex: 2, background: C.teal, color: "#FEFBF3", border: "none", borderRadius: 12, padding: "0.875rem", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer" }}>
              {saving ? "Saving…" : "Submit to clinician →"}
            </button>
          </div>
        </div>
      )}

      {/* ── SUBMITTED ── */}
      {submitted && (
        <div style={{ background: C.teal, borderRadius: 20, padding: "3rem", textAlign: "center" as const }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.875rem" }}>✅</div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.75rem", color: "#FEFBF3", marginBottom: "0.625rem" }}>Request submitted</h2>
          <p style={{ color: "rgba(254,251,243,0.72)", fontSize: "0.9rem", marginBottom: "1.75rem" }}>Your clinician will review and approve the refill, typically within a few hours.</p>
          <div style={{ display: "flex", gap: "0.875rem", justifyContent: "center" }}>
            <button onClick={() => { setSubmitted(false); setDraft(null); setForm(f => ({ ...f, medication: "", reason: "" })); setTab("active"); }} style={{ background: "#FEFBF3", color: C.teal, border: "none", borderRadius: 100, padding: "0.7rem 1.5rem", fontSize: "0.88rem", fontWeight: 700, cursor: "pointer" }}>
              Back to medications
            </button>
            <button onClick={() => { setSubmitted(false); setDraft(null); setForm(f => ({ ...f, medication: "", reason: "" })); setTab("history"); }} style={{ background: "rgba(255,255,255,0.12)", color: "#FEFBF3", border: "1.5px solid rgba(255,255,255,0.2)", borderRadius: 100, padding: "0.7rem 1.5rem", fontSize: "0.88rem", cursor: "pointer" }}>
              View my requests
            </button>
          </div>
        </div>
      )}

      {/* ── HISTORY ── */}
      {tab === "history" && (
        <div>
          {histLoading && <div style={{ textAlign: "center" as const, padding: "3rem", color: C.inkMuted, fontFamily: "'Playfair Display',serif", fontStyle: "italic" }}>Loading your requests…</div>}
          {!histLoading && history.length === 0 && (
            <div style={{ background: "white", borderRadius: 16, border: `1.5px solid ${C.border}`, padding: "3rem", textAlign: "center" as const, color: C.inkMuted }}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontSize: "1.1rem", marginBottom: "0.5rem" }}>No requests yet</div>
              <button onClick={() => setTab("request")} style={{ background: "none", border: "none", color: C.teal, cursor: "pointer", fontSize: "0.88rem", textDecoration: "underline", fontWeight: 500 }}>Request your first refill →</button>
            </div>
          )}
          {history.map(r => (
            <div key={r.id} style={{ background: "white", borderRadius: 14, border: `1.5px solid ${C.border}`, padding: "1rem 1.5rem", marginBottom: "0.75rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", boxShadow: "0 1px 6px rgba(60,40,10,0.05)" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.92rem", color: C.ink, marginBottom: "0.25rem" }}>{r.medication}</div>
                <div style={{ fontSize: "0.75rem", color: C.inkMuted }}>{new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
                {r.admin_note && <div style={{ marginTop: "0.3rem", fontSize: "0.75rem", color: C.teal, background: C.tealLight, padding: "2px 8px", borderRadius: 100, display: "inline-block", fontWeight: 500 }}>Note: {r.admin_note}</div>}
              </div>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <Badge label={r.urgency} s={urgencyStyle[r.urgency] || urgencyStyle.routine} />
                <Badge label={r.status} s={statusStyle[r.status] || statusStyle.pending} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
