import { useEffect, useState } from 'react';

export default function SplashScreen({ onFinish, duree = 4500 }) {
  const [sortie, setSortie] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setSortie(true), duree - 700);
    const t2 = setTimeout(() => onFinish(), duree);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [duree, onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[999] flex flex-col items-center justify-center bg-black transition-opacity duration-700 ${
        sortie ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Cercle rouge + monogramme SY */}
      <div className="relative animate-[popIn_1s_ease-out]">
        {/* Halo rouge pulsant */}
        <div className="absolute inset-0 rounded-full bg-primary blur-3xl opacity-40 animate-pulse" />

        {/* Cercle */}
        <div className="relative w-32 h-32 rounded-full bg-primary flex items-center justify-center shadow-2xl">
          <span className="font-serif text-white text-5xl font-bold tracking-tight">
            SY
          </span>
        </div>
      </div>

      {/* Nom de l'entreprise */}
      <h1 className="font-serif text-3xl text-white mt-8 animate-[fadeUp_0.9s_ease-out_0.4s_both]">
        SenYummies
      </h1>

      {/* Sous-titre */}
      <p className="text-xs text-white/50 tracking-[0.3em] uppercase mt-2 animate-[fadeUp_0.9s_ease-out_0.6s_both]">
        Chez Ketchup
      </p>

      {/* Barre de chargement */}
      <div className="mt-14 w-40 h-1 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-primary animate-[loading_3.5s_ease-in-out_forwards]" />
      </div>

      {/* Petite mention */}
      <p className="absolute bottom-8 text-[10px] text-white/30 tracking-widest uppercase">
        SSD Consulting
      </p>
    </div>
  );
}