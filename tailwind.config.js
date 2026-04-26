/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0F2D52',
          teal: '#29B5C4',
          tealLight: '#7FCED4',
          slate: '#475569',
        },
      },
    },
  },
  plugins: [],
};
