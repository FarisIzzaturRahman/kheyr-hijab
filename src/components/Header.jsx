import { ArrowRight, Menu, MessageCircle, X } from 'lucide-react';
import { useState } from 'react';
import { brand, navItems } from '../data/content';

const orderUrl = `https://wa.me/${brand.whatsapp}?text=${encodeURIComponent(
  'Assalamu alaikum KHEYR, saya ingin tanya koleksi hijab.'
)}`;

export default function Header({ activeSection = 'beranda' }) {
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-champagne/15 bg-emeraldInk/95 text-pearl backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-[72px] lg:px-8">
        <a href="#beranda" className="font-display text-3xl font-semibold text-champagne" onClick={closeMenu}>
          {brand.name}
        </a>

        <div className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              aria-current={activeSection === item.href.slice(1) ? 'page' : undefined}
              className={`text-sm font-medium transition hover:text-champagne ${
                activeSection === item.href.slice(1)
                  ? 'text-champagne'
                  : 'text-pearl/80'
              }`}
            >
              {item.label}
            </a>
          ))}
        </div>

        <a
          href={orderUrl}
          className="hidden items-center gap-2 rounded-full border border-champagne/60 px-5 py-2.5 text-sm font-semibold text-pearl transition hover:bg-champagne hover:text-emeraldInk lg:inline-flex"
        >
          <MessageCircle size={16} />
          Order via WhatsApp
          <ArrowRight size={16} />
        </a>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-champagne/30 text-champagne lg:hidden"
          aria-label={open ? 'Tutup navigasi' : 'Buka navigasi'}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {open ? (
        <div className="border-t border-champagne/15 bg-emeraldInk px-4 pb-5 pt-2 lg:hidden">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                aria-current={activeSection === item.href.slice(1) ? 'page' : undefined}
                className={`rounded-xl px-3 py-3 text-sm font-medium hover:bg-pearl/10 hover:text-champagne ${
                  activeSection === item.href.slice(1)
                    ? 'bg-pearl/10 text-champagne'
                    : 'text-pearl/80'
                }`}
                onClick={closeMenu}
              >
                {item.label}
              </a>
            ))}
            <a
              href={orderUrl}
              className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-champagne px-5 py-3 text-sm font-semibold text-emeraldInk"
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
