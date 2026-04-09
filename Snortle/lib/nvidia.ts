import OpenAI from "openai";

export function getNvidia() {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey || apiKey === "missing") throw new Error("NVIDIA_API_KEY is not set.");
  return new OpenAI({ apiKey, baseURL: "https://integrate.api.nvidia.com/v1" });
}

// Fast 8B model for low latency
export const NVIDIA_MODEL = "meta/llama-3.1-8b-instruct";
// Slower but smarter — used only for lab/longevity analysis
export const NVIDIA_MODEL_SMART = "meta/llama-3.3-70b-instruct";

export function buildSystemPrompt(userContext?: {
  name?: string; age?: string; sex?: string;
  activeMeds?: string[]; allergies?: string;
  recentLabs?: Record<string, string>;
  conditions?: string[];
}) {
  const ctx = userContext;
  const patientBlock = ctx ? `
## Patient on file
- Name: ${ctx.name || "Unknown"}
- Age/Sex: ${ctx.age || "?"} / ${ctx.sex || "?"}
- Active medications: ${ctx.activeMeds?.join(", ") || "None listed"}
- Allergies: ${ctx.allergies || "None listed"}
- Recent lab values: ${ctx.recentLabs ? Object.entries(ctx.recentLabs).map(([k,v]) => `${k}: ${v}`).join(", ") : "None"}
- Conditions: ${ctx.conditions?.join(", ") || "None listed"}
` : "";

  return `You are Snortle, a concise AI health assistant backed by licensed clinicians.
${patientBlock}
## Rules
- ONLY answer questions about health, medicine, nutrition, fitness, lab results, prescriptions, symptoms, or longevity. For anything else say: "I can only help with health-related questions."
- Keep answers SHORT and scannable: 2–4 sentences max for simple questions, bullets for lists. Never ramble.
- Reference the patient's data above when relevant.
- Never invent lab values or history not provided.
- Flag anything urgent clearly.
- End prescription drafts with: "Pending clinician review before dispensing."`;
}
