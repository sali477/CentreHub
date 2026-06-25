import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const MainLayout = () => {
  const { pathname } = useLocation();
  const isChatPage = pathname === '/ai' || pathname.startsWith('/ai/');
  const isHomePage = pathname === '/';

  return (
    <div
      className={`flex flex-col bg-background ${
        isChatPage ? 'h-screen overflow-hidden' : 'min-h-screen'
      }`}
    >
      {!isHomePage && <Navbar />}
      <main
        className={`w-full ${
          isChatPage ? 'flex flex-1 min-h-0 flex-col overflow-hidden' : 'flex-1'
        }`}
      >
        <Outlet />
      </main>
      {!isChatPage && !isHomePage && <Footer />}
    </div>
  );
};

export default MainLayout;
