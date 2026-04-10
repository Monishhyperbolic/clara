"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { extractPdfText } from "@/lib/extractPdf";
import MarkdownMessage from "@/components/MarkdownMessage";

interface Message { role: "user" | "assistant"; content: string; }
type VoiceState = "idle" | "listening" | "thinking" | "speaking";
type Mode = "chat" | "voice";

declare global {
  interface Window {
    SpeechRecognition: new () => any;
    webkitSpeechRecognition: new () => any;
  }
}

const QUICK = [
  "What does my LDL of 142 mean?",
  "Am I at risk for pre-diabetes?",
  "Draft a refill for Atorvastatin 20mg",
  "How can I lower my cholesterol?",
  "Explain my HbA1c of 5.4%",
];

function cleanForSpeech(text: string) {
  return text
    .replace(/\*\*/g, "").replace(/\*/g, "").replace(/#+\s/g, "")
    .replace(/`/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\n+/g, "  ").slice(0, 550);
}

export default function ChatPage() {
  const [mode, setMode] = useState<Mode>("chat");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm Snortle, your AI health assistant. Ask me anything about your health, labs, or medications." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [userCtx, setUserCtx] = useState<Record<string, unknown>>({});

  // Voice state
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [callDuration, setCallDuration] = useState(0);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const voiceActiveRef = useRef(false);
  const voiceStateRef = useRef<VoiceState>("idle");
  const silenceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTranscript = useRef("");
  const callTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const messagesRef = useRef<Message[]>(messages);
  const userCtxRef = useRef<Record<string, unknown>>({});

  // Keep refs in sync
  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { userCtxRef.current = userCtx; }, [userCtx]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    if (typeof window !== "undefined") synthRef.current = window.speechSynthesis;
    createClient().auth.getUser().then(({ data }) => {
      if (!data.user) return;
      const m = data.user.user_metadata || {};
      const ctx = { name: m.full_name || data.user.email?.split("@")[0], age: m.age || "", sex: m.sex || "", activeMeds: ["Metformin 500mg", "Atorvastatin 20mg", "Vitamin D3 5000IU"], allergies: "Penicillin", recentLabs: { LDL: "142 mg/dL", HbA1c: "5.4%", "Vitamin D": "42 ng/mL", TSH: "2.1 mIU/L" }, conditions: [] };
      setUserCtx(ctx); userCtxRef.current = ctx;
    });
    return () => { stopEverything(); };
  }, []);

  function updateVoiceState(s: VoiceState) {
    voiceStateRef.current = s;
    setVoiceState(s);
  }

  function stopEverything() {
    if (recRef.current) { try { recRef.current.stop(); } catch {} recRef.current = null; }
    if (synthRef.current) synthRef.current.cancel();
    if (silenceTimer.current) clearTimeout(silenceTimer.current);
    if (callTimer.current) clearInterval(callTimer.current);
  }

  // ── SPEAK ──
  function speak(text: string, onDone?: () => void) {
    if (!synthRef.current) { onDone?.(); return; }
    synthRef.current.cancel();
    updateVoiceState("speaking");
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.9; utt.pitch = 1.05; utt.volume = 1;
    const voices = synthRef.current.getVoices();
    const preferred = voices.find(v =>
      v.name.includes("Samantha") || v.name.includes("Karen") ||
      v.name.includes("Moira") || v.name.includes("Google UK English Female") ||
      v.name.includes("Microsoft Aria") || v.name.includes("Microsoft Jenny") ||
      (v.lang.startsWith("en") && /female|woman/i.test(v.name))
    ) || voices.find(v => v.lang.startsWith("en"));
    if (preferred) utt.voice = preferred;
    utt.onend = () => {
      updateVoiceState("idle");
      onDone?.();
    };
    utt.onerror = () => { updateVoiceState("idle"); onDone?.(); };
    synthRef.current.speak(utt);
  }

  // ── SEND TO API ──
  async function sendToApi(text: string) {
    const userMsg: Message = { role: "user", content: text };
    const history = [...messagesRef.current, userMsg];
    setMessages(prev => [...prev, userMsg, { role: "assistant", content: "" }]);
    messagesRef.current = [...history, { role: "assistant", content: "" }];
    updateVoiceState("thinking");

    try {
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.map(m => ({ role: m.role, content: m.content })), userContext: userCtxRef.current }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Error");
      const reader = res.body!.getReader();
      const dec = new TextDecoder();
      let full = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += dec.decode(value, { stream: true });
        setMessages(prev => { const u = [...prev]; u[u.length - 1] = { role: "assistant", content: full }; return u; });
      }
      messagesRef.current = [...history, { role: "assistant", content: full }];

      if (voiceActiveRef.current && full) {
        speak(cleanForSpeech(full), () => {
          if (voiceActiveRef.current) startListening();
        });
      }
    } catch {
      const errMsg = "I had trouble connecting. Please try again.";
      setMessages(prev => { const u = [...prev]; u[u.length - 1] = { role: "assistant", content: errMsg }; return u; });
      if (voiceActiveRef.current) speak(errMsg, () => { if (voiceActiveRef.current) startListening(); });
    } finally {
      setLoading(false);
    }
  }

  // ── CHAT SEND ──
  async function chatSend(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput(""); setLoading(true);
    await sendToApi(content);
    if (mode === "chat") inputRef.current?.focus();
  }

  // ── CONTINUOUS LISTENING ──
  const startListening = useCallback(() => {
    if (!voiceActiveRef.current) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    // Stop any existing recognition
    if (recRef.current) { try { recRef.current.abort(); } catch {} recRef.current = null; }

    const rec = new SR();
    rec.continuous = true;        // KEY: never stops mid-sentence
    rec.interimResults = true;    // live transcript
    rec.lang = "en-US";
    rec.maxAlternatives = 1;

    let finalBuffer = "";

    rec.onstart = () => {
      updateVoiceState("listening");
      finalBuffer = "";
      lastTranscript.current = "";
    };

    rec.onresult = (e: any) => {
      if (!voiceActiveRef.current) return;
      let interim = "";
      let newFinal = "";

      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) newFinal += t + " ";
        else interim += t;
      }

      if (newFinal) finalBuffer += newFinal;
      const display = (finalBuffer + interim).trim();
      setLiveTranscript(display);
      lastTranscript.current = display;

      // Silence detection: if no new words for 1.8s, send
      if (silenceTimer.current) clearTimeout(silenceTimer.current);
      silenceTimer.current = setTimeout(() => {
        const toSend = lastTranscript.current.trim();
        if (toSend && voiceActiveRef.current && voiceStateRef.current === "listening") {
          setLiveTranscript("");
          try { rec.stop(); } catch {}
          recRef.current = null;
          setLoading(true);
          sendToApi(toSend);
        }
      }, 1800);
    };

    rec.onerror = (e: any) => {
      if (e.error === "no-speech") {
        // No speech detected — restart
        if (voiceActiveRef.current) setTimeout(() => startListening(), 300);
      } else if (e.error !== "aborted") {
        updateVoiceState("idle");
      }
    };

    rec.onend = () => {
      if (voiceActiveRef.current && voiceStateRef.current === "listening") {
        // Restarted automatically (browser cut it) — restart
        setTimeout(() => startListening(), 200);
      }
    };

    recRef.current = rec;
    try { rec.start(); } catch {}
  }, []);

  // ── TOGGLE CALL ──
  function toggleCall() {
    if (voiceActive) {
      // End call
      voiceActiveRef.current = false;
      setVoiceActive(false);
      updateVoiceState("idle");
      setLiveTranscript("");
      setCallDuration(0);
      stopEverything();
    } else {
      // Start call
      voiceActiveRef.current = true;
      setVoiceActive(true);
      updateVoiceState("idle");
      setCallDuration(0);
      // Start duration counter
      callTimer.current = setInterval(() => setCallDuration(d => d + 1), 1000);
      // Load voices then greet
      if (synthRef.current) {
        synthRef.current.getVoices();
        setTimeout(() => {
          speak("Hello! I'm Snortle. I'm listening — speak your health question anytime.", () => {
            if (voiceActiveRef.current) startListening();
          });
        }, 400);
      }
    }
  }

  // Format call duration
  function formatDuration(s: number) {
    const m = Math.floor(s / 60), sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  // PDF handler
  async function handlePdf(file: File) {
    setPdfLoading(true);
    try {
      const text = await extractPdfText(file);
      if (!text.trim()) throw new Error("No text found");
      await chatSend(`I uploaded my health document: "${file.name}". Content:\n\n${text.slice(0, 4000)}\n\nPlease analyse and summarise the key health findings.`);
    } catch (err: any) {
      await chatSend(`Uploaded "${file.name}" but could not read it. Please paste the text directly.`);
    } finally { setPdfLoading(false); }
  }

  const BAR_COUNT = 20;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#FEFBF3", fontFamily: "'Inter',sans-serif" }}>

      {/* Header */}
      <div style={{ background: "white", borderBottom: "1px solid rgba(60,40,10,0.1)", padding: "0.875rem 1.75rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: "#C8EAE5", border: "1.5px solid #5AADA0", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display',serif", fontSize: "1rem", color: "#1A5248", fontStyle: "italic" }}>S</div>
          <div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 500, fontSize: "0.95rem", color: "#1C1409" }}>Snortle <span style={{ fontStyle: "italic", fontWeight: 400, color: "#7A6A52" }}>AI Doctor</span></div>
            <div style={{ fontSize: "0.68rem", color: loading ? "#B8860B" : "#2A7B6F", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
              {loading ? "Thinking..." : "Online · Fast model"}
            </div>
          </div>
        </div>
        {/* Mode toggle */}
        <div style={{ background: "#F2EBD9", borderRadius: 100, padding: "0.2rem", display: "flex", border: "1.5px solid rgba(60,40,10,0.12)" }}>
          {(["chat", "voice"] as Mode[]).map(m => (
            <button key={m} onClick={() => { setMode(m); if (m !== "voice" && voiceActive) toggleCall(); }}
              style={{ padding: "0.38rem 1rem", borderRadius: 100, border: "none", background: mode === m ? "#1A5248" : "transparent", color: mode === m ? "#FEFBF3" : "#5C4E38", fontSize: "0.78rem", fontWeight: mode === m ? 600 : 400, cursor: "pointer", transition: "all 0.15s" }}>
              {m === "chat" ? "✦ Chat" : "◎ Voice"}
            </button>
          ))}
        </div>
      </div>

      {/* ── VOICE CALL SCREEN ── */}
      {mode === "voice" && (
        <div style={{ flex: 1, background: "linear-gradient(160deg, #0A1F18 0%, #0F2820 50%, #091A14 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "2rem 1.5rem 2.5rem", overflow: "hidden", position: "relative" }}>

          {/* Ambient rings — animate when active */}
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            {[300, 220, 150].map((size, i) => (
              <div key={i} style={{ position: "absolute", width: size, height: size, borderRadius: "50%", border: `1px solid rgba(90,173,160,${voiceActive ? 0.15 - i * 0.04 : 0.05})`, animation: voiceActive ? `ring-pulse ${2 + i * 0.5}s ${i * 0.3}s ease-in-out infinite` : "none", transition: "all 0.5s" }} />
            ))}
          </div>

          {/* Top: call status */}
          <div style={{ zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 100, padding: "0.3rem 1rem", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.72rem", color: "rgba(255,255,255,0.6)", fontWeight: 600, letterSpacing: "0.1em" }}>
              {voiceActive
                ? <><span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34D399", display: "inline-block", animation: "blink 1s infinite" }} />ON CALL · {formatDuration(callDuration)}</>
                : "VOICE CONSULTATION"
              }
            </div>
          </div>

          {/* Centre: avatar + waveform */}
          <div style={{ zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "1.75rem" }}>
            {/* Avatar */}
            <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {/* Outer glow ring */}
              {(voiceState === "speaking" || voiceState === "listening") && (
                <div style={{ position: "absolute", width: 130, height: 130, borderRadius: "50%", border: `2px solid ${voiceState === "speaking" ? "#5AADA0" : "#34D399"}`, opacity: 0.5, animation: "ring-pulse 1s ease-in-out infinite" }} />
              )}
              {/* Avatar circle */}
              <div style={{ width: 104, height: 104, borderRadius: "50%", background: voiceState === "speaking" ? "#1A5248" : voiceState === "listening" ? "#143D2E" : "#0F2820", border: `3px solid ${voiceState === "speaking" ? "#5AADA0" : voiceState === "listening" ? "#34D399" : "rgba(255,255,255,0.1)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontSize: "2.4rem", color: "#C8EAE5", transition: "all 0.4s ease", boxShadow: voiceState === "speaking" ? "0 0 40px rgba(42,123,111,0.5)" : voiceState === "listening" ? "0 0 30px rgba(52,211,153,0.3)" : "none" }}>
                S
              </div>
            </div>

            {/* Waveform */}
            <div style={{ display: "flex", alignItems: "center", gap: "3px", height: 52 }}>
              {[...Array(BAR_COUNT)].map((_, i) => {
                const active = voiceState === "listening" || voiceState === "speaking";
                const h = active ? 6 + Math.abs(Math.sin(i * 0.65)) * 34 : 4;
                const c = voiceState === "listening" ? "#34D399" : voiceState === "speaking" ? "#5AADA0" : voiceState === "thinking" ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.1)";
                return <div key={i} style={{ width: 3, minWidth: 3, borderRadius: 3, background: c, height: `${h}px`, animation: active ? `wave-bar ${0.3 + (i % 5) * 0.08}s ease-in-out infinite alternate` : "none", transition: "background 0.3s, height 0.2s" }} />;
              })}
            </div>

            {/* Status label */}
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontSize: "1.15rem", color: "#F9F4EA", marginBottom: "0.35rem" }}>
                {voiceState === "speaking" ? "Snortle is speaking…"
                  : voiceState === "listening" ? "Listening…"
                  : voiceState === "thinking" ? "Thinking…"
                  : voiceActive ? "Ready — speak anytime"
                  : "Start a voice consultation"}
              </div>
              {liveTranscript && (
                <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", fontStyle: "italic", maxWidth: 280, textAlign: "center" }}>
                  &ldquo;{liveTranscript}&rdquo;
                </div>
              )}
              {!voiceActive && (
                <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.3)", marginTop: "0.5rem" }}>
                  Tap the phone icon to connect
                </p>
              )}
            </div>
          </div>

          {/* Bottom controls */}
          <div style={{ zIndex: 1, display: "flex", gap: "1.25rem", alignItems: "center" }}>
            {/* PDF upload */}
            <label title="Upload PDF" style={{ width: 50, height: 50, borderRadius: "50%", background: "rgba(255,255,255,0.07)", border: "1.5px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "1.1rem", flexDirection: "column" }}>
              {pdfLoading ? "⏳" : "📎"}
              <input type="file" accept=".pdf" style={{ display: "none" }} onChange={async e => { const f = e.target.files?.[0]; if (f) { setMode("chat"); await handlePdf(f); } }} />
            </label>

            {/* CALL button — big centre */}
            <button onClick={toggleCall} style={{ width: 76, height: 76, borderRadius: "50%", background: voiceActive ? "#DC2626" : "#16A34A", color: "white", border: "none", cursor: "pointer", fontSize: "1.75rem", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: voiceActive ? "0 0 28px rgba(220,38,38,0.5)" : "0 0 28px rgba(22,163,74,0.5)", transition: "all 0.2s" }}>
              {voiceActive ? "✕" : "✆"}
            </button>

            {/* Mute / unmute */}
            <button onClick={() => { if (voiceState === "listening") { if (recRef.current) try { recRef.current.abort(); } catch {} updateVoiceState("idle"); } else if (voiceActive && voiceState === "idle") { startListening(); } }} style={{ width: 50, height: 50, borderRadius: "50%", background: voiceState === "listening" ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.07)", border: `1.5px solid ${voiceState === "listening" ? "#34D399" : "rgba(255,255,255,0.1)"}`, color: voiceState === "listening" ? "#34D399" : "rgba(255,255,255,0.5)", fontSize: "1.1rem", display: "flex", alignItems: "center", justifyContent: "center", cursor: voiceActive && voiceState !== "speaking" && voiceState !== "thinking" ? "pointer" : "default" }}>
              🎙
            </button>
          </div>

          <style>{`
            @keyframes ring-pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.1);opacity:0.4} }
            @keyframes wave-bar   { from{transform:scaleY(0.4)} to{transform:scaleY(1)} }
            @keyframes blink      { 0%,100%{opacity:1} 50%{opacity:0.2} }
          `}</style>
        </div>
      )}

      {/* ── CHAT MESSAGES ── */}
      {mode === "chat" && (
        <>
          <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem 1.75rem" }}>
            {messages.length === 1 && (
              <div style={{ marginBottom: "1.75rem", textAlign: "center" }}>
                <p style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", color: "#7A6A52", fontSize: "0.92rem", marginBottom: "0.875rem" }}>How can I help you today?</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center" }}>
                  {QUICK.map(s => <button key={s} onClick={() => chatSend(s)} style={{ background: "white", border: "1.5px solid rgba(60,40,10,0.12)", borderRadius: 100, padding: "0.4rem 0.9rem", fontSize: "0.78rem", color: "#3D2E1A", cursor: "pointer" }}>{s}</button>)}
                </div>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} style={{ marginBottom: "1.1rem", display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
                {msg.role === "assistant" && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.3rem" }}>
                    <div style={{ width: 18, height: 18, borderRadius: 5, background: "#C8EAE5", border: "1px solid #5AADA0", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display',serif", fontSize: "0.6rem", color: "#1A5248", fontStyle: "italic" }}>S</div>
                    <span style={{ fontSize: "0.67rem", color: "#B5A48A", fontWeight: 600, letterSpacing: "0.05em" }}>SNORTLE</span>
                  </div>
                )}
                <div style={{ maxWidth: "70%", padding: "0.8rem 1rem", borderRadius: msg.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px", background: msg.role === "user" ? "#1A5248" : "white", color: msg.role === "user" ? "#FEFBF3" : "#1C1409", border: msg.role === "assistant" ? "1.5px solid rgba(60,40,10,0.1)" : "none", boxShadow: "0 1px 6px rgba(60,40,10,0.07)" }}>
                  {msg.role === "user" ? <span style={{ fontSize: "0.88rem", lineHeight: 1.65 }}>{msg.content}</span> : msg.content ? <MarkdownMessage content={msg.content} /> : <span style={{ opacity: 0.3 }}>• • •</span>}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: "0.75rem 1.75rem 1.1rem", background: "#F2EBD9", borderTop: "1.5px solid rgba(60,40,10,0.1)", flexShrink: 0 }}>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", background: "white", borderRadius: 14, border: "1.5px solid rgba(60,40,10,0.12)", padding: "0.5rem 0.5rem 0.5rem 0.875rem", boxShadow: "0 1px 6px rgba(60,40,10,0.06)" }}>
              <label title="Upload PDF" style={{ width: 30, height: 30, borderRadius: 8, background: "#F5E9C0", border: "1px solid rgba(60,40,10,0.12)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, fontSize: "0.8rem", color: "#B8860B" }}>
                {pdfLoading ? "⏳" : "⬡"}
                <input type="file" accept=".pdf" style={{ display: "none" }} onChange={async e => { const f = e.target.files?.[0]; if (f) await handlePdf(f); if (e.target) e.target.value = ""; }} />
              </label>
              <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); chatSend(); } }}
                placeholder="Ask about your health, labs, medications..." rows={1}
                style={{ flex: 1, border: "none", background: "transparent", resize: "none", fontFamily: "'Inter',sans-serif", fontSize: "0.88rem", color: "#1C1409", outline: "none", lineHeight: 1.55, maxHeight: 100 }} />
              <button onClick={() => chatSend()} disabled={!input.trim() || loading}
                style={{ width: 30, height: 30, borderRadius: 8, background: input.trim() && !loading ? "#1A5248" : "#E8DEC8", color: input.trim() && !loading ? "#FEFBF3" : "#B5A48A", border: "none", cursor: "pointer", fontSize: "0.9rem", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>↑</button>
            </div>
            <p style={{ fontSize: "0.67rem", color: "#B5A48A", textAlign: "center", marginTop: "0.35rem", letterSpacing: "0.02em" }}>Health topics only · Not a substitute for professional care</p>
          </div>
        </>
      )}
    </div>
  );
}
