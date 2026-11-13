import { WifiOff, RotateCw } from 'lucide-react';

// Squelettes de chargement : chaque zone de l'app a le sien, a la forme du
// contenu attendu (guidage : l'utilisateur sait ce qui arrive et ou).
export function Squelette({ className = '', style }) {
  return <span aria-hidden="true" style={style} className={`squelette block ${className}`} />;
}

function Occupe({ label = 'Chargement', className = '', children }) {
  return (
    <div className={className} role="status" aria-busy="true" aria-label={label}>
      {children}
    </div>
  );
}

export function SqueletteGrille({ nb = 4 }) {
  return (
    <Occupe label="Chargement des produits" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: nb }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-line bg-surface">
          <Squelette className="aspect-[4/3]" />
          <div className="space-y-2 p-3">
            <Squelette className="h-3 w-3/4 rounded" />
            <Squelette className="h-3 w-1/2 rounded" />
            <div className="flex items-center justify-between pt-2">
              <Squelette className="h-4 w-16 rounded" />
              <Squelette className="h-9 w-9 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </Occupe>
  );
}

// Rangees de l'accueil : titre de categorie + cartes qui defilent.
export function SqueletteRangees({ nb = 2 }) {
  return (
    <Occupe label="Chargement du menu" className="space-y-8">
      {Array.from({ length: nb }, (_, i) => (
        <div key={i}>
          <div className="mb-3 flex items-center justify-between px-4 sm:px-6">
            <Squelette className="h-5 w-40 rounded" />
            <Squelette className="h-4 w-16 rounded" />
          </div>
          <div className="flex gap-3 overflow-hidden px-4 sm:px-6 md:grid md:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, j) => (
              <div key={j} className="w-[46vw] max-w-[220px] shrink-0 overflow-hidden rounded-2xl border border-line bg-surface md:w-auto md:max-w-none">
                <Squelette className="aspect-[4/3]" />
                <div className="space-y-2 p-3">
                  <Squelette className="h-3 w-3/4 rounded" />
                  <Squelette className="h-4 w-1/3 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </Occupe>
  );
}

// Pastilles de categories (accueil : tuiles, menu : puces).
export function SqueletteCategories({ variante = 'tuiles' }) {
  if (variante === 'puces') {
    return (
      <Occupe label="Chargement des catégories" className="flex gap-2 overflow-hidden">
        {[80, 96, 72, 104, 88].map((l, i) => (
          <Squelette key={i} className="h-10 shrink-0 rounded-full" style={{ width: l }} />
        ))}
      </Occupe>
    );
  }
  return (
    <Occupe label="Chargement des catégories" className="flex gap-2 overflow-hidden sm:gap-3 md:grid md:grid-cols-4 lg:grid-cols-6">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="flex w-[84px] shrink-0 flex-col items-center gap-2 rounded-2xl border border-line bg-surface px-1 py-3 sm:w-28 md:w-auto md:py-5">
          <Squelette className="h-11 w-11 rounded-2xl" />
          <Squelette className="h-2.5 w-14 rounded" />
        </div>
      ))}
    </Occupe>
  );
}

export function SqueletteBandeau() {
  return (
    <Occupe label="Chargement des plats du jour" className="px-4 sm:px-6">
      <div className="space-y-3 rounded-3xl border border-line bg-surface p-5 md:p-7">
        <Squelette className="h-5 w-24 rounded-full" />
        <Squelette className="h-7 w-44 rounded" />
        <Squelette className="h-4 w-56 max-w-full rounded" />
        <div className="flex items-center justify-between pt-1">
          <Squelette className="h-4 w-28 rounded" />
          <Squelette className="h-10 w-10 rounded-full" />
        </div>
      </div>
    </Occupe>
  );
}

// Carte de commande en cours (page Mes commandes).
export function SqueletteCommandes({ nb = 2 }) {
  return (
    <Occupe label="Chargement de vos commandes" className="grid gap-5 lg:grid-cols-2 lg:items-start">
      {Array.from({ length: nb }, (_, i) => (
        <div key={i} className="space-y-5 rounded-3xl border border-line bg-surface p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <Squelette className="h-5 w-28 rounded" />
              <Squelette className="h-3.5 w-40 rounded" />
            </div>
            <Squelette className="h-5 w-20 rounded" />
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-line p-4">
            <Squelette className="h-12 w-12 shrink-0 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <Squelette className="h-4 w-1/3 rounded" />
              <Squelette className="h-3 w-4/5 rounded" />
            </div>
          </div>
          <Squelette className="h-2 w-full rounded-full" />
          <Squelette className="h-12 w-full rounded-2xl" />
        </div>
      ))}
    </Occupe>
  );
}

// Lignes de l'historique (onglet Terminees).
export function SqueletteHistorique({ nb = 4 }) {
  return (
    <Occupe label="Chargement de l'historique" className="space-y-3">
      <Squelette className="h-12 w-full rounded-2xl" />
      <Squelette className="mt-5 h-3 w-24 rounded" />
      <div className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-surface">
        {Array.from({ length: nb }, (_, i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <Squelette className="h-4 w-11 rounded" />
            <div className="flex-1 space-y-2">
              <Squelette className="h-4 w-2/5 rounded" />
              <Squelette className="h-3 w-3/5 rounded" />
            </div>
            <Squelette className="h-4 w-16 rounded" />
          </div>
        ))}
      </div>
    </Occupe>
  );
}

// Champ en attente de ses donnees (ex. zones de livraison).
export function SqueletteChamp() {
  return (
    <div role="status" aria-busy="true" aria-label="Chargement des zones" className="flex min-h-14 items-center gap-3 rounded-xl border border-line bg-surface px-3">
      <Squelette className="h-5 w-5 rounded-full" />
      <div className="flex-1 space-y-1.5">
        <Squelette className="h-3.5 w-1/3 rounded" />
        <Squelette className="h-3 w-1/2 rounded" />
      </div>
    </div>
  );
}

export function EtatErreur({ message, onReessayer, titre = "Le menu n'a pas pu être chargé" }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-line bg-surface px-5 py-10 text-center" role="alert">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <WifiOff size={26} aria-hidden="true" />
      </span>
      <p className="font-semibold text-ink">{titre}</p>
      <p className="mt-1 max-w-xs text-sm text-ink-light">{message}</p>
      {onReessayer && (
        <button
          type="button"
          onClick={onReessayer}
          className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white active:scale-[0.98]"
        >
          <RotateCw size={16} aria-hidden="true" /> Réessayer
        </button>
      )}
    </div>
  );
}
