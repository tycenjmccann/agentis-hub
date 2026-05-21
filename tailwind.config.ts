import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          0: "#0a0a0f",
          1: "#12121a",
          2: "#1a1a25",
          3: "#222230",
          4: "#2a2a3a",
        },
        brand: {
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
        },
        "text-primary": "#f8f9fa",
        "text-secondary": "#d1d5db",
        "text-muted": "#9ca3af",
        status: {
          running: "#22c55e",
          stopped: "#9ca3af",
          error: "#ef4444",
          pending: "#f59e0b",
        },
      },
      animation: {
        "card-enter": "cardEnter 200ms ease-out forwards",
        "card-exit": "cardExit 150ms ease-in forwards",
      },
      keyframes: {
        cardEnter: {
          "0%": { opacity: "0", transform: "scale(0.95) translateY(8px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        cardExit: {
          "0%": { opacity: "1", transform: "scale(1) translateY(0)" },
          "100%": { opacity: "0", transform: "scale(0.95) translateY(8px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
