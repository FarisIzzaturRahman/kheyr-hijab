# KHEYR Hijab Showcase Website

Website showcase statis untuk brand hijab premium KHEYR. Fokusnya adalah visual branding, katalog produk, trust, dan conversion ke WhatsApp, Instagram, atau marketplace. Tidak ada checkout, payment, dashboard admin, atau backend.

## 1. Analisis Identitas Visual Logo

Logo `logo.jpg` menampilkan wordmark serif berwarna champagne di atas tekstur kain satin emerald gelap. Kesan utamanya premium, lembut, elegan, feminin, dan mature. Elemen satin memberi arah visual yang cocok untuk brand hijab karena langsung mengasosiasikan bahan, jatuh kain, dan kualitas.

**Brand direction**

- Premium modest fashion untuk muslimah modern.
- Visual bersih dengan ruang kosong yang lega.
- Perpaduan editorial fashion, product catalogue, dan trust-building landing page.
- CTA diarahkan ke WhatsApp, Instagram, dan marketplace.

**Moodboard verbal**

- Deep emerald satin, champagne foil, pearl white studio, warm beige wall, blush clay accent, soft floral prop, clean fashion photography.
- Elegant serif headline dengan body sans-serif yang rapi dan mudah dibaca.
- Card katalog ringan, border halus, shadow lembut, dan CTA yang jelas.

**Palet warna**

- Emerald Ink: `#061d18`
- Emerald Deep: `#092c25`
- Emerald Soft: `#123f35`
- Champagne: `#e8d9bd`
- Pearl: `#f8f5ef`
- Pearl Warm: `#fffaf2`
- Rose Clay: `#b98278`
- Muted Gold: `#a77b44`
- Sage: `#8fa08d`
- Ink Text: `#1b211f`

**Font pairing**

- Display: `Cormorant Garamond`, fallback `Georgia`, cocok dengan wordmark serif pada logo.
- Body/UI: `Plus Jakarta Sans`, fallback system sans, terasa modern, bersih, dan familiar untuk user Indonesia.

**UI style guide singkat**

- Background utama: pearl/off-white hangat.
- Section premium: emerald satin sebagai visual anchor.
- Button utama: rounded pill, champagne atau pearl di atas emerald.
- Product card: image besar 4:5, label kecil, harga jelas, swatch warna, CTA WhatsApp.
- Radius card: 8px agar tetap clean dan tidak terlalu playful.
- Motion: hover lift halus, image zoom lembut, FAQ accordion.

## 2. Sitemap

- `/` One-page landing
- `#beranda` Hero
- `#tentang` Tentang Brand
- `#koleksi` Katalog Produk
- `#keunggulan` Keunggulan Brand
- `#testimoni` Testimoni
- `#faq` FAQ
- `#kontak` Footer Kontak

## 3. Wireframe Section-by-Section

**Hero**

- Header sticky berwarna emerald gelap.
- Kiri: texture satin dari logo, nama KHEYR, tagline, copy singkat, CTA Lihat Koleksi dan Order via WhatsApp.
- Kanan: editorial hijab image bernuansa champagne.

**Tentang Brand**

- Kiri: cerita singkat brand dan value.
- Bawah copy: empat value cards ringkas.
- Kanan: image fashion product dengan overlay brand mini berbasis satin emerald.

**Katalog Produk**

- Heading koleksi dengan link ke Instagram.
- Responsive grid berisi product card.
- Setiap card memuat foto, label, kategori, nama, harga, deskripsi, swatch warna, dan tombol Tanya Produk.

**Keunggulan Brand**

- Full-width band pearl warm.
- Lima keunggulan dengan icon: bahan, jahitan, warna, versatile, packaging.

**Testimoni**

- Cards testimonial dengan rating, nama, kota, dan produk.
- Arrow dan dot indicator untuk memilih testimoni yang di-highlight.

**FAQ**

- Accordion dua kolom di desktop, satu kolom di mobile.
- Pertanyaan bahan, ukuran, warna, cara order, pengiriman, dan tukar barang.

**Footer**

- Brand summary.
- Navigasi.
- WhatsApp, Instagram, email.
- Jam operasional, alamat, pengiriman.

## 4. Struktur Project

```txt
.
├── public/images/              # Logo dan dummy product images
├── src/components/             # Section dan reusable components
├── src/data/content.js         # Semua teks, produk, harga, link, FAQ
├── src/styles/index.css        # Global style dan font import
├── tailwind.config.js          # Design tokens
└── design/kheyr-website-concept.png
```

## 5. Cara Edit Konten

Edit file `src/data/content.js` untuk mengganti:

- Nomor WhatsApp
- Link Instagram
- Link marketplace
- Nama produk
- Harga
- Label produk
- Deskripsi produk
- FAQ
- Testimoni

Ganti gambar produk di `public/images/`, lalu update path `image` pada item produk di `src/data/content.js`.

## 6. Menjalankan Project Lokal

```bash
npm install
npm run dev
```

Vite akan menampilkan URL lokal, biasanya `http://localhost:5173`.

## 7. Build Production

```bash
npm run build
npm run preview
```

Output production ada di folder `dist`.

## 8. Deploy ke Vercel

1. Push project ke GitHub.
2. Buka Vercel, pilih **Add New Project**.
3. Import repository.
4. Framework preset: **Vite**.
5. Build command: `npm run build`.
6. Output directory: `dist`.
7. Deploy.

## 9. Deploy ke Netlify

1. Push project ke GitHub.
2. Buka Netlify, pilih **Add new site**.
3. Import repository.
4. Build command: `npm run build`.
5. Publish directory: `dist`.
6. Deploy.

## 10. Catatan Asset

Gambar saat ini adalah dummy generated assets untuk membantu website terlihat siap jualan. Semua sudah ditempatkan di `public/images` agar mudah diganti dengan foto produk asli saat brand sudah memiliki photoshoot.
