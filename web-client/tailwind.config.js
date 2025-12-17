/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'dark-blue': {
          50: '#0b1220',
          100: '#111b2f',
          200: '#182640',
          300: '#223355',
          400: '#2d446f',
          500: '#2e4f82',
          600: '#3a6799',
          700: '#4c80b6',
          800: '#6aa2d5',
          900: '#91c2ee'
        },
        'neon-cyan': '#34d8e0',
        'amber-accent': '#ffb454'
      }
    }
  },
  plugins: []
};
