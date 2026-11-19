import { Clock, Download, RotateCcw, Upload } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export default function BackupTab({ showToast }) {
  const { isSupabaseConfigured, products, promoCodes, auditLogs, exportData, importData, resetToDefaults } = useStore();

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const res = importData(event.target?.result);
      if (res.success) {
        showToast('Data backup berhasil dipulihkan!');
      } else {
        showToast(`Gagal impor: ${res.error}`, 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="max-w-4xl">
      <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink">Backup, Pemulihan & Audit Log</h2>
      <p className="text-xs sm:text-sm text-ink/65">
        Simpan seluruh data produk, kode promo, konfigurasi toko, serta jejak perubahan admin sebagai file cadangan.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col justify-between rounded-3xl border border-goldMuted/25 bg-white p-6 sm:p-8 shadow-sm">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-champagne/30 text-emeraldInk">
              <Download size={24} />
            </div>
            <h3 className="mt-4 font-display text-xl font-bold text-ink">Download Backup Data</h3>
            <p className="mt-2 text-xs sm:text-sm text-ink/65 leading-relaxed">
              Unduh file JSON yang berisi {products.length} produk, {promoCodes.length} voucher promo, pengaturan toko, banner, dan {auditLogs.length} catatan audit.
            </p>
          </div>

          <button
            type="button"
            onClick={exportData}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-emeraldSoft px-6 py-3 text-xs sm:text-sm font-bold text-pearl shadow-emerald transition hover:bg-emeraldDeep"
          >
            <Download size={16} />
            Download Backup (JSON)
          </button>
        </div>

        <div className="flex flex-col justify-between rounded-3xl border border-goldMuted/25 bg-white p-6 sm:p-8 shadow-sm">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-champagne/30 text-emeraldInk">
              <Upload size={24} />
            </div>
            <h3 className="mt-4 font-display text-xl font-bold text-ink">Pulihkan dari Backup</h3>
            <p className="mt-2 text-xs sm:text-sm text-ink/65 leading-relaxed">
              Unggah file backup JSON yang sebelumnya Anda download. Data akan divalidasi otomatis sebelum diterapkan.
            </p>
          </div>

          <label className="mt-6 inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-goldMuted/40 bg-pearlWarm/60 px-6 py-3 text-xs sm:text-sm font-bold text-ink shadow-sm transition hover:bg-white hover:border-goldMuted">
            <Upload size={16} />
            Pilih File Backup JSON
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Audit Trail Log */}
      <div className="mt-8 rounded-3xl border border-goldMuted/25 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Clock size={18} className="text-goldMuted" />
            <h3 className="font-display text-xl font-bold text-ink">
              {isSupabaseConfigured ? 'Riwayat Perubahan (Audit Trail Server)' : 'Riwayat Perubahan (Audit Trail Lokal)'}
            </h3>
          </div>
          <span className="text-xs font-semibold text-ink/50">{auditLogs.length} catatan terbaru</span>
        </div>

        {auditLogs.length === 0 ? (
          <p className="mt-4 text-xs text-ink/55">Belum ada perubahan yang tercatat.</p>
        ) : (
          <div className="mt-4 max-h-64 overflow-y-auto divide-y divide-goldMuted/15 text-xs">
            {auditLogs.slice(0, 30).map((log) => (
              <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="rounded-md bg-pearlWarm px-2 py-0.5 font-mono text-[10px] font-bold text-emeraldInk border border-goldMuted/20 shrink-0">
                    {log.action}
                  </span>
                  <span className="font-bold text-ink truncate">{log.target}</span>
                  <span className="text-ink/65 truncate">— {log.summary}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {log.actorEmail && <span className="text-[10px] font-semibold text-goldMuted">{log.actorEmail}</span>}
                  <span className="text-[11px] text-ink/45 font-mono">
                    {new Date(log.timestamp).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Factory Reset Card */}
      <div className="mt-8 rounded-3xl border border-roseClay/30 bg-roseClay/5 p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-roseClay/20 text-roseClay">
            <RotateCcw size={20} />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-roseClay">Reset ke Pengaturan Bawaan Toko</h3>
            <p className="mt-1 text-xs text-ink/70">
              Kembalikan seluruh produk, voucher promo, nomor kontak, dan banner ke pengaturan awal pabrik.
            </p>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('PERINGATAN: Apakah Anda yakin ingin mereset seluruh data toko ke pengaturan bawaan?')) {
                  resetToDefaults();
                  showToast('Data toko telah direset ke bawaan.');
                }
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-roseClay/40 bg-white px-5 py-2.5 text-xs font-bold text-roseClay shadow-sm transition hover:bg-roseClay hover:text-white"
            >
              <RotateCcw size={14} />
              Reset Data ke Default
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
