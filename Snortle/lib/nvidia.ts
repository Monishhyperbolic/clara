import OpenAI from "openai";

export function getNvidia() {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey || apiKey === "missing") throw new Error("NVIDIA_API_KEY is not set.");
  return new OpenAI({ apiKey, baseURL: "https://integrate.api.nvidia.com/v1" });
}

export const NVIDIA_MODEL       = "meta/llama-3.1-8b-instruct";
export const NVIDIA_MODEL_SMART = "meta/llama-3.3-70b-instruct";

export interface UserHealthContext {
  name?: string;
  age?: string;
  sex?: string;
  height?: string;
  weight?: string;
  activeMeds?: string[];
  allergies?: string;
  conditions?: string[];
  recentLabs?: Record<string, string>;
  longevityReport?: {
    score?: number;
    biologicalAge?: number;
    summary?: string;
    topRisks?: string[];
    topWins?: string[];
    categories?: Array<{ name: string; score: number; status: string }>;
    interventions?: Array<{ title: string; impact: string; description: string }>;
  } | null;
  refillHistory?: Array<{ medication: string; status: string; date: string }>;
  labHistory?: Array<{ name: string; value: string; date: string; status: string }>;
}

export function buildSystemPrompt(ctx?: UserHealthContext): string {
  const name = ctx?.name || "the patient";

  // Build patient data block
  const patientLines: string[] = [];
  if (ctx?.name)        patientLines.push(`- Name: ${ctx.name}`);
  if (ctx?.age || ctx?.sex) patientLines.push(`- Age/Sex: ${ctx.age || "unknown"} / ${ctx.sex || "unknown"}`);
  if (ctx?.height && ctx?.weight) {
    const bmi = ctx.height && ctx.weight
      ? (parseFloat(ctx.weight) / Math.pow(parseFloat(ctx.height) / 100, 2)).toFixed(1)
      : null;
    patientLines.push(`- Height/Weight: ${ctx.height}cm / ${ctx.weight}kg${bmi ? ` (BMI: ${bmi})` : ""}`);
  }
  if (ctx?.activeMeds?.length)   patientLines.push(`- Active medications: ${ctx.activeMeds.join(", ")}`);
  if (ctx?.allergies)            patientLines.push(`- Allergies: ${ctx.allergies}`);
  if (ctx?.conditions?.length)   patientLines.push(`- Conditions: ${ctx.conditions.join(", ")}`);
  if (ctx?.recentLabs && Object.keys(ctx.recentLabs).length) {
    patientLines.push(`- Recent labs: ${Object.entries(ctx.recentLabs).map(([k,v]) => `${k}=${v}`).join(", ")}`);
  }

  // Longevity block
  let longevityBlock = "";
  if (ctx?.longevityReport) {
    const l = ctx.longevityReport;
    longevityBlock = `
## Existing longevity report (already calculated)
- Score: ${l.score ?? "N/A"}/100
- Biological age: ${l.biologicalAge ?? "N/A"} years
- Summary: ${l.summary || "N/A"}
- Top wins: ${l.topWins?.join("; ") || "N/A"}
- Top risks: ${l.topRisks?.join("; ") || "N/A"}
- Categories: ${l.categories?.map(c => `${c.name}=${c.score}(${c.status})`).join(", ") || "N/A"}
- Top interventions: ${l.interventions?.slice(0, 3).map(i => `${i.title}(${i.impact})`).join(", ") || "N/A"}
`;
  }

  // Refill history block
  let refillBlock = "";
  if (ctx?.refillHistory?.length) {
    refillBlock = `\n## Prescription refill history\n${ctx.refillHistory.map(r => `- ${r.medication}: ${r.status} (${r.date})`).join("\n")}`;
  }

  // Lab history block
  let labBlock = "";
  if (ctx?.labHistory?.length) {
    labBlock = `\n## Full lab history\n${ctx.labHistory.map(l => `- ${l.name}: ${l.value} — ${l.status} (${l.date})`).join("\n")}`;
  }

  const patientBlock = patientLines.length
    ? `\n## Patient: ${name}\n${patientLines.join("\n")}\n`
    : "";

  return `You are Snortle, an AI health assistant backed by board-certified clinicians. You have full access to this patient's health data.
${patientBlock}${longevityBlock}${refillBlock}${labBlock}
## Your capabilities
You CAN help with: health questions, symptoms, nutrition, fitness, sleep, stress, lab interpretation, longevity, biological age estimation, BMI calculation, medication information, wellness planning, mental health guidance, disease prevention, and any topic that touches health or the human body.

When a patient asks to "calculate my longevity score" or similar, USE their data above to provide an estimate. Don't redirect them to another page — give them the answer.

When asked about their existing data (labs, longevity report, prescriptions), reference it directly and explain it.

You CANNOT help with: coding, cooking unrelated to health, politics, finance, entertainment. For these say: "I'm only able to help with health topics."

## Response style
- Be warm, direct and precise. Reference the patient by first name occasionally.
- Short answers for simple questions (2-4 sentences). Bullet points for lists.
- For longevity/score questions: provide a quick estimate using their data, explain the key factors, and mention they can get the full report on the Longevity page.
- For lab questions: explain the value, whether it's in range, and what it means for them specifically.
- Never say "I don't have access to your data" — you do, it's above.
- Flag urgent symptoms clearly.
- End prescription drafts with: "Pending clinician review before dispensing."`;
}
