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
        agro: {
          50: "#f4f7f2",
          100: "#e6ede0",
          200: "#cdd9c4",
          300: "#a8bc9a",
          400: "#7d9a6b",
          500: "#5c7d4a",
          600: "#476339",
          700: "#394f2f",
          800: "#304028",
          900: "#283522",
        },
        stone: {
          850: "#2a2826",
        },
      },
      fontFamily: {
        sans: ["var(--font-source-sans)", "Segoe UI", "system-ui", "sans-serif"],
        display: ["var(--font-source-serif)", "Georgia", "serif"],
      },
      fontSize: {
        "body-lg": ["1.125rem", { lineHeight: "1.75rem" }],
        "body-xl": ["1.25rem", { lineHeight: "1.875rem" }],
      },
    },
  },
  plugins: [],
};

export default config;
