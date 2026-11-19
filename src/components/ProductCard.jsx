import { Check, Eye, ShoppingBag } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { safeUrl, useStore } from '../context/StoreContext';

export default function ProductCard({
  product,
  index,
  onQuickView,
  colorMap,
  aspectClass = 'aspect-[4/5]',
  showCatalogCategory = false
}) {
  const { getVariantStock, addToCart } = useStore();
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || 'Emerald');
  const [justAdded, setJustAdded] = useState(false);
  const addedTimerRef = useRef(null);
  const stock = getVariantStock(product.id, selectedColor);
  const isOutOfStock = stock <= 0;

  useEffect(() => {
    return () => {
      if (addedTimerRef.current) clearTimeout(addedTimerRef.current);
    };
  }, []);

  const handleAddToCart = () => {
    const res = addToCart(product, selectedColor, 1);
    if (res.ok) {
      setJustAdded(true);
      if (addedTimerRef.current) clearTimeout(addedTimerRef.current);
      addedTimerRef.current = setTimeout(() => setJustAdded(false), 1400);
    }
  };

  return (
    <article
      className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-goldMuted/20 bg-white shadow-[0_12px_36px_rgba(34,25,15,0.05)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-soft animate-floatIn"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div>
        <button
          type="button"
          onClick={() => onQuickView(product)}
          aria-label={`Lihat detail ${product.name}`}
          className={`relative ${aspectClass} w-full cursor-pointer overflow-hidden bg-mist text-left focus:outline-none focus:ring-2 focus:ring-champagne`}
        >
          <img
            src={safeUrl(product.image, '/images/product-daily-voile.jpg')}
            alt={`${product.name} - ${product.category}`}
            className={`h-full w-full object-cover object-center transition duration-700 group-hover:scale-105 ${
              isOutOfStock ? 'grayscale opacity-70' : ''
            }`}
            loading="lazy"
            decoding="async"
          />
          <span className="absolute left-3 top-3 rounded-full bg-roseClay px-3 py-1 text-xs font-bold text-white shadow-sm">
            {isOutOfStock ? 'Stok Habis' : product.label}
          </span>
          <div className="absolute inset-0 flex items-center justify-center bg-emeraldInk/40 opacity-0 backdrop-blur-[2px] transition duration-300 group-hover:opacity-100">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-pearlWarm/95 px-4 py-2 text-xs font-bold text-emeraldInk shadow-lg transition-transform duration-300 group-hover:scale-105">
              <Eye size={15} />
              Quick View
            </span>
          </div>
        </button>

        <div className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-goldMuted">
              {showCatalogCategory ? product.catalogCategory || product.category : product.category}
            </p>
            <span className="text-xs font-semibold text-ink/50">{product.size}</span>
          </div>
          <button
            type="button"
            onClick={() => onQuickView(product)}
            className="mt-1.5 text-left font-display text-lg font-bold text-ink transition hover:text-goldMuted focus:outline-none"
          >
            {product.name}
          </button>
          <p className="mt-1 text-base font-bold text-emeraldSoft">{product.price}</p>
          <p className="mt-2 text-xs leading-relaxed text-ink/65 line-clamp-2">{product.description}</p>

          <div className="mt-4 flex items-center justify-between border-t border-goldMuted/15 pt-3">
            <div className="text-xs font-semibold text-ink/70">
              <span>{selectedColor}</span>
              <span className={`ml-1.5 text-[11px] font-bold ${isOutOfStock ? 'text-roseClay' : stock <= 5 ? 'text-amber-600' : 'text-emeraldSoft'}`}>
                ({isOutOfStock ? 'Habis' : `Stok ${stock}`})
              </span>
            </div>
            <div className="flex items-center gap-1.5" aria-label={`Pilihan warna ${product.name}`}>
              {product.colors?.map((color) => {
                const isSelected = selectedColor === color;
                const colorStock = getVariantStock(product.id, color);
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedColor(color);
                    }}
                    className={`h-5 w-5 rounded-full border transition ${
                      isSelected
                        ? 'border-goldMuted ring-2 ring-champagne scale-110'
                        : 'border-ink/15 hover:scale-105'
                    } ${colorStock <= 0 ? 'opacity-40' : ''}`}
                    style={{ backgroundColor: colorMap[color] || '#ded3c2' }}
                    title={`${color} (${colorStock <= 0 ? 'Habis' : `Stok ${colorStock}`})`}
                    aria-label={`Pilih warna ${color}`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 p-5 pt-0">
        <button
          type="button"
          disabled={isOutOfStock}
          onClick={handleAddToCart}
          className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs sm:text-sm font-bold shadow-sm transition disabled:opacity-45 disabled:cursor-not-allowed ${
            justAdded
              ? 'bg-champagne text-emeraldInk'
              : 'bg-emeraldSoft text-pearl hover:bg-emeraldDeep'
          }`}
        >
          {justAdded ? <Check size={15} className="stroke-[3]" /> : <ShoppingBag size={15} />}
          {isOutOfStock
            ? `Habis (${selectedColor})`
            : justAdded
              ? 'Masuk Keranjang!'
              : `+ Keranjang (${selectedColor})`}
        </button>

        <button
          type="button"
          onClick={() => onQuickView(product)}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-goldMuted/35 bg-pearlWarm/50 py-2 text-xs font-semibold text-ink/80 transition hover:border-goldMuted hover:bg-white hover:text-emeraldSoft"
        >
          <Eye size={14} />
          Lihat Foto & Detail
        </button>
      </div>
    </article>
  );
}
