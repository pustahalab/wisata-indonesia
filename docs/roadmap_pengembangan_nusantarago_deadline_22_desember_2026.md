# Roadmap Akselerasi Pengembangan Super-App NusantaraGo
**Target Rilis Penuh:** 22 Desember 2026  
**Durasi Proyek:** 6 Minggu (10 November 2026 – 22 Desember 2026)  
**Product Owner:** Denny J.C. Sihombing  
**Model Eksekusi:** Agile Scrum of Scrums (Weekly Sprints / 5 Squads / 27 Mahasiswa)

---

## 1. Ikhtisar Eksekutif & Linimasa Akselerasi

Berdasarkan penetapan tenggat waktu ketat pada **22 Desember 2026**, ritme Scrum disesuaikan dari siklus 2 mingguan menjadi **6 Sprint Mingguan (Weekly Sprints)**. Pendekatan ini memungkinkan pengiriman fitur inkremental berkecepatan tinggi dengan evaluasi berkala bersama Product Owner setiap akhir pekan.

```mermaid
gantt
    title Linimasa Akselerasi NusantaraGo (Selesai 22 Desember 2026)
    dateFormat  YYYY-MM-DD
    section Sprint Roadmap
    Sprint 1: Fondasi, Monorepo & PostGIS        :active, s1, 2026-11-10, 2026-11-17
    Sprint 2: Core Directory & Crowdsourcing      :s2, 2026-11-17, 2026-11-24
    Sprint 3: Onboarding Mitra KYC & E-Ticketing  :s3, 2026-11-24, 2026-12-01
    Sprint 4: Tour Package & Escrow Payment       :s4, 2026-12-01, 2026-12-08
    Sprint 5: Transport, Homestay & Redlock       :s5, 2026-12-08, 2026-12-15
    Sprint 6: AI Itinerary, Load Test & Handover  :s6, 2026-12-15, 2026-12-22
```

---

## 2. Milestone Rinci per Sprint (Weekly Milestones)

### 🔹 Sprint 1 (10 Nov – 17 Nov 2026): Fondasi Monorepo, Database PostGIS & Desain Sistem
* **Target Utama:** Struktur monorepo aktif, skema database PostGIS siap, baseline autentikasi JWT berfungsi, dan wireframe UI/UX disetujui PO.
* **Tanggung Jawab 5 Squad:**
  * **Squad 1 (Lead: Oda):** DDL skema spasial `destinations` PostGIS, indeks GIST, dan wireframe UI direktori. (Issue [#1](https://github.com/pustahalab/wisata-indonesia/issues/1))
  * **Squad 2 (Lead: Gabriella):** Wireflow KYC mitra dan skema tabel `partners` & `destination_tickets`. (Issue [#2](https://github.com/pustahalab/wisata-indonesia/issues/2))
  * **Squad 3 (Lead: Jessica):** Desain relasi `tour_packages` dan `package_items`. (Issue [#3](https://github.com/pustahalab/wisata-indonesia/issues/3))
  * **Squad 4 (Lead: Hesekiel):** Skema `accommodations` & `transport_services`, inisialisasi Google Maps SDK. (Issue [#4](https://github.com/pustahalab/wisata-indonesia/issues/4))
  * **Squad 5 (Lead: George):** Setup Monorepo GitHub, CI/CD GitHub Actions, JWT & RBAC auth service. (Issue [#5](https://github.com/pustahalab/wisata-indonesia/issues/5))
* **Evaluasi PO (17 Nov):** Demo autentikasi login pengguna, konektivitas database spatial, dan persetujuan desain Figma.

---

### 🔹 Sprint 2 (17 Nov – 24 Nov 2026): Core Directory, GIS Radius Search & Crowdsourcing
* **Target Utama:** Pencarian destinasi radius 10–50 km berjalan lancar di Web & Mobile, publik dapat mengajukan lokasi baru ber-geotag, dan sistem anti-duplikasi aktif.
* **Tanggung Jawab 5 Squad:**
  * **Squad 1 (Lead: Oda):** Endpoint PostGIS `ST_DWithin`, klaster pin peta, ekstraksi geotag EXIF foto. (Issue [#6](https://github.com/pustahalab/wisata-indonesia/issues/6))
  * **Squad 2 (Lead: Gabriella):** Algoritma deteksi duplikasi lokasi Haversine 500m & antrean kurasi admin. (Issue [#7](https://github.com/pustahalab/wisata-indonesia/issues/7))
  * **Squad 3 (Lead: Jessica):** Komponen UI katalog paket wisata dan detail timeline jadwal tur harian. (Issue [#8](https://github.com/pustahalab/wisata-indonesia/issues/8))
  * **Squad 4 (Lead: Hesekiel):** Halaman detail fasilitas destinasi & integrasi prakiraan cuaca real-time BMKG. (Issue [#9](https://github.com/pustahalab/wisata-indonesia/issues/9))
  * **Squad 5 (Lead: George):** Pengindeksan cepat Elasticsearch & worker kompresi gambar otomatis WebP (BullMQ). (Issue [#10](https://github.com/pustahalab/wisata-indonesia/issues/10))
* **Evaluasi PO (24 Nov):** Demo pencarian geospasial real-time dan alur crowdsourcing tempat wisata baru.

---

### 🔹 Sprint 3 (24 Nov – 01 Des 2026): Onboarding Mitra (KYC) & Infrastruktur E-Ticketing
* **Target Utama:** Mitra resmi (BUMDes/Pokdarwis/Swasta) dapat mendaftar dengan upload berkas legalitas, dan e-tiket ber-QR Code siap dipindai di pintu masuk.
* **Tanggung Jawab 5 Squad:**
  * **Squad 1 (Lead: Oda):** Katalog destinasi terverifikasi dengan filter kategori 38 provinsi. (Issue [#11](https://github.com/pustahalab/wisata-indonesia/issues/11))
  * **Squad 2 (Lead: Gabriella):** Portal registrasi mitra (upload KTP/NIB/SK) & dashboard verifikasi admin. (Issue [#12](https://github.com/pustahalab/wisata-indonesia/issues/12))
  * **Squad 3 (Lead: Jessica):** Prototipe wizard Tour Package Builder (input open/private trip). (Issue [#13](https://github.com/pustahalab/wisata-indonesia/issues/13))
  * **Squad 4 (Lead: Hesekiel):** Modul manajemen kuota tiket harian (WNI/WNA, Weekday/Weekend). (Issue [#14](https://github.com/pustahalab/wisata-indonesia/issues/14))
  * **Squad 5 (Lead: George):** Generator QR Code e-tiket terenkripsi HMAC & aplikasi scanner validasi gerbang. (Issue [#15](https://github.com/pustahalab/wisata-indonesia/issues/15))
* **Evaluasi PO (01 Des):** Uji coba simulasi registrasi mitra dan scan QR tiket menggunakan aplikasi mobile.

---

### 🔹 Sprint 4 (01 Des – 08 Des 2026): Tour Package Builder & Payment Gateway (Escrow)
* **Target Utama:** Paket wisata dapat diracik dengan dynamic pricing pax, dan transaksi pembayaran digital (QRIS/VA) terintegrasi rekening penampungan (escrow).
* **Tanggung Jawab 5 Squad:**
  * **Squad 1 (Lead: Oda):** Integrasi filter paket wisata ke halaman pencarian utama direktori. (Issue [#16](https://github.com/pustahalab/wisata-indonesia/issues/16))
  * **Squad 2 (Lead: Gabriella):** Sistem kuota rombongan tur & konfirmasi booking tiket masuk objek wisata. (Issue [#17](https://github.com/pustahalab/wisata-indonesia/issues/17))
  * **Squad 3 (Lead: Jessica):** Tour Package Builder Engine lengkap (JSONB itinerary & dynamic pax tiering). (Issue [#18](https://github.com/pustahalab/wisata-indonesia/issues/18))
  * **Squad 4 (Lead: Hesekiel):** Integrasi relasi package items ke penginapan lokal dan armada transportasi. (Issue [#19](https://github.com/pustahalab/wisata-indonesia/issues/19))
  * **Squad 5 (Lead: George):** Integrasi Payment Gateway Midtrans/Xendit & skema pencatatan `escrow_ledgers`. (Issue [#20](https://github.com/pustahalab/wisata-indonesia/issues/20))
* **Evaluasi PO (08 Des):** Demo transaksi checkout end-to-end dengan QRIS sandbox dan verifikasi webhook escrow.

---

### 🔹 Sprint 5 (08 Des – 15 Des 2026): Transportasi Multi-Moda, Extranet Homestay & Inventory Lock
* **Target Utama:** Extranet homestay warga aktif, marketplace transportasi lokal siap, kalkulasi rute multi-moda berjalan, dan proteksi overbooking (Redis Redlock).
* **Tanggung Jawab 5 Squad:**
  * **Squad 1 (Lead: Oda):** Radius mapping penginapan dan transportasi terdekat & mobile custom trip cart UI. (Issues [#21](https://github.com/pustahalab/wisata-indonesia/issues/21), [#26](https://github.com/pustahalab/wisata-indonesia/issues/26))
  * **Squad 2 (Lead: Gabriella):** Otomatisasi payout escrow pasca scan tiket & validasi checkout multi-mitra atomik. (Issues [#22](https://github.com/pustahalab/wisata-indonesia/issues/22), [#27](https://github.com/pustahalab/wisata-indonesia/issues/27))
  * **Squad 3 (Lead: Jessica):** Bundling paket wisata dengan homestay & mesin rekomendasi paket kustom. (Issues [#23](https://github.com/pustahalab/wisata-indonesia/issues/23), [#28](https://github.com/pustahalab/wisata-indonesia/issues/28))
  * **Squad 4 (Lead: Hesekiel):** Extranet homestay (kalender kamar) & kalkulator estimasi rute multi-moda. (Issues [#24](https://github.com/pustahalab/wisata-indonesia/issues/24), [#29](https://github.com/pustahalab/wisata-indonesia/issues/29))
  * **Squad 5 (Lead: George):** Pencatatan bagi hasil komisi platform & **Inventory Locking 15 Menit (Redis Redlock)**. (Issues [#25](https://github.com/pustahalab/wisata-indonesia/issues/25), [#30](https://github.com/pustahalab/wisata-indonesia/issues/30))
* **Evaluasi PO (15 Des):** Demo pemesanan custom bundling multi-item dan pembuktian pencegahan race condition.

---

### 🔹 Sprint 6 (15 Des – 22 Des 2026): AI Itinerary, SOS BMKG, Load Testing, UAT & Handover Akhir
* **Target Utama: PENYELESAIAN PENUH & RILIS RESMI APLIKASI (22 DESEMBER 2026)**
* **Tanggung Jawab 5 Squad:**
  * **Squad 1 (Lead: Oda):** Offline map caching (blank spot) & optimasi performa LCP Frontend ($<2$ detik). (Issues [#31](https://github.com/pustahalab/wisata-indonesia/issues/31), [#36](https://github.com/pustahalab/wisata-indonesia/issues/36))
  * **Squad 2 (Lead: Gabriella):** Sistem review terverifikasi, gamifikasi poin & UAT modul mitra/tiket. (Issues [#32](https://github.com/pustahalab/wisata-indonesia/issues/32), [#37](https://github.com/pustahalab/wisata-indonesia/issues/37))
  * **Squad 3 (Lead: Jessica):** Integrasi paket tur ke output AI & UAT pemesanan paket wisata kustom. (Issues [#33](https://github.com/pustahalab/wisata-indonesia/issues/33), [#38](https://github.com/pustahalab/wisata-indonesia/issues/38))
  * **Squad 4 (Lead: Hesekiel):** Direktori UMKM/event budaya & UAT modul akomodasi/transportasi. (Issues [#34](https://github.com/pustahalab/wisata-indonesia/issues/34), [#39](https://github.com/pustahalab/wisata-indonesia/issues/39))
  * **Squad 5 (Lead: George):** Generator AI Itinerary (Gemini API), Tombol SOS BMKG/SAR, Load Testing K6 (2.000 VUs), Security Audit KYC & Handover resmi ke PO. (Issues [#35](https://github.com/pustahalab/wisata-indonesia/issues/35), [#40](https://github.com/pustahalab/wisata-indonesia/issues/40))
* **Evaluasi Final & Handover (22 Desember 2026):**
  * Presentasi komprehensif seluruh ekosistem NusantaraGo di hadapan **Product Owner: Denny J.C. Sihombing**.
  * Penandatanganan Berita Acara Penerimaan Produk (*Product Acceptance Sign-off*).

---

## 3. Matriks Kesiapan & Critical Path

| Tanggal | Target Kritis (*Milestone Checkpoint*) | Penanggung Jawab Utama |
| :---: | :--- | :--- |
| **17 Nov 2026** | Database Spasial & Wireframe UI disetujui PO | Squad 1 & Squad 5 |
| **24 Nov 2026** | Pencarian Geospasial & Crowdsourcing Live | Squad 1 & Squad 2 |
| **01 Des 2026** | Onboarding KYC Mitra & E-Ticketing QR Validated | Squad 2, 4, 5 |
| **08 Des 2026** | Transaksi Checkout Payment Gateway & Escrow Live | Squad 3 & Squad 5 |
| **15 Des 2026** | Transportasi, Homestay & Redis Redlock Terintegrasi | Squad 4 & Squad 5 |
| **22 Des 2026** | **RILIS FINAL: Lolos Load Test, UAT & Handover ke PO** | **Seluruh Tim & PO** |
