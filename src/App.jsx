import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';

import Layout from './components/Layout';
import Accueil from './pages/Accueil';
import Menu from './pages/Menu';
import MesCommandes from './pages/MesCommandes';

export default function App() {
  return (
    <CartProvider>
      <OrderProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Accueil />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/commandes" element={<MesCommandes />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </OrderProvider>
    </CartProvider>
  );
}