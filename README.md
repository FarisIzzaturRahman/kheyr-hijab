# KHEYR Hijab — Luxury Modest Fashion Showcase & Interactive CMS

> **"Elegan dalam setiap helai. Nyaman dalam setiap langkah."**  
> Sebuah platform digital showcase berkelas editorial dan Content Management System (CMS) interaktif yang dirancang khusus untuk brand modest fashion muslimah modern Indonesia.

---

## 🌟 Tentang Proyek

**KHEYR Hijab Showcase** adalah aplikasi web modern yang menggabungkan estetika *editorial high-fashion*, kenyamanan eksplorasi katalog produk interaktif, dan kemudahan pengelolaan konten mandiri (*No-Code Admin Portal*). 

Dibangun dengan pendekatan *social-commerce first*, platform ini menjembatani calon pelanggan dari media sosial (Instagram, TikTok, WhatsApp) menuju pengalaman berbelanja visual yang memikat dengan tingkat konversi pemesanan yang tinggi.

---

## ✨ Fitur & Kapabilitas Utama

### 1. 🌸 Showcase Beranda Berkelas Editorial (`/`)
* **Hero Visual Berkesan Mewah**: Perpaduan tekstur satin emerald gelap, tipografi champagne yang anggun, badge koleksi eksklusif, serta rating kepuasan pelanggan.
* **Kurasi Koleksi Unggulan (*Hero Collections*)**: Menampilkan 6 produk flagship dengan selektor warna interaktif dan tombol *Quick View*.
* **Concierge Konsultasi Stylist & FAQ**: Tata letak berdampingan (*side-by-side*) dengan kartu konsultasi gratis hijab stylist yang tetap *sticky*, memudahkan pelanggan memilih hijab yang sesuai tone kulit.
* **Testimonial Slider Real-time**: Ulasan terverifikasi pelanggan setia yang tampil dinamis tanpa kendala layout shift.
* **Banner Pengumuman Promo Top Bar**: Pengumuman diskon toko yang dapat diaktifkan atau dinonaktifkan langsung oleh admin.

### 2. 🛍️ Halaman E-Katalog Lengkap (12 Koleksi) (`/#katalog`)
* **Live Search Instan**: Pencarian cerdas berdasarkan nama hijab (*cth: "organza", "bergo"*), jenis bahan (*"silk", "plisket", "voile"*), maupun nama warna (*"sage", "almond"*).
* **Multi-Kategori Filter**:
  * `Semua Koleksi (12)`
  * `Square & Voile` (Daily Voile, Soft Square, Paris Ultrafine)
  * `Pashmina & Shawl` (Crinkle Shawl, Premium Pashmina, Lilac Pleated)
  * `Silk & Formal` (Luna Silk, Royale Organza)
  * `Instant & Bergo` (Everyday Bergo Maryam, Sage Instant)
  * `Printed & Inner` (Heritage Botanical Print, Bamboo Inner Ninja)
* **Pengurutan Fleksibel (*Sorting*)**: Urutkan berdasarkan *Paling Populer*, *Harga: Termurah*, *Harga: Tertinggi*, dan *Nama: A - Z*.
* **Expanded Quick View & Texture Zoom**: Modal portaled dengan resolusi tinggi dan fitur zoom tekstur serat kain untuk melihat detail material.
* **Deep URL Hash Routing**: URL `/#katalog` siap disematkan di Bio Instagram / TikTok atau dibagikan CS di WhatsApp.

### 3. 🔐 Portal Admin & CMS Interaktif (`/#admin`)
* **Rute Tersembunyi & Gerbang PIN**: Akses terproteksi tanpa tombol terbuka di navigasi publik menggunakan sistem PIN keamanan.
* **Manajemen Produk Mandiri (CRUD)**: Form intuitif untuk menambah, mengedit, menduplikasi (*clone*), dan menghapus produk tanpa perlu menyentuh kode.
* **Pemilih Foto Model Studio Terstruktur**: Galeri visual 12 foto studio AI beresolusi tinggi dengan indikator foto aktif yang rapi.
* **Palette Warna Interaktif**: Klik langsung varian warna (*Emerald, Sage, Blush, Lavender, Sand, Mocca, dll.*) untuk memperbarui stok varian.
* **Pusat Pengaturan Kontak WhatsApp**: Mengubah nomor WhatsApp CS langsung memperbarui seluruh tautan pemesanan di seluruh website secara instan.

### 4. 🎟️ Sistem Voucher & Kode Promo Cerdas
* **Pengaturan Diskon Fleksibel**: Admin dapat membuat kode promo persentase (%) maupun potongan nominal (Rp).
* **Plafon Maksimal & Minimal Belanja**: Menjaga margin bisnis dengan menetapkan batas diskon maksimal dan syarat belanja minimum.
* **Cakupan Produk (*Scope Targeting*)**: Kupon dapat diatur berlaku untuk **Semua Koleksi** atau **Hanya Produk Tertentu**.
* **Simulasi Diskon & WhatsApp Checkout**: Pembeli dapat memilih kupon saat *Quick View*, melihat harga coret, dan kode kupon otomatis tertera rapi di pesan WhatsApp pemesanan.

### 5. 💾 Sinkronisasi Reaktif & Cadangan Data 1-Klik
* **Auto-Persist Storage**: Seluruh perubahan data toko dan katalog tersimpan otomatis di browser `localStorage`.
* **Export & Restore File Backup (JSON)**: Admin dapat mengunduh seluruh data toko dalam 1 file JSON dan memulihkannya kapan saja.
* **Factory Reset**: Fitur darurat untuk mengembalikan data ke pengaturan bawaan pabrik.

---

## 🎨 Identitas Visual & Desain Sistem

| Elemen Desain | Spesifikasi / Nilai |
| :--- | :--- |
| **Palet Warna Utama** | Deep Emerald (`#061d18`), Champagne Gold (`#e8d9bd`), Pearl Warm (`#fffaf2`) |
| **Aksen & Highlight** | Rose Clay (`#b98278`), Muted Gold (`#a77b44`), Sage Green (`#8f9f86`) |
| **Display Typography** | *Cormorant Garamond* (Serif Mewah & Anggun) |
| **Body & UI Typography** | *Plus Jakarta Sans* (Modern, Bersih & Nyaman Dibaca) |
| **Fotografi Aset** | Foto Studio Editorial AI Modest Fashion Resolusi Tinggi |

---

## 🏗️ Arsitektur Teknologi

* **Frontend Framework**: React 18 + Vite
* **Styling Engine**: Tailwind CSS + Custom Design Tokens (Emerald, Champagne, Pearl)
* **Iconography**: Lucide React
* **State & Data Engine**: Custom Reactive `StoreContext` dengan Auto-Persist Layer
* **Routing Architecture**: Zero-Reload Hash Routing (`#beranda`, `#katalog`, `#admin`) kompatibel dengan browser navigation history
* **Quality & Test Suite**: Vitest + React Testing Library (100% Passing Test Suite)

---

## 📄 Hak Cipta & Lisensi

Didesain dan dikembangkan dengan penuh dedikasi untuk industri modest fashion muslimah Indonesia.  
© 2026 **KHEYR Hijab**. All rights reserved.
