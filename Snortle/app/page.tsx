"use client";
import Link from "next/link";
import { useState } from "react";

const faqs = [
  { q: "What is Snortle?", a: "Snortle is an AI-powered primary care platform combining a smart AI assistant with board-certified clinicians. Available 24/7 for labs, prescriptions, longevity, and more." },
  { q: "What can Snortle actually do for me?", a: "Analyse your lab results in plain language, track biomarkers over time, draft prescription refill requests for clinician review, and give personalised longevity insights." },
  { q: "Why use Snortle instead of other AI apps?", a: "Most AI apps don't access your real medical records or connect to licensed clinicians. Snortle routes everything through board-certified providers so recommendations are grounded in your history." },
  { q: "Can I trust Snortle with real medical decisions?", a: "Snortle is HIPAA-compliant with encrypted data at rest and in transit. All clinical recommendations are reviewed by a licensed clinician before being acted upon." },
  { q: "How much does Snortle cost?", a: "Snortle offers a free tier for basic insights and one lab review per month. Pro includes unlimited lab analysis, prescription management, and priority clinician access." },
];

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div style={{ background: "#FEFBF3", minHeight: "100vh", overflowX: "hidden", fontFamily: "'Inter', sans-serif", color: "#1C1409" }}>

      {/* ── NAV ── */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(254,251,243,0.92)", backdropFilter: "blur(14px)", borderBottom: "1px solid rgba(60,40,10,0.1)", padding: "0 5vw", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", color: "#1A5248", fontStyle: "italic", letterSpacing: "-0.01em" }}>Snortle</span>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <a href="#features" style={{ fontSize: "0.875rem", color: "#5C4E38", textDecoration: "none" }}>Features</a>
          <a href="#faq" style={{ fontSize: "0.875rem", color: "#5C4E38", textDecoration: "none" }}>FAQ</a>
          <Link href="/auth/login" style={{ fontSize: "0.875rem", color: "#1A5248", textDecoration: "none", fontWeight: 500 }}>Sign in</Link>
          <Link href="/auth/signup" style={{ background: "#1A5248", color: "#FEFBF3", padding: "0.5rem 1.25rem", borderRadius: 100, fontSize: "0.875rem", fontWeight: 600, textDecoration: "none", letterSpacing: "0.01em" }}>
            Get started →
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ padding: "96px 5vw 72px", display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "4rem", alignItems: "center", position: "relative", maxWidth: 1200, margin: "0 auto" }}>
        {/* Background blob */}
        <div style={{ position: "absolute", right: "-2%", top: "-5%", width: 420, height: 420, background: "radial-gradient(circle, #C8EAE5 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none", zIndex: 0 }} />

        {/* Left: copy */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#C8EAE5", color: "#1A5248", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "0.4rem 1rem", borderRadius: 100, marginBottom: "1.75rem", border: "1.5px solid #5AADA0" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2A7B6F", display: "inline-block" }} />
            HIPAA Compliant · Board-Certified Clinicians
          </div>

          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.6rem,4.5vw,4rem)", lineHeight: 1.1, letterSpacing: "-0.02em", color: "#1C1409", marginBottom: "1.25rem" }}>
            Your AI doctor for a{" "}
            <em style={{ color: "#2A7B6F", fontStyle: "italic" }}>longer,</em>
            {" "}healthier life
          </h1>

          <p style={{ fontSize: "1.1rem", fontWeight: 400, color: "#3D2E1A", maxWidth: 460, marginBottom: "2.25rem", lineHeight: 1.75 }}>
            Primary care, supported by AI, that never closes, never rushes you, and never forgets the details.
          </p>

          <div style={{ display: "flex", gap: "0.875rem", flexWrap: "wrap", marginBottom: "2rem" }}>
            <Link href="/auth/signup" style={{ background: "#1A5248", color: "#FEFBF3", padding: "0.9rem 2rem", borderRadius: 100, fontSize: "0.95rem", fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
              Start for free →
            </Link>
            <a href="#features" style={{ background: "transparent", color: "#1A5248", padding: "0.9rem 2rem", borderRadius: 100, border: "2px solid #1A5248", fontSize: "0.95rem", fontWeight: 500, textDecoration: "none" }}>
              How it works
            </a>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {[["🔬","Analyse Labs"],["💊","Refill Rx"],["📈","Longevity"],["🥗","Nutrition"],["🩺","Symptoms"]].map(([icon, label]) => (
              <Link key={label} href="/auth/signup" style={{ background: "white", border: "1.5px solid rgba(60,40,10,0.14)", borderRadius: 100, padding: "0.4rem 0.9rem", fontSize: "0.8rem", color: "#3D2E1A", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.3rem", fontWeight: 500 }}>
                <span>{icon}</span>{label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right: chat mockup */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "center" }}>
          <div style={{ background: "white", borderRadius: 24, border: "1.5px solid rgba(60,40,10,0.1)", padding: "1.5rem", width: 340, boxShadow: "0 20px 60px rgba(26,82,72,0.14)" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", paddingBottom: "1rem", marginBottom: "1rem", borderBottom: "1px solid rgba(60,40,10,0.08)" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#C8EAE5", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display',serif", fontSize: "1.1rem", color: "#1A5248", fontStyle: "italic" }}>S</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.92rem", color: "#1C1409" }}>Snortle AI Doctor</div>
                <div style={{ fontSize: "0.7rem", color: "#2A7B6F", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#2A7B6F", display: "inline-block" }} />
                  Online · Clinician on call
                </div>
              </div>
            </div>
            {/* Messages */}
            <div style={{ marginBottom: "0.75rem" }}>
              <div style={{ background: "#1A5248", borderRadius: "14px 4px 14px 14px", padding: "0.65rem 0.875rem", fontSize: "0.83rem", color: "#FEFBF3", maxWidth: "80%", marginLeft: "auto", lineHeight: 1.5 }}>Can you review my latest labs?</div>
            </div>
            <div style={{ background: "#F2EBD9", borderRadius: "4px 14px 14px 14px", padding: "0.75rem 0.875rem", fontSize: "0.83rem", color: "#1C1409", lineHeight: 1.6, maxWidth: "90%", marginBottom: "0.75rem" }}>
              Your cholesterol looks mostly good, but LDL is at 142 — slightly above goal. I'd suggest we discuss a statin given your family history.
            </div>
            <div style={{ background: "#FEFBF3", border: "1px solid rgba(60,40,10,0.1)", borderRadius: 12, padding: "0.625rem 0.875rem" }}>
              {[["LDL Cholesterol","142 mg/dL","high"],["HDL","58 mg/dL","ok"],["Triglycerides","108 mg/dL","ok"]].map(([l,v,s]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.22rem 0", borderBottom: "1px solid rgba(60,40,10,0.06)", fontSize: "0.78rem" }}>
                  <span style={{ color: "#5C4E38" }}>{l}</span>
                  <span style={{ fontWeight: 600, color: "#1C1409" }}>{v} {s === "high" && <span style={{ fontSize: "0.65rem", background: "#FDECD9", color: "#B8450A", padding: "1px 6px", borderRadius: 100, marginLeft: 4 }}>↑ High</span>}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Float badges */}
          <div style={{ position: "absolute", top: -20, right: -30, background: "white", borderRadius: 14, padding: "0.7rem 1rem", border: "1.5px solid rgba(60,40,10,0.1)", boxShadow: "0 4px 16px rgba(26,82,72,0.1)", fontSize: "0.78rem" }}>
            <div style={{ color: "#7A6A52", fontSize: "0.65rem", marginBottom: "0.2rem" }}>HbA1c</div>
            <div style={{ fontWeight: 700, color: "#1C1409", fontSize: "1rem" }}>5.4%</div>
            <div style={{ color: "#2A7B6F", fontSize: "0.7rem", fontWeight: 600 }}>✓ Normal</div>
          </div>
          <div style={{ position: "absolute", bottom: 20, left: -30, background: "white", borderRadius: 14, padding: "0.7rem 1rem", border: "1.5px solid rgba(60,40,10,0.1)", boxShadow: "0 4px 16px rgba(26,82,72,0.1)", fontSize: "0.78rem" }}>
            <div style={{ color: "#7A6A52", fontSize: "0.65rem", marginBottom: "0.2rem" }}>Longevity Score</div>
            <div style={{ fontWeight: 700, color: "#1C1409", fontSize: "1.1rem" }}>74 / 100</div>
            <div style={{ color: "#2A7B6F", fontSize: "0.7rem", fontWeight: 600 }}>↑ Improving</div>
          </div>
        </div>
      </section>

      {/* ── FEATURES SECTION ── */}
      <div id="features" style={{ padding: "0 5vw 80px", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ background: "#1A5248", borderRadius: 28, padding: "60px 5vw", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(200,234,229,0.7)", marginBottom: "0.75rem" }}>Medical history</div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(1.8rem,3vw,2.5rem)", color: "#FEFBF3", lineHeight: 1.15, marginBottom: "1rem" }}>
              Import your health data in minutes
            </h2>
            <p style={{ fontSize: "0.95rem", color: "rgba(254,251,243,0.72)", lineHeight: 1.75, marginBottom: "1.75rem" }}>
              Verify once and Snortle pulls your complete picture from 150,000+ hospitals. No passwords, no portal logins required.
            </p>
            {[["1","Verify your identity","One-time step using your government ID"],["2","Auto-import from 150k+ providers","No portal logins — we handle it"],["3","Full timeline, instantly","Labs, prescriptions, visits in one place"]].map(([n,t,d]) => (
              <div key={n} style={{ display: "flex", gap: "0.875rem", marginBottom: "0.875rem" }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.12)", border: "1.5px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.78rem", color: "rgba(255,255,255,0.9)", flexShrink: 0, fontWeight: 700 }}>{n}</div>
                <div style={{ fontSize: "0.88rem", color: "rgba(254,251,243,0.75)", paddingTop: "0.3rem", lineHeight: 1.55 }}>
                  <strong style={{ color: "#FEFBF3", fontWeight: 600 }}>{t}</strong> — {d}
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "2rem", textAlign: "center" }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "3.5rem", color: "#FEFBF3", letterSpacing: "-0.03em", lineHeight: 1 }}>150k+</div>
            <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", marginTop: "0.4rem", marginBottom: "1.5rem" }}>Connected hospitals & clinics</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.625rem" }}>
              {["Mayo Clinic","Kaiser","Cleveland","NYU Langone","UCSF","Mass General"].map(h => (
                <div key={h} style={{ background: "rgba(255,255,255,0.08)", borderRadius: 8, padding: "0.5rem 0.25rem", fontSize: "0.7rem", color: "rgba(255,255,255,0.65)", textAlign: "center" }}>{h}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── TRUST STATS ── */}
      <section style={{ padding: "60px 5vw", maxWidth: 1280, margin: "0 auto", textAlign: "center" }}>
        <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#2A7B6F", marginBottom: "0.75rem" }}>Powered by AI · Verified by clinicians</div>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(1.8rem,3vw,2.4rem)", color: "#1C1409", marginBottom: "3rem" }}>Every recommendation, clinician-reviewed</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.25rem", maxWidth: 820, margin: "0 auto" }}>
          {[["24/7","Always available — no appointments needed"],["150k+","Connected hospitals for instant history import"],["100%","Clinician-reviewed before any prescription is sent"]].map(([n,l]) => (
            <div key={n} style={{ background: "white", borderRadius: 20, border: "1.5px solid rgba(60,40,10,0.1)", padding: "2rem 1.25rem", boxShadow: "0 2px 16px rgba(60,40,10,0.07)" }}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "2.8rem", color: "#1A5248", letterSpacing: "-0.03em", lineHeight: 1, marginBottom: "0.5rem" }}>{n}</div>
              <div style={{ fontSize: "0.83rem", color: "#5C4E38", lineHeight: 1.55 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ padding: "40px 5vw 80px", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#2A7B6F", marginBottom: "0.5rem" }}>FAQs</div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(1.8rem,3vw,2.4rem)", color: "#1C1409" }}>Common questions</h2>
        </div>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          {faqs.map((f, i) => (
            <div key={i} style={{ borderBottom: "1.5px solid rgba(60,40,10,0.1)", padding: "1.1rem 0", cursor: "pointer" }} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
                <span style={{ fontWeight: 600, fontSize: "0.95rem", color: "#1C1409" }}>{f.q}</span>
                <span style={{ width: 26, height: 26, borderRadius: "50%", border: "1.5px solid rgba(60,40,10,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#5C4E38", flexShrink: 0, transform: openFaq === i ? "rotate(45deg)" : "none", transition: "transform 0.2s", fontSize: "1.1rem" }}>+</span>
              </div>
              {openFaq === i && <div style={{ fontSize: "0.88rem", color: "#3D2E1A", lineHeight: 1.7, paddingTop: "0.75rem" }}>{f.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <div style={{ padding: "0 5vw 80px", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ background: "#1A5248", borderRadius: 28, padding: "72px 5vw", textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(2rem,4vw,3rem)", color: "#FEFBF3", letterSpacing: "-0.02em", marginBottom: "0.875rem" }}>
            Your health, finally under your control
          </h2>
          <p style={{ fontSize: "1rem", color: "rgba(254,251,243,0.65)", marginBottom: "2rem", maxWidth: 440, margin: "0 auto 2rem" }}>
            Join thousands who've made Snortle their first call — not their last resort.
          </p>
          <Link href="/auth/signup" style={{ background: "#FEFBF3", color: "#1A5248", padding: "0.95rem 2.5rem", borderRadius: 100, fontSize: "1rem", fontWeight: 700, textDecoration: "none", display: "inline-block" }}>
            Get started free →
          </Link>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ padding: "3rem 5vw 1.5rem", borderTop: "1.5px solid rgba(60,40,10,0.1)", display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", gap: "3rem", maxWidth: 1280, margin: "0 auto" }}>
        <div>
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.4rem", color: "#1A5248", fontStyle: "italic", display: "block", marginBottom: "0.625rem" }}>Snortle</span>
          <p style={{ fontSize: "0.8rem", color: "#7A6A52", lineHeight: 1.65, maxWidth: 260 }}>An AI doctor for a longer, healthier life. Backed by board-certified clinicians.</p>
          <div style={{ marginTop: "0.875rem", display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "#C8EAE5", color: "#1A5248", fontSize: "0.68rem", fontWeight: 700, padding: "0.3rem 0.75rem", borderRadius: 100, letterSpacing: "0.06em" }}>🔒 HIPAA COMPLIANT</div>
        </div>
        <div>
          <h4 style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#1C1409", marginBottom: "0.875rem" }}>Company</h4>
          {["About Us","Careers","Contact"].map(l => <a key={l} href="#" style={{ display: "block", fontSize: "0.83rem", color: "#7A6A52", textDecoration: "none", marginBottom: "0.5rem" }}>{l}</a>)}
        </div>
        <div>
          <h4 style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#1C1409", marginBottom: "0.875rem" }}>Legal</h4>
          {["Privacy Policy","Terms of Service","HIPAA & Trust"].map(l => <a key={l} href="#" style={{ display: "block", fontSize: "0.83rem", color: "#7A6A52", textDecoration: "none", marginBottom: "0.5rem" }}>{l}</a>)}
        </div>
      </footer>
      <div style={{ padding: "1.25rem 5vw", borderTop: "1px solid rgba(60,40,10,0.08)", display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#B5A48A", flexWrap: "wrap", gap: "0.5rem", maxWidth: 1280, margin: "0 auto" }}>
        <span>© 2026 Snortle Health. All rights reserved.</span>
        <span>AI assistant only — not a substitute for professional medical advice.</span>
      </div>
    </div>
  );
}
