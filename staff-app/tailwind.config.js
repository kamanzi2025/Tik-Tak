/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        staff: { DEFAULT: '#412402', dark: '#2a1701', light: '#f5ece4' },
        brand: { DEFAULT: '#1D9E75', light: '#e6f7f2' },
      },
    },
  },
  plugins: [],
}
