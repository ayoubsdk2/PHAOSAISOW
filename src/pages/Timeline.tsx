import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CalendarDays, History, Redo2, Save, Undo2 } from "lucide-react";
import logo from "@/assets/phaos-logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SOWState, TimelineMilestone } from "@/types/sow";
import { buildDefaultTimeline } from "@/data/timeline";
import { AssigneePicker } from "@/components/sow/AssigneePicker";
import { toast } from "sonner";
import { STORAGE_KEY, createInitialSowState, hydrateSowState } from "@/lib/sow-state";
import { uid } from "@/lib/sow-utils";
import { recordSnapshot, runOneTimeMigration } from "@/lib/snapshots";

const TIMELINE_SAVES_KEY = "phaos-timeline-saves-v1";

interface TimelineSave {
  id: string;
  savedAt: string; // ISO
  savedBy: string;
  milestones: TimelineMilestone[];
}

const Timeline = () => {
  const [state, setState] = useState<SOWState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return hydrateSowState(JSON.parse(raw));
    } catch {}
    return createInitialSowState();
  });

  // Undo / redo history of the timeline only
  const milestonesNow = useMemo(
    () => state.timeline ?? buildDefaultTimeline(),
    [state.timeline],
  );
  const [history, setHistory] = useState<TimelineMilestone[][]>(() => [milestonesNow]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const skipHistoryRef = useRef(false);

  // Saved versions
  const [saves, setSaves] = useState<TimelineSave[]>(() => {
    try {
      const raw = localStorage.getItem(TIMELINE_SAVES_KEY);
      if (raw) return JSON.parse(raw) as TimelineSave[];
    } catch {}
    return [];
  });

  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saverName, setSaverName] = useState("");
  const [recallOpen, setRecallOpen] = useState(false);

  useEffect(() => {
    document.title = "Phaos AI — Project Timeline";
    runOneTimeMigration();
  }, []);

  // Auto-snapshot timeline edits every 30s
  const milestonesRef = useRef<TimelineMilestone[]>(milestonesNow);
  milestonesRef.current = milestonesNow;
  useEffect(() => {
    const id = window.setInterval(() => {
      recordSnapshot({
        docType: "timeline",
        kind: "timeline_auto",
        payload: { milestones: milestonesRef.current, companyName: state.companyName },
        companyName: state.companyName,
      });
    }, 30000);
    return () => window.clearInterval(id);
  }, [state.companyName]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  useEffect(() => {
    try {
      localStorage.setItem(TIMELINE_SAVES_KEY, JSON.stringify(saves));
    } catch {}
  }, [saves]);

  // Track history when timeline changes
  useEffect(() => {
    if (skipHistoryRef.current) {
      skipHistoryRef.current = false;
      return;
    }
    setHistory((prev) => {
      const trimmed = prev.slice(0, historyIndex + 1);
      // Avoid duplicate consecutive snapshots
      const last = trimmed[trimmed.length - 1];
      if (last && JSON.stringify(last) === JSON.stringify(milestonesNow)) {
        return prev;
      }
      const next = [...trimmed, milestonesNow];
      // cap history at 50
      const capped = next.slice(-50);
      setHistoryIndex(capped.length - 1);
      return capped;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [milestonesNow]);

  const milestones = milestonesNow;

  const setMilestones = (next: TimelineMilestone[]) => {
    setState((current) => ({ ...current, timeline: next }));
  };

  const updateMilestone = (id: string, updater: (m: TimelineMilestone) => TimelineMilestone) => {
    setMilestones(milestones.map((m) => (m.id === id ? updater(m) : m)));
  };

  const updateField = <K extends keyof TimelineMilestone>(
    id: string,
    field: K,
    value: TimelineMilestone[K],
  ) => updateMilestone(id, (m) => ({ ...m, [field]: value }));

  const undo = () => {
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    skipHistoryRef.current = true;
    setHistoryIndex(newIndex);
    setState((current) => ({ ...current, timeline: history[newIndex] }));
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    skipHistoryRef.current = true;
    setHistoryIndex(newIndex);
    setState((current) => ({ ...current, timeline: history[newIndex] }));
  };

  const openSaveDialog = () => {
    setSaverName("");
    setSaveDialogOpen(true);
  };

  const confirmSave = () => {
    const name = saverName.trim();
    if (!name) {
      toast.error("Please enter your full name to save.");
      return;
    }
    const milestonesCopy = JSON.parse(JSON.stringify(milestones));
    const entry: TimelineSave = {
      id: uid(),
      savedAt: new Date().toISOString(),
      savedBy: name,
      milestones: milestonesCopy,
    };
    setSaves((prev) => [entry, ...prev]);
    recordSnapshot({
      docType: "timeline",
      kind: "timeline_save",
      payload: { milestones: milestonesCopy, companyName: state.companyName },
      personName: name,
      companyName: state.companyName,
    });
    setSaveDialogOpen(false);
    toast.success(`Timeline saved by ${name}`);
  };

  const recallVersion = (saveId: string) => {
    const found = saves.find((s) => s.id === saveId);
    if (!found) return;
    setMilestones(JSON.parse(JSON.stringify(found.milestones)));
    setRecallOpen(false);
    toast.success(`Recalled version saved by ${found.savedBy}`);
  };

  const deleteSave = (saveId: string) => {
    setSaves((prev) => prev.filter((s) => s.id !== saveId));
  };

  const customerLabel = state.companyName.trim() || "Customer";
  const customerContacts = state.contactsCustomer ?? [];
  const phaosContacts = state.contactsPhaos ?? [];

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <div className="min-h-screen pb-10">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-header text-header-foreground border-b border-border/40 backdrop-blur supports-[backdrop-filter]:bg-header/95">
        <div className="container flex items-center justify-between py-3 gap-3">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Phaos AI logo" className="h-9 w-auto" />
            <div>
              <h1 className="text-base md:text-lg font-bold tracking-tight flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                Project Timeline
              </h1>
              <p className="text-xs text-muted-foreground">
                {customerLabel} — Phaos AI Inbound Call Agent · Go-Live July 1st
              </p>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center px-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={undo}
                disabled={!canUndo}
                title="Undo"
                aria-label="Undo"
              >
                <Undo2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={redo}
                disabled={!canRedo}
                title="Redo"
                aria-label="Redo"
              >
                <Redo2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <h2 className="text-lg md:text-2xl font-extrabold tracking-tight text-white whitespace-nowrap px-4 -translate-x-[1.25em]">
            Project Execution <span className="opacity-60 mx-1">|</span> 7 Phase SOW
          </h2>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={openSaveDialog}>
              <Save className="h-4 w-4 mr-1" /> Save
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setRecallOpen(true)}>
              <History className="h-4 w-4 mr-1" /> Recall
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to SOW
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-4 space-y-3">

        {/* Vertical stack of horizontal phase rows — fits page, no scroll */}
        <div className="space-y-2">
          {milestones.map((m, i) => {
            return (
              <article
                key={m.id}
                data-tone="dark"
                className="timeline-card rounded-xl border px-3 py-2 shadow-[var(--shadow-elegant)] md:mx-auto md:w-full md:max-w-[1100px]"
                style={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  color: "hsl(var(--foreground))",
                }}
              >
                <div className="grid gap-2 md:grid-cols-[40px_minmax(0,2fr)_minmax(0,6fr)_minmax(0,2fr)] md:items-start">
                  {/* Step number — white circle, white number */}
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black text-white"
                    style={{
                      borderColor: "#ffffff",
                      borderWidth: 2,
                    }}
                  >
                    {i + 1}
                  </div>

                  {/* Phase + timing */}
                  <div className="min-w-0 space-y-1">
                    <Input
                      value={m.phase}
                      onChange={(e) => updateField(m.id, "phase", e.target.value)}
                      className="timeline-field h-7 w-full rounded-md border-0 bg-transparent px-2 text-xs font-bold uppercase tracking-wider"
                      style={{ color: "hsl(var(--brand-deep))" }}
                      placeholder="Phase"
                    />
                    <Input
                      value={m.weeks}
                      onChange={(e) => updateField(m.id, "weeks", e.target.value)}
                      className="timeline-field h-7 w-full rounded-md border-0 bg-transparent px-2 text-xs text-white"
                      placeholder="Weeks"
                    />
                    <Input
                      value={m.dateRange}
                      onChange={(e) => updateField(m.id, "dateRange", e.target.value)}
                      className="timeline-field h-7 w-full rounded-md border-0 bg-transparent px-2 text-xs text-white"
                      placeholder="Dates"
                    />
                  </div>

                  {/* Title + Overview */}
                  <div className="min-w-0 space-y-1">
                    <Input
                      value={m.title}
                      onChange={(e) => updateField(m.id, "title", e.target.value)}
                      className="timeline-field h-8 w-full rounded-md border-0 bg-transparent px-2 text-base font-extrabold"
                      style={{ color: "hsl(var(--primary))" }}
                      placeholder="Milestone title"
                    />
                    <Textarea
                      value={m.description}
                      onChange={(e) => updateField(m.id, "description", e.target.value)}
                      rows={2}
                      onInput={(e) => {
                        const el = e.currentTarget;
                        el.style.height = "auto";
                        el.style.height = `${Math.max(el.scrollHeight, 52)}px`;
                      }}
                      className="timeline-field w-full min-h-[52px] resize-none overflow-hidden rounded-md border-0 bg-transparent px-2 py-1 text-xs leading-snug text-white"
                      placeholder="Overview"
                    />
                  </div>

                  {/* Assigned To */}
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-widest mb-1 text-white">
                      Assigned To
                    </p>
                    <AssigneePicker
                      customerLabel={customerLabel}
                      customerContacts={customerContacts}
                      phaosContacts={phaosContacts}
                      assignees={m.assignees}
                      onChange={(next) => updateField(m.id, "assignees", next)}
                      triggerClassName="w-full justify-start rounded-md border-primary/40 bg-transparent text-white hover:bg-primary/10 min-h-8 h-auto text-xs"
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </main>

      {/* Save dialog — requires full name */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Save Timeline Version</DialogTitle>
            <DialogDescription>
              Enter your full name to save this version of the timeline. You can recall it later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Full Name
            </label>
            <Input
              value={saverName}
              onChange={(e) => setSaverName(e.target.value)}
              placeholder="e.g. Jane Doe"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmSave();
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmSave}>
              <Save className="h-4 w-4 mr-1" /> Save Version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recall dialog */}
      <Dialog open={recallOpen} onOpenChange={setRecallOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Recall Saved Timeline</DialogTitle>
            <DialogDescription>
              Choose a previously saved version to restore. Current unsaved changes will be replaced.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[50vh] overflow-y-auto space-y-2 pr-1">
            {saves.length === 0 ? (
              <p className="text-sm text-muted-foreground italic text-center py-6">
                No saved versions yet.
              </p>
            ) : (
              saves.map((s) => {
                const dt = new Date(s.savedAt);
                return (
                  <div
                    key={s.id}
                    className="flex items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{s.savedBy}</p>
                      <p className="text-xs text-muted-foreground">
                        {dt.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button size="sm" onClick={() => recallVersion(s.id)}>
                        Recall
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSave(s.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRecallOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Timeline;
