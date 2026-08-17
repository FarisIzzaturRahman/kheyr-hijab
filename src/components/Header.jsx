import { ArrowRight, Grid, Menu, MessageCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { navItems } from '../data/content';

export default function Header({
  activeSection = 'beranda',
  currentView = 'home',
  onNavigateToCatalog,
  onNavigateToHome,
  onMenuOpenChange
}) {
  const { brand, waLinks, products } = useStore();
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const closeMenu = () => setOpen(false);

  useEffect(() => {
    onMenuOpenChange?.(open);
  }, [onMenuOpenChange, open]);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const scrolled = (window.scrollY || document.documentElement.scrollTop) > 20;
        setIsScrolled((prev) => (prev === scrolled ? prev : scrolled));
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  // Close menu on Escape key
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') closeMenu();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const handleBrandClick = (e) => {
    e.preventDefault();
    closeMenu();
    onNavigateToHome?.();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'border-b border-champagne/25 bg-emeraldInk/95 shadow-emerald backdrop-blur-xl'
          : 'border-b border-champagne/15 bg-emeraldInk/85 backdrop-blur-md'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-[72px] lg:px-8">
        <a
          href="#beranda"
          onClick={handleBrandClick}
          className="group flex items-center gap-2.5 font-display text-3xl font-semibold text-champagne"
        >
          <span>{brand.name}</span>
          <span className="h-1.5 w-1.5 rounded-full bg-champagne/60 transition-transform group-hover:scale-150" />
        </a>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-7 lg:flex">
          {navItems.map((item) => {
            const isActive = currentView === 'home' && activeSection === item.href.slice(1);
            return (
              <a
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                onClick={(e) => {
                  if (currentView !== 'home') {
                    e.preventDefault();
                    onNavigateToHome?.();
                    setTimeout(() => {
                      const el = document.getElementById(item.href.slice(1));
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }, 50);
                  }
                }}
                className={`relative py-1 text-sm font-medium transition hover:text-champagne ${
                  isActive ? 'text-champagne font-semibold' : 'text-pearl/80'
                }`}
              >
                {item.label}
                {isActive ? (
                  <span className="absolute inset-x-0 -bottom-1 h-0.5 rounded-full bg-champagne shadow-[0_0_8px_rgba(232,217,189,0.7)]" />
                ) : null}
              </a>
            );
          })}

          {/* E-Katalog Link in Navbar */}
          <button
            type="button"
            onClick={() => {
              if (currentView === 'catalog') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                onNavigateToCatalog?.();
              }
            }}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold transition ${
              currentView === 'catalog'
                ? 'bg-champagne text-emeraldInk shadow-md ring-2 ring-champagne/60'
                : 'border border-champagne/40 bg-champagne/15 text-champagne hover:bg-champagne hover:text-emeraldInk'
            }`}
          >
            <Grid size={13} />
            E-Katalog ({products.length} Koleksi)
          </button>
        </div>

        {/* Desktop CTA */}
        <a
          href={waLinks.ask}
          className="hidden items-center gap-2 rounded-full border border-champagne/60 bg-champagne/10 px-5 py-2.5 text-sm font-semibold text-pearl transition hover:bg-champagne hover:text-emeraldInk hover:shadow-soft lg:inline-flex"
        >
          <MessageCircle size={16} />
          Order via WhatsApp
          <ArrowRight size={16} />
        </a>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-champagne/30 text-champagne transition hover:bg-champagne/15 lg:hidden"
          aria-label={open ? 'Tutup navigasi' : 'Buka navigasi'}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      {open ? (
        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-champagne/15 bg-emeraldInk/98 px-4 pb-6 pt-3 shadow-emerald lg:hidden">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = currentView === 'home' && activeSection === item.href.slice(1);
              return (
                <a
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    isActive ? 'bg-champagne/15 text-champagne' : 'text-pearl/80 hover:bg-pearl/10'
                  }`}
                  onClick={(e) => {
                    closeMenu();
                    if (currentView !== 'home') {
                      e.preventDefault();
                      onNavigateToHome?.();
                      setTimeout(() => {
                        const el = document.getElementById(item.href.slice(1));
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }, 50);
                    }
                  }}
                >
                  {item.label}
                </a>
              );
            })}

            {/* Mobile E-Katalog Button */}
            <button
              type="button"
              onClick={() => {
                closeMenu();
                onNavigateToCatalog?.();
              }}
              className="mt-2 flex items-center justify-between rounded-xl border border-champagne/40 bg-champagne/15 px-4 py-3 text-sm font-bold text-champagne transition hover:bg-champagne hover:text-emeraldInk"
            >
              <span className="flex items-center gap-2">
                <Grid size={16} />
                Buka E-Katalog Lengkap
              </span>
              <span className="rounded-full bg-roseClay px-2 py-0.5 text-xs text-white">{products.length} Koleksi</span>
            </button>

            <a
              href={waLinks.ask}
              className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-champagne px-5 py-3 text-sm font-bold text-emeraldInk shadow-md"
              onClick={closeMenu}
            >
              <MessageCircle size={17} />
              Order via WhatsApp
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}
