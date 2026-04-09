import { getNvidia, NVIDIA_MODEL } from "@/lib/nvidia";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { medication, reason, currentMeds, allergies } = await req.json();
    const nvidia = getNvidia();

    const prompt = `Draft a prescription refill request note. Return ONLY valid JSON (no markdown, no backticks):

Medication: ${medication}
Reason: ${reason}
Current meds: ${currentMeds || "None listed"}
Allergies: ${allergies || "None listed"}

{
  "draftNote": "full clinical note text ending with: Pending clinician review and approval before dispensing.",
  "interactions": [],
  "warnings": [],
  "urgency": "routine",
  "suggestedDose": "dose suggestion",
  "clinicianNote": "note for reviewing clinician"
}

urgency can be: "routine" | "soon" | "urgent"`;

    const completion = await nvidia.chat.completions.create({
      model: NVIDIA_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 1024,
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
