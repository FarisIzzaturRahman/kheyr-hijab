import { MessageCircle, RefreshCw, Save, ShoppingBag, Truck, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ORDER_STATUS_LABELS, useStore } from '../../context/StoreContext';

const STATUS_FILTERS = ['all', 'pending_payment', 'paid', 'packed', 'shipped', 'completed', 'cancelled'];

function OrderRowCard({ order, onSave, onCancel }) {
  const [status, setStatus] = useState(order.status);
  const [courier, setCourier] = useState(order.courier || '');
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || '');
  const [saving, setSaving] = useState(false);

  const cleanPhone = (order.customerPhone || '').replace(/\D/g, '').replace(/^0/, '62');
  const waCustomerUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Assalamu alaikum Kak ${order.customerName}, terkait pesanan KHEYR dengan kode ${order.orderCode}...`
  )}`;

  const handleSave = async () => {
    setSaving(true);
    await onSave(order.id, { status, courier, trackingNumber });
    setSaving(false);
  };

  return (
    <div className="rounded-3xl border border-goldMuted/25 bg-white p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-goldMuted/15 pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-base font-bold text-emeraldInk">{order.orderCode}</span>
            <span className="rounded-full bg-champagne/40 px-2.5 py-0.5 text-[11px] font-bold text-emeraldInk">
              {ORDER_STATUS_LABELS[order.status] || order.status}
            </span>
          </div>
          <p className="mt-1 text-xs text-ink/60">
            {new Date(order.createdAt).toLocaleString('id-ID')} • <strong>{order.customerName}</strong> ({order.customerPhone})
          </p>
        </div>

        <a
          href={waCustomerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full bg-emeraldSoft/10 border border-emeraldSoft/30 px-3.5 py-1.5 text-xs font-bold text-emeraldSoft hover:bg-emeraldSoft hover:text-white transition"
        >
          <MessageCircle size={13} />
          Chat Pembeli
        </a>
      </div>

      {/* Items + Shipping Info */}
      <div className="grid gap-4 md:grid-cols-2 text-xs">
        <div className="space-y-1.5 rounded-2xl bg-pearlWarm/50 p-3.5 border border-goldMuted/15">
          <p className="font-bold uppercase tracking-wider text-[10px] text-ink/60">Item Pesanan</p>
          {(order.items || []).map((item, idx) => (
            <div key={item.id || idx} className="flex justify-between gap-2">
              <span className="text-ink">
                {item.productName} ({item.color}) × <strong>{item.quantity}</strong>
              </span>
              <span className="font-bold text-ink shrink-0">Rp {item.lineTotal.toLocaleString('id-ID')}</span>
            </div>
          ))}
          {order.discountAmount > 0 && (
            <div className="flex justify-between font-bold text-roseClay pt-1 border-t border-goldMuted/15">
              <span>Promo ({order.promoCode})</span>
              <span>-Rp {order.discountAmount.toLocaleString('id-ID')}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-emeraldSoft text-sm pt-1.5 border-t border-goldMuted/15">
            <span>Total</span>
            <span>Rp {order.totalAmount.toLocaleString('id-ID')}</span>
          </div>
        </div>

        <div className="space-y-1.5 rounded-2xl bg-pearlWarm/50 p-3.5 border border-goldMuted/15">
          <p className="font-bold uppercase tracking-wider text-[10px] text-ink/60">Alamat Pengiriman</p>
          <p className="text-ink leading-relaxed">{order.shippingAddress}</p>
          {order.notes && (
            <p className="pt-1 text-ink/70 italic">Catatan: &ldquo;{order.notes}&rdquo;</p>
          )}
        </div>
      </div>

      {/* Admin Controls */}
      {order.status !== 'cancelled' && (
        <div className="flex flex-col gap-3 border-t border-goldMuted/15 pt-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="grid flex-1 gap-2.5 sm:grid-cols-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-ink/60">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 w-full rounded-xl border border-goldMuted/30 bg-pearlWarm/30 p-2 text-xs font-bold text-ink focus:border-emeraldSoft focus:outline-none"
              >
                {Object.entries(ORDER_STATUS_LABELS)
                  .filter(([k]) => k !== 'cancelled')
                  .map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-ink/60">Kurir</label>
              <input
                type="text"
                value={courier}
                onChange={(e) => setCourier(e.target.value)}
                placeholder="JNE / SiCepat / J&T"
                className="mt-1 w-full rounded-xl border border-goldMuted/30 bg-pearlWarm/30 p-2 text-xs font-semibold text-ink focus:border-emeraldSoft focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-ink/60">Nomor Resi</label>
              <div className="relative mt-1">
                <Truck size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-goldMuted" />
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Masukkan resi..."
                  className="w-full rounded-xl border border-goldMuted/30 bg-pearlWarm/30 py-2 pl-8 pr-2.5 font-mono text-xs font-semibold text-ink focus:border-emeraldSoft focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 rounded-full bg-emeraldSoft px-4 py-2 text-xs font-bold text-pearl shadow-sm hover:bg-emeraldDeep transition disabled:opacity-50"
            >
              <Save size={13} />
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>

            <button
              type="button"
              onClick={() => onCancel(order)}
              className="inline-flex items-center gap-1 rounded-full border border-roseClay/40 bg-roseClay/10 px-3.5 py-2 text-xs font-bold text-roseClay hover:bg-roseClay hover:text-white transition"
            >
              <XCircle size={13} />
              Batalkan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrdersTab({ showToast }) {
  const { orders, refreshOrders, updateOrderStatus, cancelOrder } = useStore();
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'all') return orders;
    return orders.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshOrders();
    setRefreshing(false);
    showToast('Daftar pesanan diperbarui.');
  };

  const handleSave = async (orderId, payload) => {
    const res = await updateOrderStatus(orderId, payload);
    if (res.ok) {
      showToast('Status pesanan & resi berhasil diperbarui!');
    } else {
      showToast(res.error || 'Gagal memperbarui pesanan.', 'error');
    }
  };

  const handleCancel = async (order) => {
    if (!window.confirm(`Batalkan pesanan ${order.orderCode} dan kembalikan stok ke katalog?`)) return;
    const res = await cancelOrder(order.id);
    if (res.ok) {
      showToast(`Pesanan ${order.orderCode} dibatalkan & stok dikembalikan.`);
    } else {
      showToast(res.error || 'Gagal membatalkan pesanan.', 'error');
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink">Pesanan Masuk</h2>
          <p className="text-xs sm:text-sm text-ink/65">
            Kelola status pembayaran, input nomor resi pengiriman, atau batalkan pesanan (stok otomatis kembali).
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-full border border-goldMuted/30 bg-white px-5 py-2.5 text-xs font-bold text-ink shadow-xs hover:bg-pearlWarm transition self-start sm:self-auto"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          Muat Ulang
        </button>
      </div>

      {/* Status Filter Pills */}
      <div className="mt-6 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setStatusFilter(st)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
              statusFilter === st
                ? 'bg-emeraldSoft text-pearl shadow-sm'
                : 'border border-goldMuted/25 bg-white text-ink/70 hover:border-goldMuted'
            }`}
          >
            {st === 'all' ? `Semua (${orders.length})` : ORDER_STATUS_LABELS[st]}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="mt-6 space-y-4">
        {filteredOrders.map((order) => (
          <OrderRowCard key={order.id} order={order} onSave={handleSave} onCancel={handleCancel} />
        ))}

        {filteredOrders.length === 0 && (
          <div className="rounded-3xl border border-goldMuted/20 bg-white p-12 text-center shadow-sm">
            <ShoppingBag size={32} className="mx-auto text-goldMuted" />
            <h3 className="mt-3 font-display text-xl font-bold text-ink">Belum Ada Pesanan</h3>
            <p className="mt-1 text-xs text-ink/60">
              Pesanan baru dari keranjang checkout pelanggan akan langsung muncul di sini.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
