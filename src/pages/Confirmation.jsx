import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck,
  Store,
  ArrowLeft,
  Check,
  Wallet,
  MapPin,
  Phone,
  UserRound,
  ShoppingBag,
  ShieldCheck,
  MessageSquareText,
  ChevronRight,
} from 'lucide-react';

import { useCart } from '../context/CartContext';
import { useOrder } from '../context/OrderContext';
import { creerCommande } from '../api/commandes';
import { formatPrix } from '../utils/format';
import Header from '../components/Header';
import LogoPaiement from '../components/LogoPaiement';

const FRAIS_LIVRAISON = 1000;

const MOYENS_PAIEMENT = [
  { id: 'wave', nom: 'Wave', logo: '/logos/wave.png' },
  { id: 'orange', nom: 'Orange Money', logo: '/logos/orange.png' },
  { id: 'mixx', nom: 'Mixx by Yas', logo: '/logos/mixx.png' },
  { id: 'carte', nom: 'Carte bancaire', logo: '/logos/master.jpeg' },
];

export default function Confirmation() {
  const navigate = useNavigate();
  const { items, total, vider } = useCart();
  const { telephone: telSauve, setTelephone } = useOrder();

  const [mode, setMode] = useState('livraison');
  const [telephone, setTel] = useState(telSauve || '');
  const [nom, setNom] = useState('');
  const [adresse, setAdresse] = useState('');
  const [paiement, setPaiement] = useState('wave');
  const [erreur, setErreur] = useState(null);
  const [envoi, setEnvoi] = useState(false);

  const note = sessionStorage.getItem('senyummies_note') || '';
  const frais = mode === 'livraison' ? FRAIS_LIVRAISON : 0;
  const totalFinal = total + frais;

  const nombreArticles = items.reduce(
    (somme, item) => somme + item.quantite,
    0
  );

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FFF9F3]">
        <div className="max-w-app mx-auto px-4 pt-6">
          <Header titre="Finaliser la commande" />

          <div className="flex flex-col items-center text-center py-20">
            <div className="w-20 h-20 rounded-full bg-orange-100
              flex items-center justify-center mb-5">
              <ShoppingBag size={34} className="text-orange-600" />
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Votre panier est vide
            </h2>

            <p className="text-sm text-gray-500 mb-6">
              Ajoutez des produits avant de passer commande.
            </p>

            <button
              onClick={() => navigate('/menu')}
              className="bg-orange-600 text-white px-6 py-3
                rounded-xl font-semibold hover:bg-orange-700
                transition-colors"
            >
              Découvrir le menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  const valider = async (e) => {
    e.preventDefault();
    setErreur(null);

    const clean = telephone.replace(/\s/g, '');

    if (!/^[0-9]{9,15}$/.test(clean)) {
      setErreur(
        'Vérifiez votre numéro : saisissez entre 9 et 15 chiffres, sans indicatif ni signe +.'
      );
      return;
    }

    if (mode === 'livraison' && !adresse.trim()) {
      setErreur('Veuillez renseigner votre adresse de livraison.');
      return;
    }

    setEnvoi(true);

    try {
      const commande = {
        telephone: clean,
        nom: nom.trim() || null,
        adresse: mode === 'livraison' ? adresse.trim() : null,
        mode,
        note: note || null,
        moyenPaiement: paiement,
        items: items.map((i) => ({
          produitId: i.produitId,
          nom: i.nom,
          prixUnitaire: i.prixUnitaire,
          quantite: i.quantite,
        })),
        sousTotal: total,
        fraisLivraison: frais,
        total: totalFinal,

        // À adapter au véritable processus de paiement.
        statut: 'En attente',
        statutPaiement: 'en attente',

        createdAt: new Date().toISOString(),
      };

      await creerCommande(commande);

      setTelephone(clean);
      vider();
      sessionStorage.removeItem('senyummies_note');
      navigate('/commandes');
    } catch (err) {
      setErreur(
        err?.message || 'Impossible de créer la commande. Réessayez.'
      );
    } finally {
      setEnvoi(false);
    }
  };

  const champStyle =
    'w-full p-3.5 pl-11 rounded-xl bg-white border border-orange-100 ' +
    'text-sm text-gray-800 placeholder:text-gray-400 ' +
    'focus:outline-none focus:ring-2 focus:ring-orange-200 ' +
    'focus:border-orange-400 transition-all';

  return (
    <div className="min-h-screen bg-[#FFF9F3]">
      <div className="max-w-app mx-auto px-4 pt-6 pb-10">

        <Header titre="Finaliser ma commande" />

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm
            text-gray-500 hover:text-orange-700 mb-5 transition-colors"
        >
          <ArrowLeft size={17} />
          Retour au panier
        </button>

        {/* Bandeau d'accueil */}
        <div className="rounded-2xl bg-gradient-to-r
          from-orange-600 to-orange-500 p-5 text-white
          shadow-lg shadow-orange-100 mb-6">

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20
              flex items-center justify-center shrink-0">
              <ShoppingBag size={25} />
            </div>

            <div className="flex-1">
              <p className="text-lg font-extrabold">
                Plus qu'une étape !
              </p>
              <p className="text-sm text-orange-50 mt-1">
                Vérifiez vos informations et confirmez.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/20
            flex items-center justify-between text-sm">
            <span className="text-orange-50">
              Articles dans votre panier
            </span>
            <span className="font-bold bg-white/20 px-3 py-1 rounded-full">
              {nombreArticles}
            </span>
          </div>
        </div>

        <form onSubmit={valider} className="space-y-6">

          {/* Mode de récupération */}
          <section>
            <SectionTitre
              numero="1"
              titre="Comment recevoir votre commande ?"
              sousTitre="Choisissez votre mode de récupération"
            />

            <div className="grid grid-cols-2 gap-3 mt-4">
              <ModeBtn
                actif={mode === 'livraison'}
                onClick={() => setMode('livraison')}
                icon={<Truck size={23} />}
                label="Livraison"
                sub="+1 000 FCFA"
              />

              <ModeBtn
                actif={mode === 'retrait'}
                onClick={() => setMode('retrait')}
                icon={<Store size={23} />}
                label="Retrait"
                sub="Gratuit"
              />
            </div>

            {mode === 'livraison' && (
              <div className="mt-3 p-3 rounded-xl bg-orange-50
                border border-orange-100 flex gap-2.5">
                <MapPin size={18} className="text-orange-600 shrink-0 mt-0.5" />
                <p className="text-xs leading-5 text-orange-900">
                  Indiquez une adresse précise pour faciliter
                  la livraison de votre commande.
                </p>
              </div>
            )}

            {mode === 'retrait' && (
              <div className="mt-3 p-3 rounded-xl bg-orange-50
                border border-orange-100 flex gap-2.5">
                <Store size={18} className="text-orange-600 shrink-0 mt-0.5" />
                <p className="text-xs leading-5 text-orange-900">
                  Vous avez choisi le retrait sur place.
                  Les frais de livraison ne seront pas appliqués.
                </p>
              </div>
            )}
          </section>

          {/* Coordonnées */}
          <section className="bg-white rounded-2xl p-4 sm:p-5
            border border-orange-100/70 shadow-sm">

            <SectionTitre
              numero="2"
              titre="Vos coordonnées"
              sousTitre="Pour vous contacter au sujet de votre commande"
            />

            <div className="space-y-4 mt-5">

              <div>
                <label htmlFor="telephone"
                  className="block text-sm font-semibold text-gray-700 mb-2">
                  Numéro de téléphone <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <Phone size={17} className="absolute left-3.5 top-1/2
                    -translate-y-1/2 text-orange-500" />

                  <input
                    id="telephone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="Ex. : 771234567"
                    value={telephone}
                    onChange={(e) => setTel(e.target.value)}
                    className={champStyle}
                    required
                    aria-invalid={Boolean(erreur)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="nom"
                  className="block text-sm font-semibold text-gray-700 mb-2">
                  Votre nom <span className="text-gray-400 font-normal">(facultatif)</span>
                </label>

                <div className="relative">
                  <UserRound size={17} className="absolute left-3.5
                    top-1/2 -translate-y-1/2 text-orange-500" />

                  <input
                    id="nom"
                    type="text"
                    autoComplete="name"
                    placeholder="Comment vous appelez-vous ?"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className={champStyle}
                  />
                </div>
              </div>

              {mode === 'livraison' && (
                <div>
                  <label htmlFor="adresse"
                    className="block text-sm font-semibold text-gray-700 mb-2">
                    Adresse de livraison <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <MapPin size={17} className="absolute left-3.5
                      top-4 text-orange-500" />

                    <textarea
                      id="adresse"
                      autoComplete="street-address"
                      placeholder="Quartier, rue, repère..."
                      value={adresse}
                      onChange={(e) => setAdresse(e.target.value)}
                      rows={3}
                      className={`${champStyle} resize-none`}
                      required
                    />
                  </div>

                  <p className="text-xs text-gray-400 mt-2">
                    Ajoutez un repère connu pour faciliter la livraison.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Paiement */}
          <section>
            <SectionTitre
              numero="3"
              titre="Moyen de paiement"
              sousTitre="Sélectionnez votre moyen de paiement préféré"
            />

            <div className="space-y-3 mt-4">
              {MOYENS_PAIEMENT.map((m) => {
                const actif = paiement === m.id;

                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaiement(m.id)}
                    aria-pressed={actif}
                    className={`w-full flex items-center gap-3 p-3.5
                      rounded-2xl border text-left transition-all
                      ${
                        actif
                          ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-200'
                          : 'border-orange-100 bg-white hover:border-orange-300'
                      }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-white
                      border border-orange-100 flex items-center
                      justify-center shrink-0">
                      <LogoPaiement id={m.id} size={32} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900">
                        {m.nom}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {m.description}
                      </p>
                    </div>

                    <div className={`w-5 h-5 rounded-full border
                      flex items-center justify-center shrink-0
                      ${
                        actif
                          ? 'bg-orange-600 border-orange-600 text-white'
                          : 'border-gray-300 bg-white'
                      }`}>
                      {actif && <Check size={13} strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}
            </div>

            <p className="text-xs text-gray-400 mt-3 leading-5">
              Le paiement doit être confirmé selon le processus
              réellement pris en charge par votre application.
            </p>
          </section>

          {/* Note pour la cuisine */}
          {note.trim() && (
            <section className="bg-white rounded-2xl p-4
              border border-orange-100/70 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquareText size={18} className="text-orange-600" />
                <h3 className="font-bold text-sm text-gray-900">
                  Votre note pour la cuisine
                </h3>
              </div>
              <p className="text-sm text-gray-600 leading-6">
                {note}
              </p>
            </section>
          )}

          {/* Récapitulatif */}
          <section className="bg-white rounded-2xl p-5
            border border-orange-100/70 shadow-sm">

            <div className="flex items-center gap-2 mb-5">
              <div className="w-10 h-10 rounded-xl bg-orange-100
                flex items-center justify-center">
                <Wallet size={20} className="text-orange-600" />
              </div>

              <div>
                <h3 className="font-bold text-gray-900">
                  Récapitulatif
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Le détail de votre commande
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Sous-total</span>
                <span className="font-semibold text-gray-900">
                  {formatPrix(total)}
                </span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-gray-500 flex items-center gap-2">
                  <Truck size={16} />
                  Livraison
                </span>
                <span className="font-semibold text-gray-900">
                  {frais === 0 ? 'Gratuit' : formatPrix(frais)}
                </span>
              </div>
            </div>

            <div className="border-t border-dashed
              border-orange-200 my-4" />

            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-bold text-gray-900">
                  Total à payer
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {mode === 'livraison'
                    ? 'Livraison incluse'
                    : 'Retrait sur place'}
                </p>
              </div>

              <span className="text-xl font-extrabold
                text-orange-700 whitespace-nowrap">
                {formatPrix(totalFinal)}
              </span>
            </div>
          </section>

          {/* Erreur */}
          {erreur && (
            <div role="alert" className="bg-red-50 border
              border-red-100 text-red-700 text-sm p-4 rounded-xl">
              <p className="font-bold mb-1">
                Impossible de continuer
              </p>
              <p>{erreur}</p>
            </div>
          )}

          {/* Confirmation */}
          <div className="space-y-3">
            <button
              type="submit"
              disabled={envoi}
              className="w-full bg-orange-600 hover:bg-orange-700
                text-white font-bold py-4 px-5 rounded-2xl
                flex items-center justify-center gap-2
                shadow-lg shadow-orange-200 transition-all
                active:scale-[0.99] disabled:opacity-60
                disabled:cursor-not-allowed"
            >
              {envoi ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/40
                    border-t-white rounded-full animate-spin" />
                  Création de la commande...
                </>
              ) : (
                <>
                  Confirmer ma commande
                  <ChevronRight size={19} />
                </>
              )}
            </button>

            <div className="flex justify-center items-center gap-2
              text-xs text-gray-400">
              <ShieldCheck size={16} className="text-green-600" />
              <span>Vérifiez vos informations avant de confirmer.</span>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}

function SectionTitre({ numero, titre, sousTitre }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-xl bg-orange-100
        text-orange-700 flex items-center justify-center
        text-sm font-extrabold shrink-0">
        {numero}
      </div>

      <div>
        <h2 className="font-bold text-gray-900 text-base">
          {titre}
        </h2>
        <p className="text-xs text-gray-500 mt-1 leading-5">
          {sousTitre}
        </p>
      </div>
    </div>
  );
}

function ModeBtn({ actif, onClick, icon, label, sub }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={actif}
      className={`relative p-4 rounded-2xl border text-left
        transition-all ${
          actif
            ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-200'
            : 'border-orange-100 bg-white hover:border-orange-300'
        }`}
    >
      {actif && (
        <span className="absolute top-3 right-3 w-5 h-5
          rounded-full bg-orange-600 text-white
          flex items-center justify-center">
          <Check size={12} strokeWidth={3} />
        </span>
      )}

      <div className={`mb-3 ${
        actif ? 'text-orange-600' : 'text-gray-500'
      }`}>
        {icon}
      </div>

      <p className="text-sm font-bold text-gray-900">
        {label}
      </p>

      <p className={`text-xs mt-1 font-medium ${
        actif ? 'text-orange-700' : 'text-gray-500'
      }`}>
        {sub}
      </p>
    </button>
  );
}