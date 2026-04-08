import { getNvidia, NVIDIA_MODEL, SYSTEM_PROMPT } from "@/lib/nvidia";

export const runtime = "edge";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const nvidia = getNvidia();
  const stream = await nvidia.chat.completions.create({
    model: NVIDIA_MODEL,
    messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
    stream: true,
    max_tokens: 1024,
    temperature: 0.4,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? "";
        if (text) controller.enqueue(encoder.encode(text));
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
