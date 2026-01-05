/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Crimson Pro', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#fef5f0',
          100: '#fde8dd',
          200: '#facdbb',
          300: '#f6a88d',
          400: '#f17857',
          500: '#ed5632',
          600: '#de3d18',
          700: '#b82d14',
          800: '#932718',
          900: '#772516',
        },
      },
    },
  },
  plugins: [],
};

