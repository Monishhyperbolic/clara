"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function login() {
    if (!email || !password) return;
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  const inp: React.CSSProperties = {
    width: "100%", border: "1.5px solid var(--border)", borderRadius: 10,
    padding: "0.7rem 0.875rem", fontFamily: "'Inter',sans-serif",
    fontSize: "0.92rem", color: "var(--text)", background: "var(--parchment)",
    outline: "none", marginBottom: "0.875rem",
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--parchment)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "2.2rem", color: "var(--teal-deep)", letterSpacing: "-0.02em" }}>Snortle</div>
          <div style={{ fontSize: "0.85rem", color: "var(--ink-muted)", marginTop: "0.25rem" }}>Your AI health platform</div>
        </div>

        <div style={{ background: "white", borderRadius: 20, border: "1px solid var(--border)", padding: "2rem" }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.5rem", color: "var(--teal-deep)", marginBottom: "0.25rem" }}>Welcome back</h2>
          <p style={{ fontSize: "0.85rem", color: "var(--ink-muted)", marginBottom: "1.5rem" }}>Sign in to your account</p>

          <label style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--ink-mid)", display: "block", marginBottom: "0.3rem" }}>Email</label>
          <input style={inp} type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} />

          <label style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--ink-mid)", display: "block", marginBottom: "0.3rem" }}>Password</label>
          <input style={{ ...inp, marginBottom: "1.25rem" }} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} />

          {error && (
            <div style={{ background: "#FCEBEB", borderRadius: 10, padding: "0.75rem 1rem", marginBottom: "1rem", fontSize: "0.85rem", color: "#A32D2D" }}>
              {error}
            </div>
          )}

          <button onClick={login} disabled={!email || !password || loading} style={{
            width: "100%", background: email && password ? "var(--teal-deep)" : "var(--teal-light)",
            color: email && password ? "var(--parchment)" : "var(--ink-muted)",
            border: "none", borderRadius: 12, padding: "0.875rem",
            fontSize: "0.95rem", fontWeight: 500, cursor: email && password ? "pointer" : "default",
          }}>
            {loading ? "Signing in..." : "Sign in →"}
          </button>
        </div>

        <p style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.85rem", color: "var(--ink-muted)" }}>
          Don't have an account?{" "}
          <Link href="/auth/signup" style={{ color: "var(--teal-deep)", fontWeight: 500, textDecoration: "none" }}>Create one</Link>
        </p>
      </div>
    </div>
  );
}
