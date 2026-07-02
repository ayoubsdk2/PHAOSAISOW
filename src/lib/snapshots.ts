import { supabase } from "@/integrations/supabase/client";

const BROWSER_ID_KEY = "phaos-browser-id-v1";
const MIGRATION_DONE_KEY = "phaos-cloud-migrated-v3";

export function getBrowserId(): string {
  try {
    let id = localStorage.getItem(BROWSER_ID_KEY);
    if (!id) {
      id = (crypto as any)?.randomUUID?.() ?? `b-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(BROWSER_ID_KEY, id);
    }
    return id;
  } catch {
    return "anonymous";
  }
}

export type SnapshotKind =
  | "save"
  | "submit"
  | "archive"
  | "clear"
  | "auto"
  | "migration"
  | "timeline_save"
  | "timeline_auto"
  | "timeline_recall"
  | "reactivate";

export type SnapshotDocType = "sow" | "timeline" | "sow_archive" | "timeline_save_local";

export async function recordSnapshot(args: {
  docType: SnapshotDocType;
  kind: SnapshotKind;
  payload: unknown;
  personName?: string;
  companyName?: string;
}) {
  try {
    await supabase.from("snapshots").insert({
      doc_type: args.docType,
      kind: args.kind,
      person_name: args.personName ?? null,
      browser_id: getBrowserId(),
      company_name: args.companyName ?? null,
      payload: args.payload as any,
    });
  } catch (e) {
    // Never break the user flow if logging fails
    console.warn("[snapshot] failed", e);
  }
}

/** One-time migration of existing localStorage so nothing is lost. */
export async function runOneTimeMigration() {
  try {
    if (localStorage.getItem(MIGRATION_DONE_KEY)) return;

    const sowRaw = localStorage.getItem("phaos-sow-v1");
    const archiveRaw = localStorage.getItem("phaos-archive-v1");
    const timelineSavesRaw = localStorage.getItem("phaos-timeline-saves-v1");

    const tasks: Promise<unknown>[] = [];

    if (sowRaw) {
      try {
        const parsed = JSON.parse(sowRaw);
        tasks.push(
          recordSnapshot({
            docType: "sow",
            kind: "migration",
            payload: parsed,
            personName: "(legacy import)",
            companyName: parsed?.companyName,
          }),
        );
      } catch {}
    }
    if (archiveRaw) {
      try {
        const parsed = JSON.parse(archiveRaw);
        tasks.push(
          recordSnapshot({
            docType: "sow_archive",
            kind: "migration",
            payload: parsed,
            personName: "(legacy import)",
          }),
        );
      } catch {}
    }
    if (timelineSavesRaw) {
      try {
        const parsed = JSON.parse(timelineSavesRaw);
        tasks.push(
          recordSnapshot({
            docType: "timeline_save_local",
            kind: "migration",
            payload: parsed,
            personName: "(legacy import)",
          }),
        );
      } catch {}
    }

    // Catch-all: dump every localStorage key so absolutely nothing is lost,
    // even keys we don't know about (older versions, experimental features).
    // SECURITY: skip auth/session tokens — never upload credentials to the DB.
    const isSensitiveKey = (k: string) => {
      const lk = k.toLowerCase();
      return (
        lk === MIGRATION_DONE_KEY.toLowerCase() ||
        lk === BROWSER_ID_KEY.toLowerCase() ||
        lk.includes("auth-token") ||
        lk.includes("auth.token") ||
        lk.startsWith("sb-") ||
        lk.startsWith("supabase.auth") ||
        lk.includes("access_token") ||
        lk.includes("refresh_token") ||
        lk.includes("session") ||
        lk.includes("password") ||
        lk.includes("secret") ||
        lk.includes("apikey") ||
        lk.includes("api_key")
      );
    };
    try {
      const dump: Record<string, unknown> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k) continue;
        if (isSensitiveKey(k)) continue;
        const v = localStorage.getItem(k);
        try { dump[k] = v ? JSON.parse(v) : v; } catch { dump[k] = v; }
      }
      if (Object.keys(dump).length > 0) {
        tasks.push(
          recordSnapshot({
            docType: "sow",
            kind: "migration",
            payload: { __fullLocalStorageDump: true, keys: Object.keys(dump), data: dump },
            personName: "(full localStorage dump)",
          }),
        );
      }
    } catch {}

    await Promise.all(tasks);
    localStorage.setItem(MIGRATION_DONE_KEY, new Date().toISOString());
  } catch (e) {
    console.warn("[snapshot] migration failed", e);
  }
}
