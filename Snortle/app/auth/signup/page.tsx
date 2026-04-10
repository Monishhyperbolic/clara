"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function signup() {
    if (!name.trim() || !email || !password) return;
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name.trim() } },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Try to sign in immediately (if email confirmation is off)
      const { error: loginErr } = await supabase.auth.signInWithPassword({ email, password });
      if (!loginErr) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setSuccess(true);
        setLoading(false);
      }
    }
  }

  const inp: React.CSSProperties = {
    width: "100%", border: "1.5px solid var(--border)", borderRadius: 10,
    padding: "0.7rem 0.875rem", fontFamily: "'Inter',sans-serif",
    fontSize: "0.92rem", color: "var(--text)", background: "var(--parchment)",
    outline: "none", marginBottom: "0.875rem",
  };

  if (success) return (
    <div style={{ minHeight: "100vh", background: "var(--parchment)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ width: "100%", maxWidth: 400, textAlign: "center" }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "2.2rem", color: "var(--teal-deep)", marginBottom: "1.5rem" }}>Snortle</div>
        <div style={{ background: "white", borderRadius: 20, border: "1px solid var(--border)", padding: "2rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>📬</div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.4rem", color: "var(--teal-deep)", marginBottom: "0.5rem" }}>Check your email</h2>
          <p style={{ fontSize: "0.88rem", color: "var(--ink-muted)", lineHeight: 1.6 }}>
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account, then sign in.
          </p>
          <Link href="/auth/login" style={{ display: "block", marginTop: "1.5rem", background: "var(--teal-deep)", color: "var(--parchment)", padding: "0.75rem", borderRadius: 10, textDecoration: "none", fontSize: "0.9rem", fontWeight: 500 }}>
            Go to sign in
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--parchment)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "2.2rem", color: "var(--teal-deep)", letterSpacing: "-0.02em" }}>Snortle</div>
          <div style={{ fontSize: "0.85rem", color: "var(--ink-muted)", marginTop: "0.25rem" }}>Your AI health platform</div>
        </div>

        <div style={{ background: "white", borderRadius: 20, border: "1px solid var(--border)", padding: "2rem" }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.5rem", color: "var(--teal-deep)", marginBottom: "0.25rem" }}>Create your account</h2>
          <p style={{ fontSize: "0.85rem", color: "var(--ink-muted)", marginBottom: "1.5rem" }}>Free to start. No credit card needed.</p>

          <label style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--ink-mid)", display: "block", marginBottom: "0.3rem" }}>Your name</label>
          <input style={inp} type="text" placeholder="First Last" value={name} onChange={e => setName(e.target.value)} />

          <label style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--ink-mid)", display: "block", marginBottom: "0.3rem" }}>Email</label>
          <input style={inp} type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} />

          <label style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--ink-mid)", display: "block", marginBottom: "0.3rem" }}>Password</label>
          <input style={{ ...inp, marginBottom: "1.25rem" }} type="password" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && signup()} />

          {error && (
            <div style={{ background: "#FCEBEB", borderRadius: 10, padding: "0.75rem 1rem", marginBottom: "1rem", fontSize: "0.85rem", color: "#A32D2D" }}>
              {error}
            </div>
          )}

          <button onClick={signup} disabled={!name || !email || !password || loading} style={{
            width: "100%", background: name && email && password ? "var(--teal-deep)" : "var(--teal-light)",
            color: name && email && password ? "var(--parchment)" : "var(--ink-muted)",
            border: "none", borderRadius: 12, padding: "0.875rem",
            fontSize: "0.95rem", fontWeight: 500, cursor: name && email && password ? "pointer" : "default",
          }}>
            {loading ? "Creating account..." : "Create account →"}
          </button>

          <p style={{ fontSize: "0.75rem", color: "var(--ink-muted)", textAlign: "center", marginTop: "1rem", lineHeight: 1.5 }}>
            By signing up you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>

        <p style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.85rem", color: "var(--ink-muted)" }}>
          Already have an account?{" "}
          <Link href="/auth/login" style={{ color: "var(--teal-deep)", fontWeight: 500, textDecoration: "none" }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
