import { ArrowDown, ArrowRight, MessageCircle } from 'lucide-react';
import { brand } from '../data/content';

const orderUrl = `https://wa.me/${brand.whatsapp}?text=${encodeURIComponent(
  'Assalamu alaikum KHEYR, saya ingin lihat katalog hijab.'
)}`;

export default function Hero({ scrollOffset = 0 }) {
  return (
    <section id="beranda" className="relative overflow-hidden pt-16 lg:pt-[72px]">
      <div className="grid min-h-[calc(100vh-4rem)] bg-emeraldInk lg:grid-cols-[1.05fr_1fr]">
        <div
          className="relative flex items-center overflow-hidden bg-satin bg-cover bg-center px-4 py-14 sm:px-6 lg:px-10 lg:py-16 xl:px-16"
          style={{ backgroundPosition: `center ${scrollOffset * -0.45}px` }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_12%,rgba(232,217,189,0.18),transparent_28%),linear-gradient(105deg,rgba(6,29,24,0.28),rgba(6,29,24,0.84))]" />
          <div
            className="relative z-10 mx-auto w-full max-w-xl animate-floatIn"
            style={{ transform: `translateY(${scrollOffset}px)` }}
          >
            <h1 className="font-display text-7xl font-semibold leading-none text-[#f1e4c9] drop-shadow-[0_8px_30px_rgba(0,0,0,0.16)] sm:text-8xl lg:text-9xl">
              {brand.name}
            </h1>
            <p className="mt-5 max-w-lg text-balance text-base font-semibold uppercase leading-7 text-pearl sm:text-lg">
              {brand.tagline}
            </p>
            <p className="mt-5 max-w-md text-base leading-8 text-pearl/90">{brand.intro}</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#koleksi"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-pearl px-6 py-3 text-sm font-bold text-emeraldInk shadow-soft transition hover:-translate-y-0.5 hover:bg-champagne"
              >
                Lihat Koleksi
                <ArrowRight size={17} />
              </a>
              <a
                href={orderUrl}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-champagne/70 px-6 py-3 text-sm font-bold text-pearl transition hover:-translate-y-0.5 hover:bg-champagne hover:text-emeraldInk"
              >
                <MessageCircle size={17} />
                Order via WhatsApp
              </a>
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

        <div className="relative min-h-[360px] overflow-hidden bg-mist sm:min-h-[440px] lg:min-h-full">
          <img
            src="/images/hero-kheyr.png"
            alt="Model menggunakan hijab KHEYR bernuansa champagne"
            className="h-full w-full object-cover object-center"
            style={{ transform: `scale(1.03) translateY(${scrollOffset * -0.55}px)` }}
          />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-emeraldInk/20 to-transparent" />
        </div>
      </div>
    </section>
  );
}
