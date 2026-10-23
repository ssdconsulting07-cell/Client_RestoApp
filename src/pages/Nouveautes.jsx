import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Tag, Sparkles, Megaphone } from 'lucide-react';
import { useNotif } from '../context/NotifContext';
import Header from '../components/Header';

const ICONES = {
  produit: <Sparkles size={16} className="text-primary" />,
  promo: <Tag size={16} className="text-primary" />,
  annonce: <Megaphone size={16} className="text-primary" />,
};

const LABELS = {
  produit: 'Nouveau produit',
  promo: 'Promotion',
  annonce: 'Annonce',
};

export default function Nouveautes() {
  const navigate = useNavigate();
  const { nouveautes, marquerToutVu } = useNotif();

  useEffect(() => {
    marquerToutVu();
  }, []);

  return (
    <div className="max-w-app mx-auto px-4 pt-6 pb-8">
      <Header
        titre="Nouveautés"
        sousTitre="Les dernières actus de Chez Ketchup"
      />

      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-ink-light mb-4"
      >
        <ArrowLeft size={16} />
        Retour
      </button>

      {nouveautes.length === 0 ? (
        <div className="bg-surface p-10 rounded-md shadow-card text-center text-ink-light">
          <Sparkles size={40} strokeWidth={1.5} className="mx-auto mb-3" />
          <p className="text-sm">Aucune nouveauté pour l'instant.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {nouveautes.map((n) => (
            <article
              key={n.id}
              className="bg-surface rounded-md shadow-card overflow-hidden"
            >
              {n.image && (
                <img
                  src={n.image}
                  alt={n.titre}
                  className="w-full h-40 object-cover"
                />
              )}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  {ICONES[n.type] || <Sparkles size={16} />}
                  <span className="text-[11px] uppercase tracking-wider text-ink-light font-semibold">
                    {LABELS[n.type] || 'Nouveauté'}
                  </span>
                </div>
                <h3 className="font-semibold text-base mb-1">{n.titre}</h3>
                <p className="text-sm text-ink-light leading-relaxed">
                  {n.message}
                </p>
                {n.produitId && (
                  <button
                    onClick={() => navigate('/menu')}
                    className="mt-3 text-sm font-semibold text-primary"
                  >
                    Voir le produit →
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}