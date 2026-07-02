import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { UserPlus } from "lucide-react";
import { Contact, TimelineAssignee } from "@/types/sow";

interface Props {
  customerLabel: string;
  customerContacts: Contact[];
  phaosContacts: Contact[];
  assignees: TimelineAssignee[];
  onChange: (next: TimelineAssignee[]) => void;
  triggerClassName?: string;
}

const initialsOf = (name: string) => {
  const clean = name.trim();
  if (!clean) return "?";
  const parts = clean.split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || clean[0].toUpperCase();
};

export const AssigneePicker = ({
  customerLabel,
  customerContacts,
  phaosContacts,
  assignees,
  onChange,
  triggerClassName,
}: Props) => {
  const [open, setOpen] = useState(false);
  const isSelected = (id: string) => assignees.some((a) => a.id === id);

  const toggle = (c: Contact, side: "customer" | "phaos") => {
    if (isSelected(c.id)) {
      onChange(assignees.filter((a) => a.id !== c.id));
    } else {
      onChange([...assignees, { id: c.id, name: c.name || "Unnamed", side }]);
    }
  };

  const renderGroup = (label: string, list: Contact[], side: "customer" | "phaos") => (
    <div className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground px-1">{label}</p>
      {list.length === 0 || list.every((c) => !c.name.trim()) ? (
        <p className="text-xs text-muted-foreground/70 px-1 italic">No contacts added.</p>
      ) : (
        list
          .filter((c) => c.name.trim() || c.email.trim())
          .map((c) => (
            <label
              key={c.id}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-secondary/60 cursor-pointer text-sm"
            >
              <Checkbox checked={isSelected(c.id)} onCheckedChange={() => toggle(c, side)} />
              <span className="flex-1 truncate">{c.name || c.email || "Unnamed"}</span>
            </label>
          ))
      )}
    </div>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`border-primary/40 hover:border-primary hover:bg-primary/10 ${triggerClassName ?? ""}`}
        >
          {assignees.length === 0 ? (
            <>
              <UserPlus className="h-3.5 w-3.5 mr-1.5" />
              Assigned To
            </>
          ) : (
            <div className="grid grid-cols-5 gap-1 w-full py-1">
              {assignees.map((a) => (
                <span
                  key={a.id}
                  title={a.name}
                  className="inline-flex items-center justify-center h-7 w-7 rounded-full text-[10px] font-bold bg-primary text-primary-foreground border-2 border-primary mx-auto"
                >
                  {initialsOf(a.name)}
                </span>
              ))}
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3 space-y-3" align="end">
        {renderGroup(`${customerLabel} Contacts`, customerContacts, "customer")}
        {renderGroup("Phaos AI Contacts", phaosContacts, "phaos")}
      </PopoverContent>
    </Popover>
  );
};
