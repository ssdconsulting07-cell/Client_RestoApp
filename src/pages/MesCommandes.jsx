import { Receipt } from 'lucide-react';
import Header from '../components/Header';

export default function MesCommandes() {
  return (
    <div className="max-w-app mx-auto px-4 pt-6">
      <Header
        titre="Mes commandes"
        sousTitre="Retrouvez l'historique de vos commandes"
      />

      <div className="bg-surface p-10 rounded-md shadow-card flex flex-col items-center gap-3 text-ink-light">
        <Receipt size={40} strokeWidth={1.5} />
        <span className="text-sm">Aucune commande pour l'instant.</span>
      </div>
    </div>
  );
}