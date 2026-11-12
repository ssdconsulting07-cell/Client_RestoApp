// Logos des moyens de paiement — memes sources que le Manager
// (src/features/vendeur/modesPaiement.jsx) :
// - Wave : icone officielle de l'appli (public/logos-paiement/wave.png) ;
// - Orange Money : symbole officiel (deux fleches croisees, orange.sn) ;
// - Mixx by Yas : logo officiel (public/logos-paiement/mixx-yas.svg) sur le
//   bleu marine de la marque (#003881) ;
// - Visa (trace simple-icons, bleu #1A1F71) et Mastercard (cercles officiels).
// Fintechs mobile money : decoupees en cercle. Cartes : Visa + Mastercard
// cote a cote, au format carte.

const rond = 'flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-black/5';

export function WaveRond() {
  return (
    <span className={`${rond} bg-[#1DC3F3]`} aria-hidden="true">
      <img src="/logos-paiement/wave.png" alt="" className="h-full w-full scale-110 object-cover" />
    </span>
  );
}

export function OrangeMoneyRond() {
  return (
    <span className={`${rond} bg-white`} aria-hidden="true">
      <svg viewBox="3 4.5 32 32" className="h-7 w-7" focusable="false">
        <path
          fill="#000"
          transform="translate(4 13.765)"
          d="M3.413.333c-1.034 0-1.871.832-1.871 1.858 0 1.027.837 1.859 1.87 1.859h4.699L.548 11.56a1.85 1.85 0 0 0 0 2.628 1.88 1.88 0 0 0 2.646 0l7.562-7.512v4.667c0 1.026.837 1.858 1.871 1.858 1.033 0 1.87-.832 1.87-1.858V2.19a1.864 1.864 0 0 0-1.87-1.858H3.413z"
        />
        <path
          fill="#FF7900"
          transform="translate(19.867 12.065)"
          d="M2.372 14.902h9.215c1.033 0 1.87-.832 1.87-1.858a1.864 1.864 0 0 0-1.87-1.858H6.889l7.562-7.512a1.85 1.85 0 0 0 0-2.628 1.88 1.88 0 0 0-2.645 0L4.243 8.558V3.892a1.865 1.865 0 0 0-1.87-1.859c-1.034 0-1.871.832-1.871 1.859v9.152c0 1.026.837 1.858 1.87 1.858"
        />
      </svg>
    </span>
  );
}

export function MixxRond() {
  return (
    <span className={`${rond} bg-[#003881] p-1.5`} aria-hidden="true">
      <img src="/logos-paiement/mixx-yas.svg" alt="" className="max-h-full max-w-full object-contain" />
    </span>
  );
}

export function VisaLogo({ actif = true }) {
  return (
    <span
      className={`flex h-7 w-11 items-center justify-center rounded-md border border-line bg-white transition-opacity ${actif ? '' : 'opacity-30'}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className="h-6 w-8" focusable="false">
        <path
          fill="#1A1F71"
          d="M9.112 8.262L5.97 15.758H3.92L2.374 9.775c-.094-.368-.175-.503-.461-.658C1.447 8.864.677 8.627 0 8.479l.046-.217h3.3a.904.904 0 01.894.764l.817 4.338 2.018-5.102zm8.033 5.049c.008-1.979-2.736-2.088-2.717-2.972.006-.269.262-.555.822-.628a3.66 3.66 0 011.913.336l.34-1.59a5.207 5.207 0 00-1.814-.333c-1.917 0-3.266 1.02-3.278 2.479-.012 1.079.963 1.68 1.698 2.04.756.367 1.01.603 1.006.931-.005.504-.602.725-1.16.734-.975.015-1.54-.263-1.992-.473l-.351 1.642c.453.208 1.289.39 2.156.398 2.037 0 3.37-1.006 3.377-2.564m5.061 2.447H24l-1.565-7.496h-1.656a.883.883 0 00-.826.55l-2.909 6.946h2.036l.405-1.12h2.488zm-2.163-2.656l1.02-2.815.588 2.815zm-8.16-4.84l-1.603 7.496H8.34l1.605-7.496z"
        />
      </svg>
    </span>
  );
}

export function MastercardLogo({ actif = true }) {
  return (
    <span
      className={`flex h-7 w-11 items-center justify-center rounded-md border border-line bg-white transition-opacity ${actif ? '' : 'opacity-30'}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 48 30" className="h-5 w-8" focusable="false">
        <g style={{ isolation: 'isolate' }}>
          <circle cx="19" cy="15" r="11" fill="#EB001B" />
          <circle cx="29" cy="15" r="11" fill="#F79E1B" style={{ mixBlendMode: 'multiply' }} />
        </g>
      </svg>
    </span>
  );
}

// marque : 'visa' | 'mastercard' | null — met en avant la carte reconnue.
export function CartesLogos({ marque = null }) {
  return (
    <span className="flex shrink-0 items-center gap-1.5">
      <VisaLogo actif={!marque || marque === 'visa'} />
      <MastercardLogo actif={!marque || marque === 'mastercard'} />
    </span>
  );
}
