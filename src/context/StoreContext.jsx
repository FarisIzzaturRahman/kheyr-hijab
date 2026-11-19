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
  AUDIT_LOGS: 'kheyr_audit_logs_v1',
  CART: 'kheyr_cart_v1'
};

const MAX_AUDIT_LOGS = 200;
const DEFAULT_VARIANT_STOCK = 20;

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

export const ORDER_STATUS_LABELS = {
  pending_payment: 'Menunggu Bayar',
  paid: 'Dibayar',
  packed: 'Dikemas',
  shipped: 'Dikirim',
  completed: 'Selesai',
  cancelled: 'Dibatalkan'
};

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

function writeStorage(key, value, force = false) {
  if (isSupabaseConfigured && !force) return;
  try {
    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  } catch {
    // ignore storage quota errors
  }
}

function buildDefaultVariantsMap(productList) {
  const map = {};
  productList.forEach((p) => {
    map[p.id] = {};
    (p.colors || []).forEach((color) => {
      map[p.id][color] = {
        id: `${p.id}-${color}`,
        stock: DEFAULT_VARIANT_STOCK,
        skuCode: `${p.id}-${color}`.toUpperCase().replace(/[^A-Z0-9]+/g, '-'),
        isActive: true
      };
    });
  });
  return map;
}

function dbRowsToVariantsMap(rows) {
  const map = {};
  rows.forEach((row) => {
    if (!map[row.product_id]) map[row.product_id] = {};
    map[row.product_id][row.color] = {
      id: row.id,
      stock: row.stock,
      skuCode: row.sku_code || '',
      weightGrams: row.weight_grams ?? 120,
      isActive: row.is_active !== false
    };
  });
  return map;
}

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

function dbToOrder(row) {
  return {
    id: row.id,
    orderCode: row.order_code,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    shippingAddress: row.shipping_address,
    notes: row.notes || '',
    subtotal: row.subtotal,
    discountAmount: row.discount_amount || 0,
    promoCode: row.promo_code || null,
    totalAmount: row.total_amount,
    status: row.status,
    courier: row.courier || '',
    trackingNumber: row.tracking_number || '',
    createdAt: row.created_at,
    items: Array.isArray(row.order_items)
      ? row.order_items.map((item) => ({
          id: item.id,
          productId: item.product_id,
          productName: item.product_name,
          color: item.color,
          unitPrice: item.unit_price,
          quantity: item.quantity,
          lineTotal: item.line_total
        }))
      : []
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
  const [variants, setVariants] = useState(() => buildDefaultVariantsMap(defaultProducts));
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
  const [orders, setOrders] = useState([]);

  // Cart state (always persisted in browser localStorage for shopper convenience)
  const [cart, setCart] = useState(() => {
    const saved = readStorage(STORAGE_KEYS.CART, []);
    return Array.isArray(saved) ? saved : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

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
    const [prodRes, variantRes, promoRes, settingsRes] = await Promise.all([
      supabase.from('products').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: false }),
      supabase.from('product_variants').select('*'),
      supabase.from('promo_codes').select('*').order('created_at', { ascending: false }),
      supabase.from('store_settings').select('*').eq('id', 'default').maybeSingle()
    ]);

    if (!prodRes.error && Array.isArray(prodRes.data) && prodRes.data.length > 0) {
      setProducts(prodRes.data.map(dbToProduct));
    }
    if (!variantRes.error && Array.isArray(variantRes.data)) {
      setVariants(dbRowsToVariantsMap(variantRes.data));
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

  const refreshOrders = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })
      .limit(100);
    if (!error && Array.isArray(data)) {
      setOrders(data.map(dbToOrder));
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
        refreshOrders();
      }
      return allowed;
    },
    [refreshPublicData, refreshAuditLogs, refreshOrders]
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

  // Persistence effects
  useEffect(() => writeStorage(STORAGE_KEYS.PRODUCTS, products), [products]);
  useEffect(() => writeStorage(STORAGE_KEYS.BRAND, brand), [brand]);
  useEffect(() => writeStorage(STORAGE_KEYS.PROMO, promoBanner), [promoBanner]);
  useEffect(() => writeStorage(STORAGE_KEYS.PROMO_CODES, promoCodes), [promoCodes]);
  useEffect(() => writeStorage(STORAGE_KEYS.AUDIT_LOGS, auditLogs), [auditLogs]);
  useEffect(() => writeStorage(STORAGE_KEYS.PIN, adminPin), [adminPin]);
  useEffect(() => writeStorage(STORAGE_KEYS.CART, cart, true), [cart]);

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

  // Stock helper
  const getVariantStock = useCallback(
    (productId, color) => {
      const entry = variants[productId]?.[color];
      if (!entry) return DEFAULT_VARIANT_STOCK;
      return entry.isActive === false ? 0 : Math.max(0, Number(entry.stock) || 0);
    },
    [variants]
  );

  const saveProductVariants = useCallback(
    async (productId, colorStockMap) => {
      const entries = Object.entries(colorStockMap);
      setVariants((prev) => {
        const nextForProduct = { ...(prev[productId] || {}) };
        entries.forEach(([color, stock]) => {
          const cleanStock = Math.max(0, parseInt(stock, 10) || 0);
          nextForProduct[color] = {
            ...(nextForProduct[color] || {}),
            stock: cleanStock,
            skuCode: `${productId}-${color}`.toUpperCase().replace(/[^A-Z0-9]+/g, '-'),
            isActive: true
          };
        });
        return { ...prev, [productId]: nextForProduct };
      });

      if (supabase && entries.length > 0) {
        const rows = entries.map(([color, stock]) => ({
          product_id: productId,
          color,
          sku_code: `${productId}-${color}`.toUpperCase().replace(/[^A-Z0-9]+/g, '-'),
          stock: Math.max(0, parseInt(stock, 10) || 0),
          is_active: true,
          updated_at: new Date().toISOString()
        }));

        const { error } = await supabase
          .from('product_variants')
          .upsert(rows, { onConflict: 'product_id,color' });

        if (!error) {
          recordAudit('STOCK_UPDATE', productId, `Perbarui stok ${entries.length} varian warna`);
        }
      }
    },
    [recordAudit]
  );

  // Cart Actions
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + (item.quantity || 0), 0), [cart]);

  const addToCart = useCallback(
    (product, color, quantity = 1) => {
      const chosenColor = color || product.colors?.[0] || 'Emerald';
      const availableStock = getVariantStock(product.id, chosenColor);
      if (availableStock <= 0) {
        return { ok: false, error: 'Maaf, stok warna ini sedang habis.' };
      }

      setCart((prev) => {
        const idx = prev.findIndex((item) => item.productId === product.id && item.color === chosenColor);
        if (idx >= 0) {
          const nextQty = Math.min(availableStock, prev[idx].quantity + quantity);
          return prev.map((item, i) => (i === idx ? { ...item, quantity: nextQty } : item));
        }
        return [
          ...prev,
          {
            productId: product.id,
            color: chosenColor,
            quantity: Math.min(availableStock, Math.max(1, quantity))
          }
        ];
      });
      return { ok: true };
    },
    [getVariantStock]
  );

  const updateCartQuantity = useCallback(
    (productId, color, quantity) => {
      if (quantity <= 0) {
        setCart((prev) => prev.filter((item) => !(item.productId === productId && item.color === color)));
        return;
      }
      const maxStock = getVariantStock(productId, color);
      setCart((prev) =>
        prev.map((item) =>
          item.productId === productId && item.color === color
            ? { ...item, quantity: Math.min(Math.max(1, maxStock), quantity) }
            : item
        )
      );
    },
    [getVariantStock]
  );

  const removeFromCart = useCallback((productId, color) => {
    setCart((prev) => prev.filter((item) => !(item.productId === productId && item.color === color)));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Cart-level promo calculator
  const calculateCartPromo = useCallback(
    (promoCodeObj, enrichedItems) => {
      if (!promoCodeObj || !promoCodeObj.isActive) {
        return { valid: false, discountAmount: 0, message: 'Kode promo tidak aktif.' };
      }
      const subtotal = enrichedItems.reduce((sum, item) => sum + item.lineTotal, 0);
      const eligibleSubtotal =
        promoCodeObj.applicableTo === 'specific'
          ? enrichedItems
              .filter((item) => promoCodeObj.applicableProductIds?.includes(item.productId))
              .reduce((sum, item) => sum + item.lineTotal, 0)
          : subtotal;

      if (eligibleSubtotal <= 0) {
        return { valid: false, discountAmount: 0, message: `Kode "${promoCodeObj.code}" tidak berlaku untuk produk di keranjang.` };
      }
      if (promoCodeObj.minPurchase > 0 && eligibleSubtotal < promoCodeObj.minPurchase) {
        return {
          valid: false,
          discountAmount: 0,
          message: `Minimal belanja Rp ${promoCodeObj.minPurchase.toLocaleString('id-ID')} untuk kode "${promoCodeObj.code}".`
        };
      }

      let discountAmount = 0;
      if (promoCodeObj.discountType === 'percentage') {
        const pct = Math.min(100, Math.max(0, Number(promoCodeObj.discountValue) || 0));
        discountAmount = Math.round((eligibleSubtotal * pct) / 100);
        if (promoCodeObj.maxDiscount > 0 && discountAmount > promoCodeObj.maxDiscount) {
          discountAmount = promoCodeObj.maxDiscount;
        }
      } else {
        discountAmount = Math.max(0, Number(promoCodeObj.discountValue) || 0);
        if (promoCodeObj.maxDiscount > 0 && discountAmount > promoCodeObj.maxDiscount) {
          discountAmount = promoCodeObj.maxDiscount;
        }
      }
      if (discountAmount > eligibleSubtotal) discountAmount = eligibleSubtotal;

      return {
        valid: true,
        code: promoCodeObj.code,
        discountAmount,
        finalTotal: Math.max(0, subtotal - discountAmount),
        message: `Hemat Rp ${discountAmount.toLocaleString('id-ID')}!`
      };
    },
    []
  );

  // Guest Checkout & Order Tracking
  const placeGuestOrder = useCallback(
    async ({ customerName, customerPhone, shippingAddress, notes = '', promoCode = '' }) => {
      if (cart.length === 0) {
        return { ok: false, error: 'Keranjang belanja masih kosong.' };
      }

      if (supabase) {
        const { data, error } = await supabase.rpc('create_guest_order', {
          p_customer_name: customerName,
          p_customer_phone: customerPhone,
          p_shipping_address: shippingAddress,
          p_notes: notes,
          p_promo_code: promoCode || null,
          p_items: cart.map((item) => ({
            productId: item.productId,
            color: item.color,
            quantity: item.quantity
          }))
        });

        if (error) {
          return { ok: false, error: error.message };
        }

        clearCart();
        refreshPublicData();
        return { ok: true, order: data };
      }

      // Local / test-mode fallback
      const enriched = [];
      for (const item of cart) {
        const product = products.find((p) => p.id === item.productId);
        if (!product) return { ok: false, error: `Produk tidak ditemukan: ${item.productId}` };
        const stock = getVariantStock(product.id, item.color);
        if (stock < item.quantity) {
          return { ok: false, error: `Stok tidak mencukupi untuk ${product.name} warna ${item.color}.` };
        }
        const unitPrice = product.numericPrice || 0;
        enriched.push({
          productId: product.id,
          productName: product.name,
          color: item.color,
          unitPrice,
          quantity: item.quantity,
          lineTotal: unitPrice * item.quantity
        });
      }

      const subtotal = enriched.reduce((sum, i) => sum + i.lineTotal, 0);
      let discountAmount = 0;
      let appliedCode = null;
      if (promoCode && promoCode.trim()) {
        const foundPromo = promoCodes.find((p) => p.code.toUpperCase() === promoCode.trim().toUpperCase());
        if (foundPromo) {
          const calc = calculateCartPromo(foundPromo, enriched);
          if (calc.valid) {
            discountAmount = calc.discountAmount;
            appliedCode = foundPromo.code;
          }
        }
      }

      // Decrement local variant stocks
      setVariants((prev) => {
        const next = { ...prev };
        enriched.forEach((item) => {
          const prodMap = { ...(next[item.productId] || {}) };
          const cur = prodMap[item.color] || { stock: DEFAULT_VARIANT_STOCK, isActive: true };
          prodMap[item.color] = { ...cur, stock: Math.max(0, cur.stock - item.quantity) };
          next[item.productId] = prodMap;
        });
        return next;
      });

      const orderCode = `KHY-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      const newOrder = {
        id: `ord-${Date.now()}`,
        orderCode,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        shippingAddress: shippingAddress.trim(),
        notes: notes.trim(),
        subtotal,
        discountAmount,
        promoCode: appliedCode,
        totalAmount: Math.max(0, subtotal - discountAmount),
        status: 'pending_payment',
        courier: '',
        trackingNumber: '',
        createdAt: new Date().toISOString(),
        items: enriched
      };

      setOrders((prev) => [newOrder, ...prev]);
      clearCart();
      return { ok: true, order: newOrder };
    },
    [cart, products, promoCodes, getVariantStock, calculateCartPromo, clearCart, refreshPublicData]
  );

  const trackGuestOrder = useCallback(
    async (orderCode, phone) => {
      if (supabase) {
        const { data, error } = await supabase.rpc('track_order', {
          p_order_code: orderCode,
          p_phone: phone
        });
        if (error) return { ok: false, error: error.message };
        if (!data) return { ok: false, error: 'Pesanan tidak ditemukan. Periksa Kode Order & No. WhatsApp.' };
        return { ok: true, order: data };
      }

      const cleanDigits = (phone || '').replace(/\D/g, '').slice(-8);
      const found = orders.find(
        (o) =>
          o.orderCode.toUpperCase() === (orderCode || '').trim().toUpperCase() &&
          o.customerPhone.replace(/\D/g, '').slice(-8) === cleanDigits
      );
      if (!found) return { ok: false, error: 'Pesanan tidak ditemukan. Periksa Kode Order & No. WhatsApp.' };
      return { ok: true, order: found };
    },
    [orders]
  );

  // Admin Order Management
  const updateOrderStatus = useCallback(
    async (orderId, { status, courier, trackingNumber }) => {
      const target = orders.find((o) => o.id === orderId);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                ...(status !== undefined ? { status } : {}),
                ...(courier !== undefined ? { courier } : {}),
                ...(trackingNumber !== undefined ? { trackingNumber } : {})
              }
            : o
        )
      );

      if (supabase) {
        const payload = {
          updated_at: new Date().toISOString(),
          ...(status !== undefined ? { status } : {}),
          ...(courier !== undefined ? { courier } : {}),
          ...(trackingNumber !== undefined ? { tracking_number: trackingNumber } : {})
        };
        const { error } = await supabase.from('orders').update(payload).eq('id', orderId);
        if (error) return { ok: false, error: error.message };
      }

      recordAudit(
        'ORDER_UPDATE',
        target?.orderCode || orderId,
        `Status: ${ORDER_STATUS_LABELS[status] || status}${trackingNumber ? ` | Resi: ${trackingNumber}` : ''}`
      );
      return { ok: true };
    },
    [orders, recordAudit]
  );

  const cancelOrder = useCallback(
    async (orderId) => {
      if (supabase) {
        const { error } = await supabase.rpc('cancel_order_and_restore_stock', { p_order_id: orderId });
        if (error) return { ok: false, error: error.message };
        await Promise.all([refreshOrders(), refreshPublicData(), refreshAuditLogs()]);
        return { ok: true };
      }

      const target = orders.find((o) => o.id === orderId);
      if (!target || target.status === 'cancelled') return { ok: true };
      setVariants((prev) => {
        const next = { ...prev };
        target.items.forEach((item) => {
          const prodMap = { ...(next[item.productId] || {}) };
          const cur = prodMap[item.color] || { stock: 0, isActive: true };
          prodMap[item.color] = { ...cur, stock: cur.stock + item.quantity };
          next[item.productId] = prodMap;
        });
        return next;
      });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: 'cancelled' } : o)));
      recordAudit('ORDER_CANCEL', target.orderCode, 'Batalkan pesanan & kembalikan stok otomatis');
      return { ok: true };
    },
    [orders, refreshOrders, refreshPublicData, refreshAuditLogs, recordAudit]
  );

  // Supabase Auth Actions
  const signInAdmin = useCallback(
    async (email, password) => {
      if (!supabase) return { ok: false, error: 'Supabase belum dikonfigurasi.' };
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });
      if (error) return { ok: false, error: error.message };
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
    if (supabase) await supabase.auth.signOut();
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
      if (!supabase) return { ok: false, error: 'Upload foto memerlukan koneksi Supabase Storage.' };
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

      if (uploadError) return { ok: false, error: uploadError.message };

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
      },
      forOrder: (order) => {
        const lines = (order.items || [])
          .map((i) => `- ${i.productName} (${i.color}) x${i.quantity} = Rp ${i.lineTotal.toLocaleString('id-ID')}`)
          .join('\n');
        const promoLine = order.promoCode
          ? `\nPromo (${order.promoCode}): -Rp ${order.discountAmount.toLocaleString('id-ID')}`
          : '';
        return getUrl(
          `Assalamu alaikum KHEYR, saya sudah membuat pesanan:\n\nKode Order: ${order.orderCode}\n${lines}${promoLine}\nTotal: Rp ${order.totalAmount.toLocaleString('id-ID')}\n\nMohon info nomor rekening & ongkir untuk pembayaran. Terima kasih!`
        );
      }
    };
  }, [brand.whatsapp]);

  // Mutation Actions for Products
  const addProduct = useCallback(
    (newProduct, initialStocks = null) => {
      const id =
        newProduct.id ||
        newProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
      const productWithId = {
        ...newProduct,
        id,
        image: safeUrl(newProduct.image, '/images/product-daily-voile.jpg')
      };

      setProducts((prev) => [productWithId, ...prev]);

      const stockMap = {};
      (productWithId.colors || ['Emerald']).forEach((color) => {
        stockMap[color] = initialStocks?.[color] ?? DEFAULT_VARIANT_STOCK;
      });

      if (supabase) {
        supabase
          .from('products')
          .insert(productToDb(productWithId, 0))
          .then(({ error }) => {
            if (!error) {
              saveProductVariants(id, stockMap);
              recordAudit('PRODUCT_CREATE', productWithId.name, `Tambah produk (${productWithId.price})`, null, productWithId);
            }
          });
      } else {
        saveProductVariants(id, stockMap);
        recordAudit('PRODUCT_CREATE', productWithId.name, `Tambah produk (${productWithId.price})`);
      }
      return productWithId;
    },
    [recordAudit, saveProductVariants]
  );

  const updateProduct = useCallback(
    (id, updatedFields, updatedStocks = null) => {
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
              if (updatedStocks) saveProductVariants(id, updatedStocks);
              recordAudit('PRODUCT_UPDATE', mergedItem.name, `Update produk (${mergedItem.price})`, beforeItem, mergedItem);
            }
          });
      } else {
        if (updatedStocks) saveProductVariants(id, updatedStocks);
        recordAudit('PRODUCT_UPDATE', sanitized.name || id, `Update produk (${sanitized.price || '-'})`);
      }
    },
    [recordAudit, saveProductVariants]
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
      if (!normalizedCode) return { ok: false, error: 'Kode promo tidak boleh kosong.' };
      if (promoCodes.some((p) => p.code.toUpperCase() === normalizedCode)) {
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
      if (normalizedCode && promoCodes.some((p) => p.id !== id && p.code.toUpperCase() === normalizedCode)) {
        return { ok: false, error: `Kode promo "${normalizedCode}" sudah digunakan promo lain.` };
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

    if (discountAmount > price) discountAmount = price;
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
    setVariants(buildDefaultVariantsMap(defaultProducts));
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
      version: '1.3.0',
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
      variants,
      getVariantStock,
      saveProductVariants,
      cart,
      cartCount,
      isCartOpen,
      setIsCartOpen,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      calculateCartPromo,
      placeGuestOrder,
      trackGuestOrder,
      orders,
      refreshOrders,
      updateOrderStatus,
      cancelOrder,
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
      variants,
      getVariantStock,
      saveProductVariants,
      cart,
      cartCount,
      isCartOpen,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      calculateCartPromo,
      placeGuestOrder,
      trackGuestOrder,
      orders,
      refreshOrders,
      updateOrderStatus,
      cancelOrder,
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
