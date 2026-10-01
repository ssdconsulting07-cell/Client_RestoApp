/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E63946',
          dark: '#B32E39',
        },
        accent: '#FFB703',
        ink: {
          DEFAULT: '#1D3557',
          light: '#6C757D',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          alt: '#F8F9FA',
        },
        line: '#E9ECEF',
        success: '#2A9D8F',
        danger: '#E63946',
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
        app: '900px',
      },
    },
  },
  plugins: [],
};