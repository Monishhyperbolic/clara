"use client";
import { useState, useRef } from "react";
import { extractPdfText } from "@/lib/extractPdf";

const SAMPLE = `CBC:\nWBC: 6.2 x10^3/uL (ref: 4.5-11.0)\nHemoglobin: 14.2 g/dL (ref: 13.5-17.5)\n\nLipid Panel:\nTotal Cholesterol: 218 mg/dL (ref: <200)\nLDL: 142 mg/dL (ref: <100)\nHDL: 52 mg/dL (ref: >40)\nTriglycerides: 108 mg/dL (ref: <150)\n\nMetabolic:\nGlucose: 94 mg/dL (ref: 70-100)\nHbA1c: 5.4% (ref: <5.7)\nVitamin D: 42 ng/mL (ref: 30-100)\nTSH: 2.1 mIU/L (ref: 0.4-4.0)`;

interface LabResult { name: string; value: string; status: string; range: string; interpretation: string; trend: string; }
interface Report { summary: string; status: string; results: LabResult[]; insights: string[]; recommendations: string[]; followUp: string; }

export default function LabsPage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handlePdf(file: File) {
    setPdfLoading(true);
    try { const t = await extractPdfText(file); setText(t.slice(0, 5000)); }
    catch { setError("Could not read PDF. Please paste the lab text directly."); }
    finally { setPdfLoading(false); }
  }

  async function analyze() {
    if (!text.trim()) return;
    setLoading(true); setError(""); setReport(null);
    try {
      const res = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ labs: text }) });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setReport(data);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Analysis failed"); }
    finally { setLoading(false); }
  }

  const sc = (s: string) => ({ normal: { bg: "var(--sage-light)", text: "var(--forest)" }, low: { bg: "var(--amber-soft)", text: "var(--amber)" }, high: { bg: "var(--blush)", text: "var(--rose-deep)" }, critical: { bg: "#FCEBEB", text: "#A32D2D" }, attention: { bg: "var(--amber-soft)", text: "var(--amber)" }, urgent: { bg: "var(--blush)", text: "var(--rose-deep)" } }[s] ?? { bg: "var(--sage-light)", text: "var(--forest)" });

  return (
    <div style={{ padding: "2rem 2.5rem 4rem" }}>
      <div style={{ marginBottom: "1.75rem" }}>
        <div style={{ fontSize: "0.72rem", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--sage)", marginBottom: "0.2rem" }}>AI-Powered Analysis</div>
        <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: "2rem", color: "var(--text)", letterSpacing: "-0.02em" }}>Lab Results</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.2rem" }}>Paste your lab text or upload a PDF — Snortle explains every value in plain language.</p>
      </div>

      {!report && (
        <div style={{ background: "white", borderRadius: 20, border: "1px solid var(--border)", padding: "1.75rem", boxShadow: "var(--shadow)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.875rem" }}>
            <label style={{ fontSize: "0.88rem", fontWeight: 500, color: "var(--text)" }}>Lab results text</label>
            <div style={{ display: "flex", gap: "0.6rem" }}>
              <label style={{ fontSize: "0.8rem", color: "var(--forest)", background: "var(--sage-light)", border: "none", borderRadius: 100, padding: "0.35rem 0.875rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                {pdfLoading ? "⏳ Reading..." : "📎 Upload PDF"}
                <input ref={fileRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={async e => { const f = e.target.files?.[0]; if (f) await handlePdf(f); if (e.target) e.target.value = ""; }} />
              </label>
              <button onClick={() => setText(SAMPLE)} style={{ fontSize: "0.78rem", color: "var(--sage)", background: "none", border: "1px solid var(--border)", borderRadius: 100, padding: "0.35rem 0.875rem", cursor: "pointer" }}>Load sample</button>
            </div>
          </div>
          <textarea value={text} onChange={e => setText(e.target.value)} placeholder={"Paste lab report text here...\n\nExample:\nLDL: 142 mg/dL (ref: <100)\nHDL: 52 mg/dL\nHbA1c: 5.4%"} style={{ width: "100%", minHeight: 220, border: "1.5px solid var(--border)", borderRadius: 12, padding: "0.875rem 1rem", fontFamily: "'DM Sans',sans-serif", fontSize: "0.88rem", color: "var(--text)", background: "var(--cream-warm)", resize: "vertical", outline: "none", lineHeight: 1.6 }} />
          {error && <div style={{ marginTop: "0.75rem", padding: "0.75rem 1rem", background: "var(--blush)", borderRadius: 10, fontSize: "0.85rem", color: "var(--rose-deep)" }}>{error}</div>}
          <button onClick={analyze} disabled={!text.trim() || loading || pdfLoading} style={{ marginTop: "1rem", width: "100%", background: text.trim() ? "var(--forest)" : "var(--sage-light)", color: text.trim() ? "#F5EFE0" : "var(--text-muted)", border: "none", borderRadius: 12, padding: "0.875rem", fontSize: "0.95rem", fontWeight: 500, cursor: text.trim() ? "pointer" : "default" }}>
            {loading ? "Analysing with NVIDIA NIM..." : "Analyse Labs →"}
          </button>
        </div>
      )}

      {loading && (
        <div style={{ background: "white", borderRadius: 20, border: "1px solid var(--border)", padding: "3rem", textAlign: "center" as const }}>
          <div style={{ fontFamily: "'Fraunces',serif", fontSize: "1.4rem", color: "var(--text)", marginBottom: "0.5rem", fontStyle: "italic" }}>Analysing your results...</div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>Snortle is reviewing each biomarker against clinical reference ranges.</p>
        </div>
      )}

      {report && (
        <div>
          <div style={{ background: sc(report.status).bg, border: `1px solid ${sc(report.status).text}30`, borderRadius: 16, padding: "1.25rem 1.5rem", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" as const, background: sc(report.status).text, color: "white", padding: "2px 8px", borderRadius: 100, display: "inline-block", marginBottom: "0.5rem" }}>{report.status}</span>
              <p style={{ fontSize: "0.9rem", color: "var(--text)", lineHeight: 1.65 }}>{report.summary}</p>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>Follow-up: {report.followUp}</p>
            </div>
            <button onClick={() => setReport(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "1.1rem", marginLeft: "1rem", flexShrink: 0 }}>↺ New</button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "0.875rem", marginBottom: "1.5rem" }}>
            {report.results?.map((r, i) => (
              <div key={i} style={{ background: "white", borderRadius: 16, border: "1px solid var(--border)", padding: "1.1rem 1.25rem", boxShadow: "var(--shadow)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.4rem" }}>
                  <div style={{ fontWeight: 500, fontSize: "0.88rem", color: "var(--text)" }}>{r.name}</div>
                  <span style={{ fontSize: "0.68rem", padding: "2px 7px", borderRadius: 100, fontWeight: 500, background: sc(r.status).bg, color: sc(r.status).text, flexShrink: 0, marginLeft: "0.5rem" }}>
                    {r.status === "high" ? "↑ High" : r.status === "low" ? "↓ Low" : r.status === "critical" ? "⚠ Critical" : "✓ Normal"}
                  </span>
                </div>
                <div style={{ fontFamily: "'Fraunces',serif", fontSize: "1.3rem", color: "var(--forest)", marginBottom: "0.2rem" }}>{r.value}</div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Ref: {r.range}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-mid)", lineHeight: 1.55 }}>{r.interpretation}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            <div style={{ background: "white", borderRadius: 16, border: "1px solid var(--border)", padding: "1.25rem" }}>
              <div style={{ fontWeight: 500, fontSize: "0.88rem", marginBottom: "0.875rem", color: "var(--text)" }}>Key Insights</div>
              {report.insights?.map((ins, i) => (<div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.6rem" }}><span style={{ color: "var(--sage)", flexShrink: 0 }}>→</span><span style={{ fontSize: "0.83rem", color: "var(--text-mid)", lineHeight: 1.55 }}>{ins}</span></div>))}
            </div>
            <div style={{ background: "var(--forest)", borderRadius: 16, padding: "1.25rem" }}>
              <div style={{ fontWeight: 500, fontSize: "0.88rem", color: "#F5EFE0", marginBottom: "0.875rem" }}>Recommendations</div>
              {report.recommendations?.map((rec, i) => (<div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.6rem" }}><span style={{ color: "var(--sage-light)", flexShrink: 0 }}>→</span><span style={{ fontSize: "0.83rem", color: "rgba(255,255,255,0.75)", lineHeight: 1.55 }}>{rec}</span></div>))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
