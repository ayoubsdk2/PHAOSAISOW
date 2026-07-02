export function formatTimestamp(d: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const yyyy = d.getFullYear();
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  return `${mm}/${dd}/${yyyy} ${hh}:${mi}:${ss}`;
}

export function formatDateShort(d: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()}`;
}

export function logEntry(action: string, name: string): string {
  return `[${formatTimestamp()}] - ${action} by ${name}`;
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}
