import { useEffect, useMemo, useRef, useState } from "react";
import logo from "@/assets/phaos-logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eraser, Save, Send, Archive, ListChecks, Plus, Sparkles, CalendarDays, Download, ShieldCheck, LogOut, FolderOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { ContactBlock } from "@/components/sow/ContactBlock";
import { QuestionRow } from "@/components/sow/QuestionRow";
import { ClearDialog, NamePromptDialog, SubmitDialog, ActionsDialog, PasswordDialog } from "@/components/sow/Dialogs";
import { ArchiveDialog } from "@/components/sow/ArchiveDialog";
import { ExportDialog } from "@/components/sow/ExportDialog";
import { AdminLoginDialog } from "@/components/AdminLoginDialog";
import { QUESTIONS } from "@/data/questions";
import { ArchivedSOW, Contact, SOWState } from "@/types/sow";
import { formatDateShort, formatTimestamp, logEntry, uid } from "@/lib/sow-utils";
import { generateSOWPdf } from "@/lib/sow-pdf";
import { ARCHIVE_KEY, STORAGE_KEY, blankContact, createInitialSowState, hydrateSowState } from "@/lib/sow-state";
import { recordSnapshot, runOneTimeMigration } from "@/lib/snapshots";
import { adminLogout, fetchAllCloudArchives, isCurrentUserAdmin } from "@/lib/admin";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [state, setState] = useState<SOWState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return hydrateSowState(JSON.parse(raw));
    } catch {}
    return createInitialSowState();
  });
  const [archives, setArchives] = useState<ArchivedSOW[]>(() => {
    try {
      const raw = localStorage.getItem(ARCHIVE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  });

  const [showClear, setShowClear] = useState(false);
  const [showSave, setShowSave] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showArchiveGate, setShowArchiveGate] = useState(false);
  const [showArchiveList, setShowArchiveList] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [questionDisplayLimit, setQuestionDisplayLimit] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [cloudArchives, setCloudArchives] = useState<ArchivedSOW[]>([]);

  // Detect admin on mount + on auth changes
  useEffect(() => {
    isCurrentUserAdmin().then(setIsAdmin);
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      isCurrentUserAdmin().then(setIsAdmin);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Load all cloud archives whenever admin status flips on
  useEffect(() => {
    if (!isAdmin) { setCloudArchives([]); return; }
    fetchAllCloudArchives().then(setCloudArchives).catch((e) => console.warn(e));
  }, [isAdmin]);

  const handleAdminLogout = async () => {
    await adminLogout();
    setIsAdmin(false);
    toast.success("Signed out");
  };

  // SEO
  useEffect(() => {
    document.title = "Phaos AI — SOW Statement of Work Questionnaire";
    const desc = "Phaos AI Statement of Work questionnaire for inbound call answering deployment with SalesChain & e-automate.";
    let m = document.querySelector('meta[name="description"]');
    if (!m) { m = document.createElement("meta"); m.setAttribute("name", "description"); document.head.appendChild(m); }
    m.setAttribute("content", desc);
    let canon = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canon) { canon = document.createElement("link"); canon.rel = "canonical"; document.head.appendChild(canon); }
    canon.href = window.location.href;
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);
  useEffect(() => {
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archives));
  }, [archives]);

  // Push existing localStorage history into Cloud once
  useEffect(() => {
    runOneTimeMigration();
  }, []);

  // Auto-snapshot the in-progress SOW every 30s so nothing is ever lost
  const stateRef = useRef(state);
  stateRef.current = state;
  useEffect(() => {
    const id = window.setInterval(() => {
      const s = stateRef.current;
      const hasContent =
        s.companyName.trim() !== "" ||
        Object.values(s.answers).some((v) => String(v ?? "").trim() !== "");
      if (!hasContent) return;
      recordSnapshot({
        docType: "sow",
        kind: "auto",
        payload: s,
        companyName: s.companyName,
      });
    }, 30000);
    return () => window.clearInterval(id);
  }, []);

  const customerLabel = state.companyName.trim() || "Customer";

  const revealedQuestions = useMemo(() => {
    return QUESTIONS.filter((q) => {
      if (q.tier === 1) return true;
      if (q.tier === 2) return state.tier2Revealed;
      return state.tier3Revealed;
    });
  }, [state.tier2Revealed, state.tier3Revealed]);

  const displayedQuestions = useMemo(() => {
    if (!state.tier3Revealed) return revealedQuestions;

    const parsedLimit = Number.parseInt(questionDisplayLimit, 10);
    if (!Number.isFinite(parsedLimit) || parsedLimit <= 0) return revealedQuestions;

    return revealedQuestions.slice(0, Math.min(parsedLimit, revealedQuestions.length));
  }, [questionDisplayLimit, revealedQuestions, state.tier3Revealed]);

  const displayedQuestionEntries = displayedQuestions.map((question, index) => ({
    question,
    number: index + 1,
  }));

  const tier1Entries = displayedQuestionEntries.filter(({ question }) => question.tier === 1);
  const tier2Entries = displayedQuestionEntries.filter(({ question }) => question.tier === 2);
  const tier3Entries = displayedQuestionEntries.filter(({ question }) => question.tier === 3);

  const canSubmit =
    state.companyName.trim() !== "" &&
    state.contactsCustomer.some((c) => c.email.trim() !== "");

  const appendLog = (action: string, name: string) =>
    setState((s) => ({ ...s, actionLog: [...s.actionLog, logEntry(action, name)] }));

  const buildExportFilename = (companyName: string) => {
    const safeCompanyName = companyName
      .trim()
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return `SOW ${safeCompanyName || "Company"} Phaos AI.pdf`;
  };

  const handleDownloadExport = () => {
    try {
      const doc = generateSOWPdf(state, revealedQuestions);
      doc.save(buildExportFilename(state.companyName));
      setShowExport(false);
      toast.success("PDF downloaded");
    } catch (error) {
      console.error(error);
      toast.error("PDF export failed");
    }
  };

  const handleEmailExport = () => {
    try {
      const filename = buildExportFilename(state.companyName);
      const companyName = state.companyName.trim() || "Company";
      const doc = generateSOWPdf(state, revealedQuestions);

      doc.save(filename);
      window.location.href = `mailto:?subject=${encodeURIComponent(filename.replace(/\.pdf$/i, ""))}&body=${encodeURIComponent(`Please find attached the SOW PDF for ${companyName}.\n\nFilename: ${filename}`)}`;
      setShowExport(false);
      toast.success("PDF downloaded and email client opened");
    } catch (error) {
      console.error(error);
      toast.error("Email export failed");
    }
  };

  // Handlers
  const updateAnswer = (id: string, v: string) =>
    setState((s) => ({ ...s, answers: { ...s.answers, [id]: v } }));

  const updateContact = (which: "contactsCustomer" | "contactsPhaos", id: string, c: Contact) =>
    setState((s) => ({ ...s, [which]: s[which].map((x) => (x.id === id ? c : x)) }));

  const addContact = (which: "contactsCustomer" | "contactsPhaos") =>
    setState((s) => ({ ...s, [which]: [...s[which], blankContact()] }));

  const removeContact = (which: "contactsCustomer" | "contactsPhaos", id: string) =>
    setState((s) => ({ ...s, [which]: s[which].filter((x) => x.id !== id) }));

  const handleClearConfirmed = (name: string) => {
    recordSnapshot({ docType: "sow", kind: "clear", payload: state, personName: name, companyName: state.companyName });
    const log = [...state.actionLog, logEntry("CLEAR", name)];
    setState({ ...createInitialSowState(), actionLog: log, version: state.version, reactivationHistory: state.reactivationHistory });
    setShowClear(false);
    toast.success("Form cleared");
  };

  const handleSave = (name: string) => {
    const savedAt = formatTimestamp();
    const newState: SOWState = {
      ...state,
      actionLog: [...state.actionLog, logEntry("SAVE", name)],
    };
    setState(newState);
    setArchives((a) => [...a, { id: uid(), state: newState, archivedAt: savedAt, kind: "saved", savedBy: name }]);
    recordSnapshot({ docType: "sow", kind: "save", payload: newState, personName: name, companyName: newState.companyName });
    setShowSave(false);
    toast.success("Saved & added to archive");
  };

  const handleSubmit = async (name: string) => {
    const submittedAt = formatTimestamp();
    const newState: SOWState = {
      ...state,
      submitted: true,
      submittedAt,
      actionLog: [...state.actionLog, logEntry("SUBMIT", name)],
    };
    setState(newState);
    setArchives((a) => [...a, { id: uid(), state: newState, archivedAt: submittedAt, kind: "submitted", savedBy: name }]);
    recordSnapshot({ docType: "sow", kind: "submit", payload: newState, personName: name, companyName: newState.companyName });
    setShowSubmit(false);

    // Generate PDF
    try {
      const doc = generateSOWPdf(newState, revealedQuestions);
      const filename = buildExportFilename(newState.companyName);
      doc.save(filename);

      // Collect emails (deduped)
      const emails = Array.from(new Set([
        ...newState.contactsCustomer.map((c) => c.email.trim()).filter(Boolean),
        ...newState.contactsPhaos.map((c) => c.email.trim()).filter(Boolean),
      ]));
      toast.success(`Submitted. PDF generated. ${emails.length} recipient${emails.length === 1 ? "" : "s"} queued.`);
      console.info("[SOW] Email recipients:", emails);
    } catch (e) {
      console.error(e);
      toast.error("PDF generation failed");
    }
  };

  const handleArchive = (name: string) => {
    const archivedAt = formatTimestamp();
    const newState: SOWState = {
      ...state,
      archived: true,
      actionLog: [...state.actionLog, logEntry("ARCHIVE", name)],
    };
    setArchives((a) => [...a, { id: uid(), state: newState, archivedAt, kind: "submitted", savedBy: name }]);
    setState(newState);
    recordSnapshot({ docType: "sow", kind: "archive", payload: newState, personName: name, companyName: newState.companyName });
    setShowArchive(false);
    toast.success("Archived");
  };

  const handleReactivate = (id: string, name: string) => {
    const localHit = archives.find((a) => a.id === id);
    const cloudHit = !localHit ? cloudArchives.find((a) => a.id === id) : undefined;
    const archived = localHit ?? cloudHit;
    if (!archived) return;
    const newVersion = archived.state.version + 1;
    const event = { date: formatDateShort(), version: newVersion, by: name };
    const newState: SOWState = {
      ...archived.state,
      archived: false,
      version: newVersion,
      reactivationHistory: [...archived.state.reactivationHistory, event],
      actionLog: [...archived.state.actionLog, logEntry("REACTIVATE", name)],
    };
    setState(newState);
    if (localHit) setArchives((a) => a.filter((x) => x.id !== id));
    recordSnapshot({ docType: "sow", kind: "reactivate", payload: newState, personName: name, companyName: newState.companyName });
    setShowArchiveList(false);
    toast.success(`Reactivated as v${newVersion}`);
  };

  const autoGrowTextarea = (element: HTMLTextAreaElement, minHeight: number) => {
    element.style.height = "auto";
    element.style.height = `${Math.max(element.scrollHeight, minHeight)}px`;
  };

  const lastReactivation = state.reactivationHistory.at(-1);

  return (
    <div className="min-h-screen pb-32">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-header text-header-foreground border-b border-border/40 backdrop-blur supports-[backdrop-filter]:bg-header/95">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Phaos AI logo" className="h-10 w-auto" />
            <div>
              <h1 className="text-lg md:text-xl font-bold tracking-tight">SOW Statement of Work</h1>
              <p className="text-xs text-muted-foreground">Phaos AI — Inbound Call Answering Deployment</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              asChild
              size="lg"
              className="timeline-launch-button"
            >
              <Link to="/timeline">
                <CalendarDays className="h-5 w-5 mr-2" />
                TIMELINE
              </Link>
            </Button>
            {isAdmin ? (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-success/15 text-success px-3 py-1 text-xs font-semibold">
                  <ShieldCheck className="h-3.5 w-3.5" /> ADMIN
                </span>
                <Button size="sm" variant="outline" onClick={handleAdminLogout}>
                  <LogOut className="h-4 w-4 mr-1" /> Sign out
                </Button>
              </div>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setShowAdminLogin(true)}>
                <ShieldCheck className="h-4 w-4 mr-1" /> ADMIN
              </Button>
            )}
            <div className="text-right">
              {lastReactivation && (
                <p className="text-sm font-semibold text-destructive">
                  {lastReactivation.date}, v{state.version}
                </p>
              )}
              {state.submitted && !state.archived && (
                <span className="inline-block text-xs rounded bg-success/15 text-success px-2 py-0.5 mt-1">Submitted</span>
              )}
              {state.archived && (
                <span className="inline-block text-xs rounded bg-muted px-2 py-0.5 mt-1">Archived</span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-10">
        {/* Section 1 */}
        <section aria-labelledby="company-info">
          <h2 id="company-info" className="sr-only">Company information</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="pl-1">Company Name <span className="text-destructive">*</span></Label>
                <Input
                  value={state.companyName}
                  onChange={(e) => setState((s) => ({ ...s, companyName: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label className="pl-1">Location Address</Label>
                <Textarea
                  rows={2}
                  value={state.locationAddress}
                  onChange={(e) => setState((s) => ({ ...s, locationAddress: e.target.value }))}
                  onInput={(e) => autoGrowTextarea(e.currentTarget, 64)}
                  className="min-h-[64px] resize-none overflow-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label className="pl-1">Project Approved By</Label>
                <Input
                  value={state.approvedBy}
                  onChange={(e) => setState((s) => ({ ...s, approvedBy: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label className="pl-1">Approved Date</Label>
                <Input
                  value={state.projectApprovalDate}
                  onChange={(e) => setState((s) => ({ ...s, projectApprovalDate: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label className="pl-1">Target Go-Live Date</Label>
                <Input
                  value={state.targetGoLiveDate}
                  onChange={(e) => setState((s) => ({ ...s, targetGoLiveDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="pl-1">Project Deliverables</Label>
              <Textarea
                rows={1}
                value={state.projectDeliverables}
                onChange={(e) => setState((s) => ({ ...s, projectDeliverables: e.target.value }))}
                className="resize-none overflow-hidden min-h-[40px] w-full"
                onInput={(e) => autoGrowTextarea(e.currentTarget, 40)}
              />
            </div>
          </div>
        </section>

        {/* Section 2 */}
        <section aria-labelledby="contacts">
          <h2 id="contacts" className="sr-only">Main contacts</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer column */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <h3 className="text-base font-semibold brand-text">{customerLabel} Main Contacts</h3>
              <div className="space-y-3">
                {state.contactsCustomer.map((c, i) => (
                  <ContactBlock
                    key={c.id}
                    index={i}
                    contact={c}
                    onChange={(nc) => updateContact("contactsCustomer", c.id, nc)}
                    canRemove={state.contactsCustomer.length > 1}
                    onRemove={() => removeContact("contactsCustomer", c.id)}
                  />
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={() => addContact("contactsCustomer")}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Customer Contact
              </Button>
            </div>

            {/* Phaos column */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <h3 className="text-base font-semibold brand-text">Phaos AI Main Contacts</h3>
              <div className="space-y-3">
                {state.contactsPhaos.map((c, i) => (
                  <ContactBlock
                    key={c.id}
                    index={i}
                    contact={c}
                    onChange={(nc) => updateContact("contactsPhaos", c.id, nc)}
                    canRemove={state.contactsPhaos.length > 1}
                    onRemove={() => removeContact("contactsPhaos", c.id)}
                  />
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={() => addContact("contactsPhaos")}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Phaos Contact
              </Button>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section aria-labelledby="questionnaire">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 id="questionnaire" className="text-xl font-bold tracking-tight">SOW Questionnaire</h2>
          </div>

          <div className="space-y-3">
            {tier1Entries.map(({ question, number }) => (
              <QuestionRow
                key={question.id}
                question={question}
                index={number}
                value={state.answers[question.id] ?? ""}
                onChange={(v) => updateAnswer(question.id, v)}
              />
            ))}
          </div>

          {!state.tier2Revealed && (
            <div className="flex justify-center my-8">
              <Button
                size="lg"
                onClick={() => setState((s) => ({ ...s, tier2Revealed: true }))}
                className="bg-gradient-to-r from-primary to-primary-glow shadow-[var(--shadow-glow)]"
              >
                Reveal Additional Questions
              </Button>
            </div>
          )}

          {state.tier2Revealed && (
            <div className="space-y-3 mt-4">
              {tier2Entries.map(({ question, number }) => (
                <QuestionRow
                  key={question.id}
                  question={question}
                  index={number}
                  value={state.answers[question.id] ?? ""}
                  onChange={(v) => updateAnswer(question.id, v)}
                />
              ))}
            </div>
          )}

          {state.tier2Revealed && !state.tier3Revealed && (
            <div className="flex justify-center my-8">
              <Button
                size="lg"
                variant="outline"
                onClick={() => setState((s) => ({ ...s, tier3Revealed: true }))}
                className="border-primary/50"
              >
                Click Here To Reveal All The Questions
              </Button>
            </div>
          )}

          {state.tier3Revealed && (
            <div className="space-y-6 mt-4">
              <div className="space-y-3">
              {tier3Entries.map(({ question, number }) => (
                <QuestionRow
                  key={question.id}
                  question={question}
                  index={number}
                  value={state.answers[question.id] ?? ""}
                  onChange={(v) => updateAnswer(question.id, v)}
                />
              ))}
              </div>

              <div className="flex flex-col items-center justify-center gap-3 md:flex-row md:flex-wrap">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setQuestionDisplayLimit("")}
                  className="border-primary/50"
                >
                  Click Here To Reveal All The Questions
                </Button>

                <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 md:flex-row">
                  <Label htmlFor="question-display-limit" className="text-base font-medium">
                    Limit the number of questions displayed to
                  </Label>
                  <Input
                    id="question-display-limit"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={QUESTIONS.length}
                    value={questionDisplayLimit}
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/\D/g, "");
                      if (!digitsOnly) {
                        setQuestionDisplayLimit("");
                        return;
                      }

                      const parsedLimit = Math.min(Number.parseInt(digitsOnly, 10), QUESTIONS.length);
                      setQuestionDisplayLimit(parsedLimit > 0 ? String(parsedLimit) : "");
                    }}
                    className="h-10 w-24 text-base"
                  />
                </div>
              </div>
            </div>
          )}
        </section>

      </main>

      {/* Sticky footer action bar */}
      <footer className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card/95 backdrop-blur">
        <div className="container flex flex-wrap items-center justify-start gap-2 py-3">
          <Button variant="ghost" onClick={() => setShowClear(true)}>
            <Eraser className="h-4 w-4 mr-1" /> CLEAR
          </Button>
          <Button variant="secondary" onClick={() => setShowSave(true)}>
            <Save className="h-4 w-4 mr-1" /> SAVE
          </Button>
          <Button
            disabled={!canSubmit}
            onClick={() => setShowSubmit(true)}
            className="bg-gradient-to-r from-primary to-primary-glow"
          >
            <Send className="h-4 w-4 mr-1" /> SUBMIT
          </Button>
          <Button
            variant="outline"
            disabled={!state.submitted || state.archived}
            onClick={() => setShowArchive(true)}
          >
            <Archive className="h-4 w-4 mr-1" /> ARCHIVE
          </Button>
          <Button variant="ghost" onClick={() => setShowActions(true)}>
            <ListChecks className="h-4 w-4 mr-1" /> ACTIONS
          </Button>
          <Button onClick={() => setShowExport(true)}>
            <Download className="h-4 w-4 mr-1" /> EXPORT
          </Button>
          <Button
            variant={isAdmin ? "default" : "outline"}
            onClick={() => {
              if (isAdmin) {
                fetchAllCloudArchives().then(setCloudArchives).catch(() => {});
                setShowArchiveList(true);
              } else {
                setShowArchiveGate(true);
              }
            }}
          >
            <FolderOpen className="h-4 w-4 mr-1" />
            {isAdmin ? "ALL ARCHIVES" : "VIEW ARCHIVES"}
          </Button>
        </div>
      </footer>

      {/* Dialogs */}
      <ClearDialog open={showClear} onClose={() => setShowClear(false)} onConfirmed={handleClearConfirmed} />
      <NamePromptDialog
        open={showSave}
        title="Save SOW"
        description="Enter your name to log this save."
        confirmLabel="Save"
        onConfirm={handleSave}
        onCancel={() => setShowSave(false)}
      />
      <SubmitDialog open={showSubmit} onClose={() => setShowSubmit(false)} onSubmit={handleSubmit} />
      <NamePromptDialog
        open={showArchive}
        title="Archive SOW"
        description="Enter your name to archive this submitted SOW."
        confirmLabel="Archive"
        onConfirm={handleArchive}
        onCancel={() => setShowArchive(false)}
      />
      <PasswordDialog
        open={showArchiveGate}
        title="Archive Access"
        description="Enter the archive password to view archived SOWs."
        confirmLabel="Unlock Archive"
        onClose={() => setShowArchiveGate(false)}
        onUnlock={() => {
          setShowArchiveGate(false);
          setShowArchiveList(true);
        }}
      />
      <ActionsDialog open={showActions} onClose={() => setShowActions(false)} log={state.actionLog} />
      <ExportDialog
        open={showExport}
        onClose={() => setShowExport(false)}
        onDownload={handleDownloadExport}
        onEmail={handleEmailExport}
        fileName={buildExportFilename(state.companyName)}
      />
      <ArchiveDialog
        open={showArchiveList}
        onClose={() => setShowArchiveList(false)}
        archives={isAdmin ? [...archives, ...cloudArchives] : archives}
        onReactivate={handleReactivate}
      />
      <AdminLoginDialog
        open={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
        onLoggedIn={() => { setShowAdminLogin(false); isCurrentUserAdmin().then(setIsAdmin); }}
      />
    </div>
  );
};

export default Index;
