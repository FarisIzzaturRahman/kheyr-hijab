import { ArrowRight, MessageCircle } from 'lucide-react';
import SectionHeading from './SectionHeading';
import { brand, products } from '../data/content';

const colorMap = {
  Emerald: '#073d32',
  Sage: '#8f9f86',
  Ivory: '#f5efe2',
  Blush: '#e6beb9',
  Latte: '#b99d85',
  Pearl: '#e8d9bd',
  Taupe: '#a88e7f',
  Mocca: '#75594c',
  Stone: '#c6b9a9',
  Navy: '#151d36',
  'Dusty Pink': '#d7a3a1',
  Cream: '#f2e7d7',
  Champagne: '#d9c3a5',
  Almond: '#bda891',
  Olive: '#777d62',
  Sand: '#d5c2a7'
};

function getProductUrl(productName) {
  return `https://wa.me/${brand.whatsapp}?text=${encodeURIComponent(
    `Assalamu alaikum KHEYR, saya ingin tanya produk ${productName}.`
  )}`;
}

function ProductCard({ product, index }) {
  return (
    <article
      className="group overflow-hidden rounded-lg border border-goldMuted/20 bg-white shadow-[0_18px_48px_rgba(34,25,15,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-soft"
      data-reveal
      style={{ '--reveal-delay': `${index * 65}ms` }}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-mist">
        <img
          src={product.image}
          alt={`${product.name} - ${product.category}`}
          className="h-full w-full object-cover object-center transition duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <span className="absolute left-0 top-0 bg-roseClay px-4 py-2 text-xs font-bold text-white">
          {product.label}
        </span>
      </div>

      <div className="p-5">
        <p className="text-xs font-semibold uppercase text-goldMuted">{product.category}</p>
        <h3 className="mt-2 text-base font-bold text-ink">{product.name}</h3>
        <p className="mt-2 text-sm font-semibold text-emeraldSoft">{product.price}</p>
        <p className="mt-3 min-h-[4.5rem] text-sm leading-6 text-ink/60">{product.description}</p>

        <div className="mt-4 flex items-center gap-2" aria-label={`Pilihan warna ${product.name}`}>
          {product.colors.map((color) => (
            <span
              key={color}
              className="h-5 w-5 rounded-full border border-ink/10"
              style={{ backgroundColor: colorMap[color] || '#ded3c2' }}
              title={color}
            />
          ))}
        </div>

        <a
          href={getProductUrl(product.name)}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-goldMuted/40 px-4 py-3 text-sm font-bold text-emeraldSoft transition hover:border-emeraldSoft hover:bg-emeraldSoft hover:text-pearl"
        >
          <MessageCircle size={16} />
          Tanya Produk
        </a>
      </div>
    </article>
  );
}

export default function Collections() {
  return (
    <section id="koleksi" className="bg-pearl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Koleksi Pilihan"
          title="Temukan Hijab Favoritmu"
          action={
            <a
              href={brand.instagram}
              className="inline-flex items-center gap-2 border-b border-goldMuted pb-1 text-sm font-bold text-goldMuted transition hover:text-emeraldSoft"
            >
              Lihat semua koleksi
              <ArrowRight size={16} />
            </a>
          }
        >
          Pilih koleksi yang paling sesuai untuk aktivitas harian, momen formal, atau hadiah
          spesial dengan warna-warna yang mudah dipadukan.
        </SectionHeading>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {products.map((product, index) => (
            <ProductCard key={product.name} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
