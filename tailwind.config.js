/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // Custom colors are managed via CSS variables in src/index.css
      // (--sol-*). Keep this block out unless we need Tailwind-utility
      // class names for a colour, since those variables already cover
      // every styled-components usage and inline className arbitrary
      // values like bg-[var(--sol-cream)].
      fontFamily: {
        cursive: ['"Dancing Script"', "cursive"],
        sans: ['"Poppins"', "sans-serif"],
      },
    },
  },
  plugins: [],
}
