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
        blush: {
          50: "#fff5f7",
          100: "#ffe4ea",
          200: "#ffc9d5",
          300: "#ff9eb5",
          400: "#ff6b8a",
          500: "#ff3d6b",
          600: "#e8174a",
          700: "#c4103c",
          800: "#a31235",
          900: "#8a1430",
        },
        rose: {
          50: "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
        },
        cream: "#fdf8f8",
        petal: "#fef0f3",
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "sans-serif"],
        serif: ["var(--font-playfair)", "serif"],
        display: ["var(--font-playfair)", "serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        soft: "0 2px 20px rgba(255, 100, 130, 0.08)",
        card: "0 4px 24px rgba(200, 50, 80, 0.06)",
        "card-hover": "0 8px 32px rgba(200, 50, 80, 0.12)",
        pink: "0 4px 20px rgba(255, 61, 107, 0.2)",
      },
    },
  },
  plugins: [],
};

export default config;
