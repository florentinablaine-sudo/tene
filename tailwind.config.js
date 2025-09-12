/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Эта строка на месте, всё отлично!
  theme: {
    extend: {
      colors: {
        // Вот так должно быть: только переменные!
        // Теперь Tailwind будет брать цвета из CSS-файла.
        'background': 'var(--background)',
        'text-main': 'var(--text-main)',
        'component-bg': 'var(--component-bg)',
        'accent': 'var(--accent)',
        'accent-hover': 'var(--accent-hover)',
        'border-color': 'var(--border-color)',
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