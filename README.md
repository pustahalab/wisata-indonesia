# 🇮🇩 NusantaraGo - Super-App Pariwisata Nasional Indonesia

Repositori resmi untuk pengembangan ekosistem **NusantaraGo**, aplikasi direktori pariwisata berbasis *crowdsourcing* dan *Online Travel Agent (OTA)* terintegrasi untuk 38 provinsi di Indonesia.

---

## 👥 Struktur Tim & Tata Kelola Scrum

Proyek ini dikembangkan menggunakan kerangka kerja **Agile Scrum (Scrum of Scrums / LeSS)** yang melibatkan **27 mahasiswa Sistem Informasi** di bawah arahan langsung **Product Owner**. Pembagian tim dan kepemimpinan mengacu resmi pada berkas `team.xlsx` (*Sheet: Sistem Pendukung Keputusan*).

* **Product Owner:** Denny J.C. Sihombing
* **Scrum Master:** Denny J.C. Sihombing
* **Tanggal Mulai Kick-Off (Sprint 1):** 10 November 2026
* **Tenggat Rilis Penuh (Hard Deadline):** **22 Desember 2026** (Total 6 Minggu / 6 Weekly Sprints)

---

### Pembagian Resmi 5 Squad & Alokasi Mahasiswa

| Squad | Area Fokus Fitur | Squad Lead | Anggota Tim |
| :--- | :--- | :--- | :--- |
| **Squad 1** | Direktori Wisata 38 Provinsi, Geospasial PostGIS & Crowdsourcing Publik | **ODA KARTIKA NURINGTYASANTI** (202404560028) | Linda Wati Purba, Raden Roro Anindya Anggitoputri, Anastasya Geovani Manurung, Cornelius Dicho Dharmawan |
| **Squad 2** | Mitra Pengelola (KYC), Legalitas Pengelola & Sistem E-Ticketing | **GABRIELLA LAVIGNE PINK** (202404560020) | Edward Antonio Herlambang Hutauruk, Brigid Pauline Ratu Patty Diaz, Jo Suk Sin, Aloysia Carla Putri Haryadi |
| **Squad 3** | Tour Package Builder Engine, Open/Private Trip & Custom Bundling | **JESSICA HILLARY HUTAHAEAN** (202404560050) | Joel Oktavianus, Bintang Neera, Vicentius Elang Krisnanto, Albertus Chandra Halim |
| **Squad 4** | Transportasi Multi-Moda (First to Last-Mile) & Extranet Akomodasi/Homestay | **HESEKIEL ANDHIKA NAINGGOLAN** (202404560052) | Josue Freitas Da Costa, Syrillya Chantika Valentina Sitohang, Frans Nicholas Rafael, Theodomiro Fidelio Tomasoa, Caesar Gattaca, Yosep Hermawan |
| **Squad 5** | Core Infrastructure, Payment Gateway (Midtrans/Xendit), Escrow & AI Services | **GEORGE BLACIANO KUNEMARA PUTRA** (202404560049) | Rafael Elano Prasetya, Ezekiel Matheo Barus, Michael Devon Eka Putra, Imanuel Julival Lumban Gaol |

---

## 📁 Struktur Monorepo & Dokumentasi

```
wisata-indonesia/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   └── user_story.md        # Template PBI untuk GitHub Issues
│   ├── workflows/
│   │   └── ci.yml               # Automated CI Workflow
│   └── pull_request_template.md # Template PR mengawal Definition of Done
├── apps/
│   ├── mobile/                  # Aplikasi Flutter (Wisatawan & Scanner Tiket Mitra)
│   ├── web-portal/              # Portal Direktori Publik (Next.js)
│   └── admin-partner/           # Dashboard Kurasi & Extranet Mitra (Next.js)
├── kpi-app/                     # Dashboard Pemantauan KPI 27 Mahasiswa
├── services/
│   └── api-core/                # REST API Backend (NestJS / PostGIS / Redis)
├── docs/                        # Dokumentasi Resmi & Spesifikasi Teknis
│   ├── roadmap_pengembangan_nusantarago_deadline_22_desember_2026.md
│   └── dokumen_arsitektur_dan_spesifikasi_teknis_nusantarago.md
├── blueprint_pengembangan_aplikasi_wisata_nusantarago.md
└── team.xlsx                    # Pembagian Kelompok Resmi
```

---

## 📅 Roadmap Akselerasi 6 Sprint Mingguan (Selesai 22 Desember 2026)

* **[Sprint 1](https://github.com/pustahalab/wisata-indonesia/milestone/1) (10–17 Nov 2026):** Setup Monorepo, Database PostGIS, JWT Auth & Wireframe UI.
* **[Sprint 2](https://github.com/pustahalab/wisata-indonesia/milestone/2) (17–24 Nov 2026):** Core Directory, Radius Search ST_DWithin, Geotagging & Anti-Duplikasi Haversine.
* **[Sprint 3](https://github.com/pustahalab/wisata-indonesia/milestone/3) (24 Nov–01 Des 2026):** Onboarding Mitra KYC & Infrastruktur E-Ticketing QR Scanner.
* **[Sprint 4](https://github.com/pustahalab/wisata-indonesia/milestone/4) (01–08 Des 2026):** Tour Package Builder Engine & Integrasi Payment Gateway (Escrow Ledger).
* **[Sprint 5](https://github.com/pustahalab/wisata-indonesia/milestone/5) (08–15 Des 2026):** Transportasi Multi-Moda, Extranet Homestay & Inventory Locking (Redis Redlock).
* **[Sprint 6](https://github.com/pustahalab/wisata-indonesia/milestone/6) (15–22 Des 2026):** AI Smart Itinerary Gemini API, Tombol SOS BMKG/SAR, Load Testing K6, UAT & Handover Resmi ke PO (**22 Desember 2026**).

Tinjau tiket kerja:  
📋 **[Daftar 40 GitHub Issues](https://github.com/pustahalab/wisata-indonesia/issues)**  
🎯 **[Daftar 6 GitHub Milestones](https://github.com/pustahalab/wisata-indonesia/milestones)**
