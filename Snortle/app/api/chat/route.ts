import { getNvidia, NVIDIA_MODEL, buildSystemPrompt } from "@/lib/nvidia";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages, userContext } = await req.json();
    const nvidia = getNvidia();

    const stream = await nvidia.chat.completions.create({
      model: NVIDIA_MODEL,
      messages: [{ role: "system", content: buildSystemPrompt(userContext) }, ...messages],
      stream: true,
      max_tokens: 512,
      temperature: 0.3,
      top_p: 0.7,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? "";
            if (text) controller.enqueue(encoder.encode(text));
          }
        } finally { controller.close(); }
      },
    });
    return new Response(readable, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Error" }, { status: 500 });
  }
}
