import { useEffect, useState } from 'react';
import { X, Phone, Mail, ChevronRight } from 'lucide-react';
import useScrollLock from '../hooks/useScrollLock';
import { SUPPORT_TELEPHONE, SUPPORT_EMAIL, telephoneLisible } from '../config/support';

// "Besoin d'aide ?" : feuille du bas sur smartphone, fenetre centree sur
// tablette / ordinateur (meme presentation que le choix de zone). Deux
// lignes cliquables : appeler (tel:) et ecrire (mailto:).
export default function AideSheet({ ouvert, onFermer }) {
  const [visible, setVisible] = useState(false);
  useScrollLock(ouvert);

  useEffect(() => {
    if (!ouvert) {
      setVisible(false);
      return undefined;
    }
    const raf = requestAnimationFrame(() => setVisible(true));
    const onKey = (e) => e.key === 'Escape' && onFermer();
    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKey);
    };
  }, [ouvert, onFermer]);

  if (!ouvert) return null;

  const sujet = encodeURIComponent(`Besoin d'aide - SenYummies v${__APP_VERSION__}`);
  const lignes = [
    {
      href: `tel:${SUPPORT_TELEPHONE.replace(/\s/g, '')}`,
      Icone: Phone,
      titre: 'Appeler le support',
      detail: telephoneLisible(SUPPORT_TELEPHONE),
    },
    {
      href: `mailto:${SUPPORT_EMAIL}?subject=${sujet}`,
      Icone: Mail,
      titre: 'Écrire au support',
      detail: SUPPORT_EMAIL,
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="titre-aide"
      className={`fixed inset-0 z-[260] flex items-end justify-center bg-black/60 transition-opacity duration-200 md:items-center md:p-6 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onFermer}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full overflow-hidden rounded-t-3xl bg-surface pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-float transition-transform duration-300 ease-out md:max-w-sm md:rounded-3xl md:pb-5 ${
          visible ? 'translate-y-0' : 'translate-y-full md:translate-y-4'
        }`}
      >
        <div className="flex justify-center pb-1 pt-3 md:hidden" aria-hidden="true">
          <div className="h-1.5 w-12 rounded-full bg-ink/15" />
        </div>
        <div className="flex items-start justify-between gap-3 px-5 pb-4 pt-2 md:pt-5">
          <div className="min-w-0">
            <h2 id="titre-aide" className="text-lg font-semibold">Besoin d’aide ?</h2>
            <p className="mt-0.5 text-xs text-ink-light">Une question sur une commande ? Contactez-nous.</p>
          </div>
          <button
            type="button"
            onClick={onFermer}
            aria-label="Fermer"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-alt"
          >
            <X size={18} />
          </button>
        </div>
        <ul className="mx-5 divide-y divide-line overflow-hidden rounded-2xl border border-line">
          {lignes.map(({ href, Icone, titre, detail }) => (
            <li key={href}>
              <a href={href} className="flex min-h-16 items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-alt active:bg-surface-alt">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icone size={19} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{titre}</span>
                  <span className="block truncate text-xs text-ink-light">{detail}</span>
                </span>
                <ChevronRight size={18} className="shrink-0 text-ink-light" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
