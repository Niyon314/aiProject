/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#FFE5EC',
          DEFAULT: '#FFB5C5',
          dark: '#FF6B81',
          darker: '#FF4757',
        },
        macaron: {
          blue: '#A8E6FF',
          purple: '#DDA0DD',
          green: '#98D8C8',
          yellow: '#FFF5BA',
          peach: '#FFDAB9',
        },
      },
      fontFamily: {
        sans: ['Nunito', 'Quicksand', 'system-ui', 'sans-serif'],
        heading: ['Quicksand', 'Nunito', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        'full': '9999px',
      },
      boxShadow: {
        'sm': '0 2px 8px rgba(255, 107, 129, 0.08)',
        'md': '0 4px 16px rgba(255, 107, 129, 0.12)',
        'lg': '0 8px 32px rgba(255, 107, 129, 0.16)',
        'hover': '0 6px 24px rgba(255, 107, 129, 0.2)',
      },
      animation: {
        'float': 'float 2s ease-in-out infinite',
        'bounce-slow': 'bounce 600ms ease-in-out',
        'fade-in': 'fade-in 400ms ease-out',
        'slide-in': 'slide-in 350ms ease-out',
        'heart-beat': 'heart-beat 1s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(-100px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'heart-beat': {
          '0%, 100%': { transform: 'scale(1)' },
          '25%': { transform: 'scale(1.1)' },
          '50%': { transform: 'scale(1)' },
          '75%': { transform: 'scale(1.1)' },
        },
      },
    },
  },
  plugins: [],
}
