/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0b0e14',
          800: '#131722',
          700: '#1e222d',
          600: '#2a2e39',
          500: '#363a45',
        },
        trade: {
          green: '#26a69a',
          'green-hover': '#208b81',
          red: '#ef5350',
          'red-hover': '#d32f2f',
          accent: '#2962ff',
          gold: '#f0b90b',
        }
      }
    },
  },
  plugins: [],
}
