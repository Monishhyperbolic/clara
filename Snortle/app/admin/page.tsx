"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Refill {
  id: string;
  user_name: string;
  user_email: string;
  medication: string;
  reason: string;
  draft_note: string;
  urgency: string;
  interactions: string[];
  warnings: string[];
  status: string;
  admin_note: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending:  { bg: "#FDF5E0", text: "#8A6B00" },
  approved: { bg: "var(--green-muted)", text: "var(--green)" },
  rejected: { bg: "#FCEBEB", text: "#A32D2D" },
  dispensed:{ bg: "#E6F1FB", text: "#185FA5" },
};

export default function AdminPage() {
  const router = useRouter();
  const [refills, setRefills] = useState<Refill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Refill | null>(null);
  const [note, setNote] = useState("");
  const [updating, setUpdating] = useState(false);
  const [filter, setFilter] = useState("all");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push("/auth/login"); return; }
      setUserEmail(data.user.email || "");
      fetchRefills();
    });
  }, []);

  async function fetchRefills() {
    setLoading(true);
    const res = await fetch("/api/admin/refills");
    const data = await res.json();
    if (data.error) {
      setError(data.error);
    } else {
      setRefills(data.refills);
    }
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    setUpdating(true);
    const res = await fetch(`/api/admin/refills/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, admin_note: note }),
    });
    const data = await res.json();
    if (data.success) {
      await fetchRefills();
      setSelected(null);
      setNote("");
    }
    setUpdating(false);
  }

  const filtered = filter === "all" ? refills : refills.filter(r => r.status === filter);
  const counts = {
    all: refills.length,
    pending: refills.filter(r => r.status === "pending").length,
    approved: refills.filter(r => r.status === "approved").length,
    rejected: refills.filter(r => r.status === "rejected").length,
    dispensed: refills.filter(r => r.status === "dispensed").length,
  };

  if (error === "Forbidden") return (
    <div style={{ minHeight: "100vh", background: "var(--cream)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
        <h2 style={{ fontFamily: "'DM Serif Display',serif", color: "var(--green)", marginBottom: "0.5rem" }}>Admin access only</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>Your account ({userEmail}) does not have admin privileges.</p>
        <Link href="/dashboard" style={{ background: "var(--green)", color: "var(--cream)", padding: "0.75rem 1.5rem", borderRadius: 100, textDecoration: "none", fontSize: "0.9rem" }}>Back to dashboard</Link>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)" }}>
      {/* Top nav */}
      <div style={{ background: "var(--green)", padding: "0 2rem", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontFamily: "'DM Serif Display',serif", fontSize: "1.3rem", color: "var(--cream)" }}>Snortle</span>
          <span style={{ fontSize: "0.75rem", background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.8)", padding: "2px 10px", borderRadius: 100 }}>Admin Portal</span>
        </div>
        <Link href="/dashboard" style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>← Back to app</Link>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem" }}>
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "2rem", color: "var(--green)", marginBottom: "0.25rem" }}>Refill Requests</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Review and manage prescription refill requests from patients.</p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem", marginBottom: "1.75rem" }}>
          {[
            { label: "Pending", key: "pending", icon: "⏳" },
            { label: "Approved", key: "approved", icon: "✅" },
            { label: "Rejected", key: "rejected", icon: "❌" },
            { label: "Dispensed", key: "dispensed", icon: "💊" },
          ].map(({ label, key, icon }) => (
            <div key={key} style={{ background: "white", borderRadius: 16, border: "1px solid var(--border)", padding: "1.25rem", cursor: "pointer", outline: filter === key ? "2px solid var(--green)" : "none" }} onClick={() => setFilter(filter === key ? "all" : key)}>
              <div style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>{icon}</div>
              <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: "1.8rem", color: "var(--green)", lineHeight: 1 }}>{counts[key as keyof typeof counts]}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
          {["all","pending","approved","rejected","dispensed"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: "0.4rem 1rem", borderRadius: 100, border: "1px solid var(--border)", background: filter === f ? "var(--green)" : "white", color: filter === f ? "var(--cream)" : "var(--text-muted)", fontSize: "0.82rem", cursor: "pointer", fontWeight: filter === f ? 500 : 400 }}>
              {f.charAt(0).toUpperCase() + f.slice(1)} {f === "all" ? `(${counts.all})` : `(${counts[f as keyof typeof counts]})`}
            </button>
          ))}
          <button onClick={fetchRefills} style={{ marginLeft: "auto", padding: "0.4rem 1rem", borderRadius: 100, border: "1px solid var(--border)", background: "white", color: "var(--text-muted)", fontSize: "0.82rem", cursor: "pointer" }}>↺ Refresh</button>
        </div>

        {loading && (
          <div style={{ background: "white", borderRadius: 16, border: "1px solid var(--border)", padding: "3rem", textAlign: "center" as const, color: "var(--text-muted)" }}>Loading requests...</div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ background: "white", borderRadius: 16, border: "1px solid var(--border)", padding: "3rem", textAlign: "center" as const, color: "var(--text-muted)" }}>No {filter !== "all" ? filter : ""} requests yet.</div>
        )}

        {/* Request list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          {filtered.map(r => (
            <div key={r.id} style={{ background: "white", borderRadius: 16, border: "1px solid var(--border)", padding: "1.25rem 1.5rem" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 500, fontSize: "1rem", color: "var(--text)" }}>{r.medication}</span>
                    <span style={{ fontSize: "0.72rem", padding: "2px 8px", borderRadius: 100, fontWeight: 500, background: STATUS_COLORS[r.status]?.bg || "var(--cream-dark)", color: STATUS_COLORS[r.status]?.text || "var(--text-muted)" }}>{r.status}</span>
                    <span style={{ fontSize: "0.72rem", padding: "2px 8px", borderRadius: 100, background: r.urgency === "urgent" ? "#FCEBEB" : r.urgency === "soon" ? "#FDF5E0" : "var(--green-muted)", color: r.urgency === "urgent" ? "#A32D2D" : r.urgency === "soon" ? "#8A6B00" : "var(--green)", fontWeight: 500 }}>{r.urgency}</span>
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-mid)", marginBottom: "0.25rem" }}>
                    <strong>{r.user_name}</strong> · {r.user_email}
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                    {r.reason} · {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </div>
                  {r.admin_note && (
                    <div style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: "var(--green)", background: "var(--green-muted)", padding: "0.4rem 0.75rem", borderRadius: 8, display: "inline-block" }}>
                      Note: {r.admin_note}
                    </div>
                  )}
                </div>
                <button onClick={() => { setSelected(r); setNote(r.admin_note || ""); }} style={{ background: "var(--cream)", border: "1px solid var(--border)", borderRadius: 10, padding: "0.5rem 1rem", fontSize: "0.82rem", cursor: "pointer", color: "var(--text-mid)", flexShrink: 0 }}>
                  Review →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Review modal */}
      {selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "1rem" }} onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div style={{ background: "white", borderRadius: 20, width: "100%", maxWidth: 560, maxHeight: "90vh", overflow: "auto", padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
              <div>
                <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "1.4rem", color: "var(--green)", marginBottom: "0.2rem" }}>{selected.medication}</h2>
                <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{selected.user_name} · {selected.user_email}</p>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", fontSize: "1.4rem", cursor: "pointer", color: "var(--text-muted)" }}>×</button>
            </div>

            <div style={{ background: "var(--cream)", borderRadius: 12, padding: "1rem", marginBottom: "1rem" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: "0.4rem" }}>Reason</div>
              <div style={{ fontSize: "0.88rem", color: "var(--text)" }}>{selected.reason}</div>
            </div>

            <div style={{ background: "var(--cream)", borderRadius: 12, padding: "1rem", marginBottom: "1rem" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: "0.4rem" }}>Draft Clinical Note</div>
              <div style={{ fontSize: "0.85rem", color: "var(--text)", lineHeight: 1.65, whiteSpace: "pre-wrap" as const }}>{selected.draft_note}</div>
            </div>

            {selected.interactions?.length > 0 && (
              <div style={{ background: "#FDF5E0", borderRadius: 12, padding: "1rem", marginBottom: "1rem" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#8A6B00", marginBottom: "0.4rem" }}>⚠ Interactions</div>
                {selected.interactions.map((d, i) => <div key={i} style={{ fontSize: "0.82rem", color: "var(--text-mid)" }}>• {d}</div>)}
              </div>
            )}

            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--text-mid)", display: "block", marginBottom: "0.4rem" }}>Clinician note (optional)</label>
              <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="Add a note for the patient..." style={{ width: "100%", border: "1.5px solid var(--border)", borderRadius: 10, padding: "0.7rem", fontFamily: "'DM Sans',sans-serif", fontSize: "0.88rem", resize: "none", outline: "none", background: "var(--cream)" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
              {[
                { label: "✅ Approve", status: "approved", bg: "var(--green)", fg: "var(--cream)" },
                { label: "💊 Dispensed", status: "dispensed", bg: "#185FA5", fg: "white" },
                { label: "❌ Reject", status: "rejected", bg: "#A32D2D", fg: "white" },
              ].map(({ label, status, bg, fg }) => (
                <button key={status} disabled={updating} onClick={() => updateStatus(selected.id, status)} style={{ padding: "0.75rem", borderRadius: 12, border: "none", background: bg, color: fg, fontSize: "0.85rem", fontWeight: 500, cursor: "pointer", opacity: updating ? 0.6 : 1 }}>
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
