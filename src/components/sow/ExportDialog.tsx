import { Download, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  onDownload: () => void;
  onEmail: () => void;
  fileName: string;
}

export const ExportDialog = ({
  open,
  onClose,
  onDownload,
  onEmail,
  fileName,
}: ExportDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export SOW</DialogTitle>
          <DialogDescription>
            Download your PDF or open your email client with {fileName} ready to share.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <Button onClick={onDownload} className="w-full justify-start">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
          <Button variant="outline" onClick={onEmail} className="w-full justify-start">
            <Mail className="h-4 w-4" />
            Email PDF
          </Button>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};