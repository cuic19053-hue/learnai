import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Legacy aliases (kept for existing routes that already use them).
        primary: "#2e5bff",
        secondary: "#7c3aed",
        accent: "#10B981",
        dark: "#0f1430",
        // Design system tokens, mirrored from globals.css :root vars.
        brand: {
          1: "#2e5bff",
          2: "#7c3aed",
        },
        ink: {
          DEFAULT: "#0f1430",
          soft: "#4a5070",
          mute: "#7c83a3",
          faint: "#aeb3cc",
        },
        surface: {
          DEFAULT: "#ffffff",
          soft: "#f8f9ff",
        },
        line: {
          DEFAULT: "#e6e8f5",
          soft: "#eef0fa",
        },
        // Journey accents
        little: { DEFAULT: "#2dbb6c", bg: "#e7f8ee", soft: "#f3fbf5" },
        explorer: { DEFAULT: "#2e5bff", bg: "#e6ecff", soft: "#f3f6ff" },
        builder: { DEFAULT: "#7c3aed", bg: "#efe7ff", soft: "#f7f3ff" },
        scholar: { DEFAULT: "#f59e0b", bg: "#fff1d6", soft: "#fff8e9" },
        pro: { DEFAULT: "#0ea5a4", bg: "#d6f1f0", soft: "#e9f8f7" },
        senior: { DEFAULT: "#ec4899", bg: "#fce0ec", soft: "#fcedf3" },
      },
      fontFamily: {
        sans: [
          "var(--font-jakarta)",
          "Plus Jakarta Sans",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "var(--font-mono)",
          "Geist Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
      backgroundImage: {
        "brand-grad": "linear-gradient(135deg, #2e5bff 0%, #7c3aed 100%)",
        "brand-grad-soft": "linear-gradient(135deg, #e8eeff 0%, #f0e9ff 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
