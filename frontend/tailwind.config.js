/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1877F2',
          50: '#EBF3FE',
          100: '#D7E8FD',
          200: '#AFD0FB',
          300: '#87B9F9',
          400: '#5FA1F7',
          500: '#1877F2',
          600: '#0E5FCC',
          700: '#0A47A6',
          800: '#072F80',
          900: '#04175A',
        },
        secondary: {
          DEFAULT: '#42B72A',
          50: '#EAF7E6',
          100: '#D5EFCD',
          200: '#ABDF9B',
          300: '#81CF69',
          400: '#57BF37',
          500: '#42B72A',
          600: '#359222',
          700: '#286D1A',
          800: '#1B4812',
          900: '#0E230A',
        },
        background: '#F0F2F5',
        dark: '#1C1E21',
        muted: '#65676B',
        card: '#FFFFFF',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
        'card-hover': '0 4px 6px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08)',
      },
      animation: {
        'like-pulse': 'likePulse 0.3s ease-in-out',
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        likePulse: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.3)' },
          '100%': { transform: 'scale(1)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
