import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      rotate: {
        "42": "41.98deg",
      },
      scrollbar: {
        hide: "::-webkit-scrollbar { display: none; }",
      },
      fontFamily: {
        title: ["Russo One, serif"],
        body: ["Lato, serif"],
        sebino: ['"Sebino Medium"', "sans-serif"],
      },
      screens: {
        xs: "580px",
      },
    },
  },
  plugins: [],
} satisfies Config;
