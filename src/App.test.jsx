import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';
import { brand, navItems, productCategories, testimonials } from './data/content';

describe('KHEYR Hijab Web App - Full Frontend Suite & Admin CMS', () => {
  it('renders the brand title, tagline, and trust highlights in Hero', () => {
    render(<App />);
    const brandHeadings = screen.getAllByText(brand.name);
    expect(brandHeadings.length).toBeGreaterThan(0);
    expect(screen.getByText(brand.tagline)).toBeInTheDocument();
    expect(screen.getByText('4.9 / 5.0')).toBeInTheDocument();
    expect(screen.getByText('Koleksi Eksklusif Muslimah 2026')).toBeInTheDocument();
  });

  it('renders WhatsApp order CTA links', () => {
    render(<App />);
    const whatsappLinks = screen.getAllByRole('link', { name: /whatsapp|chat admin/i });
    expect(whatsappLinks.length).toBeGreaterThan(0);
  });

  it('renders category filter pills and products in collections', () => {
    render(<App />);
    productCategories.forEach((cat) => {
      expect(screen.getByRole('button', { name: cat })).toBeInTheDocument();
    });

    // Check first flagship collection rendered
    expect(screen.getByText('KHEYR Daily Voile')).toBeInTheDocument();
  });

  it('correctly filters and displays products for each category filter in Home collections', () => {
    render(<App />);

    const categoriesToTest = [
      { cat: 'Daily Hijab', expected: 'KHEYR Daily Voile', notExpected: 'KHEYR Luna Silk' },
      { cat: 'Square', expected: 'KHEYR Soft Square', notExpected: 'KHEYR Daily Voile' },
      { cat: 'Shawl', expected: 'KHEYR Crinkle Shawl', notExpected: 'KHEYR Soft Square' },
      { cat: 'Pashmina', expected: 'KHEYR Premium Pashmina', notExpected: 'KHEYR Crinkle Shawl' },
      { cat: 'Silk Series', expected: 'KHEYR Luna Silk', notExpected: 'KHEYR Premium Pashmina' },
      { cat: 'Instant Hijab', expected: 'KHEYR Sage Instant', notExpected: 'KHEYR Luna Silk' },
      { cat: 'Semua', expected: 'KHEYR Daily Voile', notExpected: null }
    ];

    categoriesToTest.forEach(({ cat, expected, notExpected }) => {
      const filterBtn = screen.getByRole('button', { name: cat });
      fireEvent.click(filterBtn);

      expect(screen.getByText(expected)).toBeInTheDocument();
      if (notExpected) {
        expect(screen.queryByText(notExpected)).not.toBeInTheDocument();
      }
    });
  });

  it('opens and closes Quick View modal on product interaction and shows active promo vouchers', () => {
    render(<App />);
    const productName = screen.getByText('KHEYR Daily Voile');
    fireEvent.click(productName);

    // Modal opens
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Ultrafine Voile Premium')).toBeInTheDocument();

    // Check Promo Voucher section with eligible promo for Daily Voile (NEWKHEYR: 0 min purchase)
    expect(screen.getByText(/Voucher & Promo Tersedia/i)).toBeInTheDocument();
    expect(screen.getByText('NEWKHEYR')).toBeInTheDocument();

    // Close modal via Close Button
    const closeBtn = screen.getByRole('button', { name: /tutup modal/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('navigates to Catalog Page, searches for items, and navigates back to Home', () => {
    render(<App />);

    // Click E-Katalog in Header
    const catalogNavBtns = screen.getAllByRole('button', { name: /e-katalog/i });
    expect(catalogNavBtns.length).toBeGreaterThan(0);
    fireEvent.click(catalogNavBtns[0]);

    // Catalog page is rendered
    expect(screen.getByText(/Seluruh Koleksi KHEYR/i)).toBeInTheDocument();
    expect(screen.getByText(/KHEYR Paris Ultrafine/i)).toBeInTheDocument();
    expect(screen.getByText(/KHEYR Royale Organza/i)).toBeInTheDocument();
    expect(screen.getByText(/KHEYR Everyday Bergo/i)).toBeInTheDocument();
    expect(screen.getByText(/KHEYR Bamboo Inner Ninja/i)).toBeInTheDocument();

    // Test Search Functionality
    const searchInput = screen.getByPlaceholderText(/cari hijab/i);
    fireEvent.change(searchInput, { target: { value: 'Organza' } });

    expect(screen.getByText('KHEYR Royale Organza')).toBeInTheDocument();
    expect(screen.queryByText('KHEYR Everyday Bergo')).not.toBeInTheDocument();

    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } });
    expect(screen.getByText('KHEYR Everyday Bergo')).toBeInTheDocument();

    // Test Back to Home
    const backBtn = screen.getByRole('button', { name: /kembali ke beranda/i });
    fireEvent.click(backBtn);

    // Home is visible again
    expect(screen.getByText(brand.tagline)).toBeInTheDocument();
  });

  it('allows admin authentication and manages promo codes CRUD', () => {
    // Set hash to #admin
    window.location.hash = 'admin';
    sessionStorage.removeItem('kheyr_admin_auth');

    render(<App />);

    // Login Gate
    expect(screen.getByText('Portal Admin KHEYR')).toBeInTheDocument();
    const pinInput = screen.getByPlaceholderText(/masukkan pin/i);
    const loginBtn = screen.getByRole('button', { name: /masuk ke dashboard/i });

    fireEvent.change(pinInput, { target: { value: 'kheyr2026' } });
    fireEvent.click(loginBtn);

    // Should be in Dashboard
    expect(screen.getByText('CMS Admin Panel')).toBeInTheDocument();

    // Switch to Promo Codes Tab
    const promoCodesTabBtn = screen.getByRole('button', { name: /kode promo & voucher/i });
    fireEvent.click(promoCodesTabBtn);

    expect(screen.getByText('Manajemen Voucher & Kode Promo')).toBeInTheDocument();
    expect(screen.getByText('KHEYRHEMAT')).toBeInTheDocument();
    expect(screen.getByText('SILKLUXURY')).toBeInTheDocument();

    // Open Create Promo Modal
    const createPromoBtn = screen.getByRole('button', { name: /buat kode promo baru/i });
    fireEvent.click(createPromoBtn);

    expect(screen.getByText(/Buat Voucher \/ Kode Promo Baru/i)).toBeInTheDocument();

    // Fill form
    const codeInput = screen.getByPlaceholderText(/KHEYRHEMAT/i);
    fireEvent.change(codeInput, { target: { value: 'BERKAHRAMADHAN' } });

    const savePromoBtn = screen.getByRole('button', { name: /simpan kode promo/i });
    fireEvent.click(savePromoBtn);

    // New code should appear in list
    expect(screen.getByText('BERKAHRAMADHAN')).toBeInTheDocument();

    // Cleanup hash
    window.location.hash = '';
  });

  it('renders testimonials and stays visible on next/previous navigation', () => {
    window.location.hash = '';
    render(<App />);
    expect(screen.getByText('Apa Kata Mereka?')).toBeInTheDocument();
    
    testimonials.forEach((t) => {
      expect(screen.getByText(t.name)).toBeInTheDocument();
    });

    const nextBtn = screen.getByRole('button', { name: /testimoni berikutnya/i });
    const prevBtn = screen.getByRole('button', { name: /testimoni sebelumnya/i });

    fireEvent.click(nextBtn);
    fireEvent.click(nextBtn);
    fireEvent.click(prevBtn);

    testimonials.forEach((t) => {
      expect(screen.getByText(t.name)).toBeInTheDocument();
    });
  });

  it('renders navigation links and trusted payment/shipping chips in footer', () => {
    window.location.hash = '';
    render(<App />);
    navItems.forEach((item) => {
      const links = screen.getAllByRole('link', { name: item.label });
      expect(links.length).toBeGreaterThanOrEqual(1);
    });
    expect(screen.getByText('Hubungi Kami')).toBeInTheDocument();
    expect(screen.getByText('JNE')).toBeInTheDocument();
    expect(screen.getByText('BCA')).toBeInTheDocument();
  });
});
