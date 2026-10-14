/** @type {import('tailwindcss').Config} */

// Les couleurs passent par des variables CSS (globals.css) : le thème clair
// les redéfinit sans toucher aux composants.
const jeton = (nom) => `rgb(var(--${nom}) / <alpha-value>)`;

module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: jeton("bg"),
        surface: jeton("surface"),
        s2: jeton("s2"),
        s3: jeton("s3"),
        border: jeton("border"),
        accent: jeton("accent"),
        "accent-texte": jeton("accent-texte"),
        green: jeton("green"),
        text: jeton("text"),
        muted: jeton("muted"),
        muted2: jeton("muted2"),
      },
      fontFamily: {
        mono: ["var(--font-mono)", "Consolas", "monospace"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
