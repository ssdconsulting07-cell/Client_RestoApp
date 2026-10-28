export default function AnimationPreparation() {
  return (
    <div className="flex items-center gap-4">
      {/* Marmite qui bouille */}
      <div className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-primary/10" />

        {/* Marmite */}
        <svg
          viewBox="0 0 24 24"
          className="relative h-9 w-9 text-primary"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 11h18l-1.5 8a2 2 0 0 1-2 1.7H6.5a2 2 0 0 1-2-1.7L3 11Z" />
          <path d="M3 11V9a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v2" />
          <path d="M9 3v2M15 3v2" />
        </svg>

        {/* Bulles qui montent */}
        <span className="absolute top-0 left-1/2 h-1 w-1 -translate-x-1/2 animate-bounce rounded-full bg-primary/60" />
        <span
          className="absolute top-1 left-1/3 h-1.5 w-1.5 animate-bounce rounded-full bg-primary/70"
          style={{ animationDelay: '0.2s' }}
        />
        <span
          className="absolute top-0 right-1/3 h-1 w-1 animate-bounce rounded-full bg-primary/50"
          style={{ animationDelay: '0.4s' }}
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-primary">En préparation</p>
        <p className="mt-0.5 text-xs text-ink-light line-clamp-1">
          Nos chefs s'activent en cuisine
        </p>
      </div>
    </div>
  );
}