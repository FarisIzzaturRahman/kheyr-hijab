import { useCallback, useEffect, useState } from 'react';
import About from './components/About';
import AdminPortal from './components/AdminPortal';
import Advantages from './components/Advantages';
import BackToTop from './components/BackToTop';
import CatalogPage from './components/CatalogPage';
import Collections from './components/Collections';
import Faq from './components/Faq';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import Footer from './components/Footer';
import Header from './components/Header';
import Hero from './components/Hero';
import ScrollProgress from './components/ScrollProgress';
import Testimonials from './components/Testimonials';
import { StoreProvider, useStore } from './context/StoreContext';
import useScrollExperience from './hooks/useScrollExperience';

function MainApp() {
  const { promoBanner } = useStore();

  const [currentView, setCurrentView] = useState(() => {
    if (typeof window !== 'undefined') {
      if (window.location.hash === '#admin' || window.location.pathname.startsWith('/admin')) {
        return 'admin';
      }
      if (window.location.hash === '#katalog') {
        return 'catalog';
      }
    }
    return 'home';
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { activeSection, showFloatingCta } = useScrollExperience();

  const navigateToCatalog = useCallback(() => {
    setCurrentView('catalog');
    window.location.hash = 'katalog';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const navigateToHome = useCallback(() => {
    setCurrentView('home');
    if (window.location.hash) {
      window.history.pushState(null, '', window.location.pathname);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Listen to browser Back/Forward (popstate & hashchange)
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin' || window.location.pathname.startsWith('/admin')) {
        setCurrentView('admin');
      } else if (window.location.hash === '#katalog') {
        setCurrentView('catalog');
      } else {
        setCurrentView('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, []);

  // If Admin View is active, render Admin Portal standalone
  if (currentView === 'admin') {
    return <AdminPortal onBackToWebsite={navigateToHome} />;
  }

  return (
    <>
      <ScrollProgress />

      {/* Top Announcement Promo Bar if enabled by Admin */}
      {promoBanner?.enabled && (
        <div className="relative z-50 overflow-hidden bg-gradient-to-r from-emeraldDeep via-emeraldSoft to-emeraldDeep py-2 px-4 text-center text-xs font-bold text-pearl border-b border-champagne/30 shadow-sm animate-floatIn">
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-2">
            <span className="rounded-full bg-champagne px-2.5 py-0.5 text-[10px] font-bold text-emeraldInk shadow-xs">
              {promoBanner.badge || 'PROMO'}
            </span>
            <span>{promoBanner.text}</span>
          </div>
        </div>
      )}

      <Header
        activeSection={activeSection}
        currentView={currentView}
        onNavigateToCatalog={navigateToCatalog}
        onNavigateToHome={navigateToHome}
        onMenuOpenChange={setMobileMenuOpen}
      />

      {currentView === 'catalog' ? (
        <CatalogPage onBackToHome={navigateToHome} />
      ) : (
        <main>
          <Hero />
          <About />
          <Collections onNavigateToCatalog={navigateToCatalog} />
          <Advantages />
          <Testimonials />
          <Faq />
        </main>
      )}

      <Footer onNavigateToCatalog={navigateToCatalog} />
      <BackToTop />
      <FloatingWhatsApp visible={showFloatingCta && !mobileMenuOpen} />
    </>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <MainApp />
    </StoreProvider>
  );
}
