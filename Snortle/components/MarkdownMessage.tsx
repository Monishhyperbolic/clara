interface Props { content: string }

export default function MarkdownMessage({ content }: Props) {
  // Convert markdown to styled spans without dangerouslySetInnerHTML
  const lines = content.split("\n");

  return (
    <div style={{ fontSize: "0.92rem", lineHeight: 1.65 }}>
      {lines.map((line, i) => {
        // Bullet list
        if (/^[-*]\s/.test(line)) {
          return (
            <div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.2rem" }}>
              <span style={{ flexShrink: 0, marginTop: "0.1rem" }}>•</span>
              <span>{renderInline(line.slice(2))}</span>
            </div>
          );
        }
        // Numbered list
        if (/^\d+\.\s/.test(line)) {
          const num = line.match(/^(\d+)\.\s/)![1];
          return (
            <div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.2rem" }}>
              <span style={{ flexShrink: 0, color: "var(--green-light)", fontWeight: 500, minWidth: "1.2rem" }}>{num}.</span>
              <span>{renderInline(line.replace(/^\d+\.\s/, ""))}</span>
            </div>
          );
        }
        // Heading
        if (/^#{1,3}\s/.test(line)) {
          const text = line.replace(/^#+\s/, "");
          return <div key={i} style={{ fontWeight: 500, marginTop: "0.75rem", marginBottom: "0.2rem" }}>{text}</div>;
        }
        // Empty line = spacer
        if (line.trim() === "") return <div key={i} style={{ height: "0.5rem" }} />;
        // Normal line
        return <div key={i}>{renderInline(line)}</div>;
      })}
    </div>
  );
}

function renderInline(text: string): React.ReactNode {
  // Split by bold (**text**) and italic (*text*)
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (/^\*[^*]+\*$/.test(part)) return <em key={i}>{part.slice(1, -1)}</em>;
    if (/^`[^`]+`$/.test(part)) return <code key={i} style={{ background: "rgba(0,0,0,0.08)", padding: "1px 5px", borderRadius: 4, fontSize: "0.85em" }}>{part.slice(1, -1)}</code>;
    return part;
  });
}
