import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import { ToastProvider } from './context/ToastContext';

import Layout from './components/Layout';
import Accueil from './pages/Accueil';
import Menu from './pages/Menu';
import Panier from './pages/Panier';
import Confirmation from './pages/Confirmation';
import MesCommandes from './pages/MesCommandes';

export default function App() {
  return (
    <CartProvider>
      <OrderProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Accueil />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/panier" element={<Panier />} />
                <Route path="/confirmation" element={<Confirmation />} />
                <Route path="/commandes" element={<MesCommandes />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </OrderProvider>
    </CartProvider>
  );
}