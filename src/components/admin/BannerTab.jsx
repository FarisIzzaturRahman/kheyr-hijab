import { Save } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../../context/StoreContext';

export default function BannerTab({ showToast }) {
  const { promoBanner, updatePromo } = useStore();
  const [promoForm, setPromoForm] = useState(promoBanner);

  const handleSave = (e) => {
    e.preventDefault();
    updatePromo(promoForm);
    showToast('Banner promo pengumuman berhasil disimpan!');
  };

  return (
    <div className="max-w-4xl">
      <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink">Banner Pengumuman Teratas (Top Bar)</h2>
      <p className="text-xs sm:text-sm text-ink/65">
        Aktifkan pengumuman diskon gajian, voucher ongkir, atau info peluncuran produk baru di bagian teratas website.
      </p>

      <form onSubmit={handleSave} className="mt-8 space-y-6">
        <div className="rounded-3xl border border-goldMuted/25 bg-white p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-goldMuted/15 pb-5">
            <div>
              <h3 className="font-display text-lg font-bold text-ink">Aktifkan Banner Pengumuman di Website</h3>
              <p className="text-xs text-ink/60">Jika aktif, banner akan muncul di bilah teratas halaman publik.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={promoForm.enabled}
                onChange={(e) => setPromoForm({ ...promoForm, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-13 h-7 bg-ink/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emeraldSoft" />
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink/70">Badge Label Promo</label>
            <input
              type="text"
              value={promoForm.badge || ''}
              onChange={(e) => setPromoForm({ ...promoForm, badge: e.target.value })}
              placeholder="Contoh: PROMO BULAN INI, DISKON SPESIAL"
              className="mt-1.5 w-full rounded-xl border border-goldMuted/30 bg-pearlWarm/30 p-3 text-sm font-semibold text-ink focus:border-emeraldSoft focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink/70">Teks Pengumuman Promo</label>
            <textarea
              rows={3}
              value={promoForm.text || ''}
              onChange={(e) => setPromoForm({ ...promoForm, text: e.target.value })}
              placeholder="Tuliskan isi pengumuman diskon atau kode kupon..."
              className="mt-1.5 w-full rounded-xl border border-goldMuted/30 bg-pearlWarm/30 p-3 text-sm leading-relaxed text-ink focus:border-emeraldSoft focus:outline-none"
            />
          </div>

          <div className="pt-2">
            <span className="text-xs font-bold text-ink/60 mb-2 block">Live Preview Tampilan:</span>
            <div className="overflow-hidden rounded-xl border border-champagne/40 bg-gradient-to-r from-emeraldDeep via-emeraldSoft to-emeraldDeep p-3 text-center text-xs font-semibold text-pearl shadow-sm">
              <span className="mr-2 rounded-full bg-champagne px-2 py-0.5 text-[10px] font-bold text-emeraldInk">
                {promoForm.badge || 'PROMO'}
              </span>
              <span>{promoForm.text || 'Isi promo Anda di sini...'}</span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-full bg-emeraldSoft px-8 py-3.5 text-sm font-bold text-pearl shadow-emerald transition hover:bg-emeraldDeep"
        >
          <Save size={18} />
          Simpan Banner Promo
        </button>
      </form>
    </div>
  );
}
