/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  brand as defaultBrand,
  colorMap as defaultColorMap,
  products as defaultProducts
} from '../data/content';

const StoreContext = createContext(null);

const STORAGE_KEYS = {
  PRODUCTS: 'kheyr_products_data_v1',
  BRAND: 'kheyr_brand_data_v1',
  PROMO: 'kheyr_promo_data_v1',
  PROMO_CODES: 'kheyr_promo_codes_v1',
  PIN: 'kheyr_admin_pin_v1'
};

const defaultPromo = {
  enabled: true,
  text: '🎉 Promo Spesial: Gunakan Kode KHEYRHEMAT untuk Diskon Rp 15.000 Setiap Pembelian Min. Rp 100.000!',
  badge: 'KODE PROMO AKTIF'
};

export const defaultPromoCodes = [
  {
    id: 'promo-1',
    code: 'KHEYRHEMAT',
    discountType: 'fixed', // 'fixed' (Rp) | 'percentage' (%)
    discountValue: 15000,
    maxDiscount: 15000,
    minPurchase: 100000,
    applicableTo: 'all', // 'all' | 'specific'
    applicableProductIds: [],
    isActive: true,
    description: 'Potongan Rp 15.000 dengan minimal pembelian Rp 100.000 untuk seluruh koleksi.'
  },
  {
    id: 'promo-2',
    code: 'SILKLUXURY',
    discountType: 'percentage',
    discountValue: 20,
    maxDiscount: 35000,
    minPurchase: 120000,
    applicableTo: 'specific',
    applicableProductIds: ['luna-silk', 'organza-silk'],
    isActive: true,
    description: 'Diskon 20% (maks. Rp 35.000) khusus koleksi Silk & Formal Series.'
  },
  {
    id: 'promo-3',
    code: 'NEWKHEYR',
    discountType: 'percentage',
    discountValue: 10,
    maxDiscount: 20000,
    minPurchase: 0,
    applicableTo: 'all',
    applicableProductIds: [],
    isActive: true,
    description: 'Diskon 10% tanpa minimal belanja untuk muslimah sahabat baru KHEYR.'
  }
];

export function StoreProvider({ children }) {
  // Load products from localStorage or fallback to defaults
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return defaultProducts;
  });

  // Load brand settings from localStorage or fallback
  const [brand, setBrand] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BRAND);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return defaultBrand;
  });

  // Load promo banner from localStorage
  const [promoBanner, setPromoBanner] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROMO);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return defaultPromo;
  });

  // Load promo codes from localStorage
  const [promoCodes, setPromoCodes] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROMO_CODES);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return defaultPromoCodes;
  });

  // Load admin PIN from localStorage
  const [adminPin, setAdminPin] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PIN);
      if (saved) return saved;
    } catch {
      // ignore
    }
    return 'kheyr2026';
  });

  // Auto-persist to localStorage on state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch {
      // ignore
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BRAND, JSON.stringify(brand));
    } catch {
      // ignore
    }
  }, [brand]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROMO, JSON.stringify(promoBanner));
    } catch {
      // ignore
    }
  }, [promoBanner]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROMO_CODES, JSON.stringify(promoCodes));
    } catch {
      // ignore
    }
  }, [promoCodes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PIN, adminPin);
    } catch {
      // ignore
    }
  }, [adminPin]);

  // Dynamic WhatsApp link generator based on active brand.whatsapp
  const waLinks = useMemo(() => {
    const cleanNumber = (brand.whatsapp || '6281234567890').replace(/\D/g, '');
    const getUrl = (msg) => `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`;

    return {
      order: getUrl('Assalamu alaikum KHEYR, saya ingin order hijab.'),
      catalog: getUrl('Assalamu alaikum KHEYR, saya ingin lihat katalog hijab.'),
      ask: getUrl('Assalamu alaikum KHEYR, saya ingin tanya koleksi hijab.'),
      stylist: getUrl(
        'Assalamu alaikum KHEYR, saya ingin konsultasi gratis dengan Hijab Stylist untuk pilihan warna dan model.'
      ),
      forProduct: (productName, color, promoInfo) => {
        const colorText = color ? ` warna ${color}` : '';
        const promoText = promoInfo ? ` menggunakan kode promo "${promoInfo.code}" (Hemat Rp ${promoInfo.discountAmount.toLocaleString('id-ID')}) estimasi total: Rp ${promoInfo.finalPrice.toLocaleString('id-ID')}` : '';
        return getUrl(
          `Assalamu alaikum KHEYR, saya ingin order produk ${productName}${colorText}${promoText}. Mohon info ketersediaan stok & nomor rekeningnya. Terima kasih!`
        );
      }
    };
  }, [brand.whatsapp]);

  // Mutation Actions for Products
  const addProduct = (newProduct) => {
    const id =
      newProduct.id ||
      newProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
    const productWithId = { ...newProduct, id };
    setProducts((prev) => [productWithId, ...prev]);
    return productWithId;
  };

  const updateProduct = (id, updatedFields) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p))
    );
  };

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // Mutation Actions for Promo Codes
  const addPromoCode = (newCode) => {
    const id = 'promo-' + Date.now();
    const item = {
      ...newCode,
      id,
      code: newCode.code.trim().toUpperCase(),
      discountValue: Number(newCode.discountValue) || 0,
      maxDiscount: Number(newCode.maxDiscount) || 0,
      minPurchase: Number(newCode.minPurchase) || 0,
      applicableTo: newCode.applicableTo || 'all',
      applicableProductIds: Array.isArray(newCode.applicableProductIds) ? newCode.applicableProductIds : [],
      isActive: newCode.isActive !== false
    };
    setPromoCodes((prev) => [item, ...prev]);
    return item;
  };

  const updatePromoCode = (id, updatedFields) => {
    setPromoCodes((prev) =>
      prev.map((code) =>
        code.id === id
          ? {
              ...code,
              ...updatedFields,
              code: updatedFields.code ? updatedFields.code.trim().toUpperCase() : code.code,
              discountValue: updatedFields.discountValue !== undefined ? Number(updatedFields.discountValue) : code.discountValue,
              maxDiscount: updatedFields.maxDiscount !== undefined ? Number(updatedFields.maxDiscount) : code.maxDiscount,
              minPurchase: updatedFields.minPurchase !== undefined ? Number(updatedFields.minPurchase) : code.minPurchase
            }
          : code
      )
    );
  };

  const deletePromoCode = (id) => {
    setPromoCodes((prev) => prev.filter((code) => code.id !== id));
  };

  const togglePromoCodeStatus = (id) => {
    setPromoCodes((prev) =>
      prev.map((code) => (code.id === id ? { ...code, isActive: !code.isActive } : code))
    );
  };

  /**
   * Helper to check promo code validity and calculate discount
   */
  const calculatePromoDiscount = (promoCodeObj, product) => {
    if (!promoCodeObj || !promoCodeObj.isActive) {
      return { valid: false, message: 'Kode promo tidak aktif.' };
    }

    const price = product.numericPrice || parseInt(product.price.replace(/\D/g, ''), 10) || 0;

    // Check applicable products
    if (promoCodeObj.applicableTo === 'specific') {
      const isApplicable = promoCodeObj.applicableProductIds?.includes(product.id);
      if (!isApplicable) {
        return {
          valid: false,
          message: `Kode promo "${promoCodeObj.code}" hanya berlaku untuk produk tertentu.`
        };
      }
    }

    // Check minimum purchase
    if (promoCodeObj.minPurchase > 0 && price < promoCodeObj.minPurchase) {
      return {
        valid: false,
        message: `Minimal belanja untuk kode "${promoCodeObj.code}" adalah Rp ${promoCodeObj.minPurchase.toLocaleString('id-ID')}.`
      };
    }

    // Calculate discount
    let discountAmount = 0;
    if (promoCodeObj.discountType === 'percentage') {
      discountAmount = Math.round((price * promoCodeObj.discountValue) / 100);
      if (promoCodeObj.maxDiscount > 0 && discountAmount > promoCodeObj.maxDiscount) {
        discountAmount = promoCodeObj.maxDiscount;
      }
    } else {
      // Fixed discount
      discountAmount = promoCodeObj.discountValue;
      if (discountAmount > price) {
        discountAmount = price;
      }
    }

    const finalPrice = Math.max(0, price - discountAmount);

    return {
      valid: true,
      code: promoCodeObj.code,
      discountAmount,
      finalPrice,
      originalPrice: price,
      message: `Hemat Rp ${discountAmount.toLocaleString('id-ID')}!`
    };
  };

  const updateBrand = (newBrandData) => {
    setBrand((prev) => ({ ...prev, ...newBrandData }));
  };

  const updatePromo = (newPromoData) => {
    setPromoBanner((prev) => ({ ...prev, ...newPromoData }));
  };

  const updatePin = (newPin) => {
    setAdminPin(newPin);
  };

  const resetToDefaults = () => {
    setProducts(defaultProducts);
    setBrand(defaultBrand);
    setPromoBanner(defaultPromo);
    setPromoCodes(defaultPromoCodes);
    setAdminPin('kheyr2026');
    try {
      localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
      localStorage.removeItem(STORAGE_KEYS.BRAND);
      localStorage.removeItem(STORAGE_KEYS.PROMO);
      localStorage.removeItem(STORAGE_KEYS.PROMO_CODES);
      localStorage.removeItem(STORAGE_KEYS.PIN);
    } catch {
      // ignore
    }
  };

  const exportData = () => {
    const backup = {
      version: '1.1.0',
      exportedAt: new Date().toISOString(),
      brand,
      products,
      promoBanner,
      promoCodes
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `kheyr_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importData = (jsonData) => {
    try {
      const parsed = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      if (parsed.brand) setBrand(parsed.brand);
      if (Array.isArray(parsed.products)) setProducts(parsed.products);
      if (parsed.promoBanner) setPromoBanner(parsed.promoBanner);
      if (Array.isArray(parsed.promoCodes)) setPromoCodes(parsed.promoCodes);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const value = {
    brand,
    products,
    promoBanner,
    promoCodes,
    adminPin,
    colorMap: defaultColorMap,
    waLinks,
    addProduct,
    updateProduct,
    deleteProduct,
    addPromoCode,
    updatePromoCode,
    deletePromoCode,
    togglePromoCodeStatus,
    calculatePromoDiscount,
    updateBrand,
    updatePromo,
    updatePin,
    resetToDefaults,
    exportData,
    importData
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
