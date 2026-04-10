interface Props { content: string }

export default function MarkdownMessage({ content }: Props) {
  const lines = content.split("\n");
  return (
    <div style={{ fontSize: "0.88rem", lineHeight: 1.7, color: "var(--ink)" }}>
      {lines.map((line, i) => {
        if (/^[-*]\s/.test(line)) return (
          <div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.25rem" }}>
            <span style={{ color: "var(--teal)", flexShrink: 0, marginTop: "0.1rem" }}>•</span>
            <span>{renderInline(line.slice(2))}</span>
          </div>
        );
        if (/^\d+\.\s/.test(line)) {
          const num = line.match(/^(\d+)\.\s/)![1];
          return (
            <div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.25rem" }}>
              <span style={{ color: "var(--teal)", fontWeight: 600, minWidth: "1.2rem", flexShrink: 0 }}>{num}.</span>
              <span>{renderInline(line.replace(/^\d+\.\s/, ""))}</span>
            </div>
          );
        }
        if (/^#{1,3}\s/.test(line)) return (
          <div key={i} style={{ fontWeight: 600, color: "var(--ink)", marginTop: "0.75rem", marginBottom: "0.25rem", fontSize: "0.9rem" }}>
            {line.replace(/^#+\s/, "")}
          </div>
        );
        if (line.trim() === "") return <div key={i} style={{ height: "0.4rem" }} />;
        return <div key={i}>{renderInline(line)}</div>;
      })}
    </div>
  );
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={i} style={{ fontWeight: 600, color: "var(--ink)" }}>{part.slice(2, -2)}</strong>;
    if (/^\*[^*]+\*$/.test(part))   return <em key={i} style={{ fontStyle: "italic", color: "var(--ink-mid)" }}>{part.slice(1, -1)}</em>;
    if (/^`[^`]+`$/.test(part))     return <code key={i} style={{ background: "var(--parchment-2)", padding: "1px 5px", borderRadius: 4, fontSize: "0.83em", color: "var(--teal-deep)" }}>{part.slice(1, -1)}</code>;
    return part;
  });
}
