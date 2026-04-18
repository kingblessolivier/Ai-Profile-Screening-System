export const COLORS = {
  primary: {
    DEFAULT: "#2563eb",
    hover: "#1d4ed8",
    light: "#eff6ff",
    border: "#bfdbfe",
  },
  ai: {
    DEFAULT: "#0284c7",
    hover: "#099ded",
    light: "#f0f9ff",
    border: "#bae6fd",
  },
  success: {
    DEFAULT: "#059669",
    light: "#ecfdf5",
    border: "#a7f3d0",
  },
  warning: {
    DEFAULT: "#d97706",
    light: "#fffbeb",
    border: "#fde68a",
  },
  error: {
    DEFAULT: "#dc2626",
    light: "#fef2f2",
    border: "#fecaca",
  },
  info: {
    DEFAULT: "#64748b",
  },
} as const;

export const LEVEL_STYLES = {
  Junior: { bg: "#ecfdf5", text: "#059669" },
  "Mid-level": { bg: "#eff6ff", text: "#2563eb" },
  Senior: { bg: "#eff6ff", text: "#1d4ed8" },
  Lead: { bg: "#fffbeb", text: "#d97706" },
} as const;

export const TYPE_STYLES = {
  "Full-time": { bg: "#f0fdf4", text: "#16a34a" },
  "Part-time": { bg: "#fefce8", text: "#ca8a04" },
  Contract: { bg: "#fdf4ff", text: "#a21caf" },
} as const;

export const RECOMMENDATION_STYLES = {
  "Strongly Recommended": { bg: "#ecfdf5", text: "#059669", label: "Strongly Rec." },
  Recommended: { bg: "#eff6ff", text: "#2563eb", label: "Recommended" },
  Consider: { bg: "#fffbeb", text: "#d97706", label: "Consider" },
  "Not Recommended": { bg: "#f8fafc", text: "#94a3b8", label: "Not Rec." },
} as const;

export const SOURCE_STYLES = {
  platform: { bg: "#eff6ff", text: "#2563eb", label: "Manual" },
  csv: { bg: "#fffbeb", text: "#d97706", label: "CSV" },
  pdf: { bg: "#f0f9ff", text: "#0284c7", label: "PDF" },
} as const;

export const AVAILABILITY_COLORS = {
  Available: "#059669",
  "Open to Opportunities": "#d97706",
  "Not Available": "#94a3b8",
} as const;

export function getScoreColor(score: number): { bg: string; text: string } {
  if (score >= 80) return { bg: "#ecfdf5", text: "#059669" };
  if (score >= 60) return { bg: "#eff6ff", text: "#2563eb" };
  if (score >= 40) return { bg: "#fffbeb", text: "#d97706" };
  return { bg: "#fef2f2", text: "#ef4444" };
}

export function getLevelStyle(level: string) {
  return LEVEL_STYLES[level as keyof typeof LEVEL_STYLES] || { bg: "#f8fafc", text: "#64748b" };
}

export function getTypeStyle(type: string) {
  return TYPE_STYLES[type as keyof typeof TYPE_STYLES] || { bg: "#f8fafc", text: "#64748b" };
}

export function getRecommendationStyle(recommendation: string) {
  return (
    RECOMMENDATION_STYLES[recommendation as keyof typeof RECOMMENDATION_STYLES] || {
      bg: "#f8fafc",
      text: "#94a3b8",
      label: recommendation,
    }
  );
}

export function getSourceStyle(source: string) {
  return SOURCE_STYLES[source as keyof typeof SOURCE_STYLES] || SOURCE_STYLES.platform;
}
