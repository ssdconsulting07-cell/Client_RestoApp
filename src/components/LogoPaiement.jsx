export default function LogoPaiement({ id, size = 32 }) {
  const logos = {
    wave: <WaveLogo size={size} />,
    orange: <OrangeMoneyLogo size={size} />,
    mixx: <MixxLogo size={size} />,
    carte: <CarteLogo size={size} />,
  };
  return logos[id] || null;
}

function WaveLogo({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="20" fill="#1DC3F3" />
      <path d="M8 22c2-4 5-4 7 0s5 4 7 0 5-4 7 0" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M8 28c2-4 5-4 7 0s5 4 7 0 5-4 7 0" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6" />
    </svg>
  );
}

function OrangeMoneyLogo({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="36" height="36" rx="6" fill="#FF7900" />
      <rect x="8" y="12" width="24" height="16" rx="2" fill="#fff" />
      <text x="20" y="25" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="12" fill="#FF7900">OM</text>
    </svg>
  );
}

function MixxLogo({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="36" height="36" rx="6" fill="#0033A0" />
      <text x="20" y="26" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="11" fill="#fff">MIXX</text>
      <circle cx="32" cy="10" r="3" fill="#FFD700" />
    </svg>
  );
}

function CarteLogo({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="36" height="36" rx="6" fill="#fff" stroke="#E9ECEF" />
      <rect x="6" y="14" width="28" height="14" rx="2" fill="#1A1F71" />
      <rect x="6" y="18" width="28" height="3" fill="#fff" />
      <text x="20" y="26" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="6" fill="#fff">VISA</text>
    </svg>
  );
}