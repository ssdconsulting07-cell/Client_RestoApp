import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Accueil from './features/produits/Accueil.jsx'
import ProduitDetail from './features/produits/ProduitDetail.jsx'
import Panier from './features/commandes/Panier.jsx'
import Checkout from './features/commandes/Checkout.jsx'
import Suivi from './features/commandes/Suivi.jsx'
import Profil from './features/profil/Profil.jsx'
import Favoris from './features/profil/Favoris.jsx'
import Historique from './features/profil/Historique.jsx'

// Parcours (voir maquette v4, sans compte obligatoire) :
// Accueil -> ProduitDetail -> Panier -> Checkout (invite) -> Suivi
// + Profil / Favoris / Historique accessibles depuis la barre d'onglets

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/produit/:id" element={<ProduitDetail />} />
        <Route path="/panier" element={<Panier />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/suivi/:orderId" element={<Suivi />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="/favoris" element={<Favoris />} />
        <Route path="/historique" element={<Historique />} />
      </Routes>
    </BrowserRouter>
  )
}
