import { getNvidia, NVIDIA_MODEL } from "@/lib/nvidia";

export const runtime = "edge";

export async function POST(req: Request) {
  const { age, sex, metrics } = await req.json();

  const prompt = `You are a longevity medicine specialist. Analyze these biomarkers and return a personalized longevity score and action plan.

Patient: ${age} year old ${sex}
Metrics: ${JSON.stringify(metrics)}

Return ONLY valid JSON:
{
  "longevityScore": 0-100,
  "biologicalAge": estimated biological age as number,
  "categories": [
    {
      "name": "Metabolic Health" | "Cardiovascular" | "Inflammation" | "Hormonal" | "Cognitive",
      "score": 0-100,
      "status": "excellent" | "good" | "fair" | "poor",
      "summary": "one sentence"
    }
  ],
  "topWins": ["positive finding 1", "positive finding 2"],
  "topRisks": ["risk factor 1", "risk factor 2"],
  "interventions": [
    {
      "title": "intervention name",
      "category": "diet" | "exercise" | "sleep" | "supplement" | "medical",
      "impact": "high" | "medium" | "low",
      "description": "brief description"
    }
  ],
  "summary": "2-3 sentence overall longevity assessment"
}`;

  const nvidia = getNvidia();
  const completion = await nvidia.chat.completions.create({
    model: NVIDIA_MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 2048,
  });

  const raw = completion.choices[0].message.content ?? "{}";
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  const json = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: "Parse failed" };

  return Response.json(json);
}
