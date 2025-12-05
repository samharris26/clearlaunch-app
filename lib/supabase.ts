// Legacy export for backward compatibility
// Use lib/supabase/server.ts or lib/supabase/client.ts instead
import { createClient as createBrowserClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createBrowserClient(supabaseUrl, supabaseKey);
