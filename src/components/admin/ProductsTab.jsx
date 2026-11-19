import { Check, Copy, Edit, ImageIcon, Plus, Save, Search, Sparkles, Trash2, Upload, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { safeUrl, useStore } from '../../context/StoreContext';
import { catalogCategories, colorMap, productCategories } from '../../data/content';

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

const emptyProductForm = {
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
};

export default function ProductsTab({ showToast }) {
  const { isSupabaseConfigured, products, addProduct, updateProduct, deleteProduct, uploadProductImage } = useStore();
  const [productSearch, setProductSearch] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    const res = await uploadProductImage(file);
    setUploadingImage(false);
    e.target.value = '';
    if (res.ok) {
      setProductForm((prev) => ({ ...prev, image: res.url }));
      showToast('Foto produk berhasil diunggah ke Supabase Storage!');
    } else {
      showToast(res.error || 'Gagal mengunggah foto.', 'error');
    }
  };

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

  const openCreateModal = () => {
    setEditingProduct(null);
    setProductForm(emptyProductForm);
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setProductForm({ ...product, colors: product.colors || ['Emerald', 'Sage'] });
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

    const payload = { ...productForm, numericPrice: numeric };

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
    addProduct({ ...product, id: undefined, name: `${product.name} (Copy)` });
    showToast(`Produk "${product.name}" berhasil diduplikasi!`);
  };

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

  return (
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

      {/* Products Table */}
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
                      src={safeUrl(p.image, '/images/product-daily-voile.jpg')}
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

      {/* Product Form Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          <div className="fixed inset-0 bg-emeraldInk/85 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />

          <div
            className="relative z-10 my-auto flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-champagne/40 bg-pearlWarm shadow-2xl animate-floatIn"
            onClick={(e) => e.stopPropagation()}
          >
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

              {/* Photo Selector */}
              <div className="rounded-2xl border border-goldMuted/25 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-ink/80">
                      Foto Model Produk
                    </label>
                    <p className="text-[11px] text-ink/60">Pilih dari galeri studio atau unggah foto baru (JPG/PNG/WebP, maks. 5 MB):</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isSupabaseConfigured && (
                      <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-emeraldSoft px-3.5 py-1.5 text-[11px] font-bold text-pearl shadow-sm transition hover:bg-emeraldDeep">
                        <Upload size={13} />
                        {uploadingImage ? 'Mengunggah...' : 'Upload Foto Baru'}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          disabled={uploadingImage}
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                    <span className="text-[11px] font-semibold text-goldMuted">12 Pilihan Studio</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <div className="flex flex-col items-center shrink-0 w-full sm:w-28 p-2 rounded-2xl border border-goldMuted/30 bg-pearlWarm/50">
                    <div className="relative aspect-[3/4] w-24 overflow-hidden rounded-xl border-2 border-emeraldSoft shadow-sm bg-mist">
                      <img
                        src={safeUrl(productForm.image, '/images/product-daily-voile.jpg')}
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
    </div>
  );
}
