import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gothic: {
          50: '#f8f6f3',
          100: '#f1ede8',
          200: '#e3dbd4',
          300: '#d5c9bf',
          400: '#c7b7ab',
          500: '#8b7355',
          600: '#704d3f',
          700: '#55392a',
          800: '#3a2415',
          900: '#1f1200',
          950: '#0f0800',
        },
        blood: {
          50: '#fef5f5',
          500: '#c20000',
          600: '#a00000',
          700: '#800000',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
