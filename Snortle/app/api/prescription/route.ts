import { getNvidia, NVIDIA_MODEL } from "@/lib/nvidia";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { medication, reason, currentMeds, allergies } = await req.json();
    const nvidia = getNvidia();
    const prompt = `Draft a prescription refill request. Return ONLY valid JSON, no backticks:\nMedication: ${medication}\nReason: ${reason}\nCurrent meds: ${currentMeds||"None"}\nAllergies: ${allergies||"None"}\n\n{"draftNote":"clinical note ending with: Pending clinician review before dispensing.","interactions":[],"warnings":[],"urgency":"routine|soon|urgent","suggestedDose":"","clinicianNote":""}`;
    const completion = await nvidia.chat.completions.create({ model: NVIDIA_MODEL, messages: [{ role: "user", content: prompt }], temperature: 0.1, max_tokens: 800 });
    const raw = completion.choices[0].message.content ?? "{}";
    const m = raw.match(/\{[\s\S]*\}/);
    return Response.json(m ? JSON.parse(m[0]) : { error: "Parse failed" });
  } catch (e) { return Response.json({ error: e instanceof Error ? e.message : "Error" }, { status: 500 }); }
}
