import { createClient } from "@supabase/supabase-js";
import { createClient as createUserClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 30;

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userClient = await createUserClient();
    const { data: { user } } = await userClient.auth.getUser();
    if (!user || user.email !== process.env.ADMIN_EMAIL) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { status, admin_note } = await req.json();

    const supabase = adminClient();
    const { error } = await supabase
      .from("refill_requests")
      .update({ status, admin_note, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw new Error(error.message);
    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}
