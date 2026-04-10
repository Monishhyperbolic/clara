import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 15;

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    // Fetch refill requests
    const { data: refills } = await supabase
      .from("refill_requests")
      .select("medication, status, created_at, urgency")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    // Build context from user metadata
    const meta = user.user_metadata || {};

    return Response.json({
      name: meta.full_name || user.email?.split("@")[0],
      age: meta.age || "",
      sex: meta.sex || "",
      height: meta.height || "",
      weight: meta.weight || "",
      conditions: meta.conditions || [],
      allergies: meta.allergies || "Penicillin",
      activeMeds: meta.activeMeds || ["Metformin 500mg", "Atorvastatin 20mg", "Vitamin D3 5000IU"],
      recentLabs: meta.recentLabs || {
        "LDL": "142 mg/dL", "HDL": "52 mg/dL", "HbA1c": "5.4%",
        "Vitamin D": "42 ng/mL", "TSH": "2.1 mIU/L", "Triglycerides": "108 mg/dL",
        "Total Cholesterol": "218 mg/dL", "Fasting Glucose": "94 mg/dL"
      },
      longevityReport: meta.longevityReport || null,
      refillHistory: (refills || []).map(r => ({
        medication: r.medication,
        status: r.status,
        date: new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      })),
      labHistory: meta.labHistory || [
        { name: "LDL Cholesterol",   value: "142 mg/dL", date: "Apr 2, 2026",  status: "high"   },
        { name: "HDL Cholesterol",   value: "52 mg/dL",  date: "Apr 2, 2026",  status: "normal" },
        { name: "HbA1c",             value: "5.4%",       date: "Apr 2, 2026",  status: "normal" },
        { name: "Vitamin D",         value: "42 ng/mL",  date: "Mar 15, 2026", status: "normal" },
        { name: "TSH",               value: "2.1 mIU/L", date: "Mar 15, 2026", status: "normal" },
        { name: "Fasting Glucose",   value: "94 mg/dL",  date: "Mar 15, 2026", status: "normal" },
      ],
    });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Error" }, { status: 500 });
  }
}
