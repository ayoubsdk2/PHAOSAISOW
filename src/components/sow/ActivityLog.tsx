import { ScrollText } from "lucide-react";

export const ActivityLog = ({ entries }: { entries: string[] }) => {
  const reversed = [...entries].reverse();
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <ScrollText className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold uppercase tracking-wide">Activity Log</h3>
      </div>
      {reversed.length === 0 ? (
        <p className="text-sm text-muted-foreground">No activity yet.</p>
      ) : (
        <ul className="space-y-1 max-h-56 overflow-y-auto font-mono text-xs text-muted-foreground">
          {reversed.map((e, i) => (
            <li key={i} className="border-b border-border/40 py-1">{e}</li>
          ))}
        </ul>
      )}
    </div>
  );
};
