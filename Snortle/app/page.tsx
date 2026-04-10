"use client";
import Link from "next/link";
import { useState } from "react";

const faqs = [
  { q: "What is Snortle?", a: "Snortle is an AI-powered health assistant that helps you understand your lab results, track your biomarkers, estimate your biological age, and manage prescription refill requests — all in one place." },
  { q: "What can Snortle actually do for me?", a: "You can paste or upload lab reports and get plain-language explanations, calculate a personalised longevity score from your biomarkers, draft prescription refill requests, and chat with the AI about any health question." },
  { q: "Is Snortle a replacement for my doctor?", a: "No. Snortle is an AI tool to help you understand your health data and prepare for appointments. It is not a licensed medical service and cannot diagnose, prescribe, or replace professional medical advice." },
  { q: "How does the prescription refill feature work?", a: "Snortle drafts a refill request note based on what you enter. You review it and submit it — it's designed to help you organise your request before contacting your own doctor or pharmacy." },
  { q: "Is my data safe?", a: "Your data is stored securely via Supabase with encrypted connections. Snortle does not sell your data. That said, Snortle is not a certified HIPAA-covered entity — avoid entering sensitive identifiable health data." },
];

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div style={{ background: "#FEFBF3", minHeight: "100vh", overflowX: "hidden", fontFamily: "'Inter', sans-serif", color: "#1C1409" }}>

      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(254,251,243,0.92)", backdropFilter: "blur(14px)", borderBottom: "1px solid rgba(60,40,10,0.1)", padding: "0 5vw", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", color: "#1A5248", fontStyle: "italic" }}>Snortle</span>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <a href="#features" style={{ fontSize: "0.875rem", color: "#5C4E38", textDecoration: "none" }}>Features</a>
          <a href="#faq" style={{ fontSize: "0.875rem", color: "#5C4E38", textDecoration: "none" }}>FAQ</a>
          <Link href="/auth/login" style={{ fontSize: "0.875rem", color: "#1A5248", textDecoration: "none", fontWeight: 500 }}>Sign in</Link>
          <Link href="/auth/signup" style={{ background: "#1A5248", color: "#FEFBF3", padding: "0.5rem 1.25rem", borderRadius: 100, fontSize: "0.875rem", fontWeight: 600, textDecoration: "none" }}>
            Get started →
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: "96px 5vw 72px", display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "4rem", alignItems: "center", position: "relative", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ position: "absolute", right: "-2%", top: "-5%", width: 420, height: 420, background: "radial-gradient(circle, #C8EAE5 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none", zIndex: 0 }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#C8EAE5", color: "#1A5248", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, padding: "0.4rem 1rem", borderRadius: 100, marginBottom: "1.75rem", border: "1.5px solid #5AADA0" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2A7B6F", display: "inline-block" }} />
            AI-Powered · Free to use
          </div>

          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.6rem,4.5vw,4rem)", lineHeight: 1.1, letterSpacing: "-0.02em", color: "#1C1409", marginBottom: "1.25rem" }}>
            Understand your health,{" "}
            <em style={{ color: "#2A7B6F" }}>finally.</em>
          </h1>

          <p style={{ fontSize: "1.05rem", color: "#3D2E1A", maxWidth: 460, marginBottom: "2.25rem", lineHeight: 1.75 }}>
            Paste your lab results, get a plain-English explanation. Calculate your biological age. Chat with an AI that knows your health history.
          </p>

          <div style={{ display: "flex", gap: "0.875rem", flexWrap: "wrap" as const, marginBottom: "2rem" }}>
            <Link href="/auth/signup" style={{ background: "#1A5248", color: "#FEFBF3", padding: "0.9rem 2rem", borderRadius: 100, fontSize: "0.95rem", fontWeight: 600, textDecoration: "none" }}>
              Start for free →
            </Link>
            <a href="#features" style={{ background: "transparent", color: "#1A5248", padding: "0.9rem 2rem", borderRadius: 100, border: "2px solid #1A5248", fontSize: "0.95rem", fontWeight: 500, textDecoration: "none" }}>
              See what it does
            </a>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "0.5rem" }}>
            {[["🔬","Analyse Labs"],["💊","Refill Drafts"],["📈","Longevity Score"],["🥗","Nutrition Q&A"],["🩺","Symptom Chat"]].map(([icon, label]) => (
              <Link key={label} href="/auth/signup" style={{ background: "white", border: "1.5px solid rgba(60,40,10,0.14)", borderRadius: 100, padding: "0.4rem 0.9rem", fontSize: "0.8rem", color: "#3D2E1A", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.3rem", fontWeight: 500 }}>
                <span>{icon}</span>{label}
              </Link>
            ))}
          </div>
        </div>

        {/* Chat mockup */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "center" }}>
          <div style={{ background: "white", borderRadius: 24, border: "1.5px solid rgba(60,40,10,0.1)", padding: "1.5rem", width: 340, boxShadow: "0 20px 60px rgba(26,82,72,0.14)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", paddingBottom: "1rem", marginBottom: "1rem", borderBottom: "1px solid rgba(60,40,10,0.08)" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#C8EAE5", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display',serif", fontSize: "1.1rem", color: "#1A5248", fontStyle: "italic" }}>S</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.92rem", color: "#1C1409" }}>Snortle AI</div>
                <div style={{ fontSize: "0.7rem", color: "#2A7B6F", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#2A7B6F", display: "inline-block" }} />
                  Online · Fast response
                </div>
              </div>
            </div>
            <div style={{ marginBottom: "0.75rem" }}>
              <div style={{ background: "#1A5248", borderRadius: "14px 4px 14px 14px", padding: "0.65rem 0.875rem", fontSize: "0.83rem", color: "#FEFBF3", maxWidth: "80%", marginLeft: "auto", lineHeight: 1.5 }}>What does my LDL of 142 mean?</div>
            </div>
            <div style={{ background: "#F2EBD9", borderRadius: "4px 14px 14px 14px", padding: "0.75rem 0.875rem", fontSize: "0.83rem", color: "#1C1409", lineHeight: 1.6, maxWidth: "90%", marginBottom: "0.75rem" }}>
              An LDL of 142 mg/dL is above the ideal target of &lt;100 mg/dL. For most adults this is considered borderline-high. Diet changes and exercise can lower it — worth discussing with your doctor.
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

      {/* FEATURES */}
      <div id="features" style={{ padding: "0 5vw 80px", maxWidth: 1280, margin: "0 auto" }}>

        {/* Feature cards row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.25rem", marginBottom: "1.5rem" }}>
          {[
            { icon: "🔬", title: "Lab Analysis", desc: "Paste or upload a PDF of your lab report. Snortle explains every value in plain language, flags what's out of range, and tells you what to ask your doctor." },
            { icon: "📈", title: "Longevity Score", desc: "Enter your biomarkers — blood pressure, cholesterol, HbA1c, sleep, exercise. Get an estimated biological age and a personalised action plan." },
            { icon: "💬", title: "AI Health Chat", desc: "Ask anything about your health. Snortle knows your labs, your medications, and your history. It gives context-aware answers, not generic ones." },
          ].map(f => (
            <div key={f.title} style={{ background: "white", borderRadius: 20, border: "1.5px solid rgba(60,40,10,0.1)", padding: "1.75rem", boxShadow: "0 2px 16px rgba(60,40,10,0.06)" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.875rem" }}>{f.icon}</div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.2rem", color: "#1C1409", marginBottom: "0.625rem" }}>{f.title}</div>
              <p style={{ fontSize: "0.85rem", color: "#5C4E38", lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "1.25rem" }}>
          {[
            { icon: "💊", title: "Prescription Refill Drafts", desc: "Describe what you need and Snortle drafts a refill request note you can take to your doctor or pharmacy. You review it before anything is sent." },
            { icon: "🎙", title: "Voice Chat", desc: "Switch to Voice mode and have a live back-and-forth conversation with Snortle — hands-free. It listens, responds, and listens again automatically." },
          ].map(f => (
            <div key={f.title} style={{ background: "white", borderRadius: 20, border: "1.5px solid rgba(60,40,10,0.1)", padding: "1.75rem", boxShadow: "0 2px 16px rgba(60,40,10,0.06)" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.875rem" }}>{f.icon}</div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.2rem", color: "#1C1409", marginBottom: "0.625rem" }}>{f.title}</div>
              <p style={{ fontSize: "0.85rem", color: "#5C4E38", lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* STATS — honest ones */}
      <section style={{ padding: "60px 5vw", maxWidth: 1280, margin: "0 auto", textAlign: "center" as const }}>
        <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#2A7B6F", marginBottom: "0.75rem" }}>Built to help you understand</div>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(1.8rem,3vw,2.4rem)", color: "#1C1409", marginBottom: "3rem" }}>What makes Snortle different</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.25rem", maxWidth: 820, margin: "0 auto" }}>
          {[
            ["PDF", "Upload any lab report as a PDF and Snortle extracts and explains it"],
            ["Voice", "Hands-free voice mode — speak your question, hear the answer"],
            ["Context", "Chat remembers your labs, meds, and longevity score across pages"],
          ].map(([n,l]) => (
            <div key={n} style={{ background: "white", borderRadius: 20, border: "1.5px solid rgba(60,40,10,0.1)", padding: "2rem 1.25rem", boxShadow: "0 2px 16px rgba(60,40,10,0.07)" }}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "2rem", color: "#1A5248", letterSpacing: "-0.02em", lineHeight: 1, marginBottom: "0.5rem" }}>{n}</div>
              <div style={{ fontSize: "0.83rem", color: "#5C4E38", lineHeight: 1.55 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* DISCLAIMER BANNER */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 5vw 60px" }}>
        <div style={{ background: "#F2EBD9", borderRadius: 16, padding: "1.25rem 1.75rem", border: "1.5px solid rgba(60,40,10,0.12)", display: "flex", gap: "1rem", alignItems: "flex-start" }}>
          <span style={{ fontSize: "1.25rem", flexShrink: 0 }}>ℹ️</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: "0.88rem", color: "#1C1409", marginBottom: "0.25rem" }}>Snortle is an AI tool, not a medical service</div>
            <p style={{ fontSize: "0.82rem", color: "#5C4E38", lineHeight: 1.6 }}>
              Snortle provides AI-generated health information to help you understand your data and prepare for conversations with your doctor. It is not a licensed medical provider, does not employ clinicians, and cannot diagnose, prescribe, or replace professional medical advice. Always consult a qualified healthcare professional for medical decisions.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <section id="faq" style={{ padding: "40px 5vw 80px", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ textAlign: "center" as const, marginBottom: "3rem" }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#2A7B6F", marginBottom: "0.5rem" }}>FAQs</div>
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

      {/* CTA */}
      <div style={{ padding: "0 5vw 80px", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ background: "#1A5248", borderRadius: 28, padding: "72px 5vw", textAlign: "center" as const }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(2rem,4vw,3rem)", color: "#FEFBF3", letterSpacing: "-0.02em", marginBottom: "0.875rem" }}>
            Start understanding your health today
          </h2>
          <p style={{ fontSize: "1rem", color: "rgba(254,251,243,0.65)", maxWidth: 440, margin: "0 auto 2rem" }}>
            Free to use. No clinic visits. No waiting rooms.
          </p>
          <Link href="/auth/signup" style={{ background: "#FEFBF3", color: "#1A5248", padding: "0.95rem 2.5rem", borderRadius: 100, fontSize: "1rem", fontWeight: 700, textDecoration: "none", display: "inline-block" }}>
            Create a free account →
          </Link>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ padding: "3rem 5vw 1.5rem", borderTop: "1.5px solid rgba(60,40,10,0.1)", display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", gap: "3rem", maxWidth: 1280, margin: "0 auto" }}>
        <div>
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.4rem", color: "#1A5248", fontStyle: "italic", display: "block", marginBottom: "0.625rem" }}>Snortle</span>
          <p style={{ fontSize: "0.8rem", color: "#7A6A52", lineHeight: 1.65, maxWidth: 260 }}>
            An AI health assistant to help you understand your body. Not a medical provider.
          </p>
        </div>
        <div>
          <h4 style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#1C1409", marginBottom: "0.875rem" }}>Product</h4>
          {["Lab Analysis","Longevity Score","AI Chat","Voice Mode"].map(l => <a key={l} href="#features" style={{ display: "block", fontSize: "0.83rem", color: "#7A6A52", textDecoration: "none", marginBottom: "0.5rem" }}>{l}</a>)}
        </div>
        <div>
          <h4 style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#1C1409", marginBottom: "0.875rem" }}>Legal</h4>
          {["Privacy Policy","Terms of Service","AI Disclaimer"].map(l => <a key={l} href="#" style={{ display: "block", fontSize: "0.83rem", color: "#7A6A52", textDecoration: "none", marginBottom: "0.5rem" }}>{l}</a>)}
        </div>
      </footer>
      <div style={{ padding: "1.25rem 5vw", borderTop: "1px solid rgba(60,40,10,0.08)", display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#B5A48A", flexWrap: "wrap" as const, gap: "0.5rem", maxWidth: 1280, margin: "0 auto" }}>
        <span>© 2026 Snortle. All rights reserved.</span>
        <span>AI-generated information only — not medical advice. Consult a qualified professional.</span>
      </div>
    </div>
  );
}