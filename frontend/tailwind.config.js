/** @type {import('tailwindcss').Config} */
export default {
  content: [
    '*.html',
    './src/**/*.tsx',
  ],
  theme: {
    extend: {
      screens: {
        xs: {min: '400px'}
      }
    },
  },
  plugins: [],
}

