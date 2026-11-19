import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import About from './components/About';
import Advantages from './components/Advantages';
import BackToTop from './components/BackToTop';
import CartDrawer from './components/CartDrawer';
import Collections from './components/Collections';
import Faq from './components/Faq';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import Footer from './components/Footer';
import Header from './components/Header';
import Hero from './components/Hero';
import ScrollProgress from './components/ScrollProgress';
import Testimonials from './components/Testimonials';
import TrackOrderModal from './components/TrackOrderModal';
import { StoreProvider } from './context/StoreContext';
import useScrollExperience from './hooks/useScrollExperience';

const AdminPortal = lazy(() => import('./components/AdminPortal'));
const CatalogPage = lazy(() => import('./components/CatalogPage'));

function ViewFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-pearl text-sm font-semibold text-ink/60">
      Memuat halaman...
    </div>
  );
}

function getViewFromLocation() {
  if (typeof window === 'undefined') return 'home';
  if (window.location.hash === '#admin' || window.location.pathname.startsWith('/admin')) {
    return 'admin';
  }
  if (window.location.hash === '#katalog') {
    return 'catalog';
  }
  return 'home';
}

function MainApp() {
  const [currentView, setCurrentView] = useState(getViewFromLocation);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [trackOrderOpen, setTrackOrderOpen] = useState(false);
  const { activeSection, showFloatingCta } = useScrollExperience(currentView);

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

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentView(getViewFromLocation());
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, []);

  if (currentView === 'admin') {
    return (
      <Suspense fallback={<ViewFallback />}>
        <AdminPortal onBackToWebsite={navigateToHome} />
      </Suspense>
    );
  }

  return (
    <>
      <ScrollProgress />

      <Header
        activeSection={activeSection}
        currentView={currentView}
        onNavigateToCatalog={navigateToCatalog}
        onNavigateToHome={navigateToHome}
        onOpenTrackOrder={() => setTrackOrderOpen(true)}
        onMenuOpenChange={setMobileMenuOpen}
      />

      {currentView === 'catalog' ? (
        <Suspense fallback={<ViewFallback />}>
          <CatalogPage onBackToHome={navigateToHome} />
        </Suspense>
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

      <Footer
        currentView={currentView}
        onNavigateToCatalog={navigateToCatalog}
        onNavigateToHome={navigateToHome}
        onOpenTrackOrder={() => setTrackOrderOpen(true)}
      />
      <CartDrawer />
      <TrackOrderModal open={trackOrderOpen} onClose={() => setTrackOrderOpen(false)} />
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
