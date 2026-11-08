/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#0d0906',
          900: '#17100b',
          800: '#261b13',
          700: '#38281d',
        },
        frontier: {
          dark: '#0e0906',
          wood: '#18110b',
          leather: '#2b1b11',
          saddle: '#442a1b',
          parchment: '#f7edd8',
          sepia: '#dbc196',
          brass: '#d4a34b',
          gold: '#e6be68',
          copper: '#c26d38',
          rust: '#8c3523',
        },
        solana: {
          purple: '#9945FF',
          green: '#14F195',
          dark: '#140e0a',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      animation: {
        'glow-pulse': 'glow 2s ease-in-out infinite alternate',
        'slash': 'slash 0.3s ease-out',
        'heal-glow': 'heal 0.8s ease-in-out',
        'lunge-right': 'lungeRight 0.5s ease-in-out',
        'lunge-left': 'lungeLeft 0.5s ease-in-out',
        'float-up': 'floatUp 0.9s ease-out forwards',
        'shake-heavy': 'shakeHeavy 0.3s ease-in-out',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 10px rgba(212, 163, 75, 0.3)' },
          '100%': { boxShadow: '0 0 25px rgba(230, 190, 104, 0.6)' },
        },
        slash: {
          '0%': { transform: 'scale(0.8) rotate(-15deg)', opacity: '0.2' },
          '50%': { transform: 'scale(1.1) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '0' },
        },
        heal: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '50%': { transform: 'translateY(-5px)', opacity: '1' },
          '100%': { transform: 'translateY(-20px)', opacity: '0' },
        },
        lungeRight: {
          '0%': { transform: 'translateX(0) scale(1)' },
          '50%': { transform: 'translateX(65px) scale(1.08)' },
          '100%': { transform: 'translateX(0) scale(1)' },
        },
        lungeLeft: {
          '0%': { transform: 'translateX(0) scale(1)' },
          '50%': { transform: 'translateX(-65px) scale(1.08)' },
          '100%': { transform: 'translateX(0) scale(1)' },
        },
        floatUp: {
          '0%': { transform: 'translateY(0) scale(0.8)', opacity: '0' },
          '20%': { transform: 'translateY(-6px) scale(1.15)', opacity: '1' },
          '80%': { transform: 'translateY(-22px) scale(1)', opacity: '1' },
          '100%': { transform: 'translateY(-34px) scale(0.9)', opacity: '0' },
        },
        shakeHeavy: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '20%': { transform: 'translate(-5px, 3px)' },
          '40%': { transform: 'translate(5px, -3px)' },
          '60%': { transform: 'translate(-3px, -2px)' },
          '80%': { transform: 'translate(3px, 2px)' },
        },
      },
    },
  },
  plugins: [],
};
