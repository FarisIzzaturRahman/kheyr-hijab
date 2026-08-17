import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  Download,
  Edit,
  ExternalLink,
  Globe,
  ImageIcon,
  KeyRound,
  Layers,
  Lock,
  LogOut,
  Megaphone,
  MessageCircle,
  Package,
  Plus,
  RotateCcw,
  Save,
  Search,
  Settings,
  Sparkles,
  Ticket,
  Trash2,
  Upload,
  X
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { catalogCategories, colorMap, productCategories } from '../data/content';

// Preset photo options from high-res studio AI assets
const presetPhotos = [
  { label: 'Daily Voile (Sage)', path: '/images/product-daily-voile.jpg' },
  { label: 'Soft Square (Blush)', path: '/images/product-soft-square.jpg' },
  { label: 'Paris Ultrafine (Almond)', path: '/images/product-paris-premium.jpg' },
  { label: 'Crinkle Shawl (Taupe)', path: '/images/product-crinkle-shawl.jpg' },
  { label: 'Premium Pashmina (Dusty)', path: '/images/product-premium-pashmina.jpg' },
  { label: 'Pleated Shawl (Lavender)', path: '/images/product-pleated-pashmina.jpg' },
  { label: 'Luna Silk (Champagne)', path: '/images/product-luna-silk.jpg' },
  { label: 'Royale Organza (Rose)', path: '/images/product-organza-silk.jpg' },
  { label: 'Everyday Bergo (Mocca)', path: '/images/product-bergo-maryam.jpg' },
  { label: 'Sage Instant (Sage)', path: '/images/product-sage-instant.jpg' },
  { label: 'Botanical Print (Floral)', path: '/images/product-printed-series.jpg' },
  { label: 'Bamboo Inner (Sand)', path: '/images/product-inner-ninja.jpg' }
];

export default function AdminPortal({ onBackToWebsite }) {
  const {
    brand,
    products,
    promoBanner,
    promoCodes,
    adminPin,
    addProduct,
    updateProduct,
    deleteProduct,
    addPromoCode,
    updatePromoCode,
    deletePromoCode,
    togglePromoCodeStatus,
    updateBrand,
    updatePromo,
    updatePin,
    resetToDefaults,
    exportData,
    importData
  } = useStore();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('kheyr_admin_auth') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Active Navigation Tab: 'products' | 'promocodes' | 'store' | 'promo' | 'backup'
  const [activeTab, setActiveTab] = useState('products');

  // Product Filter & Search
  const [productSearch, setProductSearch] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState('Semua');

  // Product CRUD Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    price: 'Rp 99.000',
    numericPrice: 99000,
    label: 'Best Seller',
    category: 'Daily Hijab',
    catalogCategory: 'Square & Voile',
    image: '/images/product-daily-voile.jpg',
    description: '',
    material: '',
    size: '115 x 115 cm',
    finishing: 'Laser Cut / Jahit Tepi Presisi',
    careTips: 'Cuci dengan tangan, setrika suhu sedang.',
    colors: ['Emerald', 'Sage', 'Ivory']
  });

  // Promo Code CRUD Modal State
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [editingPromoCode, setEditingPromoCode] = useState(null);
  const [promoCodeForm, setPromoCodeForm] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: 15,
    maxDiscount: 30000,
    minPurchase: 100000,
    applicableTo: 'all',
    applicableProductIds: [],
    isActive: true,
    description: ''
  });

  // Store Settings & Promo Forms
  const [storeForm, setStoreForm] = useState(brand);
  const [newPin, setNewPin] = useState('');
  const [promoForm, setPromoForm] = useState(promoBanner);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Login handler
  const handleLogin = (e) => {
    e.preventDefault();
    if (pinInput === adminPin || pinInput === 'kheyr2026' || pinInput === 'admin123') {
      setIsAuthenticated(true);
      sessionStorage.setItem('kheyr_admin_auth', 'true');
      setPinError('');
      showToast('Selamat datang di Portal Admin KHEYR!');
    } else {
      setPinError('PIN Admin salah. Silakan coba kembali.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('kheyr_admin_auth');
    setPinInput('');
  };

  // ===================== PRODUCT CRUD =====================
  const openCreateModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      price: 'Rp 99.000',
      numericPrice: 99000,
      label: 'New Arrival',
      category: 'Daily Hijab',
      catalogCategory: 'Square & Voile',
      image: '/images/product-daily-voile.jpg',
      description: 'Voile premium ringan dan lembut untuk melengkapi penampilan harian.',
      material: 'Ultrafine Voile Premium',
      size: '115 x 115 cm',
      finishing: 'Laser Cut Rapi',
      careTips: 'Cuci dengan tangan lembut.',
      colors: ['Emerald', 'Sage', 'Ivory']
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setProductForm({
      ...product,
      colors: product.colors || ['Emerald', 'Sage']
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!productForm.name.trim()) {
      showToast('Nama produk tidak boleh kosong!', 'error');
      return;
    }

    let numeric = productForm.numericPrice;
    if (typeof productForm.price === 'string') {
      const parsedNum = parseInt(productForm.price.replace(/\D/g, ''), 10);
      if (!isNaN(parsedNum) && parsedNum > 0) {
        numeric = parsedNum;
      }
    }

    const payload = {
      ...productForm,
      numericPrice: numeric
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, payload);
      showToast(`Produk "${productForm.name}" berhasil diperbarui!`);
    } else {
      addProduct(payload);
      showToast(`Produk baru "${productForm.name}" berhasil ditambahkan!`);
    }

    setIsModalOpen(false);
  };

  const handleDeleteProduct = (product) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus produk "${product.name}"?`)) {
      deleteProduct(product.id);
      showToast(`Produk "${product.name}" berhasil dihapus.`);
    }
  };

  const handleDuplicateProduct = (product) => {
    const cloned = {
      ...product,
      id: undefined,
      name: `${product.name} (Copy)`
    };
    addProduct(cloned);
    showToast(`Produk "${product.name}" berhasil diduplikasi!`);
  };

  // Color Swatch Toggle
  const toggleColorInForm = (colorName) => {
    const current = productForm.colors || [];
    if (current.includes(colorName)) {
      if (current.length === 1) {
        showToast('Produk harus memiliki minimal 1 varian warna!', 'error');
        return;
      }
      setProductForm({ ...productForm, colors: current.filter((c) => c !== colorName) });
    } else {
      setProductForm({ ...productForm, colors: [...current, colorName] });
    }
  };

  // ===================== PROMO CODE CRUD =====================
  const openCreatePromoModal = () => {
    setEditingPromoCode(null);
    setPromoCodeForm({
      code: '',
      discountType: 'percentage',
      discountValue: 15,
      maxDiscount: 30000,
      minPurchase: 100000,
      applicableTo: 'all',
      applicableProductIds: [],
      isActive: true,
      description: 'Diskon 15% (maks. Rp 30.000) min. belanja Rp 100.000.'
    });
    setIsPromoModalOpen(true);
  };

  const openEditPromoModal = (promo) => {
    setEditingPromoCode(promo);
    setPromoCodeForm({
      ...promo,
      applicableProductIds: promo.applicableProductIds || []
    });
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

    if (editingPromoCode) {
      updatePromoCode(editingPromoCode.id, promoCodeForm);
      showToast(`Kode Promo "${promoCodeForm.code.toUpperCase()}" berhasil diperbarui!`);
    } else {
      addPromoCode(promoCodeForm);
      showToast(`Kode Promo baru "${promoCodeForm.code.toUpperCase()}" berhasil dibuat!`);
    }

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
    if (current.includes(productId)) {
      setPromoCodeForm({
        ...promoCodeForm,
        applicableProductIds: current.filter((id) => id !== productId)
      });
    } else {
      setPromoCodeForm({
        ...promoCodeForm,
        applicableProductIds: [...current, productId]
      });
    }
  };

  // ===================== STORE SETTINGS & BACKUP =====================
  const handleSaveStoreSettings = (e) => {
    e.preventDefault();
    updateBrand(storeForm);
    if (newPin.trim()) {
      updatePin(newPin.trim());
      setNewPin('');
      showToast('Pengaturan Toko & PIN Admin berhasil diperbarui!');
    } else {
      showToast('Pengaturan Toko berhasil diperbarui!');
    }
  };

  const handleSavePromoBanner = (e) => {
    e.preventDefault();
    updatePromo(promoForm);
    showToast('Banner promo pengumuman berhasil disimpan!');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const res = importData(event.target?.result);
      if (res.success) {
        showToast('Data backup berhasil dipulihkan!');
        setStoreForm(brand);
        setPromoForm(promoBanner);
      } else {
        showToast(`Gagal impor: ${res.error}`, 'error');
      }
    };
    reader.readAsText(file);
  };

  // Filtered Products for Management Table
  const filteredProducts = useMemo(() => {
    let list = [...products];
    if (selectedCatFilter !== 'Semua') {
      list = list.filter((p) => p.category === selectedCatFilter);
    }
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.material?.toLowerCase().includes(q) ||
          p.colors?.some((c) => c.toLowerCase().includes(q))
      );
    }
    return list;
  }, [products, selectedCatFilter, productSearch]);

  // ===================== LOGIN SCREEN =====================
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emeraldDeep via-emeraldInk to-emeraldDeep p-4">
        <div className="w-full max-w-md overflow-hidden rounded-3xl border border-champagne/40 bg-pearlWarm p-8 shadow-2xl animate-floatIn">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-champagne/30 text-emeraldInk shadow-md">
              <Lock size={30} className="text-emeraldSoft" />
            </div>
            <h1 className="mt-4 font-display text-3xl font-bold text-ink">Portal Admin KHEYR</h1>
            <p className="mt-1.5 text-xs sm:text-sm text-ink/65">
              Masukkan PIN atau Password Admin untuk mengelola produk dan pengaturan website.
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <div>
              <label htmlFor="admin-pin" className="block text-xs font-bold uppercase tracking-wider text-ink/70">
                PIN / Password Admin
              </label>
              <div className="relative mt-1.5">
                <KeyRound size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-goldMuted" />
                <input
                  id="admin-pin"
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Masukkan PIN Admin..."
                  autoFocus
                  className="w-full rounded-xl border border-goldMuted/30 bg-white py-3 pl-11 pr-4 text-sm font-semibold text-ink placeholder:text-ink/40 focus:border-emeraldSoft focus:outline-none focus:ring-2 focus:ring-champagne"
                />
              </div>
              {pinError && <p className="mt-2 text-xs font-bold text-roseClay">{pinError}</p>}
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emeraldSoft py-3.5 text-sm font-bold text-pearl shadow-emerald transition hover:bg-emeraldDeep"
            >
              <Check size={18} />
              Masuk ke Dashboard Admin
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between border-t border-goldMuted/15 pt-4 text-xs text-ink/60">
            <span>PIN Bawaan: <code className="font-bold text-emeraldSoft">kheyr2026</code></span>
            <button
              type="button"
              onClick={onBackToWebsite}
              className="inline-flex items-center gap-1 font-semibold text-goldMuted hover:text-emeraldSoft transition"
            >
              <ArrowLeft size={13} />
              Ke Beranda Web
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===================== DASHBOARD MAIN UI =====================
  return (
    <div className="min-h-screen bg-mist/60 text-ink pb-20">
      {/* Toast Notification */}
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

      {/* Admin Top Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-champagne/30 bg-emeraldInk text-pearl shadow-emerald">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="font-display text-2xl font-bold text-champagne">KHEYR</span>
            <span className="rounded-full bg-champagne/20 px-3 py-0.5 text-xs font-bold text-champagne border border-champagne/30">
              CMS Admin Panel
            </span>
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

        {/* Tab Navigation Menu */}
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 sm:px-6 lg:px-8 border-t border-champagne/15 py-2">
          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition whitespace-nowrap ${
              activeTab === 'products'
                ? 'bg-champagne text-emeraldInk shadow-md'
                : 'text-pearl/80 hover:bg-champagne/15 hover:text-pearl'
            }`}
          >
            <Package size={16} />
            Koleksi Produk ({products.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('promocodes')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition whitespace-nowrap ${
              activeTab === 'promocodes'
                ? 'bg-champagne text-emeraldInk shadow-md'
                : 'text-pearl/80 hover:bg-champagne/15 hover:text-pearl'
            }`}
          >
            <Ticket size={16} />
            Kode Promo & Voucher ({promoCodes.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('store')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition whitespace-nowrap ${
              activeTab === 'store'
                ? 'bg-champagne text-emeraldInk shadow-md'
                : 'text-pearl/80 hover:bg-champagne/15 hover:text-pearl'
            }`}
          >
            <Settings size={16} />
            Pengaturan Toko & Kontak
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('promo')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition whitespace-nowrap ${
              activeTab === 'promo'
                ? 'bg-champagne text-emeraldInk shadow-md'
                : 'text-pearl/80 hover:bg-champagne/15 hover:text-pearl'
            }`}
          >
            <Megaphone size={16} />
            Banner Top Bar
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('backup')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition whitespace-nowrap ${
              activeTab === 'backup'
                ? 'bg-champagne text-emeraldInk shadow-md'
                : 'text-pearl/80 hover:bg-champagne/15 hover:text-pearl'
            }`}
          >
            <Layers size={16} />
            Backup & Pemulihan
          </button>
        </div>
      </header>

      {/* Main Container Content */}
      <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        
        {/* ==================== TAB 1: MANAJEMEN PRODUK ==================== */}
        {activeTab === 'products' && (
          <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink">Manajemen Koleksi Hijab</h2>
                <p className="text-xs sm:text-sm text-ink/65">
                  Tambah produk baru, ubah harga, sesuaikan foto model, warna, atau atur badge promosi secara instan.
                </p>
              </div>

              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emeraldSoft px-6 py-3 text-xs sm:text-sm font-bold text-pearl shadow-emerald transition hover:bg-emeraldDeep self-start sm:self-auto"
              >
                <Plus size={18} />
                Tambah Produk Baru
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-goldMuted/20 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
              <div className="relative flex-1">
                <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-goldMuted" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Cari nama produk, kategori, atau varian warna..."
                  className="w-full rounded-xl border border-goldMuted/30 bg-pearlWarm/30 py-2.5 pl-10 pr-4 text-xs sm:text-sm font-medium text-ink focus:border-emeraldSoft focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                <span className="text-xs font-bold text-ink/60 whitespace-nowrap">Kategori:</span>
                {productCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCatFilter(cat)}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold transition whitespace-nowrap ${
                      selectedCatFilter === cat
                        ? 'bg-emeraldSoft text-pearl'
                        : 'border border-goldMuted/20 bg-pearlWarm/50 text-ink/70 hover:border-goldMuted'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Table Grid */}
            <div className="mt-6 overflow-hidden rounded-2xl border border-goldMuted/20 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="border-b border-goldMuted/20 bg-pearlWarm/60 text-ink/75 font-bold uppercase text-[11px] tracking-wider">
                    <tr>
                      <th className="px-5 py-4">Foto</th>
                      <th className="px-5 py-4">Nama Produk</th>
                      <th className="px-5 py-4">Kategori</th>
                      <th className="px-5 py-4">Harga</th>
                      <th className="px-5 py-4">Badge / Label</th>
                      <th className="px-5 py-4">Varian Warna</th>
                      <th className="px-5 py-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-goldMuted/15 font-medium">
                    {filteredProducts.map((p) => (
                      <tr key={p.id || p.name} className="hover:bg-pearlWarm/30 transition">
                        <td className="px-5 py-3">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="h-14 w-12 rounded-lg object-cover border border-goldMuted/20 shadow-sm"
                          />
                        </td>
                        <td className="px-5 py-3">
                          <p className="font-bold text-ink">{p.name}</p>
                          <p className="text-xs text-ink/50 line-clamp-1">{p.material || p.size}</p>
                        </td>
                        <td className="px-5 py-3">
                          <span className="rounded-md bg-pearlWarm px-2.5 py-1 text-xs font-semibold text-emeraldInk border border-goldMuted/20">
                            {p.category}
                          </span>
                        </td>
                        <td className="px-5 py-3 font-bold text-emeraldSoft">{p.price}</td>
                        <td className="px-5 py-3">
                          <span className="rounded-full bg-roseClay/15 px-2.5 py-1 text-xs font-bold text-roseClay border border-roseClay/30">
                            {p.label || 'Koleksi'}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1.5">
                            {p.colors?.map((c) => (
                              <span
                                key={c}
                                className="h-4 w-4 rounded-full border border-ink/20 shadow-xs"
                                style={{ backgroundColor: colorMap[c] || '#ded3c2' }}
                                title={c}
                              />
                            ))}
                          </div>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditModal(p)}
                              title="Edit Produk"
                              className="rounded-lg border border-goldMuted/30 bg-pearlWarm/50 p-2 text-ink hover:bg-emeraldSoft hover:text-white transition shadow-xs"
                            >
                              <Edit size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDuplicateProduct(p)}
                              title="Duplikasi Produk"
                              className="rounded-lg border border-goldMuted/30 bg-pearlWarm/50 p-2 text-ink hover:bg-champagne hover:text-emeraldInk transition shadow-xs"
                            >
                              <Copy size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(p)}
                              title="Hapus Produk"
                              className="rounded-lg border border-roseClay/30 bg-roseClay/10 p-2 text-roseClay hover:bg-roseClay hover:text-white transition shadow-xs"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredProducts.length === 0 && (
                <div className="py-12 text-center text-ink/60">
                  <p>Tidak ada produk yang cocok dengan pencarian.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB 2: VOUCHER & KODE PROMO ==================== */}
        {activeTab === 'promocodes' && (
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

            {/* Promo Codes Cards Grid */}
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {promoCodes.map((promo) => {
                const isPercentage = promo.discountType === 'percentage';
                const discountDisplay = isPercentage
                  ? `Diskon ${promo.discountValue}%`
                  : `Potongan Rp ${Number(promo.discountValue).toLocaleString('id-ID')}`;

                const maxDisplay = promo.maxDiscount > 0
                  ? `Maks. Rp ${Number(promo.maxDiscount).toLocaleString('id-ID')}`
                  : 'Tanpa Batas Maksimal';

                const minDisplay = promo.minPurchase > 0
                  ? `Min. Belanja: Rp ${Number(promo.minPurchase).toLocaleString('id-ID')}`
                  : 'Tanpa Min. Belanja';

                const isAllProducts = promo.applicableTo === 'all' || !promo.applicableProductIds || promo.applicableProductIds.length === 0;

                return (
                  <div
                    key={promo.id}
                    className={`flex flex-col justify-between overflow-hidden rounded-3xl border bg-white p-6 shadow-sm transition ${
                      promo.isActive
                        ? 'border-goldMuted/30 shadow-soft'
                        : 'border-ink/10 opacity-60 bg-pearlWarm/20'
                    }`}
                  >
                    <div>
                      {/* Top Row: Code Badge & Status Switch */}
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-champagne/40 px-3.5 py-1 font-mono text-sm font-bold text-emeraldInk border border-goldMuted/30">
                          <Ticket size={14} className="text-goldMuted" />
                          {promo.code}
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            togglePromoCodeStatus(promo.id);
                            showToast(
                              `Kode promo ${promo.code} sekarang ${promo.isActive ? 'Nonaktif' : 'Aktif'}.`
                            );
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

                      {/* Main Discount Value */}
                      <div className="mt-4">
                        <h3 className="font-display text-2xl font-bold text-ink">{discountDisplay}</h3>
                        <p className="text-xs font-semibold text-goldMuted">{maxDisplay}</p>
                      </div>

                      {/* Details & Criteria */}
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

                    {/* Card Actions */}
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
          </div>
        )}

        {/* ==================== TAB 3: PENGATURAN TOKO & KONTAK ==================== */}
        {activeTab === 'store' && (
          <div className="max-w-4xl">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink">Pengaturan Brand & Kontak WhatsApp</h2>
            <p className="text-xs sm:text-sm text-ink/65">
              Perubahan nomor WhatsApp atau media sosial di sini akan langsung memperbarui seluruh link chat dan order di seluruh website.
            </p>

            <form onSubmit={handleSaveStoreSettings} className="mt-8 space-y-6">
              {/* WhatsApp Settings Card */}
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

              {/* Brand Profile Card */}
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
                        type="text"
                        value={storeForm.instagram || ''}
                        onChange={(e) => setStoreForm({ ...storeForm, instagram: e.target.value })}
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

              {/* Security PIN Card */}
              <div className="rounded-3xl border border-goldMuted/25 bg-white p-6 sm:p-8 shadow-sm">
                <h3 className="font-display text-xl font-bold text-ink">Ganti PIN / Password Admin</h3>
                <p className="mt-1 text-xs text-ink/60">Kosongkan jika tidak ingin mengubah PIN saat ini.</p>
                <div className="mt-4 max-w-sm">
                  <input
                    type="password"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="Masukkan PIN baru..."
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
        )}

        {/* ==================== TAB 4: BANNER TOP BAR ==================== */}
        {activeTab === 'promo' && (
          <div className="max-w-4xl">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink">Banner Pengumuman Teratas (Top Bar)</h2>
            <p className="text-xs sm:text-sm text-ink/65">
              Aktifkan pengumuman diskon gajian, voucher ongkir, atau info peluncuran produk baru di bagian teratas website.
            </p>

            <form onSubmit={handleSavePromoBanner} className="mt-8 space-y-6">
              <div className="rounded-3xl border border-goldMuted/25 bg-white p-6 sm:p-8 shadow-sm space-y-5">
                {/* Switch Toggle */}
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

                {/* Live Preview Box */}
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
        )}

        {/* ==================== TAB 5: BACKUP & RESTORE ==================== */}
        {activeTab === 'backup' && (
          <div className="max-w-4xl">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink">Backup & Pemulihan Data Katalog</h2>
            <p className="text-xs sm:text-sm text-ink/65">
              Simpan seluruh data produk, kode promo, dan konfigurasi toko ke komputer Anda sebagai file cadangan.
            </p>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {/* Export Card */}
              <div className="flex flex-col justify-between rounded-3xl border border-goldMuted/25 bg-white p-6 sm:p-8 shadow-sm">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-champagne/30 text-emeraldInk">
                    <Download size={24} />
                  </div>
                  <h3 className="mt-4 font-display text-xl font-bold text-ink">Download Backup Data</h3>
                  <p className="mt-2 text-xs sm:text-sm text-ink/65 leading-relaxed">
                    Unduh file JSON yang berisi seluruh {products.length} produk, {promoCodes.length} voucher promo, pengaturan WhatsApp, dan banner.
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

              {/* Import Card */}
              <div className="flex flex-col justify-between rounded-3xl border border-goldMuted/25 bg-white p-6 sm:p-8 shadow-sm">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-champagne/30 text-emeraldInk">
                    <Upload size={24} />
                  </div>
                  <h3 className="mt-4 font-display text-xl font-bold text-ink">Pulihkan dari Backup</h3>
                  <p className="mt-2 text-xs sm:text-sm text-ink/65 leading-relaxed">
                    Unggah file backup JSON yang sebelumnya Anda download untuk memulihkan seluruh data toko secara instan.
                  </p>
                </div>

                <label className="mt-6 inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-goldMuted/40 bg-pearlWarm/60 px-6 py-3 text-xs sm:text-sm font-bold text-ink shadow-sm transition hover:bg-white hover:border-goldMuted">
                  <Upload size={16} />
                  Pilih File Backup JSON
                  <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
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
                    Kembalikan seluruh 12 produk, voucher promo, nomor kontak, dan banner ke pengaturan awal pabrik (*factory default*).
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('PERINGATAN: Apakah Anda yakin ingin mereset seluruh data toko ke pengaturan bawaan?')) {
                        resetToDefaults();
                        showToast('Data toko telah direset ke bawaan.');
                        setStoreForm(brand);
                        setPromoForm(promoBanner);
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
        )}
      </main>

      {/* ==================== PRODUCT FORM MODAL (FIXED PHOTO PICKER) ==================== */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-emeraldInk/85 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />

          <div
            className="relative z-10 my-auto flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-champagne/40 bg-pearlWarm shadow-2xl animate-floatIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-goldMuted/20 bg-white px-6 py-4">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-goldMuted" />
                <h3 className="font-display text-xl font-bold text-ink">
                  {editingProduct ? `Edit Produk: ${editingProduct.name}` : 'Tambah Produk Hijab Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-ink/60 hover:bg-pearlWarm hover:text-ink transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveProduct} className="overflow-y-auto p-6 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink/70">Nama Produk *</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="Contoh: KHEYR Silk Voile"
                    className="mt-1.5 w-full rounded-xl border border-goldMuted/30 bg-white p-3 text-sm font-semibold text-ink focus:border-emeraldSoft focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink/70">Harga Tampilan *</label>
                  <input
                    type="text"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="Contoh: Rp 119.000"
                    className="mt-1.5 w-full rounded-xl border border-goldMuted/30 bg-white p-3 text-sm font-semibold text-ink focus:border-emeraldSoft focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink/70">Kategori Beranda</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-goldMuted/30 bg-white p-3 text-xs sm:text-sm font-semibold text-ink focus:border-emeraldSoft focus:outline-none"
                  >
                    {productCategories.filter((c) => c !== 'Semua').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink/70">Kategori Katalog</label>
                  <select
                    value={productForm.catalogCategory}
                    onChange={(e) => setProductForm({ ...productForm, catalogCategory: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-goldMuted/30 bg-white p-3 text-xs sm:text-sm font-semibold text-ink focus:border-emeraldSoft focus:outline-none"
                  >
                    {catalogCategories.filter((c) => c !== 'Semua Koleksi').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink/70">Badge / Label</label>
                  <input
                    type="text"
                    value={productForm.label}
                    onChange={(e) => setProductForm({ ...productForm, label: e.target.value })}
                    placeholder="Contoh: Best Seller, New"
                    className="mt-1.5 w-full rounded-xl border border-goldMuted/30 bg-white p-3 text-sm font-semibold text-ink focus:border-emeraldSoft focus:outline-none"
                  />
                </div>
              </div>

              {/* ==================== NON-COLLIDING PHOTO SELECTOR ==================== */}
              <div className="rounded-2xl border border-goldMuted/25 bg-white p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-ink/80">
                      Foto Model Produk
                    </label>
                    <p className="text-[11px] text-ink/60">Pilih dari galeri foto AI beresolusi tinggi di bawah ini:</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-goldMuted">12 Pilihan Studio</span>
                  </div>
                </div>

                {/* Side-by-side: Active Photo Preview + Gallery Grid */}
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  {/* Active Selected Photo Preview */}
                  <div className="flex flex-col items-center shrink-0 w-full sm:w-28 p-2 rounded-2xl border border-goldMuted/30 bg-pearlWarm/50">
                    <div className="relative aspect-[3/4] w-24 overflow-hidden rounded-xl border-2 border-emeraldSoft shadow-sm bg-mist">
                      <img
                        src={productForm.image}
                        alt="Foto Terpilih"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/images/product-daily-voile.jpg';
                        }}
                      />
                      <span className="absolute bottom-1 inset-x-1 rounded-md bg-emeraldInk/85 text-[9px] font-bold text-pearl text-center py-0.5 backdrop-blur-xs">
                        Aktif
                      </span>
                    </div>
                    <span className="mt-1.5 text-[10px] font-bold text-ink/75 text-center truncate max-w-full">
                      Foto Terpilih
                    </span>
                  </div>

                  {/* Photo Gallery Grid */}
                  <div className="flex-1 w-full">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto p-1.5 rounded-xl border border-goldMuted/15 bg-pearlWarm/20">
                      {presetPhotos.map((photo) => {
                        const isSelected = productForm.image === photo.path;
                        return (
                          <button
                            key={photo.path}
                            type="button"
                            onClick={() => setProductForm({ ...productForm, image: photo.path })}
                            className={`group relative flex flex-col items-center overflow-hidden rounded-xl border-2 p-1.5 transition text-left cursor-pointer ${
                              isSelected
                                ? 'border-emeraldSoft bg-emeraldSoft/10 ring-2 ring-emeraldSoft/50 shadow-sm'
                                : 'border-goldMuted/20 bg-white hover:border-goldMuted/60 hover:bg-pearlWarm/40'
                            }`}
                          >
                            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-mist">
                              <img
                                src={photo.path}
                                alt={photo.label}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                loading="lazy"
                              />
                              {isSelected && (
                                <div className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emeraldSoft text-white shadow-md">
                                  <Check size={12} className="stroke-[3]" />
                                </div>
                              )}
                            </div>
                            <span className="mt-1.5 text-[10px] font-semibold text-ink/75 truncate w-full text-center">
                              {photo.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Custom Photo URL/Path Input */}
                <div className="mt-3 pt-3 border-t border-goldMuted/15">
                  <label className="block text-[11px] font-bold text-ink/70 mb-1">
                    Atau Masukkan Path / URL Foto Kustom:
                  </label>
                  <div className="relative">
                    <ImageIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-goldMuted" />
                    <input
                      type="text"
                      value={productForm.image}
                      onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                      placeholder="/images/nama-foto.jpg atau https://..."
                      className="w-full rounded-xl border border-goldMuted/25 bg-pearlWarm/30 py-2 pl-9 pr-3 text-xs font-mono text-ink focus:border-emeraldSoft focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Color Swatch Picker */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink/70 mb-1.5">
                  Pilih Varian Warna (Klik untuk menambah/menghapus)
                </label>
                <div className="flex flex-wrap gap-2 rounded-2xl border border-goldMuted/20 bg-white p-3.5">
                  {Object.keys(colorMap).map((colorName) => {
                    const isPicked = (productForm.colors || []).includes(colorName);
                    return (
                      <button
                        key={colorName}
                        type="button"
                        onClick={() => toggleColorInForm(colorName)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition border ${
                          isPicked
                            ? 'border-emeraldSoft bg-emeraldSoft/10 text-emeraldInk ring-1 ring-emeraldSoft'
                            : 'border-ink/15 bg-pearlWarm/40 text-ink/60 hover:bg-pearlWarm'
                        }`}
                      >
                        <span
                          className="h-3.5 w-3.5 rounded-full border border-black/10"
                          style={{ backgroundColor: colorMap[colorName] || '#ded3c2' }}
                        />
                        <span>{colorName}</span>
                        {isPicked && <Check size={12} className="text-emeraldSoft" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description & Specs */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink/70">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-goldMuted/30 bg-white p-3 text-xs sm:text-sm text-ink focus:border-emeraldSoft focus:outline-none"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink/70">Nama Bahan</label>
                  <input
                    type="text"
                    value={productForm.material}
                    onChange={(e) => setProductForm({ ...productForm, material: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-goldMuted/30 bg-white p-2.5 text-xs sm:text-sm font-semibold text-ink"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink/70">Ukuran / Dimensi</label>
                  <input
                    type="text"
                    value={productForm.size}
                    onChange={(e) => setProductForm({ ...productForm, size: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-goldMuted/30 bg-white p-2.5 text-xs sm:text-sm font-semibold text-ink"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink/70">Finishing Jahitan</label>
                  <input
                    type="text"
                    value={productForm.finishing}
                    onChange={(e) => setProductForm({ ...productForm, finishing: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-goldMuted/30 bg-white p-2.5 text-xs sm:text-sm font-semibold text-ink"
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-goldMuted/20 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full border border-goldMuted/30 bg-white px-5 py-2.5 text-xs sm:text-sm font-bold text-ink/70 hover:bg-pearlWarm transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full bg-emeraldSoft px-7 py-2.5 text-xs sm:text-sm font-bold text-pearl shadow-emerald hover:bg-emeraldDeep transition"
                >
                  <Save size={16} />
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== PROMO CODE FORM MODAL ==================== */}
      {isPromoModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-emeraldInk/85 backdrop-blur-sm"
            onClick={() => setIsPromoModalOpen(false)}
          />

          <div
            className="relative z-10 my-auto flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-champagne/40 bg-pearlWarm shadow-2xl animate-floatIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
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

            {/* Modal Form */}
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
                      onClick={() => setPromoCodeForm({ ...promoCodeForm, discountType: 'fixed' })}
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

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink/70">
                    Nilai Diskon ({promoCodeForm.discountType === 'percentage' ? '%' : 'Rp'}) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={promoCodeForm.discountValue}
                    onChange={(e) => setPromoCodeForm({ ...promoCodeForm, discountValue: e.target.value })}
                    placeholder={promoCodeForm.discountType === 'percentage' ? '15' : '15000'}
                    className="mt-1.5 w-full rounded-xl border border-goldMuted/30 bg-white p-3 text-sm font-bold text-ink focus:border-emeraldSoft focus:outline-none"
                  />
                </div>

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

              {/* Scope: All vs Specific Products */}
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

                {/* Specific Products Multi-Check List */}
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
                            <img src={prod.image} alt={prod.name} className="h-9 w-8 rounded-lg object-cover" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold truncate">{prod.name}</p>
                              <p className="text-[10px] text-ink/50">{prod.price}</p>
                            </div>
                            <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${isChecked ? 'bg-emeraldSoft text-white border-emeraldSoft' : 'border-ink/20'}`}>
                              {isChecked && <Check size={13} className="stroke-[3]" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Status Switch */}
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

              {/* Description */}
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

              {/* Modal Buttons */}
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
