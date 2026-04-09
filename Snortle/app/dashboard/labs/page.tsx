"use client";
import { useState } from "react";

const SAMPLE_LABS = `CBC with Differential:
WBC: 6.2 x10^3/uL (ref: 4.5-11.0)
RBC: 4.8 x10^6/uL (ref: 4.5-5.5)
Hemoglobin: 14.2 g/dL (ref: 13.5-17.5)
Hematocrit: 42% (ref: 41-53)
MCV: 88 fL (ref: 80-100)
Platelets: 245 x10^3/uL (ref: 150-400)

Comprehensive Metabolic Panel:
Glucose: 94 mg/dL (ref: 70-100)
BUN: 18 mg/dL (ref: 7-25)
Creatinine: 0.9 mg/dL (ref: 0.6-1.2)
eGFR: >90 mL/min/1.73m2
Sodium: 139 mEq/L (ref: 135-145)
Potassium: 4.1 mEq/L (ref: 3.5-5.0)
AST: 28 U/L (ref: 10-40)
ALT: 32 U/L (ref: 7-56)

Lipid Panel:
Total Cholesterol: 218 mg/dL (ref: <200)
LDL: 142 mg/dL (ref: <100)
HDL: 52 mg/dL (ref: >40)
Triglycerides: 108 mg/dL (ref: <150)

Other:
HbA1c: 5.4% (ref: <5.7)
TSH: 2.1 mIU/L (ref: 0.4-4.0)
Vitamin D 25-OH: 42 ng/mL (ref: 30-100)
Ferritin: 68 ng/mL (ref: 12-300)`;

interface LabResult {
  name: string;
  value: string;
  status: "normal" | "low" | "high" | "critical";
  range: string;
  interpretation: string;
  trend: string;
}

interface LabReport {
  summary: string;
  status: "normal" | "attention" | "urgent";
  results: LabResult[];
  insights: string[];
  recommendations: string[];
  followUp: string;
}

export default function LabsPage() {
  const [labInput, setLabInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<LabReport | null>(null);
  const [error, setError] = useState("");

  async function analyze() {
    if (!labInput.trim()) return;
    setLoading(true);
    setError("");
    setReport(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ labs: labInput }),
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
    normal: { bg: "var(--green-muted)", text: "var(--green)" },
    low: { bg: "#EDE7DC", text: "#8A6B00" },
    high: { bg: "#FDECD9", text: "#C8632A" },
    critical: { bg: "#FCEBEB", text: "#A32D2D" },
    attention: { bg: "#FDECD9", text: "#C8632A" },
    urgent: { bg: "#FCEBEB", text: "#A32D2D" },
  }[s] ?? { bg: "var(--green-muted)", text: "var(--green)" });

  return (
    <div style={{ padding: "2.5rem 2.5rem 4rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ fontSize: "0.78rem", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "var(--green-light)", marginBottom: "0.25rem" }}>AI-Powered</div>
        <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "2.2rem", color: "var(--green)", letterSpacing: "-0.02em" }}>Lab Analysis</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginTop: "0.25rem" }}>Paste your lab results and Snortle will explain every value in plain language.</p>
      </div>

      {!report && (
        <div style={{ background: "white", borderRadius: 20, border: "1px solid var(--border)", padding: "1.75rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <label style={{ fontSize: "0.88rem", fontWeight: 500, color: "var(--text)" }}>Paste your lab results below</label>
            <button onClick={() => setLabInput(SAMPLE_LABS)} style={{ fontSize: "0.78rem", color: "var(--green-light)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
              Load sample
            </button>
          </div>
          <textarea
            value={labInput}
            onChange={e => setLabInput(e.target.value)}
            placeholder={"Paste your lab report text here...\n\nExample:\nLDL: 142 mg/dL (ref: <100)\nHDL: 52 mg/dL (ref: >40)\nHbA1c: 5.4% (ref: <5.7)"}
            style={{ width: "100%", minHeight: 240, border: "1.5px solid var(--border)", borderRadius: 12, padding: "1rem", fontFamily: "'DM Sans',sans-serif", fontSize: "0.88rem", color: "var(--text)", background: "var(--cream)", resize: "vertical", outline: "none", lineHeight: 1.6 }}
          />
          {error && <div style={{ marginTop: "0.75rem", padding: "0.75rem", background: "#FCEBEB", borderRadius: 10, fontSize: "0.85rem", color: "#A32D2D" }}>{error}</div>}
          <button onClick={analyze} disabled={!labInput.trim() || loading} style={{
            marginTop: "1rem", width: "100%", background: labInput.trim() ? "var(--green)" : "var(--green-muted)",
            color: labInput.trim() ? "var(--cream)" : "var(--text-muted)", border: "none", borderRadius: 12,
            padding: "0.875rem", fontSize: "0.95rem", fontWeight: 500, cursor: labInput.trim() ? "pointer" : "default"
          }}>
            {loading ? "Analyzing with NVIDIA NIM..." : "Analyze Labs →"}
          </button>
        </div>
      )}

      {loading && (
        <div style={{ background: "white", borderRadius: 20, border: "1px solid var(--border)", padding: "3rem", textAlign: "center" as const }}>
          <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: "1.5rem", color: "var(--green)", marginBottom: "0.75rem" }}>Analyzing your results...</div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Snortle is reviewing each biomarker against clinical reference ranges and your context.</p>
        </div>
      )}

      {report && (
        <div>
          {/* Summary banner */}
          <div style={{ background: statusColor(report.status).bg, border: `1px solid ${statusColor(report.status).text}30`, borderRadius: 16, padding: "1.25rem 1.5rem", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                <span style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" as const, background: statusColor(report.status).text, color: "white", padding: "2px 8px", borderRadius: 100 }}>{report.status}</span>
              </div>
              <p style={{ fontSize: "0.92rem", color: "var(--text)", lineHeight: 1.6 }}>{report.summary}</p>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>Follow-up: {report.followUp}</p>
            </div>
            <button onClick={() => setReport(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "1.2rem", marginLeft: "1rem", flexShrink: 0 }}>↺</button>
          </div>

          {/* Results grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
            {report.results?.map((r, i) => (
              <div key={i} style={{ background: "white", borderRadius: 16, border: "1px solid var(--border)", padding: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                  <div style={{ fontWeight: 500, fontSize: "0.92rem", color: "var(--text)" }}>{r.name}</div>
                  <span style={{ fontSize: "0.7rem", padding: "2px 8px", borderRadius: 100, fontWeight: 500, background: statusColor(r.status).bg, color: statusColor(r.status).text, flexShrink: 0, marginLeft: "0.5rem" }}>
                    {r.status === "high" ? "↑ High" : r.status === "low" ? "↓ Low" : r.status === "critical" ? "⚠ Critical" : "✓ Normal"}
                  </span>
                </div>
                <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: "1.4rem", color: "var(--green)", marginBottom: "0.25rem" }}>{r.value}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.6rem" }}>Ref: {r.range}</div>
                <div style={{ fontSize: "0.82rem", color: "var(--text-mid)", lineHeight: 1.55 }}>{r.interpretation}</div>
              </div>
            ))}
          </div>

          {/* Insights + Recommendations */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            <div style={{ background: "white", borderRadius: 16, border: "1px solid var(--border)", padding: "1.5rem" }}>
              <div style={{ fontWeight: 500, fontSize: "0.92rem", marginBottom: "1rem" }}>Key Insights</div>
              {report.insights?.map((ins, i) => (
                <div key={i} style={{ display: "flex", gap: "0.6rem", marginBottom: "0.75rem" }}>
                  <span style={{ color: "var(--green-light)", flexShrink: 0 }}>→</span>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-mid)", lineHeight: 1.5 }}>{ins}</span>
                </div>
              ))}
            </div>
            <div style={{ background: "var(--green)", borderRadius: 16, padding: "1.5rem" }}>
              <div style={{ fontWeight: 500, fontSize: "0.92rem", color: "var(--cream)", marginBottom: "1rem" }}>Recommendations</div>
              {report.recommendations?.map((rec, i) => (
                <div key={i} style={{ display: "flex", gap: "0.6rem", marginBottom: "0.75rem" }}>
                  <span style={{ color: "rgba(255,255,255,0.5)", flexShrink: 0 }}>→</span>
                  <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
