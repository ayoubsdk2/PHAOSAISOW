import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Contact } from "@/types/sow";

interface Props {
  contact: Contact;
  index: number;
  onChange: (c: Contact) => void;
  onRemove?: () => void;
  canRemove?: boolean;
}

export const ContactBlock = ({ contact, index, onChange, onRemove, canRemove }: Props) => {
  return (
    <div className="rounded-lg border border-border bg-secondary/40 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="pl-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Contact {index + 1}
        </span>
        {canRemove && (
          <Button variant="ghost" size="sm" onClick={onRemove} className="h-7 px-2 text-muted-foreground hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
      <Input
        placeholder="Contact Name"
        className="placeholder:text-muted-foreground/40"
        value={contact.name}
        onChange={(e) => onChange({ ...contact, name: e.target.value })}
      />
      <Input
        placeholder="Title"
        className="placeholder:text-muted-foreground/40"
        value={contact.title ?? ""}
        onChange={(e) => onChange({ ...contact, title: e.target.value })}
      />
      <Input
        type="email"
        placeholder="Email"
        className="placeholder:text-muted-foreground/40"
        value={contact.email}
        onChange={(e) => onChange({ ...contact, email: e.target.value })}
      />
      <Input
        placeholder="Phone"
        className="placeholder:text-muted-foreground/40"
        value={contact.phone}
        onChange={(e) => onChange({ ...contact, phone: e.target.value })}
      />
    </div>
  );
};
