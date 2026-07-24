// Scheduled cleanup: removes pending transfers older than 60 hours that were
// never downloaded, and prunes their storage objects.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const cutoff = new Date(Date.now() - 60 * 60 * 60 * 1000).toISOString();

    const { data: stale, error: selErr } = await supabase
      .from("pending_transfers")
      .select("id, storage_path, file_name, file_size, file_type, sender_name")
      .eq("downloaded", false)
      .lt("created_at", cutoff);

    if (selErr) throw selErr;

    let removedFiles = 0;
    let removedRows = 0;

    if (stale && stale.length) {
      const paths = stale.map((r) => r.storage_path).filter(Boolean);
      if (paths.length) {
        const { error: rmErr } = await supabase.storage.from("pending-files").remove(paths);
        if (rmErr) console.error("storage remove error:", rmErr.message);
        else removedFiles = paths.length;
      }

      const ids = stale.map((r) => r.id);
      const { error: delErr } = await supabase.from("pending_transfers").delete().in("id", ids);
      if (delErr) throw delErr;
      removedRows = ids.length;

      const events = stale.map((r) => ({
        sender_name: r.sender_name,
        file_name: r.file_name,
        file_size: r.file_size,
        file_type: r.file_type,
        status: "expired",
      }));
      await supabase.from("transfer_events").insert(events);
    }

    return new Response(
      JSON.stringify({ ok: true, removedRows, removedFiles, cutoff }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("cleanup error:", e);
    return new Response(
      JSON.stringify({ ok: false, error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
