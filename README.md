# 🇮🇩 NusantaraGo - Super-App Pariwisata Nasional Indonesia

Repositori resmi untuk pengembangan ekosistem **NusantaraGo**, aplikasi direktori pariwisata berbasis *crowdsourcing* dan *Online Travel Agent (OTA)* terintegrasi untuk 38 provinsi di Indonesia.

---

## 👥 Struktur Tim & Tata Kelola Scrum

Proyek ini dikembangkan menggunakan kerangka kerja **Agile Scrum (Scrum of Scrums / LeSS)** yang melibatkan 27 mahasiswa Sistem Informasi di bawah arahan langsung Product Owner.

* **Product Owner:** Denny J.C. Sihombing
* **Scrum Master:** Agentic Scrum Master
* **Tanggal Mulai Kick-Off (Sprint 1):** 10 November 2026
* **Durasi Sprint:** 2 Minggu per Sprint (Total 8 Sprint / 16 Minggu)

### Pembagian Squad & Alokasi Mahasiswa

| Squad | Area Fokus | Squad Lead | Anggota Tim |
| :--- | :--- | :--- | :--- |
| **Squad 1** | Direktori Wisata 38 Provinsi, Geospasial PostGIS & Crowdsourcing | **Caesar Gattaca** (202204560032) | Albertus Chandra Halim, Aloysia Carla Putri Haryadi, Anastasya Geovani Manurung, Bintang Neera, Brigid Pauline Ratu Patty Diaz, Cornelius Dicho Dharmawan |
| **Squad 2** | Mitra Pengelola (KYC), E-Ticketing & Tour Package Engine | **Syrillya Chantika Valentina Sitohang** (202204560029) | Edward Antonio Herlambang Hutauruk, Ezekiel Matheo Barus, Frans Nicholas Rafael, Gabriella Lavigne Pink, George Blaciano Kunemara Putra, Hesekiel Andhika Nainggolan |
| **Squad 3** | Transportasi Multi-Moda & Extranet Akomodasi Lokal (Homestay) | **Michael Devon Eka Putra** (202404560001) | Imanuel Julival Lumban Gaol, Jessica Hillary Hutahaean, Jo Suk Sin, Joel Oktavianus, Josue Freitas Da Costa, Linda Wati Purba |
| **Squad 4** | Core Architecture, Payment Gateway, Escrow Ledger & AI Services | **Rafael Elano Prasetya** (202404560054) | Oda Kartika Nuringtyasanti, Raden Roro Anindya Anggitoputri, Theodomiro Fidelio Tomasoa, Vicentius Elang Krisnanto, Yosep Hermawan |

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
├── services/
│   └── api-core/                # REST API Backend (NestJS / PostGIS / Redis)
├── docs/                        # Dokumentasi Arsitektur & Panduan API
└── blueprint_pengembangan_aplikasi_wisata_nusantarago.md
```

---

## 🔄 Alur Kerja GitHub (GitHub Flow)

1. **Ambil Issue:** Pilih tiket PBI di GitHub Projects yang telah disetujui Product Owner.
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
