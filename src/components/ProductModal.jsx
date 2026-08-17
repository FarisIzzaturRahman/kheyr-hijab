import { Check, Info, Maximize2, MessageCircle, ShieldCheck, Sparkles, Tag, Ticket, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '../context/StoreContext';

export default function ProductModal({ product, onClose }) {
  const { colorMap, waLinks, promoCodes, calculatePromoDiscount } = useStore();
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || '');
  const [isZoomed, setIsZoomed] = useState(false);
  const [selectedPromoCode, setSelectedPromoCode] = useState(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (product) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [product]);

  // Keyboard Escape listener
  useEffect(() => {
    if (!product) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isZoomed) {
          setIsZoomed(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product, onClose, isZoomed]);

  // Find eligible promo codes for this product
  const eligiblePromos = useMemo(() => {
    if (!product || !promoCodes) return [];
    return promoCodes
      .filter((promo) => promo.isActive)
      .map((promo) => ({
        promo,
        result: calculatePromoDiscount(promo, product)
      }))
      .filter(({ result }) => result.valid);
  }, [product, promoCodes, calculatePromoDiscount]);

  // Declarative computation of active applied promo (defaults to best available promo)
  const appliedPromo = useMemo(() => {
    if (selectedPromoCode === 'none') return null;
    if (selectedPromoCode) {
      const found = eligiblePromos.find((p) => p.promo.code === selectedPromoCode);
      return found ? found.result : null;
    }
    if (eligiblePromos.length > 0) {
      const best = eligiblePromos.reduce((prev, curr) =>
        curr.result.discountAmount > prev.result.discountAmount ? curr : prev
      );
      return best.result;
    }
    return null;
  }, [selectedPromoCode, eligiblePromos]);

  if (!product || typeof document === 'undefined') return null;

  const orderUrl = waLinks.forProduct(product.name, selectedColor, appliedPromo);

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto p-3 sm:p-4 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-product-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Backdrop with rich blur */}
      <div
        className="fixed inset-0 bg-emeraldInk/85 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        className="relative z-10 my-auto flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-champagne/50 bg-pearlWarm shadow-[0_25px_80px_rgba(0,0,0,0.5)] transition-all md:max-h-[90vh] animate-floatIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup modal detail produk"
          className="absolute right-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-pearlWarm/90 text-ink shadow-lg backdrop-blur-md transition hover:bg-emeraldSoft hover:text-pearl focus:outline-none focus:ring-2 focus:ring-champagne"
        >
          <X size={22} />
        </button>

        {/* Modal Content Grid */}
        <div className="grid overflow-y-auto md:grid-cols-2 md:overflow-visible">
          {/* Left: Expanded Model Image Frame */}
          <div className="group relative aspect-[4/3] sm:aspect-square md:aspect-auto md:h-full md:min-h-[520px] overflow-hidden bg-mist">
            <img
              src={product.image}
              alt={`${product.name} - ${product.category}`}
              className={`h-full w-full object-cover object-center transition-transform duration-500 ${
                isZoomed ? 'scale-125 cursor-zoom-out' : 'cursor-zoom-in'
              }`}
              onClick={() => setIsZoomed(!isZoomed)}
            />
            <span className="absolute left-4 top-4 rounded-full bg-roseClay px-3.5 py-1 text-xs font-bold text-white shadow-md">
              {product.label}
            </span>

            <button
              type="button"
              onClick={() => setIsZoomed(!isZoomed)}
              className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-emeraldInk/80 px-3 py-1.5 text-xs font-semibold text-pearl shadow-md backdrop-blur-sm transition hover:bg-emeraldInk"
              aria-label={isZoomed ? 'Perkecil foto' : 'Perbesar foto model'}
            >
              <Maximize2 size={13} />
              <span>{isZoomed ? 'Reset Zoom' : 'Perbesar Foto'}</span>
            </button>
          </div>

          {/* Right: Product Info, Specs, & Order Button */}
          <div className="flex flex-col justify-between overflow-y-auto p-6 sm:p-8">
            <div>
              <div className="flex items-center justify-between pr-10">
                <p className="text-xs font-bold uppercase tracking-wider text-goldMuted">
                  {product.category}
                </p>
                <span className="text-xs font-semibold text-ink/60">{product.size}</span>
              </div>

              <h2 id="modal-product-title" className="mt-2 font-display text-3xl font-bold text-ink leading-tight">
                {product.name}
              </h2>

              {/* Price with Promo Discount Calculation */}
              <div className="mt-2.5 flex items-baseline gap-3">
                {appliedPromo ? (
                  <>
                    <span className="text-2xl font-bold text-emeraldSoft">
                      Rp {appliedPromo.finalPrice.toLocaleString('id-ID')}
                    </span>
                    <span className="text-sm font-semibold text-ink/40 line-through">
                      {product.price}
                    </span>
                    <span className="rounded-full bg-roseClay/15 px-2.5 py-0.5 text-xs font-bold text-roseClay border border-roseClay/30">
                      Hemat Rp {appliedPromo.discountAmount.toLocaleString('id-ID')}
                    </span>
                  </>
                ) : (
                  <p className="text-2xl font-bold text-emeraldSoft">{product.price}</p>
                )}
              </div>

              <p className="mt-3 text-xs sm:text-sm leading-relaxed text-ink/75">{product.description}</p>

              {/* Promo Vouchers Selector */}
              {eligiblePromos.length > 0 && (
                <div className="mt-4 rounded-2xl border border-goldMuted/25 bg-champagne/15 p-3.5">
                  <div className="flex items-center justify-between text-xs font-bold text-emeraldInk">
                    <span className="flex items-center gap-1.5">
                      <Ticket size={15} className="text-goldMuted" />
                      Voucher & Promo Tersedia:
                    </span>
                    {appliedPromo && (
                      <button
                        type="button"
                        onClick={() => setSelectedPromoCode('none')}
                        className="text-[11px] text-roseClay hover:underline"
                      >
                        Hapus Kupon
                      </button>
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {eligiblePromos.map(({ promo, result }) => {
                      const isSelected = appliedPromo?.code === promo.code;
                      return (
                        <button
                          key={promo.id}
                          type="button"
                          onClick={() => setSelectedPromoCode(isSelected ? 'none' : promo.code)}
                          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition border ${
                            isSelected
                              ? 'bg-emeraldSoft text-pearl border-emeraldSoft shadow-sm ring-1 ring-champagne'
                              : 'bg-white text-ink/80 border-goldMuted/30 hover:bg-pearlWarm'
                          }`}
                        >
                          <Tag size={12} />
                          <span>{promo.code}</span>
                          <span className="opacity-75">(-Rp {result.discountAmount.toLocaleString('id-ID')})</span>
                          {isSelected && <Check size={13} className="stroke-[3]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Color Swatch Selector */}
              <div className="mt-5 border-t border-goldMuted/15 pt-3.5">
                <div className="flex items-center justify-between text-xs font-semibold text-ink">
                  <span>Pilihan Varian Warna:</span>
                  <span className="font-bold text-goldMuted">{selectedColor}</span>
                </div>
                <div className="mt-2.5 flex items-center gap-2.5">
                  {product.colors?.map((color) => {
                    const isSelected = selectedColor === color;
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        aria-label={`Pilih warna ${color}`}
                        className={`relative flex h-8 w-8 items-center justify-center rounded-full border-2 transition ${
                          isSelected
                            ? 'border-goldMuted ring-2 ring-champagne scale-110 shadow-md'
                            : 'border-ink/20 hover:scale-105'
                        }`}
                        style={{ backgroundColor: colorMap[color] || '#ded3c2' }}
                        title={color}
                      >
                        {isSelected ? (
                          <Check size={15} className="text-white drop-shadow stroke-[3]" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Specifications Card */}
              <div className="mt-5 space-y-2 rounded-2xl border border-goldMuted/20 bg-white/80 p-3.5 text-xs">
                {product.material ? (
                  <div className="flex justify-between">
                    <span className="font-semibold text-ink/60">Material:</span>
                    <span className="font-bold text-ink text-right">{product.material}</span>
                  </div>
                ) : null}
                {product.size ? (
                  <div className="flex justify-between">
                    <span className="font-semibold text-ink/60">Ukuran:</span>
                    <span className="font-bold text-ink text-right">{product.size}</span>
                  </div>
                ) : null}
                {product.finishing ? (
                  <div className="flex justify-between">
                    <span className="font-semibold text-ink/60">Finishing:</span>
                    <span className="font-bold text-ink text-right">{product.finishing}</span>
                  </div>
                ) : null}
                {product.careTips ? (
                  <div className="flex items-start gap-1.5 pt-1.5 border-t border-goldMuted/15 text-ink/70">
                    <Info size={13} className="shrink-0 mt-0.5 text-goldMuted" />
                    <span>{product.careTips}</span>
                  </div>
                ) : null}
              </div>

              {/* Trust Badges */}
              <div className="mt-4 flex items-center justify-between text-[11px] text-ink/75 px-1">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emeraldSoft" />
                  <span>Garansi Retur 100%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Sparkles size={14} className="text-goldMuted" />
                  <span>Original KHEYR Quality</span>
                </div>
              </div>
            </div>

            {/* Direct Order CTA */}
            <div className="mt-6 pt-2">
              <a
                href={orderUrl}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-emeraldSoft px-6 py-3.5 text-xs sm:text-sm font-bold text-pearl shadow-emerald transition hover:bg-emeraldDeep hover:shadow-xl hover:scale-[1.01]"
              >
                <MessageCircle size={17} />
                Pesan via WhatsApp {appliedPromo ? `(Kupon: ${appliedPromo.code})` : `(${selectedColor})`}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
