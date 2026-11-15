import { Check, Lock, CreditCard, Smartphone } from 'lucide-react';
import { WaveRond, OrangeMoneyRond, MixxRond, CartesLogos } from './LogosPaiement';
import { formaterTelephone } from '../utils/telephone';
import { marque } from '../config/marque';

// Cles identiques au Manager (modesPaiement.jsx). "especes" n'existe qu'au
// comptoir : une commande passee depuis l'app est payee en ligne.
//
// SECURITE / PCI DSS : aucune donnee de carte ni de compte n'est saisie dans
// l'app. Le paiement se fait chez le prestataire (redirection vers sa page
// securisee, puis retour sur Mes commandes).
export const MOYENS_PAIEMENT = [
  { id: 'wave', nom: 'Wave', Logo: WaveRond },
  { id: 'orange-money', nom: 'Orange Money', Logo: OrangeMoneyRond },
  { id: 'mixx-yas', nom: 'Mixx by Yas', Logo: MixxRond },
  { id: 'carte', nom: 'Carte bancaire', sous: 'Visa, Mastercard' },
];

// Panneau qui se deplie / replie en douceur (hauteur animee).
function Depliable({ ouvert, id, children }) {
  return (
    <div
      id={id}
      className={`grid transition-[grid-template-rows] duration-300 ease-out ${ouvert ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      aria-hidden={!ouvert}
      inert={ouvert ? undefined : ''}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}

export default function MoyensPaiement({ valeur, onChange, telephone }) {
  return (
    <div className="space-y-2.5" role="radiogroup" aria-label="Moyen de paiement">
      {MOYENS_PAIEMENT.map((m) => {
        const actif = valeur === m.id;
        const estCarte = m.id === 'carte';
        return (
          <div
            key={m.id}
            className={`overflow-hidden rounded-2xl border transition-colors ${
              actif ? 'border-primary bg-primary/[0.03] shadow-card' : 'border-line bg-surface'
            }`}
          >
            <button
              type="button"
              role="radio"
              aria-checked={actif}
              aria-controls={`panneau-${m.id}`}
              onClick={() => onChange(m.id)}
              className="flex min-h-16 w-full items-center gap-3 px-3.5 py-2.5 text-left"
            >
              {estCarte ? (
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-white" aria-hidden="true">
                  <CreditCard size={20} />
                </span>
              ) : (
                <m.Logo />
              )}
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{m.nom}</span>
                {m.sous && <span className="block text-xs text-ink-light">{m.sous}</span>}
              </span>
              {estCarte && <CartesLogos />}
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                  actif ? 'border-primary bg-primary text-white' : 'border-line'
                }`}
                aria-hidden="true"
              >
                {actif && <Check size={14} strokeWidth={3} />}
              </span>
            </button>

            <Depliable ouvert={actif} id={`panneau-${m.id}`}>
              {estCarte ? (
                <p className="flex items-start gap-2 border-t border-line px-3.5 py-3 text-xs text-ink-light">
                  <Lock size={14} className="mt-0.5 shrink-0 text-success" aria-hidden="true" />
                  <span>
                    Vous saisirez votre carte sur la page sécurisée de notre partenaire de paiement.
                    Vos données de carte ne passent jamais par {marque.nom}.
                  </span>
                </p>
              ) : (
                <div className="flex items-start gap-2 border-t border-line px-3.5 py-3 text-xs text-ink-light">
                  <Smartphone size={14} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                  <span>
                    Vous validerez le paiement dans {m.nom}
                    {telephone ? <> avec le compte <strong className="text-ink">{formaterTelephone(telephone)}</strong></> : null}.
                  </span>
                </div>
              )}
            </Depliable>
          </div>
        );
      })}
    </div>
  );
}
