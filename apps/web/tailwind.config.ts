import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/shared/src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        surface: "#f8f4ec",
        ink: "#1f2937",
        accent: "#c2643f",
        accentDark: "#8c3d20",
        steel: "#4b6478",
        panel: "#fffdf8",
        line: "#d8d1c3",
        success: "#22543d",
        warning: "#9a6b18"
      },
      boxShadow: {
        panel: "0 20px 50px rgba(31, 41, 55, 0.08)"
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"]
      }
    }
  },
  plugins: []
};

export default config;

