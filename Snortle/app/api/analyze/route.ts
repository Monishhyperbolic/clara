import { getNvidia, NVIDIA_MODEL } from "@/lib/nvidia";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { labs } = await req.json();
    const nvidia = getNvidia();

    const prompt = `You are a clinical lab analyst. Analyze the following lab results and return a JSON report.

Lab input:
${labs}

Return ONLY valid JSON (no markdown, no backticks):
{
  "summary": "2-3 sentence overall health summary",
  "status": "normal",
  "results": [
    {
      "name": "test name",
      "value": "value with unit",
      "status": "normal",
      "range": "reference range",
      "interpretation": "plain-language explanation",
      "trend": "stable"
    }
  ],
  "insights": ["insight 1", "insight 2"],
  "recommendations": ["rec 1", "rec 2"],
  "followUp": "suggested follow-up timeframe"
}

status fields can be: "normal" | "low" | "high" | "critical"
overall status can be: "normal" | "attention" | "urgent"`;

    const completion = await nvidia.chat.completions.create({
      model: NVIDIA_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
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
