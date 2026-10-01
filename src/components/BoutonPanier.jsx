import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function BoutonPanier() {
  const navigate = useNavigate();
  const { nbArticles } = useCart();

  return (
    <button
      onClick={() => navigate('/panier')}
      aria-label="Voir le panier"
      className="fixed bottom-[84px] right-4 w-14 h-14 rounded-full bg-primary text-white text-2xl shadow-float flex items-center justify-center z-[101] active:scale-95 transition-transform"
    >
      🛒
      {nbArticles > 0 && (
        <span className="absolute -top-1 -right-1 bg-accent text-black rounded-full text-[11px] font-bold min-w-[20px] h-5 flex items-center justify-center px-1">
          {nbArticles}
        </span>
      )}
    </button>
  );
}