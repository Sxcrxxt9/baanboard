/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        thai: ['"Noto Sans Thai"', 'sans-serif'],
      },
      colors: {
        primary: "#47A19C",
        secondary: "#474747"
      },
    },
  },
  plugins: [],
}


