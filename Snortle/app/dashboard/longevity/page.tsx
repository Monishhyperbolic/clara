"use client";
import { useState } from "react";

interface Intervention { title: string; category: string; impact: "high" | "medium" | "low"; description: string; }
interface Category { name: string; score: number; status: string; summary: string; }
interface Report { longevityScore: number; biologicalAge: number; categories: Category[]; topWins: string[]; topRisks: string[]; interventions: Intervention[]; summary: string; }

const defaultMetrics = {
  age: "33", sex: "male", height: "175", weight: "72",
  systolic: "118", diastolic: "76", rhr: "62",
  hba1c: "5.4", fastingGlucose: "94",
  ldl: "142", hdl: "52", triglycerides: "108",
  creatinine: "0.9", vitaminD: "42", tsh: "2.1", ferritin: "68",
  sleep: "7", exercise: "3",
  smoking: "never", alcohol: "occasional",
};

type MetricKey = keyof typeof defaultMetrics;

/* Status colours — dark text on light bg always */
const STATUS_MAP: Record<string, { bg: string; text: string; bar: string; label: string }> = {
  excellent: { bg: "#ECFDF5", text: "#065F46", bar: "#059669", label: "Excellent" },
  good:      { bg: "#F0FDF4", text: "#166534", bar: "#22C55E", label: "Good"      },
  fair:      { bg: "#FFFBEB", text: "#92400E", bar: "#F59E0B", label: "Fair"      },
  poor:      { bg: "#FEF2F2", text: "#991B1B", bar: "#EF4444", label: "Poor"      },
};

const IMPACT_MAP: Record<string, { bg: string; text: string }> = {
  high:   { bg: "#1A5248", text: "#FEFBF3"  },
  medium: { bg: "#FFFBEB", text: "#92400E"  },
  low:    { bg: "#F5F5F5", text: "#525252"  },
};

const CAT_ICON: Record<string, string> = {
  "Metabolic Health": "⚡",
  "Cardiovascular":   "❤",
  "Inflammation":     "🔥",
  "Hormonal":         "⚗",
  "Cognitive":        "🧠",
};

export default function LongevityPage() {
  const [metrics, setMetrics] = useState(defaultMetrics);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");

  function set(key: MetricKey, val: string) { setMetrics(m => ({ ...m, [key]: val })); }

  async function analyse() {
    setLoading(true); setError(""); setReport(null);
    try {
      const res = await fetch("/api/longevity", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ age: metrics.age, sex: metrics.sex, metrics }) });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setReport(data);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Analysis failed"); }
    finally { setLoading(false); }
  }

  const inp: React.CSSProperties = { width: "100%", border: "1.5px solid rgba(60,40,10,0.14)", borderRadius: 8, padding: "0.55rem 0.75rem", fontFamily: "'Inter',sans-serif", fontSize: "0.85rem", color: "#1C1409", background: "#FEFBF3", outline: "none" };
  const sel: React.CSSProperties = { ...inp, cursor: "pointer" };

  function Field({ label, k, options }: { label: string; k: MetricKey; options?: string[] }) {
    return (
      <div>
        <label style={{ fontSize: "0.73rem", fontWeight: 600, color: "#7A6A52", display: "block", marginBottom: "0.3rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>
        {options
          ? <select value={metrics[k]} onChange={e => set(k, e.target.value)} style={sel}>{options.map(o => <option key={o}>{o}</option>)}</select>
          : <input type="number" value={metrics[k]} onChange={e => set(k, e.target.value)} style={inp} />
        }
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem 2.5rem 4rem", background: "#FEFBF3", minHeight: "100vh" }}>
      <div style={{ marginBottom: "1.75rem" }}>
        <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#2A7B6F", marginBottom: "0.25rem" }}>Longevity Medicine</div>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "2rem", color: "#1C1409", letterSpacing: "-0.02em" }}>Your Longevity Score</h1>
        <p style={{ color: "#5C4E38", fontSize: "0.88rem", marginTop: "0.2rem" }}>Enter your biomarkers and lifestyle data to get your biological age and personalised action plan.</p>
      </div>

      {/* Input form */}
      {!report && (
        <div style={{ background: "white", borderRadius: 20, border: "1.5px solid rgba(60,40,10,0.1)", padding: "1.75rem", boxShadow: "0 2px 16px rgba(60,40,10,0.07)" }}>

          {/* Demographics */}
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#1A5248", letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: "0.875rem", paddingBottom: "0.5rem", borderBottom: "1px dashed rgba(60,40,10,0.12)" }}>Demographics</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "0.75rem" }}>
              <Field label="Age" k="age" /><Field label="Sex" k="sex" options={["male","female","other"]} />
              <Field label="Height (cm)" k="height" /><Field label="Weight (kg)" k="weight" />
            </div>
          </div>

          {/* Cardiovascular */}
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#1A5248", letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: "0.875rem", paddingBottom: "0.5rem", borderBottom: "1px dashed rgba(60,40,10,0.12)" }}>Cardiovascular</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "0.75rem" }}>
              <Field label="Systolic BP" k="systolic" /><Field label="Diastolic BP" k="diastolic" />
              <Field label="Resting HR" k="rhr" /><Field label="LDL (mg/dL)" k="ldl" />
              <Field label="HDL (mg/dL)" k="hdl" /><Field label="Triglycerides" k="triglycerides" />
            </div>
          </div>

          {/* Metabolic */}
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#1A5248", letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: "0.875rem", paddingBottom: "0.5rem", borderBottom: "1px dashed rgba(60,40,10,0.12)" }}>Metabolic & Hormonal</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "0.75rem" }}>
              <Field label="HbA1c (%)" k="hba1c" /><Field label="Fasting Glucose" k="fastingGlucose" />
              <Field label="Vitamin D (ng/mL)" k="vitaminD" /><Field label="TSH (mIU/L)" k="tsh" />
            </div>
          </div>

          {/* Lifestyle */}
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#1A5248", letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: "0.875rem", paddingBottom: "0.5rem", borderBottom: "1px dashed rgba(60,40,10,0.12)" }}>Lifestyle</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "0.75rem" }}>
              <Field label="Avg sleep (hrs)" k="sleep" /><Field label="Exercise (days/wk)" k="exercise" />
              <Field label="Smoking" k="smoking" options={["never","former","current"]} />
              <Field label="Alcohol" k="alcohol" options={["none","occasional","moderate","heavy"]} />
            </div>
          </div>

          {error && <div style={{ padding: "0.875rem 1rem", background: "#FEF2F2", border: "1.5px solid #FECACA", borderRadius: 10, fontSize: "0.85rem", color: "#991B1B", marginBottom: "1rem" }}>{error}</div>}

          <button onClick={analyse} disabled={loading} style={{ width: "100%", background: "#1A5248", color: "#FEFBF3", border: "none", borderRadius: 12, padding: "0.9rem", fontSize: "0.95rem", fontWeight: 600, cursor: "pointer" }}>
            {loading ? "Calculating with NVIDIA NIM — please wait..." : "Calculate Longevity Score →"}
          </button>
        </div>
      )}

      {loading && (
        <div style={{ background: "white", borderRadius: 20, border: "1.5px solid rgba(60,40,10,0.1)", padding: "3rem", textAlign: "center" as const }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontSize: "1.4rem", color: "#1C1409", marginBottom: "0.5rem" }}>Analysing your biomarkers...</div>
          <p style={{ color: "#5C4E38", fontSize: "0.88rem" }}>This may take 20–30 seconds. Snortle is building your personalised longevity report.</p>
        </div>
      )}

      {/* ── REPORT ── */}
      {report && (
        <div>
          {/* Score hero */}
          <div style={{ background: "#1A5248", borderRadius: 24, padding: "2.25rem 2.5rem", marginBottom: "1.5rem", display: "grid", gridTemplateColumns: "1fr auto", gap: "2rem", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "rgba(200,234,229,0.7)", marginBottom: "0.5rem" }}>Longevity Score</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem", marginBottom: "0.875rem" }}>
                <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "5rem", color: "#FEFBF3", lineHeight: 1, letterSpacing: "-0.04em" }}>{report.longevityScore}</span>
                <span style={{ color: "rgba(254,251,243,0.45)", fontSize: "1.2rem", marginBottom: "0.75rem" }}>/100</span>
              </div>
              <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 4, height: 8, marginBottom: "1rem", overflow: "hidden" }}>
                <div style={{ background: "#C8EAE5", width: `${Math.min(report.longevityScore, 100)}%`, height: "100%", borderRadius: 4, transition: "width 1s ease" }} />
              </div>
              <p style={{ fontSize: "0.9rem", color: "rgba(254,251,243,0.8)", lineHeight: 1.65, maxWidth: 480 }}>{report.summary}</p>
            </div>
            <div style={{ background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.12)", borderRadius: 18, padding: "1.5rem 2rem", textAlign: "center" as const, minWidth: 160 }}>
              <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)", marginBottom: "0.4rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>Biological age</div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "3.5rem", color: "#FEFBF3", letterSpacing: "-0.03em", lineHeight: 1 }}>{report.biologicalAge}</div>
              <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", marginTop: "0.25rem" }}>years</div>
              <div style={{ marginTop: "0.75rem", fontSize: "0.78rem", fontWeight: 600, color: report.biologicalAge <= parseInt(metrics.age) ? "#6EE7B7" : "#FCA5A5" }}>
                {report.biologicalAge <= parseInt(metrics.age)
                  ? `↓ ${parseInt(metrics.age) - report.biologicalAge}y younger`
                  : `↑ ${report.biologicalAge - parseInt(metrics.age)}y older`}
              </div>
            </div>
            <button onClick={() => setReport(null)} style={{ gridColumn: "1/-1", background: "rgba(255,255,255,0.1)", border: "1.5px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)", borderRadius: 100, padding: "0.5rem 1.5rem", fontSize: "0.82rem", cursor: "pointer", width: "fit-content" }}>
              ↺ Recalculate
            </button>
          </div>

          {/* Categories */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
            {report.categories?.map((cat, i) => {
              const c = STATUS_MAP[cat.status] || STATUS_MAP.fair;
              return (
                <div key={i} style={{ background: "white", borderRadius: 16, border: "1.5px solid rgba(60,40,10,0.1)", padding: "1.25rem", boxShadow: "0 2px 12px rgba(60,40,10,0.06)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                    <div>
                      <div style={{ fontSize: "1rem", marginBottom: "0.2rem" }}>{CAT_ICON[cat.name] || "◈"}</div>
                      <div style={{ fontWeight: 600, fontSize: "0.88rem", color: "#1C1409" }}>{cat.name}</div>
                    </div>
                    <span style={{ fontSize: "0.68rem", fontWeight: 700, padding: "3px 8px", borderRadius: 100, background: c.bg, color: c.text, border: `1.5px solid ${c.text}30`, letterSpacing: "0.04em", textTransform: "uppercase" as const }}>{c.label}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.65rem" }}>
                    <div style={{ flex: 1, background: "#F5EFE0", borderRadius: 4, height: 6, overflow: "hidden" }}>
                      <div style={{ width: `${cat.score}%`, height: "100%", background: c.bar, borderRadius: 4 }} />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#1C1409", minWidth: "2rem", textAlign: "right" as const }}>{cat.score}</span>
                  </div>
                  <p style={{ fontSize: "0.8rem", color: "#3D2E1A", lineHeight: 1.55 }}>{cat.summary}</p>
                </div>
              );
            })}
          </div>

          {/* Wins & Risks */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.5rem" }}>
            <div style={{ background: "#ECFDF5", borderRadius: 16, padding: "1.5rem", border: "1.5px solid #A7F3D0" }}>
              <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#065F46", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span>✓</span> What&apos;s working
              </div>
              {report.topWins?.map((w, i) => (
                <div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.6rem" }}>
                  <span style={{ color: "#059669", flexShrink: 0, fontWeight: 700 }}>+</span>
                  <span style={{ fontSize: "0.85rem", color: "#065F46", lineHeight: 1.55 }}>{w}</span>
                </div>
              ))}
            </div>
            <div style={{ background: "#FEF2F2", borderRadius: 16, padding: "1.5rem", border: "1.5px solid #FECACA" }}>
              <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#991B1B", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span>↑</span> Areas to improve
              </div>
              {report.topRisks?.map((r, i) => (
                <div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.6rem" }}>
                  <span style={{ color: "#EF4444", flexShrink: 0, fontWeight: 700 }}>!</span>
                  <span style={{ fontSize: "0.85rem", color: "#991B1B", lineHeight: 1.55 }}>{r}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interventions */}
          <div style={{ background: "white", borderRadius: 20, border: "1.5px solid rgba(60,40,10,0.1)", padding: "1.75rem", boxShadow: "0 2px 16px rgba(60,40,10,0.07)" }}>
            <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#1C1409", marginBottom: "0.25rem" }}>Personalised Interventions</div>
            <div style={{ fontSize: "0.78rem", color: "#7A6A52", marginBottom: "1.25rem" }}>Evidence-based actions ranked by impact on your longevity score</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "0.875rem" }}>
              {report.interventions?.map((iv, i) => {
                const imp = IMPACT_MAP[iv.impact] || IMPACT_MAP.low;
                return (
                  <div key={i} style={{ background: "#FEFBF3", borderRadius: 12, padding: "1rem 1.1rem", border: "1.5px solid rgba(60,40,10,0.1)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.35rem", gap: "0.5rem" }}>
                      <div style={{ fontWeight: 600, fontSize: "0.88rem", color: "#1C1409" }}>{iv.title}</div>
                      <span style={{ fontSize: "0.65rem", fontWeight: 700, padding: "2px 7px", borderRadius: 100, background: imp.bg, color: imp.text, flexShrink: 0, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>{iv.impact}</span>
                    </div>
                    <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#2A7B6F", marginBottom: "0.35rem", textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>{iv.category}</div>
                    <div style={{ fontSize: "0.82rem", color: "#3D2E1A", lineHeight: 1.55 }}>{iv.description}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
