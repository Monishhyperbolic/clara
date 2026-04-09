"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface RxDraft { draftNote: string; interactions: string[]; warnings: string[]; urgency: string; suggestedDose: string; clinicianNote: string; }
interface SavedRefill { id: string; medication: string; status: string; created_at: string; urgency: string; admin_note?: string; }

const activeMeds = [
  { name: "Metformin 500mg", dose: "Twice daily", prescriber: "Dr. S. Patel, MD", daysLeft: 11, status: "active" },
  { name: "Atorvastatin 20mg", dose: "Once nightly", prescriber: "Dr. S. Patel, MD", daysLeft: 5, status: "refill" },
  { name: "Vitamin D3 5000 IU", dose: "Once daily", prescriber: "Dr. S. Patel, MD", daysLeft: 22, status: "active" },
];

export default function PrescriptionsPage() {
  const [tab, setTab] = useState<"active" | "request" | "history">("active");
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
      const res = await fetch("/api/refill", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medication: form.medication, reason: form.reason, draftNote: draft.draftNote, urgency: draft.urgency, interactions: draft.interactions, warnings: draft.warnings }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to save");
      setSubmitted(true);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Failed to save"); }
    finally { setSaving(false); }
  }

  const urgencyColor = (u: string) => ({ routine: { bg: "var(--green-muted)", text: "var(--green)" }, soon: { bg: "#FDF5E0", text: "#8A6B00" }, urgent: { bg: "#FCEBEB", text: "#A32D2D" } }[u] ?? { bg: "var(--green-muted)", text: "var(--green)" });
  const statusColor = (s: string) => ({ pending: { bg: "#FDF5E0", text: "#8A6B00" }, approved: { bg: "var(--green-muted)", text: "var(--green)" }, rejected: { bg: "#FCEBEB", text: "#A32D2D" }, dispensed: { bg: "#E6F1FB", text: "#185FA5" } }[s] ?? { bg: "var(--cream-dark)", text: "var(--text-muted)" });

  return (
    <div style={{ padding: "2.5rem 2.5rem 4rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ fontSize: "0.78rem", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "var(--green-light)", marginBottom: "0.25rem" }}>Clinician-Reviewed</div>
        <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "2.2rem", color: "var(--green)", letterSpacing: "-0.02em" }}>Prescriptions</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginTop: "0.25rem" }}>Manage active medications and request refills — reviewed by your clinician.</p>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.75rem", background: "white", borderRadius: 12, padding: "0.3rem", border: "1px solid var(--border)", width: "fit-content" }}>
        {(["active","request","history"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "0.5rem 1.25rem", borderRadius: 9, border: "none", cursor: "pointer", background: tab === t ? "var(--green)" : "transparent", color: tab === t ? "var(--cream)" : "var(--text-muted)", fontSize: "0.88rem", fontWeight: tab === t ? 500 : 400, transition: "all 0.15s" }}>
            {t === "active" ? "Active Meds" : t === "request" ? "Request Refill" : "My Requests"}
          </button>
        ))}
      </div>

      {/* Active meds tab */}
      {tab === "active" && (
        <div>
          {activeMeds.map((med, i) => (
            <div key={i} style={{ background: "white", borderRadius: 16, border: "1px solid var(--border)", padding: "1.25rem 1.5rem", marginBottom: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: med.status === "refill" ? "#FDF5E0" : "var(--green-muted)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>💊</div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: "0.95rem" }}>{med.name}</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 2 }}>{med.dose} · {med.prescriber}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span style={{ fontSize: "0.72rem", padding: "4px 10px", borderRadius: 100, fontWeight: 500, background: med.status === "refill" ? "#FDF5E0" : "var(--green-muted)", color: med.status === "refill" ? "#8A6B00" : "var(--green)" }}>
                  {med.status === "refill" ? `Refill in ${med.daysLeft}d` : "Active"}
                </span>
                {med.status === "refill" && (
                  <button onClick={() => { setTab("request"); setForm(f => ({ ...f, medication: med.name })); }} style={{ background: "var(--green)", color: "var(--cream)", border: "none", borderRadius: 100, padding: "0.4rem 1rem", fontSize: "0.8rem", cursor: "pointer" }}>Request refill</button>
                )}
              </div>
            </div>
          ))}
          <div style={{ background: "var(--cream-dark)", borderRadius: 12, padding: "1rem 1.5rem", fontSize: "0.82rem", color: "var(--text-muted)" }}>🔒 All medications managed and reviewed by your assigned clinician.</div>
        </div>
      )}

      {/* Request tab */}
      {tab === "request" && !draft && !submitted && (
        <div style={{ background: "white", borderRadius: 20, border: "1px solid var(--border)", padding: "2rem" }}>
          <div style={{ fontWeight: 500, fontSize: "1rem", marginBottom: "1.5rem" }}>New Refill Request</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            {[["Medication & Dose *","medication","e.g. Atorvastatin 20mg"],["Reason for Refill *","reason","e.g. Running low"],["Current Medications","currentMeds",""],["Known Allergies","allergies",""]].map(([label, key, ph]) => (
              <div key={key}>
                <label style={{ fontSize: "0.82rem", fontWeight: 500, color: "var(--text-mid)", display: "block", marginBottom: "0.4rem" }}>{label}</label>
                <input value={form[key as keyof typeof form]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={ph} style={{ width: "100%", border: "1.5px solid var(--border)", borderRadius: 10, padding: "0.65rem 0.875rem", fontFamily: "'DM Sans',sans-serif", fontSize: "0.88rem", background: "var(--cream)", outline: "none" }} />
              </div>
            ))}
          </div>
          {error && <div style={{ padding: "0.75rem", background: "#FCEBEB", borderRadius: 10, fontSize: "0.85rem", color: "#A32D2D", marginBottom: "1rem" }}>{error}</div>}
          <button onClick={requestRefill} disabled={!form.medication || !form.reason || loading} style={{ width: "100%", background: form.medication && form.reason ? "var(--green)" : "var(--green-muted)", color: form.medication && form.reason ? "var(--cream)" : "var(--text-muted)", border: "none", borderRadius: 12, padding: "0.875rem", fontSize: "0.95rem", fontWeight: 500, cursor: "pointer" }}>
            {loading ? "Snortle is drafting your request..." : "Generate Refill Request →"}
          </button>
        </div>
      )}

      {draft && !submitted && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: "var(--green-muted)", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "1.5rem" }}>
            <span style={{ fontSize: "1.2rem" }}>✅</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, fontSize: "0.92rem", color: "var(--green)" }}>Draft ready — review before submitting</div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Will be saved and sent to your clinician for approval</div>
            </div>
            <span style={{ fontSize: "0.72rem", fontWeight: 500, padding: "3px 10px", borderRadius: 100, background: urgencyColor(draft.urgency).bg, color: urgencyColor(draft.urgency).text }}>{draft.urgency}</span>
          </div>
          <div style={{ background: "white", borderRadius: 16, border: "1px solid var(--border)", padding: "1.5rem", marginBottom: "1rem" }}>
            <div style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--text-muted)", marginBottom: "0.5rem", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Draft Clinical Note</div>
            <div style={{ background: "var(--cream)", borderRadius: 10, padding: "1rem", fontSize: "0.88rem", lineHeight: 1.7, whiteSpace: "pre-wrap" as const }}>{draft.draftNote}</div>
          </div>
          {draft.interactions?.length > 0 && (
            <div style={{ background: "#FDF5E0", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "1rem" }}>
              <div style={{ fontSize: "0.82rem", fontWeight: 500, color: "#8A6B00", marginBottom: "0.5rem" }}>⚠ Potential Interactions</div>
              {draft.interactions.map((d, i) => <div key={i} style={{ fontSize: "0.85rem", color: "var(--text-mid)" }}>• {d}</div>)}
            </div>
          )}
          {error && <div style={{ padding: "0.75rem", background: "#FCEBEB", borderRadius: 10, fontSize: "0.85rem", color: "#A32D2D", marginBottom: "1rem" }}>{error}</div>}
          <div style={{ display: "flex", gap: "1rem" }}>
            <button onClick={() => setDraft(null)} style={{ flex: 1, background: "var(--cream-dark)", color: "var(--text-mid)", border: "none", borderRadius: 12, padding: "0.875rem", fontSize: "0.92rem", cursor: "pointer" }}>Edit request</button>
            <button onClick={submitRefill} disabled={saving} style={{ flex: 2, background: "var(--green)", color: "var(--cream)", border: "none", borderRadius: 12, padding: "0.875rem", fontSize: "0.92rem", fontWeight: 500, cursor: "pointer" }}>
              {saving ? "Saving..." : "Submit to clinician →"}
            </button>
          </div>
        </div>
      )}

      {submitted && (
        <div style={{ background: "var(--green)", borderRadius: 20, padding: "3rem", textAlign: "center" as const }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>✅</div>
          <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "1.8rem", color: "var(--cream)", marginBottom: "0.75rem" }}>Request submitted</h2>
          <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: "1.5rem" }}>Your request is saved and your clinician will review it shortly.</p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            <button onClick={() => { setSubmitted(false); setDraft(null); setForm(f => ({ ...f, medication: "", reason: "" })); setTab("active"); }} style={{ background: "var(--cream)", color: "var(--green)", border: "none", borderRadius: 100, padding: "0.75rem 1.5rem", fontSize: "0.9rem", fontWeight: 500, cursor: "pointer" }}>Back to medications</button>
            <button onClick={() => { setSubmitted(false); setDraft(null); setForm(f => ({ ...f, medication: "", reason: "" })); setTab("history"); }} style={{ background: "rgba(255,255,255,0.15)", color: "var(--cream)", border: "none", borderRadius: 100, padding: "0.75rem 1.5rem", fontSize: "0.9rem", cursor: "pointer" }}>View my requests</button>
          </div>
        </div>
      )}

      {/* History tab */}
      {tab === "history" && (
        <div>
          {histLoading && <div style={{ textAlign: "center" as const, padding: "3rem", color: "var(--text-muted)" }}>Loading...</div>}
          {!histLoading && history.length === 0 && (
            <div style={{ background: "white", borderRadius: 16, border: "1px solid var(--border)", padding: "3rem", textAlign: "center" as const, color: "var(--text-muted)" }}>
              No refill requests yet. <button onClick={() => setTab("request")} style={{ background: "none", border: "none", color: "var(--green)", cursor: "pointer", textDecoration: "underline" }}>Request one now</button>
            </div>
          )}
          {history.map(r => (
            <div key={r.id} style={{ background: "white", borderRadius: 14, border: "1px solid var(--border)", padding: "1.1rem 1.5rem", marginBottom: "0.875rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: "0.95rem", marginBottom: "0.25rem" }}>{r.medication}</div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  {r.admin_note && <span style={{ marginLeft: "0.75rem", color: "var(--green)" }}>· Note: {r.admin_note}</span>}
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <span style={{ fontSize: "0.72rem", padding: "3px 10px", borderRadius: 100, fontWeight: 500, background: urgencyColor(r.urgency).bg, color: urgencyColor(r.urgency).text }}>{r.urgency}</span>
                <span style={{ fontSize: "0.72rem", padding: "3px 10px", borderRadius: 100, fontWeight: 500, background: statusColor(r.status).bg, color: statusColor(r.status).text }}>{r.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
