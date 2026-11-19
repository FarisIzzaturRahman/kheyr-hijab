import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { safeUrl, StoreProvider, useStore } from './StoreContext';

const wrapper = ({ children }) => <StoreProvider>{children}</StoreProvider>;

describe('StoreContext business logic, validation, and audit trail', () => {
  beforeEach(() => {
    try {
      localStorage.clear();
    } catch {
      // jsdom env without localStorage file
    }
  });

  it('sanitizes unsafe URLs with safeUrl', () => {
    expect(safeUrl('https://instagram.com/kheyr.hijab')).toBe('https://instagram.com/kheyr.hijab');
    expect(safeUrl('/images/product-daily-voile.jpg')).toBe('/images/product-daily-voile.jpg');
    expect(safeUrl('javascript:alert(1)', '#')).toBe('#');
    expect(safeUrl('data:text/html,test', '#')).toBe('#');
    expect(safeUrl('//evil.example/img.jpg', '#')).toBe('#');
  });

  it('calculates promo discounts accurately across edge cases', () => {
    const { result } = renderHook(() => useStore(), { wrapper });
    const sampleProduct = { id: 'luna-silk', price: 'Rp 200.000', numericPrice: 200000 };

    // Percentage with maxDiscount cap (20% of 200k = 40k, capped at 35k)
    const capped = result.current.calculatePromoDiscount(
      {
        code: 'CAP20',
        discountType: 'percentage',
        discountValue: 20,
        maxDiscount: 35000,
        minPurchase: 100000,
        applicableTo: 'all',
        isActive: true
      },
      sampleProduct
    );
    expect(capped.valid).toBe(true);
    expect(capped.discountAmount).toBe(35000);
    expect(capped.finalPrice).toBe(165000);

    // Fixed discount exceeding product price clamps to price (finalPrice = 0)
    const clamped = result.current.calculatePromoDiscount(
      {
        code: 'BIGFIX',
        discountType: 'fixed',
        discountValue: 500000,
        maxDiscount: 0,
        minPurchase: 0,
        applicableTo: 'all',
        isActive: true
      },
      sampleProduct
    );
    expect(clamped.valid).toBe(true);
    expect(clamped.discountAmount).toBe(200000);
    expect(clamped.finalPrice).toBe(0);

    // Rejects when below minPurchase
    const belowMin = result.current.calculatePromoDiscount(
      {
        code: 'MIN300',
        discountType: 'fixed',
        discountValue: 10000,
        minPurchase: 300000,
        applicableTo: 'all',
        isActive: true
      },
      sampleProduct
    );
    expect(belowMin.valid).toBe(false);

    // Rejects when specific product does not match
    const wrongProduct = result.current.calculatePromoDiscount(
      {
        code: 'ONLYOTHER',
        discountType: 'percentage',
        discountValue: 10,
        applicableTo: 'specific',
        applicableProductIds: ['daily-voile'],
        isActive: true
      },
      sampleProduct
    );
    expect(wrongProduct.valid).toBe(false);

    // Rejects inactive promo
    const inactive = result.current.calculatePromoDiscount(
      { code: 'OFF', discountType: 'percentage', discountValue: 10, isActive: false },
      sampleProduct
    );
    expect(inactive.valid).toBe(false);
  });

  it('rejects duplicate promo codes and clamps percentage to 100', () => {
    const { result } = renderHook(() => useStore(), { wrapper });

    let dupRes;
    act(() => {
      dupRes = result.current.addPromoCode({
        code: 'kheyrhemat',
        discountType: 'fixed',
        discountValue: 10000
      });
    });
    expect(dupRes.ok).toBe(false);

    let clampedRes;
    act(() => {
      clampedRes = result.current.addPromoCode({
        code: 'SUPER150',
        discountType: 'percentage',
        discountValue: 150
      });
    });
    expect(clampedRes.ok).toBe(true);
    expect(clampedRes.item.discountValue).toBe(100);
  });

  it('validates backup JSON on import and sanitizes unsafe URLs', () => {
    const { result } = renderHook(() => useStore(), { wrapper });

    let badJson;
    act(() => {
      badJson = result.current.importData('{broken json');
    });
    expect(badJson.success).toBe(false);

    let badProducts;
    act(() => {
      badProducts = result.current.importData(JSON.stringify({ products: [{ invalid: true }] }));
    });
    expect(badProducts.success).toBe(false);

    let sanitizedImport;
    act(() => {
      sanitizedImport = result.current.importData(
        JSON.stringify({
          brand: {
            name: 'KHEYR Test',
            instagram: 'javascript:alert(1)',
            marketplace: 'https://shopee.co.id/kheyr.hijab'
          },
          products: [
            {
              id: 'p1',
              name: 'Hijab Valid',
              price: 'Rp 95.000',
              image: 'javascript:evil()'
            }
          ]
        })
      );
    });
    expect(sanitizedImport.success).toBe(true);
    expect(result.current.brand.instagram).toBe('https://instagram.com/kheyr.hijab');
    expect(result.current.products[0].image).toBe('/images/product-daily-voile.jpg');
  });

  it('records audit logs on product mutations and resets cleanly', () => {
    const { result } = renderHook(() => useStore(), { wrapper });

    let created;
    act(() => {
      created = result.current.addProduct({
        name: 'KHEYR Audit Test',
        price: 'Rp 110.000',
        numericPrice: 110000,
        image: '/images/product-daily-voile.jpg'
      });
    });

    expect(result.current.auditLogs.some((l) => l.action === 'PRODUCT_CREATE' && l.target === 'KHEYR Audit Test')).toBe(
      true
    );

    act(() => {
      result.current.deleteProduct(created.id);
    });
    expect(result.current.products.some((p) => p.id === created.id)).toBe(false);

    act(() => {
      result.current.resetToDefaults();
    });
    expect(result.current.auditLogs[0].action).toBe('FACTORY_RESET');
  });
});
