"use client";
import Link from "next/link";
import { useState } from "react";

const faqs = [
  { q: "What is Clara?", a: "Clara is an AI-powered primary care platform combining a smart AI assistant with board-certified clinicians to help you manage your health — labs, prescriptions, longevity, and more. Available 24/7." },
  { q: "What can Clara actually do for me?", a: "Analyze your lab results in plain language, track biomarkers over time, draft prescription refill requests for clinician review, import your full medical history from 150,000+ providers, and give personalized longevity and diet insights." },
  { q: "Why use Clara instead of other AI apps?", a: "Most AI apps don't access your real medical records or connect to licensed clinicians. Clara routes everything through board-certified providers so recommendations are grounded in your actual history." },
  { q: "Can I trust Clara with real medical decisions?", a: "Clara is HIPAA-compliant with encrypted data at rest and in transit. All clinical recommendations are reviewed by a licensed clinician before being acted upon." },
  { q: "How much does Clara cost?", a: "Clara offers a free tier for basic insights and one lab review per month. Pro includes unlimited lab analysis, prescription management, and priority clinician access." },
];

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div style={{ background: "var(--cream)", minHeight: "100vh", overflowX: "hidden" }}>
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(247,243,238,0.88)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--border)", padding: "0 5vw", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.5rem", color: "var(--green)" }}>Clara</span>
        <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          <a href="#features" style={{ fontSize: "0.875rem", color: "var(--text-mid)", textDecoration: "none" }}>Features</a>
          <a href="#faq" style={{ fontSize: "0.875rem", color: "var(--text-mid)", textDecoration: "none" }}>FAQ</a>
          <Link href="/dashboard" style={{ background: "var(--green)", color: "var(--cream)", padding: "0.5rem 1.25rem", borderRadius: 100, fontSize: "0.875rem", fontWeight: 500, textDecoration: "none" }}>Get started</Link>
        </div>
      </nav>

      <section style={{ minHeight: "100vh", padding: "120px 5vw 80px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 80% at 80% 50%, var(--green-muted) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "var(--green-muted)", color: "var(--green)", fontSize: "0.8rem", fontWeight: 500, letterSpacing: "0.04em", padding: "0.4rem 1rem", borderRadius: 100, marginBottom: "1.5rem", border: "1px solid rgba(74,140,104,0.3)" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green-light)", display: "inline-block" }} />
            HIPAA Compliant · Board-Certified Clinicians
          </div>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(2.8rem,5vw,4.2rem)", lineHeight: 1.08, letterSpacing: "-0.03em", color: "var(--green)", marginBottom: "1.25rem" }}>
            Your AI doctor for a{" "}<em style={{ color: "var(--green-light)" }}>longer,</em>{" "}healthier life
          </h1>
          <p style={{ fontSize: "1.1rem", fontWeight: 300, color: "var(--text-mid)", maxWidth: 480, marginBottom: "2rem", lineHeight: 1.7 }}>
            Primary care, supported by AI, that never closes, never rushes you, and never forgets the details.
          </p>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Link href="/dashboard" style={{ background: "var(--green)", color: "var(--cream)", padding: "0.875rem 2rem", borderRadius: 100, fontSize: "0.95rem", fontWeight: 500, textDecoration: "none" }}>Get started free</Link>
            <a href="#features" style={{ background: "transparent", color: "var(--green)", padding: "0.875rem 2rem", borderRadius: 100, border: "1.5px solid var(--green)", fontSize: "0.95rem", fontWeight: 500, textDecoration: "none" }}>How it works</a>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", marginTop: "2rem" }}>
            {["🔬 Analyze Labs","💊 Refill Prescription","📈 Longevity","🥗 Diet","🩺 Symptoms"].map(p => (
              <Link key={p} href="/dashboard/chat" style={{ background: "white", border: "1px solid var(--border)", borderRadius: 100, padding: "0.45rem 1rem", fontSize: "0.82rem", color: "var(--text-mid)", textDecoration: "none" }}>{p}</Link>
            ))}
          </div>
        </div>
        <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ background: "white", borderRadius: 24, border: "1px solid var(--border)", padding: "1.5rem", width: 340, boxShadow: "0 24px 60px rgba(30,61,47,0.12)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem", paddingBottom: "1rem", borderBottom: "1px solid var(--border)" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--green-muted)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Serif Display',serif", fontSize: "1.1rem", color: "var(--green)" }}>C</div>
              <div><div style={{ fontWeight: 500, fontSize: "0.95rem" }}>Clara</div><div style={{ fontSize: "0.75rem", color: "var(--green-light)" }}>● Online · Clinician on call</div></div>
            </div>
            <div style={{ marginBottom: "0.75rem" }}>
              <div style={{ background: "var(--green)", borderRadius: "12px 0 12px 12px", padding: "0.65rem 1rem", fontSize: "0.85rem", color: "var(--cream)", maxWidth: "80%", marginLeft: "auto" }}>Can you review my latest labs?</div>
            </div>
            <div>
              <div style={{ background: "var(--green-muted)", borderRadius: "0 12px 12px 12px", padding: "0.75rem 1rem", fontSize: "0.85rem", lineHeight: 1.55, maxWidth: "90%" }}>
                Your cholesterol panel looks mostly good, but LDL is slightly elevated at 142 mg/dL. Given your family history, I'd suggest we discuss a statin.
              </div>
              <div style={{ background: "var(--cream)", border: "1px solid var(--border)", borderRadius: 12, padding: "0.75rem 1rem", marginTop: "0.5rem" }}>
                {[["LDL Cholesterol","142 mg/dL",true],["HDL","58 mg/dL",false],["Triglycerides","108 mg/dL",false]].map(([l,v,flag])=>(
                  <div key={String(l)} style={{ display: "flex", justifyContent: "space-between", padding: "0.25rem 0", borderBottom: "1px solid var(--border)", fontSize: "0.8rem" }}>
                    <span style={{ color: "var(--text-muted)" }}>{String(l)}</span>
                    <span style={{ fontWeight: 500 }}>{String(v)} {flag && <span style={{ fontSize: "0.7rem", color: "#C8632A", background: "#FDECD9", padding: "2px 6px", borderRadius: 100 }}>↑ High</span>}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div id="features" style={{ padding: "0 4vw 80px" }}>
        <div style={{ background: "var(--green)", borderRadius: 32, padding: "80px 6vw", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "0.78rem", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.55)", marginBottom: "0.75rem" }}>Medical history</div>
            <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "clamp(2rem,3.5vw,2.8rem)", lineHeight: 1.12, color: "var(--cream)", marginBottom: "1rem" }}>Securely import your health data</h2>
            <p style={{ fontSize: "1rem", fontWeight: 300, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: "2rem" }}>Verify once and Clara pulls your complete picture from 150,000+ hospitals. No passwords, no portal logins.</p>
            {[["1","Verify your identity","One-time step using your government ID"],["2","Auto-import from 150k+ providers","No portal logins needed"],["3","Full timeline, instantly","Labs, prescriptions, visits in one place"]].map(([n,t,d])=>(
              <div key={n} style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", color: "rgba(255,255,255,0.8)", flexShrink: 0 }}>{n}</div>
                <div style={{ fontSize: "0.92rem", color: "rgba(255,255,255,0.75)", paddingTop: 5 }}><strong style={{ color: "var(--cream)" }}>{t}</strong> — {d}</div>
              </div>
            ))}
          </div>
          <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 20, padding: "2rem", textAlign: "center" as const }}>
            <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: "3.5rem", color: "var(--cream)", letterSpacing: "-0.03em" }}>150k+</div>
            <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", marginTop: "0.25rem" }}>Connected hospitals & clinics</div>
            <div style={{ marginTop: "1.5rem", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.75rem" }}>
              {["Mayo Clinic","Kaiser","Cleveland Clinic","NYU Langone","UCSF Health","Mass General"].map(h=>(
                <div key={h} style={{ background: "rgba(255,255,255,0.1)", borderRadius: 8, padding: "0.5rem", fontSize: "0.72rem", color: "rgba(255,255,255,0.6)", textAlign: "center" as const }}>{h}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section style={{ padding: "80px 5vw", textAlign: "center" as const }}>
        <div style={{ fontSize: "0.78rem", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--green-light)", marginBottom: "0.75rem" }}>Powered by AI. Verified by clinicians</div>
        <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "clamp(2rem,3.5vw,2.8rem)", color: "var(--green)", marginBottom: "3rem" }}>Every recommendation, clinician-reviewed</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.5rem", maxWidth: 900, margin: "0 auto" }}>
          {[["24/7","Clara is always available — no appointments needed"],["150k+","Connected hospitals for instant history import"],["100%","Clinician-reviewed before any prescription is sent"]].map(([n,l])=>(
            <div key={n} style={{ background: "white", borderRadius: 20, border: "1px solid var(--border)", padding: "2rem 1.5rem" }}>
              <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: "2.8rem", color: "var(--green)", letterSpacing: "-0.03em" }}>{n}</div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="faq" style={{ padding: "40px 5vw 80px" }}>
        <div style={{ textAlign: "center" as const, marginBottom: "3rem" }}>
          <div style={{ fontSize: "0.78rem", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--green-light)", marginBottom: "0.75rem" }}>FAQs</div>
          <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "clamp(2rem,3.5vw,2.8rem)", color: "var(--green)" }}>Have questions? Here are the answers.</h2>
        </div>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          {faqs.map((f, i) => (
            <div key={i} style={{ borderBottom: "1px solid var(--border)", padding: "1.25rem 0", cursor: "pointer" }} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", fontWeight: 500, fontSize: "1rem" }}>
                <span>{f.q}</span>
                <span style={{ width: 28, height: 28, borderRadius: "50%", border: "1.5px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", color: "var(--text-muted)", flexShrink: 0, transform: openFaq === i ? "rotate(45deg)" : "none", transition: "transform 0.2s" }}>+</span>
              </div>
              {openFaq === i && <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.7, paddingTop: "0.75rem" }}>{f.a}</div>}
            </div>
          ))}
        </div>
      </section>

      <div style={{ padding: "0 4vw 80px" }}>
        <div style={{ background: "var(--green)", borderRadius: 32, padding: "80px 6vw", textAlign: "center" as const }}>
          <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "clamp(2rem,4vw,3.2rem)", color: "var(--cream)", letterSpacing: "-0.03em", marginBottom: "1rem" }}>Your health, finally under your control</h2>
          <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.65)", marginBottom: "2rem" }}>Join thousands who've made Clara their first call — not their last resort.</p>
          <Link href="/dashboard" style={{ background: "var(--cream)", color: "var(--green)", padding: "1rem 2.5rem", borderRadius: 100, fontSize: "1rem", fontWeight: 500, textDecoration: "none", display: "inline-block" }}>Chat with Clara →</Link>
        </div>
      </div>

      <footer style={{ padding: "3rem 5vw 1.5rem", borderTop: "1px solid var(--border)", display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", gap: "3rem" }}>
        <div>
          <span style={{ fontFamily: "'DM Serif Display',serif", fontSize: "1.5rem", color: "var(--green)", display: "block", marginBottom: "0.75rem" }}>Clara</span>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6, maxWidth: 280 }}>An AI doctor for a longer, healthier life. Backed by board-certified clinicians. Available 24/7.</p>
          <div style={{ marginTop: "1rem", display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "var(--green-muted)", color: "var(--green)", fontSize: "0.72rem", fontWeight: 500, padding: "0.3rem 0.75rem", borderRadius: 100 }}>🔒 HIPAA Compliant</div>
        </div>
        <div>
          <h4 style={{ fontSize: "0.8rem", fontWeight: 500, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: "1rem" }}>Company</h4>
          {["About Us","Careers","Contact"].map(l => <a key={l} href="#" style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", textDecoration: "none", marginBottom: "0.6rem" }}>{l}</a>)}
        </div>
        <div>
          <h4 style={{ fontSize: "0.8rem", fontWeight: 500, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: "1rem" }}>Legal</h4>
          {["Privacy Policy","Terms & Conditions","HIPAA & Trust"].map(l => <a key={l} href="#" style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", textDecoration: "none", marginBottom: "0.6rem" }}>{l}</a>)}
        </div>
      </footer>
      <div style={{ padding: "1.5rem 5vw", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "var(--text-muted)", flexWrap: "wrap" as const, gap: "1rem" }}>
        <span>© 2026 Clara Health. All rights reserved.</span>
        <span>Clara is an AI assistant, not a licensed clinician. All outputs are informational only.</span>
      </div>
    </div>
  );
}
