/**
 * Design tokens transcribed from the CPH design handoff (design/README.md
 * "Design Tokens" section). Single source of truth for both the web
 * Tailwind config and the mobile app's theme.
 */
export const colors = {
  primary: "#1996C8",
  textDark: "#1A2027",
  textSecondary: "#5B6773",
  textMuted: "#8A96A3",
  border: "#E4E9EC",
  bgPage: "#EEF2F4",
  bgSurface: "#F7F9FA",
  success: "#25D366",
  error: "#D64545",
  aiAccent: "#7A56C8",
} as const;

export const radius = {
  card: "14px",
  control: "8px",
  pill: "999px",
} as const;

export const shadow = {
  floating: "0 4px 14px rgba(0,0,0,0.25)",
  panel: "0 12px 32px rgba(0,0,0,0.22)",
} as const;

export const fontFamily = {
  heading: "Poppins, sans-serif",
  body: "Inter, sans-serif",
} as const;

export const fontSize = {
  body: "13px",
  bodyLg: "14px",
  sectionTitle: "20px",
} as const;
