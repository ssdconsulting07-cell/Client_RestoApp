
import { useMemo, useState } from 'react';
import {
  Receipt,
  Clock3,
  PackageCheck,
  History,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  ChevronRight,
  UtensilsCrossed,
  RefreshCw,
} from 'lucide-react';

import Header from '../components/Header';
import CardCommande from '../components/CardCommande';
import { commandes as commandesMock } from '../data/commandes';
import { joursDepuis } from '../utils/date';
import { useToast } from '../context/ToastContext';

const DELAI_JOURS = 10;

const FILTRES = [
  { id: 'en-cours', label: 'En cours', Icone: Clock3 },
  { id: 'livrees', label: 'Livrées', Icone: PackageCheck },
  { id: 'historique', label: 'Historique', Icone: History },
];

const STATUTS_ACTIFS = [
  'en-attente',
  'en-preparation',
  'prete',
];

const STATUTS_LIVRES = ['livree'];

export default function MesCommandes() {
  const { showToast } = useToast();
  const [filtre, setFiltre] = useState('en-cours');

  const commandesVisibles = useMemo(() => {
    return commandesMock.filter((commande) => {
      if (STATUTS_ACTIFS.includes(commande.statut)) {
        return true;
      }

      return joursDepuis(commande.date) <= DELAI_JOURS;
    });
  }, []);

  const commandesFiltrees = useMemo(() => {
    if (filtre === 'en-cours') {
      return commandesVisibles.filter((commande) =>
        STATUTS_ACTIFS.includes(commande.statut)
      );
    }

    if (filtre === 'livrees') {
      return commandesVisibles.filter((commande) =>
        STATUTS_LIVRES.includes(commande.statut)
      );
    }

    return commandesVisibles.filter(
      (commande) =>
        !STATUTS_ACTIFS.includes(commande.statut) &&
        !STATUTS_LIVRES.includes(commande.statut)
    );
  }, [filtre, commandesVisibles]);

  const commandesTriees = useMemo(() => {
    return [...commandesFiltrees].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
  }, [commandesFiltrees]);

  const compteurs = useMemo(() => {
    const enCours = commandesVisibles.filter((commande) =>
      STATUTS_ACTIFS.includes(commande.statut)
    ).length;

    const livrees = commandesVisibles.filter((commande) =>
      STATUTS_LIVRES.includes(commande.statut)
    ).length;

    const historique = commandesVisibles.filter(
      (commande) =>
        !STATUTS_ACTIFS.includes(commande.statut) &&
        !STATUTS_LIVRES.includes(commande.statut)
    ).length;

    return {
      'en-cours': enCours,
      livrees,
      historique,
    };
  }, [commandesVisibles]);

  const handleCommander = (commande) => {
    showToast(`Nouvelle commande à partir de #${commande.id}`);
    // À connecter à la navigation vers le menu ou le panier.
  };

  const handleAnnuler = (commande) => {
    showToast(
      `Demande d'annulation pour la commande #${commande.id}`
    );
    // L'annulation réelle devra être reliée à l'API.
  };

  return (
    <main className="commandes-page min-h-screen overflow-x-hidden bg-surface-alt pb-28 text-ink">
      <style>{`
        @keyframes commandes-enter {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes commandes-float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes commandes-shine {
          0% {
            transform: translateX(-150%) skewX(-18deg);
          }
          55%, 100% {
            transform: translateX(250%) skewX(-18deg);
          }
        }

        .commandes-enter {
          animation: commandes-enter .5s cubic-bezier(.2,.75,.3,1) both;
        }

        .commandes-float {
          animation: commandes-float 5s ease-in-out infinite;
        }

        .commandes-shine {
          animation: commandes-shine 7s ease-in-out infinite;
        }

        .commande-card-enter {
          animation: commandes-enter .45s ease-out both;
        }

        @media (prefers-reduced-motion: reduce) {
          .commandes-page *,
          .commandes-page *::before,
          .commandes-page *::after {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: .01ms !important;
          }
        }
      `}</style>

      <div className="mx-auto max-w-5xl px-4 pb-6 pt-5 sm:px-6 sm:pt-7">

        {/* En-tête */}
        <div className="commandes-enter">
          <Header
            titre="Mes commandes"
            sousTitre="Toutes vos envies, au même endroit."
          />
        </div>

        {/* Carte principale */}
        <section
          className="commandes-enter relative mt-6 overflow-hidden rounded-[28px] bg-gradient-to-br from-primary via-primary to-primary-dark p-5 text-white shadow-xl sm:p-7"
          style={{ animationDelay: '80ms' }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-12 h-44 w-44 rounded-full border-[28px] border-white/[0.07]"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-16 right-20 h-40 w-40 rounded-full bg-white/[0.06]"
          />

          <div
            aria-hidden="true"
            className="commandes-shine pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent"
          />

          <div className="relative">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="commandes-float flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/15 shadow-inner backdrop-blur-sm">
                  <ShoppingBag size={23} />
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
                    Votre espace personnel
                  </p>
                  <h2 className="mt-1 text-lg font-extrabold sm:text-xl">
                    Bonjour, gourmand !
                  </h2>
                </div>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10">
                <Sparkles size={17} />
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1">
                <p className="text-xs font-medium text-white/75">
                  Total des commandes
                </p>

                <div className="mt-2 flex items-end gap-2">
                  <span className="text-4xl font-black tracking-tight">
                    {commandesVisibles.length}
                  </span>
                  <ShoppingBag
                    size={18}
                    className="mb-1 text-white/70"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    {compteurs['en-cours'] > 0 && (
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-50" />
                    )}
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
                  </span>

                  <p className="text-xs font-medium text-white/75">
                    En cours
                  </p>
                </div>

                <div className="mt-2 flex items-end gap-2">
                  <span className="text-4xl font-black tracking-tight">
                    {compteurs['en-cours']}
                  </span>
                  <Clock3
                    size={18}
                    className="mb-1 text-white/70"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-white/80">
              <Sparkles size={14} />
              <span>
                Retrouvez facilement le suivi de vos commandes.
              </span>
            </div>
          </div>
        </section>

        {/* Compteurs rapides */}
        <section
          className="commandes-enter mt-5 grid grid-cols-3 gap-2.5"
          style={{ animationDelay: '140ms' }}
        >
          <MiniStat
            Icone={Clock3}
            valeur={compteurs['en-cours']}
            label="En cours"
            couleur="text-amber-600"
            fond="bg-amber-500/10"
          />

          <MiniStat
            Icone={PackageCheck}
            valeur={compteurs.livrees}
            label="Livrées"
            couleur="text-emerald-600"
            fond="bg-emerald-500/10"
          />

          <MiniStat
            Icone={History}
            valeur={compteurs.historique}
            label="Autres"
            couleur="text-primary"
            fond="bg-primary/10"
          />
        </section>

        {/* Information */}
        <div
          className="commandes-enter mt-5 flex items-start gap-3 rounded-2xl border border-line bg-surface p-4 shadow-sm"
          style={{ animationDelay: '190ms' }}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles size={19} />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-bold">
              Gardez le fil de vos commandes
            </p>
            <p className="mt-1 text-xs leading-5 text-ink-light sm:text-sm">
              Les commandes terminées restent visibles pendant{' '}
              {DELAI_JOURS} jours. Vos commandes en cours restent
              accessibles.
            </p>
          </div>
        </div>

        {/* Filtres */}
        <section
          className="commandes-enter mt-8"
          style={{ animationDelay: '240ms' }}
        >
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary">
                Votre activité
              </p>
              <h2 className="mt-1 text-xl font-black tracking-tight sm:text-2xl">
                Mes commandes
              </h2>
              <p className="mt-1 text-xs text-ink-light sm:text-sm">
                Que souhaitez-vous consulter ?
              </p>
            </div>

            <span className="mb-1 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-bold text-ink-light">
              {commandesTriees.length}{' '}
              {commandesTriees.length > 1 ? 'résultats' : 'résultat'}
            </span>
          </div>

          <div
            role="group"
            aria-label="Filtrer les commandes"
            className="grid grid-cols-3 gap-1.5 rounded-2xl border border-line bg-surface p-1.5 shadow-sm"
          >
            {FILTRES.map(({ id, label, Icone }) => {
              const actif = filtre === id;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFiltre(id)}
                  aria-pressed={actif}
                  className={`group flex min-h-[76px] flex-col items-center justify-center gap-2 rounded-xl px-1.5 py-3 transition-all duration-300 active:scale-[0.96] ${
                    actif
                      ? 'bg-primary text-white shadow-md'
                      : 'text-ink-light hover:bg-surface-alt hover:text-primary'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Icone
                      size={16}
                      strokeWidth={actif ? 2.5 : 2}
                      className="transition-transform duration-300 group-hover:-translate-y-0.5"
                    />
                    <span className="text-[11px] font-bold sm:text-sm">
                      {label}
                    </span>
                  </span>

                  <span
                    className={`min-w-6 rounded-full px-2 py-0.5 text-[11px] font-extrabold transition-colors ${
                      actif
                        ? 'bg-white/15 text-white'
                        : 'bg-surface-alt text-ink-light'
                    }`}
                  >
                    {compteurs[id]}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Résultats */}
        <section className="mt-5" aria-live="polite">
          {commandesTriees.length === 0 ? (
            <EtatVide
              filtre={filtre}
              total={commandesVisibles.length}
              onReset={() => setFiltre('en-cours')}
            />
          ) : (
            <div className="space-y-4">
              {commandesTriees.map((commande, index) => (
                <div
                  key={commande.id}
                  className="commande-card-enter transition-transform duration-300 hover:-translate-y-0.5"
                  style={{
                    animationDelay: `${Math.min(index * 70, 350)}ms`,
                  }}
                >
                  <CardCommande
                    commande={commande}
                    onCommander={handleCommander}
                    onAnnuler={handleAnnuler}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Pied de section */}
        {commandesTriees.length > 0 && (
          <div className="commandes-enter mt-7 flex items-center gap-3 rounded-2xl border border-line bg-surface p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Receipt size={19} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">
                Besoin d'un renseignement ?
              </p>
              <p className="mt-1 text-xs leading-5 text-ink-light">
                Sélectionnez une commande pour consulter ses informations.
              </p>
            </div>

            <ChevronRight
              size={19}
              className="shrink-0 text-ink-light"
            />
          </div>
        )}

        {/* Petit rappel */}
        <div className="mt-6 flex items-center justify-center gap-2 pb-2 text-center text-[11px] text-ink-light">
          <UtensilsCrossed size={14} />
          <span>Merci de votre confiance et bon appétit !</span>
        </div>
      </div>
    </main>
  );
}

function MiniStat({ Icone, valeur, label, couleur, fond }) {
  return (
    <div className="group rounded-2xl border border-line bg-surface p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:p-4">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl ${fond} ${couleur} transition-transform duration-300 group-hover:scale-110`}
      >
        <Icone size={18} />
      </div>

      <p className="mt-3 text-2xl font-black tracking-tight">
        {valeur}
      </p>

      <p className="mt-0.5 text-[10px] font-semibold text-ink-light sm:text-xs">
        {label}
      </p>
    </div>
  );
}

function EtatVide({ filtre, total, onReset }) {
  let titre = 'Aucune commande dans cette section';
  let description =
    'Essayez un autre filtre pour retrouver vos commandes.';

  if (total === 0) {
    titre = 'Votre prochaine envie commence ici !';
    description =
      'Vous n’avez pas encore de commande. Découvrez notre menu et trouvez votre prochain plat préféré.';
  } else if (filtre === 'en-cours') {
    titre = 'Tout est calme pour le moment';
    description =
      'Aucune commande n’est en attente ou en préparation actuellement.';
  } else if (filtre === 'livrees') {
    titre = 'Pas encore de commande livrée';
    description =
      'Vos commandes livrées apparaîtront ici une fois terminées.';
  }

  const Icone = filtre === 'historique' ? History : Receipt;

  return (
    <div className="commandes-enter relative mt-2 overflow-hidden rounded-[28px] border border-line bg-surface px-5 py-10 text-center shadow-sm sm:py-14">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/[0.04]"
      />

      <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] bg-primary/10 text-primary">
        <Icone size={34} strokeWidth={1.6} />
      </div>

      <h3 className="relative mt-6 text-lg font-black tracking-tight sm:text-xl">
        {titre}
      </h3>

      <p className="relative mx-auto mt-2 max-w-sm text-sm leading-6 text-ink-light">
        {description}
      </p>

      {total === 0 ? (
        <button
          type="button"
          onClick={() => {
            window.dispatchEvent(
              new CustomEvent('ouvrir-menu-resto')
            );
          }}
          className="relative mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]"
        >
          Découvrir le menu
          <ArrowRight size={17} />
        </button>
      ) : (
        <button
          type="button"
          onClick={onReset}
          className="relative mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]"
        >
          <RefreshCw size={16} />
          Voir les commandes en cours
        </button>
      )}
    </div>
  );
}
