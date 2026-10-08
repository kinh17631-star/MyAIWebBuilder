/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#0b1320", // Premium dark slate
        surface: "#111c2e",
        primary: "#10b981", // Emerald green
      }
    },
  },
  plugins: [],
}
