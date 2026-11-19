import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Tag,
  Trash2,
  X
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { safeUrl, useStore } from '../context/StoreContext';

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    products,
    promoCodes,
    getVariantStock,
    updateCartQuantity,
    removeFromCart,
    calculateCartPromo,
    placeGuestOrder,
    waLinks
  } = useStore();

  const [step, setStep] = useState('cart'); // 'cart' | 'checkout' | 'success'
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
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
          maxStock
        };
      })
      .filter(Boolean);
  }, [cart, products, getVariantStock]);

  const subtotal = useMemo(
    () => enrichedItems.reduce((sum, item) => sum + item.lineTotal, 0),
    [enrichedItems]
  );

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

  if (!isCartOpen || typeof document === 'undefined') return null;

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

    setCreatedOrder(res.order);
    setStep('success');
    setCustomerName('');
    setCustomerPhone('');
    setShippingAddress('');
    setNotes('');
    setPromoInput('');
  };

  const activePromos = promoCodes.filter((p) => p.isActive);

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
            <div className="flex-1 overflow-y-auto p-5">
              {enrichedItems.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center py-12">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-champagne/30 text-goldMuted">
                    <ShoppingBag size={28} />
                  </div>
                  <h3 className="mt-4 font-display text-xl font-bold text-ink">Keranjang Masih Kosong</h3>
                  <p className="mt-1.5 max-w-xs text-xs text-ink/60 leading-relaxed">
                    Pilih koleksi hijab favoritmu dan klik <strong>Tambah ke Keranjang</strong> untuk mulai berbelanja.
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {enrichedItems.map((item) => (
                    <div
                      key={`${item.productId}-${item.color}`}
                      className="flex gap-3.5 rounded-2xl border border-goldMuted/20 bg-white p-3.5 shadow-xs"
                    >
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
                  ))}
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
                <button
                  type="button"
                  onClick={() => setStep('checkout')}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-emeraldSoft py-3.5 text-sm font-bold text-pearl shadow-emerald transition hover:bg-emeraldDeep"
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
