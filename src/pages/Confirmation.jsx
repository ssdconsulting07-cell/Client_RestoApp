import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Truck,
  Store,
  ArrowLeft,
  ArrowRight,
  Check,
  MapPin,
  MessageSquare,
  ChevronDown,
  Lock,
  Pencil,
  User,
  Wallet,
} from 'lucide-react';
import { useCart, prixUnitaireLigne } from '../context/CartContext';
import { useOrder } from '../context/OrderContext';
import { creerCommande } from '../api/commandes';
import { getRegionsActives, getSecteurs } from '../api/zones';
import { formatPrix } from '../utils/format';
import { normaliserTelephone, formaterTelephone } from '../utils/telephone';
import { zoneDepuisPosition } from '../utils/geo';
import { validerCarte } from '../utils/carte';
import Header from '../components/Header';
import PositionLivraison from '../components/PositionLivraison';
import ZoneSheet from '../components/ZoneSheet';
import MoyensPaiement, { MOYENS_PAIEMENT } from '../components/MoyensPaiement';

// Commande en 3 etapes courtes plutot qu'un long formulaire :
//   1. Livraison (mode, position, zone, precisions)
//   2. Coordonnees (prenom, nom, telephone)
//   3. Paiement (rappel des choix, moyen de paiement, recapitulatif)
// L'etape est dans l'URL (?etape=2) : le bouton retour du telephone revient a
// l'etape precedente. On ne peut pas sauter une etape incomplete.
const ETAPES = [
  { n: 1, titre: 'Livraison', Icone: Truck },
  { n: 2, titre: 'Coordonnées', Icone: User },
  { n: 3, titre: 'Paiement', Icone: Wallet },
];

const champ =
  'w-full min-h-12 rounded-xl border bg-surface px-3 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10';

export default function Confirmation() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { lignes, total, vider } = useCart();
  const { telephone: telSauve, identite, memoriserClient } = useOrder();

  const [mode, setMode] = useState('LIVRAISON');
  // Pre-rempli avec les coordonnees memorisees lors d'une commande precedente.
  const [prenom, setPrenom] = useState(identite.prenom);
  const [nom, setNom] = useState(identite.nom);
  const [telephone, setTel] = useState(telSauve ? formaterTelephone(telSauve) : '');
  const [note, setNote] = useState('');
  const [regions, setRegions] = useState([]);
  const [secteurs, setSecteurs] = useState([]);
  const [secteurId, setSecteurId] = useState('');
  const [position, setPosition] = useState(null);
  const [sheetZone, setSheetZone] = useState(false);
  const [zonesErreur, setZonesErreur] = useState(null);
  const [paiement, setPaiement] = useState('wave');
  // Donnees de carte : en memoire uniquement, jamais envoyees ni stockees
  // (voir utils/carte.js, PCI DSS).
  const [carte, setCarte] = useState({ numero: '', titulaire: '', expiration: '', cvv: '' });
  const [erreurs, setErreurs] = useState({});
  const [erreurEnvoi, setErreurEnvoi] = useState(null);
  const [envoi, setEnvoi] = useState(false);
  const titreRef = useRef(null);

  // Regions actives et TOUS leurs secteurs : necessaires pour deduire la zone
  // d'une position GPS, quelle que soit la region.
  useEffect(() => {
    getRegionsActives()
      .then(async (liste) => {
        setRegions(liste);
        const parRegion = await Promise.all(liste.map((r) => getSecteurs(r.id)));
        setSecteurs(parRegion.flat());
      })
      .catch((err) => setZonesErreur(err.message));
  }, []);

  // Zone deduite de la position GPS : undefined = pas de position,
  // null = position hors des zones livrees, sinon le secteur.
  const zoneDetectee = useMemo(
    () => (position && secteurs.length ? zoneDepuisPosition(secteurs, position) : position ? null : undefined),
    [position, secteurs]
  );
  const zoneVerrouillee = Boolean(zoneDetectee);

  useEffect(() => {
    if (zoneDetectee) {
      setSecteurId(zoneDetectee.id);
      setErreurs((e) => {
        const { secteur: _retire, ...reste } = e;
        return reste;
      });
    }
  }, [zoneDetectee]);

  const secteur = secteurs.find((s) => s.id === secteurId);
  const region = regions.find((r) => r.id === secteur?.regionId);
  const frais = mode === 'LIVRAISON' ? secteur?.prixLivraison || 0 : 0;
  const totalFinal = total + frais;
  const bloque = lignes.some((l) => l.indisponible);

  // Erreurs propres a chaque etape (une etape n'est validee que sans erreur).
  const erreursEtape = useCallback(
    (n) => {
      const e = {};
      if (n === 1 && mode === 'LIVRAISON' && !secteur) e.secteur = 'Choisissez votre zone de livraison.';
      if (n === 2) {
        if (!prenom.trim()) e.prenom = 'Indiquez votre prénom.';
        if (!normaliserTelephone(telephone)) e.telephone = 'Numéro sénégalais à 9 chiffres (ex. 77 123 45 67).';
      }
      if (n === 3 && paiement === 'carte') Object.assign(e, validerCarte(carte));
      return e;
    },
    [mode, secteur, prenom, telephone, paiement, carte]
  );

  // Etape demandee dans l'URL, ramenee a la premiere etape incomplete si
  // besoin (rechargement, lien partage, etape sautee).
  const demandee = Math.min(3, Math.max(1, Number(searchParams.get('etape')) || 1));
  const premiereIncomplete = [1, 2].find((n) => Object.keys(erreursEtape(n)).length > 0) || 3;
  const donneesPretes = Boolean(secteurs.length || mode === 'RETRAIT' || zonesErreur);
  const etape = donneesPretes ? Math.min(demandee, premiereIncomplete) : 1;

  const allerA = useCallback(
    (n, { remplacer = false } = {}) => {
      const params = new URLSearchParams(searchParams);
      if (n === 1) params.delete('etape');
      else params.set('etape', String(n));
      setSearchParams(params, { replace: remplacer });
    },
    [searchParams, setSearchParams]
  );

  // Etape ramenee en arriere (URL ?etape=3 alors que l'etape 1 est
  // incomplete) : l'URL est realignee, sinon completer l'etape 1 ferait
  // sauter toute seule a l'etape suivante sans clic sur "Continuer".
  useEffect(() => {
    if (donneesPretes && etape < demandee) allerA(etape, { remplacer: true });
  }, [donneesPretes, etape, demandee, allerA]);

  // Changement d'etape : haut de page et focus sur le titre de l'etape
  // (lecteurs d'ecran), sans faire defiler une seconde fois.
  useEffect(() => {
    window.scrollTo({ top: 0 });
    titreRef.current?.focus({ preventScroll: true });
  }, [etape]);

  if (lignes.length === 0 || bloque) {
    return (
      <div className="mx-auto max-w-app px-4 pt-[max(1.5rem,env(safe-area-inset-top))]">
        <Header titre="Finaliser la commande" />
        <div className="py-16 text-center">
          <p className="mb-4 text-ink-light">
            {bloque ? 'Certains articles de votre panier ne sont plus disponibles.' : 'Aucun article dans le panier.'}
          </p>
          <button
            type="button"
            onClick={() => navigate(bloque ? '/panier' : '/menu')}
            className="min-h-12 rounded-xl bg-primary px-6 font-semibold text-white"
          >
            {bloque ? 'Revenir au panier' : 'Voir le menu'}
          </button>
        </div>
      </div>
    );
  }

  // Efface le message d'erreur d'un champ des que le client le corrige.
  const effacerErreur = (c) =>
    setErreurs((courantes) => {
      if (!courantes[c]) return courantes;
      const { [c]: _retire, ...reste } = courantes;
      return reste;
    });

  const montrerErreurs = (e) => {
    setErreurs(e);
    requestAnimationFrame(() => {
      const premier = document.querySelector(`[data-champ="${Object.keys(e)[0]}"]`);
      premier?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      premier?.focus?.({ preventScroll: true });
    });
  };

  const continuer = () => {
    const e = erreursEtape(etape);
    if (Object.keys(e).length) return montrerErreurs(e);
    setErreurs({});
    allerA(etape + 1);
  };

  const retour = () => (etape === 1 ? navigate('/panier') : navigate(-1));

  const payer = async () => {
    if (envoi) return;
    setErreurEnvoi(null);
    // Revalide tout : une etape precedente a pu devenir incomplete.
    for (const n of [1, 2, 3]) {
      const e = erreursEtape(n);
      if (Object.keys(e).length) {
        if (n !== 3) allerA(n);
        return montrerErreurs(e);
      }
    }

    const tel = normaliserTelephone(telephone);
    // Format partage avec Manager_RestoApp (Cuisine/Livreur : cuisineUtils.js,
    // transitions.js ; contrat Backend contrat-api/openapi.yaml).
    const commande = {
      canal: 'APP',
      mode,
      statut: 'PAYEE',
      moyenPaiement: paiement,
      statutPaiement: 'paye',
      clientPrenom: prenom.trim(),
      clientNom: nom.trim() || null,
      clientTelephone: tel,
      // Adresse = nom de la zone choisie (le livreur appelle le client pour
      // la suite du trajet — cadrage Manager du 24/10/2026).
      adresseLivraison: mode === 'LIVRAISON' ? secteur.nom : null,
      regionLivraison: mode === 'LIVRAISON' ? secteur.regionId : null,
      secteurId: mode === 'LIVRAISON' ? secteur.id : null,
      // Position GPS partagee (facultative) : itineraire du livreur.
      positionLivraison: mode === 'LIVRAISON' && position ? position : null,
      note: note.trim() || null,
      lignes: lignes.map((l) => ({
        produitId: l.produitId,
        type: l.type,
        nom: l.nom,
        prixUnitaire: prixUnitaireLigne(l),
        quantite: l.quantite,
        ...(l.accompagnementNom
          ? { accompagnementNom: l.accompagnementNom, accompagnementPrix: l.accompagnementPrix }
          : {}),
      })),
      sousTotal: total,
      fraisLivraison: frais,
      total: totalFinal,
      creeLe: new Date().toISOString(),
    };

    setEnvoi(true);
    try {
      const creee = await creerCommande(commande);
      memoriserClient({ telephone: tel, prenom: prenom.trim(), nom: nom.trim() });
      vider();
      navigate('/commandes', { replace: true, state: { commandeId: creee?.id } });
    } catch (err) {
      setErreurEnvoi(err.message);
      setEnvoi(false);
    }
  };

  const Erreur = ({ champ: c }) =>
    erreurs[c] ? <p className="mt-1.5 text-xs font-medium text-danger">{erreurs[c]}</p> : null;
  const bord = (c) => (erreurs[c] ? 'border-danger' : 'border-line');
  const nomMoyen = MOYENS_PAIEMENT.find((m) => m.id === paiement)?.nom;

  return (
    <div className="mx-auto max-w-app px-4 pb-32 pt-[max(1.25rem,env(safe-area-inset-top))] md:pb-10 md:pt-8 lg:max-w-6xl lg:px-6">
      <Header titre="Finaliser la commande" avecNotif={false} />

      <Stepper etape={etape} onAller={(n) => n < etape && allerA(n)} />

      <div className="mt-6 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-10">
        <div className="min-w-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (etape < 3) continuer();
              else payer();
            }}
            noValidate
            className="md:rounded-3xl md:border md:border-line md:bg-surface md:p-6 lg:p-8"
          >
            <h2 ref={titreRef} tabIndex={-1} className="mb-5 text-lg font-semibold outline-none">
              {etape === 1 && 'Comment récupérez-vous votre commande ?'}
              {etape === 2 && 'Vos coordonnées'}
              {etape === 3 && 'Paiement'}
            </h2>

            {/* ---------- Etape 1 : livraison ---------- */}
            {etape === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-3">
                  <ModeBtn actif={mode === 'LIVRAISON'} onClick={() => setMode('LIVRAISON')} icon={<Truck size={18} />} label="Livraison" sub="Selon la zone" />
                  <ModeBtn actif={mode === 'RETRAIT'} onClick={() => setMode('RETRAIT')} icon={<Store size={18} />} label="À emporter" sub="Retrait au comptoir" />
                </div>

                {mode === 'LIVRAISON' && (
                  <div className="space-y-4">
                    {zonesErreur && <p className="rounded-xl bg-red-50 p-3 text-sm text-danger">{zonesErreur}</p>}
                    <div>
                      <p className="mb-1.5 text-xs font-semibold text-ink-light">Ma position (recommandé)</p>
                      <PositionLivraison position={position} onChange={setPosition} zoneDetectee={zoneDetectee} />
                    </div>
                    <div>
                      <p id="label-zone" className="mb-1.5 text-xs font-semibold text-ink-light">Zone *</p>
                      <button
                        type="button"
                        data-champ="secteur"
                        aria-labelledby="label-zone"
                        aria-haspopup="dialog"
                        aria-invalid={Boolean(erreurs.secteur)}
                        disabled={zoneVerrouillee || secteurs.length === 0}
                        onClick={() => setSheetZone(true)}
                        className={`flex min-h-14 w-full items-center gap-3 rounded-xl border px-3 text-left transition-colors ${
                          zoneVerrouillee
                            ? 'cursor-not-allowed border-line bg-surface-alt text-ink-light'
                            : erreurs.secteur
                              ? 'border-danger bg-surface'
                              : 'border-line bg-surface hover:border-primary/40'
                        }`}
                      >
                        <MapPin size={18} className={`shrink-0 ${zoneVerrouillee ? 'text-ink-light' : 'text-primary'}`} aria-hidden="true" />
                        <span className="min-w-0 flex-1">
                          {secteur ? (
                            <>
                              <span className="block truncate text-base font-semibold">{secteur.nom}</span>
                              <span className="block truncate text-xs text-ink-light">
                                {secteur.departement}
                                {region && region.nom !== secteur.departement ? ` · ${region.nom}` : ''} · {formatPrix(secteur.prixLivraison)}
                              </span>
                            </>
                          ) : (
                            <span className="text-base text-ink-light">{secteurs.length ? 'Choisir ma zone' : 'Chargement des zones…'}</span>
                          )}
                        </span>
                        {zoneVerrouillee ? (
                          <Lock size={16} className="shrink-0" aria-hidden="true" />
                        ) : (
                          <ChevronDown size={18} className="shrink-0 text-ink-light" aria-hidden="true" />
                        )}
                      </button>
                      {zoneVerrouillee && (
                        <p className="mt-1.5 text-xs text-ink-light">
                          Zone déterminée par votre position. Retirez la position pour en choisir une autre.
                        </p>
                      )}
                      <Erreur champ="secteur" />
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="note" className="mb-1.5 flex items-start gap-2 text-xs font-semibold text-ink-light">
                    <MessageSquare size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                    <span>
                      {mode === 'LIVRAISON' ? 'Précisions pour le livreur et la cuisine' : 'Précisions pour la cuisine'} (facultatif)
                    </span>
                  </label>
                  <textarea
                    id="note"
                    rows={2}
                    maxLength={300}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={mode === 'LIVRAISON' ? 'Ex. : immeuble bleu, 2e étage — sans oignon' : 'Ex. : sans oignon, bien cuit'}
                    className="w-full rounded-xl border border-line bg-surface p-3 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                  />
                </div>
              </div>
            )}

            {/* ---------- Etape 2 : coordonnees ---------- */}
            {etape === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-ink-light">
                  {telSauve
                    ? 'Pré-remplies depuis votre dernière commande sur cet appareil.'
                    : 'Aucun compte à créer : votre numéro suffit pour suivre vos commandes.'}
                </p>
                <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2">
                  <div>
                    <label htmlFor="prenom" className="mb-1.5 block text-xs font-semibold text-ink-light">Prénom *</label>
                    <input
                      id="prenom"
                      data-champ="prenom"
                      autoComplete="given-name"
                      value={prenom}
                      onChange={(e) => { setPrenom(e.target.value); effacerErreur('prenom'); }}
                      className={`${champ} ${bord('prenom')}`}
                      aria-invalid={Boolean(erreurs.prenom)}
                    />
                    <Erreur champ="prenom" />
                  </div>
                  <div>
                    <label htmlFor="nom" className="mb-1.5 block text-xs font-semibold text-ink-light">Nom (facultatif)</label>
                    <input id="nom" autoComplete="family-name" value={nom} onChange={(e) => setNom(e.target.value)} className={`${champ} border-line`} />
                  </div>
                </div>
                <div>
                  <label htmlFor="telephone" className="mb-1.5 block text-xs font-semibold text-ink-light">Téléphone *</label>
                  <div className="flex">
                    <span className="flex min-h-12 items-center rounded-l-xl border border-r-0 border-line bg-surface-alt px-3 text-sm text-ink-light">+221</span>
                    <input
                      id="telephone"
                      data-champ="telephone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel-national"
                      placeholder="77 123 45 67"
                      value={telephone}
                      onChange={(e) => { setTel(e.target.value); effacerErreur('telephone'); }}
                      className={`${champ} ${bord('telephone')} rounded-l-none`}
                      aria-invalid={Boolean(erreurs.telephone)}
                    />
                  </div>
                  <Erreur champ="telephone" />
                  <p className="mt-1.5 text-xs text-ink-light">Le livreur vous appellera sur ce numéro si besoin.</p>
                </div>
              </div>
            )}

            {/* ---------- Etape 3 : paiement ---------- */}
            {etape === 3 && (
              <div className="space-y-6">
                <div className="divide-y divide-line rounded-2xl border border-line bg-surface-alt/60">
                  <RappelChoix
                    titre={mode === 'LIVRAISON' ? 'Livraison' : 'À emporter'}
                    detail={
                      mode === 'LIVRAISON'
                        ? `${secteur?.nom} · ${formatPrix(frais)}${position ? ' · position GPS partagée' : ''}`
                        : 'Retrait au comptoir'
                    }
                    onModifier={() => allerA(1)}
                  />
                  <RappelChoix
                    titre={[prenom.trim(), nom.trim()].filter(Boolean).join(' ')}
                    detail={formaterTelephone(normaliserTelephone(telephone))}
                    onModifier={() => allerA(2)}
                  />
                </div>

                <MoyensPaiement
                  valeur={paiement}
                  onChange={setPaiement}
                  telephone={normaliserTelephone(telephone)}
                  carte={carte}
                  onCarteChange={setCarte}
                  erreurs={erreurs}
                  effacerErreur={effacerErreur}
                />

                {/* Recapitulatif : ici sur smartphone/tablette, a droite sur PC */}
                <div className="lg:hidden">
                  <Recapitulatif lignes={lignes} total={total} mode={mode} secteur={secteur} frais={frais} totalFinal={totalFinal} />
                </div>

                {erreurEnvoi && (
                  <div className="rounded-xl bg-red-50 p-3 text-sm text-danger" role="alert">
                    La commande n'a pas pu être envoyée : {erreurEnvoi}
                  </div>
                )}
              </div>
            )}

            {/* Barre d'action : fixe en bas sur smartphone, dans la carte ailleurs */}
            <div className="fixed inset-x-0 bottom-0 z-[90] border-t border-line bg-surface/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur md:static md:mt-8 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
              <div className="mx-auto flex max-w-app items-center gap-2 md:max-w-none">
                <button
                  type="button"
                  onClick={retour}
                  aria-label={etape === 1 ? 'Retour au panier' : 'Étape précédente'}
                  className="flex min-h-12 min-w-12 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-line bg-surface text-sm font-semibold sm:px-4"
                >
                  <ArrowLeft size={18} aria-hidden="true" />
                  <span className="hidden sm:inline">{etape === 1 ? 'Panier' : 'Retour'}</span>
                </button>
                <button
                  type="submit"
                  disabled={envoi}
                  className="flex min-h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-3 text-[15px] font-semibold text-white disabled:opacity-60 sm:px-4 sm:text-base"
                >
                  {etape < 3 ? (
                    <>
                      <span className="truncate">Continuer · {formatPrix(totalFinal)}</span>
                      <ArrowRight size={16} className="shrink-0" aria-hidden="true" />
                    </>
                  ) : (
                    <>
                      <Check size={18} className="shrink-0" aria-hidden="true" />
                      <span className="truncate">
                        {envoi ? 'Envoi en cours…' : `Payer ${formatPrix(totalFinal)}`}
                      </span>
                    </>
                  )}
                </button>
              </div>
              {etape === 3 && nomMoyen && (
                <p className="mx-auto mt-1.5 max-w-app text-center text-[11px] text-ink-light md:max-w-none">
                  Paiement par {nomMoyen}
                </p>
              )}
            </div>
          </form>
        </div>

        <aside className="hidden lg:sticky lg:top-24 lg:block" aria-label="Récapitulatif">
          <Recapitulatif lignes={lignes} total={total} mode={mode} secteur={secteur} frais={frais} totalFinal={totalFinal} />
        </aside>
      </div>

      <ZoneSheet
        ouvert={sheetZone}
        onFermer={() => setSheetZone(false)}
        regions={regions}
        secteurs={secteurs}
        valeur={secteurId}
        onChoisir={(s) => {
          setSecteurId(s.id);
          effacerErreur('secteur');
          setSheetZone(false);
        }}
      />
    </div>
  );
}

function Stepper({ etape, onAller }) {
  return (
    <nav aria-label="Étapes de la commande">
      <p className="sr-only">Étape {etape} sur {ETAPES.length}</p>
      <ol className="flex items-start">
        {ETAPES.map(({ n, titre }) => {
          const faite = n < etape;
          const courante = n === etape;
          return (
            <li key={n} className="relative flex flex-1 flex-col items-center">
              {n > 1 && (
                <span
                  aria-hidden="true"
                  className={`absolute right-1/2 top-[18px] h-0.5 w-full ${n <= etape ? 'bg-primary' : 'bg-line'}`}
                />
              )}
              <button
                type="button"
                onClick={() => onAller(n)}
                disabled={!faite}
                aria-current={courante ? 'step' : undefined}
                aria-label={`${titre}${faite ? ' (terminée, modifier)' : courante ? ' (en cours)' : ''}`}
                className="relative z-10 flex flex-col items-center gap-1.5 disabled:cursor-default"
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors ${
                    faite
                      ? 'border-primary bg-primary text-white'
                      : courante
                        ? 'border-primary bg-surface text-primary ring-4 ring-primary/15'
                        : 'border-line bg-surface text-ink-light'
                  }`}
                >
                  {faite ? <Check size={16} strokeWidth={3} /> : n}
                </span>
                <span className={`text-xs font-semibold ${courante || faite ? 'text-ink' : 'text-ink-light'}`}>{titre}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function RappelChoix({ titre, detail, onModifier }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{titre}</p>
        <p className="truncate text-xs text-ink-light">{detail}</p>
      </div>
      <button
        type="button"
        onClick={onModifier}
        className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-primary"
      >
        <Pencil size={13} aria-hidden="true" /> Modifier
      </button>
    </div>
  );
}

function Recapitulatif({ lignes, total, mode, secteur, frais, totalFinal }) {
  return (
    <section className="rounded-2xl bg-surface p-4 shadow-card lg:p-5">
      <h2 className="mb-3 text-base font-semibold">Votre commande</h2>
      <ul className="mb-2 space-y-1.5 border-b border-line pb-3">
        {lignes.map((l) => (
          <li key={l.ligneId} className="flex justify-between gap-3 text-sm">
            <span className="min-w-0">
              <span className="font-semibold">{l.quantite}×</span> {l.nom}
              {l.accompagnementNom && <span className="block text-xs text-ink-light">+ {l.accompagnementNom}</span>}
            </span>
            <span className="shrink-0">{formatPrix(prixUnitaireLigne(l) * l.quantite)}</span>
          </li>
        ))}
      </ul>
      <div className="flex justify-between py-1 text-sm">
        <span className="text-ink-light">Sous-total</span>
        <span>{formatPrix(total)}</span>
      </div>
      {mode === 'LIVRAISON' && (
        <div className="flex justify-between gap-3 py-1 text-sm">
          <span className="min-w-0 truncate text-ink-light">Livraison{secteur ? ` (${secteur.nom})` : ''}</span>
          <span className="shrink-0">{secteur ? formatPrix(frais) : '—'}</span>
        </div>
      )}
      <div className="mt-2 flex justify-between border-t border-line pt-2 text-base font-bold">
        <span>Total</span>
        <span className="text-primary">{formatPrix(totalFinal)}</span>
      </div>
    </section>
  );
}

function ModeBtn({ actif, onClick, icon, label, sub }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={actif}
      className={`min-h-[72px] rounded-xl border p-3 text-left transition-colors ${
        actif ? 'border-primary bg-primary/5' : 'border-line bg-surface'
      }`}
    >
      <span className="mb-1 flex items-center gap-2">
        {icon}
        <span className="text-sm font-semibold">{label}</span>
      </span>
      <span className="text-xs text-ink-light">{sub}</span>
    </button>
  );
}
