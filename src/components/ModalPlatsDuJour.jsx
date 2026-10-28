import { useEffect, useState } from 'react';
import { X, Flame, Sun, Moon } from 'lucide-react';
import useScrollLock from '../hooks/useScrollLock';
import ProduitCarte from './ProduitCarte';

export default function ModalPlatsDuJour({ ouvert, onFermer, plats, onAjouter }) {
  const [onglet, setOnglet] = useState('dejeuner');
  const [visible, setVisible] = useState(false);

  useScrollLock(ouvert);

  useEffect(() => {
    if (ouvert) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [ouvert]);

  useEffect(() => {
    if (!ouvert) return;
    const onKey = (e) => e.key === 'Escape' && onFermer();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [ouvert, onFermer]);

  if (!ouvert) return null;

  const platsDejeuner = plats.filter((p) => p.moment === 'dejeuner');
  const platsDiner = plats.filter((p) => p.moment === 'diner');
  const platsAffiches = onglet === 'dejeuner' ? platsDejeuner : platsDiner;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onFermer}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-surface w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[85vh] rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col shadow-2xl transition-transform duration-300 ease-out ${
          visible
            ? 'translate-y-0 scale-100'
            : 'translate-y-full sm:translate-y-6 sm:scale-95'
        }`}
      >
        {/* Poignée mobile */}
        <div className="sm:hidden flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 rounded-full bg-ink/20" />
        </div>

        {/* En-tête */}
        <div className="relative bg-gradient-to-br from-primary to-primary-dark text-white px-5 pt-4 pb-5">
          <button
            onClick={onFermer}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <Flame size={16} />
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/90">
              Aujourd'hui
            </p>
          </div>
          <h2 className="font-serif text-2xl font-bold">Plats du jour</h2>
          <p className="text-xs text-white/80 mt-1">
            Déjeuner & Dîner — commandez directement
          </p>
        </div>

        {/* Onglets */}
        <div className="flex border-b border-line">
          <OngletBtn
            actif={onglet === 'dejeuner'}
            onClick={() => setOnglet('dejeuner')}
            icon={<Sun size={16} />}
            label="Déjeuner"
            count={platsDejeuner.length}
          />
          <OngletBtn
            actif={onglet === 'diner'}
            onClick={() => setOnglet('diner')}
            icon={<Moon size={16} />}
            label="Dîner"
            count={platsDiner.length}
          />
        </div>

        {/* Grille de cartes (mêmes que Accueil) */}
        <div className="flex-1 overflow-y-auto p-4 bg-cream">
          {platsAffiches.length === 0 ? (
            <p className="text-center text-sm text-ink-light italic py-12">
              Aucun plat disponible pour ce moment.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {platsAffiches.map((p) => (
                <ProduitCarte key={p.id} produit={p} onAjouter={onAjouter} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function OngletBtn({ actif, onClick, icon, label, count }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${
        actif
          ? 'text-primary border-b-2 border-primary'
          : 'text-ink-light hover:text-ink'
      }`}
    >
      {icon}
      {label}
      <span className="text-xs opacity-70">({count})</span>
    </button>
  );
}