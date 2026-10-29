/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          // Rouge de marque partage avec Manager_RestoApp (voir theme.js ici
          // et src/theme.js cote Manager — meme valeur #A6192E). Avant ce
          // fix, Tailwind utilisait #E63946 (different de theme.js), donc
          // tout le rendu (bg-primary/text-primary) affichait la mauvaise
          // couleur malgre un theme.js correct mais non branche.
          DEFAULT: '#A6192E',
          dark: '#8A1526',
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
        cream: '#FAF7F2',        // ⭐ AJOUT — fond crème
        line: '#E9ECEF',
        success: '#2A9D8F',
        danger: {
          DEFAULT: '#E63946',
          dark: '#B32E39',       // ⭐ AJOUT — hover du bouton "Annuler"
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
        app: '900px',
      },
    },
  },
  plugins: [],
};