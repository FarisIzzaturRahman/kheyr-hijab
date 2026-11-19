import {
  ArrowLeft,
  MessageCircle,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  X
} from 'lucide-react';
import { useMemo, useState } from 'react';
import ProductCard from './ProductCard';
import ProductModal from './ProductModal';
import { useStore } from '../context/StoreContext';
import { catalogCategories } from '../data/content';

export default function CatalogPage({ onBackToHome }) {
  const { brand, products, waLinks, colorMap } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua Koleksi');
  const [sortBy, setSortBy] = useState('featured');
  const [activeModalProduct, setActiveModalProduct] = useState(null);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category Filter
    if (selectedCategory !== 'Semua Koleksi') {
      result = result.filter(
        (p) =>
          p.catalogCategory?.toLowerCase() === selectedCategory.toLowerCase() ||
          p.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.catalogCategory?.toLowerCase().includes(query) ||
          p.material?.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.colors?.some((c) => c.toLowerCase().includes(query))
      );
    }

    // Sorting
    if (sortBy === 'price-low') {
      result.sort((a, b) => (a.numericPrice || 0) - (b.numericPrice || 0));
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => (b.numericPrice || 0) - (a.numericPrice || 0));
    } else if (sortBy === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [products, searchQuery, selectedCategory, sortBy]);

  const handleResetFilter = () => {
    setSearchQuery('');
    setSelectedCategory('Semua Koleksi');
    setSortBy('featured');
  };

  return (
    <main className="min-h-screen bg-pearl pb-24">
      {/* Top Breadcrumb & Back Bar */}
      <div className="border-b border-goldMuted/20 bg-pearlWarm/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 rounded-full border border-goldMuted/30 bg-white px-4 py-2 text-xs sm:text-sm font-bold text-ink transition hover:bg-emeraldSoft hover:text-pearl shadow-sm"
          >
            <ArrowLeft size={16} />
            Kembali ke Beranda
          </button>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-champagne/40 px-3 py-1 text-xs font-semibold text-emeraldInk border border-goldMuted/30">
              <Sparkles size={13} className="text-goldMuted" />
              E-Katalog Resmi KHEYR
            </span>
            <a
              href={waLinks.stylist}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-emeraldSoft px-3.5 py-1.5 text-xs font-bold text-pearl shadow-sm transition hover:bg-emeraldDeep"
            >
              <MessageCircle size={14} />
              Chat CS
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Page Hero Header */}
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-goldMuted">
            E-Katalog Lengkap 2026
          </p>
          <h1 className="mt-2 font-display text-4xl sm:text-5xl font-bold text-ink leading-tight">
            Seluruh Koleksi {brand.name}
          </h1>
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-ink/75">
            Eksplorasi seluruh koleksi hijab segi empat, pashmina plisket, bergo instan, organza silk, hingga inner berbahan organik. Temukan warna dan gaya yang paling menyempurnakan hari-harimu.
          </p>
        </div>

        {/* Controls: Search, Categories, Sort */}
        <div className="mt-10 rounded-2xl border border-goldMuted/25 bg-white/90 p-5 sm:p-6 shadow-[0_14px_40px_rgba(34,25,15,0.05)] backdrop-blur-md">
          {/* Search Bar & Sorting */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-goldMuted"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari hijab, nama bahan (voile, silk, plisket), atau warna..."
                className="w-full rounded-full border border-goldMuted/30 bg-pearlWarm/40 py-3 pl-11 pr-10 text-sm font-medium text-ink placeholder:text-ink/40 focus:border-emeraldSoft focus:bg-white focus:outline-none focus:ring-2 focus:ring-champagne transition"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Hapus pencarian"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink/40 hover:text-ink transition"
                >
                  <X size={16} />
                </button>
              ) : null}
            </div>

            {/* Sorting Dropdown */}
            <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
              <SlidersHorizontal size={16} className="text-goldMuted" />
              <span className="text-xs font-bold text-ink/70">Urutkan:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-full border border-goldMuted/30 bg-pearlWarm/50 px-4 py-2.5 text-xs sm:text-sm font-bold text-ink focus:border-emeraldSoft focus:bg-white focus:outline-none focus:ring-2 focus:ring-champagne transition cursor-pointer"
              >
                <option value="featured">Paling Populer</option>
                <option value="price-low">Harga: Termurah</option>
                <option value="price-high">Harga: Tertinggi</option>
                <option value="name-asc">Nama: A - Z</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-goldMuted/15 pt-4">
            <span className="text-xs font-bold text-ink/60 mr-1 hidden sm:inline">Kategori:</span>
            {catalogCategories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-emeraldSoft text-pearl shadow-md ring-2 ring-champagne scale-105'
                      : 'border border-goldMuted/25 bg-pearlWarm/40 text-ink/70 hover:border-goldMuted hover:bg-pearlWarm'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Counter & Active Filters Tag */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 px-1">
          <p className="text-xs sm:text-sm font-semibold text-ink/65">
            Menampilkan <span className="font-bold text-ink">{filteredProducts.length}</span> dari {products.length} koleksi hijab
          </p>

          {(searchQuery || selectedCategory !== 'Semua Koleksi' || sortBy !== 'featured') && (
            <button
              type="button"
              onClick={handleResetFilter}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-roseClay hover:text-emeraldSoft transition"
            >
              <RotateCcw size={13} />
              Reset Semua Filter
            </button>
          )}
        </div>

        {/* Product Cards Grid */}
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product, index) => (
            <ProductCard
              key={product.id || product.name}
              product={product}
              index={index}
              onQuickView={setActiveModalProduct}
              colorMap={colorMap}
              waLinks={waLinks}
              aspectClass="aspect-[3/4]"
              showCatalogCategory
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="my-16 rounded-3xl border border-goldMuted/20 bg-white/70 p-12 text-center shadow-soft max-w-lg mx-auto">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-champagne/30 text-goldMuted">
              <Search size={28} />
            </div>
            <h3 className="mt-4 font-display text-xl font-bold text-ink">
              Produk Tidak Ditemukan
            </h3>
            <p className="mt-2 text-sm text-ink/60">
              Tidak ada koleksi hijab yang cocok dengan kata kunci &ldquo;{searchQuery}&rdquo;. Coba gunakan kata kunci lain seperti *voile, silk, pashmina*, atau warna *sage*.
            </p>
            <button
              type="button"
              onClick={handleResetFilter}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-emeraldSoft px-6 py-2.5 text-xs font-bold text-pearl shadow-md transition hover:bg-emeraldDeep"
            >
              <RotateCcw size={14} />
              Lihat Semua Koleksi
            </button>
          </div>
        )}
      </div>

      {/* Quick View Modal */}
      {activeModalProduct ? (
        <ProductModal
          key={activeModalProduct.id || activeModalProduct.name}
          product={activeModalProduct}
          onClose={() => setActiveModalProduct(null)}
        />
      ) : null}
    </main>
  );
}
