import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Globe,
  Layers,
  LogOut,
  Megaphone,
  Package,
  Settings,
  Ticket
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useStore } from '../context/StoreContext';
import AdminLogin from './admin/AdminLogin';
import BackupTab from './admin/BackupTab';
import BannerTab from './admin/BannerTab';
import ProductsTab from './admin/ProductsTab';
import PromoCodesTab from './admin/PromoCodesTab';
import StoreSettingsTab from './admin/StoreSettingsTab';

export default function AdminPortal({ onBackToWebsite }) {
  const { isSupabaseConfigured, authUser, isAdmin, authLoading, signOutAdmin, products, promoCodes } = useStore();

  const [localAuthenticated, setLocalAuthenticated] = useState(
    () => !isSupabaseConfigured && sessionStorage.getItem('kheyr_admin_auth') === 'true'
  );
  const [activeTab, setActiveTab] = useState('products');
  const [toastMessage, setToastMessage] = useState(null);
  const toastTimerRef = useRef(null);

  const isAuthenticated = isSupabaseConfigured ? isAdmin : localAuthenticated;

  const showToast = useCallback((text, type = 'success') => {
    setToastMessage({ text, type });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 3500);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      await signOutAdmin();
    } else {
      setLocalAuthenticated(false);
      sessionStorage.removeItem('kheyr_admin_auth');
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-emeraldInk text-sm font-semibold text-champagne">
        Memeriksa sesi admin...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AdminLogin
        onAuthenticated={() => {
          if (!isSupabaseConfigured) setLocalAuthenticated(true);
          showToast('Selamat datang di Portal Admin KHEYR!');
        }}
        onBackToWebsite={onBackToWebsite}
      />
    );
  }

  const tabs = [
    { id: 'products', label: `Koleksi Produk (${products.length})`, Icon: Package },
    { id: 'promocodes', label: `Kode Promo & Voucher (${promoCodes.length})`, Icon: Ticket },
    { id: 'store', label: 'Pengaturan Toko & Kontak', Icon: Settings },
    { id: 'promo', label: 'Banner Top Bar', Icon: Megaphone },
    { id: 'backup', label: 'Backup & Audit Log', Icon: Layers }
  ];

  return (
    <div className="min-h-screen bg-mist/60 text-ink pb-20">
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl px-5 py-3.5 text-xs sm:text-sm font-bold text-white shadow-2xl animate-floatIn ${
            toastMessage.type === 'error' ? 'bg-roseClay' : 'bg-emeraldSoft'
          }`}
        >
          {toastMessage.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      <header className="sticky top-0 z-40 border-b border-champagne/30 bg-emeraldInk text-pearl shadow-emerald">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="font-display text-2xl font-bold text-champagne">KHEYR</span>
            <span className="rounded-full bg-champagne/20 px-3 py-0.5 text-xs font-bold text-champagne border border-champagne/30">
              CMS Admin Panel
            </span>
            {authUser?.email && (
              <span className="hidden md:inline-block text-xs text-pearl/70 font-mono">
                {authUser.email}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToWebsite}
              className="inline-flex items-center gap-1.5 rounded-full border border-champagne/30 bg-champagne/10 px-4 py-1.5 text-xs font-bold text-pearl transition hover:bg-champagne hover:text-emeraldInk"
            >
              <Globe size={14} />
              <span className="hidden sm:inline">Lihat Website</span> Publik
              <ExternalLink size={13} />
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-full bg-roseClay/80 px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-roseClay"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 sm:px-6 lg:px-8 border-t border-champagne/15 py-2">
          {tabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition whitespace-nowrap ${
                activeTab === id
                  ? 'bg-champagne text-emeraldInk shadow-md'
                  : 'text-pearl/80 hover:bg-champagne/15 hover:text-pearl'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        {activeTab === 'products' && <ProductsTab showToast={showToast} />}
        {activeTab === 'promocodes' && <PromoCodesTab showToast={showToast} />}
        {activeTab === 'store' && <StoreSettingsTab showToast={showToast} />}
        {activeTab === 'promo' && <BannerTab showToast={showToast} />}
        {activeTab === 'backup' && <BackupTab showToast={showToast} />}
      </main>
    </div>
  );
}
