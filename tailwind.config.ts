import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "Segoe UI", "system-ui", "sans-serif"],
      },
      colors: {
        // Tek aksan: referans panelin mavisi. Değiştirmek için yalnız burası.
        brand: {
          DEFAULT: "#2563eb",
          dark: "#1d4ed8",
          light: "#60a5fa",
        },
        // Panel zemini (açık tema)
        canvas: "#f5f7fb",
        brass: {
          DEFAULT: "#b45309",
          light: "#f59e0b",
        },
      },
    },
  },
  plugins: [],
};

export default config;
