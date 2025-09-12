/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // ИЗМЕНЕНИЯ ТУТ
      colors: {
        background: 'rgb(var(--background) / <alpha-value>)',
        'text-main': 'rgb(var(--text-main) / <alpha-value>)',
        'component-bg': 'rgb(var(--component-bg) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        'accent-hover': 'rgb(var(--accent-hover) / <alpha-value>)',
        'border-color': 'rgb(var(--border-color) / <alpha-value>)',
        'genre-highlight-border': 'rgb(var(--genre-highlight-border) / <alpha-value>)',
        'genre-highlight-text': 'rgb(var(--genre-highlight-text) / <alpha-value>)',
      },
      fontFamily: {
        'sans': ['JetBrains Mono', 'monospace'],
      },
      dropShadow: {
        'accent': '0 1px 2px rgba(154, 123, 102, 0.7)',
      },
      keyframes: {
        'pulse-heart': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1', },
          '50%': { transform: 'scale(1.2)', opacity: '0.7', },
        },
      },
      animation: {
        'pulse-heart': 'pulse-heart 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}