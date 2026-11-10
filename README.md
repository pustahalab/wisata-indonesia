# 🇮🇩 NusantaraGo - Super-App Pariwisata Nasional Indonesia

Repositori resmi untuk pengembangan ekosistem **NusantaraGo**, aplikasi direktori pariwisata berbasis *crowdsourcing* dan *Online Travel Agent (OTA)* terintegrasi untuk 38 provinsi di Indonesia.

---

## 👥 Struktur Tim & Tata Kelola Scrum

Proyek ini dikembangkan menggunakan kerangka kerja **Agile Scrum (Scrum of Scrums / LeSS)** yang melibatkan **27 mahasiswa Sistem Informasi** di bawah arahan langsung **Product Owner**. Pembagian tim dan kepemimpinan telah disesuaikan resmi mengacu pada berkas `team.xlsx` (*Sheet: Sistem Pendukung Keputusan*).

* **Product Owner:** Denny J.C. Sihombing
* **Scrum Master:** Agentic Scrum Master
* **Tanggal Mulai Kick-Off (Sprint 1):** 10 November 2026
* **Durasi Sprint:** 2 Minggu per Sprint (Total 8 Sprint / 16 Minggu)

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

## 📁 Struktur Monorepo

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
├── docs/                        # Dokumentasi Arsitektur & Panduan API
├── blueprint_pengembangan_aplikasi_wisata_nusantarago.md
└── team.xlsx                    # Pembagian Kelompok Resmi
```

---

## 🔄 Alur Kerja GitHub (GitHub Flow)

1. **Ambil Issue:** Pilih tiket PBI di GitHub Projects yang telah disetujui Product Owner (Denny J.C. Sihombing).
2. **Buat Branch:** Gunakan format `feat/squad<no>-<nama-fitur>` atau `fix/squad<no>-<nama-bug>` dari branch `staging`.
3. **Commit Sesuai Standar:** Gunakan konvensi Conventional Commits (e.g. `feat:`, `fix:`, `refactor:`, `test:`).
4. **Buka Pull Request:** Buat PR ke `staging` dengan mengisi checklist pada [pull_request_template.md](.github/pull_request_template.md).
5. **Review & Merge:** PR memerlukan minimal 2 persetujuan (wajib Squad Lead terkait) dan lolos pemeriksaan CI GitHub Actions.

---

## 📅 Roadmap Sprint (8 Sprint / 16 Minggu)

* **Sprint 1 (10 Nov 2026 - 24 Nov 2026):** Setup Monorepo, Database PostGIS, JWT Auth, dan Wireframe UI.
* **Sprint 2 (24 Nov 2026 - 08 Des 2026):** Core Directory, Radius Search, Geotagging & Algoritma Anti-Duplikasi.
* **Sprint 3 (08 Des 2026 - 22 Des 2026):** Onboarding Mitra KYC & Infrastruktur E-Ticketing QR Code.
* **Sprint 4 (22 Des 2026 - 05 Jan 2027):** Tour Package Builder & Integrasi Payment Gateway (Escrow).
* **Sprint 5 (05 Jan 2027 - 19 Jan 2027):** Marketplace Transportasi Lokal & Extranet Homestay.
* **Sprint 6 (19 Jan 2027 - 02 Feb 2027):** Custom Trip Bundling & Pencegahan Overbooking (Redis Redlock).
* **Sprint 7 (02 Feb 2027 - 16 Feb 2027):** AI Smart Itinerary, Peta Offline & SOS Darurat BMKG.
* **Sprint 8 (16 Feb 2027 - 02 Mar 2027):** Load Testing, Security Hardening, UAT & Release Demo ke PO.
