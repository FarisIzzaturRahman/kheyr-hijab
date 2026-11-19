import { Check, Copy, Edit, Plus, Save, Ticket, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { safeUrl, useStore } from '../../context/StoreContext';

const emptyPromoForm = {
  code: '',
  discountType: 'percentage',
  discountValue: 15,
  maxDiscount: 30000,
  minPurchase: 100000,
  applicableTo: 'all',
  applicableProductIds: [],
  isActive: true,
  description: 'Diskon 15% (maks. Rp 30.000) min. belanja Rp 100.000.'
};

export default function PromoCodesTab({ showToast }) {
  const { products, promoCodes, addPromoCode, updatePromoCode, deletePromoCode, togglePromoCodeStatus } = useStore();
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [editingPromoCode, setEditingPromoCode] = useState(null);
  const [promoCodeForm, setPromoCodeForm] = useState(emptyPromoForm);

  const openCreatePromoModal = () => {
    setEditingPromoCode(null);
    setPromoCodeForm(emptyPromoForm);
    setIsPromoModalOpen(true);
  };

  const openEditPromoModal = (promo) => {
    setEditingPromoCode(promo);
    setPromoCodeForm({ ...promo, applicableProductIds: promo.applicableProductIds || [] });
    setIsPromoModalOpen(true);
  };

  const handleSavePromoCode = (e) => {
    e.preventDefault();
    if (!promoCodeForm.code.trim()) {
      showToast('Kode promo tidak boleh kosong!', 'error');
      return;
    }

    if (promoCodeForm.applicableTo === 'specific' && promoCodeForm.applicableProductIds.length === 0) {
      showToast('Pilih minimal 1 produk jika memilih produk tertentu!', 'error');
      return;
    }

    const res = editingPromoCode
      ? updatePromoCode(editingPromoCode.id, promoCodeForm)
      : addPromoCode(promoCodeForm);

    if (!res.ok) {
      showToast(res.error, 'error');
      return;
    }

    showToast(
      editingPromoCode
        ? `Kode Promo "${promoCodeForm.code.toUpperCase()}" berhasil diperbarui!`
        : `Kode Promo baru "${promoCodeForm.code.toUpperCase()}" berhasil dibuat!`
    );
    setIsPromoModalOpen(false);
  };

  const handleDeletePromoCode = (promo) => {
    if (window.confirm(`Hapus kode promo "${promo.code}"?`)) {
      deletePromoCode(promo.id);
      showToast(`Kode promo "${promo.code}" telah dihapus.`);
    }
  };

  const toggleProductInPromo = (productId) => {
    const current = promoCodeForm.applicableProductIds || [];
    setPromoCodeForm({
      ...promoCodeForm,
      applicableProductIds: current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId]
    });
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink">Manajemen Voucher & Kode Promo</h2>
          <p className="text-xs sm:text-sm text-ink/65">
            Buat kode promo diskon (% atau nominal), atur batas maksimal potongan, dan tentukan produk yang berlaku.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreatePromoModal}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-emeraldSoft px-6 py-3 text-xs sm:text-sm font-bold text-pearl shadow-emerald transition hover:bg-emeraldDeep self-start sm:self-auto"
        >
          <Plus size={18} />
          Buat Kode Promo Baru
        </button>
      </div>

      {/* Promo Codes Grid */}
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {promoCodes.map((promo) => {
          const isPercentage = promo.discountType === 'percentage';
          const discountDisplay = isPercentage
            ? `Diskon ${promo.discountValue}%`
            : `Potongan Rp ${Number(promo.discountValue).toLocaleString('id-ID')}`;

          const maxDisplay = isPercentage
            ? promo.maxDiscount > 0
              ? `Maks. Rp ${Number(promo.maxDiscount).toLocaleString('id-ID')}`
              : 'Tanpa Batas Maksimal'
            : 'Potongan Nominal Tetap';

          const minDisplay =
            promo.minPurchase > 0
              ? `Min. Belanja: Rp ${Number(promo.minPurchase).toLocaleString('id-ID')}`
              : 'Tanpa Min. Belanja';

          const isAllProducts =
            promo.applicableTo === 'all' || !promo.applicableProductIds || promo.applicableProductIds.length === 0;

          return (
            <div
              key={promo.id}
              className={`flex flex-col justify-between overflow-hidden rounded-3xl border bg-white p-6 shadow-sm transition ${
                promo.isActive ? 'border-goldMuted/30 shadow-soft' : 'border-ink/10 opacity-60 bg-pearlWarm/20'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-champagne/40 px-3.5 py-1 font-mono text-sm font-bold text-emeraldInk border border-goldMuted/30">
                    <Ticket size={14} className="text-goldMuted" />
                    {promo.code}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      togglePromoCodeStatus(promo.id);
                      showToast(`Kode promo ${promo.code} sekarang ${promo.isActive ? 'Nonaktif' : 'Aktif'}.`);
                    }}
                    className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                      promo.isActive
                        ? 'bg-emeraldSoft/15 text-emeraldSoft border border-emeraldSoft/30'
                        : 'bg-ink/10 text-ink/50 border border-ink/20'
                    }`}
                  >
                    {promo.isActive ? '● Aktif' : '○ Nonaktif'}
                  </button>
                </div>

                <div className="mt-4">
                  <h3 className="font-display text-2xl font-bold text-ink">{discountDisplay}</h3>
                  <p className="text-xs font-semibold text-goldMuted">{maxDisplay}</p>
                </div>

                <div className="mt-4 space-y-2 rounded-2xl border border-goldMuted/15 bg-pearlWarm/40 p-3.5 text-xs text-ink/75">
                  <div className="flex justify-between">
                    <span className="font-semibold text-ink/60">Syarat Belanja:</span>
                    <span className="font-bold text-ink">{minDisplay}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-ink/60">Berlaku Untuk:</span>
                    <span className="font-bold text-emeraldSoft text-right">
                      {isAllProducts ? 'Semua Koleksi' : `${promo.applicableProductIds.length} Produk Tertentu`}
                    </span>
                  </div>
                  {promo.description ? (
                    <p className="mt-1.5 pt-1.5 border-t border-goldMuted/15 text-[11px] text-ink/60 leading-relaxed">
                      {promo.description}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-goldMuted/15 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(promo.code);
                    showToast(`Kode "${promo.code}" disalin ke clipboard!`);
                  }}
                  className="inline-flex items-center gap-1 text-xs font-bold text-goldMuted hover:text-emeraldSoft transition"
                >
                  <Copy size={13} />
                  Salin Kode
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEditPromoModal(promo)}
                    className="rounded-lg border border-goldMuted/30 bg-pearlWarm/50 p-2 text-ink hover:bg-emeraldSoft hover:text-white transition"
                    title="Edit Promo"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePromoCode(promo)}
                    className="rounded-lg border border-roseClay/30 bg-roseClay/10 p-2 text-roseClay hover:bg-roseClay hover:text-white transition"
                    title="Hapus Promo"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {promoCodes.length === 0 && (
        <div className="my-12 rounded-3xl border border-goldMuted/20 bg-white p-12 text-center shadow-sm">
          <Ticket size={32} className="mx-auto text-goldMuted" />
          <h3 className="mt-3 font-display text-xl font-bold text-ink">Belum Ada Kode Promo</h3>
          <p className="mt-1 text-xs text-ink/60">Buat kode promo pertama untuk menarik lebih banyak pembeli!</p>
          <button
            type="button"
            onClick={openCreatePromoModal}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-emeraldSoft px-6 py-2.5 text-xs font-bold text-pearl"
          >
            <Plus size={14} />
            Buat Kode Promo Sekarang
          </button>
        </div>
      )}

      {/* Promo Code Form Modal */}
      {isPromoModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          <div className="fixed inset-0 bg-emeraldInk/85 backdrop-blur-sm" onClick={() => setIsPromoModalOpen(false)} />

          <div
            className="relative z-10 my-auto flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-champagne/40 bg-pearlWarm shadow-2xl animate-floatIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-goldMuted/20 bg-white px-6 py-4">
              <div className="flex items-center gap-2">
                <Ticket size={20} className="text-goldMuted" />
                <h3 className="font-display text-xl font-bold text-ink">
                  {editingPromoCode ? `Edit Kode Promo: ${editingPromoCode.code}` : 'Buat Voucher / Kode Promo Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPromoModalOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-ink/60 hover:bg-pearlWarm hover:text-ink transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSavePromoCode} className="overflow-y-auto p-6 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink/70">Kode Promo (Kupon) *</label>
                  <input
                    type="text"
                    required
                    value={promoCodeForm.code}
                    onChange={(e) => setPromoCodeForm({ ...promoCodeForm, code: e.target.value.toUpperCase() })}
                    placeholder="Contoh: KHEYRHEMAT, BERKAH20"
                    className="mt-1.5 w-full font-mono uppercase rounded-xl border border-goldMuted/30 bg-white p-3 text-sm font-bold text-ink focus:border-emeraldSoft focus:outline-none"
                  />
                  <span className="text-[11px] text-ink/50">Otomatis diubah menjadi huruf kapital.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink/70">Tipe Diskon</label>
                  <div className="mt-1.5 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPromoCodeForm({ ...promoCodeForm, discountType: 'percentage' })}
                      className={`rounded-xl py-2.5 text-xs font-bold transition border ${
                        promoCodeForm.discountType === 'percentage'
                          ? 'bg-emeraldSoft text-pearl border-emeraldSoft shadow-sm'
                          : 'bg-white text-ink/70 border-goldMuted/30 hover:bg-pearlWarm'
                      }`}
                    >
                      Persentase (%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPromoCodeForm({ ...promoCodeForm, discountType: 'fixed', maxDiscount: 0 })}
                      className={`rounded-xl py-2.5 text-xs font-bold transition border ${
                        promoCodeForm.discountType === 'fixed'
                          ? 'bg-emeraldSoft text-pearl border-emeraldSoft shadow-sm'
                          : 'bg-white text-ink/70 border-goldMuted/30 hover:bg-pearlWarm'
                      }`}
                    >
                      Potongan Rp
                    </button>
                  </div>
                </div>
              </div>

              <div className={`grid gap-4 ${promoCodeForm.discountType === 'percentage' ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink/70">
                    Nilai Diskon ({promoCodeForm.discountType === 'percentage' ? '%' : 'Rp'}) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={promoCodeForm.discountType === 'percentage' ? '100' : undefined}
                    value={promoCodeForm.discountValue}
                    onChange={(e) => setPromoCodeForm({ ...promoCodeForm, discountValue: e.target.value })}
                    placeholder={promoCodeForm.discountType === 'percentage' ? '15' : '15000'}
                    className="mt-1.5 w-full rounded-xl border border-goldMuted/30 bg-white p-3 text-sm font-bold text-ink focus:border-emeraldSoft focus:outline-none"
                  />
                </div>

                {promoCodeForm.discountType === 'percentage' && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-ink/70">
                      Maks. Diskon (Rp)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={promoCodeForm.maxDiscount}
                      onChange={(e) => setPromoCodeForm({ ...promoCodeForm, maxDiscount: e.target.value })}
                      placeholder="30000 (0 = tanpa batas)"
                      className="mt-1.5 w-full rounded-xl border border-goldMuted/30 bg-white p-3 text-sm font-bold text-ink focus:border-emeraldSoft focus:outline-none"
                    />
                    <span className="text-[10px] text-ink/50">0 jika tanpa batas maksimal</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink/70">
                    Min. Belanja (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={promoCodeForm.minPurchase}
                    onChange={(e) => setPromoCodeForm({ ...promoCodeForm, minPurchase: e.target.value })}
                    placeholder="100000"
                    className="mt-1.5 w-full rounded-xl border border-goldMuted/30 bg-white p-3 text-sm font-bold text-ink focus:border-emeraldSoft focus:outline-none"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-goldMuted/20 bg-white p-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-ink/70 mb-2">
                  Berlaku Untuk Produk Apa Saja?
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-ink cursor-pointer">
                    <input
                      type="radio"
                      name="applicableScope"
                      checked={promoCodeForm.applicableTo === 'all'}
                      onChange={() => setPromoCodeForm({ ...promoCodeForm, applicableTo: 'all', applicableProductIds: [] })}
                      className="accent-emeraldSoft"
                    />
                    <span>Semua Koleksi Produk</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-ink cursor-pointer">
                    <input
                      type="radio"
                      name="applicableScope"
                      checked={promoCodeForm.applicableTo === 'specific'}
                      onChange={() => setPromoCodeForm({ ...promoCodeForm, applicableTo: 'specific' })}
                      className="accent-emeraldSoft"
                    />
                    <span>Hanya Produk Tertentu ({promoCodeForm.applicableProductIds.length} Dipilih)</span>
                  </label>
                </div>

                {promoCodeForm.applicableTo === 'specific' && (
                  <div className="mt-3.5 border-t border-goldMuted/15 pt-3">
                    <span className="text-[11px] text-ink/60 mb-2 block font-medium">Pilih produk yang berlaku:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                      {products.map((prod) => {
                        const isChecked = promoCodeForm.applicableProductIds?.includes(prod.id);
                        return (
                          <button
                            key={prod.id}
                            type="button"
                            onClick={() => toggleProductInPromo(prod.id)}
                            className={`flex items-center gap-2.5 rounded-xl border p-2 text-left transition ${
                              isChecked
                                ? 'border-emeraldSoft bg-emeraldSoft/10 text-emeraldInk ring-1 ring-emeraldSoft'
                                : 'border-goldMuted/20 bg-pearlWarm/30 text-ink/75 hover:bg-pearlWarm'
                            }`}
                          >
                            <img
                              src={safeUrl(prod.image, '/images/product-daily-voile.jpg')}
                              alt={prod.name}
                              className="h-9 w-8 rounded-lg object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold truncate">{prod.name}</p>
                              <p className="text-[10px] text-ink/50">{prod.price}</p>
                            </div>
                            <div
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                                isChecked ? 'bg-emeraldSoft text-white border-emeraldSoft' : 'border-ink/20'
                              }`}
                            >
                              {isChecked && <Check size={13} className="stroke-[3]" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-goldMuted/20 bg-white p-4">
                <div>
                  <h4 className="text-xs font-bold text-ink">Status Kupon Promo</h4>
                  <p className="text-[11px] text-ink/60">Aktifkan agar dapat digunakan calon pembeli saat checkout.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={promoCodeForm.isActive}
                    onChange={(e) => setPromoCodeForm({ ...promoCodeForm, isActive: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-ink/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emeraldSoft" />
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink/70">Deskripsi / Catatan Promo</label>
                <textarea
                  rows={2}
                  value={promoCodeForm.description}
                  onChange={(e) => setPromoCodeForm({ ...promoCodeForm, description: e.target.value })}
                  placeholder="Contoh: Diskon 20% khusus edisi lebaran min. beli 2 pcs."
                  className="mt-1.5 w-full rounded-xl border border-goldMuted/30 bg-white p-3 text-xs sm:text-sm text-ink focus:border-emeraldSoft focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-goldMuted/20 pt-4">
                <button
                  type="button"
                  onClick={() => setIsPromoModalOpen(false)}
                  className="rounded-full border border-goldMuted/30 bg-white px-5 py-2.5 text-xs sm:text-sm font-bold text-ink/70 hover:bg-pearlWarm transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full bg-emeraldSoft px-7 py-2.5 text-xs sm:text-sm font-bold text-pearl shadow-emerald hover:bg-emeraldDeep transition"
                >
                  <Save size={16} />
                  Simpan Kode Promo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
