import { CONFIG_STATUTS } from '../data/commandes';

export default function ProgressionCirculaire({
  statut,
  taille = 72,
  epaisseur = 6,
  pourcentage,
}) {
  const config = CONFIG_STATUTS[statut] || CONFIG_STATUTS['en-attente'];
  const rayon = (taille - epaisseur) / 2;
  const circonference = 2 * Math.PI * rayon;
  const offset = circonference - (pourcentage / 100) * circonference;

  const estTermine = pourcentage >= 100;

  return (
    <div className="flex items-center gap-3">
      <div
        className="relative flex-shrink-0"
        style={{ width: taille, height: taille }}
      >
        <svg
          width={taille}
          height={taille}
          className="transform -rotate-90"
          aria-hidden="true"
        >
          {/* Cercle de fond */}
          <circle
            cx={taille / 2}
            cy={taille / 2}
            r={rayon}
            stroke="currentColor"
            strokeWidth={epaisseur}
            fill="transparent"
            className="text-line"
          />
          {/* Cercle de progression */}
          <circle
            cx={taille / 2}
            cy={taille / 2}
            r={rayon}
            stroke={config.couleurCercle}
            strokeWidth={epaisseur}
            fill="transparent"
            strokeDasharray={circonference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
          />
        </svg>

        {/* Contenu au centre */}
        <div className="absolute inset-0 flex items-center justify-center">
          {estTermine ? (
            <span className="text-lg text-emerald-600">✓</span>
          ) : (
            <span className="text-xs font-bold text-ink">
              {Math.round(pourcentage)}%
            </span>
          )}
        </div>
      </div>

      {/* Texte à droite */}
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-bold ${config.couleur}`}>{config.label}</p>
        <p className="text-xs text-ink-light line-clamp-1 mt-0.5">
          {config.sousLabel}
        </p>
      </div>
    </div>
  );
}