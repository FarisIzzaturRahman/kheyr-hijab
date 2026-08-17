import { ArrowDown, ArrowRight, MessageCircle, RotateCcw, ShieldCheck, Sparkles, Star } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function Hero({ scrollOffset = 0 }) {
  const { brand, waLinks } = useStore();

  return (
    <section id="beranda" className="relative overflow-hidden pt-16 lg:pt-[72px]">
      <div className="grid min-h-[calc(100vh-4rem)] bg-emeraldInk lg:grid-cols-[1.1fr_0.9fr]">
        <div
          className="relative flex items-center overflow-hidden bg-satin bg-cover bg-center px-4 py-14 sm:px-6 lg:px-12 lg:py-16 xl:px-16"
          style={{ backgroundPosition: `center ${scrollOffset * -0.45}px` }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_12%,rgba(232,217,189,0.22),transparent_32%),linear-gradient(105deg,rgba(6,29,24,0.32),rgba(6,29,24,0.88))]" />
          
          <div
            className="relative z-10 mx-auto w-full max-w-xl animate-floatIn"
            style={{ transform: scrollOffset ? `translateY(${scrollOffset}px)` : undefined }}
          >
            {/* Exclusive Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-champagne/40 bg-emeraldSoft/60 px-4 py-1.5 text-xs font-bold tracking-wide text-champagne backdrop-blur-md">
              <Sparkles size={14} className="text-champagne" />
              <span>Koleksi Eksklusif Muslimah 2026</span>
            </div>

            <h1 className="mt-4 font-display text-6xl font-semibold leading-none text-[#f1e4c9] drop-shadow-[0_8px_30px_rgba(0,0,0,0.25)] sm:text-7xl lg:text-8xl">
              {brand.name}
            </h1>
            <p className="mt-4 max-w-lg text-balance text-base font-semibold uppercase tracking-wider text-pearl sm:text-lg">
              {brand.tagline}
            </p>
            <p className="mt-4 max-w-md text-base leading-8 text-pearl/90 font-normal">
              {brand.intro}
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col gap-3.5 sm:flex-row">
              <a
                href="#koleksi"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-pearl px-7 py-3 text-sm font-bold text-emeraldInk shadow-soft transition hover:-translate-y-0.5 hover:bg-champagne hover:shadow-lg"
              >
                Lihat Koleksi
                <ArrowRight size={17} />
              </a>
              <a
                href={waLinks.catalog}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-champagne/70 bg-emeraldSoft/30 px-6 py-3 text-sm font-bold text-pearl backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-champagne hover:text-emeraldInk"
              >
                <MessageCircle size={17} />
                Order via WhatsApp
              </a>
            </div>

            {/* Trust Highlights Bar */}
            <div className="mt-10 grid grid-cols-3 gap-2 border-t border-champagne/20 pt-6 text-xs text-pearl/80">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-champagne/15 text-champagne">
                  <Star size={14} fill="currentColor" />
                </div>
                <div>
                  <p className="font-bold text-champagne">4.9 / 5.0</p>
                  <p className="text-[11px] text-pearl/60">Rating Kepuasan</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-champagne/15 text-champagne">
                  <ShieldCheck size={14} />
                </div>
                <div>
                  <p className="font-bold text-champagne">100%</p>
                  <p className="text-[11px] text-pearl/60">Premium Quality</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-champagne/15 text-champagne">
                  <RotateCcw size={14} />
                </div>
                <div>
                  <p className="font-bold text-champagne">Garansi</p>
                  <p className="text-[11px] text-pearl/60">Tukar Produk</p>
                </div>
              </div>
            </div>
          </div>

          <a
            href="#tentang"
            aria-label="Lanjut ke bagian tentang brand"
            className="absolute bottom-4 right-4 hidden h-12 w-12 items-center justify-center rounded-full bg-pearl text-emeraldInk shadow-soft transition hover:-translate-y-1 lg:flex"
          >
            <ArrowDown size={18} />
          </a>
        </div>

        {/* Hero Right Image with Luxury Frame */}
        <div className="relative min-h-[380px] overflow-hidden bg-mist sm:min-h-[460px] lg:min-h-full">
          <img
            src="/images/hero-kheyr.jpg"
            alt="Model menggunakan hijab KHEYR bernuansa champagne"
            className="h-full w-full object-cover object-center"
            fetchpriority="high"
            decoding="async"
            style={{ transform: 'scale(1.02)' }}
          />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-emeraldInk/40 to-transparent" />
        </div>
      </div>
    </section>
  );
}
