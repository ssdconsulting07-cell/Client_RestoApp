export default function AnimationAttente() {
  return (
    <div className="flex items-center gap-4">
      {/* Sablier animé */}
      <div className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-amber-500/10" />
        <svg
          viewBox="0 0 24 24"
          className="relative h-8 w-8 text-amber-600"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 2h12M6 22h12M6 2v6l6 4-6 4v6M18 2v6l-6 4 6 4v6" />
        </svg>
        {/* Petites bulles qui pulsent */}
        <span className="absolute top-1 right-1 h-1.5 w-1.5 animate-ping rounded-full bg-amber-500" />
        <span
          className="absolute bottom-2 left-2 h-1 w-1 animate-ping rounded-full bg-amber-500"
          style={{ animationDelay: '0.5s' }}
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-amber-600">En attente</p>
        <p className="mt-0.5 text-xs text-ink-light line-clamp-1">
          Nous avons bien reçu votre commande
        </p>
      </div>
    </div>
  );
}