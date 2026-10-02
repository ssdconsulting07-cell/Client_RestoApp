import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';
import BoutonPanier from './BoutonPanier';
import BoutonNotif from './BoutonNotif';

export default function Layout() {
  return (
    <>
      <main className="min-h-screen pb-24">
        <Outlet />
      </main>

      <BoutonNotif />
      <BoutonPanier />
      <NavBar />
    </>
  );
}