# Blueprint Pengembangan & Product Requirements Document (PRD)
**Proyek:** Ekosistem Super-App Pariwisata Nasional Indonesia (NusantaraGo)  
**Dokumen:** Spesifikasi Teknis & Rencana Pengembangan Sistem  

---

## 1. Visi Produk & Ekosistem Pengguna (User Roles)
Aplikasi ini mengintegrasikan **Direktori Wisata Berbasis Komunitas (Crowdsourced Directory)** dengan **Online Travel Agent (OTA) & Marketplace Paket Wisata**. Sistem membagi hak akses menjadi 4 peran utama:

1. **Wisatawan (End-User):** Mencari destinasi, mendaftarkan destinasi baru (*crowdsourcing*), menyusun *itinerary*, memesan paket wisata, tiket masuk, transportasi, dan akomodasi, serta memberikan ulasan.
2. **Mitra Pengelola / Vendor (B2B Partner):** Terbagi menjadi Pengelola Objek Wisata (Desa Wisata/BUMDes/Swasta/Pemda), Agen Perjalanan (*Tour Operator*), Penyedia Akomodasi (Hotel/Homestay/Glamping), dan Penyedia Transportasi Lokal (Rental Mobil/Kapal/Travel).
3. **Pemandu Wisata Lokal (Local Guide):** Individu bersertifikat yang menawarkan jasa pemanduan wisata yang dapat di-*bundling* ke dalam paket atau dipesan terpisah.
4. **Administrator & Kurator (Internal):** Memverifikasi pendaftaran objek wisata baru, memvalidasi legalitas mitra (KYC), mengelola penyelesaian sengketa (*dispute*), dan memantau transaksi keuangan.

---

## 2. Rincian Modul & Spesifikasi Fitur

### Modul 1: Direktori & Eksplorasi Destinasi (Core Directory)
Mencatat dan memetakan seluruh destinasi wisata dari 38 provinsi di Indonesia hingga tingkat desa.
* **Pencarian Geospasial & Filter Multi-Dimensi:** Pencarian berbasis lokasi (*radius search*), provinsi/kabupaten, kategori (Alam, Budaya, Sejarah, Kuliner, Buatan, Desa Wisata), estimasi anggaran, tingkat ramah disabilitas/anak, dan sertifikasi CHSE.
* **Halaman Detail Destinasi Komprehensif:** Menampilkan galeri foto/video $360^\circ$, jam operasional, harga tiket masuk (WNI/WNA, Hari Kerja/Akhir Pekan), fasilitas umum (toilet, tempat ibadah, sinyal seluler, tempat parkir), waktu terbaik berkunjung, dan prakiraan cuaca *real-time* (integrasi API BMKG).
* **Peta Interaktif & Mode Offline:** Integrasi peta dengan penanda (*clustering pin*) yang dapat diunduh per wilayah untuk digunakan di daerah minim sinyal (*blank spot*).

### Modul 2: Pendaftaran & Kurasi Objek Wisata (Crowdsourcing & Partner Onboarding)
Memungkinkan pencatatan destinasi wisata yang belum terjamah (*hidden gems*) maupun pendaftaran resmi oleh pengelola.
* **Alur Kontributor Publik (User-Generated):** Wisatawan dapat mengajukan tempat wisata baru dengan mengunggah foto ber-geotagging (validasi metadata EXIF), titik koordinat peta, deskripsi, dan akses jalan. Pengguna mendapatkan *poin reward/gamifikasi* jika pengajuan disetujui kurator.
* **Alur Klaim & Pendaftaran Mitra Resmi (KYB/KYC):** Pengelola resmi dapat mendaftarkan atau mengklaim destinasi yang sudah ada dengan mengunggah dokumen legalitas (KTP, NIB, atau SK Desa Wisata/Pokdarwis) untuk membuka fitur penjualan tiket (*e-ticketing*).
* **Sistem Moderasi Berjenjang:** Deteksi duplikasi lokasi otomatis menggunakan algoritma jarak koordinat (*Haversine/PostGIS*) dan antrean verifikasi bagi kurator sebelum tampil ke publik.

### Modul 3: Manajemen & Kustomisasi Paket Wisata (Tour Package Engine)
Fitur bagi agen perjalanan atau pengelola desa wisata untuk meracik dan menjual paket perjalanan.
* **Pembuat Paket (Package Builder):** Mitra dapat membuat paket *Open Trip* (kuota gabungan) atau *Private Trip* dengan jadwal harian (*day-by-day itinerary*), titik kumpul (*meeting point*), daftar fasilitas yang termasuk (*include/exclude*), dan kebijakan pembatalan.
* **Dynamic Pricing & Kuota:** Pengaturan harga bertingkat berdasarkan jumlah peserta (*tiering pax*), harga musiman (*high/low season*), dan batas ketersediaan kuota per tanggal keberangkatan.
* **Custom Trip Builder (Bagi Wisatawan):** Wisatawan dapat memilih beberapa destinasi, lalu sistem secara otomatis merekomendasikan kombinasi transportasi dan akomodasi terdekat menjadi satu keranjang pemesanan (*bundling*).

### Modul 4: Integrasi Transportasi & Logistik Perjalanan
Menghubungkan titik keberangkatan wisatawan hingga ke lokasi wisata (*First-Mile to Last-Mile Connectivity*).
* **Agregator Transportasi Antarkota (API Pihak Ketiga):** Integrasi pencarian dan pemesanan tiket pesawat, kereta api (KAI), kapal laut (Pelni/Ferry), dan bus AKAP untuk menuju kota/bandara terdekat dari destinasi.
* **Marketplace Transportasi Lokal (Last-Mile):** Pendaftaran dan pemesanan langsung untuk penyedia transportasi lokal yang tidak terjangkau OTA besar, seperti sewa mobil + sopir lokal, motor, *speedboat*/kapal penyeberangan pulau, hingga jip wisata (misal: Jeep Bromo/Merapi).
* **Estimasi Rute Multi-Moda:** Menampilkan panduan rute berantai (contoh: *Pesawat ke Bandara Silangit $\rightarrow$ Sewa Mobil 1,5 Jam $\rightarrow$ Kapal Ferry 30 Menit ke Pulau Samosir*).

### Modul 5: Integrasi Akomodasi Wisata
Menyediakan pilihan tempat menginap di sekitar radius objek wisata.
* **Akomodasi Lokal & Desa Wisata (Direct Extranet):** Sistem manajemen kamar (*Property Management System* sederhana) bagi pemilik *homestay* warga, *glamping*, *villa*, dan penginapan desa wisata untuk mengatur kalender ketersediaan kamar dan harga per malam.
* **Integrasi Hotel Komersial:** Koneksi API dengan agregator perhotelan untuk menampilkan hotel berbintang di sekitar lokasi wisata.
* **Radius Mapping:** Menampilkan daftar penginapan berdasarkan jarak tempuh aktual dari objek wisata yang sedang dilihat pengguna.

### Modul 6: Fitur Pendukung & Nilai Tambah (Supporting Features)
* **AI Smart Itinerary Planner:** Generator rencana perjalanan otomatis berbasis AI yang menyusun urutan destinasi, transportasi, dan hotel berdasarkan input durasi hari, anggaran, dan minat pengguna.
* **E-Ticketing & QR Scanner App:** Penerbitan tiket elektronik ber-QR Code untuk masuk ke objek wisata. Pengelola wisata memiliki mode pemindai (*scanner*) di aplikasi untuk memvalidasi tiket di gerbang masuk.
* **Direktori Kuliner, UMKM & Event Budaya:** Pencatatan toko oleh-oleh, kuliner khas sekitar destinasi, serta kalender acara/festival daerah (*Calendar of Events*).
* **Fitur Keamanan & SOS Darurat:** Tombol darurat yang mengirimkan koordinat GPS pengguna ke pusat bantuan aplikasi, kantor SAR/Polsek terdekat, serta notifikasi peringatan bencana dari BMKG/BNPB.

---

## 3. Arsitektur Teknis & Rekomendasi Tech Stack

Mengingat skala aplikasi mencakup transaksi keuangan, pencarian geospasial, dan trafik tinggi, arsitektur menggunakan pendekatan **Modular Monolith** pada fase awal yang siap dipecah menjadi **Microservices** saat skala membesar.

| Komponen Sistem | Teknologi Utama | Teknologi Alternatif | Fungsi & Penggunaan Spesifik |
| :--- | :--- | :--- | :--- |
| **Mobile App** | Flutter (Dart) | React Native | Aplikasi *cross-platform* (iOS & Android) untuk Wisatawan dan Mitra. |
| **Web Frontend** | Next.js (React, TypeScript) | Nuxt.js (Vue) | Portal Web (SEO-friendly untuk direktori wisata) & Dashboard Admin/Mitra. |
| **Backend API** | Node.js (NestJS) / Go | Python (FastAPI) | Layanan utama bisnis, autentikasi, manajemen pemesanan, dan integrasi API. |
| **Database Utama** | PostgreSQL + PostGIS | MySQL 8 (Spatial) | Penyimpanan data relasional, transaksi (ACID), dan *query* koordinat geospasial. |
| **Search & Caching** | Elasticsearch & Redis | Meilisearch & Redis | Pencarian teks cepat (*typo-tolerant*), filter lokasi instan, dan *inventory locking*. |

### Infrastruktur & Integrasi Pihak Ketiga (Third-Party APIs)
* **Payment Gateway:** Midtrans atau Xendit (mendukung QRIS, Virtual Account, E-Wallet, Kartu Kredit, dan fitur *Split Payment / Escrow* untuk bagi hasil otomatis ke rekening mitra).
* **Peta & Geospasial:** Google Maps Platform (Places, Directions, Distance Matrix API) dikombinasikan dengan Mapbox untuk kustomisasi visual peta wisata.
* **Media Storage & CDN:** AWS S3 atau Google Cloud Storage dengan Cloudflare CDN untuk kompresi dan distribusi foto/video destinasi secara cepat.
* **Notifikasi & Komunikasi:** Firebase Cloud Messaging (Push Notification), WhatsApp Business API (pengiriman e-tiket dan OTP), dan SendGrid (Email).

---

## 4. Desain Skema Basis Data Inti (Core Database Schema)

Developer perlu membangun relasi tabel utama dengan struktur entitas berikut:

1. **`users`**: `id`, `role` (`tourist`, `partner`, `admin`), `name`, `email`, `phone`, `kyc_status`, `point_balance`, `created_at`.
2. **`partners`**: `id`, `user_id`, `business_name`, `partner_type` (`attraction`, `tour_agent`, `accommodation`, `transport`), `legal_doc_url`, `bank_account_info`, `is_verified`.
3. **`destinations`**: `id`, `submitted_by_user_id`, `managed_by_partner_id`, `name`, `slug`, `province_id`, `regency_id`, `category_id`, `coordinates` (PostGIS Point), `address`, `description`, `facilities` (JSONB), `operating_hours` (JSONB), `status` (`pending`, `approved`, `rejected`), `rating_avg`.
4. **`destination_tickets`**: `id`, `destination_id`, `ticket_name`, `visitor_type` (`domestic`, `foreign`), `day_type` (`weekday`, `weekend`), `price`, `daily_quota`.
5. **`accommodations` & `accommodation_rooms`**: Menyimpan data properti penginapan, titik lokasi, tipe kamar, kapasitas tamu, harga per malam, dan stok kamar harian (`room_availability_calendar`).
6. **`transport_services`**: Menyimpan data armada lokal (mobil, kapal, bus), rute layanan, kapasitas penumpang, sistem sewa (lepas kunci, dengan sopir, per rute), dan tarif.
7. **`tour_packages`**: `id`, `partner_id`, `title`, `package_type` (`open_trip`, `private_trip`), `duration_days`, `min_pax`, `max_pax`, `base_price`, `itinerary_details` (JSONB).
8. **`package_items` (Tabel Pivot/Relasi)**: Menghubungkan `tour_packages` dengan `destinations`, `accommodation_rooms`, dan `transport_services` untuk membentuk satu kesatuan paket.
9. **`bookings` & `booking_items`**: Mencatat transaksi induk, kode *booking*, rincian item yang dipesan (tiket wisata / paket / hotel / transportasi), tanggal kunjungan, status pembayaran (`unpaid`, `paid`, `refunded`), dan kode QR tiket.
10. **`escrow_ledgers`**: Mencatat penahanan dana di sistem dan pencairan dana otomatis (*disbursement*) ke saldo mitra setelah wisatawan melakukan *check-in* atau memindai QR tiket.

---

## 5. Alur Bisnis Kritis (Key System Workflows)

### Alur 1: Pendaftaran & Verifikasi Objek Wisata Baru
1. Pengguna/Mitra mengisi formulir pendaftaran objek wisata, memilih titik di peta, dan mengunggah foto.
2. Backend menjalankan pengecekan Spasial (PostGIS) untuk mendeteksi apakah ada objek wisata dengan nama serupa dalam radius $500\text{ meter}$ (mencegah duplikasi data).
3. Data masuk ke antrean *Staging* di Dashboard Kurator dengan status `PENDING`.
4. Kurator memvalidasi kelayakan informasi; jika disetujui, status berubah menjadi `PUBLISHED` dan otomatis diindeks ke Elasticsearch agar langsung muncul di kolom pencarian.

### Alur 2: Pemesanan Terintegrasi (Bundling Package, Transport & Akomodasi)
1. Wisatawan memilih Paket Wisata (atau meracik sendiri destinasi + penginapan + sewa kendaraan lokal) dan memilih tanggal keberangkatan.
2. Sistem melakukan **Inventory Locking** (mengunci kuota kamar, kursi transportasi, dan kuota paket di Redis selama $15\text{ menit}$) agar tidak terjadi *overbooking* (pemesanan ganda).
3. Wisatawan menyelesaikan pembayaran melalui *Payment Gateway*.
4. Dana disimpan di rekening penampungan sistem (*Escrow*). Sistem menerbitkan *E-Voucher* dan *QR Code* terpadu untuk tiket masuk, *check-in* penginapan, dan bukti sewa transportasi.
5. Saat wisatawan tiba di lokasi dan mitra memindai *QR Code*, status pesanan berubah menjadi `COMPLETED`, dan sistem otomatis mencairkan dana (*payout*) ke saldo masing-masing mitra (pengelola wisata, pemilik homestay, dan penyedia transportasi) setelah dipotong komisi platform.

---

## 6. Standar Keamanan & Performa (Non-Functional Requirements)
* **Pencegahan Race Condition (Overbooking):** Menggunakan mekanisme *Distributed Lock* (Redis Redlock) dan transaksi database tingkat `SERIALIZABLE` saat memotong stok kamar atau kuota paket wisata.
* **Keamanan Transaksi & Data:** Enkripsi data sensitif (dokumen KTP/NIB mitra), penggunaan *Webhook Signature Verification* dari *payment gateway*, serta pembatasan frekuensi permintaan (*Rate Limiting*) untuk mencegah *scraping* data direktori wisata.
* **Optimasi Media:** Setiap foto objek wisata yang diunggah pengguna otomatis dikonversi ke format **WebP** dalam 3 ukuran (*thumbnail*, *medium*, *original*) menggunakan *background worker* (RabbitMQ/BullMQ) agar aplikasi tetap ringan saat diakses di jaringan 3G/4G daerah terpencil.

---

## 7. Peta Jalan Pengembangan (Development Roadmap)

Pengembangan dibagi ke dalam 4 fase berurutan (estimasi total 6–8 bulan hingga rilis penuh):

* **Fase 1: Fondasi & Direktori Wisata (Bulan 1–2)**
  * Perancangan UI/UX (Figma), penyusunan arsitektur database, dan pembuatan API dasar.
  * Pengembangan fitur Direktori Wisata, pencarian geospasial, serta fitur pendaftaran objek wisata oleh publik & kurasi admin (sekaligus proses *data seeding* awal untuk destinasi utama di 38 provinsi).
* **Fase 2: Portal Mitra & Manajemen Paket Wisata (Bulan 3–4)**
  * Pembangunan Dashboard Mitra (Onboarding KYC/KYB).
  * Pengembangan modul *Tour Package Builder* (Open/Private Trip) dan sistem *E-Ticketing* objek wisata beserta integrasi *Payment Gateway* & *Escrow*.
* **Fase 3: Ekosistem Transportasi & Akomodasi (Bulan 5–6)**
  * Pembangunan modul Extranet Akomodasi Lokal (Homestay/Villa) dan Marketplace Transportasi Lokal (Rental/Kapal).
  * Pengembangan fitur *Custom Bundling* (menggabungkan destinasi, penginapan, dan transportasi dalam satu keranjang transaksi).
* **Fase 4: Fitur Cerdas, Pengujian & Peluncuran (Bulan 7–8)**
  * Integrasi AI *Itinerary Generator*, mode peta *offline*, fitur SOS, serta sistem ulasan dan komisi afiliasi.
  * Pengujian beban (*Load Testing*), audit keamanan (*Penetration Testing*), *Beta Testing* bersama beberapa desa wisata percontohan, dan peluncuran resmi di Play Store, App Store, serta Web.