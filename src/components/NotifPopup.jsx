import { useEffect } from 'react';
import { X, Tag, Sparkles, Megaphone } from 'lucide-react';
import { useNotif } from '../context/NotifContext';

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

export default function NotifPopup() {
  const { ouvert, fermer, nouveautes } = useNotif();

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') fermer(); };
    if (ouvert) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [ouvert, fermer]);

  useEffect(() => {
    if (ouvert) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [ouvert]);

  if (!ouvert) return null;

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/60 flex items-end sm:items-center justify-center"
      onClick={fermer}
    >
      <div
        className="bg-surface w-full max-w-md rounded-t-2xl sm:rounded-2xl shadow-float max-h-[85vh] flex flex-col overflow-hidden animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between px-4 py-3 border-b border-line shrink-0">
          <div>
            <h2 className="text-base font-semibold text-ink">Nouveautés</h2>
            <p className="text-[11px] text-ink-light">
              Les dernières actus de Chez Ketchup
            </p>
          </div>
          <button
            onClick={fermer}
            aria-label="Fermer"
            className="w-9 h-9 rounded-full bg-surface-alt flex items-center justify-center active:scale-95 transition-transform"
          >
            <X size={18} className="text-ink" />
          </button>
        </header>

        <div className="p-4 overflow-y-auto flex-1">
          {nouveautes.length === 0 ? (
            <div className="text-center text-ink-light py-12">
              <Sparkles size={40} strokeWidth={1.5} className="mx-auto mb-3" />
              <p className="text-sm">Aucune nouveauté pour l'instant.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {nouveautes.map((n) => (
                <article
                  key={n.id}
                  className="bg-surface-alt rounded-md overflow-hidden"
                >
                  {n.image && (
                    <img src={n.image} alt={n.titre} className="w-full h-32 object-cover" />
                  )}
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      {ICONES[n.type] || <Sparkles size={16} />}
                      <span className="text-[10px] uppercase tracking-wider text-ink-light font-semibold">
                        {LABELS[n.type] || 'Nouveauté'}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm mb-1 text-ink">{n.titre}</h3>
                    <p className="text-xs text-ink-light leading-relaxed">
                      {n.message}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <footer className="px-4 py-3 border-t border-line shrink-0">
          <button
            onClick={fermer}
            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-md text-sm transition-colors"
          >
            Fermer
          </button>
        </footer>
      </div>
    </div>
  );
}