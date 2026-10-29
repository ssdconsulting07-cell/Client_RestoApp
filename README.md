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

## Organisation

Le code est organisé par type de fichier (pas par feature — mise à jour du
24/10/2026 après audit, l'ancienne description `src/features/*` ne
correspondait plus à l'arborescence réelle) :

- `src/pages/` — Accueil, Menu, Panier, Confirmation (checkout invité), MesCommandes (suivi)
- `src/components/` — composants partagés (NavBar, Header, cartes produit, modales, etc.)
- `src/context/` — CartContext, OrderContext, ToastContext, NotifContext
- `src/api/` — un module par ressource (menu, commandes, zones, nouveautes), tous construits sur `client.js`
- `src/data/` — données de démonstration encore utilisées par Accueil/Menu (`produits.js`) et par MesCommandes (`commandes.js`) en attendant le branchement API (voir `brainstorming-chez-ketchup.md`)

- `src/api/client.js` — client HTTP déjà configuré : base `VITE_API_BASE_URL` (voir `.env.example`), conserve `{ code, message, field }` sur l'erreur rejetée. À utiliser pour tous les appels API, pas de `fetch` brut.
- `src/theme.js` — palette de marque : rouge `#A6192E`, noir `#141414`, blanc `#FFFFFF`, Poppins. Même valeurs que `tailwind.config.js` (couleur `primary`).

## Le contrat d'API

Le contrat (`openapi.yaml`) vit uniquement dans `Backend_RestoApp`. Consultez la doc générée (Swagger UI) une fois le backend lancé : `http://localhost:8080/api/v1/swagger-ui.html` — pas de fichier à synchroniser ici.

## Rappels

- **Jamais de compte obligatoire** : le checkout reste invité (nom optionnel, téléphone, adresse) — pas de mot de passe, pas d'écran de connexion.
- Le paiement se fait derrière l'API backend (`PaymentProvider`), jamais d'appel direct à un prestataire depuis le frontend.
- **Stratégie de branches (identique dans les 3 dépôts)** : `feature/*` → PR vers `develop` → `staging` → `preprod` → `main`. Branches principales protégées, chaque promotion passe par la CI.


## si tu voix de produit de zone ou autre  lance
 # npx json-server --watch db.json --port 3001

## CI/CD et stratégie de branches

Flux : `feature/*` → PR vers `develop` → `staging` → `preprod` → `main`. Structure identique dans les 3 dépôts (`Backend_RestoApp`, `Client_RestoApp`, `Manager_RestoApp`).

- **Branche par défaut du dépôt : `develop`** (pas `main`) — pour que GitHub propose `develop` par défaut à la création d'une PR, et éviter les merges accidentels vers `main` (incident déjà vécu sur l'ancien monorepo).
- **`develop`** : la CI (check `build`, voir `.github/workflows/`) doit passer avant de merger une PR. Pas de relecture obligatoire.
- **`staging`, `preprod`, `main`** : la CI (check `build`) doit passer **et** au moins 1 relecture (review) approuvée est obligatoire avant de merger.
- Ces règles sont appliquées via les "branch protection rules" GitHub sur les 3 dépôts (branches principales protégées, non contournables sauf par un admin).
- L'ancien monorepo `Resto_app` est désormais **archivé** (lecture seule) — ce dépôt-ci est la référence actuelle pour l'équipe App Client.
