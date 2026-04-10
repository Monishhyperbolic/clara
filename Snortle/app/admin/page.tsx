"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Refill {
  id: string; user_name: string; user_email: string; medication: string;
  reason: string; draft_note: string; urgency: string; interactions: string[];
  warnings: string[]; status: string; admin_note: string; created_at: string;
}

const STATUS: Record<string, { bg: string; text: string; border: string }> = {
  pending:   { bg: "#FFFBEB", text: "#92400E", border: "#FCD34D" },
  approved:  { bg: "#ECFDF5", text: "#065F46", border: "#34D399" },
  rejected:  { bg: "#FEF2F2", text: "#991B1B", border: "#FCA5A5" },
  dispensed: { bg: "#EFF6FF", text: "#1E40AF", border: "#93C5FD" },
};

const URGENCY: Record<string, { bg: string; text: string }> = {
  routine: { bg: "var(--teal-light)", text: "var(--teal-deep)" },
  soon:    { bg: "var(--gold-light)", text: "var(--gold)" },
  urgent:  { bg: "#FEE2E2", text: "#B91C1C" },
};

function Badge({ label, style }: { label: string; style: React.CSSProperties }) {
  return <span style={{ fontSize: "0.68rem", fontWeight: 600, padding: "2px 9px", borderRadius: 100, letterSpacing: "0.05em", textTransform: "uppercase" as const, border: "1.5px solid", ...style }}>{label}</span>;
}

export default function AdminPage() {
  const router = useRouter();
  const [refills, setRefills] = useState<Refill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Refill | null>(null);
  const [note, setNote] = useState("");
  const [updating, setUpdating] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [authorized, setAuthorized] = useState<null | boolean>(null);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      if (!data.user) { router.push("/auth/login"); return; }
      setUserEmail(data.user.email || "");
      fetchRefills();
    });
  }, []);

  async function fetchRefills() {
    setLoading(true);
    const res = await fetch("/api/admin/refills");
    const data = await res.json();
    if (data.error === "Forbidden") { setAuthorized(false); setLoading(false); return; }
    if (data.error) { setError(data.error); setLoading(false); return; }
    setAuthorized(true);
    setRefills(data.refills || []);
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    setUpdating(true);
    const res = await fetch(`/api/admin/refills/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, admin_note: note }),
    });
    if ((await res.json()).success) { await fetchRefills(); setSelected(null); setNote(""); }
    setUpdating(false);
  }

  const filtered = refills.filter(r => {
    if (filter !== "all" && r.status !== filter) return false;
    if (search && !r.medication.toLowerCase().includes(search.toLowerCase()) && !r.user_name.toLowerCase().includes(search.toLowerCase()) && !r.user_email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = { all: refills.length, pending: refills.filter(r => r.status === "pending").length, approved: refills.filter(r => r.status === "approved").length, rejected: refills.filter(r => r.status === "rejected").length, dispensed: refills.filter(r => r.status === "dispensed").length };

  // Not authorized screen
  if (authorized === false) return (
    <div style={{ minHeight: "100vh", background: "var(--parchment)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ textAlign: "center", maxWidth: 380 }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "4rem", color: "var(--rose)", marginBottom: "1rem" }}>✕</div>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.6rem", color: "var(--ink)", marginBottom: "0.5rem" }}>Access Denied</h2>
        <p style={{ color: "var(--ink-muted)", marginBottom: "0.5rem" }}>Your account <strong>{userEmail}</strong> does not have admin access.</p>
        <p style={{ color: "var(--ink-ghost)", fontSize: "0.82rem", marginBottom: "1.5rem" }}>Set <code style={{ background: "var(--parchment-2)", padding: "1px 6px", borderRadius: 4 }}>ADMIN_EMAIL</code> in Vercel env vars to grant access.</p>
        <Link href="/dashboard" style={{ display: "inline-block", background: "var(--teal-deep)", color: "#F9F4EA", padding: "0.7rem 1.75rem", borderRadius: 100, textDecoration: "none", fontSize: "0.88rem", fontWeight: 500 }}>← Back to app</Link>
      </div>
    </div>
  );

  // Loading screen
  if (loading) return (
    <div style={{ minHeight: "100vh", background: "var(--parchment)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontSize: "1.5rem", color: "var(--ink-muted)" }}>Loading admin portal...</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--parchment)" }}>

      {/* Top nav */}
      <div style={{ background: "var(--teal-deep)", borderBottom: "1px solid rgba(255,255,255,0.07)", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 2rem", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.35rem", color: "#F9F4EA", fontStyle: "italic" }}>Snortle</span>
            <span style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", fontSize: "0.68rem", padding: "2px 10px", borderRadius: 100, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, border: "1px solid rgba(255,255,255,0.15)" }}>Admin Portal</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.78rem" }}>{userEmail}</span>
            <Link href="/dashboard" style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.78rem", textDecoration: "none", background: "rgba(255,255,255,0.06)", padding: "0.3rem 0.875rem", borderRadius: 100, border: "1px solid rgba(255,255,255,0.1)" }}>← Patient app</Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 2rem 4rem" }}>

        {/* Page header */}
        <div style={{ marginBottom: "1.75rem" }}>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "2rem", color: "var(--ink)", letterSpacing: "-0.02em" }}>Prescription Requests</h1>
          <p style={{ color: "var(--ink-muted)", fontSize: "0.88rem", marginTop: "0.2rem" }}>Review, approve, or reject patient refill requests.</p>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem", marginBottom: "1.75rem" }}>
          {[
            { k: "pending",  label: "Pending",  icon: "⏳", color: "var(--gold)" },
            { k: "approved", label: "Approved", icon: "✓", color: "var(--teal)" },
            { k: "rejected", label: "Rejected", icon: "✕", color: "var(--rose)" },
            { k: "dispensed",label: "Dispensed",icon: "◎", color: "var(--lavender)" },
          ].map(({ k, label, icon, color }) => (
            <div key={k} onClick={() => setFilter(filter === k ? "all" : k)} style={{ background: "white", borderRadius: 16, border: `1.5px solid ${filter === k ? color : "var(--border)"}`, padding: "1.25rem", cursor: "pointer", transition: "border-color 0.15s, transform 0.1s", transform: filter === k ? "translateY(-1px)" : "none", boxShadow: filter === k ? "var(--shadow)" : "var(--shadow-sm)" }}>
              <div style={{ fontSize: "1.25rem", color, marginBottom: "0.4rem" }}>{icon}</div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "2rem", color: "var(--ink)", lineHeight: 1, marginBottom: "0.2rem" }}>{counts[k as keyof typeof counts]}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--ink-muted)", fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Filters & search */}
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: "0.35rem" }}>
            {["all","pending","approved","rejected","dispensed"].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: "0.38rem 0.875rem", borderRadius: 100, border: "1.5px solid", borderColor: filter === f ? "var(--teal-deep)" : "var(--border)", background: filter === f ? "var(--teal-deep)" : "white", color: filter === f ? "#F9F4EA" : "var(--ink-muted)", fontSize: "0.78rem", cursor: "pointer", fontWeight: filter === f ? 500 : 400 }}>
                {f.charAt(0).toUpperCase() + f.slice(1)} ({f === "all" ? counts.all : counts[f as keyof typeof counts]})
              </button>
            ))}
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patient or medication..." style={{ marginLeft: "auto", border: "1.5px solid var(--border)", borderRadius: 100, padding: "0.4rem 1rem", fontFamily: "'Inter',sans-serif", fontSize: "0.82rem", outline: "none", width: 240, background: "white", color: "var(--ink)" }} />
          <button onClick={fetchRefills} style={{ background: "var(--parchment-2)", border: "1.5px solid var(--border)", borderRadius: 100, padding: "0.4rem 1rem", fontSize: "0.78rem", cursor: "pointer", color: "var(--ink-muted)" }}>↺ Refresh</button>
        </div>

        {/* Error state */}
        {error && <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 12, padding: "1rem", color: "#991B1B", marginBottom: "1rem", fontSize: "0.88rem" }}>{error}</div>}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div style={{ background: "white", borderRadius: 16, border: "1.5px solid var(--border)", padding: "3rem", textAlign: "center", color: "var(--ink-muted)" }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontSize: "1.2rem", marginBottom: "0.5rem" }}>No requests found</div>
            <p style={{ fontSize: "0.85rem" }}>Try changing the filter or search term.</p>
          </div>
        )}

        {/* Request cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {filtered.map(r => {
            const s = STATUS[r.status] || STATUS.pending;
            return (
              <div key={r.id} style={{ background: "white", borderRadius: 14, border: "1.5px solid var(--border)", padding: "1.1rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", boxShadow: "var(--shadow-sm)" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.35rem", flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--ink)" }}>{r.medication}</span>
                    <Badge label={r.status} style={{ background: s.bg, color: s.text, borderColor: s.border }} />
                    <Badge label={r.urgency} style={{ background: URGENCY[r.urgency]?.bg, color: URGENCY[r.urgency]?.text, borderColor: "transparent" }} />
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "var(--ink-mid)" }}>
                    <strong>{r.user_name}</strong> · <span style={{ color: "var(--ink-muted)" }}>{r.user_email}</span>
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--ink-ghost)", marginTop: "0.2rem" }}>
                    {r.reason} &nbsp;·&nbsp; {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </div>
                  {r.admin_note && <div style={{ marginTop: "0.4rem", fontSize: "0.75rem", color: "var(--teal)", background: "var(--teal-light)", padding: "3px 10px", borderRadius: 100, display: "inline-block" }}>Note: {r.admin_note}</div>}
                </div>
                <button onClick={() => { setSelected(r); setNote(r.admin_note || ""); }} style={{ background: "var(--parchment-2)", border: "1.5px solid var(--border)", borderRadius: 10, padding: "0.5rem 1rem", fontSize: "0.8rem", cursor: "pointer", color: "var(--ink-mid)", flexShrink: 0, fontWeight: 500 }}>
                  Review →
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review modal */}
      {selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "1rem" }} onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div style={{ background: "var(--parchment)", borderRadius: 20, width: "100%", maxWidth: 560, maxHeight: "90vh", overflow: "auto", padding: "2rem", boxShadow: "var(--shadow-lg)", border: "1.5px solid var(--border)" }}>

            {/* Modal header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
              <div>
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.5rem", color: "var(--ink)", marginBottom: "0.2rem" }}>{selected.medication}</h2>
                <p style={{ fontSize: "0.82rem", color: "var(--ink-muted)" }}>{selected.user_name} &nbsp;·&nbsp; {selected.user_email}</p>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", fontSize: "1.4rem", cursor: "pointer", color: "var(--ink-muted)", lineHeight: 1 }}>✕</button>
            </div>

            {/* Reason */}
            <div style={{ marginBottom: "1rem" }}>
              <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--ink-ghost)", marginBottom: "0.4rem" }}>Reason</div>
              <div style={{ background: "white", borderRadius: 10, padding: "0.75rem 1rem", fontSize: "0.88rem", color: "var(--ink)", border: "1.5px solid var(--border)" }}>{selected.reason}</div>
            </div>

            {/* Draft note */}
            <div style={{ marginBottom: "1rem" }}>
              <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--ink-ghost)", marginBottom: "0.4rem" }}>Draft Clinical Note</div>
              <div style={{ background: "white", borderRadius: 10, padding: "0.875rem 1rem", fontSize: "0.85rem", color: "var(--ink)", lineHeight: 1.7, whiteSpace: "pre-wrap" as const, border: "1.5px solid var(--border)" }}>{selected.draft_note}</div>
            </div>

            {/* Interactions */}
            {selected.interactions?.length > 0 && (
              <div style={{ background: "var(--gold-light)", borderRadius: 10, padding: "0.875rem 1rem", marginBottom: "1rem", border: "1.5px solid var(--gold-mid)" }}>
                <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--gold)", marginBottom: "0.4rem", letterSpacing: "0.08em", textTransform: "uppercase" as const }}>⚠ Interactions</div>
                {selected.interactions.map((d, i) => <div key={i} style={{ fontSize: "0.83rem", color: "var(--ink-mid)", marginBottom: "0.2rem" }}>• {d}</div>)}
              </div>
            )}

            {/* Note input */}
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--ink-ghost)", display: "block", marginBottom: "0.4rem" }}>Clinician note (visible to patient)</label>
              <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="Optional note for the patient..." style={{ width: "100%", border: "1.5px solid var(--border)", borderRadius: 10, padding: "0.7rem 0.875rem", fontFamily: "'Inter',sans-serif", fontSize: "0.88rem", resize: "none", outline: "none", background: "white", color: "var(--ink)" }} />
            </div>

            {/* Action buttons */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
              {[
                { label: "✓ Approve",   status: "approved",  bg: "var(--teal-deep)", text: "#F9F4EA" },
                { label: "◎ Dispensed", status: "dispensed", bg: "#1E3A8A",          text: "white" },
                { label: "✕ Reject",    status: "rejected",  bg: "var(--rose)",      text: "white" },
              ].map(({ label, status, bg, text }) => (
                <button key={status} disabled={updating} onClick={() => updateStatus(selected.id, status)}
                  style={{ padding: "0.75rem", borderRadius: 10, border: "none", background: bg, color: text, fontSize: "0.83rem", fontWeight: 600, cursor: updating ? "default" : "pointer", opacity: updating ? 0.6 : 1, letterSpacing: "0.02em" }}>
                  {updating ? "..." : label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
