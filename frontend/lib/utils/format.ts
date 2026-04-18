export function formatDate(date: string | Date, format: "short" | "long" | "relative" = "short"): string {
  const d = typeof date === "string" ? new Date(date) : date;

  if (format === "short") {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  if (format === "long") {
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  }

  if (format === "relative") {
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  return d.toLocaleDateString();
}

export function formatNumber(num: number, compact = false): string {
  if (compact) {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toLocaleString();
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }
  return `${seconds}s`;
}

export function truncateText(text: string, maxLength: number, mode: "end" | "middle" = "end"): string {
  if (text.length <= maxLength) return text;

  if (mode === "middle") {
    const half = Math.floor(maxLength / 2);
    return `${text.slice(0, half)}...${text.slice(-half)}`;
  }

  return `${text.slice(0, maxLength)}...`;
}

export function pluralize(count: number, singular: string, plural?: string): string {
  if (count === 1) return `${count} ${singular}`;
  return `${count} ${plural || `${singular}s`}`;
}

export function initials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
