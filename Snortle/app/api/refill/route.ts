import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { medication, reason, draftNote, urgency, interactions, warnings } = body;

    const { data, error } = await supabase
      .from("refill_requests")
      .insert({
        user_id: user.id,
        user_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Unknown",
        user_email: user.email,
        medication,
        reason,
        draft_note: draftNote,
        urgency: urgency || "routine",
        interactions: interactions || [],
        warnings: warnings || [],
        status: "pending",
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return Response.json({ success: true, id: data.id });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Failed to save" }, { status: 500 });
  }
}
