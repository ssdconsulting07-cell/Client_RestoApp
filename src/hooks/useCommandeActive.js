import { useEffect, useState } from 'react';

const KEY = 'commande_active_id';

export default function useCommandeActive(commandes) {
  const [activeId, setActiveId] = useState(null);

  // Au montage : on regarde si une commande était mémorisée
  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    if (saved) setActiveId(saved);
  }, []);

  // On trouve la commande active (celle mémorisée, sinon la première de la liste)
  const activeCommande = commandes.find((c) => c.id === activeId) || commandes[0];

  // Quand on change de commande, on la sauvegarde
  const setActive = (id) => {
    localStorage.setItem(KEY, id);
    setActiveId(id);
  };

  return { activeCommande, setActive };
}