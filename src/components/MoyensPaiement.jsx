import { Check, Lock, CreditCard, Smartphone } from 'lucide-react';
import { WaveRond, OrangeMoneyRond, MixxRond, CartesLogos } from './LogosPaiement';
import { formaterTelephone } from '../utils/telephone';
import { marqueCarte, formaterNumero, formaterExpiration, chiffres } from '../utils/carte';

// Cles identiques au Manager (modesPaiement.jsx). "especes" n'existe qu'au
// comptoir : une commande passee depuis l'app est payee en ligne.
export const MOYENS_PAIEMENT = [
  { id: 'wave', nom: 'Wave', Logo: WaveRond },
  { id: 'orange-money', nom: 'Orange Money', Logo: OrangeMoneyRond },
  { id: 'mixx-yas', nom: 'Mixx by Yas', Logo: MixxRond },
  { id: 'carte', nom: 'Carte bancaire', sous: 'Visa, Mastercard' },
];

const champ =
  'w-full min-h-12 rounded-xl border bg-surface px-3 text-base tracking-wide focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10';

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

export default function MoyensPaiement({ valeur, onChange, telephone, carte, onCarteChange, erreurs, effacerErreur }) {
  const marque = marqueCarte(carte.numero);
  const maj = (champCarte, v, cleErreur) => {
    onCarteChange({ ...carte, [champCarte]: v });
    effacerErreur(cleErreur);
  };
  const Erreur = ({ cle }) =>
    erreurs[cle] ? <p className="mt-1 text-xs font-medium text-danger">{erreurs[cle]}</p> : null;
  const bord = (cle) => (erreurs[cle] ? 'border-danger' : 'border-line');

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
              {estCarte && <CartesLogos marque={actif ? marque : null} />}
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
                <div className="space-y-3 border-t border-line px-3.5 pb-4 pt-3.5">
                  <div>
                    <label htmlFor="carte-numero" className="mb-1.5 block text-xs font-semibold text-ink-light">Numéro de carte</label>
                    <div className="relative">
                      <input
                        id="carte-numero"
                        data-champ="carteNumero"
                        inputMode="numeric"
                        autoComplete="cc-number"
                        placeholder="1234 5678 9012 3456"
                        value={carte.numero}
                        onChange={(e) => maj('numero', formaterNumero(e.target.value), 'carteNumero')}
                        className={`${champ} ${bord('carteNumero')} pr-14`}
                        aria-invalid={Boolean(erreurs.carteNumero)}
                      />
                      {marque && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold uppercase text-ink-light">
                          {marque === 'visa' ? 'Visa' : 'MC'}
                        </span>
                      )}
                    </div>
                    <Erreur cle="carteNumero" />
                  </div>
                  <div>
                    <label htmlFor="carte-titulaire" className="mb-1.5 block text-xs font-semibold text-ink-light">Nom sur la carte</label>
                    <input
                      id="carte-titulaire"
                      data-champ="carteTitulaire"
                      autoComplete="cc-name"
                      autoCapitalize="characters"
                      placeholder="AWA NDIAYE"
                      value={carte.titulaire}
                      onChange={(e) => maj('titulaire', e.target.value.toUpperCase(), 'carteTitulaire')}
                      className={`${champ} ${bord('carteTitulaire')}`}
                      aria-invalid={Boolean(erreurs.carteTitulaire)}
                    />
                    <Erreur cle="carteTitulaire" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="carte-expiration" className="mb-1.5 block text-xs font-semibold text-ink-light">Expiration</label>
                      <input
                        id="carte-expiration"
                        data-champ="carteExpiration"
                        inputMode="numeric"
                        autoComplete="cc-exp"
                        placeholder="MM/AA"
                        value={carte.expiration}
                        onChange={(e) => maj('expiration', formaterExpiration(e.target.value), 'carteExpiration')}
                        className={`${champ} ${bord('carteExpiration')}`}
                        aria-invalid={Boolean(erreurs.carteExpiration)}
                      />
                      <Erreur cle="carteExpiration" />
                    </div>
                    <div>
                      <label htmlFor="carte-cvv" className="mb-1.5 block text-xs font-semibold text-ink-light">CVV</label>
                      <input
                        id="carte-cvv"
                        data-champ="carteCvv"
                        type="password"
                        inputMode="numeric"
                        autoComplete="cc-csc"
                        placeholder="123"
                        maxLength={3}
                        value={carte.cvv}
                        onChange={(e) => maj('cvv', chiffres(e.target.value).slice(0, 3), 'carteCvv')}
                        className={`${champ} ${bord('carteCvv')}`}
                        aria-invalid={Boolean(erreurs.carteCvv)}
                      />
                      <Erreur cle="carteCvv" />
                    </div>
                  </div>
                  <p className="flex items-start gap-2 text-xs text-ink-light">
                    <Lock size={14} className="mt-0.5 shrink-0 text-success" aria-hidden="true" />
                    Paiement sécurisé. Vos données de carte ne sont jamais enregistrées par SenYummies.
                  </p>
                </div>
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
