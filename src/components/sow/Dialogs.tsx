import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface NamePromptProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: (name: string) => void;
  onCancel: () => void;
}

export const NamePromptDialog = ({ open, title, description, confirmLabel = "Confirm", onConfirm, onCancel }: NamePromptProps) => {
  const [name, setName] = useState("");
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="space-y-2">
          <Label>Your Name</Label>
          <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => { setName(""); onCancel(); }}>Cancel</Button>
          <Button
            disabled={!name.trim()}
            onClick={() => { const n = name.trim(); setName(""); onConfirm(n); }}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface ClearProps {
  open: boolean;
  onClose: () => void;
  onConfirmed: (name: string) => void;
}

export const ClearDialog = ({ open, onClose, onConfirmed }: ClearProps) => {
  const [step, setStep] = useState<"confirm" | "name">("confirm");
  const [typed, setTyped] = useState("");
  const [name, setName] = useState("");

  const reset = () => { setStep("confirm"); setTyped(""); setName(""); };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { reset(); onClose(); } }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Clear all answers?</DialogTitle>
          <DialogDescription>
            This will delete all answers in this form. To confirm, type <span className="font-mono font-bold text-destructive">CLEAR</span> in ALL CAPS.
          </DialogDescription>
        </DialogHeader>

        {step === "confirm" ? (
          <>
            <Input autoFocus value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="Type CLEAR" />
            <DialogFooter>
              <Button variant="ghost" onClick={() => { reset(); onClose(); }}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (typed === "CLEAR") setStep("name");
                  else { reset(); onClose(); }
                }}
              >
                Continue
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label>Your Name</Label>
              <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => { reset(); onClose(); }}>Cancel</Button>
              <Button
                variant="destructive"
                disabled={!name.trim()}
                onClick={() => { const n = name.trim(); reset(); onConfirmed(n); }}
              >
                Clear Form
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

interface SubmitProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
}

export const SubmitDialog = ({ open, onClose, onSubmit }: SubmitProps) => {
  const [step, setStep] = useState<"password" | "name">("password");
  const [pw, setPw] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const reset = () => { setStep("password"); setPw(""); setName(""); setError(""); };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { reset(); onClose(); } }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit SOW</DialogTitle>
          <DialogDescription>
            {step === "password"
              ? "To submit this SOW, enter the submission password."
              : "Enter your name to finalize submission."}
          </DialogDescription>
        </DialogHeader>

        {step === "password" ? (
          <div className="space-y-2">
            <Label>Submission Password</Label>
            <Input autoFocus type="password" value={pw} onChange={(e) => { setPw(e.target.value); setError(""); }} />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        ) : (
          <div className="space-y-2">
            <Label>Your Name</Label>
            <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => { reset(); onClose(); }}>Cancel</Button>
          {step === "password" ? (
            <Button
              onClick={() => {
                if (pw === "onlyjesus") { setError(""); setStep("name"); }
                else setError("Incorrect password. You cannot submit this SOW.");
              }}
            >
              Continue
            </Button>
          ) : (
            <Button
              disabled={!name.trim()}
              onClick={() => { const n = name.trim(); reset(); onSubmit(n); }}
            >
              Submit
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface PasswordDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  onClose: () => void;
  onUnlock: () => void;
}

export const PasswordDialog = ({
  open,
  title,
  description,
  confirmLabel = "Continue",
  onClose,
  onUnlock,
}: PasswordDialogProps) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const reset = () => {
    setPassword("");
    setError("");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { reset(); onClose(); } }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="space-y-2">
          <Label>Password</Label>
          <Input
            autoFocus
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            placeholder="Enter password"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => { reset(); onClose(); }}>Cancel</Button>
          <Button
            onClick={() => {
              if (password === "onlyjesus") {
                reset();
                onUnlock();
                return;
              }

              setError("Incorrect password. Archive access is locked.");
            }}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface ActionsProps {
  open: boolean;
  onClose: () => void;
  log: string[];
}

export const ActionsDialog = ({ open, onClose, log }: ActionsProps) => {
  const reversed = [...log].reverse();
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Activity Log</DialogTitle>
          <DialogDescription>Full timestamped audit trail.</DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto rounded-md border border-border bg-secondary/40 p-3">
          {reversed.length === 0 ? (
            <p className="text-sm text-muted-foreground">No actions logged yet.</p>
          ) : (
            <ul className="space-y-1 font-mono text-xs">
              {reversed.map((l, i) => <li key={i}>{l}</li>)}
            </ul>
          )}
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
