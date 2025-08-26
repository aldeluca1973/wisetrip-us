import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

export function getSupabase(req: Request) {
  const url = Deno.env.get("SUPABASE_URL")!;
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const client = createClient(url, key, {
    auth: {
      persistSession: false
    }
  });
  return { supabase: client };
}

export function getUserId(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;
  
  try {
    const token = authHeader.replace("Bearer ", "");
    // This is a simplified extraction - in production you'd verify the JWT
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub;
  } catch {
    return null;
  }
}
