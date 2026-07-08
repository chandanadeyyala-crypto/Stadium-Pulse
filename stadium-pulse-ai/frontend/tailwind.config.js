/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enables high-contrast and custom dark modes using a 'dark' class
  theme: {
    extend: {
      colors: {
        primaryDark: '#08111F',
        stadiumNavy: '#10233F',
        electricBlue: '#2F80ED',
        pitchGreen: '#00B894',
        alertAmber: '#F2C94C',
        criticalRed: '#EB5757',
        surfaceLight: '#F8FAFC',
        textLight: '#F9FAFB',
        textDark: '#111827',
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      }
    },
  },
  plugins: [],
}
