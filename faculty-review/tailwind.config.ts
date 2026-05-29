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
          50: "#fcf8f9",
          100: "#f8eef1",
          200: "#eedde3",
          300: "#dfbcc8",
          400: "#c78ea1",
          500: "#b76f88",
          600: "#a45d76",
          700: "#8a4d64",
          800: "#734150",
          900: "#603743",
        },
        rose: {
          50: "#faf7f8",
          100: "#f5eef0",
          200: "#e9dde1",
        },
        cream: "#faf8f9",
        petal: "#f8f3f5",
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
        soft: "0 2px 20px rgba(120, 80, 100, 0.06)",
        card: "0 4px 24px rgba(120, 80, 100, 0.05)",
        "card-hover": "0 8px 32px rgba(120, 80, 100, 0.08)",
        pink: "0 4px 20px rgba(183, 111, 136, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
