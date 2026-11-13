import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  Receipt,
  ChevronDown,
  Clock3,
  CookingPot,
  CheckCircle2,
  PackageCheck,
  XCircle,
  Truck,
  Store,
  RotateCw,
  Search,
  ShoppingBag,
  QrCode,
  MapPin,
  Wallet,
  X,
} from 'lucide-react';
import BoutonNotif from '../components/BoutonNotif';
import { SqueletteCommandes, SqueletteHistorique } from '../components/EtatChargement';
import { useOrder } from '../context/OrderContext';
import { useToast } from '../context/ToastContext';
import { getCommandesParTelephone, relancerPaiement } from '../api/commandes';
import { jetonDe } from '../utils/suivi';
import { urlPaiementSure } from '../utils/paiement';
import { formatPrix } from '../utils/format';
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

const MOYENS_PAIEMENT = {
  wave: 'Wave',
  'orange-money': 'Orange Money',
  'mixx-yas': 'Mixx by Yas',
  carte: 'Carte bancaire',
  especes: 'Espèces',
};

const APPARENCE = {
  CREEE: { Icone: Wallet, classes: 'bg-slate-500/10 text-slate-700', point: 'bg-slate-500' },
  PAYEE: { Icone: Clock3, classes: 'bg-amber-500/10 text-amber-700', point: 'bg-amber-500' },
  EN_PREPARATION: { Icone: CookingPot, classes: 'bg-orange-500/10 text-orange-700', point: 'bg-orange-500' },
  PRETE: { Icone: CheckCircle2, classes: 'bg-violet-500/10 text-violet-700', point: 'bg-violet-500' },
  EN_LIVRAISON: { Icone: Truck, classes: 'bg-sky-500/10 text-sky-700', point: 'bg-sky-500' },
  LIVREE: { Icone: PackageCheck, classes: 'bg-emerald-500/10 text-emerald-700', point: 'bg-emerald-500' },
  RETIREE: { Icone: PackageCheck, classes: 'bg-emerald-500/10 text-emerald-700', point: 'bg-emerald-500' },
  ANNULEE: { Icone: XCircle, classes: 'bg-rose-500/10 text-rose-700', point: 'bg-rose-500' },
};

const estTerminee = (c) => STATUTS_TERMINAUX.includes(normaliserStatut(c.statut));
const lignesDe = (c) => (Array.isArray(c.lignes) ? c.lignes : []);
const nbArticles = (c) => lignesDe(c).reduce((t, l) => t + Number(l.quantite || 0), 0);
const pluriel = (n, mot) => `${n} ${mot}${n > 1 ? 's' : ''}`;
const sansAccents = (t) =>
  String(t || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

// --- Dates ---------------------------------------------------------------

const debutJour = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

function heure(iso) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '--:--' : d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function libelleJour(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Date inconnue';
  const ecart = Math.round((debutJour(new Date()) - debutJour(d)) / 86400000);
  if (ecart === 0) return "Aujourd'hui";
  if (ecart === 1) return 'Hier';
  const texte = d.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    ...(d.getFullYear() !== new Date().getFullYear() ? { year: 'numeric' } : {}),
  });
  return texte.charAt(0).toUpperCase() + texte.slice(1);
}

// "à 14:32" (aujourd'hui) ou "hier à 14:32", "mardi 11 novembre à 14:32".
function momentCommande(iso) {
  const jour = libelleJour(iso);
  return jour === "Aujourd'hui" ? `à ${heure(iso)}` : `${jour.toLowerCase()} à ${heure(iso)}`;
}

// --- Elements communs ------------------------------------------------------

function PastilleStatut({ statut, petite = false }) {
  const s = normaliserStatut(statut);
  const a = APPARENCE[s];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full font-bold ${a.classes} ${
        petite ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${a.point}`} />
      {STATUT_LABELS[s]}
    </span>
  );
}

// Progression : une barre segmentee et UNE phrase (etape courante + suivante),
// plutot que cinq libelles a lire d'un coup.
function Progression({ statut, mode }) {
  const s = normaliserStatut(statut);
  const etapes = etapesPourMode(mode);
  const index = Math.max(0, etapes.indexOf(s));
  const suivante = etapes[index + 1];
  return (
    <div>
      <div
        className="flex gap-1.5"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={etapes.length}
        aria-valuenow={index + 1}
        aria-valuetext={`Étape ${index + 1} sur ${etapes.length} : ${ETAPE_LABELS_COURTS[s]}`}
      >
        {etapes.map((e, i) => (
          <span key={e} className={`h-1.5 flex-1 rounded-full ${i <= index ? 'bg-primary' : 'bg-line'}`} />
        ))}
      </div>
      <p className="mt-2 text-xs text-ink-light">
        Étape {index + 1} sur {etapes.length}
        {suivante && (
          <>
            {' · '}ensuite : <span className="font-semibold text-ink">{ETAPE_LABELS_COURTS[suivante]}</span>
          </>
        )}
      </p>
    </div>
  );
}

// Zone de remise : n'apparait que quand elle sert. Livraison : QR presente
// au livreur (une fois en route). Retrait : numero a annoncer au comptoir.
function ZoneRemise({ commande }) {
  const s = normaliserStatut(commande.statut);
  const ticket = ticketId(commande);
  if (STATUTS_TERMINAUX.includes(s)) return null;

  if (commande.mode === 'RETRAIT') {
    return (
      <div className={`rounded-2xl p-5 text-center ${s === 'PRETE' ? 'bg-primary/10' : 'bg-surface-alt'}`}>
        <p className="text-xs font-semibold text-ink-light">
          {s === 'PRETE' ? 'À annoncer au comptoir' : 'Votre numéro de retrait'}
        </p>
        <p className={`mt-1 text-4xl font-bold tracking-tight ${s === 'PRETE' ? 'text-primary' : 'text-ink'}`}>#{ticket}</p>
      </div>
    );
  }

  if (s === 'EN_LIVRAISON') {
    return (
      <div className="flex flex-col items-center rounded-2xl bg-sky-500/[0.06] p-5 text-center">
        <div className="rounded-2xl border border-line bg-white p-3 shadow-sm">
          <QRCodeSVG value={contenuQrLivraison(commande)} size={176} level="M" aria-label={`QR code du ticket ${ticket}`} />
        </div>
        <p className="mt-3 text-sm font-semibold">Présentez ce QR code au livreur</p>
        <p className="mt-0.5 text-xs text-ink-light">
          Si le scan échoue, donnez-lui le n° <strong className="text-ink">{ticket}</strong>.
        </p>
      </div>
    );
  }

  // Avant le depart du livreur : une seule ligne discrete.
  return (
    <p className="flex items-center gap-2 text-xs text-ink-light">
      <QrCode size={15} className="shrink-0" aria-hidden="true" />
      Votre QR code de remise s’affichera ici quand le livreur partira.
    </p>
  );
}

function DetailCommande({ commande }) {
  return (
    <div className="space-y-3 text-sm">
      <ul className="space-y-2.5">
        {lignesDe(commande).map((l, i) => (
          <li key={`${l.produitId}-${i}`} className="flex justify-between gap-3">
            <span className="min-w-0">
              <span className="font-semibold">{l.quantite}×</span> {l.nom || 'Article'}
              {l.accompagnementNom && <span className="block text-xs text-ink-light">+ {l.accompagnementNom}</span>}
            </span>
            <span className="shrink-0">{formatPrix(Number(l.prixUnitaire || 0) * Number(l.quantite || 1))}</span>
          </li>
        ))}
      </ul>
      <div className="space-y-1.5 border-t border-line pt-3 text-xs text-ink-light">
        {commande.mode === 'LIVRAISON' && (
          <p className="flex justify-between gap-3">
            <span>Livraison{commande.adresseLivraison ? ` · ${commande.adresseLivraison}` : ''}</span>
            <span>{formatPrix(commande.fraisLivraison || 0)}</span>
          </p>
        )}
        {commande.moyenPaiement && (
          <p className="flex justify-between gap-3">
            <span>Paiement</span>
            <span>{MOYENS_PAIEMENT[commande.moyenPaiement] || commande.moyenPaiement} · payé</span>
          </p>
        )}
        {commande.positionLivraison && (
          <p className="flex items-center gap-1">
            <MapPin size={12} aria-hidden="true" /> Position GPS partagée avec le livreur
          </p>
        )}
        {commande.note && <p className="pt-1 italic">« {commande.note} »</p>}
      </div>
      <p className="flex justify-between border-t border-line pt-3 text-base font-bold">
        <span>Total</span>
        <span className="text-primary">{formatPrix(commande.total)}</span>
      </p>
    </div>
  );
}

// --- Onglet "En cours" : une carte aeree par commande -----------------------
// Lecture de haut en bas : quoi (ticket, mode) -> ou en est-elle (statut +
// une phrase) -> progression -> ce que je dois faire (remise) -> detail
// replie. Une seule information mise en avant a la fois.
// Commande en attente de paiement : relance possible depuis l'appareil qui a
// passe la commande (jeton de suivi), page securisee du prestataire.
function PaiementEnAttente({ commande, onActualiser }) {
  const { showToast } = useToast();
  const [envoi, setEnvoi] = useState(false);
  const jeton = jetonDe(commande.id);
  if (!jeton) {
    return (
      <p className="rounded-2xl bg-surface-alt p-4 text-sm text-ink-light">
        Finalisez le paiement depuis l’appareil utilisé pour commander.
      </p>
    );
  }
  const payer = async () => {
    setEnvoi(true);
    try {
      const r = await relancerPaiement(commande.id, jeton);
      const url = urlPaiementSure(r?.redirectUrl);
      if (url) {
        window.location.assign(url);
        return;
      }
      showToast('Paiement relancé.', { type: 'info' });
      await onActualiser?.();
    } catch (err) {
      showToast(err.message || 'Le paiement n’a pas pu être relancé.', { type: 'erreur' });
    } finally {
      setEnvoi(false);
    }
  };
  return (
    <button
      type="button"
      onClick={payer}
      disabled={envoi}
      className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-semibold text-white disabled:opacity-60"
    >
      <Wallet size={18} aria-hidden="true" />
      {envoi ? 'Ouverture du paiement…' : 'Payer maintenant'}
    </button>
  );
}

function CarteEnCours({ commande, nouvelle = false, onActualiser }) {
  const [detail, setDetail] = useState(false);
  const s = normaliserStatut(commande.statut);
  const { Icone, classes } = APPARENCE[s];
  const n = nbArticles(commande);

  return (
    <article
      className={`space-y-6 rounded-3xl border bg-surface p-5 shadow-card sm:p-6 ${
        nouvelle ? 'border-primary/40 ring-4 ring-primary/10' : 'border-line'
      }`}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-bold leading-tight">Ticket #{ticketId(commande)}</h2>
          <p className="mt-1 truncate text-xs text-ink-light">
            {commande.mode === 'RETRAIT'
              ? 'À emporter'
              : `Livraison${commande.adresseLivraison ? ` · ${commande.adresseLivraison}` : ''}`}
          </p>
        </div>
        <p className="shrink-0 text-base font-bold text-primary">{formatPrix(commande.total)}</p>
      </header>

      <div className="flex items-center gap-4">
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${classes}`}>
          <Icone size={22} aria-hidden="true" className={s === 'EN_PREPARATION' ? 'animate-[balance_1.8s_ease-in-out_infinite]' : ''} />
        </span>
        <div className="min-w-0">
          <p className="font-semibold">{STATUT_LABELS[s]}</p>
          <p className="text-sm leading-snug text-ink-light">{detailStatut(s, commande.mode, commande.statutPaiement)}</p>
        </div>
      </div>

      {s === 'CREEE' ? (
        <PaiementEnAttente commande={commande} onActualiser={onActualiser} />
      ) : (
        <>
          <Progression statut={s} mode={commande.mode} />
          <ZoneRemise commande={commande} />
        </>
      )}

      <div className="-mx-1 border-t border-line pt-1">
        <button
          type="button"
          onClick={() => setDetail((d) => !d)}
          aria-expanded={detail}
          className="flex min-h-12 w-full items-center justify-between gap-3 px-1 text-left text-sm font-semibold"
        >
          <span className="min-w-0 truncate">
            {detail ? 'Masquer le détail' : 'Voir le détail'}
            <span className="font-normal text-ink-light">
              {' · '}
              {pluriel(n, 'article')} · {momentCommande(commande.creeLe)}
            </span>
          </span>
          <ChevronDown size={18} className={`shrink-0 text-primary transition-transform ${detail ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
        {detail && (
          <div className="px-1 pb-1 pt-2">
            <DetailCommande commande={commande} />
          </div>
        )}
      </div>
    </article>
  );
}

// --- Onglet "Terminees" : historique ------------------------------------------
// Groupe par jour, une ligne par commande (heure, ticket, statut, total),
// depliable pour le detail ; recherche sur le ticket, un plat, la zone ou le
// statut.

function correspond(commande, terme) {
  const t = sansAccents(terme).replace(/^#/, '');
  if (!t) return true;
  const champs = [
    ticketId(commande),
    commande.adresseLivraison,
    STATUT_LABELS[normaliserStatut(commande.statut)],
    commande.mode === 'RETRAIT' ? 'à emporter retrait' : 'livraison',
    ...lignesDe(commande).map((l) => `${l.nom} ${l.accompagnementNom || ''}`),
  ];
  return champs.some((c) => sansAccents(c).includes(t));
}

function LigneHistorique({ commande }) {
  const [ouverte, setOuverte] = useState(false);
  const s = normaliserStatut(commande.statut);
  const lignes = lignesDe(commande);
  const resume = lignes
    .slice(0, 2)
    .map((l) => l.nom)
    .filter(Boolean)
    .join(', ');
  const reste = lignes.length - 2;
  return (
    <li>
      <button
        type="button"
        onClick={() => setOuverte((o) => !o)}
        aria-expanded={ouverte}
        className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-surface-alt/60 sm:gap-4 sm:px-5"
      >
        <span className="w-11 shrink-0 text-sm font-bold tabular-nums">{heure(commande.creeLe)}</span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm font-semibold">Ticket #{ticketId(commande)}</span>
            <PastilleStatut statut={s} petite />
          </span>
          <span className="mt-0.5 block truncate text-xs text-ink-light">
            {resume || pluriel(nbArticles(commande), 'article')}
            {reste > 0 ? ` +${reste}` : ''}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-1.5 text-sm font-bold">
          {formatPrix(commande.total)}
          <ChevronDown size={16} className={`text-ink-light transition-transform ${ouverte ? 'rotate-180' : ''}`} aria-hidden="true" />
        </span>
      </button>
      {ouverte && (
        <div className="border-t border-dashed border-line bg-surface-alt/40 px-4 py-4 sm:px-5">
          <p className="mb-3 text-xs text-ink-light">{detailStatut(s, commande.mode, commande.statutPaiement)}</p>
          <DetailCommande commande={commande} />
        </div>
      )}
    </li>
  );
}

function Historique({ commandes }) {
  const [terme, setTerme] = useState('');
  const groupes = useMemo(() => {
    const triees = commandes
      .filter((c) => correspond(c, terme.trim()))
      .sort((a, b) => new Date(b.creeLe) - new Date(a.creeLe));
    const parJour = new Map();
    for (const c of triees) {
      const jour = libelleJour(c.creeLe);
      if (!parJour.has(jour)) parJour.set(jour, []);
      parJour.get(jour).push(c);
    }
    return [...parJour.entries()];
  }, [commandes, terme]);
  const nbTrouvees = groupes.reduce((t, [, l]) => t + l.length, 0);

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="recherche-historique" className="sr-only">
          Rechercher dans l'historique
        </label>
        <div className="flex min-h-12 items-center gap-3 rounded-2xl border border-line bg-surface px-4 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
          <Search size={18} className="shrink-0 text-ink-light" aria-hidden="true" />
          <input
            id="recherche-historique"
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            value={terme}
            onChange={(e) => setTerme(e.target.value)}
            placeholder="N° de ticket, plat, zone…"
            className="min-w-0 flex-1 bg-transparent py-3 outline-none placeholder:text-ink-light"
          />
          {terme && (
            <button
              type="button"
              onClick={() => setTerme('')}
              aria-label="Effacer la recherche"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-line/70 text-ink-light"
            >
              <X size={16} />
            </button>
          )}
        </div>
        {terme.trim() && (
          <p className="mt-2 px-1 text-xs text-ink-light" aria-live="polite">
            {nbTrouvees
              ? `${nbTrouvees} commande${nbTrouvees > 1 ? 's' : ''} trouvée${nbTrouvees > 1 ? 's' : ''}`
              : 'Aucune commande ne correspond à cette recherche.'}
          </p>
        )}
      </div>

      {groupes.map(([jour, liste]) => (
        <section key={jour} aria-label={jour}>
          <h3 className="mb-2.5 px-1 text-xs font-bold uppercase tracking-wider text-ink-light">{jour}</h3>
          <ul className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-surface shadow-card">
            {liste.map((c) => (
              <LigneHistorique key={c.id} commande={c} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

// --- Recherche par numero ---------------------------------------------------

function RechercheTelephone({ initial, onValider, onAnnuler }) {
  const [saisie, setSaisie] = useState(initial ? formaterTelephone(initial) : '');
  const [quitte, setQuitte] = useState(false);
  const valide = Boolean(normaliserTelephone(saisie));
  const montrerErreur = quitte && saisie.trim() && !valide;

  const soumettre = (e) => {
    e.preventDefault();
    const tel = normaliserTelephone(saisie);
    if (tel) onValider(tel);
  };

  return (
    <form onSubmit={soumettre} className="rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-6" noValidate>
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Search size={22} aria-hidden="true" />
      </span>
      <h2 className="text-lg font-bold">Retrouver mes commandes</h2>
      <p className="mt-1 text-sm text-ink-light">Saisissez le numéro utilisé lors de la commande. Aucun compte n'est nécessaire.</p>
      <label htmlFor="tel-recherche" className="mb-1.5 mt-5 block text-xs font-semibold text-ink-light">
        Téléphone *
      </label>
      <div className="flex">
        <span className="flex min-h-12 items-center rounded-l-xl border border-r-0 border-line bg-surface-alt px-3 text-sm text-ink-light">+221</span>
        <input
          id="tel-recherche"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder="77 123 45 67"
          required
          value={saisie}
          onChange={(e) => setSaisie(e.target.value)}
          onBlur={() => setQuitte(true)}
          aria-invalid={Boolean(montrerErreur)}
          aria-describedby="tel-recherche-aide"
          className={`min-h-12 w-full min-w-0 rounded-r-xl border bg-surface px-3 text-base focus:border-primary focus:outline-none ${
            montrerErreur ? 'border-danger' : 'border-line'
          }`}
        />
      </div>
      <p id="tel-recherche-aide" className={`mt-1.5 text-xs ${montrerErreur ? 'font-medium text-danger' : 'text-ink-light'}`}>
        {montrerErreur ? 'Numéro sénégalais à 9 chiffres (ex. 77 123 45 67).' : '9 chiffres, sans le +221.'}
      </p>
      <div className="mt-5 flex gap-2">
        {onAnnuler && (
          <button type="button" onClick={onAnnuler} className="min-h-12 rounded-xl border border-line px-4 text-sm">
            Annuler
          </button>
        )}
        <button
          type="submit"
          disabled={!valide}
          className="min-h-12 flex-1 rounded-xl bg-primary font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:bg-ink/15 disabled:text-ink/45"
        >
          Voir mes commandes
        </button>
      </div>
    </form>
  );
}

function EtatVide({ titre, texte, onCommander }) {
  return (
    <div className="rounded-3xl border border-line bg-surface px-5 py-12 text-center">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Receipt size={30} aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-lg font-bold">{titre}</h2>
      <p className="mx-auto mt-2 max-w-xs text-sm text-ink-light">{texte}</p>
      {onCommander && (
        <button
          type="button"
          onClick={onCommander}
          className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white"
        >
          <ShoppingBag size={16} aria-hidden="true" /> Commander
        </button>
      )}
    </div>
  );
}

export default function MesCommandes() {
  const navigate = useNavigate();
  const location = useLocation();
  const { telephone, setTelephone, oublier } = useOrder();
  const [commandes, setCommandes] = useState([]);
  const [chargement, setChargement] = useState(false);
  const [actualisation, setActualisation] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [onglet, setOnglet] = useState(null); // 'en-cours' | 'terminees' (null = automatique)
  const [changerNumero, setChangerNumero] = useState(false);
  const [nouvelleId, setNouvelleId] = useState(() => location.state?.commandeId || null);
  const premierChargement = useRef(true);
  const { showToast } = useToast();
  // Statuts connus, pour annoncer un changement detecte au rafraichissement.
  const statutsConnus = useRef(new Map());

  const charger = useCallback(async () => {
    if (!telephone) return;
    if (premierChargement.current) setChargement(true);
    try {
      const liste = await getCommandesParTelephone(telephone);
      // Changement de statut depuis le dernier passage : toast (sauf au
      // premier chargement, ou tout serait "nouveau").
      const connus = statutsConnus.current;
      const changees = connus.size
        ? liste.filter((c) => connus.has(c.id) && connus.get(c.id) !== normaliserStatut(c.statut))
        : [];
      statutsConnus.current = new Map(liste.map((c) => [c.id, normaliserStatut(c.statut)]));
      if (changees.length === 1) {
        const c = changees[0];
        const s = normaliserStatut(c.statut);
        showToast(`Ticket #${ticketId(c)} : ${STATUT_LABELS[s].toLowerCase()}`, { type: s === 'ANNULEE' ? 'alerte' : 'info' });
      } else if (changees.length > 1) {
        showToast(`${changees.length} commandes ont changé de statut`, { type: 'info' });
      }
      setCommandes(liste);
      setErreur(null);
      // 'annonce' : un toast de changement de statut vient d'etre affiche
      // (l'actualisation manuelle ne le remplace pas par "Commandes a jour").
      return changees.length ? 'annonce' : 'ok';
    } catch (err) {
      setErreur(err.message);
      return 'echec';
    } finally {
      premierChargement.current = false;
      setChargement(false);
    }
  }, [telephone, showToast]);

  useEffect(() => {
    premierChargement.current = true;
    statutsConnus.current = new Map();
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

  // Commande tout juste passee : on la met en avant puis on nettoie l'URL.
  useEffect(() => {
    if (location.state?.commandeId) {
      setNouvelleId(location.state.commandeId);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, location.pathname, navigate]);

  const enCours = useMemo(() => {
    const liste = commandes
      .filter((c) => !estTerminee(c))
      .sort((a, b) => new Date(b.creeLe) - new Date(a.creeLe));
    // La commande qui vient d'etre passee en premier.
    const estNouvelle = (c) => (String(c.id) === String(nouvelleId) ? 1 : 0);
    return nouvelleId ? [...liste].sort((a, b) => estNouvelle(b) - estNouvelle(a)) : liste;
  }, [commandes, nouvelleId]);
  const terminees = useMemo(() => commandes.filter(estTerminee), [commandes]);
  const ongletActif = onglet || (enCours.length || !terminees.length ? 'en-cours' : 'terminees');

  const actualiser = async () => {
    setActualisation(true);
    const resultat = await charger();
    setActualisation(false);
    if (resultat === 'ok') showToast('Commandes à jour');
    else if (resultat === 'echec') showToast('Actualisation impossible. Vérifiez votre connexion.', { type: 'erreur' });
  };

  const conteneur = 'mx-auto max-w-app px-4 pb-6 pt-[max(1.25rem,env(safe-area-inset-top))] md:pt-8 lg:max-w-4xl lg:px-6';

  if (!telephone || changerNumero) {
    return (
      <main className={conteneur}>
        <EnTete />
        <div className="md:mx-auto md:max-w-md md:pt-4">
          <RechercheTelephone
            initial={telephone}
            onValider={(tel) => {
              setTelephone(tel);
              setChangerNumero(false);
              setOnglet(null);
            }}
            onAnnuler={telephone ? () => setChangerNumero(false) : null}
          />
        </div>
      </main>
    );
  }

  const onglets = [
    { id: 'en-cours', label: 'En cours', nb: enCours.length },
    { id: 'terminees', label: 'Historique', nb: terminees.length },
  ];

  return (
    <main className={conteneur}>
      <EnTete>
        <span className="flex flex-wrap items-center gap-x-1 text-xs text-ink-light md:text-sm">
          Pour le <strong className="text-ink">{formaterTelephone(telephone)}</strong> ·
          <button type="button" onClick={() => setChangerNumero(true)} className="min-h-8 font-semibold text-primary">
            Changer
          </button>
        </span>
      </EnTete>

      <div className="mb-6 flex items-center gap-2">
        <div className="flex flex-1 rounded-2xl bg-surface-alt p-1" role="tablist" aria-label="Mes commandes">
          {onglets.map((o) => (
            <button
              key={o.id}
              type="button"
              role="tab"
              aria-selected={ongletActif === o.id}
              onClick={() => setOnglet(o.id)}
              className={`min-h-11 flex-1 rounded-xl text-sm font-semibold transition-colors ${
                ongletActif === o.id ? 'bg-surface text-ink shadow-card' : 'text-ink-light'
              }`}
            >
              {o.label}
              <span className={`ml-1.5 rounded-full px-1.5 text-xs ${ongletActif === o.id ? 'bg-primary/10 text-primary' : 'bg-line/70'}`}>
                {chargement ? '·' : o.nb}
              </span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={actualiser}
          disabled={actualisation}
          aria-label="Actualiser"
          title="Actualiser"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-line bg-surface text-ink-light"
        >
          <RotateCw size={18} className={actualisation ? 'animate-spin' : ''} />
        </button>
      </div>

      {erreur && (
        <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-danger" role="alert">
          {erreur}
        </div>
      )}

      {chargement ? (
        ongletActif === 'terminees' ? <SqueletteHistorique /> : <SqueletteCommandes nb={1} />
      ) : ongletActif === 'en-cours' ? (
        enCours.length ? (
          <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
            {enCours.map((c) => (
              <CarteEnCours key={c.id} commande={c} nouvelle={String(c.id) === String(nouvelleId)} onActualiser={charger} />
            ))}
          </div>
        ) : (
          !erreur && (
            <EtatVide
              titre="Aucune commande en cours"
              texte={terminees.length ? 'Vos commandes passées sont dans l’onglet « Historique ».' : 'Vos commandes apparaîtront ici dès votre première commande.'}
              onCommander={() => navigate('/menu')}
            />
          )
        )
      ) : terminees.length ? (
        <Historique commandes={terminees} />
      ) : (
        !erreur && <EtatVide titre="Historique vide" texte="Vos commandes livrées, retirées ou annulées s’afficheront ici." />
      )}

      <footer className="mt-10 space-y-1 border-t border-line pt-4 text-center text-[11px] text-ink-light">
        <p className="flex items-center justify-center gap-1.5">
          <Store size={13} aria-hidden="true" /> Statut mis à jour automatiquement toutes les 15 secondes.
        </p>
        <button
          type="button"
          onClick={() => {
            oublier();
            setCommandes([]);
            showToast('Numéro oublié sur cet appareil');
          }}
          className="min-h-10 px-3 underline"
        >
          Appareil partagé ? Oublier mon numéro sur cet appareil
        </button>
      </footer>
    </main>
  );
}

function EnTete({ children }) {
  return (
    <header className="mb-5 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold sm:text-2xl lg:text-3xl">Mes commandes</h1>
        {children || <p className="mt-1 text-xs text-ink-light md:text-sm">Suivez votre commande, de la cuisine à votre porte.</p>}
      </div>
      <div className="shrink-0 md:hidden">
        <BoutonNotif />
      </div>
    </header>
  );
}
