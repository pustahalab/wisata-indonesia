# Aplikasi KPI Pengembangan NusantaraGo

Aplikasi KPI untuk mengukur pengerjaan aplikasi **NusantaraGo** oleh tim **Information System (27 anggota)**
berdasarkan dua dokumen terlampir:

| Sumber | Isi |
|---|---|
| `../ps (5).xls` | Daftar 27 anggota tim (ID kampus) + persentase kehadiran kelas |
| `../blueprint_pengembangan_aplikasi_wisata_nusantarago.md` | Rencana kerja: 6 modul fitur, tech stack, roadmap 4 fase (8 bulan) |

## Menjalankan

```bash
cd kpi-app
npm install
npm start
# buka http://localhost:3000
```

Data tersimpan di `data/db.json` (otomatis dibuat dari seed saat pertama dijalankan).
`npm run reset` mengembalikan data ke kondisi seed awal.

## Rumus KPI (per anggota)

Kehadiran **tidak dihitung** (permintaan pengguna); bobot diredistribusi ke kinerja pengerjaan:

| Komponen | Bobot | Sumber |
|---|---|---|
| Penyelesaian tugas | 40% | Bobot (story point) tugas *done* ÷ total bobot tugas yang ditangani |
| Ketepatan waktu | 30% | Tugas selesai sebelum tenggat ÷ tugas selesai |
| Kualitas | 30% | Rata-rata skor review (0–100) tugas yang selesai |

Predikat: **A** ≥ 90 (Sangat Baik), **B** ≥ 80 (Baik), **C** ≥ 70 (Cukup), **D** < 70 (Perlu Perbaikan).

## Struktur

```
kpi-app/
├── server.js          # Express: REST API + perhitungan KPI + serve frontend
├── lib/seed.js        # Data seed: 27 anggota, pembagian peran otomatis, 36 tugas dari blueprint
├── data/db.json       # Penyimpanan data (JSON file)
└── public/            # Frontend (SPA vanilla JS + Chart.js)
    ├── index.html
    ├── app.js
    └── style.css
```

## Fitur

- **Ringkasan** — progress proyek, progress per fase roadmap, donut status tugas, KPI per disiplin, leaderboard Top 8.
- **Tim & KPI** — 27 anggota dengan disiplin (Backend 5, Frontend 5, Mobile 5, UI/UX 4, QA 4, Data/DevOps 4),
  skor KPI + predikat per orang, klik baris untuk detail pembobotan, filter & pencarian, tambah/ubah anggota.
- **Tugas Kerja** — 36 tugas hasil breakdown blueprint (Fase 1–4): ubah status inline, input skor kualitas,
  penugasan ganda (PJ lebih dari satu), tenggat dengan penanda telat, tambah tugas baru.
- **Pembagian Tugas** — kartu per anggota berisi daftar tugas yang ditangani, dikelompokkan per disiplin;
  ringkasan beban (total penugasan 76, rata-rata 2.8 tugas/orang, min 1, max 7).
  Setiap tugas telah di-assign minimal 2 anggota (peran utama + pendamping dari peran terkait).

- **Pembagian otomatis berpemerat** — round-robin per disiplin + *balancing pass*: anggota yang awalnya belum
  mendapat tugas disisipkan sebagai pendamping di tugas paling awal yang terkait disiplinnya.

## Catatan

- Status awal seed sengaja diisi sebagian (2 selesai, 2 dikerjakan) agar dashboard tidak kosong; gunakan
  **↺ Reset Data** di halaman untuk kembali ke seed.
- Endpoint API utama: `GET /api/state|dashboard|kpi`, CRUD `/api/members`, `/api/tasks`, `POST /api/reset`.
