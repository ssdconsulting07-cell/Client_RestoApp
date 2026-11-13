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
} from 'lucide-react';
import BoutonNotif from '../components/BoutonNotif';
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

const estTerminee = (c) => STATUTS_TERMINAUX.includes(normaliserStatut(c.statut));

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
    <ol className="flex w-full items-start" aria-label="Étapes de la commande">
      {etapes.map((e, i) => {
        const fait = i < index || (terminee && i <= index);
        const courant = i === index && !terminee;
        return (
          <li key={e} className="relative flex min-w-0 flex-1 flex-col items-center text-center">
            {i > 0 && (
              <span
                className={`absolute right-1/2 top-3 h-0.5 w-full ${i <= index ? 'bg-primary' : 'bg-line'}`}
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

// Zone de remise : toujours au meme endroit de la carte, pour que le client
// sache ou regarder. Livraison : QR presente au livreur (affiche quand la
// commande est en route, emplacement reserve avant). Retrait : numero a
// annoncer au comptoir.
function ZoneRemise({ commande }) {
  const s = normaliserStatut(commande.statut);
  const ticket = ticketId(commande);
  if (s === 'ANNULEE' || s === 'LIVREE' || s === 'RETIREE') return null;

  if (commande.mode === 'RETRAIT') {
    return (
      <div className={`rounded-2xl p-4 text-center ${s === 'PRETE' ? 'bg-primary/10' : 'bg-surface-alt'}`}>
        <p className="text-xs font-semibold text-ink-light">
          {s === 'PRETE' ? 'À annoncer au comptoir' : 'Votre numéro de retrait'}
        </p>
        <p className={`mt-1 text-3xl font-bold tracking-tight ${s === 'PRETE' ? 'text-primary' : 'text-ink'}`}>#{ticket}</p>
      </div>
    );
  }

  if (s === 'EN_LIVRAISON') {
    return (
      <div className="flex flex-col items-center rounded-2xl bg-sky-500/[0.06] p-4 text-center">
        <div className="rounded-2xl border border-line bg-white p-3 shadow-sm">
          <QRCodeSVG value={contenuQrLivraison(commande)} size={168} level="M" aria-label={`QR code du ticket ${ticket}`} />
        </div>
        <p className="mt-2 text-sm font-semibold">Présentez ce QR code au livreur</p>
        <p className="text-xs text-ink-light">
          Si le scan échoue, donnez-lui le n° <strong className="text-ink">{ticket}</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl border-2 border-dashed border-line p-4">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-alt text-ink-light">
        <QrCode size={24} aria-hidden="true" />
      </span>
      <p className="text-xs text-ink-light">
        <strong className="block text-sm text-ink">QR code de remise</strong>
        Il apparaîtra ici quand le livreur sera en route. Vous le présenterez à la livraison.
      </p>
    </div>
  );
}

function DetailCommande({ commande }) {
  const lignes = Array.isArray(commande.lignes) ? commande.lignes : [];
  return (
    <div className="space-y-3 text-sm">
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

// Carte d'une commande — meme structure pour toutes : en-tete (ticket,
// statut, total), etapes, message, zone de remise, detail repliable.
function CarteCommande({ commande, compacte = false, ouverteParDefaut = false }) {
  const [ouverte, setOuverte] = useState(ouverteParDefaut);
  const s = normaliserStatut(commande.statut);
  const { Icone, classes } = APPARENCE[s];
  const lignes = Array.isArray(commande.lignes) ? commande.lignes : [];
  const nbArticles = lignes.reduce((t, l) => t + Number(l.quantite || 0), 0);
  const deplie = !compacte || ouverte;

  const entete = (
    <div className="flex items-start gap-3">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${classes}`}>
        <Icone size={20} aria-hidden="true" className={s === 'EN_PREPARATION' ? 'animate-[balance_1.8s_ease-in-out_infinite]' : ''} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-base font-bold">Ticket #{ticketId(commande)}</span>
          <PastilleStatut statut={commande.statut} />
        </span>
        <span className="mt-0.5 block truncate text-xs text-ink-light">
          {tempsRelatif(commande.creeLe)} · {commande.mode === 'RETRAIT' ? 'À emporter' : `Livraison${commande.adresseLivraison ? ` · ${commande.adresseLivraison}` : ''}`}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-1 text-sm font-bold text-primary">
        {formatPrix(commande.total)}
        {compacte && (
          <ChevronDown size={16} className={`text-ink-light transition-transform ${ouverte ? 'rotate-180' : ''}`} aria-hidden="true" />
        )}
      </span>
    </div>
  );

  return (
    <article className="overflow-hidden rounded-3xl border border-line bg-surface shadow-card">
      {compacte ? (
        <button type="button" onClick={() => setOuverte((o) => !o)} aria-expanded={ouverte} className="block w-full p-4 text-left">
          {entete}
        </button>
      ) : (
        <div className="p-4">{entete}</div>
      )}

      {deplie && (
        <div className="space-y-4 border-t border-line p-4">
          {s !== 'ANNULEE' && <SuiviEtapes statut={s} mode={commande.mode} />}
          <div>
            <h3 className="text-sm font-semibold">{STATUT_LABELS[s]}</h3>
            <p className="text-sm text-ink-light">{detailStatut(s, commande.mode)}</p>
          </div>
          <ZoneRemise commande={commande} />
          {compacte ? (
            <DetailCommande commande={commande} />
          ) : (
            <details className="group rounded-2xl bg-surface-alt/70 px-4 py-1 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold">
                <span>
                  Détail · {nbArticles} article{nbArticles > 1 ? 's' : ''}
                </span>
                <ChevronDown size={16} className="text-primary transition-transform group-open:rotate-180" aria-hidden="true" />
              </summary>
              <div className="pb-4">
                <DetailCommande commande={commande} />
              </div>
            </details>
          )}
        </div>
      )}
    </article>
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

  // Commande tout juste passee : on la met en avant puis on nettoie l'URL.
  useEffect(() => {
    if (location.state?.commandeId) {
      setNouvelleId(location.state.commandeId);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, location.pathname, navigate]);

  const enCours = useMemo(() => {
    const liste = commandes.filter((c) => !estTerminee(c));
    // La commande qui vient d'etre passee en premier.
    const estNouvelle = (c) => (String(c.id) === String(nouvelleId) ? 1 : 0);
    return nouvelleId ? [...liste].sort((a, b) => estNouvelle(b) - estNouvelle(a)) : liste;
  }, [commandes, nouvelleId]);
  const terminees = useMemo(() => commandes.filter(estTerminee), [commandes]);
  const ongletActif = onglet || (enCours.length || !terminees.length ? 'en-cours' : 'terminees');

  const actualiser = async () => {
    setActualisation(true);
    await charger();
    setActualisation(false);
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
    { id: 'terminees', label: 'Terminées', nb: terminees.length },
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

      <div className="mb-5 flex items-center gap-2">
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
              <span className={`ml-1.5 rounded-full px-1.5 text-xs ${ongletActif === o.id ? 'bg-primary/10 text-primary' : 'bg-line/70'}`}>{o.nb}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={actualiser}
          aria-label="Actualiser"
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
        <div className="h-72 animate-pulse rounded-3xl bg-line/60" aria-busy="true" aria-label="Chargement" />
      ) : ongletActif === 'en-cours' ? (
        enCours.length ? (
          <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
            {enCours.map((c) => (
              <CarteCommande key={c.id} commande={c} />
            ))}
          </div>
        ) : (
          !erreur && (
            <EtatVide
              titre="Aucune commande en cours"
              texte={terminees.length ? 'Vos commandes passées sont dans l’onglet « Terminées ».' : 'Vos commandes apparaîtront ici dès votre première commande.'}
              onCommander={() => navigate('/menu')}
            />
          )
        )
      ) : terminees.length ? (
        <div className="space-y-3">
          {terminees.map((c) => (
            <CarteCommande key={c.id} commande={c} compacte />
          ))}
        </div>
      ) : (
        !erreur && <EtatVide titre="Aucune commande terminée" texte="Vos commandes livrées ou retirées s’afficheront ici." />
      )}

      <footer className="mt-8 space-y-1 border-t border-line pt-4 text-center text-[11px] text-ink-light">
        <p className="flex items-center justify-center gap-1.5">
          <Store size={13} aria-hidden="true" /> Statut mis à jour automatiquement toutes les 15 secondes.
        </p>
        <button
          type="button"
          onClick={() => {
            oublier();
            setCommandes([]);
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
