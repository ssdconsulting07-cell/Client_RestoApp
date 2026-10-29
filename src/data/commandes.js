const maintenant = Date.now();
const H = 60 * 60 * 1000;
const J = 24 * H;

// Mock de demonstration pour la page "Mes commandes" (voir MesCommandes.jsx,
// qui porte sa propre logique d'affichage/statut — ce fichier ne fournit
// que les donnees). mode: 'livraison' | 'retrait' — memes valeurs que le
// backend (Manager_RestoApp, mode LIVRAISON/RETRAIT), pas de 'sur-place'
// ni 'a-emporter' qui n'existent pas dans le modele reel.
export const commandes = [
  {
    id: 'CMD-2025-0142',
    date: new Date(maintenant - 2 * H).toISOString(),
    statut: 'en-preparation',
    mode: 'livraison',
    articles: [
      { id: 1, nom: 'Burger Smash Maison', prix: 4500, quantite: 2, photo: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=200&q=80' },
      { id: 9, nom: 'Bissap Frais', prix: 1000, quantite: 2, photo: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=200&q=80' },
    ],
    total: 11000,
  },
  {
    id: 'CMD-2025-0141',
    date: new Date(maintenant - 5 * H).toISOString(),
    statut: 'en-livraison',
    mode: 'livraison',
    articles: [
      { id: 2, nom: 'Poulet Grillé Braisé', prix: 5000, quantite: 1, photo: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=200&q=80' },
      { id: 7, nom: 'Tiramisu Maison', prix: 2500, quantite: 1, photo: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=200&q=80' },
    ],
    total: 7500,
    livreur: {
      nom: 'Amadou Diallo',
      telephone: '+221771234567',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
      note: 4.9,
      vehicule: 'Scooter',
    },
  },
  {
    id: 'CMD-2025-0140',
    date: new Date(maintenant - 30 * 60 * 1000).toISOString(),
    statut: 'en-attente',
    mode: 'retrait',
    articles: [
      { id: 5, nom: 'Cheeseburger Classique', prix: 3500, quantite: 1, photo: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&q=80' },
    ],
    total: 3500,
  },
  {
    id: 'CMD-2025-0139',
    date: new Date(maintenant - 2 * J).toISOString(),
    statut: 'livree',
    mode: 'livraison',
    articles: [
      { id: 5, nom: 'Cheeseburger Classique', prix: 3500, quantite: 3, photo: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&q=80' },
    ],
    total: 10500,
  },
];
