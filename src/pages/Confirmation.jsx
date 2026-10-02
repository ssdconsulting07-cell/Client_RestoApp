import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Store, ArrowLeft, Check, Wallet, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useOrder } from '../context/OrderContext';
import { creerCommande } from '../api/commandes';
import { formatPrix } from '../utils/format';

const FRAIS_LIVRAISON = 1000;

const MOYENS_PAIEMENT = [
  { id: 'wave', nom: 'Wave', emoji: '🌊' },
  { id: 'orange', nom: 'Orange Money', emoji: '🟠' },
  { id: 'free', nom: 'Free Money', emoji: '🔵' },
  { id: 'carte', nom: 'Carte bancaire', emoji: '💳' },
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

  if (items.length === 0) {
    return (
      <div className="max-w-app mx-auto px-4 py-20 text-center">
        <p className="text-ink-light mb-4">Aucun article dans le panier.</p>
        <button
          onClick={() => navigate('/menu')}
          className="bg-primary text-white px-6 py-3 rounded-md font-semibold"
        >
          Voir le menu
        </button>
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
    if (mode === 'livraison' && !adresse.trim()) {
      setErreur('Adresse obligatoire pour la livraison.');
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
        statut: 'Payée',
        statutPaiement: 'payé',
        createdAt: new Date().toISOString(),
      };

      await creerCommande(commande);
      setTelephone(clean);
      vider();
      sessionStorage.removeItem('senyummies_note');
      navigate('/commandes');
    } catch (err) {
      setErreur(err.message);
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div className="max-w-app mx-auto px-4 pt-6 pb-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-ink-light mb-4"
      >
        <ArrowLeft size={16} />
        Retour au panier
      </button>

      <h1 className="text-2xl font-semibold mb-1">Finaliser la commande</h1>
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
              sub="+1 000 FCFA"
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
            <input
              type="text"
              placeholder="Adresse de livraison (obligatoire)"
              value={adresse}
              onChange={(e) => setAdresse(e.target.value)}
              className="w-full p-3 rounded-md border border-line text-sm focus:outline-none focus:border-primary"
            />
          )}
        </section>

        {/* Modalités de paiement */}
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
                <span className="text-xl">{m.emoji}</span>
                <span className="flex-1 text-sm font-medium">{m.nom}</span>
                {paiement === m.id && <Check size={16} className="text-primary" />}
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
          {frais > 0 && (
            <div className="flex justify-between text-sm py-1">
              <span className="text-ink-light">Livraison</span>
              <span>{formatPrix(frais)}</span>
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