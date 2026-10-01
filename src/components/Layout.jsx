import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';
import BoutonPanier from './BoutonPanier';
import BoutonNotif from './BoutonNotif';

export default function Layout() {
  return (
    <>
      <main className="max-w-app mx-auto px-4 pt-4 pb-24 min-h-screen">
        <Outlet />
      </main>

      <BoutonNotif />
      <BoutonPanier />
      <NavBar />
    </>
  );
}