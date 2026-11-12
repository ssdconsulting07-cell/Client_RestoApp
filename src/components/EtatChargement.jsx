import { WifiOff, RotateCw } from 'lucide-react';

export function SqueletteGrille({ nb = 4 }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" aria-busy="true" aria-label="Chargement">
      {Array.from({ length: nb }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-line bg-surface">
          <div className="aspect-[4/3] animate-pulse bg-line/70" />
          <div className="space-y-2 p-3">
            <div className="h-3 w-3/4 animate-pulse rounded bg-line/70" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-line/70" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EtatErreur({ message, onReessayer }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-line bg-surface px-5 py-10 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <WifiOff size={26} aria-hidden="true" />
      </span>
      <p className="font-semibold text-ink">Le menu n'a pas pu être chargé</p>
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
