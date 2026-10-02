import { useState } from 'react';
import { Bell } from 'lucide-react';

export default function BoutonNotif() {
  const [nbNouveautes] = useState(0);

  return (
    <button
      onClick={() => alert('Nouveautés — à implémenter')}
      aria-label="Voir les nouveautés"
      className="fixed bottom-[84px] left-4 w-14 h-14 rounded-full bg-surface text-ink border border-line shadow-card flex items-center justify-center z-[101] active:scale-95 transition-transform"
    >
      <Bell size={22} strokeWidth={2.2} />
      {nbNouveautes > 0 && (
        <span className="absolute -top-1 -right-1 bg-danger text-white rounded-full text-[11px] font-bold min-w-[20px] h-5 flex items-center justify-center px-1">
          {nbNouveautes}
        </span>
      )}
    </button>
  );
}