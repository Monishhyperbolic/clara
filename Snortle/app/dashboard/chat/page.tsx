"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { extractPdfText } from "@/lib/extractPdf";
import MarkdownMessage from "@/components/MarkdownMessage";

interface Message { role: "user" | "assistant"; content: string; }
type Mode = "chat" | "voice";

const QUICK = [
  "What does my LDL of 142 mean?",
  "Am I at risk for pre-diabetes?",
  "Draft a refill for Atorvastatin 20mg",
  "How can I lower my cholesterol?",
  "Explain my HbA1c of 5.4%",
];

/* Make TTS sound human: add commas/pauses, slow it down */
function humanizeText(raw: string): string {
  return raw
    .replace(/\*\*/g, "").replace(/\*/g, "").replace(/#+\s/g, "").replace(/`/g, "")
    .replace(/\. /g, ".  ").replace(/! /g, "!  ").replace(/\? /g, "?  ")
    .replace(/: /g, ",  ").replace(/; /g, ",  ")
    .slice(0, 600);
}

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    SpeechRecognition: new () => any;
    webkitSpeechRecognition: new () => any;
  }
}

export default function ChatPage() {
  const [mode, setMode] = useState<Mode>("chat");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm Snortle, your AI health assistant. I can answer questions about your health, analyse lab results, and help with prescriptions. What would you like to know?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [userCtx, setUserCtx] = useState<Record<string, unknown>>({});
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceState, setVoiceState] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const recRef = useRef<any>(null);
  const voiceActiveRef = useRef(false);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      if (!data.user) return;
      const m = data.user.user_metadata || {};
      setUserCtx({
        name: m.full_name || data.user.email?.split("@")[0],
        age: m.age || "", sex: m.sex || "",
        activeMeds: ["Metformin 500mg", "Atorvastatin 20mg", "Vitamin D3 5000IU"],
        allergies: "Penicillin",
        recentLabs: { LDL: "142 mg/dL", HbA1c: "5.4%", "Vitamin D": "42 ng/mL", TSH: "2.1 mIU/L" },
        conditions: [],
      });
    });
  }, []);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput("");
    const history: Message[] = [...messages, { role: "user", content }];
    setMessages(history);
    setLoading(true);
    if (mode === "voice") setVoiceState("thinking");
    setMessages(prev => [...prev, { role: "assistant", content: "" }]);
    try {
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.map(m => ({ role: m.role, content: m.content })), userContext: userCtx }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Server error");
      const reader = res.body!.getReader();
      const dec = new TextDecoder();
      let full = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += dec.decode(value, { stream: true });
        setMessages(prev => { const u = [...prev]; u[u.length - 1] = { role: "assistant", content: full }; return u; });
      }
      if (mode === "voice" && full) speakHuman(humanizeText(full));
    } catch (e) {
      const msg = `I'm having trouble connecting. Please check your internet and try again.`;
      setMessages(prev => { const u = [...prev]; u[u.length - 1] = { role: "assistant", content: msg }; return u; });
      if (mode === "voice") { setVoiceState("idle"); if (voiceActiveRef.current) startListening(); }
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function speakHuman(text: string) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);

    // Human-like settings
    utt.rate = 0.88;
    utt.pitch = 1.02;
    utt.volume = 1;

    // Pick best available voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      v.name.includes("Samantha") ||
      v.name.includes("Karen") ||
      v.name.includes("Moira") ||
      v.name.includes("Google UK English Female") ||
      v.name.includes("Microsoft Aria") ||
      v.name.includes("Microsoft Jenny") ||
      (v.lang === "en-US" && v.name.toLowerCase().includes("female"))
    ) || voices.find(v => v.lang.startsWith("en"));
    if (preferred) utt.voice = preferred;

    utt.onstart = () => setVoiceState("speaking");
    utt.onend = () => {
      setVoiceState("idle");
      if (voiceActiveRef.current) setTimeout(() => startListening(), 400);
    };
    utt.onerror = () => {
      setVoiceState("idle");
      if (voiceActiveRef.current) startListening();
    };
    window.speechSynthesis.speak(utt);
  }

  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    try {
      const rec = new SR();
      rec.continuous = false; rec.interimResults = true; rec.lang = "en-US";
      rec.onstart = () => setVoiceState("listening");
      rec.onresult = (e: any) => {
        const t = Array.from(e.results as any[]).map((r: any) => r[0].transcript).join("");
        setVoiceTranscript(t);
        if (e.results[e.results.length - 1].isFinal) {
          setVoiceTranscript(""); rec.stop();
          if (t.trim()) send(t.trim());
        }
      };
      rec.onerror = () => { setVoiceState("idle"); };
      rec.onend = () => { if (voiceState === "listening") setVoiceState("idle"); };
      recRef.current = rec;
      rec.start();
    } catch { setVoiceState("idle"); }
  }, [voiceState]);

  function toggleCall() {
    if (voiceActive) {
      voiceActiveRef.current = false;
      recRef.current?.abort();
      window.speechSynthesis?.cancel();
      setVoiceActive(false); setVoiceState("idle"); setVoiceTranscript("");
    } else {
      voiceActiveRef.current = true;
      setVoiceActive(true);
      // Load voices first (needed on some browsers)
      window.speechSynthesis.getVoices();
      setTimeout(() => speakHuman("Hello, I'm Snortle. I'm ready when you are. Just speak your question."), 300);
    }
  }

  async function handlePdf(file: File) {
    setPdfLoading(true);
    try {
      const text = await extractPdfText(file);
      if (!text.trim()) throw new Error("No text found");
      await send(`I uploaded my health document: "${file.name}". Here is the content:\n\n${text.slice(0, 4000)}\n\nPlease analyse this and tell me the key health findings.`);
    } catch (err: any) {
      await send(`I tried uploading "${file.name}" but could not read it${err?.message ? `: ${err.message}` : ""}. Please paste the text directly.`);
    } finally { setPdfLoading(false); }
  }

  const stateLabel = { idle: voiceActive ? "Ready — tap Speak" : "Start a consultation", listening: "Listening...", thinking: "Thinking...", speaking: "Speaking..." };
  const barCount = 16;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--parchment)" }}>

      {/* Header */}
      <div style={{ background: "var(--parchment)", borderBottom: "1px solid var(--border)", padding: "0.875rem 1.75rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--teal-light)", border: "1.5px solid var(--teal-mid)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display',serif", fontSize: "1.1rem", color: "var(--teal-deep)", fontStyle: "italic" }}>S</div>
          <div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 500, fontSize: "1rem", color: "var(--ink)" }}>Snortle <span style={{ fontStyle: "italic", fontWeight: 400, color: "var(--ink-muted)" }}>AI Doctor</span></div>
            <div style={{ fontSize: "0.7rem", color: loading ? "var(--gold)" : "var(--teal)", display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
              {loading ? "Thinking..." : "Online · Fast model"}
            </div>
          </div>
        </div>
        <div style={{ background: "var(--parchment-2)", borderRadius: 100, padding: "0.22rem", display: "flex", border: "1.5px solid var(--border)" }}>
          {(["chat", "voice"] as Mode[]).map(m => (
            <button key={m} onClick={() => { setMode(m); if (m !== "voice" && voiceActive) toggleCall(); }} style={{ padding: "0.38rem 1rem", borderRadius: 100, border: "none", background: mode === m ? "var(--teal-deep)" : "transparent", color: mode === m ? "#F9F4EA" : "var(--ink-muted)", fontSize: "0.78rem", fontWeight: mode === m ? 500 : 400, cursor: "pointer", transition: "all 0.15s" }}>
              {m === "chat" ? "✦ Chat" : "◎ Voice"}
            </button>
          ))}
        </div>
      </div>

      {/* Voice call screen — full immersive */}
      {mode === "voice" && (
        <div style={{ flex: 1, background: "#0F2820", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "2.5rem 2rem", overflow: "hidden", position: "relative" }}>
          {/* Background rings */}
          {voiceActive && (
            <>
              <div style={{ position: "absolute", width: 320, height: 320, borderRadius: "50%", border: "1px solid rgba(90,173,160,0.12)", animation: "ring-pulse 2s ease-in-out infinite" }} />
              <div style={{ position: "absolute", width: 240, height: 240, borderRadius: "50%", border: "1px solid rgba(90,173,160,0.18)", animation: "ring-pulse 2s 0.4s ease-in-out infinite" }} />
              <div style={{ position: "absolute", width: 160, height: 160, borderRadius: "50%", border: "1px solid rgba(90,173,160,0.25)", animation: "ring-pulse 2s 0.8s ease-in-out infinite" }} />
            </>
          )}

          {/* Call timer / status chip */}
          <div style={{ zIndex: 1, background: "rgba(255,255,255,0.06)", borderRadius: 100, padding: "0.3rem 1rem", fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", fontWeight: 500, letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            {voiceActive && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34D399", display: "inline-block", animation: "blink 1s ease-in-out infinite" }} />}
            {voiceActive ? "ON CALL · SNORTLE AI" : "VOICE CONSULTATION"}
          </div>

          {/* Avatar + waveform */}
          <div style={{ zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}>
            {/* Big avatar */}
            <div style={{ position: "relative" }}>
              <div style={{ width: 110, height: 110, borderRadius: "50%", background: voiceState === "speaking" ? "#2A7B6F" : voiceState === "listening" ? "#1A5248" : "#1E3A30", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display',serif", fontSize: "2.5rem", color: "#C8EAE5", fontStyle: "italic", border: `3px solid ${voiceState === "speaking" ? "#5AADA0" : voiceState === "listening" ? "#34D399" : "rgba(255,255,255,0.1)"}`, transition: "all 0.3s", boxShadow: voiceState === "speaking" ? "0 0 40px rgba(42,123,111,0.4)" : "none" }}>
                S
              </div>
              {/* Speaking indicator ring */}
              {(voiceState === "speaking" || voiceState === "listening") && (
                <div style={{ position: "absolute", inset: -6, borderRadius: "50%", border: "2px solid", borderColor: voiceState === "speaking" ? "#5AADA0" : "#34D399", animation: "ring-spin 1.5s linear infinite", opacity: 0.6 }} />
              )}
            </div>

            {/* Waveform bars */}
            <div style={{ display: "flex", alignItems: "center", gap: "4px", height: 48 }}>
              {[...Array(barCount)].map((_, i) => {
                const active = voiceState === "listening" || voiceState === "speaking";
                const h = active ? 8 + Math.abs(Math.sin(i * 0.85 + i)) * 30 : 4;
                const color = voiceState === "listening" ? "#34D399" : voiceState === "speaking" ? "#5AADA0" : "rgba(255,255,255,0.15)";
                return <div key={i} style={{ width: 3, borderRadius: 3, background: color, height: `${h}px`, animation: active ? `pulse-bar ${0.3 + (i % 4) * 0.1}s ease-in-out infinite alternate` : "none", transition: "height 0.15s, background 0.3s" }} />;
              })}
            </div>

            {/* Status text */}
            <div style={{ textAlign: "center" as const }}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontSize: "1.2rem", color: "#F9F4EA", marginBottom: "0.3rem" }}>
                {voiceState === "speaking" ? "Snortle is speaking" : voiceState === "listening" ? "Listening..." : voiceState === "thinking" ? "Thinking..." : voiceActive ? "Tap to speak" : "Start a consultation"}
              </div>
              {voiceTranscript && (
                <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.45)", fontStyle: "italic", maxWidth: 280, textAlign: "center" as const }}>
                  &ldquo;{voiceTranscript}&rdquo;
                </div>
              )}
              {!voiceActive && (
                <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.35)", marginTop: "0.4rem" }}>Snortle will speak and listen in turn</p>
              )}
            </div>
          </div>

          {/* Bottom controls */}
          <div style={{ zIndex: 1, display: "flex", gap: "1.5rem", alignItems: "center" }}>
            {/* Upload PDF */}
            <label style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexDirection: "column" as const, fontSize: "1.1rem" }} title="Upload PDF">
              {pdfLoading ? "⏳" : "📎"}
              <input type="file" accept=".pdf" style={{ display: "none" }} onChange={async e => { const f = e.target.files?.[0]; if (f) { setMode("chat"); await handlePdf(f); } }} />
            </label>

            {/* Speak button — big */}
            {voiceActive && voiceState === "idle" && (
              <button onClick={() => startListening()} style={{ width: 72, height: 72, borderRadius: "50%", background: "#22C55E", color: "white", border: "none", cursor: "pointer", fontSize: "1.6rem", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 24px rgba(34,197,94,0.4)" }}>
                🎙
              </button>
            )}
            {(!voiceActive || voiceState !== "idle") && (
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(255,255,255,0.04)", border: "1.5px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", color: "rgba(255,255,255,0.2)" }}>
                🎙
              </div>
            )}

            {/* End / Start call */}
            <button onClick={toggleCall} style={{ width: 52, height: 52, borderRadius: "50%", background: voiceActive ? "#DC2626" : "#2A7B6F", color: "white", border: "none", cursor: "pointer", fontSize: "1.2rem", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: voiceActive ? "0 0 20px rgba(220,38,38,0.4)" : "none" }}>
              {voiceActive ? "✕" : "✆"}
            </button>
          </div>

          <style>{`
            @keyframes ring-pulse { 0%,100% { transform: scale(1); opacity:0.6; } 50% { transform: scale(1.08); opacity:0.3; } }
            @keyframes ring-spin  { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
          `}</style>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem 1.75rem" }}>
        {messages.length === 1 && mode === "chat" && (
          <div style={{ marginBottom: "2rem", textAlign: "center" }}>
            <p style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", color: "var(--ink-muted)", fontSize: "0.95rem", marginBottom: "1rem" }}>How can I help you today?</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center" }}>
              {QUICK.map(s => (
                <button key={s} onClick={() => send(s)} style={{ background: "var(--parchment-2)", border: "1.5px solid var(--border)", borderRadius: 100, padding: "0.42rem 0.95rem", fontSize: "0.78rem", color: "var(--ink-mid)", cursor: "pointer", fontFamily: "'Inter',sans-serif" }}>{s}</button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: "1.1rem", display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
            {msg.role === "assistant" && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.3rem" }}>
                <div style={{ width: 20, height: 20, borderRadius: 6, background: "var(--teal-light)", border: "1px solid var(--teal-mid)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display',serif", fontSize: "0.65rem", color: "var(--teal-deep)", fontStyle: "italic" }}>S</div>
                <span style={{ fontSize: "0.68rem", color: "var(--ink-ghost)", fontWeight: 500, letterSpacing: "0.04em" }}>SNORTLE</span>
              </div>
            )}
            <div style={{
              maxWidth: "70%", padding: "0.8rem 1rem",
              borderRadius: msg.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
              background: msg.role === "user" ? "var(--teal-deep)" : "white",
              color: msg.role === "user" ? "#F9F4EA" : "var(--ink)",
              border: `1.5px solid ${msg.role === "user" ? "transparent" : "var(--border)"}`,
              boxShadow: "var(--shadow-sm)",
            }}>
              {msg.role === "user"
                ? <span style={{ fontSize: "0.88rem", lineHeight: 1.65 }}>{msg.content}</span>
                : msg.content ? <MarkdownMessage content={msg.content} /> : <span style={{ opacity: 0.3, letterSpacing: "0.2em" }}>• • •</span>
              }
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {mode === "chat" && (
        <div style={{ padding: "0.75rem 1.75rem 1.1rem", background: "var(--parchment-2)", borderTop: "1.5px solid var(--border)", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", background: "white", borderRadius: 14, border: "1.5px solid var(--border)", padding: "0.5rem 0.5rem 0.5rem 0.875rem", boxShadow: "var(--shadow-sm)" }}>
            <label title="Upload PDF" style={{ width: 30, height: 30, borderRadius: 8, background: "var(--gold-light)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, fontSize: "0.8rem", color: "var(--gold)" }}>
              {pdfLoading ? "⏳" : "⬡"}
              <input type="file" accept=".pdf" style={{ display: "none" }} onChange={async e => { const f = e.target.files?.[0]; if (f) await handlePdf(f); if (e.target) e.target.value = ""; }} />
            </label>
            <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="Ask about your health, labs, medications..." rows={1}
              style={{ flex: 1, border: "none", background: "transparent", resize: "none", fontFamily: "'Inter',sans-serif", fontSize: "0.88rem", color: "var(--ink)", outline: "none", lineHeight: 1.55, maxHeight: 100 }} />
            <button onClick={() => send()} disabled={!input.trim() || loading} style={{ width: 30, height: 30, borderRadius: 8, background: input.trim() && !loading ? "var(--teal-deep)" : "var(--parchment-3)", color: input.trim() && !loading ? "#F9F4EA" : "var(--ink-ghost)", border: "none", cursor: "pointer", fontSize: "0.9rem", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600 }}>↑</button>
          </div>
          <p style={{ fontSize: "0.67rem", color: "var(--ink-ghost)", textAlign: "center", marginTop: "0.35rem", letterSpacing: "0.02em" }}>
            Health topics only · Not a substitute for professional care · PDF upload supported
          </p>
        </div>
      )}

      <style>{`
        @keyframes pulse-bar {
          from { transform: scaleY(0.5); opacity: 0.7; }
          to { transform: scaleY(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
