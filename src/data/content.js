export const brand = {
  name: 'KHEYR',
  tagline: 'Hijab yang menyempurnakan hari-harimu',
  intro:
    'Elegan dalam setiap helai. Nyaman dalam setiap langkah untuk muslimah modern yang ingin tampil anggun tanpa usaha berlebih.',
  whatsapp: '6281234567890',
  whatsappLabel: '0812-3456-7890',
  instagram: 'https://instagram.com/kheyr.hijab',
  instagramHandle: '@kheyr.hijab',
  email: 'hello@kheyr.co.id',
  marketplace: 'https://shopee.co.id/kheyr.hijab',
  address: 'Jakarta, Indonesia'
};

/**
 * Generate standardized, URL-encoded WhatsApp link
 * @param {string} message
 * @returns {string}
 */
export function getWhatsAppUrl(message) {
  return `https://wa.me/${brand.whatsapp}?text=${encodeURIComponent(message)}`;
}

export const waLinks = {
  order: getWhatsAppUrl('Assalamu alaikum KHEYR, saya ingin order hijab.'),
  catalog: getWhatsAppUrl('Assalamu alaikum KHEYR, saya ingin lihat katalog hijab.'),
  ask: getWhatsAppUrl('Assalamu alaikum KHEYR, saya ingin tanya koleksi hijab.'),
  stylist: getWhatsAppUrl('Assalamu alaikum KHEYR, saya ingin konsultasi gratis dengan Hijab Stylist untuk pilihan warna dan model.'),
  forProduct: (productName, color) => {
    const colorText = color ? ` warna ${color}` : '';
    return getWhatsAppUrl(`Assalamu alaikum KHEYR, saya ingin tanya dan order produk ${productName}${colorText}.`);
  }
};

export const colorMap = {
  Emerald: '#073d32',
  Sage: '#8f9f86',
  Ivory: '#f5efe2',
  Blush: '#e6beb9',
  Latte: '#b99d85',
  Pearl: '#e8d9bd',
  Taupe: '#a88e7f',
  Mocca: '#75594c',
  Stone: '#c6b9a9',
  Navy: '#151d36',
  'Dusty Pink': '#d7a3a1',
  Cream: '#f2e7d7',
  Champagne: '#d9c3a5',
  Almond: '#bda891',
  Olive: '#777d62',
  Sand: '#d5c2a7',
  Lavender: '#c8b6db',
  'Rose Quartz': '#d4a5a5',
  'Botanical Cream': '#f3eee3',
  Black: '#1f2022'
};

export const navItems = [
  { label: 'Beranda', href: '#beranda' },
  { label: 'Tentang', href: '#tentang' },
  { label: 'Koleksi', href: '#koleksi' },
  { label: 'Keunggulan', href: '#keunggulan' },
  { label: 'Testimoni', href: '#testimoni' },
  { label: 'FAQ', href: '#faq' }
];

export const productCategories = [
  'Semua',
  'Daily Hijab',
  'Square',
  'Shawl',
  'Pashmina',
  'Silk Series',
  'Instant Hijab'
];

export const catalogCategories = [
  'Semua Koleksi',
  'Square & Voile',
  'Pashmina & Shawl',
  'Silk & Formal',
  'Instant & Bergo',
  'Printed & Inner'
];

export const products = [
  {
    id: 'daily-voile',
    name: 'KHEYR Daily Voile',
    price: 'Rp 89.000',
    numericPrice: 89000,
    label: 'Best Seller',
    category: 'Daily Hijab',
    catalogCategory: 'Square & Voile',
    image: '/images/product-daily-voile.jpg',
    description: 'Voile premium yang ringan, jatuh, dan mudah dibentuk untuk aktivitas harian.',
    material: 'Ultrafine Voile Premium',
    size: '115 x 115 cm',
    finishing: 'Laser Cut / Jahit Tepi Presisi',
    careTips: 'Cuci dengan tangan, setrika dengan suhu sedang.',
    colors: ['Emerald', 'Sage', 'Ivory']
  },
  {
    id: 'soft-square',
    name: 'KHEYR Soft Square',
    price: 'Rp 109.000',
    numericPrice: 109000,
    label: 'New Arrival',
    category: 'Square',
    catalogCategory: 'Square & Voile',
    image: '/images/product-soft-square.jpg',
    description: 'Square scarf lembut dengan finishing jahit tepi rapi dan tampilan clean.',
    material: 'Korean Soft Voile Touch',
    size: '115 x 115 cm',
    finishing: 'Jahit Tepi Butik Halus',
    careTips: 'Gunakan deterjen cair lembut, hindari pemutih.',
    colors: ['Blush', 'Latte', 'Pearl']
  },
  {
    id: 'crinkle-shawl',
    name: 'KHEYR Crinkle Shawl',
    price: 'Rp 129.000',
    numericPrice: 129000,
    label: 'Textured',
    category: 'Shawl',
    catalogCategory: 'Pashmina & Shawl',
    image: '/images/product-crinkle-shawl.jpg',
    description: 'Tekstur crinkle elegan, anti kusut, nyaman untuk daily hingga formal.',
    material: 'Airflow Crinkle Breathable',
    size: '180 x 75 cm',
    finishing: 'Raw Fringe / Neat Edge',
    careTips: 'Tidak perlu disetrika (ironless), jemur di tempat teduh.',
    colors: ['Taupe', 'Mocca', 'Stone']
  },
  {
    id: 'premium-pashmina',
    name: 'KHEYR Premium Pashmina',
    price: 'Rp 139.000',
    numericPrice: 139000,
    label: 'Limited',
    category: 'Pashmina',
    catalogCategory: 'Pashmina & Shawl',
    image: '/images/product-premium-pashmina.jpg',
    description: 'Pashmina plisket premium untuk look anggun, modest, dan stylish.',
    material: 'Ceruty Baby Doll Premium Plisket',
    size: '175 x 75 cm (sebelum plisket)',
    finishing: 'Plisket Rapat & Jahit Kelim Rapi',
    careTips: 'Cuci celup perlahan, jangan diperas kencang.',
    colors: ['Navy', 'Dusty Pink', 'Cream']
  },
  {
    id: 'luna-silk',
    name: 'KHEYR Luna Silk',
    price: 'Rp 149.000',
    numericPrice: 149000,
    label: 'Premium',
    category: 'Silk Series',
    catalogCategory: 'Silk & Formal',
    image: '/images/product-luna-silk.jpg',
    description: 'Satin silk dengan kilau lembut, mewah, dan cocok untuk acara spesial.',
    material: 'Lustrous Silk Satin Non-Slippery',
    size: '115 x 115 cm',
    finishing: 'Laser Cut Exclusive Seal',
    careTips: 'Setrika dari sisi dalam dengan suhu rendah.',
    colors: ['Pearl', 'Champagne', 'Almond']
  },
  {
    id: 'sage-instant',
    name: 'KHEYR Sage Instant',
    price: 'Rp 99.000',
    numericPrice: 99000,
    label: 'Ready Stock',
    category: 'Instant Hijab',
    catalogCategory: 'Instant & Bergo',
    image: '/images/product-sage-instant.jpg',
    description: 'Instant hijab praktis dengan cutting rapi untuk tampilan effortless.',
    material: 'Jersey Lycra AirFlow Soft',
    size: 'Depan 75 cm, Belakang 85 cm',
    finishing: 'Double Stitching Awet',
    careTips: 'Dapat dicuci mesin dengan laundry bag.',
    colors: ['Sage', 'Olive', 'Sand']
  },
  {
    id: 'paris-premium',
    name: 'KHEYR Paris Ultrafine',
    price: 'Rp 95.000',
    numericPrice: 95000,
    label: 'Signature',
    category: 'Square',
    catalogCategory: 'Square & Voile',
    image: '/images/product-paris-premium.jpg',
    description: 'Bahan Paris Japan Ultrafine klasik dengan tekstur rapat, super tegak di dahi dan adem.',
    material: 'Paris Japan Ultrafine Grade A',
    size: '115 x 115 cm',
    finishing: 'Jahit Tepi Rapat Eksklusif',
    careTips: 'Cuci manual celup, jemur mendatar di tempat teduh.',
    colors: ['Almond', 'Champagne', 'Ivory']
  },
  {
    id: 'pleated-pashmina',
    name: 'KHEYR Lilac Pleated Shawl',
    price: 'Rp 135.000',
    numericPrice: 135000,
    label: 'Trending',
    category: 'Pashmina',
    catalogCategory: 'Pashmina & Shawl',
    image: '/images/product-pleated-pashmina.jpg',
    description: 'Pashmina plisket lidi super rapat dengan nuansa pastel lembut yang flowy dan anggun.',
    material: 'Soft Ceruty Plisket Micro-Lidi',
    size: '180 x 75 cm',
    finishing: 'Kelim Tepi Halus Tanpa Jahitan Kasar',
    careTips: 'Simpan digantung, jangan disetrika pada bagian plisket.',
    colors: ['Lavender', 'Blush', 'Cream']
  },
  {
    id: 'organza-silk',
    name: 'KHEYR Royale Organza',
    price: 'Rp 169.000',
    numericPrice: 169000,
    label: 'Luxury Formal',
    category: 'Silk Series',
    catalogCategory: 'Silk & Formal',
    image: '/images/product-organza-silk.jpg',
    description: 'Scarf organza silk dengan kilau shimmer mewah memikat untuk pesta pernikahan dan acara formal berkelas.',
    material: 'Shimmering Royale Organza Silk',
    size: '115 x 115 cm',
    finishing: 'Eksklusif Metallic Edge Sealing',
    careTips: 'Dry clean atau cuci celup tangan lembut.',
    colors: ['Rose Quartz', 'Champagne', 'Pearl']
  },
  {
    id: 'bergo-maryam',
    name: 'KHEYR Everyday Bergo',
    price: 'Rp 79.000',
    numericPrice: 79000,
    label: 'Daily Favorite',
    category: 'Instant Hijab',
    catalogCategory: 'Instant & Bergo',
    image: '/images/product-bergo-maryam.jpg',
    description: 'Bergo instan tali anti ribet berbahan jersey spandex super adem, menutup dada sempurna.',
    material: 'Premium Spandex Jersey Adem',
    size: 'Depan 78 cm, Belakang 90 cm',
    finishing: 'Jahit Kelim Rapi Tali Panjang',
    careTips: 'Aman untuk mesin cuci putaran lembut.',
    colors: ['Mocca', 'Latte', 'Sand']
  },
  {
    id: 'printed-series',
    name: 'KHEYR Heritage Botanical',
    price: 'Rp 159.000',
    numericPrice: 159000,
    label: 'Exclusive Print',
    category: 'Square',
    catalogCategory: 'Printed & Inner',
    image: '/images/product-printed-series.jpg',
    description: 'Voile motif ilustrasi bunga eksklusif bertema flora Nusantara dengan sentuhan warna pastel elegan.',
    material: 'Ultrafine Shiny Voile Digital Print',
    size: '115 x 115 cm',
    finishing: 'Laser Cut Crown Edge',
    careTips: 'Setrika suhu sedang, hindari pemutih kain.',
    colors: ['Botanical Cream', 'Blush', 'Sage']
  },
  {
    id: 'inner-ninja',
    name: 'KHEYR Bamboo Inner Ninja',
    price: 'Rp 59.000',
    numericPrice: 59000,
    label: 'Essentials',
    category: 'Instant Hijab',
    catalogCategory: 'Printed & Inner',
    image: '/images/product-inner-ninja.jpg',
    description: 'Ciput ninja anti pusing dan anti gerah berbahan serat bambu organik elastis menutup leher rapat.',
    material: '100% Organic Bamboo Fiber Stretch',
    size: 'All Size Stretch Fit',
    finishing: 'Flatlock Anti Gatal & Anti Tekanan Telinga',
    careTips: 'Cuci dengan tangan untuk menjaga elastisitas serat bambu.',
    colors: ['Sand', 'Black', 'Ivory']
  }
];

export const brandValues = [
  {
    title: 'Elegan & Feminin',
    description: 'Palet warna lembut dengan styling yang anggun dan mudah dipadukan.'
  },
  {
    title: 'Nyaman Seharian',
    description: 'Material ringan, adem, dan tidak mudah membuat gerah saat digunakan.'
  },
  {
    title: 'Kualitas Terbaik',
    description: 'Finishing rapi, jahitan kuat, dan detail produk yang terasa premium.'
  },
  {
    title: 'Timeless',
    description: 'Desain bersih yang cocok untuk daily look, kuliah, kerja, hingga acara formal.'
  }
];

export const advantages = [
  {
    title: 'Bahan Berkualitas',
    description: 'Memilih material premium yang lembut, adem, dan nyaman di kulit.'
  },
  {
    title: 'Jahitan Rapi',
    description: 'Finishing detail dengan jahitan tepi yang kuat, halus, dan presisi.'
  },
  {
    title: 'Warna Elegan',
    description: 'Koleksi warna terpilih yang timeless dan mudah dipadukan.'
  },
  {
    title: 'Versatile',
    description: 'Cocok untuk daily look, kerja, kajian, acara keluarga, hingga formal.'
  },
  {
    title: 'Packaging Eksklusif',
    description: 'Dikemas cantik, aman, dan siap menjadi hadiah spesial.'
  }
];

export const testimonials = [
  {
    name: 'Aisyah N.',
    city: 'Jakarta',
    rating: 5,
    text:
      'Bahannya terbaik. Ringan, tegak di dahi, nyaman dipakai seharian tanpa gerah, dan warna emerald-nya cantik sekali.',
    product: 'Daily Voile',
    verified: true
  },
  {
    name: 'Dinda R.',
    city: 'Bandung',
    rating: 5,
    text:
      'Jahitan rapi banget, packaging box mewah, dan warna aslinya sesuai foto katalog. Sudah repeat order 3 kali!',
    product: 'Soft Square',
    verified: true
  },
  {
    name: 'Salma H.',
    city: 'Surabaya',
    rating: 5,
    text:
      'Luna Silk kilau satinnya mewah dan tidak licin waktu dipakai. KHEYR jadi andalan saya untuk acara formal dan kondangan.',
    product: 'Luna Silk',
    verified: true
  },
  {
    name: 'Nabila F.',
    city: 'Depok',
    rating: 5,
    text:
      'Crinkle Shawl-nya ironless beneran, praktis buat traveling. Warnanya kalem dan admin sangat ramah waktu bantu pilih warna.',
    product: 'Crinkle Shawl',
    verified: true
  }
];

export const faqs = [
  {
    question: 'Bahan hijab yang digunakan apa?',
    answer:
      'Setiap koleksi memakai material pilihan premium seperti Ultrafine Voile, Korean Soft Voile, Paris Japan, Airflow Crinkle, Ceruty Baby Doll Plisket, Shimmer Organza, dan Lustrous Silk Satin. Semua material dipilih khusus agar adem, tidak licin, dan mudah dibentuk.'
  },
  {
    question: 'Ukuran hijab KHEYR berapa?',
    answer:
      'Ukuran disesuaikan dengan jenis hijab. Square scarf umumnya berukuran 115 x 115 cm, Pashmina & Shawl berukuran 175-180 x 75 cm, dan Instant Hijab serta Bergo memiliki panjang menutup dada yang ideal.'
  },
  {
    question: 'Apakah warna produk sama seperti di foto?',
    answer:
      'Foto produk diambil di studio dengan akurasi warna mendekati 95% warna asli. Sedikit perbedaan minor dapat terjadi karena pencahayaan dan resolusi layar perangkat Anda.'
  },
  {
    question: 'Bagaimana cara order?',
    answer:
      'Klik tombol "Pesan via WhatsApp", lalu pesan Anda akan otomatis terisi dengan nama produk & varian warna yang dipilih. Admin KHEYR akan langsung mengecek stok dan memandu pembayaran.'
  },
  {
    question: 'Berapa lama proses pengiriman?',
    answer:
      'Pesanan ready stock diproses 1-2 hari kerja setelah konfirmasi pembayaran. Kami bekerjasama dengan ekspedisi resmi (JNE, SiCepat, J&T) dengan estimasi 1-3 hari kerja untuk pulau Jawa.'
  },
  {
    question: 'Apakah ada garansi tukar barang jika cacat atau salah warna?',
    answer:
      'Tentu ada! Kami memberikan garansi retur/tukar produk 100% jika terdapat cacat produksi atau barang tidak sesuai pesanan. Cukup infokan ke admin kami maksimal 2 x 24 jam setelah paket diterima.'
  }
];
