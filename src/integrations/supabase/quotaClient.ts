import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

export const quotaSupabase = createClient<Database>(
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL,
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
);
