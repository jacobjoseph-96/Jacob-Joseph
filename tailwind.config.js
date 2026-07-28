/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html'],
  theme: {
    extend: {
      colors: {
        // Kept so the existing slate-* / blue-* markup still compiles.
        // Both scales are re-pointed at theme tokens in input.css — the
        // literal values here are only ever seen if that map is removed.
        slate: {
          950: '#020617',
          925: '#070e1f',
        },
        // One Piece palette, mirrored from src/theme.mjs in the profile repo.
        sea: {
          deep: '#04121a',
          900: '#07161f',
          800: '#0e2634',
          700: '#17394b',
          500: '#2a9d8f',
          400: '#3fc0b0',
        },
        parchment: {
          50: '#fff8e7',
          100: '#fbf2dc',
          200: '#f3e4c3',
          300: '#e8d5b0',
          400: '#c9ae85',
          500: '#a98b5f',
        },
        gold: {
          DEFAULT: '#ffb703',
          dim: '#b8860b',
        },
        bounty: {
          DEFAULT: '#e63946',
          dim: '#c1121f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        // Shadow colour reads the live accent token so the glow follows
        // the theme instead of staying blue.
        pulse_led: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 6px 2px color-mix(in srgb, var(--accent) 70%, transparent)' },
          '50%': { opacity: '0.4', boxShadow: '0 0 2px 1px color-mix(in srgb, var(--accent) 20%, transparent)' },
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
