/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f1f5fe', 100: '#e3ebfd', 200: '#c6d7fb', 300: '#a2bcf7', 400: '#7c9cf1', 500: '#5b7eea', 600: '#4964d8', 700: '#3c50b3', 800: '#344491', 900: '#2e3c76'
        },
        secondary: {
          50: '#f4f7f9', 100: '#e9eff3', 200: '#cad6e1', 300: '#a9bdcf', 400: '#7b97b1', 500: '#5d7b98', 600: '#4d667f', 700: '#405568', 800: '#364757', 900: '#2f3d4a'
        },
        surface: '#ffffff',
        background: '#f5f6f8',
      },
      boxShadow: {
        sm2: '0 1px 2px rgba(0,0,0,0.06), 0 1px 1px rgba(0,0,0,0.04)',
        md2: '0 4px 12px rgba(0,0,0,0.08)',
        lg2: '0 12px 28px rgba(0,0,0,0.12)',
      },
      borderRadius: {
        xl2: '1rem',
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
