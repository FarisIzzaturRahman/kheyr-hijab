import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  Tag,
  Trash2,
  X
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { safeUrl, useStore } from '../context/StoreContext';

const BUYER_PROFILE_KEY = 'kheyr_buyer_profile_v1';

function loadBuyerProfile() {
  try {
    const raw = localStorage.getItem(BUYER_PROFILE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return { customerName: '', customerPhone: '', shippingAddress: '' };
}

export default function CartDrawer() {
  const {
    cart,
    cartCount,
    isCartOpen,
    setIsCartOpen,
    cartToast,
    dismissCartToast,
    products,
    promoCodes,
    getVariantStock,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    calculateCartPromo,
    placeGuestOrder,
    waLinks
  } = useStore();

  const [step, setStep] = useState('cart'); // 'cart' | 'checkout' | 'success'
  const [initialProfile] = useState(loadBuyerProfile);
  const [customerName, setCustomerName] = useState(initialProfile.customerName || '');
  const [customerPhone, setCustomerPhone] = useState(initialProfile.customerPhone || '');
  const [shippingAddress, setShippingAddress] = useState(initialProfile.shippingAddress || '');
  const [hasSavedProfile, setHasSavedProfile] = useState(
    Boolean(initialProfile.customerName || initialProfile.customerPhone || initialProfile.shippingAddress)
  );
  const [notes, setNotes] = useState('');
  const [promoInput, setPromoInput] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (!isCartOpen) return undefined;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setIsCartOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isCartOpen, setIsCartOpen]);

  const enrichedItems = useMemo(() => {
    return cart
      .map((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) return null;
        const unitPrice = product.numericPrice || parseInt(String(product.price || '').replace(/\D/g, ''), 10) || 0;
        const maxStock = getVariantStock(product.id, item.color);
        return {
          ...item,
          product,
          unitPrice,
          lineTotal: unitPrice * item.quantity,
          maxStock,
          exceedsStock: item.quantity > maxStock
        };
      })
      .filter(Boolean);
  }, [cart, products, getVariantStock]);

  const hasStockConflict = useMemo(
    () => enrichedItems.some((item) => item.exceedsStock),
    [enrichedItems]
  );

  const subtotal = useMemo(
    () => enrichedItems.reduce((sum, item) => sum + item.lineTotal, 0),
    [enrichedItems]
  );

  // Target promo for the AOV progress bar (active 'all'-product promo with lowest positive minPurchase)
  const targetMilestonePromo = useMemo(() => {
    const candidates = promoCodes
      .filter((p) => p.isActive && p.applicableTo === 'all' && p.minPurchase > 0)
      .sort((a, b) => a.minPurchase - b.minPurchase);
    return candidates[0] || null;
  }, [promoCodes]);

  // Quick upsell item (prefer inner-ninja or cheapest in-stock product not yet in cart)
  const upsellProduct = useMemo(() => {
    if (!targetMilestonePromo || subtotal <= 0 || subtotal >= targetMilestonePromo.minPurchase) return null;
    const inCartIds = new Set(enrichedItems.map((i) => i.productId));
    const candidates = products
      .filter((p) => !inCartIds.has(p.id))
      .map((p) => {
        const availableColor = (p.colors || []).find((c) => getVariantStock(p.id, c) > 0);
        return availableColor ? { product: p, color: availableColor } : null;
      })
      .filter(Boolean)
      .sort((a, b) => (a.product.numericPrice || 0) - (b.product.numericPrice || 0));

    return candidates[0] || null;
  }, [targetMilestonePromo, subtotal, enrichedItems, products, getVariantStock]);

  const promoPreview = useMemo(() => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return null;
    const found = promoCodes.find((p) => p.code.toUpperCase() === code && p.isActive);
    if (!found) {
      return { valid: false, discountAmount: 0, message: `Kode promo "${code}" tidak ditemukan atau tidak aktif.` };
    }
    return calculateCartPromo(found, enrichedItems);
  }, [promoInput, promoCodes, calculateCartPromo, enrichedItems]);

  const estimatedTotal = useMemo(() => {
    const disc = promoPreview?.valid ? promoPreview.discountAmount : 0;
    return Math.max(0, subtotal - disc);
  }, [subtotal, promoPreview]);

  if (typeof document === 'undefined') return null;

  const handleClose = () => {
    setIsCartOpen(false);
    setTimeout(() => {
      if (step === 'success') {
        setStep('cart');
        setCreatedOrder(null);
      }
      setError('');
    }, 200);
  };

  const handleProceedToCheckout = () => {
    // Auto-fill unlocked milestone promo code if user hasn't typed one yet
    if (!promoInput && targetMilestonePromo && subtotal >= targetMilestonePromo.minPurchase) {
      setPromoInput(targetMilestonePromo.code);
    }
    setStep('checkout');
  };

  const handleClearSavedProfile = () => {
    try {
      localStorage.removeItem(BUYER_PROFILE_KEY);
    } catch {
      // ignore
    }
    setCustomerName('');
    setCustomerPhone('');
    setShippingAddress('');
    setHasSavedProfile(false);
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const res = await placeGuestOrder({
      customerName,
      customerPhone,
      shippingAddress,
      notes,
      promoCode: promoPreview?.valid ? promoPreview.code : ''
    });

    setSubmitting(false);

    if (!res.ok) {
      setError(res.error || 'Gagal membuat pesanan. Silakan coba lagi.');
      return;
    }

    // Save buyer profile locally for convenient repeat orders
    try {
      localStorage.setItem(
        BUYER_PROFILE_KEY,
        JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          shippingAddress: shippingAddress.trim()
        })
      );
      setHasSavedProfile(true);
    } catch {
      // ignore
    }

    setCreatedOrder(res.order);
    setStep('success');
    setNotes('');
    setPromoInput('');
  };

  const activePromos = promoCodes.filter((p) => p.isActive);

  // Floating Mini-Toast when item is added while drawer is closed
  const toastPortal =
    !isCartOpen && cartToast
      ? createPortal(
          <div className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] left-4 right-4 sm:left-6 sm:right-auto z-50 flex items-center justify-between gap-3 rounded-2xl border border-champagne/40 bg-emeraldInk px-4 py-3 text-xs text-pearl shadow-2xl animate-floatIn sm:max-w-sm">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-champagne/20 text-champagne">
                <Check size={14} className="stroke-[3]" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-champagne truncate">{cartToast.productName}</p>
                <p className="text-[11px] text-pearl/75">Warna {cartToast.color} masuk keranjang</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  dismissCartToast();
                  setIsCartOpen(true);
                }}
                className="rounded-full bg-champagne px-3 py-1.5 text-[11px] font-bold text-emeraldInk hover:bg-pearl transition"
              >
                Lihat ({cartCount})
              </button>
              <button
                type="button"
                onClick={dismissCartToast}
                aria-label="Tutup notifikasi keranjang"
                className="p-1 text-pearl/50 hover:text-pearl"
              >
                <X size={14} />
              </button>
            </div>
          </div>,
          document.body
        )
      : null;

  if (!isCartOpen) return toastPortal;

  const remainingForPromo =
    targetMilestonePromo ? Math.max(0, targetMilestonePromo.minPurchase - subtotal) : 0;
  const promoProgressPct = targetMilestonePromo
    ? Math.min(100, Math.round((subtotal / targetMilestonePromo.minPurchase) * 100))
    : 0;

  const drawer = (
    <div className="fixed inset-0 z-[9999] flex justify-end" role="dialog" aria-modal="true" aria-label="Keranjang Belanja">
      <div className="fixed inset-0 bg-emeraldInk/80 backdrop-blur-sm" onClick={handleClose} aria-hidden="true" />

      <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-pearlWarm shadow-2xl animate-floatIn">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-goldMuted/20 bg-white px-5 py-4">
          <div className="flex items-center gap-2.5">
            {step === 'checkout' && (
              <button
                type="button"
                onClick={() => {
                  setStep('cart');
                  setError('');
                }}
                aria-label="Kembali ke keranjang"
                className="rounded-full p-1 text-ink/70 hover:bg-pearlWarm hover:text-ink transition"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <ShoppingBag size={19} className="text-emeraldSoft" />
            <h2 className="font-display text-xl font-bold text-ink">
              {step === 'cart' && `Keranjang (${enrichedItems.reduce((s, i) => s + i.quantity, 0)})`}
              {step === 'checkout' && 'Checkout Pesanan'}
              {step === 'success' && 'Pesanan Berhasil!'}
            </h2>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Tutup keranjang"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink/60 hover:bg-pearlWarm hover:text-ink transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* STEP 1: CART ITEMS */}
        {step === 'cart' && (
          <>
            {/* Promo Progress Bar */}
            {enrichedItems.length > 0 && targetMilestonePromo && (
              <div className="border-b border-goldMuted/20 bg-champagne/25 px-5 py-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emeraldInk">
                  <Sparkles size={14} className="text-goldMuted shrink-0" />
                  {remainingForPromo > 0 ? (
                    <span>
                      Tambah <strong>Rp {remainingForPromo.toLocaleString('id-ID')}</strong> lagi untuk hemat{' '}
                      {targetMilestonePromo.discountType === 'percentage'
                        ? `${targetMilestonePromo.discountValue}%`
                        : `Rp ${targetMilestonePromo.discountValue.toLocaleString('id-ID')}`}{' '}
                      (<span className="font-mono">{targetMilestonePromo.code}</span>)
                    </span>
                  ) : (
                    <span className="text-emeraldSoft">
                      Selamat! Promo <span className="font-mono">{targetMilestonePromo.code}</span> sudah siap dipakai!
                    </span>
                  )}
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-goldMuted/20">
                  <div
                    className="h-full rounded-full bg-emeraldSoft transition-all duration-300"
                    style={{ width: `${promoProgressPct}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-5">
              {enrichedItems.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center py-12">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-champagne/30 text-goldMuted">
                    <ShoppingBag size={28} />
                  </div>
                  <h3 className="mt-4 font-display text-xl font-bold text-ink">Keranjang Masih Kosong</h3>
                  <p className="mt-1.5 max-w-xs text-xs text-ink/60 leading-relaxed">
                    Pilih koleksi hijab favoritmu dan klik <strong>+ Keranjang</strong> untuk mulai berbelanja.
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {enrichedItems.map((item) => (
                    <div
                      key={`${item.productId}-${item.color}`}
                      className={`rounded-2xl border bg-white p-3.5 shadow-xs ${
                        item.exceedsStock ? 'border-roseClay/60 ring-1 ring-roseClay/30' : 'border-goldMuted/20'
                      }`}
                    >
                      <div className="flex gap-3.5">
                        <img
                          src={safeUrl(item.product.image, '/images/product-daily-voile.jpg')}
                          alt={item.product.name}
                          className="h-20 w-16 shrink-0 rounded-xl object-cover bg-mist"
                        />
                        <div className="flex flex-1 flex-col justify-between min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-bold text-sm text-ink truncate">{item.product.name}</p>
                              <p className="text-xs text-ink/60">
                                Warna: <span className="font-semibold text-goldMuted">{item.color}</span>
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.productId, item.color)}
                              aria-label={`Hapus ${item.product.name}`}
                              className="rounded-lg p-1 text-ink/40 hover:bg-roseClay/10 hover:text-roseClay transition"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>

                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-sm font-bold text-emeraldSoft">
                              Rp {item.lineTotal.toLocaleString('id-ID')}
                            </span>

                            <div className="inline-flex items-center gap-1 rounded-full border border-goldMuted/30 bg-pearlWarm/60 px-1.5 py-0.5">
                              <button
                                type="button"
                                onClick={() => updateCartQuantity(item.productId, item.color, item.quantity - 1)}
                                aria-label="Kurangi jumlah"
                                className="flex h-6 w-6 items-center justify-center rounded-full text-ink hover:bg-white transition"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="min-w-[1.5rem] text-center text-xs font-bold text-ink">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                disabled={item.quantity >= item.maxStock}
                                onClick={() => updateCartQuantity(item.productId, item.color, item.quantity + 1)}
                                aria-label="Tambah jumlah"
                                className="flex h-6 w-6 items-center justify-center rounded-full text-ink hover:bg-white transition disabled:opacity-35"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Stale Stock Conflict Warning */}
                      {item.exceedsStock && (
                        <div className="mt-2.5 flex items-center justify-between gap-2 rounded-xl bg-roseClay/10 px-3 py-2 text-[11px] font-bold text-roseClay">
                          <span className="inline-flex items-center gap-1.5">
                            <AlertTriangle size={13} className="shrink-0" />
                            {item.maxStock <= 0
                              ? 'Stok warna ini baru saja habis.'
                              : `Stok tersisa ${item.maxStock} pcs.`}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.productId, item.color, item.maxStock)}
                            className="rounded-full bg-roseClay px-2.5 py-0.5 text-[10px] font-bold text-white hover:opacity-90 shrink-0"
                          >
                            {item.maxStock <= 0 ? 'Hapus' : `Set ${item.maxStock}`}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Quick Upsell Card to help reach promo milestone */}
                  {upsellProduct && (
                    <div className="rounded-2xl border border-dashed border-goldMuted/40 bg-champagne/15 p-3.5">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-goldMuted">
                        Lengkapi Pesananmu
                      </p>
                      <div className="mt-2 flex items-center gap-3">
                        <img
                          src={safeUrl(upsellProduct.product.image, '/images/product-daily-voile.jpg')}
                          alt={upsellProduct.product.name}
                          className="h-12 w-10 rounded-lg object-cover bg-mist shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-ink truncate">{upsellProduct.product.name}</p>
                          <p className="text-[11px] font-semibold text-emeraldSoft">
                            {upsellProduct.product.price} • {upsellProduct.color}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => addToCart(upsellProduct.product, upsellProduct.color, 1)}
                          className="rounded-full bg-emeraldSoft px-3 py-1.5 text-[11px] font-bold text-pearl hover:bg-emeraldDeep transition shrink-0"
                        >
                          + Tambah
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {enrichedItems.length > 0 && (
              <div className="border-t border-goldMuted/20 bg-white p-5 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-ink/70">Subtotal</span>
                  <span className="text-lg font-bold text-emeraldSoft">
                    Rp {subtotal.toLocaleString('id-ID')}
                  </span>
                </div>
                {hasStockConflict && (
                  <p className="text-xs font-bold text-roseClay">
                    Sesuaikan jumlah item yang melebihi stok terlebih dahulu.
                  </p>
                )}
                <button
                  type="button"
                  disabled={hasStockConflict}
                  onClick={handleProceedToCheckout}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-emeraldSoft py-3.5 text-sm font-bold text-pearl shadow-emerald transition hover:bg-emeraldDeep disabled:opacity-45 disabled:cursor-not-allowed"
                >
                  Lanjut ke Checkout
                </button>
              </div>
            )}
          </>
        )}

        {/* STEP 2: GUEST CHECKOUT FORM */}
        {step === 'checkout' && (
          <form onSubmit={handleCheckoutSubmit} className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Compact Order Summary */}
              <div className="rounded-2xl border border-goldMuted/20 bg-white p-3.5 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-ink/60">
                    Ringkasan ({enrichedItems.reduce((s, i) => s + i.quantity, 0)} item)
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep('cart')}
                    className="text-[11px] font-bold text-goldMuted hover:text-emeraldSoft"
                  >
                    Ubah
                  </button>
                </div>
                {enrichedItems.map((item) => (
                  <div key={`${item.productId}-${item.color}`} className="flex justify-between gap-2 text-ink/80">
                    <span className="truncate">
                      {item.product.name} ({item.color}) × {item.quantity}
                    </span>
                    <span className="font-bold text-ink shrink-0">
                      Rp {item.lineTotal.toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
              </div>

              {hasSavedProfile && (
                <div className="flex items-center justify-between rounded-xl bg-emeraldSoft/10 px-3 py-2 text-[11px] text-emeraldInk">
                  <span>Data pengiriman diisi otomatis dari pesanan sebelumnya.</span>
                  <button
                    type="button"
                    onClick={handleClearSavedProfile}
                    className="font-bold text-roseClay hover:underline shrink-0 ml-2"
                  >
                    Hapus
                  </button>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink/70">
                  Nama Lengkap Penerima *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Contoh: Aisyah Nurhaliza"
                  className="mt-1.5 w-full rounded-xl border border-goldMuted/30 bg-white p-3 text-sm font-medium text-ink focus:border-emeraldSoft focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink/70">
                  Nomor WhatsApp Aktif *
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="mt-1.5 w-full rounded-xl border border-goldMuted/30 bg-white p-3 text-sm font-medium text-ink focus:border-emeraldSoft focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink/70">
                  Alamat Pengiriman Lengkap *
                </label>
                <textarea
                  rows={3}
                  required
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Nama jalan, nomor rumah, RT/RW, kecamatan, kota, kode pos..."
                  className="mt-1.5 w-full rounded-xl border border-goldMuted/30 bg-white p-3 text-sm text-ink focus:border-emeraldSoft focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink/70">
                  Catatan (Opsional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Misal: titip kartu ucapan, packing kado..."
                  className="mt-1.5 w-full rounded-xl border border-goldMuted/30 bg-white p-3 text-sm text-ink focus:border-emeraldSoft focus:outline-none"
                />
              </div>

              {/* Promo Code Input */}
              <div className="rounded-2xl border border-goldMuted/25 bg-white p-3.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-ink/70">
                  Kode Promo (Opsional)
                </label>
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                  placeholder="Masukkan kode kupon..."
                  className="mt-1.5 w-full rounded-xl border border-goldMuted/30 bg-pearlWarm/40 p-2.5 font-mono text-xs font-bold uppercase text-ink focus:border-emeraldSoft focus:bg-white focus:outline-none"
                />

                {activePromos.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {activePromos.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPromoInput(p.code)}
                        className="inline-flex items-center gap-1 rounded-full border border-goldMuted/30 bg-champagne/25 px-2.5 py-0.5 text-[11px] font-bold text-emeraldInk hover:bg-champagne/50 transition"
                      >
                        <Tag size={10} />
                        {p.code}
                      </button>
                    ))}
                  </div>
                )}

                {promoPreview && (
                  <p
                    className={`mt-2 text-xs font-bold ${
                      promoPreview.valid ? 'text-emeraldSoft' : 'text-roseClay'
                    }`}
                  >
                    {promoPreview.message}
                  </p>
                )}
              </div>

              {error && (
                <div className="rounded-xl border border-roseClay/40 bg-roseClay/10 p-3 text-xs font-bold text-roseClay">
                  {error}
                </div>
              )}
            </div>

            <div className="border-t border-goldMuted/20 bg-white p-5 space-y-2.5">
              <div className="flex justify-between text-xs text-ink/70">
                <span>Subtotal ({enrichedItems.reduce((s, i) => s + i.quantity, 0)} item)</span>
                <span className="font-semibold">Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              {promoPreview?.valid && (
                <div className="flex justify-between text-xs font-bold text-roseClay">
                  <span>Diskon ({promoPreview.code})</span>
                  <span>-Rp {promoPreview.discountAmount.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-goldMuted/15 pt-2 text-sm font-bold text-ink">
                <span>Total Pesanan</span>
                <span className="text-lg text-emeraldSoft">Rp {estimatedTotal.toLocaleString('id-ID')}</span>
              </div>
              <p className="text-[11px] text-ink/55">
                * Ongkos kirim & nomor rekening akan diinformasikan admin via WhatsApp setelah pesanan dibuat.
              </p>

              <button
                type="submit"
                disabled={submitting}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-full bg-emeraldSoft py-3.5 text-sm font-bold text-pearl shadow-emerald transition hover:bg-emeraldDeep disabled:opacity-60"
              >
                {submitting ? 'Memproses Pesanan...' : 'Buat Pesanan Sekarang'}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: ORDER CONFIRMATION */}
        {step === 'success' && createdOrder && (
          <div className="flex flex-1 flex-col justify-between overflow-y-auto p-6">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emeraldSoft/15 text-emeraldSoft">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="mt-4 font-display text-2xl font-bold text-ink">Pesanan Tercatat!</h3>
              <p className="mt-1 text-xs text-ink/65">
                Stok hijabmu sudah diamankan. Simpan kode order ini untuk melacak status pesananmu:
              </p>

              <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-goldMuted/30 bg-white px-4 py-3 shadow-xs">
                <span className="font-mono text-lg font-bold text-emeraldInk">{createdOrder.orderCode}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(createdOrder.orderCode);
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className="inline-flex items-center gap-1 rounded-full bg-champagne/40 px-2.5 py-1 text-[11px] font-bold text-emeraldInk hover:bg-champagne transition"
                >
                  {copiedCode ? <Check size={12} /> : <Copy size={12} />}
                  {copiedCode ? 'Disalin' : 'Salin'}
                </button>
              </div>

              <div className="mt-5 space-y-2 rounded-2xl border border-goldMuted/20 bg-white p-4 text-left text-xs">
                {(createdOrder.items || []).map((item, idx) => (
                  <div key={idx} className="flex justify-between gap-2">
                    <span className="text-ink/80">
                      {item.productName} ({item.color}) × {item.quantity}
                    </span>
                    <span className="font-bold text-ink shrink-0">
                      Rp {item.lineTotal.toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
                {createdOrder.discountAmount > 0 && (
                  <div className="flex justify-between font-bold text-roseClay border-t border-goldMuted/15 pt-2">
                    <span>Diskon ({createdOrder.promoCode})</span>
                    <span>-Rp {createdOrder.discountAmount.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-goldMuted/15 pt-2 text-sm font-bold text-emeraldSoft">
                  <span>Total</span>
                  <span>Rp {createdOrder.totalAmount.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-2.5">
              <a
                href={waLinks.forOrder(createdOrder)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-emeraldSoft py-3.5 text-sm font-bold text-pearl shadow-emerald transition hover:bg-emeraldDeep"
              >
                <MessageCircle size={18} />
                Konfirmasi & Bayar via WhatsApp
              </a>
              <button
                type="button"
                onClick={handleClose}
                className="w-full rounded-full border border-goldMuted/30 bg-white py-2.5 text-xs font-bold text-ink/75 hover:bg-pearlWarm transition"
              >
                Tutup & Lanjut Belanja
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(drawer, document.body);
}
