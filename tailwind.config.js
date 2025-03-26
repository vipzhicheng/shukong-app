import colors from 'tailwindcss/colors'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'confetti-explode': 'confetti-explode 3s ease-out forwards'
      },
      keyframes: {
        'confetti-explode': {
          '0%': {
            transform: 'translate(-50%, -50%) scale(0) rotate(0deg)',
            opacity: '1'
          },
          '100%': {
            transform:
              'translate(calc(-50% + var(--tw-translate-x)), calc(-50% + var(--tw-translate-y))) scale(1) rotate(var(--tw-rotate))',
            opacity: '0'
          }
        }
      },
      colors: {
        primary: colors.green,
        background: {
          DEFAULT: '#ffffff',
          dark: '#1a1a1a',
          secondary: {
            light: '#f5f5f5',
            dark: '#242424'
          }
        },
        text: {
          DEFAULT: '#333333',
          dark: '#c0c0c0',
          secondary: {
            light: '#666666',
            dark: '#a0a0a0'
          }
        },
        border: {
          DEFAULT: '#e0e0e0',
          dark: '#333333'
        }
      }
    }
  },
  plugins: []
}
