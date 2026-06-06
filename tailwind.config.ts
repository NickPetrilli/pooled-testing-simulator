import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        bio: {
          ink: "#07110d",
          panel: "#0d1f18",
          moss: "#173a2c",
          viridian: "#14b981",
          mint: "#7effc4",
          amber: "#d9a456",
          danger: "#ff4b4b",
        },
      },
      boxShadow: {
        glow: "0 0 34px rgba(20, 185, 129, 0.34)",
        amber: "0 0 30px rgba(217, 164, 86, 0.3)",
        danger: "0 0 36px rgba(255, 75, 75, 0.3)",
      },
    },
  },
  plugins: [],
} satisfies Config;
