import { Bell } from 'lucide-react';
import { useNotif } from '../context/NotifContext';

export default function BoutonNotif() {
  const { nbNouveautes, ouvrir } = useNotif();

  return (
    <button
      onClick={ouvrir}
      aria-label="Voir les nouveautés"
      className="relative w-10 h-10 rounded-full bg-surface dark:bg-dark-surface border border-line dark:border-dark-line shadow-card flex items-center justify-center active:scale-95 transition-transform"
    >
      <Bell size={20} strokeWidth={2} className="text-ink dark:text-dark-ink" />
      {nbNouveautes > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-danger text-white rounded-full text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center px-1">
          {nbNouveautes}
        </span>
      )}
    </button>
  );
}