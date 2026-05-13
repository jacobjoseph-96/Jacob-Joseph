/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html'],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#020617',
          925: '#070e1f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        pulse_led: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 6px 2px rgba(59,130,246,0.7)' },
          '50%': { opacity: '0.4', boxShadow: '0 0 2px 1px rgba(59,130,246,0.2)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        pulse_led: 'pulse_led 2.4s ease-in-out infinite',
        fadeUp: 'fadeUp 0.5s ease forwards',
        marquee: 'marquee 28s linear infinite',
      },
    },
  },
  plugins: [],
}
