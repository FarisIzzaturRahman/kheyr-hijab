/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  brand as defaultBrand,
  colorMap as defaultColorMap,
  products as defaultProducts
} from '../data/content';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

const StoreContext = createContext(null);

const STORAGE_KEYS = {
  PRODUCTS: 'kheyr_products_data_v1',
  BRAND: 'kheyr_brand_data_v1',
  PROMO: 'kheyr_promo_data_v1',
  PROMO_CODES: 'kheyr_promo_codes_v1',
  PIN: 'kheyr_admin_pin_v1',
  AUDIT_LOGS: 'kheyr_audit_logs_v1'
};

const MAX_AUDIT_LOGS = 200;

export const defaultPromo = {
  enabled: true,
  text: '🎉 Promo Spesial: Gunakan Kode KHEYRHEMAT untuk Diskon Rp 15.000 Setiap Pembelian Min. Rp 100.000!',
  badge: 'KODE PROMO AKTIF'
};

export const defaultPromoCodes = [
  {
    id: 'promo-1',
    code: 'KHEYRHEMAT',
    discountType: 'fixed',
    discountValue: 15000,
    maxDiscount: 0,
    minPurchase: 100000,
    applicableTo: 'all',
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

/**
 * Only allow safe HTTP(S) or root-relative URLs to prevent javascript:/data: injection.
 */
export function safeUrl(url, fallback = '#') {
  if (typeof url !== 'string') return fallback;
  const trimmed = url.trim();
  if (!trimmed) return fallback;
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return trimmed;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return trimmed;
    }
  } catch {
    // invalid URL
  }
  return fallback;
}

function readStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore storage errors
  }
  return fallback;
}

function writeStorage(key, value) {
  if (isSupabaseConfigured) return;
  try {
    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  } catch {
    // ignore storage quota errors
  }
}

// DB row <-> frontend shape mappers
function dbToProduct(row) {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    numericPrice: row.numeric_price,
    label: row.label,
    category: row.category,
    catalogCategory: row.catalog_category,
    image: safeUrl(row.image, '/images/product-daily-voile.jpg'),
    description: row.description || '',
    material: row.material || '',
    size: row.size || '',
    finishing: row.finishing || '',
    careTips: row.care_tips || '',
    colors: Array.isArray(row.colors) && row.colors.length > 0 ? row.colors : ['Emerald']
  };
}

function productToDb(p, sortOrder = 0) {
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    numeric_price: Number(p.numericPrice) || 0,
    label: p.label || 'Koleksi',
    category: p.category || 'Daily Hijab',
    catalog_category: p.catalogCategory || 'Square & Voile',
    image: safeUrl(p.image, '/images/product-daily-voile.jpg'),
    description: p.description || '',
    material: p.material || '',
    size: p.size || '',
    finishing: p.finishing || '',
    care_tips: p.careTips || '',
    colors: Array.isArray(p.colors) && p.colors.length > 0 ? p.colors : ['Emerald'],
    sort_order: sortOrder,
    updated_at: new Date().toISOString()
  };
}

function dbToPromo(row) {
  return {
    id: row.id,
    code: row.code,
    discountType: row.discount_type,
    discountValue: row.discount_value,
    maxDiscount: row.max_discount,
    minPurchase: row.min_purchase,
    applicableTo: row.applicable_to,
    applicableProductIds: Array.isArray(row.applicable_product_ids) ? row.applicable_product_ids : [],
    isActive: row.is_active,
    description: row.description || ''
  };
}

function promoToDb(p) {
  return {
    id: p.id,
    code: p.code,
    discount_type: p.discountType,
    discount_value: Number(p.discountValue) || 1,
    max_discount: p.discountType === 'percentage' ? Math.max(0, Number(p.maxDiscount) || 0) : 0,
    min_purchase: Math.max(0, Number(p.minPurchase) || 0),
    applicable_to: p.applicableTo === 'specific' ? 'specific' : 'all',
    applicable_product_ids: Array.isArray(p.applicableProductIds) ? p.applicableProductIds : [],
    is_active: p.isActive !== false,
    description: p.description || '',
    updated_at: new Date().toISOString()
  };
}

function dbToAudit(row) {
  return {
    id: row.id,
    timestamp: row.created_at,
    actorEmail: row.actor_email || '',
    action: row.action,
    target: row.target,
    summary: row.summary || ''
  };
}

function sanitizeProduct(raw, index) {
  if (!raw || typeof raw !== 'object') return null;
  const name = typeof raw.name === 'string' ? raw.name.trim() : '';
  const price = typeof raw.price === 'string' ? raw.price.trim() : '';
  if (!name || !price) return null;

  const parsedPrice = parseInt(price.replace(/\D/g, ''), 10);
  const numericPrice =
    typeof raw.numericPrice === 'number' && raw.numericPrice > 0
      ? raw.numericPrice
      : !isNaN(parsedPrice) && parsedPrice > 0
        ? parsedPrice
        : 0;

  return {
    id: typeof raw.id === 'string' && raw.id.trim() ? raw.id.trim() : `imported-${index}-${Date.now()}`,
    name,
    price,
    numericPrice,
    label: typeof raw.label === 'string' ? raw.label : 'Koleksi',
    category: typeof raw.category === 'string' && raw.category.trim() ? raw.category : 'Daily Hijab',
    catalogCategory: typeof raw.catalogCategory === 'string' ? raw.catalogCategory : 'Square & Voile',
    image: safeUrl(raw.image, '/images/product-daily-voile.jpg'),
    description: typeof raw.description === 'string' ? raw.description : '',
    material: typeof raw.material === 'string' ? raw.material : '',
    size: typeof raw.size === 'string' ? raw.size : '',
    finishing: typeof raw.finishing === 'string' ? raw.finishing : '',
    careTips: typeof raw.careTips === 'string' ? raw.careTips : '',
    colors:
      Array.isArray(raw.colors) && raw.colors.length > 0
        ? raw.colors.filter((c) => typeof c === 'string')
        : ['Emerald']
  };
}

function sanitizePromoCode(raw, index) {
  if (!raw || typeof raw !== 'object') return null;
  const code = typeof raw.code === 'string' ? raw.code.trim().toUpperCase() : '';
  if (!code) return null;

  const discountType = raw.discountType === 'fixed' ? 'fixed' : 'percentage';
  let discountValue = Number(raw.discountValue) || 0;
  discountValue = discountType === 'percentage' ? Math.min(100, Math.max(0, discountValue)) : Math.max(0, discountValue);

  return {
    id: typeof raw.id === 'string' && raw.id.trim() ? raw.id.trim() : `promo-imp-${index}-${Date.now()}`,
    code,
    discountType,
    discountValue,
    maxDiscount: discountType === 'percentage' ? Math.max(0, Number(raw.maxDiscount) || 0) : 0,
    minPurchase: Math.max(0, Number(raw.minPurchase) || 0),
    applicableTo: raw.applicableTo === 'specific' ? 'specific' : 'all',
    applicableProductIds: Array.isArray(raw.applicableProductIds)
      ? raw.applicableProductIds.filter((id) => typeof id === 'string')
      : [],
    isActive: raw.isActive !== false,
    description: typeof raw.description === 'string' ? raw.description : ''
  };
}

export function StoreProvider({ children }) {
  const [products, setProducts] = useState(() =>
    isSupabaseConfigured ? defaultProducts : readStorage(STORAGE_KEYS.PRODUCTS, defaultProducts)
  );
  const [brand, setBrand] = useState(() =>
    isSupabaseConfigured ? defaultBrand : readStorage(STORAGE_KEYS.BRAND, defaultBrand)
  );
  const [promoBanner, setPromoBanner] = useState(() =>
    isSupabaseConfigured ? defaultPromo : readStorage(STORAGE_KEYS.PROMO, defaultPromo)
  );
  const [promoCodes, setPromoCodes] = useState(() =>
    isSupabaseConfigured ? defaultPromoCodes : readStorage(STORAGE_KEYS.PROMO_CODES, defaultPromoCodes)
  );
  const [auditLogs, setAuditLogs] = useState(() =>
    isSupabaseConfigured ? [] : readStorage(STORAGE_KEYS.AUDIT_LOGS, [])
  );

  // Supabase Auth state
  const [authUser, setAuthUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(isSupabaseConfigured);

  // Local fallback PIN (only used when Supabase is not configured, e.g. unit tests)
  const [adminPin, setAdminPin] = useState(() => {
    if (isSupabaseConfigured) return '';
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PIN);
      if (saved) return saved;
    } catch {
      // ignore
    }
    return 'kheyr2026';
  });

  // Load initial public data from Supabase
  const refreshPublicData = useCallback(async () => {
    if (!supabase) return;
    const [prodRes, promoRes, settingsRes] = await Promise.all([
      supabase.from('products').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: false }),
      supabase.from('promo_codes').select('*').order('created_at', { ascending: false }),
      supabase.from('store_settings').select('*').eq('id', 'default').maybeSingle()
    ]);

    if (!prodRes.error && Array.isArray(prodRes.data) && prodRes.data.length > 0) {
      setProducts(prodRes.data.map(dbToProduct));
    }
    if (!promoRes.error && Array.isArray(promoRes.data)) {
      setPromoCodes(promoRes.data.map(dbToPromo));
    }
    if (!settingsRes.error && settingsRes.data) {
      if (settingsRes.data.brand) {
        setBrand({
          ...defaultBrand,
          ...settingsRes.data.brand,
          instagram: safeUrl(settingsRes.data.brand.instagram, defaultBrand.instagram),
          marketplace: safeUrl(settingsRes.data.brand.marketplace, defaultBrand.marketplace)
        });
      }
      if (settingsRes.data.promo_banner) {
        setPromoBanner({ ...defaultPromo, ...settingsRes.data.promo_banner });
      }
    }
  }, []);

  const refreshAuditLogs = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(MAX_AUDIT_LOGS);
    if (!error && Array.isArray(data)) {
      setAuditLogs(data.map(dbToAudit));
    }
  }, []);

  const verifyAdminRole = useCallback(
    async (user) => {
      if (!supabase || !user) {
        setAuthUser(null);
        setIsAdmin(false);
        setAuthLoading(false);
        return false;
      }
      const { data, error } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();

      const allowed = !error && Boolean(data);
      setAuthUser(allowed ? user : null);
      setIsAdmin(allowed);
      setAuthLoading(false);

      if (allowed) {
        refreshPublicData();
        refreshAuditLogs();
      }
      return allowed;
    },
    [refreshPublicData, refreshAuditLogs]
  );

  useEffect(() => {
    if (!supabase) return undefined;
    let active = true;

    Promise.resolve().then(() => {
      if (active) refreshPublicData();
    });

    supabase.auth.getSession().then(({ data }) => {
      if (active) verifyAdminRole(data?.session?.user || null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) verifyAdminRole(session?.user || null);
    });

    return () => {
      active = false;
      listener?.subscription?.unsubscribe();
    };
  }, [refreshPublicData, verifyAdminRole]);

  // Local fallback persistence (disabled when Supabase is active)
  useEffect(() => writeStorage(STORAGE_KEYS.PRODUCTS, products), [products]);
  useEffect(() => writeStorage(STORAGE_KEYS.BRAND, brand), [brand]);
  useEffect(() => writeStorage(STORAGE_KEYS.PROMO, promoBanner), [promoBanner]);
  useEffect(() => writeStorage(STORAGE_KEYS.PROMO_CODES, promoCodes), [promoCodes]);
  useEffect(() => writeStorage(STORAGE_KEYS.AUDIT_LOGS, auditLogs), [auditLogs]);
  useEffect(() => writeStorage(STORAGE_KEYS.PIN, adminPin), [adminPin]);

  const recordAudit = useCallback(
    async (action, target, summary, beforeData = null, afterData = null) => {
      if (supabase && authUser) {
        const { data, error } = await supabase
          .from('audit_logs')
          .insert({
            actor_id: authUser.id,
            actor_email: authUser.email || '',
            action,
            target,
            summary,
            before_data: beforeData,
            after_data: afterData
          })
          .select()
          .single();

        if (!error && data) {
          setAuditLogs((prev) => [dbToAudit(data), ...prev].slice(0, MAX_AUDIT_LOGS));
        }
        return;
      }

      const entry = {
        id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toISOString(),
        actorEmail: authUser?.email || 'local-admin',
        action,
        target,
        summary
      };
      setAuditLogs((prev) => [entry, ...prev].slice(0, MAX_AUDIT_LOGS));
    },
    [authUser]
  );

  // Supabase Auth Actions
  const signInAdmin = useCallback(
    async (email, password) => {
      if (!supabase) return { ok: false, error: 'Supabase belum dikonfigurasi.' };
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });
      if (error) {
        return { ok: false, error: error.message };
      }
      const allowed = await verifyAdminRole(data.user);
      if (!allowed) {
        await supabase.auth.signOut();
        return { ok: false, error: 'Akun ini tidak terdaftar sebagai admin KHEYR.' };
      }
      return { ok: true };
    },
    [verifyAdminRole]
  );

  const signOutAdmin = useCallback(async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setAuthUser(null);
    setIsAdmin(false);
  }, []);

  const updateAdminPassword = useCallback(
    async (newPassword) => {
      if (!supabase) {
        setAdminPin(newPassword);
        recordAudit('PIN_UPDATE', 'Admin Security', 'PIN Admin diperbarui');
        return { ok: true };
      }
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return { ok: false, error: error.message };
      await recordAudit('PASSWORD_UPDATE', 'Admin Security', 'Password Admin diperbarui');
      return { ok: true };
    },
    [recordAudit]
  );

  // Supabase Storage Image Upload
  const uploadProductImage = useCallback(
    async (file) => {
      if (!supabase) {
        return { ok: false, error: 'Upload foto memerlukan koneksi Supabase Storage.' };
      }
      if (!file || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        return { ok: false, error: 'Format file harus JPG, PNG, atau WebP.' };
      }
      if (file.size > 5 * 1024 * 1024) {
        return { ok: false, error: 'Ukuran foto maksimal 5 MB.' };
      }

      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const safeBase = file.name
        .replace(/\.[^/.]+$/, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .slice(0, 40);
      const filePath = `${Date.now()}-${safeBase}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        return { ok: false, error: uploadError.message };
      }

      const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
      await recordAudit('IMAGE_UPLOAD', filePath, `Upload foto produk (${Math.round(file.size / 1024)} KB)`);
      return { ok: true, url: data.publicUrl };
    },
    [recordAudit]
  );

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
        const promoText = promoInfo
          ? ` menggunakan kode promo "${promoInfo.code}" (Hemat Rp ${promoInfo.discountAmount.toLocaleString('id-ID')}) estimasi total: Rp ${promoInfo.finalPrice.toLocaleString('id-ID')}`
          : '';
        return getUrl(
          `Assalamu alaikum KHEYR, saya ingin order produk ${productName}${colorText}${promoText}. Mohon info ketersediaan stok & nomor rekeningnya. Terima kasih!`
        );
      }
    };
  }, [brand.whatsapp]);

  // Mutation Actions for Products
  const addProduct = useCallback(
    (newProduct) => {
      const id =
        newProduct.id ||
        newProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
      const productWithId = {
        ...newProduct,
        id,
        image: safeUrl(newProduct.image, '/images/product-daily-voile.jpg')
      };

      setProducts((prev) => [productWithId, ...prev]);

      if (supabase) {
        supabase
          .from('products')
          .insert(productToDb(productWithId, 0))
          .then(({ error }) => {
            if (!error) {
              recordAudit('PRODUCT_CREATE', productWithId.name, `Tambah produk (${productWithId.price})`, null, productWithId);
            }
          });
      } else {
        recordAudit('PRODUCT_CREATE', productWithId.name, `Tambah produk (${productWithId.price})`);
      }
      return productWithId;
    },
    [recordAudit]
  );

  const updateProduct = useCallback(
    (id, updatedFields) => {
      const sanitized = {
        ...updatedFields,
        ...(updatedFields.image !== undefined
          ? { image: safeUrl(updatedFields.image, '/images/product-daily-voile.jpg') }
          : {})
      };

      let beforeItem = null;
      let mergedItem = null;
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p;
          beforeItem = p;
          mergedItem = { ...p, ...sanitized };
          return mergedItem;
        })
      );

      if (supabase && mergedItem) {
        supabase
          .from('products')
          .update(productToDb(mergedItem))
          .eq('id', id)
          .then(({ error }) => {
            if (!error) {
              recordAudit('PRODUCT_UPDATE', mergedItem.name, `Update produk (${mergedItem.price})`, beforeItem, mergedItem);
            }
          });
      } else {
        recordAudit('PRODUCT_UPDATE', sanitized.name || id, `Update produk (${sanitized.price || '-'})`);
      }
    },
    [recordAudit]
  );

  const deleteProduct = useCallback(
    (id) => {
      let deletedItem = null;
      setProducts((prev) => {
        deletedItem = prev.find((p) => p.id === id) || null;
        return prev.filter((p) => p.id !== id);
      });

      if (supabase) {
        supabase
          .from('products')
          .delete()
          .eq('id', id)
          .then(({ error }) => {
            if (!error && deletedItem) {
              recordAudit('PRODUCT_DELETE', deletedItem.name, `Hapus produk ID ${id}`, deletedItem, null);
            }
          });
      } else if (deletedItem) {
        recordAudit('PRODUCT_DELETE', deletedItem.name, `Hapus produk ID ${id}`);
      }
    },
    [recordAudit]
  );

  // Mutation Actions for Promo Codes
  const addPromoCode = useCallback(
    (newCode) => {
      const normalizedCode = (newCode.code || '').trim().toUpperCase();
      if (!normalizedCode) {
        return { ok: false, error: 'Kode promo tidak boleh kosong.' };
      }

      const duplicate = promoCodes.some((p) => p.code.toUpperCase() === normalizedCode);
      if (duplicate) {
        return { ok: false, error: `Kode promo "${normalizedCode}" sudah ada.` };
      }

      const discountType = newCode.discountType === 'fixed' ? 'fixed' : 'percentage';
      let discountValue = Number(newCode.discountValue) || 0;
      discountValue =
        discountType === 'percentage' ? Math.min(100, Math.max(1, discountValue)) : Math.max(1, discountValue);

      const item = {
        ...newCode,
        id: 'promo-' + Date.now(),
        code: normalizedCode,
        discountType,
        discountValue,
        maxDiscount: discountType === 'percentage' ? Math.max(0, Number(newCode.maxDiscount) || 0) : 0,
        minPurchase: Math.max(0, Number(newCode.minPurchase) || 0),
        applicableTo: newCode.applicableTo === 'specific' ? 'specific' : 'all',
        applicableProductIds: Array.isArray(newCode.applicableProductIds) ? newCode.applicableProductIds : [],
        isActive: newCode.isActive !== false
      };

      setPromoCodes((prev) => [item, ...prev]);

      if (supabase) {
        supabase
          .from('promo_codes')
          .insert(promoToDb(item))
          .then(({ error }) => {
            if (!error) {
              recordAudit('PROMO_CREATE', item.code, `Buat promo ${item.discountType} (${item.discountValue})`, null, item);
            }
          });
      } else {
        recordAudit('PROMO_CREATE', item.code, `Buat promo ${item.discountType} (${item.discountValue})`);
      }

      return { ok: true, item };
    },
    [promoCodes, recordAudit]
  );

  const updatePromoCode = useCallback(
    (id, updatedFields) => {
      const normalizedCode = updatedFields.code ? updatedFields.code.trim().toUpperCase() : undefined;
      if (normalizedCode) {
        const duplicate = promoCodes.some((p) => p.id !== id && p.code.toUpperCase() === normalizedCode);
        if (duplicate) {
          return { ok: false, error: `Kode promo "${normalizedCode}" sudah digunakan promo lain.` };
        }
      }

      let beforeItem = null;
      let mergedItem = null;
      setPromoCodes((prev) =>
        prev.map((code) => {
          if (code.id !== id) return code;
          beforeItem = code;
          const discountType = updatedFields.discountType || code.discountType;
          let discountValue =
            updatedFields.discountValue !== undefined ? Number(updatedFields.discountValue) : code.discountValue;
          discountValue =
            discountType === 'percentage' ? Math.min(100, Math.max(1, discountValue)) : Math.max(1, discountValue);

          mergedItem = {
            ...code,
            ...updatedFields,
            code: normalizedCode || code.code,
            discountType,
            discountValue,
            maxDiscount:
              discountType === 'percentage'
                ? Math.max(0, updatedFields.maxDiscount !== undefined ? Number(updatedFields.maxDiscount) : code.maxDiscount)
                : 0,
            minPurchase: Math.max(
              0,
              updatedFields.minPurchase !== undefined ? Number(updatedFields.minPurchase) : code.minPurchase
            )
          };
          return mergedItem;
        })
      );

      if (supabase && mergedItem) {
        supabase
          .from('promo_codes')
          .update(promoToDb(mergedItem))
          .eq('id', id)
          .then(({ error }) => {
            if (!error) {
              recordAudit('PROMO_UPDATE', mergedItem.code, 'Perbarui aturan kode promo', beforeItem, mergedItem);
            }
          });
      } else {
        recordAudit('PROMO_UPDATE', normalizedCode || id, 'Perbarui aturan kode promo');
      }

      return { ok: true };
    },
    [promoCodes, recordAudit]
  );

  const deletePromoCode = useCallback(
    (id) => {
      let deletedItem = null;
      setPromoCodes((prev) => {
        deletedItem = prev.find((c) => c.id === id) || null;
        return prev.filter((code) => code.id !== id);
      });

      if (supabase) {
        supabase
          .from('promo_codes')
          .delete()
          .eq('id', id)
          .then(({ error }) => {
            if (!error && deletedItem) {
              recordAudit('PROMO_DELETE', deletedItem.code, `Hapus kode promo ${deletedItem.code}`, deletedItem, null);
            }
          });
      } else if (deletedItem) {
        recordAudit('PROMO_DELETE', deletedItem.code, `Hapus kode promo ${deletedItem.code}`);
      }
    },
    [recordAudit]
  );

  const togglePromoCodeStatus = useCallback(
    (id) => {
      let targetItem = null;
      setPromoCodes((prev) =>
        prev.map((code) => {
          if (code.id !== id) return code;
          targetItem = { ...code, isActive: !code.isActive };
          return targetItem;
        })
      );

      if (supabase && targetItem) {
        supabase
          .from('promo_codes')
          .update({ is_active: targetItem.isActive, updated_at: new Date().toISOString() })
          .eq('id', id)
          .then(({ error }) => {
            if (!error) {
              recordAudit(
                'PROMO_TOGGLE',
                targetItem.code,
                `Ubah status promo menjadi ${targetItem.isActive ? 'Aktif' : 'Nonaktif'}`
              );
            }
          });
      } else if (targetItem) {
        recordAudit(
          'PROMO_TOGGLE',
          targetItem.code,
          `Ubah status promo menjadi ${targetItem.isActive ? 'Aktif' : 'Nonaktif'}`
        );
      }
    },
    [recordAudit]
  );

  const calculatePromoDiscount = useCallback((promoCodeObj, product) => {
    if (!promoCodeObj || !promoCodeObj.isActive) {
      return { valid: false, message: 'Kode promo tidak aktif.' };
    }

    const price =
      typeof product?.numericPrice === 'number' && product.numericPrice > 0
        ? product.numericPrice
        : parseInt(String(product?.price || '').replace(/\D/g, ''), 10) || 0;

    if (promoCodeObj.applicableTo === 'specific') {
      const isApplicable = promoCodeObj.applicableProductIds?.includes(product.id);
      if (!isApplicable) {
        return {
          valid: false,
          message: `Kode promo "${promoCodeObj.code}" hanya berlaku untuk produk tertentu.`
        };
      }
    }

    if (promoCodeObj.minPurchase > 0 && price < promoCodeObj.minPurchase) {
      return {
        valid: false,
        message: `Minimal belanja untuk kode "${promoCodeObj.code}" adalah Rp ${promoCodeObj.minPurchase.toLocaleString('id-ID')}.`
      };
    }

    let discountAmount = 0;
    if (promoCodeObj.discountType === 'percentage') {
      const pct = Math.min(100, Math.max(0, Number(promoCodeObj.discountValue) || 0));
      discountAmount = Math.round((price * pct) / 100);
      if (promoCodeObj.maxDiscount > 0 && discountAmount > promoCodeObj.maxDiscount) {
        discountAmount = promoCodeObj.maxDiscount;
      }
    } else {
      discountAmount = Math.max(0, Number(promoCodeObj.discountValue) || 0);
      if (promoCodeObj.maxDiscount > 0 && discountAmount > promoCodeObj.maxDiscount) {
        discountAmount = promoCodeObj.maxDiscount;
      }
    }

    if (discountAmount > price) {
      discountAmount = price;
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
  }, []);

  const updateBrand = useCallback(
    (newBrandData) => {
      const sanitized = {
        ...newBrandData,
        ...(newBrandData.instagram !== undefined
          ? { instagram: safeUrl(newBrandData.instagram, defaultBrand.instagram) }
          : {}),
        ...(newBrandData.marketplace !== undefined
          ? { marketplace: safeUrl(newBrandData.marketplace, defaultBrand.marketplace) }
          : {})
      };
      const nextBrand = { ...brand, ...sanitized };
      setBrand(nextBrand);

      if (supabase) {
        supabase
          .from('store_settings')
          .upsert({ id: 'default', brand: nextBrand, promo_banner: promoBanner, updated_at: new Date().toISOString() })
          .then(({ error }) => {
            if (!error) {
              recordAudit(
                'BRAND_UPDATE',
                nextBrand.name || 'Brand',
                `Update pengaturan toko (WA: ${nextBrand.whatsapp || '-'})`,
                brand,
                nextBrand
              );
            }
          });
      } else {
        recordAudit('BRAND_UPDATE', nextBrand.name || 'Brand', `Update pengaturan toko (WA: ${nextBrand.whatsapp || '-'})`);
      }
    },
    [brand, promoBanner, recordAudit]
  );

  const updatePromo = useCallback(
    (newPromoData) => {
      const nextPromo = { ...promoBanner, ...newPromoData };
      setPromoBanner(nextPromo);

      if (supabase) {
        supabase
          .from('store_settings')
          .upsert({ id: 'default', brand, promo_banner: nextPromo, updated_at: new Date().toISOString() })
          .then(({ error }) => {
            if (!error) {
              recordAudit('BANNER_UPDATE', 'Top Bar', `Banner ${nextPromo.enabled ? 'Aktif' : 'Nonaktif'}`, promoBanner, nextPromo);
            }
          });
      } else {
        recordAudit('BANNER_UPDATE', 'Top Bar', `Banner ${nextPromo.enabled ? 'Aktif' : 'Nonaktif'}`);
      }
    },
    [brand, promoBanner, recordAudit]
  );

  const updatePin = useCallback(
    (newPin) => {
      setAdminPin(newPin);
      recordAudit('PIN_UPDATE', 'Admin Security', 'PIN Admin diperbarui');
    },
    [recordAudit]
  );

  const resetToDefaults = useCallback(() => {
    setProducts(defaultProducts);
    setBrand(defaultBrand);
    setPromoBanner(defaultPromo);
    setPromoCodes(defaultPromoCodes);

    if (supabase) {
      Promise.all([
        supabase.from('products').upsert(defaultProducts.map((p, idx) => productToDb(p, idx + 1))),
        supabase.from('promo_codes').upsert(defaultPromoCodes.map(promoToDb)),
        supabase.from('store_settings').upsert({
          id: 'default',
          brand: defaultBrand,
          promo_banner: defaultPromo,
          updated_at: new Date().toISOString()
        })
      ]).then(() => {
        recordAudit('FACTORY_RESET', 'Store', 'Seluruh data toko direset ke default');
      });
    } else {
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
      recordAudit('FACTORY_RESET', 'Store', 'Seluruh data toko direset ke default');
    }

    return { brand: defaultBrand, promoBanner: defaultPromo };
  }, [recordAudit]);

  const exportData = useCallback(() => {
    const backup = {
      version: '1.2.0',
      exportedAt: new Date().toISOString(),
      brand,
      products,
      promoBanner,
      promoCodes,
      auditLogs
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `kheyr_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    recordAudit('BACKUP_EXPORT', 'JSON', `Export ${products.length} produk & ${promoCodes.length} promo`);
  }, [brand, products, promoBanner, promoCodes, auditLogs, recordAudit]);

  const importData = useCallback(
    (jsonData) => {
      try {
        const parsed = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          return { success: false, error: 'Format file backup tidak valid.' };
        }

        let nextBrand = brand;
        let nextPromoBanner = promoBanner;
        let nextProducts = null;
        let nextPromos = null;

        if (parsed.products !== undefined) {
          if (!Array.isArray(parsed.products)) {
            return { success: false, error: 'Field "products" harus berupa array.' };
          }
          const validProducts = parsed.products.map(sanitizeProduct).filter(Boolean);
          if (parsed.products.length > 0 && validProducts.length === 0) {
            return { success: false, error: 'Tidak ada data produk yang valid di file backup.' };
          }
          nextProducts = validProducts;
          setProducts(validProducts);
        }

        if (parsed.brand && typeof parsed.brand === 'object' && !Array.isArray(parsed.brand)) {
          nextBrand = {
            ...defaultBrand,
            ...parsed.brand,
            instagram: safeUrl(parsed.brand.instagram, defaultBrand.instagram),
            marketplace: safeUrl(parsed.brand.marketplace, defaultBrand.marketplace)
          };
          setBrand(nextBrand);
        }

        if (parsed.promoBanner && typeof parsed.promoBanner === 'object' && !Array.isArray(parsed.promoBanner)) {
          nextPromoBanner = {
            enabled: Boolean(parsed.promoBanner.enabled),
            badge: typeof parsed.promoBanner.badge === 'string' ? parsed.promoBanner.badge : 'PROMO',
            text: typeof parsed.promoBanner.text === 'string' ? parsed.promoBanner.text : ''
          };
          setPromoBanner(nextPromoBanner);
        }

        if (parsed.promoCodes !== undefined) {
          if (!Array.isArray(parsed.promoCodes)) {
            return { success: false, error: 'Field "promoCodes" harus berupa array.' };
          }
          const seen = new Set();
          nextPromos = parsed.promoCodes.map(sanitizePromoCode).filter((p) => {
            if (!p || seen.has(p.code)) return false;
            seen.add(p.code);
            return true;
          });
          setPromoCodes(nextPromos);
        }

        if (supabase) {
          const ops = [
            supabase.from('store_settings').upsert({
              id: 'default',
              brand: nextBrand,
              promo_banner: nextPromoBanner,
              updated_at: new Date().toISOString()
            })
          ];
          if (nextProducts && nextProducts.length > 0) {
            ops.push(supabase.from('products').upsert(nextProducts.map((p, idx) => productToDb(p, idx + 1))));
          }
          if (nextPromos && nextPromos.length > 0) {
            ops.push(supabase.from('promo_codes').upsert(nextPromos.map(promoToDb)));
          }
          Promise.all(ops).then(() => {
            recordAudit('BACKUP_IMPORT', 'JSON', 'Pulihkan data toko dari file backup JSON');
          });
        } else {
          recordAudit('BACKUP_IMPORT', 'JSON', 'Pulihkan data toko dari file backup JSON');
        }

        return { success: true, data: { brand: nextBrand, promoBanner: nextPromoBanner } };
      } catch (err) {
        return { success: false, error: err.message };
      }
    },
    [brand, promoBanner, recordAudit]
  );

  const value = useMemo(
    () => ({
      isSupabaseConfigured,
      authUser,
      isAdmin,
      authLoading,
      signInAdmin,
      signOutAdmin,
      updateAdminPassword,
      uploadProductImage,
      brand,
      products,
      promoBanner,
      promoCodes,
      auditLogs,
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
    }),
    [
      authUser,
      isAdmin,
      authLoading,
      signInAdmin,
      signOutAdmin,
      updateAdminPassword,
      uploadProductImage,
      brand,
      products,
      promoBanner,
      promoCodes,
      auditLogs,
      adminPin,
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
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
