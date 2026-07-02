import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, LogOut, RefreshCcw, Search, Eye } from "lucide-react";

const ADMIN_EMAIL = "daniel@phaosai.com";

type Snapshot = {
  id: string;
  doc_type: string;
  kind: string;
  person_name: string | null;
  browser_id: string | null;
  company_name: string | null;
  payload: any;
  created_at: string;
};

const Admin = () => {
  const [authReady, setAuthReady] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // login form
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  // data
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");
  const [docFilter, setDocFilter] = useState<string>("all");
  const [view, setView] = useState<Snapshot | null>(null);

  useEffect(() => {
    document.title = "Phaos AI — Admin";

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s?.user) {
        checkAdmin();
      } else {
        setIsAdmin(false);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) checkAdmin();
      setAuthReady(true);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const checkAdmin = async () => {
    const { data, error } = await supabase.rpc("is_admin");
    if (error) {
      console.error(error);
      setIsAdmin(false);
      return;
    }
    setIsAdmin(Boolean(data));
  };

  useEffect(() => {
    if (isAdmin) loadSnapshots();
  }, [isAdmin]);

  const loadSnapshots = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("snapshots")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000);
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSnapshots((data ?? []) as Snapshot[]);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim().toLowerCase() !== ADMIN_EMAIL) {
      toast.error("This admin area is restricted.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast.success("Account created. You can sign in now.");
        setMode("login");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        toast.success("Signed in");
      }
    } catch (err: any) {
      toast.error(err.message ?? "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSnapshots([]);
  };

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return snapshots.filter((s) => {
      if (docFilter !== "all" && s.doc_type !== docFilter) return false;
      if (!q) return true;
      const blob = `${s.person_name ?? ""} ${s.company_name ?? ""} ${s.browser_id ?? ""} ${s.kind} ${s.doc_type}`.toLowerCase();
      return blob.includes(q);
    });
  }, [snapshots, filter, docFilter]);

  const kindBadge = (k: string) => {
    const map: Record<string, string> = {
      save: "bg-amber-500/15 text-amber-600 border-amber-500/30",
      submit: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
      archive: "bg-slate-500/15 text-slate-600 border-slate-500/30",
      clear: "bg-rose-500/15 text-rose-600 border-rose-500/30",
      auto: "bg-blue-500/15 text-blue-600 border-blue-500/30",
      timeline_save: "bg-purple-500/15 text-purple-600 border-purple-500/30",
      timeline_auto: "bg-indigo-500/15 text-indigo-600 border-indigo-500/30",
      timeline_recall: "bg-cyan-500/15 text-cyan-600 border-cyan-500/30",
      reactivate: "bg-pink-500/15 text-pink-600 border-pink-500/30",
      migration: "bg-yellow-500/15 text-yellow-700 border-yellow-500/30",
    };
    return map[k] ?? "bg-muted text-foreground border-border";
  };

  // ---- render ----
  if (!authReady) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  }

  if (!session || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-xs text-muted-foreground inline-flex items-center gap-1 hover:underline">
              <ArrowLeft className="h-3 w-3" /> Back
            </Link>
          </div>
          <div>
            <h1 className="text-xl font-bold">Admin Access</h1>
            <p className="text-sm text-muted-foreground">
              Restricted to <span className="font-medium">{ADMIN_EMAIL}</span>.
            </p>
          </div>

          {session && !isAdmin && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
              Signed in account is not an admin.
              <button onClick={signOut} className="block mt-2 underline">Sign out</button>
            </div>
          )}

          {!session && (
            <form onSubmit={handleAuth} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Working…" : mode === "login" ? "Sign in" : "Create admin account"}
              </Button>
              <button
                type="button"
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                className="w-full text-xs text-muted-foreground hover:underline"
              >
                {mode === "login" ? "First time? Create the admin account" : "Already have an account? Sign in"}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      <header className="sticky top-0 z-30 bg-header text-header-foreground border-b border-border/40 backdrop-blur">
        <div className="container flex items-center justify-between py-4 gap-3">
          <div>
            <h1 className="text-lg md:text-xl font-bold">Admin — All Activity</h1>
            <p className="text-xs text-muted-foreground">Every save, submit, archive, and auto-snapshot from every browser.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm"><Link to="/"><ArrowLeft className="h-4 w-4 mr-1" /> SOW</Link></Button>
            <Button asChild variant="outline" size="sm"><Link to="/timeline">Timeline</Link></Button>
            <Button onClick={loadSnapshots} variant="secondary" size="sm" disabled={loading}>
              <RefreshCcw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
            <Button onClick={signOut} variant="ghost" size="sm">
              <LogOut className="h-4 w-4 mr-1" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, company, browser, kind…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={docFilter}
            onChange={(e) => setDocFilter(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">All documents</option>
            <option value="sow">SOW</option>
            <option value="timeline">Timeline</option>
            <option value="sow_archive">Legacy archive</option>
            <option value="timeline_save_local">Legacy timeline saves</option>
          </select>
        </div>

        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-3 py-2">When</th>
                <th className="px-3 py-2">Doc</th>
                <th className="px-3 py-2">Kind</th>
                <th className="px-3 py-2">Person</th>
                <th className="px-3 py-2">Company</th>
                <th className="px-3 py-2">Browser</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">
                  {loading ? "Loading…" : "No activity yet."}
                </td></tr>
              )}
              {filtered.map((s) => (
                <tr key={s.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-3 py-2 whitespace-nowrap">{new Date(s.created_at).toLocaleString()}</td>
                  <td className="px-3 py-2">{s.doc_type}</td>
                  <td className="px-3 py-2">
                    <Badge variant="outline" className={kindBadge(s.kind)}>{s.kind}</Badge>
                  </td>
                  <td className="px-3 py-2">{s.person_name ?? <span className="text-muted-foreground">—</span>}</td>
                  <td className="px-3 py-2">{s.company_name ?? <span className="text-muted-foreground">—</span>}</td>
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{s.browser_id?.slice(0, 8) ?? "—"}</td>
                  <td className="px-3 py-2 text-right">
                    <Button size="sm" variant="ghost" onClick={() => setView(s)}>
                      <Eye className="h-4 w-4 mr-1" /> View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground">
          Showing {filtered.length} of {snapshots.length} snapshots (most recent 1000).
        </p>
      </main>

      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Snapshot details</DialogTitle>
            <DialogDescription>
              {view && `${view.doc_type} • ${view.kind} • ${new Date(view.created_at).toLocaleString()}`}
            </DialogDescription>
          </DialogHeader>
          <div className="text-xs space-y-2">
            <div><span className="text-muted-foreground">Person:</span> {view?.person_name ?? "—"}</div>
            <div><span className="text-muted-foreground">Company:</span> {view?.company_name ?? "—"}</div>
            <div><span className="text-muted-foreground">Browser:</span> <span className="font-mono">{view?.browser_id ?? "—"}</span></div>
          </div>
          <pre className="max-h-[60vh] overflow-auto rounded-md bg-muted p-3 text-xs">
{view ? JSON.stringify(view.payload, null, 2) : ""}
          </pre>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
