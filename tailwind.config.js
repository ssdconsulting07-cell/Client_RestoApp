/** @type {import('tailwindcss').Config} */
// Palette alignee sur src/theme.js et sur Manager_RestoApp : rouge de marque
// #A6192E, noir #141414, police Poppins.
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'Helvetica', 'Arial', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#A6192E',
          dark: '#8A1526',
        },
        ink: {
          DEFAULT: '#141414',
          light: '#6B6B6B',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          alt: '#F8F9FA',
        },
        cream: '#FAF7F2',
        line: '#E6E6E6',
        success: '#1F6F57',
        danger: {
          DEFAULT: '#B3261E',
          dark: '#8C1D17',
        },
      },
      borderRadius: {
        md: '12px',
        lg: '20px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.08)',
        float: '0 8px 24px rgba(0,0,0,0.14)',
      },
      maxWidth: {
        app: '640px',
      },
    },
  },
  plugins: [],
};
