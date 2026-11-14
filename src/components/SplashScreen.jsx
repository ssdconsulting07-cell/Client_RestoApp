import { useEffect, useState } from 'react';
import { Monogramme, NomMarque } from './Marque';
import { marque } from '../config/marque';

// Ecran de demarrage — meme identite que le back-office (Manager_RestoApp) :
// monogramme (ou logo) sur la couleur de marque, nom du restaurant
// (src/config/marque.js). Affiche une fois
// par session (voir App.jsx) ; un toucher le passe.
export default function SplashScreen({ onFinish, duree = 2600 }) {
  const [sortie, setSortie] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setSortie(true), Math.max(0, duree - 450));
    const t2 = setTimeout(onFinish, duree);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [duree, onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[999] flex flex-col items-center justify-center overflow-hidden transition-opacity duration-500 ${
        sortie ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
      style={{
        background:
          'radial-gradient(120% 90% at 50% 35%, rgb(var(--marque-sombre)) 0%, rgb(var(--marque-nuit)) 45%, #0d0d0d 100%)',
      }}
      onClick={onFinish}
      aria-hidden="true"
    >
      {/* Halo et anneau qui se diffusent derriere le monogramme */}
      <div className="relative flex items-center justify-center">
        <span className="absolute h-44 w-44 rounded-full bg-primary/40 blur-3xl animate-[halo_2.4s_ease-in-out_infinite]" />
        <span className="absolute h-36 w-36 rounded-[40px] border-2 border-white/25 animate-[anneau_1.6s_ease-out_0.35s_both]" />
        <div className="relative animate-[popIn_0.7s_cubic-bezier(.2,.9,.3,1.2)_both] rounded-[32px] shadow-[0_20px_60px_-10px_rgb(var(--marque)/0.8)]">
          <Monogramme className="h-28 w-28 rounded-[32px]" texteClassName="text-5xl font-bold tracking-tight" />
        </div>
      </div>

      <p className="mt-10 animate-[fadeUp_0.7s_ease-out_0.35s_both] text-3xl font-bold tracking-tight text-white">
        <NomMarque accentClassName="text-primary-light" />
      </p>
      <p className="mt-2 animate-[fadeUp_0.7s_ease-out_0.6s_both] text-sm text-white/70">{marque.slogan}</p>

      <div className="mt-12 h-1 w-44 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-primary-light"
          style={{ animation: `loading ${duree - 300}ms cubic-bezier(.4,0,.2,1) forwards` }}
        />
      </div>

      <p className="absolute bottom-[max(2rem,env(safe-area-inset-bottom))] animate-[fadeUp_0.7s_ease-out_0.8s_both] text-[10px] uppercase tracking-[0.25em] text-white/40">
        v{__APP_VERSION__} · SSD Consulting
      </p>
    </div>
  );
}
