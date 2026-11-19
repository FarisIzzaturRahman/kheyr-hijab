import { ArrowRight, Grid } from 'lucide-react';
import { useMemo, useState } from 'react';
import ProductCard from './ProductCard';
import ProductModal from './ProductModal';
import SectionHeading from './SectionHeading';
import { useStore } from '../context/StoreContext';
import { productCategories } from '../data/content';

export default function Collections({ onNavigateToCatalog }) {
  const { products, waLinks, colorMap } = useStore();
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [activeModalProduct, setActiveModalProduct] = useState(null);

  // Showcase first 6 products on home
  const showcaseProducts = useMemo(() => products.slice(0, 6), [products]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'Semua') return showcaseProducts;
    return showcaseProducts.filter(
      (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [selectedCategory, showcaseProducts]);

  return (
    <section id="koleksi" className="bg-pearl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Koleksi Pilihan"
          title="Temukan Hijab Favoritmu"
          action={
            <button
              type="button"
              onClick={onNavigateToCatalog}
              className="inline-flex items-center gap-2 border-b border-goldMuted pb-1 text-sm font-bold text-goldMuted transition hover:text-emeraldSoft"
            >
              Buka Semua Koleksi ({products.length} Produk)
              <ArrowRight size={16} />
            </button>
          }
        >
          Pilih koleksi yang paling sesuai untuk aktivitas harian, momen formal, atau hadiah
          spesial dengan warna-warna yang anggun dan material berkualitas.
        </SectionHeading>

        {/* Category Filter Pills */}
        <div className="mb-10 flex flex-wrap gap-2 sm:gap-3">
          {productCategories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-5 py-2 text-xs sm:text-sm font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-emeraldSoft text-pearl shadow-md ring-2 ring-champagne/50 scale-105'
                    : 'border border-goldMuted/30 bg-white/80 text-ink/70 hover:border-goldMuted hover:bg-pearlWarm'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Products Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product, index) => (
            <ProductCard
              key={product.id || product.name}
              product={product}
              index={index}
              onQuickView={setActiveModalProduct}
              colorMap={colorMap}
              waLinks={waLinks}
            />
          ))}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-ink/60">
            <p>Tidak ada produk pada kategori ini.</p>
          </div>
        ) : null}

        {/* Full Catalog Banner Callout */}
        <div className="mt-14 overflow-hidden rounded-3xl border border-champagne/40 bg-gradient-to-br from-emeraldDeep via-emeraldSoft to-emeraldDeep p-8 sm:p-10 text-pearl shadow-emerald">
          <div className="flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-champagne/20 px-3.5 py-1 text-xs font-bold text-champagne border border-champagne/30">
                <Grid size={13} />
                E-Katalog Interaktif
              </span>
              <h3 className="mt-3 font-display text-2xl sm:text-3xl font-bold text-champagne">
                Ingin Melihat {products.length}+ Koleksi Lengkap?
              </h3>
              <p className="mt-1.5 max-w-xl text-xs sm:text-sm text-pearl/85 leading-relaxed">
                Jelajahi seluruh varian Paris Ultrafine, Pleated Pashmina, Bergo Maryam, Organza Silk, Printed Voile, hingga Inner Ninja di halaman E-Katalog kami.
              </p>
            </div>
            <button
              type="button"
              onClick={onNavigateToCatalog}
              className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-champagne px-8 py-3.5 text-xs sm:text-sm font-bold text-emeraldInk shadow-md transition hover:-translate-y-0.5 hover:bg-pearl hover:shadow-lg w-full sm:w-auto"
            >
              Buka E-Katalog Lengkap ({products.length} Koleksi)
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {activeModalProduct ? (
        <ProductModal
          key={activeModalProduct.id || activeModalProduct.name}
          product={activeModalProduct}
          onClose={() => setActiveModalProduct(null)}
        />
      ) : null}
    </section>
  );
}
