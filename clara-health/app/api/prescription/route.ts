import { getNvidia, NVIDIA_MODEL } from "@/lib/nvidia";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { medication, reason, currentMeds, allergies } = await req.json();

  const prompt = `You are a clinical assistant drafting a prescription refill request for clinician review.

Patient request:
- Medication: ${medication}
- Reason for refill: ${reason}
- Current medications: ${currentMeds || "None listed"}
- Known allergies: ${allergies || "None listed"}

Draft a professional, concise refill request note. Return ONLY valid JSON:
{
  "draftNote": "the full clinical note text",
  "interactions": ["potential interaction 1", "potential interaction 2"] or [],
  "warnings": ["warning 1"] or [],
  "urgency": "routine" | "soon" | "urgent",
  "suggestedDose": "dose suggestion if applicable",
  "clinicianNote": "note for the reviewing clinician"
}

Always end draftNote with: 'Pending clinician review and approval before dispensing.'`;

  const nvidia = getNvidia();
  const completion = await nvidia.chat.completions.create({
    model: NVIDIA_MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
    max_tokens: 1024,
  });

  const raw = completion.choices[0].message.content ?? "{}";
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  const json = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: "Parse failed" };

  return Response.json(json);
}
