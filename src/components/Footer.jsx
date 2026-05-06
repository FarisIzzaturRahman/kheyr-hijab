import { Instagram, Mail, MapPin, MessageCircle, ShoppingBag } from 'lucide-react';
import { brand, navItems } from '../data/content';

const orderUrl = `https://wa.me/${brand.whatsapp}?text=${encodeURIComponent(
  'Assalamu alaikum KHEYR, saya ingin order hijab.'
)}`;

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer id="kontak" className="bg-emeraldInk px-4 py-14 text-pearl sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.3fr_0.8fr_1fr_1fr]">
        <div>
          <a href="#beranda" className="font-display text-4xl font-semibold text-champagne">
            {brand.name}
          </a>
          <p className="mt-5 max-w-sm text-sm leading-7 text-pearl/75">
            Hijab premium untuk muslimah modern yang ingin tampil anggun, nyaman, dan percaya diri
            setiap hari.
          </p>
          <div className="mt-6 flex gap-3">
            <a
              href={brand.instagram}
              aria-label="Instagram KHEYR"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-champagne/25 text-champagne transition hover:bg-champagne hover:text-emeraldInk"
            >
              <Instagram size={18} />
            </a>
            <a
              href={orderUrl}
              aria-label="WhatsApp KHEYR"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-champagne/25 text-champagne transition hover:bg-champagne hover:text-emeraldInk"
            >
              <MessageCircle size={18} />
            </a>
            <a
              href={brand.marketplace}
              aria-label="Marketplace KHEYR"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-champagne/25 text-champagne transition hover:bg-champagne hover:text-emeraldInk"
            >
              <ShoppingBag size={18} />
            </a>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-champagne">Navigasi</h2>
          <div className="mt-4 flex flex-col gap-3">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="text-sm text-pearl/70 hover:text-champagne">
                {item.label}
              </a>
            ))}
            <a href="#kontak" className="text-sm text-pearl/70 hover:text-champagne">
              Kontak
            </a>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-champagne">Hubungi Kami</h2>
          <div className="mt-4 space-y-4 text-sm text-pearl/75">
            <a href={orderUrl} className="flex items-start gap-3 hover:text-champagne">
              <MessageCircle className="mt-0.5 shrink-0" size={17} />
              <span>
                {brand.whatsappLabel}
                <br />
                Chat via WhatsApp
              </span>
            </a>
            <a href={brand.instagram} className="flex items-start gap-3 hover:text-champagne">
              <Instagram className="mt-0.5 shrink-0" size={17} />
              <span>
                {brand.instagramHandle}
                <br />
                Follow Instagram
              </span>
            </a>
            <a href={`mailto:${brand.email}`} className="flex items-start gap-3 hover:text-champagne">
              <Mail className="mt-0.5 shrink-0" size={17} />
              <span>
                {brand.email}
                <br />
                Email
              </span>
            </a>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-champagne">Informasi</h2>
          <div className="mt-4 space-y-4 text-sm leading-7 text-pearl/75">
            <p>
              Senin - Sabtu
              <br />
              09.00 - 18.00 WIB
            </p>
            <p className="flex gap-3">
              <MapPin className="mt-1 shrink-0 text-champagne" size={17} />
              <span>{brand.address}</span>
            </p>
            <p>Pengiriman ke seluruh Indonesia melalui jasa ekspedisi pilihan.</p>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-7xl flex-col gap-3 border-t border-champagne/15 pt-6 text-xs text-pearl/60 sm:flex-row sm:items-center sm:justify-between">
        <p>© {year} KHEYR. All rights reserved.</p>
        <p>Made with care for Muslimah.</p>
      </div>
    </footer>
  );
}
