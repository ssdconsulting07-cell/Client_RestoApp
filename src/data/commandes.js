// Dates calculées dynamiquement pour que ça reste "frais" quand tu recharges
const maintenant = Date.now();
const H = 60 * 60 * 1000;
const J = 24 * H;

export const commandes = [
  {
    id: 'CMD-2025-0142',
    date: new Date(maintenant - 2 * H).toISOString(),
    statut: 'en-preparation', // en-attente | en-preparation | prete | livree | validee | annulee
    mode: 'livraison', // livraison | sur-place | a-emporter
    articles: [
      { id: 1, nom: 'Burger Smash Maison', prix: 4500, quantite: 2, photo: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=200&q=80' },
      { id: 9, nom: 'Bissap Frais', prix: 1000, quantite: 2, photo: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=200&q=80' },
    ],
    total: 11000,
  },
  {
    id: 'CMD-2025-0141',
    date: new Date(maintenant - 5 * H).toISOString(),
    statut: 'prete',
    mode: 'a-emporter',
    articles: [
      { id: 2, nom: 'Poulet Grillé Braisé', prix: 5000, quantite: 1, photo: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=200&q=80' },
      { id: 7, nom: 'Tiramisu Maison', prix: 2500, quantite: 1, photo: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=200&q=80' },
    ],
    total: 7500,
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
  {
    id: 'CMD-2025-0138',
    date: new Date(maintenant - 5 * J).toISOString(),
    statut: 'validee',
    mode: 'sur-place',
    articles: [
      { id: 4, nom: "Brochettes d'Agneau", prix: 6000, quantite: 2, photo: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=200&q=80' },
      { id: 10, nom: 'Jus de Gingembre', prix: 1200, quantite: 2, photo: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=200&q=80' },
    ],
    total: 14400,
  },
  {
    id: 'CMD-2025-0136',
    date: new Date(maintenant - 8 * J).toISOString(),
    statut: 'validee',
    mode: 'livraison',
    articles: [
      { id: 3, nom: 'Thieboudienne du Chef', prix: 5500, quantite: 1, photo: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=200&q=80' },
    ],
    total: 5500,
  },
  {
    id: 'CMD-2025-0125',
    date: new Date(maintenant - 15 * J).toISOString(),
    statut: 'validee',
    mode: 'livraison',
    articles: [
      { id: 6, nom: 'Frites Maison', prix: 1500, quantite: 2, photo: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=200&q=80' },
    ],
    total: 3000,
  },
];