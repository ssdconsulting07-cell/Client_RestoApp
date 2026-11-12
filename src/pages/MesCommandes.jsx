import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  Receipt,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  Clock3,
  CookingPot,
  CheckCircle2,
  PackageCheck,
  XCircle,
  Truck,
  Store,
  Phone,
  RotateCw,
  Search,
  ShoppingBag,
} from 'lucide-react';
import Header from '../components/Header';
import { useOrder } from '../context/OrderContext';
import { getCommandesParTelephone } from '../api/commandes';
import { formatPrix } from '../utils/format';
import { tempsRelatif } from '../utils/date';
import { normaliserTelephone, formaterTelephone } from '../utils/telephone';
import {
  STATUT_LABELS,
  STATUTS_TERMINAUX,
  ETAPE_LABELS_COURTS,
  etapesPourMode,
  normaliserStatut,
  detailStatut,
  ticketId,
  contenuQrLivraison,
} from '../utils/statuts';

// Meme cadence que les tableaux Cuisine / Livreur (Manager, REFRESH_MS).
const REFRESH_MS = 15000;
const CLE_COMMANDE_ACTIVE = 'senyummies_commande_suivie';

const MOYENS_PAIEMENT = {
  wave: 'Wave',
  'orange-money': 'Orange Money',
  'mixx-yas': 'Mixx by Yas',
  carte: 'Carte bancaire',
  especes: 'Espèces',
};

const APPARENCE = {
  PAYEE: { Icone: Clock3, classes: 'bg-amber-500/10 text-amber-700', point: 'bg-amber-500' },
  EN_PREPARATION: { Icone: CookingPot, classes: 'bg-orange-500/10 text-orange-700', point: 'bg-orange-500' },
  PRETE: { Icone: CheckCircle2, classes: 'bg-violet-500/10 text-violet-700', point: 'bg-violet-500' },
  EN_LIVRAISON: { Icone: Truck, classes: 'bg-sky-500/10 text-sky-700', point: 'bg-sky-500' },
  LIVREE: { Icone: PackageCheck, classes: 'bg-emerald-500/10 text-emerald-700', point: 'bg-emerald-500' },
  RETIREE: { Icone: PackageCheck, classes: 'bg-emerald-500/10 text-emerald-700', point: 'bg-emerald-500' },
  ANNULEE: { Icone: XCircle, classes: 'bg-rose-500/10 text-rose-700', point: 'bg-rose-500' },
};

function lireActive() {
  try {
    return localStorage.getItem(CLE_COMMANDE_ACTIVE);
  } catch {
    return null;
  }
}
function ecrireActive(id) {
  try {
    localStorage.setItem(CLE_COMMANDE_ACTIVE, String(id));
  } catch {
    // non critique
  }
}

function PastilleStatut({ statut }) {
  const s = normaliserStatut(statut);
  const a = APPARENCE[s];
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${a.classes}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${a.point}`} />
      {STATUT_LABELS[s]}
    </span>
  );
}

function SuiviEtapes({ statut, mode }) {
  const s = normaliserStatut(statut);
  const etapes = etapesPourMode(mode);
  const index = etapes.indexOf(s);
  const terminee = STATUTS_TERMINAUX.includes(s);
  return (
    <ol className="mt-5 flex w-full items-start" aria-label="Étapes de la commande">
      {etapes.map((e, i) => {
        const fait = i < index || (terminee && i <= index);
        const courant = i === index && !terminee;
        return (
          <li key={e} className="relative flex min-w-0 flex-1 flex-col items-center text-center">
            {i > 0 && (
              <span
                className={`absolute right-1/2 top-3 h-0.5 w-full${i <= index ? 'bg-primary/70' : 'bg-line'}`}
                aria-hidden="true"
              />
            )}
            <span
              className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-bold ${
                fait
                  ? 'border-primary bg-primary text-white'
                  : courant
                    ? 'border-primary bg-surface text-primary ring-4 ring-primary/15'
                    : 'border-line bg-surface text-ink-light'
              }`}
            >
              {fait ? '✓' : i + 1}
            </span>
            <span className={`mt-1.5 w-full truncate px-0.5 text-[10px] font-semibold ${fait || courant ? 'text-ink' : 'text-ink-light'}`}>
              {ETAPE_LABELS_COURTS[e]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function CommandeSuivie({ commande }) {
  const [details, setDetails] = useState(false);
  const s = normaliserStatut(commande.statut);
  const { Icone, classes } = APPARENCE[s];
  const lignes = Array.isArray(commande.lignes) ? commande.lignes : [];
  const nbArticles = lignes.reduce((t, l) => t + Number(l.quantite || 0), 0);
  const ticket = ticketId(commande);

  return (
    <article className="overflow-hidden rounded-3xl border border-line bg-surface shadow-card">
      <div className="flex items-start justify-between gap-3 border-b border-line bg-primary/[0.04] px-4 py-4">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Ticket</p>
          <p className="truncate text-2xl font-bold tracking-tight">#{ticket}</p>
          <p className="mt-0.5 text-xs text-ink-light">
            {tempsRelatif(commande.creeLe)} · {commande.mode === 'RETRAIT' ? 'À emporter' : 'Livraison'}
          </p>
        </div>
        <PastilleStatut statut={commande.statut} />
      </div>

      <div className="flex flex-col items-center px-4 py-6 text-center">
        <span className={`mb-3 flex h-20 w-20 items-center justify-center rounded-full ${classes}`}>
          <Icone size={38} strokeWidth={1.7} aria-hidden="true" className={s === 'EN_PREPARATION' ? 'animate-[balance_1.8s_ease-in-out_infinite]' : ''} />
        </span>
        <h2 className="text-lg font-bold">{STATUT_LABELS[s]}</h2>
        <p className="mt-1 max-w-sm text-sm leading-6 text-ink-light">{detailStatut(s, commande.mode)}</p>

        {s === 'EN_LIVRAISON' && (
          <div className="mt-4 flex flex-col items-center">
            <div className="rounded-2xl border border-line bg-white p-3 shadow-sm">
              <QRCodeSVG value={contenuQrLivraison(commande)} size={168} level="M" aria-label={`QR code du ticket ${ticket}`} />
            </div>
            <p className="mt-2 text-xs text-ink-light">
              Si le scan échoue, donnez le n° <strong className="text-ink">{ticket}</strong> au livreur.
            </p>
          </div>
        )}

        {s === 'PRETE' && commande.mode === 'RETRAIT' && (
          <p className="mt-4 rounded-2xl bg-primary/10 px-5 py-3 text-sm font-semibold text-primary">
            Au comptoir, annoncez le ticket <span className="text-lg">#{ticket}</span>
          </p>
        )}

        {s !== 'ANNULEE' && <SuiviEtapes statut={s} mode={commande.mode} />}
      </div>

      <div className="border-t border-line">
        <button
          type="button"
          onClick={() => setDetails((d) => !d)}
          aria-expanded={details}
          className="flex min-h-14 w-full items-center justify-between gap-3 px-4 text-left"
        >
          <span>
            <span className="block text-sm font-bold">Détails de la commande</span>
            <span className="text-xs text-ink-light">
              {nbArticles} article{nbArticles > 1 ? 's' : ''} · {formatPrix(commande.total)}
            </span>
          </span>
          <ChevronDown size={18} className={`shrink-0 text-primary transition-transform ${details ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
        {details && (
          <div className="space-y-3 px-4 pb-4 text-sm">
            <ul className="space-y-2">
              {lignes.map((l, i) => (
                <li key={`${l.produitId}-${i}`} className="flex justify-between gap-3">
                  <span className="min-w-0">
                    <span className="font-semibold">{l.quantite}×</span> {l.nom || 'Article'}
                    {l.accompagnementNom && <span className="block text-xs text-ink-light">+ {l.accompagnementNom}</span>}
                  </span>
                  <span className="shrink-0">{formatPrix(Number(l.prixUnitaire || 0) * Number(l.quantite || 1))}</span>
                </li>
              ))}
            </ul>
            <div className="space-y-1 border-t border-line pt-3 text-xs text-ink-light">
              {commande.fraisLivraison > 0 && (
                <p className="flex justify-between gap-3">
                  <span>Livraison{commande.adresseLivraison ? ` (${commande.adresseLivraison})` : ''}</span>
                  <span>{formatPrix(commande.fraisLivraison)}</span>
                </p>
              )}
              {commande.positionLivraison && (
                <p className="flex justify-between gap-3">
                  <span>Position GPS</span>
                  <span>Partagée avec le livreur</span>
                </p>
              )}
              {commande.moyenPaiement && (
                <p className="flex justify-between gap-3">
                  <span>Paiement</span>
                  <span>{MOYENS_PAIEMENT[commande.moyenPaiement] || commande.moyenPaiement}</span>
                </p>
              )}
              {commande.note && <p className="pt-1 italic">« {commande.note} »</p>}
            </div>
            <p className="flex justify-between border-t border-line pt-3 text-base font-bold">
              <span>Total</span>
              <span className="text-primary">{formatPrix(commande.total)}</span>
            </p>
          </div>
        )}
      </div>
    </article>
  );
}

function LigneCommande({ commande, active, onClick }) {
  const s = normaliserStatut(commande.statut);
  const { Icone, classes } = APPARENCE[s];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition active:scale-[0.99] ${
        active ? 'border-primary/40 bg-primary/[0.04]' : 'border-line bg-surface'
      }`}
    >
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${classes}`}>
        <Icone size={20} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold">Ticket #{ticketId(commande)}</span>
        <span className="mt-0.5 block truncate text-xs text-ink-light">
          {tempsRelatif(commande.creeLe)} · {STATUT_LABELS[s]}
        </span>
      </span>
      <span className="shrink-0 text-sm font-bold text-primary">{formatPrix(commande.total)}</span>
      <ChevronRight size={16} className="shrink-0 text-ink-light" aria-hidden="true" />
    </button>
  );
}

function RechercheTelephone({ initial, onValider, onAnnuler }) {
  const [saisie, setSaisie] = useState(initial ? formaterTelephone(initial) : '');
  const [erreur, setErreur] = useState(null);
  const soumettre = (e) => {
    e.preventDefault();
    const tel = normaliserTelephone(saisie);
    if (!tel) {
      setErreur('Numéro sénégalais à 9 chiffres (ex. 77 123 45 67).');
      return;
    }
    onValider(tel);
  };
  return (
    <form onSubmit={soumettre} className="rounded-3xl border border-line bg-surface p-5 shadow-card" noValidate>
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Search size={22} aria-hidden="true" />
      </span>
      <h2 className="text-lg font-bold">Retrouver mes commandes</h2>
      <p className="mt-1 text-sm text-ink-light">Saisissez le numéro utilisé lors de la commande. Aucun compte n'est nécessaire.</p>
      <label htmlFor="tel-recherche" className="mb-1.5 mt-4 block text-xs font-semibold text-ink-light">Téléphone</label>
      <div className="flex">
        <span className="flex min-h-12 items-center rounded-l-xl border border-r-0 border-line bg-surface-alt px-3 text-sm text-ink-light">+221</span>
        <input
          id="tel-recherche"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder="77 123 45 67"
          value={saisie}
          onChange={(e) => {
            setSaisie(e.target.value);
            setErreur(null);
          }}
          className="min-h-12 w-full min-w-0 rounded-r-xl border border-line bg-surface px-3 text-base focus:border-primary focus:outline-none"
        />
      </div>
      {erreur && <p className="mt-1.5 text-xs font-medium text-danger">{erreur}</p>}
      <div className="mt-4 flex gap-2">
        {onAnnuler && (
          <button type="button" onClick={onAnnuler} className="min-h-12 rounded-xl border border-line px-4 text-sm">
            Annuler
          </button>
        )}
        <button type="submit" className="min-h-12 flex-1 rounded-xl bg-primary font-semibold text-white">
          Voir mes commandes
        </button>
      </div>
    </form>
  );
}

export default function MesCommandes() {
  const navigate = useNavigate();
  const location = useLocation();
  const { telephone, setTelephone, oublier } = useOrder();
  const [commandes, setCommandes] = useState([]);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [activeId, setActiveId] = useState(() => location.state?.commandeId || lireActive());
  const [vueToutes, setVueToutes] = useState(false);
  const [changerNumero, setChangerNumero] = useState(false);
  const premierChargement = useRef(true);

  const charger = useCallback(async () => {
    if (!telephone) return;
    if (premierChargement.current) setChargement(true);
    try {
      setCommandes(await getCommandesParTelephone(telephone));
      setErreur(null);
    } catch (err) {
      setErreur(err.message);
    } finally {
      premierChargement.current = false;
      setChargement(false);
    }
  }, [telephone]);

  useEffect(() => {
    premierChargement.current = true;
    setCommandes([]);
    charger();
    // Rafraichissement periodique, suspendu quand l'app est en arriere-plan.
    const tick = () => document.visibilityState === 'visible' && charger();
    const id = setInterval(tick, REFRESH_MS);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [charger]);

  useEffect(() => {
    if (location.state?.commandeId) {
      ecrireActive(location.state.commandeId);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, location.pathname, navigate]);

  // Commande suivie : celle choisie, sinon la plus recente encore en cours,
  // sinon la plus recente.
  const suivie = useMemo(
    () =>
      commandes.find((c) => String(c.id) === String(activeId)) ||
      commandes.find((c) => !STATUTS_TERMINAUX.includes(normaliserStatut(c.statut))) ||
      commandes[0] ||
      null,
    [commandes, activeId]
  );

  const selectionner = (c) => {
    setActiveId(String(c.id));
    ecrireActive(c.id);
    setVueToutes(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const conteneur = 'mx-auto max-w-app px-4 pb-6 pt-[max(1.25rem,env(safe-area-inset-top))] md:pt-8 lg:max-w-6xl lg:px-6';

  if (!telephone || changerNumero) {
    return (
      <main className={conteneur}>
        <Header titre="Mes commandes" sousTitre="Suivez votre commande, de la cuisine à votre porte." />
        <div className="md:mx-auto md:max-w-md md:pt-6">
        <RechercheTelephone
          initial={telephone}
          onValider={(tel) => {
            setTelephone(tel);
            setActiveId(null);
            setChangerNumero(false);
          }}
          onAnnuler={telephone ? () => setChangerNumero(false) : null}
        />
        </div>
      </main>
    );
  }

  if (vueToutes) {
    return (
      <main className={conteneur}>
        <div className="mb-5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setVueToutes(false)}
            aria-label="Retour à la commande suivie"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-line bg-surface"
          >
            <ArrowLeft size={19} />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl font-bold">Toutes mes commandes</h1>
            <p className="text-xs text-ink-light">{commandes.length} commande{commandes.length > 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="space-y-2">
          {commandes.map((c) => (
            <LigneCommande key={c.id} commande={c} active={String(c.id) === String(suivie?.id)} onClick={() => selectionner(c)} />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className={conteneur}>
      <Header titre="Mes commandes" sousTitre="Suivez votre commande, de la cuisine à votre porte." />

      <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-3 py-2 lg:max-w-md">
        <span className="flex min-w-0 items-center gap-2 text-sm">
          <Phone size={15} className="shrink-0 text-primary" aria-hidden="true" />
          <span className="truncate">{formaterTelephone(telephone)}</span>
        </span>
        <span className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={charger}
            aria-label="Actualiser"
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink-light"
          >
            <RotateCw size={16} />
          </button>
          <button type="button" onClick={() => setChangerNumero(true)} className="min-h-10 px-2 text-xs font-bold text-primary">
            Changer
          </button>
        </span>
      </div>

      {erreur && (
        <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-danger" role="alert">
          {erreur}
        </div>
      )}

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-8">
      <div className="min-w-0">
      {chargement ? (
        <div className="h-80 animate-pulse rounded-3xl bg-line/60" aria-busy="true" aria-label="Chargement" />
      ) : suivie ? (
        <>
          <CommandeSuivie commande={suivie} />
          {commandes.length > 1 && (
            <button
              type="button"
              onClick={() => setVueToutes(true)}
              className="mt-4 flex min-h-14 w-full items-center justify-between rounded-2xl border border-line bg-surface px-4 text-left lg:hidden"
            >
              <span>
                <span className="block text-sm font-bold">Toutes mes commandes</span>
                <span className="text-xs text-ink-light">{commandes.length} au total</span>
              </span>
              <ChevronRight size={18} className="text-primary" aria-hidden="true" />
            </button>
          )}
        </>
      ) : (
        !erreur && (
          <div className="rounded-3xl border border-line bg-surface px-5 py-12 text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Receipt size={30} aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-lg font-bold">Aucune commande pour ce numéro</h2>
            <p className="mx-auto mt-2 max-w-xs text-sm text-ink-light">Vos commandes apparaîtront ici dès votre première commande.</p>
            <button
              type="button"
              onClick={() => navigate('/menu')}
              className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white"
            >
              <ShoppingBag size={16} aria-hidden="true" /> Commander
            </button>
          </div>
        )
      )}

      </div>

      {commandes.length > 1 && (
        <aside className="mt-6 hidden lg:sticky lg:top-24 lg:mt-0 lg:block" aria-label="Historique">
          <h2 className="mb-3 text-base font-semibold">Toutes mes commandes <span className="font-normal text-ink-light">({commandes.length})</span></h2>
          <div className="max-h-[calc(100dvh-10rem)] space-y-2 overflow-y-auto pr-1">
            {commandes.map((c) => (
              <LigneCommande key={c.id} commande={c} active={String(c.id) === String(suivie?.id)} onClick={() => selectionner(c)} />
            ))}
          </div>
        </aside>
      )}
      </div>

      <p className="mt-6 text-center">
        <button
          type="button"
          onClick={() => {
            oublier();
            setCommandes([]);
            setActiveId(null);
          }}
          className="min-h-10 px-3 text-xs text-ink-light underline"
        >
          Appareil partagé ? Oublier mon numéro sur cet appareil
        </button>
      </p>

      <p className="mt-2 flex items-center justify-center gap-2 text-center text-[11px] text-ink-light">
        <Store size={13} aria-hidden="true" /> Statut mis à jour automatiquement toutes les 15 secondes.
      </p>
    </main>
  );
}
