/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        invoiceGrey: '#C0C0C0',
      },
      fontFamily: {
        arial: ['Arial', 'Helvetica', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

