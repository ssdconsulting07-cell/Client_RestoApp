import { Link } from 'react-router-dom';

export default function Accueil() {
  return (
    <div className="pb-4">
      {/* En-tête */}
      <header className="pt-2 pb-4">
        <h1 className="text-2xl font-bold text-primary">Chez Ketchup</h1>
        <p className="text-sm text-ink-light mt-1">
          Commandez en ligne, sans compte
        </p>
      </header>

      {/* Hero */}
      <section className="bg-surface rounded-lg p-6 shadow-card mb-5">
        <h2 className="text-xl font-semibold mb-2 text-ink">Bienvenue 👋</h2>
        <p className="text-sm text-ink-light leading-relaxed mb-4">
          Découvrez notre menu, commandez en quelques clics et suivez votre
          commande en temps réel.
        </p>
        <Link
          to="/menu"
          className="inline-block bg-primary hover:bg-primary-dark text-white px-5 py-3 rounded-md text-sm font-semibold transition-colors"
        >
          Voir le menu
        </Link>
      </section>

      {/* Raccourcis */}
      <section className="grid grid-cols-2 gap-3">
        <Link
          to="/menu"
          className="bg-surface p-5 rounded-md shadow-card flex flex-col items-center gap-2 hover:shadow-float transition-shadow"
        >
          <span className="text-3xl">🍔</span>
          <span className="text-sm font-semibold text-ink">Menu</span>
        </Link>

        <Link
          to="/commandes"
          className="bg-surface p-5 rounded-md shadow-card flex flex-col items-center gap-2 hover:shadow-float transition-shadow"
        >
          <span className="text-3xl">📦</span>
          <span className="text-sm font-semibold text-ink">Mes commandes</span>
        </Link>
      </section>
    </div>
  );
}