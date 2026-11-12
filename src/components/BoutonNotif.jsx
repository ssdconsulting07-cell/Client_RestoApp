import { Bell } from 'lucide-react';
import { useNotif } from '../context/NotifContext';

export default function BoutonNotif() {
  const { nbNouveautes, ouvrir } = useNotif();

  return (
    <button
      type="button"
      onClick={ouvrir}
      aria-label={nbNouveautes > 0 ? `Voir les annonces (${nbNouveautes} nouvelle${nbNouveautes > 1 ? 's' : ''})` : 'Voir les annonces'}
      className="relative flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface shadow-card transition-transform active:scale-95"
    >
      <Bell size={20} strokeWidth={2} className="text-ink" />
      {nbNouveautes > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
          {nbNouveautes}
        </span>
      )}
    </button>
  );
}
