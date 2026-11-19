import { MessageCircle, Save } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../../context/StoreContext';

export default function StoreSettingsTab({ showToast }) {
  const { isSupabaseConfigured, brand, updateBrand, updateAdminPassword } = useStore();
  const [storeForm, setStoreForm] = useState(brand);
  const [newSecret, setNewSecret] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    updateBrand(storeForm);
    if (newSecret.trim()) {
      const res = await updateAdminPassword(newSecret.trim());
      if (res.ok) {
        setNewSecret('');
        showToast(
          isSupabaseConfigured
            ? 'Pengaturan Toko & Password Admin berhasil diperbarui!'
            : 'Pengaturan Toko & PIN Admin berhasil diperbarui!'
        );
      } else {
        showToast(`Pengaturan disimpan, tapi gagal ubah password: ${res.error}`, 'error');
      }
    } else {
      showToast('Pengaturan Toko berhasil diperbarui!');
    }
  };

  return (
    <div className="max-w-4xl">
      <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink">Pengaturan Brand & Kontak WhatsApp</h2>
      <p className="text-xs sm:text-sm text-ink/65">
        Perubahan nomor WhatsApp atau media sosial di sini akan langsung memperbarui seluruh link chat dan order di seluruh website.
      </p>

      <form onSubmit={handleSave} className="mt-8 space-y-6">
        <div className="rounded-3xl border border-goldMuted/25 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emeraldSoft/15 text-emeraldSoft">
              <MessageCircle size={22} />
            </div>
            <h3 className="font-display text-xl font-bold text-ink">Nomor WhatsApp Toko</h3>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink/70">
                Nomor WhatsApp (Format Internasional)
              </label>
              <input
                type="text"
                value={storeForm.whatsapp || ''}
                onChange={(e) => setStoreForm({ ...storeForm, whatsapp: e.target.value })}
                placeholder="Contoh: 6281234567890"
                className="mt-1.5 w-full rounded-xl border border-goldMuted/30 bg-pearlWarm/30 p-3 text-sm font-semibold text-ink focus:border-emeraldSoft focus:outline-none"
              />
              <span className="text-[11px] text-ink/50">Gunakan awalan 62 tanpa tanda plus (+) atau spasi.</span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink/70">
                Label Tampilan WhatsApp
              </label>
              <input
                type="text"
                value={storeForm.whatsappLabel || ''}
                onChange={(e) => setStoreForm({ ...storeForm, whatsappLabel: e.target.value })}
                placeholder="Contoh: 0812-3456-7890"
                className="mt-1.5 w-full rounded-xl border border-goldMuted/30 bg-pearlWarm/30 p-3 text-sm font-semibold text-ink focus:border-emeraldSoft focus:outline-none"
              />
              <span className="text-[11px] text-ink/50">Format yang dibaca manusia di Footer/Kontak.</span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-goldMuted/25 bg-white p-6 sm:p-8 shadow-sm">
          <h3 className="font-display text-xl font-bold text-ink">Profil & Identitas Brand</h3>
          <div className="mt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink/70">Nama Brand</label>
                <input
                  type="text"
                  value={storeForm.name || ''}
                  onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-goldMuted/30 bg-pearlWarm/30 p-3 text-sm font-semibold text-ink focus:border-emeraldSoft focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink/70">Tagline</label>
                <input
                  type="text"
                  value={storeForm.tagline || ''}
                  onChange={(e) => setStoreForm({ ...storeForm, tagline: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-goldMuted/30 bg-pearlWarm/30 p-3 text-sm font-semibold text-ink focus:border-emeraldSoft focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink/70">Deskripsi Intro Brand</label>
              <textarea
                rows={2}
                value={storeForm.intro || ''}
                onChange={(e) => setStoreForm({ ...storeForm, intro: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-goldMuted/30 bg-pearlWarm/30 p-3 text-sm leading-relaxed text-ink focus:border-emeraldSoft focus:outline-none"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink/70">Handle Instagram</label>
                <input
                  type="text"
                  value={storeForm.instagramHandle || ''}
                  onChange={(e) => setStoreForm({ ...storeForm, instagramHandle: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-goldMuted/30 bg-pearlWarm/30 p-3 text-sm font-semibold text-ink focus:border-emeraldSoft focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink/70">URL Instagram</label>
                <input
                  type="url"
                  value={storeForm.instagram || ''}
                  onChange={(e) => setStoreForm({ ...storeForm, instagram: e.target.value })}
                  placeholder="https://instagram.com/..."
                  className="mt-1.5 w-full rounded-xl border border-goldMuted/30 bg-pearlWarm/30 p-3 text-sm font-semibold text-ink focus:border-emeraldSoft focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink/70">Email Customer Care</label>
                <input
                  type="email"
                  value={storeForm.email || ''}
                  onChange={(e) => setStoreForm({ ...storeForm, email: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-goldMuted/30 bg-pearlWarm/30 p-3 text-sm font-semibold text-ink focus:border-emeraldSoft focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-goldMuted/25 bg-white p-6 sm:p-8 shadow-sm">
          <h3 className="font-display text-xl font-bold text-ink">
            {isSupabaseConfigured ? 'Ganti Password Akun Admin' : 'Ganti PIN / Password Admin'}
          </h3>
          <p className="mt-1 text-xs text-ink/60">
            Kosongkan jika tidak ingin mengubah {isSupabaseConfigured ? 'password' : 'PIN'} saat ini.
          </p>
          <div className="mt-4 max-w-sm">
            <input
              type="password"
              value={newSecret}
              onChange={(e) => setNewSecret(e.target.value)}
              placeholder={isSupabaseConfigured ? 'Masukkan password baru (min. 6 karakter)...' : 'Masukkan PIN baru...'}
              className="w-full rounded-xl border border-goldMuted/30 bg-pearlWarm/30 p-3 text-sm font-semibold text-ink focus:border-emeraldSoft focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-full bg-emeraldSoft px-8 py-3.5 text-sm font-bold text-pearl shadow-emerald transition hover:bg-emeraldDeep"
        >
          <Save size={18} />
          Simpan Semua Pengaturan
        </button>
      </form>
    </div>
  );
}
