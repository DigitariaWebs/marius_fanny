/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bakery-cream': '#F9F7F2',
        'bakery-text': '#2D2A26',
        'bakery-gold': '#C5A065',
        'bakery-accent': '#E8DCCA',
      },
      fontFamily: {
        'script': ['"Great Vibes"', 'cursive'],
        'sans': ['"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}