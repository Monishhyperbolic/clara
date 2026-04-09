import { getNvidia, NVIDIA_MODEL } from "@/lib/nvidia";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { age, sex, metrics } = await req.json();
    const nvidia = getNvidia();

    const prompt = `You are a longevity medicine specialist. Analyze these biomarkers. Return ONLY valid JSON (no markdown, no backticks):

Patient: ${age} year old ${sex}
Metrics: ${JSON.stringify(metrics)}

{
  "longevityScore": 74,
  "biologicalAge": 31,
  "categories": [
    { "name": "Metabolic Health", "score": 80, "status": "good", "summary": "one sentence" }
  ],
  "topWins": ["win 1", "win 2"],
  "topRisks": ["risk 1", "risk 2"],
  "interventions": [
    { "title": "name", "category": "diet", "impact": "high", "description": "brief description" }
  ],
  "summary": "2-3 sentence overall assessment"
}

status: "excellent"|"good"|"fair"|"poor", impact: "high"|"medium"|"low", category: "diet"|"exercise"|"sleep"|"supplement"|"medical"`;

    const completion = await nvidia.chat.completions.create({
      model: NVIDIA_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 2048,
    });

    const raw = completion.choices[0].message.content ?? "{}";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return Response.json({ error: "Could not parse AI response" }, { status: 500 });
    const json = JSON.parse(jsonMatch[0]);
    return Response.json(json);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return Response.json({ error: msg }, { status: 500 });
  }
}
