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
        primaryDark: 'var(--bg-primary)',
        stadiumNavy: 'var(--bg-surface)',
        electricBlue: 'var(--bg-electric)',
        pitchGreen: 'var(--bg-green)',
        alertAmber: 'var(--bg-amber)',
        criticalRed: 'var(--bg-red)',
        surfaceLight: '#F8FAFC',
        textLight: 'var(--text-primary)',
        textDark: 'var(--text-secondary)',
        
        navAccent: 'var(--color-nav-accent)',
        aiAccent: 'var(--color-ai-accent)',
        transportAccent: 'var(--color-transport-accent)',
        safetyAccent: 'var(--color-safety-accent)',
        accessibilityAccent: 'var(--color-accessibility-accent)',
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
