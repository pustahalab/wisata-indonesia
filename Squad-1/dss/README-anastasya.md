# Bagian Anastasya — Jalur Kurator & Tolak (R8–R14)

Bagian ini menjawab: *kapan entri harus dicek manusia, dan kapan langsung ditolak?*
Aturan R8–R14 memakai kesimpulan antara dari bagian Roro (`sup_data_layak`, `sup_geotag_janggal`, `sup_geotag_belum`).

## Tabel aturan R8–R14

| ID | Kondisi (IF) | Kesimpulan (THEN) | Sumber |
|---|---|---|---|
| R8 | sup_data_layak ∧ sup_geotag_janggal | **aksi_kurator** | Turunan R2 (foto jauh dari pin) |
| R9 | sup_data_layak ∧ sup_geotag_belum | **aksi_kurator** | Turunan R3 (tanpa GPS EXIF) |
| R10 | sup_data_layak ∧ entri_mirip | **aksi_kurator** | Arsitektur bag. 3B: duplikasi ≤ 500 m |
| R11 | sup_data_layak ∧ kontributor_bermasalah | **aksi_kurator** | Asumsi tim (rating kontributor < 3.0) |
| R12 | data_kurang | **aksi_tolak** | Blueprint Alur 1 |
| R13 | koordinat_luar_id | **aksi_tolak** | Spesifikasi SRID 4326 / wilayah Indonesia |
| R14 | entri_mirip ∧ sup_geotag_belum | **aksi_tolak** | Duplikat tanpa bukti geotag (asumsi tim) |

## Aturan prioritas konflik
Beberapa aturan bisa menyala bersamaan (mis. R9 dan R14). Prioritas: **TOLAK > VERIFIKASI KURATOR > PUBLIKASI OTOMATIS**.
Cara kerjanya: urutan kunci `conclusions` di `kb-squad1.json` dibuat publikasi → kurator → tolak, dan mesin memilih tujuan **terakhir** yang menyala.

## Skenario 2 — Perlu Dicek Kurator
| | |
|---|---|
| Fakta | data_lengkap, koordinat_dalam_id, exif_ada, geotag_jauh, entri_mirip, kontributor_baru |
| Siklus 1 | R2 → Geotag janggal · R4 → Data layak · R8 → VERIFIKASI KURATOR |
| **Hasil** | **VERIFIKASI KURATOR** |

## Skenario 3 — Ditolak (konflik prioritas)
| | |
|---|---|
| Fakta | data_lengkap, koordinat_dalam_id, exif_tidak_ada, entri_mirip, kontributor_baru |
| Siklus 1 | R3 → Geotag belum terverifikasi · R4 → Data layak · R9 → VERIFIKASI KURATOR · R14 → TOLAK |
| Kandidat | Verifikasi kurator, Tolak |
| **Hasil** | **TOLAK** (prioritas menang) |

## Keterbatasan (poin bagus untuk presentasi)
Mesin melewati aturan yang kesimpulannya sudah ada. Di skenario 2, R10 juga akan menyala (ada entri mirip) tetapi tidak tampil di trace karena R8 sudah menghasilkan `aksi_kurator`. Akibatnya penjelasan "mengapa" tidak lengkap.

## Bahan presentasi: forward vs backward chaining
- **Forward chaining** (dipakai di sini): mulai dari fakta entri, jalankan semua aturan yang cocok sampai muncul keputusan. Cocok karena semua data tersedia saat submit dan sistem memberi rekomendasi otomatis.
- **Backward chaining**: mulai dari tujuan ("layak publikasi?"), lalu mundur mencari fakta pendukung dan bertanya bila belum ada. Cocok untuk kurator yang mau mengecek satu entri secara interaktif.
