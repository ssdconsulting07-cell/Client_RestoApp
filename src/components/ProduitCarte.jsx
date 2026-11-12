import { useEffect, useRef, useState } from 'react';
import { Plus, Check, Flame, ImageOff } from 'lucide-react';
import { formatPrix } from '../utils/format';

// Carte produit — meme contenu que l'apercu client du Gerant
// (Manager, ProductPreviewModal.jsx) : photo, badge "Tendance", categorie,
// nom, description, prix, bouton desactive "Indisponible" en rupture.
export default function ProduitCarte({ produit: p, categorieNom, onAjouter, desactive = false, mentionIndispo }) {
  const [ajoute, setAjoute] = useState(false);
  const [photoKo, setPhotoKo] = useState(false);
  const minuteur = useRef(null);
  const rupture = p.disponibilite === 'RUPTURE';
  const bloque = rupture || desactive;

  useEffect(() => () => clearTimeout(minuteur.current), []);

  const handleClick = () => {
    onAjouter(p);
    setAjoute(true);
    clearTimeout(minuteur.current);
    minuteur.current = setTimeout(() => setAjoute(false), 1200);
  };

  return (
    <article
      className={`flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card transition-shadow [@media(hover:hover)]:hover:shadow-float ${
        bloque ? 'opacity-70' : ''
      }`}
    >
      <div className="relative aspect-[4/3] bg-surface-alt">
        {p.photoUrl && !photoKo ? (
          <img
            src={p.photoUrl}
            alt=""
            loading="lazy"
            onError={() => setPhotoKo(true)}
            className={`h-full w-full object-cover ${rupture ? 'grayscale' : ''}`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-light/60">
            <ImageOff size={28} aria-hidden="true" />
          </div>
        )}
        {p.tendance && !rupture && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
            <Flame size={11} aria-hidden="true" /> Tendance
          </span>
        )}
        {rupture && (
          <span className="absolute inset-x-0 bottom-0 bg-black/65 py-1 text-center text-[11px] font-bold uppercase tracking-wide text-white">
            Indisponible
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3">
        {categorieNom && (
          <span className="text-[10px] font-semibold uppercase tracking-wide text-primary">{categorieNom}</span>
        )}
        <h3 className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-ink">{p.nom}</h3>
        <p className="mt-1 line-clamp-2 text-xs leading-snug text-ink-light">
          {p.description || 'Aucune description pour le moment.'}
        </p>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-2 gap-y-1 pt-3">
          <span className="min-w-0 whitespace-nowrap text-[13px] font-bold text-primary sm:text-sm">{formatPrix(p.prix)}</span>
          {bloque ? (
            // En rupture, le bandeau sur la photo suffit ; pour un plat d'un
            // autre jour, on indique le jour ou il se commande.
            !rupture && mentionIndispo && (
              <span className="text-[11px] italic text-ink-light">{mentionIndispo}</span>
            )
          ) : (
            <button
              type="button"
              onClick={handleClick}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white shadow-sm transition-all active:scale-95 ${
                ajoute ? 'bg-success' : 'bg-primary hover:bg-primary-dark'
              }`}
              aria-label={`Ajouter ${p.nom} au panier`}
            >
              {ajoute ? <Check size={18} /> : <Plus size={18} />}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
