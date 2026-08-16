/**
 * Palette/radius/shadow values mirror packages/ui-tokens/src/index.ts
 * (itself transcribed from design/README.md "Design Tokens"). Kept as
 * literals here because Tailwind's config loader runs before the
 * workspace package is built.
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1996C8",
        "text-dark": "#1A2027",
        "text-secondary": "#5B6773",
        "text-muted": "#8A96A3",
        border: "#E4E9EC",
        "bg-page": "#EEF2F4",
        "bg-surface": "#F7F9FA",
        success: "#25D366",
        error: "#D64545",
        "ai-accent": "#7A56C8",
      },
      fontFamily: {
        heading: ["var(--font-poppins)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        card: "14px",
        control: "8px",
      },
      boxShadow: {
        floating: "0 4px 14px rgba(0,0,0,0.25)",
        panel: "0 12px 32px rgba(0,0,0,0.22)",
      },
    },
  },
  plugins: [],
};
