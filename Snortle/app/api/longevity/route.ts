import { getNvidia, NVIDIA_MODEL_SMART } from "@/lib/nvidia";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { age, sex, metrics } = await req.json();
    const nvidia = getNvidia();
    const prompt = `Longevity analysis for ${age}yo ${sex}. Metrics: ${JSON.stringify(metrics)}. Return ONLY valid JSON, no backticks:\n{"longevityScore":74,"biologicalAge":31,"categories":[{"name":"Metabolic Health","score":80,"status":"good","summary":"1 sentence"}],"topWins":["2 items"],"topRisks":["2 items"],"interventions":[{"title":"","category":"diet|exercise|sleep|supplement|medical","impact":"high|medium|low","description":"1 sentence"}],"summary":"2 sentences"}`;
    const completion = await nvidia.chat.completions.create({ model: NVIDIA_MODEL_SMART, messages: [{ role: "user", content: prompt }], temperature: 0.1, max_tokens: 1500 });
    const raw = completion.choices[0].message.content ?? "{}";
    const m = raw.match(/\{[\s\S]*\}/);
    return Response.json(m ? JSON.parse(m[0]) : { error: "Parse failed" });
  } catch (e) { return Response.json({ error: e instanceof Error ? e.message : "Error" }, { status: 500 }); }
}
