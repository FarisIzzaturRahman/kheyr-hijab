import { PackageSearch, Search, Truck, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ORDER_STATUS_LABELS, useStore } from '../context/StoreContext';

const STATUS_BADGE_CLASSES = {
  pending_payment: 'bg-champagne/50 text-emeraldInk border-goldMuted/40',
  paid: 'bg-emeraldSoft/15 text-emeraldSoft border-emeraldSoft/30',
  packed: 'bg-amber-100 text-amber-900 border-amber-300',
  shipped: 'bg-sky-100 text-sky-900 border-sky-300',
  completed: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  cancelled: 'bg-roseClay/15 text-roseClay border-roseClay/30'
};

export default function TrackOrderModal({ open, onClose }) {
  const { trackGuestOrder } = useStore();
  const [orderCode, setOrderCode] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!open) return undefined;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  const handleTrack = async (e) => {
    e.preventDefault();
    setError('');
    setOrder(null);
    setLoading(true);
    const res = await trackGuestOrder(orderCode, phone);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setOrder(res.order);
  };

  const modal = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Lacak Pesanan"
    >
      <div className="fixed inset-0 bg-emeraldInk/80 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-champagne/40 bg-pearlWarm shadow-2xl animate-floatIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-goldMuted/20 bg-white px-6 py-4">
          <div className="flex items-center gap-2">
            <PackageSearch size={20} className="text-goldMuted" />
            <h2 className="font-display text-xl font-bold text-ink">Lacak Status Pesanan</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup lacak pesanan"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink/60 hover:bg-pearlWarm hover:text-ink transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleTrack} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink/70">Kode Order</label>
              <input
                type="text"
                required
                value={orderCode}
                onChange={(e) => setOrderCode(e.target.value.toUpperCase())}
                placeholder="Contoh: KHY-261119-A1B2"
                className="mt-1 w-full rounded-xl border border-goldMuted/30 bg-white p-3 font-mono text-sm font-bold uppercase text-ink focus:border-emeraldSoft focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink/70">
                Nomor WhatsApp Saat Order
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Contoh: 081234567890"
                className="mt-1 w-full rounded-xl border border-goldMuted/30 bg-white p-3 text-sm font-medium text-ink focus:border-emeraldSoft focus:outline-none"
              />
            </div>

            {error && <p className="text-xs font-bold text-roseClay">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-emeraldSoft py-3 text-sm font-bold text-pearl shadow-emerald transition hover:bg-emeraldDeep disabled:opacity-60"
            >
              <Search size={16} />
              {loading ? 'Mencari Pesanan...' : 'Cek Status Pesanan'}
            </button>
          </form>

          {order && (
            <div className="mt-5 rounded-2xl border border-goldMuted/25 bg-white p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-sm font-bold text-ink">{order.orderCode}</p>
                  <p className="text-ink/60">Penerima: {order.customerName}</p>
                </div>
                <span
                  className={`rounded-full border px-3 py-1 text-[11px] font-bold ${
                    STATUS_BADGE_CLASSES[order.status] || 'bg-pearlWarm text-ink'
                  }`}
                >
                  {ORDER_STATUS_LABELS[order.status] || order.status}
                </span>
              </div>

              {(order.courier || order.trackingNumber) && (
                <div className="flex items-center gap-2 rounded-xl bg-pearlWarm/70 p-2.5 text-emeraldInk">
                  <Truck size={15} className="text-goldMuted shrink-0" />
                  <span>
                    <strong>{order.courier || 'Kurir'}</strong>
                    {order.trackingNumber ? ` — Resi: ${order.trackingNumber}` : ''}
                  </span>
                </div>
              )}

              <div className="border-t border-goldMuted/15 pt-2.5 space-y-1.5">
                {(order.items || []).map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="text-ink/75">
                      {item.productName} ({item.color}) × {item.quantity}
                    </span>
                    <span className="font-bold text-ink">Rp {item.lineTotal.toLocaleString('id-ID')}</span>
                  </div>
                ))}
                {order.discountAmount > 0 && (
                  <div className="flex justify-between font-bold text-roseClay">
                    <span>Diskon ({order.promoCode})</span>
                    <span>-Rp {order.discountAmount.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-goldMuted/15 pt-2 text-sm font-bold text-emeraldSoft">
                  <span>Total</span>
                  <span>Rp {order.totalAmount.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
