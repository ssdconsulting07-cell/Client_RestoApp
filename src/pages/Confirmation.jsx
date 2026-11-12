import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Store, ArrowLeft, Check, Wallet, MapPin, User, MessageSquare, ChevronDown, Lock } from 'lucide-react';
import { useCart, prixUnitaireLigne } from '../context/CartContext';
import { useOrder } from '../context/OrderContext';
import { creerCommande } from '../api/commandes';
import { getRegionsActives, getSecteurs } from '../api/zones';
import { formatPrix } from '../utils/format';
import { normaliserTelephone, formaterTelephone } from '../utils/telephone';
import Header from '../components/Header';
import PositionLivraison from '../components/PositionLivraison';
import ZoneSheet from '../components/ZoneSheet';
import { zoneDepuisPosition } from '../utils/geo';
import { LOGO_WAVE, LOGO_ORANGE, LOGO_MIXX, LOGO_MASTERCARD } from '../utils/logos';

// Cles identiques a Manager_RestoApp (src/features/vendeur/modesPaiement.jsx).
// "especes" n'existe qu'au comptoir : une commande passee depuis l'app est
// payee en ligne avant sa creation.
const MOYENS_PAIEMENT = [
  { id: 'wave', nom: 'Wave', logo: LOGO_WAVE },
  { id: 'orange-money', nom: 'Orange Money', logo: LOGO_ORANGE },
  { id: 'mixx-yas', nom: 'Mixx by Yas', logo: LOGO_MIXX },
  { id: 'carte', nom: 'Carte bancaire', logo: LOGO_MASTERCARD },
];

const champ =
  'w-full min-h-12 rounded-xl border border-line bg-surface px-3 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10';

export default function Confirmation() {
  const navigate = useNavigate();
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
  const [erreurs, setErreurs] = useState({});
  const [erreurEnvoi, setErreurEnvoi] = useState(null);
  const [envoi, setEnvoi] = useState(false);

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
  // Zone verrouillee (grisee) quand la position l'a determinee : pour en
  // changer, le client retire sa position.
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
  const effacerErreur = (champ) =>
    setErreurs((courantes) => {
      if (!courantes[champ]) return courantes;
      const { [champ]: _retire, ...reste } = courantes;
      return reste;
    });

  const valider = async (e) => {
    e.preventDefault();
    if (envoi) return;
    setErreurEnvoi(null);

    const tel = normaliserTelephone(telephone);
    const nouvelles = {};
    if (!prenom.trim()) nouvelles.prenom = 'Indiquez votre prénom.';
    if (!tel) nouvelles.telephone = 'Numéro sénégalais à 9 chiffres (ex. 77 123 45 67).';
    if (mode === 'LIVRAISON' && !secteur) nouvelles.secteur = 'Choisissez votre zone de livraison.';
    setErreurs(nouvelles);
    if (Object.keys(nouvelles).length > 0) {
      const premier = document.querySelector(`[data-champ="${Object.keys(nouvelles)[0]}"]`);
      premier?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      premier?.focus?.({ preventScroll: true });
      return;
    }

    // Format partage avec Manager_RestoApp (Cuisine/Livreur : cuisineUtils.js,
    // transitions.js ; doc Backend contrat-api/notes-audit-frontend.md).
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

  return (
    <div className="mx-auto max-w-app px-4 pb-6 pt-[max(1.5rem,env(safe-area-inset-top))] md:pt-8 lg:max-w-6xl lg:px-6">
      <Header titre="Finaliser la commande" avecNotif={false} />

      <button
        type="button"
        onClick={() => navigate('/panier')}
        className="mb-4 inline-flex min-h-10 items-center gap-2 rounded-xl border border-line bg-surface px-4 text-sm font-semibold text-ink"
      >
        <ArrowLeft size={16} aria-hidden="true" /> Retour au panier
      </button>

      <p className="mb-6 text-xs text-ink-light">
        {telSauve
          ? 'Vos coordonnées de la dernière commande sont pré-remplies.'
          : 'Aucun compte requis : votre numéro suffit pour suivre vos commandes.'}
      </p>

      <form onSubmit={valider} noValidate className="space-y-7 lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-10 lg:space-y-0">
        <div className="space-y-7 md:rounded-3xl md:border md:border-line md:bg-surface md:p-6 lg:p-8">
        <section>
          <h2 className="mb-2 text-sm font-semibold">Mode de récupération</h2>
          <div className="grid grid-cols-2 gap-3">
            <ModeBtn actif={mode === 'LIVRAISON'} onClick={() => setMode('LIVRAISON')} icon={<Truck size={18} />} label="Livraison" sub="Selon la zone" />
            <ModeBtn actif={mode === 'RETRAIT'} onClick={() => setMode('RETRAIT')} icon={<Store size={18} />} label="À emporter" sub="Retrait au comptoir" />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <User size={16} aria-hidden="true" /> Vos coordonnées
          </h2>
          <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2">
            <div>
              <label htmlFor="prenom" className="mb-1.5 block text-xs font-semibold text-ink-light">Prénom *</label>
              <input id="prenom" data-champ="prenom" autoComplete="given-name" value={prenom} onChange={(e) => { setPrenom(e.target.value); effacerErreur('prenom'); }} className={champ} aria-invalid={Boolean(erreurs.prenom)} />
              <Erreur champ="prenom" />
            </div>
            <div>
              <label htmlFor="nom" className="mb-1.5 block text-xs font-semibold text-ink-light">Nom (facultatif)</label>
              <input id="nom" autoComplete="family-name" value={nom} onChange={(e) => setNom(e.target.value)} className={champ} />
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
                className={`${champ} rounded-l-none`}
                aria-invalid={Boolean(erreurs.telephone)}
              />
            </div>
            <Erreur champ="telephone" />
          </div>
        </section>

        {mode === 'LIVRAISON' && (
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <MapPin size={16} aria-hidden="true" /> Zone de livraison
            </h2>
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
                className={`flex min-h-14 w-full items-center gap-3 rounded-xl border px-3 text-left transition-colors ` +
                  (zoneVerrouillee
                    ? 'cursor-not-allowed border-line bg-surface-alt text-ink-light'
                    : erreurs.secteur
                      ? 'border-danger bg-surface'
                      : 'border-line bg-surface hover:border-primary/40')}
              >
                <MapPin size={18} className={`shrink-0 ` + (zoneVerrouillee ? 'text-ink-light' : 'text-primary')} aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  {secteur ? (
                    <>
                      <span className="block truncate text-base font-semibold">{secteur.nom}</span>
                      <span className="block truncate text-xs text-ink-light">
                        {secteur.departement}{region && region.nom !== secteur.departement ? ` · ` + region.nom : ''} · {formatPrix(secteur.prixLivraison)}
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
          </section>
        )}

        <section>
          <label htmlFor="note" className="mb-2 flex items-start gap-2 text-sm font-semibold">
            <MessageSquare size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>
              {mode === 'LIVRAISON' ? 'Précisions pour le livreur et la cuisine' : 'Précisions pour la cuisine'}{' '}
              <span className="font-normal text-ink-light">(facultatif)</span>
            </span>
          </label>
          <textarea
            id="note"
            rows={3}
            maxLength={300}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={mode === 'LIVRAISON' ? 'Ex. : immeuble bleu, 2e étage — sans oignon' : 'Ex. : sans oignon, bien cuit'}
            className="w-full rounded-xl border border-line bg-surface p-3 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
          />
        </section>

        <section>
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <Wallet size={16} aria-hidden="true" /> Moyen de paiement
          </h2>
          <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Moyen de paiement">
            {MOYENS_PAIEMENT.map((m) => (
              <button
                key={m.id}
                type="button"
                role="radio"
                aria-checked={paiement === m.id}
                onClick={() => setPaiement(m.id)}
                className={`flex min-h-14 w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                  paiement === m.id ? 'border-primary bg-primary/5' : 'border-line bg-surface'
                }`}
              >
                <span className="flex h-9 w-14 shrink-0 items-center justify-center overflow-hidden rounded border border-line bg-white">
                  <img src={m.logo} alt="" className="max-h-full max-w-full object-contain" />
                </span>
                <span className="flex-1 text-sm font-medium">{m.nom}</span>
                {paiement === m.id && <Check size={18} className="text-primary" aria-hidden="true" />}
              </button>
            ))}
          </div>
        </section>

        </div>

        <aside className="space-y-4 lg:sticky lg:top-24" aria-label="Récapitulatif">
        <section className="rounded-2xl bg-surface p-4 shadow-card lg:p-5">
          <h2 className="mb-3 hidden text-base font-semibold lg:block">Votre commande</h2>
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
              <span className="shrink-0">{secteur ? formatPrix(secteur.prixLivraison) : '—'}</span>
            </div>
          )}
          <div className="mt-2 flex justify-between border-t border-line pt-2 text-base font-bold">
            <span>Total</span>
            <span className="text-primary">{formatPrix(totalFinal)}</span>
          </div>
        </section>

        {erreurEnvoi && (
          <div className="rounded-xl bg-red-50 p-3 text-sm text-danger" role="alert">
            La commande n'a pas pu être envoyée : {erreurEnvoi}
          </div>
        )}

        <button
          type="submit"
          disabled={envoi}
          className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-white disabled:opacity-60"
        >
          <Check size={18} aria-hidden="true" />
          {envoi ? 'Envoi en cours…' : `Payer et commander · ${formatPrix(totalFinal)}`}
        </button>
        </aside>
      </form>
    </div>
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
