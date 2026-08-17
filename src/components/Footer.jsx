import { CreditCard, Grid, Instagram, Mail, MapPin, MessageCircle, Package, ShoppingBag, Truck } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { navItems } from '../data/content';

export default function Footer({ onNavigateToCatalog }) {
  const { brand, waLinks, products } = useStore();
  const year = new Date().getFullYear();

  return (
    <footer id="kontak" className="border-t border-champagne/15 bg-emeraldInk px-4 py-16 text-pearl sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.3fr_0.8fr_1fr_1.1fr]">
        {/* Brand Column */}
        <div>
          <a href="#beranda" className="font-display text-4xl font-semibold text-champagne">
            {brand.name}
          </a>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-pearl/75">
            {brand.intro || 'Hijab premium untuk muslimah modern yang ingin tampil anggun, nyaman, dan percaya diri dalam setiap momen kehidupan.'}
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
              href={waLinks.order}
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

        {/* Navigation Column */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-champagne">Navigasi</h2>
          <div className="mt-4 flex flex-col gap-3">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="text-sm text-pearl/70 transition hover:text-champagne">
                {item.label}
              </a>
            ))}
            <button
              type="button"
              onClick={onNavigateToCatalog}
              className="inline-flex items-center gap-1.5 text-left text-sm font-bold text-champagne transition hover:underline"
            >
              <Grid size={14} />
              E-Katalog Lengkap ({products.length} Koleksi)
            </button>
            <a href="#kontak" className="text-sm text-pearl/70 transition hover:text-champagne">
              Kontak & Pemesanan
            </a>
          </div>
        </div>

        {/* Contact Column */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-champagne">Hubungi Kami</h2>
          <div className="mt-4 space-y-4 text-sm text-pearl/75">
            <a href={waLinks.order} className="flex items-start gap-3 transition hover:text-champagne">
              <MessageCircle className="mt-0.5 shrink-0 text-champagne" size={17} />
              <span>
                {brand.whatsappLabel || brand.whatsapp}
                <br />
                <span className="text-xs text-pearl/60">Chat via WhatsApp</span>
              </span>
            </a>
            <a href={brand.instagram} className="flex items-start gap-3 transition hover:text-champagne">
              <Instagram className="mt-0.5 shrink-0 text-champagne" size={17} />
              <span>
                {brand.instagramHandle}
                <br />
                <span className="text-xs text-pearl/60">Follow Instagram Resmi</span>
              </span>
            </a>
            <a href={`mailto:${brand.email}`} className="flex items-start gap-3 transition hover:text-champagne">
              <Mail className="mt-0.5 shrink-0 text-champagne" size={17} />
              <span>
                {brand.email}
                <br />
                <span className="text-xs text-pearl/60">Email Customer Care</span>
              </span>
            </a>
          </div>
        </div>

        {/* Operational & Payment Trust Column */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-champagne">Layanan & Keamanan</h2>
          <div className="mt-4 space-y-3.5 text-sm text-pearl/75">
            <p className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 shrink-0 text-champagne" size={17} />
              <span>{brand.address} • Pengiriman ke Seluruh Indonesia</span>
            </p>
            <div className="pt-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-champagne/90 mb-2">
                <Truck size={14} />
                <span>Mitra Ekspedisi Resmi:</span>
              </div>
              <div className="flex flex-wrap gap-1.5 text-[11px] font-bold text-pearl/80">
                <span className="rounded-md bg-pearl/10 px-2.5 py-1">JNE</span>
                <span className="rounded-md bg-pearl/10 px-2.5 py-1">SiCepat</span>
                <span className="rounded-md bg-pearl/10 px-2.5 py-1">J&T Express</span>
                <span className="rounded-md bg-pearl/10 px-2.5 py-1">Shopee Xpress</span>
              </div>
            </div>
            <div className="pt-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-champagne/90 mb-2">
                <CreditCard size={14} />
                <span>Metode Pembayaran Aman:</span>
              </div>
              <div className="flex flex-wrap gap-1.5 text-[11px] font-bold text-pearl/80">
                <span className="rounded-md bg-pearl/10 px-2.5 py-1">BCA</span>
                <span className="rounded-md bg-pearl/10 px-2.5 py-1">Mandiri</span>
                <span className="rounded-md bg-pearl/10 px-2.5 py-1">BRI / BNI</span>
                <span className="rounded-md bg-pearl/10 px-2.5 py-1">QRIS / E-Wallet</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mx-auto mt-14 flex max-w-7xl flex-col gap-3 border-t border-champagne/15 pt-6 text-xs text-pearl/60 sm:flex-row sm:items-center sm:justify-between">
        <p>© {year} {brand.name} Hijab. All rights reserved.</p>
        <p className="flex items-center gap-1.5">
          <Package size={13} className="text-champagne" />
          <span>Made with care for Indonesian Muslimah.</span>
        </p>
      </div>
    </footer>
  );
}
