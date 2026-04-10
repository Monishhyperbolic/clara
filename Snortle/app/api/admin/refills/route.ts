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

export async function GET() {
  try {
    // Verify the caller is the admin
    const userClient = await createUserClient();
    const { data: { user } } = await userClient.auth.getUser();
    if (!user || user.email !== process.env.ADMIN_EMAIL) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabase = adminClient();
    const { data, error } = await supabase
      .from("refill_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return Response.json({ refills: data });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}
