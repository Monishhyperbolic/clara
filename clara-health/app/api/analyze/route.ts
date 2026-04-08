import { getNvidia, NVIDIA_MODEL } from "@/lib/nvidia";

export const runtime = "edge";

export async function POST(req: Request) {
  const { labs } = await req.json();

  const prompt = `You are a clinical lab analyst. Analyze the following lab results and return a detailed JSON report.

Lab input:
${labs}

Return ONLY valid JSON in this exact structure:
{
  "summary": "2-3 sentence overall health summary",
  "status": "normal" | "attention" | "urgent",
  "results": [
    {
      "name": "test name",
      "value": "value with unit",
      "status": "normal" | "low" | "high" | "critical",
      "range": "reference range",
      "interpretation": "plain-language explanation",
      "trend": "stable" | "improving" | "worsening" | "unknown"
    }
  ],
  "insights": ["insight 1", "insight 2", "insight 3"],
  "recommendations": ["recommendation 1", "recommendation 2"],
  "followUp": "suggested follow-up timeframe"
}`;

  const nvidia = getNvidia();
  const completion = await nvidia.chat.completions.create({
    model: NVIDIA_MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
    max_tokens: 2048,
  });

  const raw = completion.choices[0].message.content ?? "{}";
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  const json = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: "Parse failed" };

  return Response.json(json);
}
