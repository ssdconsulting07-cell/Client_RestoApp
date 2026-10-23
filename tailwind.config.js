/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // ✅ OBLIGATOIRE pour le dark mode
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
        // ✅ Couleurs dark
        'dark-surface': '#1F2937',
        'dark-surface-alt': '#111827',
        'dark-line': '#374151',
        'dark-ink': '#F9FAFB',
        'dark-ink-light': '#9CA3AF',
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
      keyframes: {
        slideDown: {
          from: { opacity: 0, transform: 'translate(-50%, -12px)' },
          to: { opacity: 1, transform: 'translate(-50%, 0)' },
        },
        slideUp: {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        slideDown: 'slideDown 0.25s ease-out',
        slideUp: 'slideUp 0.25s ease-out',
      },
    },
  },
  plugins: [],
};