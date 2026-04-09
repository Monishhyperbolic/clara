"use client";
import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const suggestions = [
  "Explain my LDL result of 142 mg/dL",
  "What are early signs of pre-diabetes?",
  "Should I be concerned about my Vitamin D levels?",
  "What does my HbA1c of 5.4% mean?",
  "Draft a refill for Atorvastatin 20mg",
  "Best diet for lowering cholesterol naturally",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi, I'm Snortle — your AI health assistant. I can analyze your labs, review your medications, help you understand symptoms, and draft prescription requests for your clinician. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text?: string) {
    const content = text ?? input.trim();
    if (!content || loading) return;
    setInput("");
    const userMsg: Message = { role: "user", content };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);

    const assistantMsg: Message = { role: "assistant", content: "" };
    setMessages(prev => [...prev, assistantMsg]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages.map(m => ({ role: m.role, content: m.content })) }),
      });
      if (!res.body) throw new Error("No body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: full };
          return updated;
        });
      }
    } catch {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: "Sorry, something went wrong. Please check your API key and try again." };
        return updated;
      });
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Header */}
      <div style={{ padding: "1.5rem 2rem", borderBottom: "1px solid var(--border)", background: "white", display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--green-muted)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Serif Display',serif", fontSize: "1.1rem", color: "var(--green)" }}>C</div>
        <div>
          <div style={{ fontWeight: 500, fontSize: "1rem" }}>Snortle</div>
          <div style={{ fontSize: "0.75rem", color: "var(--green-light)" }}>
            {loading ? "⌛ Thinking..." : "● Online · Powered by NVIDIA NIM"}
          </div>
        </div>
        <div style={{ marginLeft: "auto", fontSize: "0.75rem", color: "var(--text-muted)", background: "var(--green-muted)", padding: "0.3rem 0.75rem", borderRadius: 100 }}>
          meta/llama-3.3-70b-instruct
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem 2rem" }}>
        {messages.length === 1 && (
          <div style={{ marginBottom: "2rem" }}>
            <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "0.75rem", textAlign: "center" as const }}>Suggested questions</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center" }}>
              {suggestions.map(s => (
                <button key={s} onClick={() => send(s)} style={{ background: "white", border: "1px solid var(--border)", borderRadius: 100, padding: "0.45rem 1rem", fontSize: "0.82rem", color: "var(--text-mid)", cursor: "pointer" }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: "1.25rem", display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
            {msg.role === "assistant" && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--green-muted)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Serif Display',serif", fontSize: "0.75rem", color: "var(--green)" }}>C</div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Snortle</span>
              </div>
            )}
            <div style={{
              maxWidth: "72%",
              padding: "0.875rem 1.1rem",
              borderRadius: msg.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
              background: msg.role === "user" ? "var(--green)" : "white",
              color: msg.role === "user" ? "var(--cream)" : "var(--text)",
              fontSize: "0.92rem", lineHeight: 1.65,
              border: msg.role === "assistant" ? "1px solid var(--border)" : "none",
              whiteSpace: "pre-wrap" as const,
            }}>
              {msg.content || (loading && i === messages.length - 1 ? <span style={{ opacity: 0.5 }}>●●●</span> : "")}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "1rem 2rem 1.5rem", background: "white", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end", background: "var(--cream)", borderRadius: 16, border: "1.5px solid var(--border)", padding: "0.75rem 0.75rem 0.75rem 1.1rem" }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask Snortle anything about your health..."
            rows={1}
            style={{ flex: 1, border: "none", background: "transparent", resize: "none", fontFamily: "'DM Sans',sans-serif", fontSize: "0.92rem", color: "var(--text)", outline: "none", lineHeight: 1.5, maxHeight: 120, overflow: "auto" }}
          />
          <button onClick={() => send()} disabled={!input.trim() || loading} style={{
            background: input.trim() && !loading ? "var(--green)" : "var(--green-muted)",
            color: input.trim() && !loading ? "var(--cream)" : "var(--text-muted)",
            border: "none", borderRadius: 10, width: 36, height: 36, cursor: input.trim() && !loading ? "pointer" : "default",
            fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s", flexShrink: 0
          }}>↑</button>
        </div>
        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textAlign: "center" as const, marginTop: "0.6rem" }}>
          Snortle is an AI assistant. All outputs are informational only and reviewed by licensed clinicians.
        </div>
      </div>
    </div>
  );
}
