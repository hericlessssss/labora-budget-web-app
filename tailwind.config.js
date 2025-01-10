/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
        'open-sans': ['Open Sans', 'sans-serif'],
      },
      colors: {
        primary: '#6A1B9A',
        secondary: '#283593',
        background: '#ECEFF1',
        accent: '#F9A825',
        text: '#212121',
      },
    },
  },
  plugins: [],
};