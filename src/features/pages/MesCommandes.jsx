export default function MesCommandes() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-2">Mes commandes</h1>
      <p className="text-sm text-ink-light mb-5">
        Ici s'affichera l'historique de vos commandes, retrouvé via votre numéro de téléphone.
      </p>
      <div className="bg-surface p-10 rounded-md shadow-card text-center text-ink-light">
        📦 Aucune commande pour l'instant.
      </div>
    </div>
  );
}