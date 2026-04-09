"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { extractPdfText } from "@/lib/extractPdf";
import MarkdownMessage from "@/components/MarkdownMessage";

interface Message { role: "user" | "assistant"; content: string; }
type Mode = "chat" | "voice";

const SUGGESTIONS = [
  "What does my LDL of 142 mean?",
  "Am I at risk for pre-diabetes?",
  "Draft a refill for Atorvastatin 20mg",
  "How can I lower my cholesterol naturally?",
  "Explain my HbA1c of 5.4%",
];

export default function ChatPage() {
  const [mode, setMode] = useState<Mode>("chat");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm Snortle, your AI health assistant. I can answer health questions, analyse lab results, and draft prescription requests. What's on your mind?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userCtx, setUserCtx] = useState<Record<string, unknown>>({});
  const [pdfLoading, setPdfLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceListening, setVoiceListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceSpeaking, setVoiceSpeaking] = useState(false);
  const recRef = useRef<any>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      if (!data.user) return;
      const m = data.user.user_metadata || {};
      setUserCtx({ name: m.full_name || data.user.email?.split("@")[0], age: m.age || "", sex: m.sex || "", activeMeds: ["Metformin 500mg", "Atorvastatin 20mg", "Vitamin D3 5000IU"], allergies: "Penicillin", recentLabs: { "LDL": "142 mg/dL", "HbA1c": "5.4%", "Vitamin D": "42 ng/mL", "TSH": "2.1 mIU/L" }, conditions: [] });
    });
  }, []);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput("");
    const history = [...messages, { role: "user" as const, content }];
    setMessages(history);
    setLoading(true);
    setMessages(prev => [...prev, { role: "assistant", content: "" }]);
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: history.map(m => ({ role: m.role, content: m.content })), userContext: userCtx }) });
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
      if (mode === "voice" && full) speak(full.replace(/[*#`_]/g, "").slice(0, 500));
    } catch (e) {
      setMessages(prev => { const u = [...prev]; u[u.length - 1] = { role: "assistant", content: `Error: ${e instanceof Error ? e.message : "Something went wrong"}` }; return u; });
    } finally { setLoading(false); inputRef.current?.focus(); }
  }

  async function handlePdf(file: File) {
    setPdfLoading(true);
    try {
      const text = await extractPdfText(file);
      await send(`I've uploaded "${file.name}". Here is the extracted content:\n\n${text.slice(0, 4000)}\n\nPlease analyse this and summarise the key health findings.`);
    } catch { await send(`Uploaded "${file.name}" — could not extract text. Please paste the content directly.`); }
    finally { setPdfLoading(false); }
  }

  function speak(text: string) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 1.05; utt.pitch = 1;
    const v = window.speechSynthesis.getVoices().find(v => v.name.includes("Samantha") || v.name.includes("Google UK"));
    if (v) utt.voice = v;
    utt.onstart = () => setVoiceSpeaking(true);
    utt.onend = () => { setVoiceSpeaking(false); if (voiceActive) startListening(); };
    window.speechSynthesis.speak(utt);
  }

  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rec = new SR() as any;
    rec.continuous = false; rec.interimResults = true; rec.lang = "en-US";
    rec.onstart = () => setVoiceListening(true);
    rec.onresult = (e: any) => {
      const t = Array.from(e.results as any[]).map((r: any) => r[0].transcript).join("");
      setVoiceTranscript(t);
      if (e.results[e.results.length - 1].isFinal) { setVoiceTranscript(""); setVoiceListening(false); send(t); }
    };
    rec.onerror = () => setVoiceListening(false);
    rec.onend = () => setVoiceListening(false);
    recRef.current = rec;
    rec.start();
  }, [voiceActive]);

  function toggleCall() {
    if (voiceActive) {
      recRef.current?.abort(); window.speechSynthesis?.cancel();
      setVoiceActive(false); setVoiceListening(false); setVoiceSpeaking(false);
    } else {
      setVoiceActive(true);
      setTimeout(() => speak("Hi, I'm Snortle. I'm ready. What health question can I help you with today?"), 300);
    }
  }

  const bars = 14;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--cream)" }}>

      {/* Header */}
      <div style={{ background: "white", borderBottom: "1px solid var(--border)", padding: "0.875rem 1.75rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
          <div style={{ width: 40, height: 40, borderRadius: 14, background: "var(--sage-light)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces',serif", fontSize: "1.15rem", color: "var(--forest)" }}>S</div>
          <div>
            <div style={{ fontFamily: "'Fraunces',serif", fontWeight: 500, fontSize: "1rem", color: "var(--text)" }}>Snortle AI Doctor</div>
            <div style={{ fontSize: "0.7rem", color: loading ? "var(--amber)" : "var(--sage)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
              {loading ? "Thinking..." : "Online · Fast model"}
            </div>
          </div>
        </div>
        <div style={{ background: "var(--cream-warm)", borderRadius: 100, padding: "0.2rem", display: "flex", border: "1px solid var(--border)" }}>
          {(["chat", "voice"] as Mode[]).map(m => (
            <button key={m} onClick={() => { setMode(m); if (m !== "voice" && voiceActive) toggleCall(); }} style={{ padding: "0.38rem 0.9rem", borderRadius: 100, border: "none", background: mode === m ? "white" : "transparent", color: mode === m ? "var(--forest)" : "var(--text-muted)", fontSize: "0.8rem", fontWeight: mode === m ? 500 : 400, cursor: "pointer", boxShadow: mode === m ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}>
              {m === "chat" ? "💬 Chat" : "🎙 Voice"}
            </button>
          ))}
        </div>
      </div>

      {/* Voice panel */}
      {mode === "voice" && (
        <div style={{ background: "var(--forest)", padding: "1.75rem", flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: "1.1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "3px", height: 44 }}>
            {[...Array(bars)].map((_, i) => {
              const animated = voiceListening || voiceSpeaking;
              const h = animated ? `${10 + Math.abs(Math.sin(i * 1.1)) * 28}px` : "6px";
              return <div key={i} style={{ width: 4, borderRadius: 2, background: voiceListening ? "var(--sage-light)" : voiceSpeaking ? "var(--blush)" : "rgba(255,255,255,0.18)", height: h, transition: "height 0.15s ease", animation: animated ? `bar-wave ${0.35 + i * 0.04}s ease-in-out infinite alternate` : "none" }} />;
            })}
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "#F5EFE0", fontSize: "0.9rem", fontWeight: 500 }}>
              {voiceSpeaking ? "🔊 Snortle is speaking..." : voiceListening ? "🎙 Listening..." : voiceActive ? "Ready — tap Speak or ask your question" : "Start a voice consultation"}
            </div>
            {voiceTranscript && <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.78rem", marginTop: "0.3rem", fontStyle: "italic" }}>&ldquo;{voiceTranscript}&rdquo;</div>}
          </div>
          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", justifyContent: "center" }}>
            <button onClick={toggleCall} style={{ background: voiceActive ? "var(--rose)" : "var(--sage)", color: "white", border: "none", borderRadius: 100, padding: "0.6rem 1.4rem", fontSize: "0.85rem", fontWeight: 500, cursor: "pointer" }}>
              {voiceActive ? "📵 End call" : "📞 Start call"}
            </button>
            {voiceActive && !voiceListening && !voiceSpeaking && !loading && (
              <button onClick={startListening} style={{ background: "rgba(255,255,255,0.1)", color: "#F5EFE0", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 100, padding: "0.6rem 1.4rem", fontSize: "0.85rem", cursor: "pointer" }}>🎙 Speak</button>
            )}
            <label style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 100, padding: "0.6rem 1.1rem", fontSize: "0.82rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              📎 Upload PDF
              <input type="file" accept=".pdf" style={{ display: "none" }} onChange={async e => { const f = e.target.files?.[0]; if (f) { setMode("chat"); await handlePdf(f); } }} />
            </label>
          </div>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem 1.75rem" }}>
        {messages.length === 1 && mode === "chat" && (
          <div style={{ marginBottom: "1.75rem", textAlign: "center" }}>
            <div style={{ fontFamily: "'Fraunces',serif", fontSize: "1rem", color: "var(--text-muted)", fontStyle: "italic", marginBottom: "0.875rem" }}>Try asking...</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center" }}>
              {SUGGESTIONS.map(s => (<button key={s} onClick={() => send(s)} style={{ background: "white", border: "1px solid var(--border)", borderRadius: 100, padding: "0.42rem 0.95rem", fontSize: "0.8rem", color: "var(--text-mid)", cursor: "pointer" }}>{s}</button>))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: "1.1rem", display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
            {msg.role === "assistant" && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.3rem" }}>
                <div style={{ width: 20, height: 20, borderRadius: 6, background: "var(--sage-light)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces',serif", fontSize: "0.65rem", color: "var(--forest)" }}>S</div>
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Snortle</span>
              </div>
            )}
            <div style={{ maxWidth: "70%", padding: "0.8rem 1rem", borderRadius: msg.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px", background: msg.role === "user" ? "var(--forest)" : "white", color: msg.role === "user" ? "#F5EFE0" : "var(--text)", border: msg.role === "assistant" ? "1px solid var(--border)" : "none", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
              {msg.role === "user" ? <span style={{ fontSize: "0.9rem", lineHeight: 1.6 }}>{msg.content}</span> : msg.content ? <MarkdownMessage content={msg.content} /> : <span style={{ opacity: 0.3 }}>●●●</span>}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Chat input */}
      {mode === "chat" && (
        <div style={{ padding: "0.75rem 1.75rem 1.1rem", background: "white", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", background: "var(--cream-warm)", borderRadius: 16, border: "1.5px solid var(--border)", padding: "0.6rem 0.6rem 0.6rem 0.9rem" }}>
            <label title="Upload PDF report" style={{ width: 32, height: 32, borderRadius: 9, background: "var(--blush)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, fontSize: "0.85rem", border: "1px solid var(--border)" }}>
              {pdfLoading ? "⏳" : "📎"}
              <input type="file" accept=".pdf" style={{ display: "none" }} onChange={async e => { const f = e.target.files?.[0]; if (f) await handlePdf(f); if (e.target) e.target.value = ""; }} />
            </label>
            <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="Ask about your health, labs, medications..." rows={1} style={{ flex: 1, border: "none", background: "transparent", resize: "none", fontFamily: "'DM Sans',sans-serif", fontSize: "0.9rem", color: "var(--text)", outline: "none", lineHeight: 1.5, maxHeight: 100 }} />
            <button onClick={() => send()} disabled={!input.trim() || loading} style={{ width: 32, height: 32, borderRadius: 9, background: input.trim() && !loading ? "var(--forest)" : "var(--sage-light)", color: input.trim() && !loading ? "#F5EFE0" : "var(--text-muted)", border: "none", cursor: "pointer", fontSize: "0.95rem", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>↑</button>
          </div>
          <p style={{ fontSize: "0.68rem", color: "var(--text-muted)", textAlign: "center", marginTop: "0.35rem" }}>Health topics only · Not a substitute for professional care</p>
        </div>
      )}
      <style>{`@keyframes bar-wave { from { transform: scaleY(0.4); } to { transform: scaleY(1); } }`}</style>
    </div>
  );
}

// Type augmentation for Web Speech API
/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    SpeechRecognition: new () => any;
    webkitSpeechRecognition: new () => any;
  }
}
