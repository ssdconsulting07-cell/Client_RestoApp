import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Store, ArrowLeft, Check, Wallet, MapPin } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useOrder } from '../context/OrderContext';
import { creerCommande } from '../api/commandes';
import { getZones } from '../api/zones';
import { formatPrix } from '../utils/format';
import Header from '../components/Header';
import {
  LOGO_WAVE,
  LOGO_ORANGE,
  LOGO_MIXX,
  LOGO_MASTERCARD,
} from '../utils/logos';

const MOYENS_PAIEMENT = [
  { id: 'wave', nom: 'Wave', logo: LOGO_WAVE },
  { id: 'orange', nom: 'Orange Money', logo: LOGO_ORANGE },
  { id: 'mixx', nom: 'Mixx by Yas', logo: LOGO_MIXX },
  { id: 'carte', nom: 'Carte bancaire', logo: LOGO_MASTERCARD },
];

export default function Confirmation() {
  const navigate = useNavigate();
  const { items, total, vider } = useCart();
  const { telephone: telSauve, setTelephone } = useOrder();

  const [zones, setZones] = useState([]);
  const [mode, setMode] = useState('livraison');
  const [telephone, setTel] = useState(telSauve || '');
  const [nom, setNom] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [paiement, setPaiement] = useState('wave');
  const [erreur, setErreur] = useState(null);
  const [envoi, setEnvoi] = useState(false);

  // Charger les zones
  useEffect(() => {
    getZones().then(setZones).catch(() => {});
  }, []);

  // Zone sélectionnée
  const zone = zones.find((z) => String(z.id) === String(zoneId));

  const frais = mode === 'livraison' ? zone?.prix || 0 : 0;
  const totalFinal = total + frais;

  if (items.length === 0) {
    return (
      <div className="max-w-app mx-auto px-4 pt-6">
        <Header titre="Finaliser la commande" />
        <div className="py-16 text-center">
          <p className="text-ink-light mb-4">Aucun article dans le panier.</p>
          <button
            onClick={() => navigate('/menu')}
            className="bg-primary text-white px-6 py-3 rounded-md font-semibold"
          >
            Voir le menu
          </button>
        </div>
      </div>
    );
  }

  const valider = async (e) => {
    e.preventDefault();
    setErreur(null);

    const clean = telephone.replace(/\s/g, '');
    if (!/^[0-9]{9,15}$/.test(clean)) {
      setErreur('Numéro de téléphone invalide (9 à 15 chiffres).');
      return;
    }
    if (mode === 'livraison' && !zone) {
      setErreur('Sélectionnez votre zone de livraison.');
      return;
    }

    setEnvoi(true);
    try {
      const commande = {
        telephone: clean,
        nom: nom.trim() || null,
        adresse: null,
        zone: mode === 'livraison' ? zone.nom : null,
        mode,
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
        statut: 'Payée',
        statutPaiement: 'payé',
        createdAt: new Date().toISOString(),
      };

      await creerCommande(commande);
      setTelephone(clean);
      vider();
      navigate('/commandes');
    } catch (err) {
      setErreur(err.message);
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div className="max-w-app mx-auto px-4 pt-6 pb-8">
      <Header titre="Finaliser la commande" />

      {/* Bouton Retour au panier — rouge, bien visible */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-4 py-2.5 rounded-md mb-4 transition-colors active:scale-95"
      >
        <ArrowLeft size={16} />
        Retour au panier
      </button>

      <p className="text-xs text-ink-light mb-6">
        Aucun compte requis. Votre numéro suffit pour retrouver vos commandes.
      </p>

      <form onSubmit={valider} className="space-y-6">
        {/* Mode */}
        <section>
          <h3 className="text-sm font-semibold mb-2">Mode de récupération</h3>
          <div className="grid grid-cols-2 gap-3">
            <ModeBtn
              actif={mode === 'livraison'}
              onClick={() => setMode('livraison')}
              icon={<Truck size={18} />}
              label="Livraison"
              sub="Selon zone"
            />
            <ModeBtn
              actif={mode === 'retrait'}
              onClick={() => setMode('retrait')}
              icon={<Store size={18} />}
              label="Retrait sur place"
              sub="Gratuit"
            />
          </div>
        </section>

        {/* Coordonnées */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold">Vos coordonnées</h3>

          <input
            type="tel"
            placeholder="Téléphone (obligatoire)"
            value={telephone}
            onChange={(e) => setTel(e.target.value)}
            className="w-full p-3 rounded-md border border-line text-sm focus:outline-none focus:border-primary"
            required
          />

          <input
            type="text"
            placeholder="Nom (facultatif)"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="w-full p-3 rounded-md border border-line text-sm focus:outline-none focus:border-primary"
          />

          {mode === 'livraison' && (
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-ink-light mb-1.5">
                <MapPin size={14} />
                Zone de livraison (obligatoire)
              </label>
              <select
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
                className="w-full p-3 rounded-md border border-line text-sm bg-surface focus:outline-none focus:border-primary"
                required
              >
                <option value="">-- Choisissez votre zone --</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.nom} · {formatPrix(z.prix)}
                  </option>
                ))}
              </select>
              {zone && (
                <p className="text-xs text-primary mt-1.5">
                  Frais de livraison : {formatPrix(zone.prix)}
                </p>
              )}
            </div>
          )}
        </section>

        {/* Paiement */}
        <section>
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Wallet size={16} />
            Moyen de paiement
          </h3>
          <div className="space-y-2">
            {MOYENS_PAIEMENT.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setPaiement(m.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-md border text-left transition-colors ${
                  paiement === m.id
                    ? 'border-primary bg-red-50'
                    : 'border-line bg-surface'
                }`}
              >
                <div className="w-14 h-9 flex items-center justify-center bg-white rounded border border-line overflow-hidden shrink-0">
                  <img
                    src={m.logo}
                    alt={m.nom}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <span className="flex-1 text-sm font-medium">{m.nom}</span>
                {paiement === m.id && (
                  <Check size={16} className="text-primary" />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Récap */}
        <section className="bg-surface rounded-md shadow-card p-4">
          <div className="flex justify-between text-sm py-1">
            <span className="text-ink-light">Sous-total</span>
            <span>{formatPrix(total)}</span>
          </div>
          {mode === 'livraison' && (
            <div className="flex justify-between text-sm py-1">
              <span className="text-ink-light">
                Livraison {zone ? `(${zone.nom})` : ''}
              </span>
              <span>
                {zone ? formatPrix(zone.prix) : 'Sélectionnez une zone'}
              </span>
            </div>
          )}
          <div className="border-t border-line mt-2 pt-2 flex justify-between font-bold text-base">
            <span>Total</span>
            <span className="text-primary">{formatPrix(totalFinal)}</span>
          </div>
        </section>

        {erreur && (
          <div className="bg-red-50 text-danger text-sm p-3 rounded-md">
            {erreur}
          </div>
        )}

        <button
          type="submit"
          disabled={envoi}
          className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-4 rounded-md flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <Check size={18} />
          {envoi ? 'Envoi en cours…' : `Confirmer · ${formatPrix(totalFinal)}`}
        </button>
      </form>
    </div>
  );
}

function ModeBtn({ actif, onClick, icon, label, sub }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-3 rounded-md border text-left transition-colors ${
        actif ? 'border-primary bg-red-50' : 'border-line bg-surface'
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <span className="text-xs text-ink-light">{sub}</span>
    </button>
  );
}