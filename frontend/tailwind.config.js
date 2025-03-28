/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#007DB7',
          light: '#00A5D2',
          dark: '#006396',
        },
        secondary: {
          DEFAULT: '#00B6C9',
          light: '#00D9F0',
          dark: '#00879A',
        },
        accent: {
          DEFAULT: '#8DC63F',
          light: '#A2D94F',
          dark: '#709C32',
        },
        warning: {
          DEFAULT: '#FDB515',
          light: '#FFC53D',
          dark: '#E59D00',
        }
      },
    },
  },
  plugins: [],
} 