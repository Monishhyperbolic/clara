"use client";
import { useState } from "react";

interface Intervention {
  title: string;
  category: string;
  impact: "high" | "medium" | "low";
  description: string;
}

interface LongevityReport {
  longevityScore: number;
  biologicalAge: number;
  categories: { name: string; score: number; status: string; summary: string }[];
  topWins: string[];
  topRisks: string[];
  interventions: Intervention[];
  summary: string;
}

const defaultMetrics = {
  age: "33",
  sex: "male",
  height: "175",
  weight: "72",
  bmi: "23.5",
  systolic: "118",
  diastolic: "76",
  rhr: "62",
  hba1c: "5.4",
  fastingGlucose: "94",
  ldl: "142",
  hdl: "52",
  triglycerides: "108",
  creatinine: "0.9",
  vitaminD: "42",
  tsh: "2.1",
  ferritin: "68",
  sleep: "7",
  exercise: "3",
  smoking: "never",
  alcohol: "occasional",
};

export default function LongevityPage() {
  const [metrics, setMetrics] = useState(defaultMetrics);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<LongevityReport | null>(null);
  const [error, setError] = useState("");

  function set(key: string, value: string) {
    setMetrics(m => ({ ...m, [key]: value }));
  }

  async function analyze() {
    setLoading(true);
    setError("");
    setReport(null);
    try {
      const res = await fetch("/api/longevity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ age: metrics.age, sex: metrics.sex, metrics }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setReport(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Analysis failed. Check your API key.");
    } finally {
      setLoading(false);
    }
  }

  const statusColor = (s: string) => ({
    excellent: { bg: "var(--green-muted)", text: "var(--green)" },
    good: { bg: "#D2E8DB", text: "#1E3D2F" },
    fair: { bg: "#FDF5E0", text: "#8A6B00" },
    poor: { bg: "#FDECD9", text: "#C8632A" },
  }[s] ?? { bg: "var(--green-muted)", text: "var(--green)" });

  const impactColor = (i: string) => ({
    high: { bg: "var(--green)", text: "var(--parchment)" },
    medium: { bg: "#FDF5E0", text: "#8A6B00" },
    low: { bg: "var(--parchment-3)", text: "var(--ink-muted)" },
  }[i] ?? { bg: "var(--parchment-3)", text: "var(--ink-muted)" });

  const Field = ({ label, k, type = "text", options }: { label: string; k: string; type?: string; options?: string[] }) => (
    <div>
      <label style={{ fontSize: "0.78rem", fontWeight: 500, color: "var(--ink-muted)", display: "block", marginBottom: "0.3rem" }}>{label}</label>
      {options ? (
        <select value={metrics[k as keyof typeof metrics]} onChange={e => set(k, e.target.value)} style={{ width: "100%", border: "1.5px solid var(--border)", borderRadius: 8, padding: "0.55rem 0.75rem", fontFamily: "'Inter',sans-serif", fontSize: "0.85rem", color: "var(--ink)", background: "var(--parchment)", outline: "none" }}>
          {options.map(o => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} value={metrics[k as keyof typeof metrics]} onChange={e => set(k, e.target.value)} style={{ width: "100%", border: "1.5px solid var(--border)", borderRadius: 8, padding: "0.55rem 0.75rem", fontFamily: "'Inter',sans-serif", fontSize: "0.85rem", color: "var(--ink)", background: "var(--parchment)", outline: "none" }} />
      )}
    </div>
  );

  return (
    <div style={{ padding: "2.5rem 2.5rem 4rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ fontSize: "0.78rem", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "var(--green-light)", marginBottom: "0.25rem" }}>Longevity Medicine</div>
        <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "2.2rem", color: "var(--green)", letterSpacing: "-0.02em" }}>Your Longevity Score</h1>
        <p style={{ color: "var(--ink-muted)", fontSize: "0.95rem", marginTop: "0.25rem" }}>Enter your biomarkers and lifestyle data to get your biological age estimate and personalised interventions.</p>
      </div>

      {!report && (
        <div style={{ background: "white", borderRadius: 20, border: "1px solid var(--border)", padding: "2rem" }}>
          <div style={{ fontWeight: 500, fontSize: "0.95rem", color: "var(--ink)", marginBottom: "1.25rem" }}>Your Health Metrics</div>

          <div style={{ marginBottom: "1.25rem" }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: "var(--ink-muted)", marginBottom: "0.75rem" }}>Demographics</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "0.75rem" }}>
              <Field label="Age" k="age" type="number" />
              <Field label="Sex" k="sex" options={["male","female","other"]} />
              <Field label="Height (cm)" k="height" type="number" />
              <Field label="Weight (kg)" k="weight" type="number" />
            </div>
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: "var(--ink-muted)", marginBottom: "0.75rem" }}>Cardiovascular</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "0.75rem" }}>
              <Field label="Systolic BP" k="systolic" type="number" />
              <Field label="Diastolic BP" k="diastolic" type="number" />
              <Field label="Resting HR" k="rhr" type="number" />
              <Field label="LDL (mg/dL)" k="ldl" type="number" />
              <Field label="HDL (mg/dL)" k="hdl" type="number" />
              <Field label="Triglycerides" k="triglycerides" type="number" />
            </div>
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: "var(--ink-muted)", marginBottom: "0.75rem" }}>Metabolic & Hormonal</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "0.75rem" }}>
              <Field label="HbA1c (%)" k="hba1c" type="number" />
              <Field label="Fasting Glucose" k="fastingGlucose" type="number" />
              <Field label="Vitamin D (ng/mL)" k="vitaminD" type="number" />
              <Field label="TSH (mIU/L)" k="tsh" type="number" />
            </div>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: "var(--ink-muted)", marginBottom: "0.75rem" }}>Lifestyle</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "0.75rem" }}>
              <Field label="Avg sleep (hrs)" k="sleep" type="number" />
              <Field label="Exercise (days/wk)" k="exercise" type="number" />
              <Field label="Smoking" k="smoking" options={["never","former","current"]} />
              <Field label="Alcohol" k="alcohol" options={["none","occasional","moderate","heavy"]} />
            </div>
          </div>

          {error && <div style={{ padding: "0.75rem", background: "#FCEBEB", borderRadius: 10, fontSize: "0.85rem", color: "#A32D2D", marginBottom: "1rem" }}>{error}</div>}
          <button onClick={analyze} disabled={loading} style={{ width: "100%", background: "var(--green)", color: "var(--parchment)", border: "none", borderRadius: 12, padding: "0.875rem", fontSize: "0.95rem", fontWeight: 500, cursor: "pointer" }}>
            {loading ? "Calculating your longevity score with NVIDIA NIM..." : "Calculate Longevity Score →"}
          </button>
        </div>
      )}

      {report && (
        <div>
          {/* Score hero */}
          <div style={{ background: "var(--green)", borderRadius: 24, padding: "2.5rem", marginBottom: "1.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "0.78rem", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.5)", marginBottom: "0.5rem" }}>Longevity Score</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem", marginBottom: "1rem" }}>
                <span style={{ fontFamily: "'DM Serif Display',serif", fontSize: "5rem", lineHeight: 1, color: "var(--parchment)", letterSpacing: "-0.04em" }}>{report.longevityScore}</span>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "1.2rem", marginBottom: "0.75rem" }}>/100</span>
              </div>
              <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 6, height: 8, marginBottom: "1.25rem" }}>
                <div style={{ background: "var(--parchment)", width: `${report.longevityScore}%`, height: "100%", borderRadius: 6, transition: "width 1s ease" }} />
              </div>
              <p style={{ fontSize: "0.92rem", color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }}>{report.summary}</p>
            </div>
            <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 16, padding: "1.5rem" }}>
              <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.5)", marginBottom: "0.5rem" }}>Estimated biological age</div>
              <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: "3.5rem", color: "var(--parchment)", letterSpacing: "-0.03em", marginBottom: "0.25rem" }}>{report.biologicalAge}</div>
              <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)" }}>years old</div>
              <div style={{ marginTop: "1rem", fontSize: "0.82rem", color: report.biologicalAge < parseInt(metrics.age) ? "#A8D5B5" : "#FDECD9" }}>
                {report.biologicalAge < parseInt(metrics.age)
                  ? `✓ ${parseInt(metrics.age) - report.biologicalAge} years younger than your age`
                  : `↑ ${report.biologicalAge - parseInt(metrics.age)} years older than your age`}
              </div>
              <button onClick={() => setReport(null)} style={{ marginTop: "1rem", background: "rgba(255,255,255,0.15)", color: "var(--parchment)", border: "none", borderRadius: 100, padding: "0.5rem 1.25rem", fontSize: "0.8rem", cursor: "pointer" }}>Recalculate</button>
            </div>
          </div>

          {/* Categories */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
            {report.categories?.map((cat, i) => (
              <div key={i} style={{ background: "white", borderRadius: 16, border: "1px solid var(--border)", padding: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                  <div style={{ fontWeight: 500, fontSize: "0.9rem" }}>{cat.name}</div>
                  <span style={{ fontSize: "0.7rem", padding: "2px 8px", borderRadius: 100, fontWeight: 500, background: statusColor(cat.status).bg, color: statusColor(cat.status).text }}>{cat.status}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                  <div style={{ flex: 1, background: "var(--parchment-3)", borderRadius: 4, height: 6 }}>
                    <div style={{ width: `${cat.score}%`, height: "100%", background: "var(--green-light)", borderRadius: 4 }} />
                  </div>
                  <span style={{ fontWeight: 500, fontSize: "0.88rem", color: "var(--ink)" }}>{cat.score}</span>
                </div>
                <p style={{ fontSize: "0.8rem", color: "var(--ink-muted)", lineHeight: 1.5 }}>{cat.summary}</p>
              </div>
            ))}
          </div>

          {/* Wins & Risks */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
            <div style={{ background: "var(--green-muted)", borderRadius: 16, padding: "1.5rem" }}>
              <div style={{ fontWeight: 500, fontSize: "0.92rem", color: "var(--green)", marginBottom: "1rem" }}>✓ What's working</div>
              {report.topWins?.map((w, i) => <div key={i} style={{ fontSize: "0.85rem", color: "var(--ink-mid)", marginBottom: "0.6rem" }}>• {w}</div>)}
            </div>
            <div style={{ background: "#FDECD9", borderRadius: 16, padding: "1.5rem" }}>
              <div style={{ fontWeight: 500, fontSize: "0.92rem", color: "#C8632A", marginBottom: "1rem" }}>⚠ Areas to improve</div>
              {report.topRisks?.map((r, i) => <div key={i} style={{ fontSize: "0.85rem", color: "var(--ink-mid)", marginBottom: "0.6rem" }}>• {r}</div>)}
            </div>
          </div>

          {/* Interventions */}
          <div style={{ background: "white", borderRadius: 20, border: "1px solid var(--border)", padding: "1.75rem" }}>
            <div style={{ fontWeight: 500, fontSize: "0.95rem", color: "var(--ink)", marginBottom: "0.25rem" }}>Personalised Interventions</div>
            <div style={{ fontSize: "0.8rem", color: "var(--ink-muted)", marginBottom: "1.25rem" }}>Evidence-based actions ranked by impact on your longevity score</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "1rem" }}>
              {report.interventions?.map((iv, i) => (
                <div key={i} style={{ background: "var(--parchment)", borderRadius: 12, padding: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.4rem" }}>
                    <div style={{ fontWeight: 500, fontSize: "0.88rem" }}>{iv.title}</div>
                    <span style={{ fontSize: "0.68rem", padding: "2px 8px", borderRadius: 100, fontWeight: 500, background: impactColor(iv.impact).bg, color: impactColor(iv.impact).text, flexShrink: 0, marginLeft: "0.5rem" }}>{iv.impact} impact</span>
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--green-light)", fontWeight: 500, marginBottom: "0.4rem", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>{iv.category}</div>
                  <div style={{ fontSize: "0.82rem", color: "var(--ink-muted)", lineHeight: 1.5 }}>{iv.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
