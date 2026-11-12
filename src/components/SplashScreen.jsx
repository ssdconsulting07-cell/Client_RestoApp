import { useEffect, useState } from 'react';

// Ecran de demarrage — meme identite que le back-office (Manager_RestoApp) :
// monogramme "SY" sur le rouge de marque, nom SenYummies.
export default function SplashScreen({ onFinish, duree = 2400 }) {
  const [sortie, setSortie] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setSortie(true), Math.max(0, duree - 500));
    const t2 = setTimeout(onFinish, duree);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [duree, onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[999] flex flex-col items-center justify-center bg-ink transition-opacity duration-500 ${
        sortie ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
      onClick={onFinish}
      aria-hidden="true"
    >
      <div className="relative animate-[popIn_0.8s_ease-out]">
        <div className="absolute inset-0 animate-pulse rounded-[32px] bg-primary opacity-40 blur-3xl" />
        <div className="relative flex h-28 w-28 items-center justify-center rounded-[32px] bg-primary shadow-2xl">
          <span className="text-5xl font-bold tracking-tight text-white">SY</span>
        </div>
      </div>

      <p className="mt-8 animate-[fadeUp_0.8s_ease-out_0.3s_both] text-3xl font-bold tracking-tight text-white">
        SEN<span className="text-primary">YUMMIES</span>
      </p>

      <div className="mt-12 h-1 w-40 overflow-hidden rounded-full bg-white/10">
        <div className="h-full bg-primary" style={{ animation: `loading ${duree}ms ease-in-out forwards` }} />
      </div>

      <p className="absolute bottom-[max(2rem,env(safe-area-inset-bottom))] text-[10px] uppercase tracking-widest text-white/30">
        SSD Consulting
      </p>
    </div>
  );
}
