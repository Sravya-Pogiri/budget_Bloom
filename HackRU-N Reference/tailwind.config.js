/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bloom-green': '#10b981',
        'bloom-dark': '#065f46',
        'bloom-light': '#d1fae5',
      },
    },
  },
  plugins: [],
}

