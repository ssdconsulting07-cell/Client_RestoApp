# Client_RestoApp — App Client SenYummies (équipe App Client)

Vitrine publique de commande : menu, panier, checkout invité (sans compte), suivi de commande. Stack : React 18 + Vite.

## Démarrage rapide

```
cp .env.example .env
npm install
npm run api   # terminal 1 : API mock (json-server) sur http://localhost:3101
npm run dev   # terminal 2 : l'app sur http://localhost:5173
```

Tant que `Backend_RestoApp` n'expose pas encore les contrôleurs Produits/Commandes, l'app tourne sur le mock `db.json` (json-server). **Ce fichier reproduit à l'identique les données de démonstration du Manager** (`menuData.js`, `platsDuJourData.js`, `accompagnementsCondimentsData.js`, `annonceData.js`, `zonesLivraisonData.js`/`senegalZones.js`) : mêmes identifiants, noms, prix et statuts. Quand le backend sera prêt, passez `VITE_API_BASE_URL` à `http://localhost:8080/api/v1`.

**Démo du suivi de commande** : dans « Mes commandes », saisir le numéro **77 000 00 00**. Trois commandes de démonstration s'affichent : en livraison (avec QR), prête au comptoir et livrée.

Autres scripts : `npm run build` (build de prod), `npm run preview` (prévisualiser le build, avec la PWA active).

## Alignement avec le Manager (back-office)

L'app affiche **uniquement ce que le Gérant publie** et envoie ses commandes **au format attendu par la Cuisine, le Livreur et le Vendeur** :

| Ressource | Route | Règle côté client |
|---|---|---|
| Catégories | `GET /categories` | statut `ACTIF` uniquement |
| Produits | `GET /produits` | `ACTIF` dans une catégorie `ACTIF` ; `disponibilite: RUPTURE` → « Indisponible » ; badge « Tendance » |
| Plats du jour | `GET /plats-du-jour` | `ACTIF`, rattachés à un **jour** (`LUNDI`…`DIMANCHE`) ; commandables seulement le jour même |
| Accompagnements & condiments | `GET /accompagnements-condiments` | `ACTIF` ; proposés sur les burgers, prix ajouté (même règle que la caisse) |
| Annonces | `GET /annonces` | chaînes `ACTIF` de slides ; popup à l'arrivée (comme l'aperçu Gérant) |
| Zones | `GET /regions`, `GET /regions/{code}/secteurs` | régions actives, secteurs non masqués, prix de livraison par secteur |
| Commandes | `POST /commandes`, `GET /commandes?clientTelephone=` | voir ci-dessous |

Commande envoyée : `canal: "APP"`, `mode: "LIVRAISON" | "RETRAIT"`, `statut: "PAYEE"`, `moyenPaiement` (`wave`, `orange-money`, `mixx-yas`, `carte`), `clientPrenom`, `clientNom`, `clientTelephone` (`+221XXXXXXXXX`), `adresseLivraison` (nom de la zone), `note`, `lignes[]` (`produitId`, `type`, `nom`, `prixUnitaire` figés, `quantite`, `accompagnementNom`), `sousTotal`, `fraisLivraison`, `total`, `creeLe`.

Suivi : statuts et libellés de `transitions.js` (Manager), avec des étapes différentes en livraison et en retrait. Le QR présenté au livreur contient `SENYUMMIES-<ticket>`, le format scanné par `ScanLivraisonModal.jsx`.

## Géolocalisation de la livraison

À la commande en livraison, le client peut partager sa position exacte (« Utiliser ma position actuelle », facultatif). L'aperçu sur carte (OpenStreetMap) lui permet de la vérifier. La position part avec la commande (`positionLivraison: { latitude, longitude, precision }`). Côté Manager, le Livreur obtient un bouton « Itinéraire GPS ». La zone choisie reste obligatoire : c'est elle qui fixe le prix.

Le navigateur n'autorise la géolocalisation qu'en **HTTPS** (ou sur `localhost`) : le déploiement de production doit être servi en HTTPS.

## PWA

Installable (manifeste `public/manifest.webmanifest`, icônes `public/icons/`), service worker `public/sw.js` actif **en production seulement**. Les pages et fichiers de l'app sont mis en cache (l'app s'ouvre hors connexion). L'API n'est **jamais** mise en cache : un statut ou un prix périmé serait pire qu'une erreur.

## Organisation

- `src/pages/` : Accueil, Menu, Panier, Confirmation (checkout invité), MesCommandes (suivi)
- `src/components/` : composants partagés (NavBar, Header, ProduitCarte, modales, popup d'annonces…)
- `src/context/` : CatalogueContext (catalogue publié), CartContext (lignes au format caisse), OrderContext (téléphone), NotifContext (annonces), ToastContext
- `src/api/` : un module par ressource, tous construits sur `client.js` (pas de `fetch` brut)
- `src/utils/` : statuts (alignés sur `transitions.js`), téléphone, jours, format des prix
- `src/theme.js` : palette de marque, rouge `#A6192E`, noir `#141414`, Poppins (mêmes valeurs que `tailwind.config.js`)

## Le contrat d'API

Le contrat (`openapi.yaml`) vit uniquement dans `Backend_RestoApp`. Consultez la doc générée (Swagger UI) une fois le backend lancé : `http://localhost:8080/api/v1/swagger-ui.html` — pas de fichier à synchroniser ici.

## Rappels

- **Jamais de compte obligatoire** : le checkout reste invité (prénom et téléphone, nom facultatif, zone de livraison) — pas de mot de passe, pas d'écran de connexion.
- Le paiement se fait derrière l'API backend (`PaymentProvider`), jamais d'appel direct à un prestataire depuis le frontend.
- **Stratégie de branches (identique dans les 3 dépôts)** : `feature/*` → PR vers `develop` → `staging` → `preprod` → `main`. Branches principales protégées, chaque promotion passe par la CI.



## CI/CD et stratégie de branches

Flux : `feature/*` → PR vers `develop` → `staging` → `preprod` → `main`. Structure identique dans les 3 dépôts (`Backend_RestoApp`, `Client_RestoApp`, `Manager_RestoApp`).

- **Branche par défaut du dépôt : `develop`** (pas `main`) — pour que GitHub propose `develop` par défaut à la création d'une PR, et éviter les merges accidentels vers `main` (incident déjà vécu sur l'ancien monorepo).
- **`develop`** : la CI (check `build`, voir `.github/workflows/`) doit passer avant de merger une PR. Pas de relecture obligatoire.
- **`staging`, `preprod`, `main`** : la CI (check `build`) doit passer **et** au moins 1 relecture (review) approuvée est obligatoire avant de merger.
- Ces règles sont appliquées via les "branch protection rules" GitHub sur les 3 dépôts (branches principales protégées, non contournables sauf par un admin).
- L'ancien monorepo `Resto_app` est désormais **archivé** (lecture seule) — ce dépôt-ci est la référence actuelle pour l'équipe App Client.
