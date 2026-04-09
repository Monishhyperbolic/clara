import { getNvidia, NVIDIA_MODEL_SMART } from "@/lib/nvidia";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { labs } = await req.json();
    const nvidia = getNvidia();
    const prompt = `Analyze these lab results. Return ONLY valid JSON, no markdown backticks:\n${labs}\n\n{"summary":"2 sentences","status":"normal|attention|urgent","results":[{"name":"","value":"","status":"normal|low|high|critical","range":"","interpretation":"1 sentence","trend":"stable|improving|worsening|unknown"}],"insights":["3 max"],"recommendations":["3 max"],"followUp":"timeframe"}`;
    const completion = await nvidia.chat.completions.create({ model: NVIDIA_MODEL_SMART, messages: [{ role: "user", content: prompt }], temperature: 0.1, max_tokens: 1500 });
    const raw = completion.choices[0].message.content ?? "{}";
    const m = raw.match(/\{[\s\S]*\}/);
    return Response.json(m ? JSON.parse(m[0]) : { error: "Parse failed" });
  } catch (e) { return Response.json({ error: e instanceof Error ? e.message : "Error" }, { status: 500 }); }
}
