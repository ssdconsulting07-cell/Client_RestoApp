import { useMemo, useState } from 'react';
import {
  Receipt,
  Clock3,
  History,
  ListOrdered,
  ShoppingBag,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

import Header from '../components/Header';
import CardCommande from '../components/CardCommande';
import { commandes as commandesMock } from '../data/commandes';
import { joursDepuis } from '../utils/date';
import { useToast } from '../context/ToastContext';

const DELAI_JOURS = 10;

const FILTRES = [
  {
    id: 'actives',
    label: 'En cours',
    Icone: Clock3,
  },
  {
    id: 'historique',
    label: 'Historique',
    Icone: History,
  },
  {
    id: 'tout',
    label: 'Tout',
    Icone: ListOrdered,
  },
];

// Statuts considérés comme actifs.
const STATUTS_ACTIFS = [
  'en-attente',
  'en-preparation',
  'prete',
];

export default function MesCommandes() {
  const { showToast } = useToast();
  const [filtre, setFiltre] = useState('tout');

  // Garder les commandes actives et les commandes récentes.
  const commandesVisibles = useMemo(() => {
    return commandesMock.filter((commande) => {
      if (STATUTS_ACTIFS.includes(commande.statut)) {
        return true;
      }

      return joursDepuis(commande.date) <= DELAI_JOURS;
    });
  }, []);

  // Appliquer le filtre sélectionné.
  const commandesFiltrees = useMemo(() => {
    if (filtre === 'actives') {
      return commandesVisibles.filter((commande) =>
        STATUTS_ACTIFS.includes(commande.statut)
      );
    }

    if (filtre === 'historique') {
      return commandesVisibles.filter(
        (commande) => !STATUTS_ACTIFS.includes(commande.statut)
      );
    }

    return commandesVisibles;
  }, [filtre, commandesVisibles]);

  // Trier les commandes de la plus récente à la plus ancienne.
  const commandesTriees = useMemo(() => {
    return [...commandesFiltrees].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
  }, [commandesFiltrees]);

  // Compter les commandes de chaque catégorie.
  const compteurs = useMemo(() => {
    const actives = commandesVisibles.filter((commande) =>
      STATUTS_ACTIFS.includes(commande.statut)
    ).length;

    const historique = commandesVisibles.length - actives;

    return {
      actives,
      historique,
      tout: commandesVisibles.length,
    };
  }, [commandesVisibles]);

  const handleCommander = (commande) => {
    showToast('Nouvelle commande à partir de #' + commande.id);
    // À compléter plus tard : redirection vers le menu ou le panier.
  };

  const handleAnnuler = (commande) => {
    // Attention : ce message ne modifie pas réellement le statut.
    // Il faudra connecter cette action à l'API pour annuler la commande.
    showToast("Demande d'annulation pour la commande #" + commande.id);
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-surface-alt pb-28 text-ink">
      <div className="mx-auto max-w-5xl px-4 pt-5 sm:px-6">

        {/* En-tête */}
        <Header
          titre="Mes commandes"
          sousTitre="Retrouvez toutes vos commandes"
        />

        {/* Résumé */}
        <section className="relative mt-5 overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary-dark p-5 text-white sm:p-6">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-12 right-20 h-24 w-24 rounded-full bg-black/10" />

          <div className="relative">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                <ShoppingBag size={21} />
              </div>

              <span className="text-xs font-bold uppercase tracking-wider text-white/80">
                Votre espace commandes
              </span>
            </div>

            <div className="mt-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-3xl font-bold">
                  {commandesVisibles.length}
                </p>

                <p className="mt-1 text-sm text-white/80">
                  {commandesVisibles.length > 1
                    ? 'commandes à consulter'
                    : 'commande à consulter'}
                </p>
              </div>

              <div className="rounded-xl bg-white/10 px-3 py-2 text-right">
                <p className="text-lg font-bold">{compteurs.actives}</p>
                <p className="text-[10px] text-white/80">
                  En cours
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Informations sur l'historique */}
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-line bg-surface p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles size={18} />
          </div>

          <div>
            <p className="text-xs font-bold">
              Votre historique
            </p>

            <p className="mt-1 text-xs leading-5 text-ink-light">
              Les commandes terminées ou annulées restent visibles pendant{' '}
              {DELAI_JOURS} jours. Les commandes en cours restent accessibles.
            </p>
          </div>
        </div>

        {/* Filtres */}
        {commandesVisibles.length > 0 && (
          <section className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold">
                Mes commandes
              </h2>

              <span className="text-xs text-ink-light">
                {commandesTriees.length} résultat
                {commandesTriees.length > 1 ? 's' : ''}
              </span>
            </div>

            <div
              className="grid grid-cols-3 gap-2 rounded-2xl border border-line bg-surface p-1.5"
              role="group"
              aria-label="Filtrer les commandes"
            >
              {FILTRES.map(({ id, label, Icone }) => {
                const actif = filtre === id;

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setFiltre(id)}
                    aria-pressed={actif}
                    className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 transition active:scale-[0.98] ${
                      actif
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-ink-light hover:bg-surface-alt hover:text-ink'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Icone size={15} />
                      <span className="text-xs font-bold">
                        {label}
                      </span>
                    </span>

                    <span className={`text-[10px] ${
                      actif ? 'text-white/80' : 'text-ink-light'
                    }`}>
                      {compteurs[id]}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Liste des commandes */}
        <section className="mt-5">
          {commandesTriees.length === 0 ? (
            <EtatVide
              filtre={filtre}
              total={commandesVisibles.length}
              onReset={() => setFiltre('tout')}
            />
          ) : (
            <div className="space-y-4">
              {commandesTriees.map((commande) => (
                <CardCommande
                  key={commande.id}
                  commande={commande}
                  onCommander={handleCommander}
                  onAnnuler={handleAnnuler}
                />
              ))}
            </div>
          )}
        </section>

        {/* Message de bas de page */}
        {commandesTriees.length > 0 && (
          <div className="mt-7 flex items-center justify-center gap-2 rounded-xl bg-surface px-4 py-4 text-center">
            <Receipt size={17} className="shrink-0 text-primary" />

            <p className="text-xs leading-5 text-ink-light">
              Retrouvez ici le suivi et l'historique de vos commandes.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

function EtatVide({ filtre, total, onReset }) {
  const message =
    total === 0
      ? {
          titre: 'Aucune commande pour le moment',
          description:
            'Vos prochaines commandes apparaîtront ici. Découvrez notre menu et choisissez vos plats préférés.',
        }
      : filtre === 'actives'
        ? {
            titre: 'Aucune commande en cours',
            description:
              "Vous n'avez aucune commande en attente ou en préparation pour le moment.",
          }
        : {
            titre: 'Aucune commande dans cette section',
            description:
              'Essayez un autre filtre pour consulter vos commandes.',
          };

  return (
    <div className="flex flex-col items-center rounded-3xl border border-line bg-surface px-5 py-10 text-center sm:py-12">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        {filtre === 'historique' ? (
          <History size={29} strokeWidth={1.7} />
        ) : (
          <Receipt size={29} strokeWidth={1.7} />
        )}
      </div>

      <h3 className="text-lg font-bold">
        {message.titre}
      </h3>

      <p className="mt-2 max-w-xs text-sm leading-6 text-ink-light">
        {message.description}
      </p>

      {filtre !== 'tout' && (
        <button
          type="button"
          onClick={onReset}
          className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white transition hover:brightness-110 active:scale-[0.98]"
        >
          Voir toutes les commandes
          <ArrowRight size={16} />
        </button>
      )}
    </div>
  );
}