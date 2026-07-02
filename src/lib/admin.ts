import { supabase } from "@/integrations/supabase/client";
import { ArchivedSOW, SOWState } from "@/types/sow";

export const ADMIN_EMAIL = "daniel@phaosai.com";
export const ADMIN_PASSWORD = "Evangelizor1981!";

export async function isCurrentUserAdmin(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return false;
  if (session.user.email?.toLowerCase() !== ADMIN_EMAIL) return false;
  try { await supabase.rpc("ensure_admin_for_daniel"); } catch {}
  const { data } = await supabase.rpc("is_admin");
  return Boolean(data);
}

/** Sign in (or create) the fixed admin account. */
export async function adminLogin(email: string, password: string): Promise<void> {
  if (email.trim().toLowerCase() !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    throw new Error("Invalid admin credentials.");
  }
  let { error } = await supabase.auth.signInWithPassword({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
  if (error) {
    // Try to create the account, then sign in
    const { error: signUpErr } = await supabase.auth.signUp({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    if (signUpErr && !/registered/i.test(signUpErr.message)) throw signUpErr;
    const retry = await supabase.auth.signInWithPassword({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    if (retry.error) throw retry.error;
  }
  try { await supabase.rpc("ensure_admin_for_daniel"); } catch {}
}

export async function adminLogout() {
  await supabase.auth.signOut();
}

const looksLikeSOW = (p: any): p is SOWState =>
  p && typeof p === "object" && typeof p.companyName === "string" && p.answers && Array.isArray(p.contactsCustomer);

/** Returns every save/submit/archive/reactivate from every browser as ArchivedSOW. */
export async function fetchAllCloudArchives(): Promise<ArchivedSOW[]> {
  const { data, error } = await supabase
    .from("snapshots")
    .select("*")
    .in("doc_type", ["sow", "sow_archive"])
    .order("created_at", { ascending: false })
    .limit(1000);
  if (error) throw error;

  const out: ArchivedSOW[] = [];
  for (const row of data ?? []) {
    const payload: any = row.payload;
    // Expand legacy archive dumps (arrays of ArchivedSOW)
    if (Array.isArray(payload)) {
      for (const a of payload) {
        if (a?.state && looksLikeSOW(a.state)) {
          out.push({
            id: `cloud-${row.id}-${a.id ?? Math.random().toString(36).slice(2)}`,
            state: a.state,
            archivedAt: a.archivedAt ?? new Date(row.created_at).toLocaleString(),
            kind: a.kind === "saved" ? "saved" : "submitted",
            savedBy: a.savedBy ?? row.person_name ?? "(unknown)",
          });
        }
      }
      continue;
    }
    if (looksLikeSOW(payload)) {
      const kind = row.kind === "save" ? "saved" : "submitted";
      out.push({
        id: `cloud-${row.id}`,
        state: payload,
        archivedAt: `${new Date(row.created_at).toLocaleString()} · ${row.kind}`,
        kind,
        savedBy: row.person_name ?? "(unknown)",
      });
    }
  }
  return out;
}
