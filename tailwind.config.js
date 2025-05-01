/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class'],
    content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
  	extend: {
      colors: {
        purple: {
          900: '#4C1D95',
        },
        indigo: {
          900: '#312E81',
          600: '#4F46E5',
          500: '#6366F1',
        },
        'itiza': {
          cream: '#FFF8F3',
          pink: '#FFE4E1',
          gold: '#DAA520',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
    backgroundSize: {
      'auto': 'auto',
      'cover': 'cover',
      'contain': 'contain',
      '50%': '120%',
      '16': '4rem',
    }
  },
  plugins: [
    require('tailwind-scrollbar')({ nocompatible: true }),
    require("tailwindcss-animate")
  ]
}