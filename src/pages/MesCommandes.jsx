import { Receipt } from 'lucide-react';

export default function MesCommandes() {
  return (
    <div className="max-w-app mx-auto px-4 pt-6">
      <h1 className="text-2xl font-semibold mb-2">Mes commandes</h1>
      <p className="text-sm text-ink-light mb-5">
        Ici s'affichera l'historique de vos commandes, retrouvé via votre numéro de téléphone.
      </p>

      <div className="bg-surface p-10 rounded-md shadow-card flex flex-col items-center gap-3 text-ink-light">
        <Receipt size={40} strokeWidth={1.5} />
        <span className="text-sm">Aucune commande pour l'instant.</span>
      </div>
    </div>
  );
}