/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg:      "#080808",
        surface: "#111111",
        s2:      "#1a1a1a",
        s3:      "#222222",
        border:  "#282828",
        red:     "#ff3c00",
        orange:  "#ff7a45",
        green:   "#00e87a",
        text:    "#efefef",
        muted:   "#555555",
        muted2:  "#888888",
      },
      fontFamily: {
        mono: ["var(--font-mono)", "Consolas", "monospace"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
