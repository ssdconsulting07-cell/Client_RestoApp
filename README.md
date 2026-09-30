# Client_RestoApp — App Client SenYummies (équipe App Client)

Vitrine publique de commande : menu, panier, checkout invité (sans compte), suivi de commande. Stack : React 18 + Vite.

## Démarrage rapide

```
cp .env.example .env
npm install
npm run dev
```

L'app tourne sur `http://localhost:5173`. Elle attend le backend sur `http://localhost:8080/api/v1` (voir `VITE_API_BASE_URL` dans `.env`) — lancez `Backend_RestoApp` en local (`docker compose up --build`), ou demandez à l'équipe Backend un environnement partagé.

Autres scripts : `npm run build` (build de prod), `npm run preview` (prévisualiser le build).

## Organisation — par fonctionnalité

Le code est organisé par fonctionnalité dans `src/features/`, pas par type de fichier :

- `features/produits/` — Accueil (menu), Détail produit
- `features/commandes/` — Panier, Checkout (invité), Suivi de commande
- `features/profil/` — Profil, Favoris, Historique

- `src/api/client.js` — client HTTP déjà configuré : base `/api/v1`, gère le format d'erreur standard (`{ code, message, field }`). À utiliser pour tous les appels API, pas de `fetch` brut.
- `src/theme.js` — palette de marque : rouge `#A6192E`, noir `#141414`, blanc `#FFFFFF`, Poppins.

## Le contrat d'API

Le contrat (`openapi.yaml`) vit uniquement dans `Backend_RestoApp`. Consultez la doc générée (Swagger UI) une fois le backend lancé : `http://localhost:8080/api/v1/swagger-ui.html` — pas de fichier à synchroniser ici.

## Rappels

- **Jamais de compte obligatoire** : le checkout reste invité (nom optionnel, téléphone, adresse) — pas de mot de passe, pas d'écran de connexion.
- Le paiement se fait derrière l'API backend (`PaymentProvider`), jamais d'appel direct à un prestataire depuis le frontend.
- **Stratégie de branches (identique dans les 3 dépôts)** : `feature/*` → PR vers `develop` → `staging` → `preprod` → `main`. Branches principales protégées, chaque promotion passe par la CI.
