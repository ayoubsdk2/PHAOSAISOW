import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArchivedSOW } from "@/types/sow";
import { Archive, RotateCw } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  archives: ArchivedSOW[];
  onReactivate: (id: string, name: string) => void;
}

export const ArchiveDialog = ({ open, onClose, archives, onReactivate }: Props) => {
  const [reactivateId, setReactivateId] = useState<string | null>(null);
  const [name, setName] = useState("");

  useEffect(() => { if (!open) { setReactivateId(null); setName(""); } }, [open]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Archive className="h-4 w-4 text-primary" /> Archived SOWs</DialogTitle>
          <DialogDescription>Reactivate to continue editing as a new version.</DialogDescription>
        </DialogHeader>

        {archives.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No archived SOWs yet.</p>
        ) : (
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {archives.map((a) => {
              const isSaved = a.kind === "saved";
              const badgeClasses = isSaved
                ? "bg-destructive text-destructive-foreground"
                : "bg-success text-success-foreground";
              const cardClasses = isSaved
                ? "border-destructive/40 bg-destructive/5"
                : "border-success/40 bg-success/5";
              return (
                <div key={a.id} className={`flex items-center justify-between rounded-lg border p-3 ${cardClasses}`}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${badgeClasses}`}>
                        {isSaved ? "Saved" : "Submitted"}
                      </span>
                      <p className="font-medium">{a.state.companyName || "Untitled"}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {isSaved
                        ? `Saved: ${a.archivedAt}${a.savedBy ? ` by ${a.savedBy}` : ""} · v${a.state.version}`
                        : `Submitted: ${a.state.submittedAt ?? a.archivedAt} · v${a.state.version} · Archived: ${a.archivedAt}`}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setReactivateId(a.id)}>
                    <RotateCw className="h-3.5 w-3.5 mr-1" /> Reactivate
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {reactivateId && (
          <div className="rounded-lg border border-primary/40 bg-primary/5 p-3 space-y-2">
            <p className="text-sm">Enter your name to reactivate this SOW:</p>
            <input
              autoFocus
              className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => { setReactivateId(null); setName(""); }}>Cancel</Button>
              <Button size="sm" disabled={!name.trim()} onClick={() => { onReactivate(reactivateId, name.trim()); setReactivateId(null); setName(""); }}>
                Confirm Reactivate
              </Button>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
