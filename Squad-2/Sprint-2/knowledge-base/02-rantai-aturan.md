# 02 Rantai Aturan dan Pohon Keputusan (Squad 2)

Versi 3, selaras dengan 01-tabel-aturan.md dan 03-rules.json versi 3.

Mesin inferensi memakai forward chaining. Fakta dari pengajuan mitra masuk ke memori kerja. Aturan yang syaratnya terpenuhi menyala sampai tidak ada aturan baru. Aturan dievaluasi menurut urutan ID, dan R15 membaca dokumen_lengkap sehingga harus setelah R8.

## Dua tingkat keputusan

| Tingkat | Yang dinilai | Aturan |
|---|---|---|
| Akun mitra (KYC) | Kategori mitra dan dokumen KTP, NIB, SK | R1 sampai R8 |
| Pengajuan destinasi | Jarak lokasi, antrean kurasi, hasil kurasi | R9 sampai R15 |

TOLAK hanya berlaku untuk satu pengajuan destinasi (R11). Akun mitra dan destinasi lain milik mitra yang sama tidak terdampak.

## Rantai inferensi

```
kategori_mitra ──R1 / R2 / R3 / R4──> ktp_wajib, nib_wajib, sk_wajib ──────┐
ktp_diunggah, ktp_terbaca ────────R5──> ktp_valid ──┐                       │
nib_diunggah, nib_status_aktif ───R6──> nib_valid ──┼───────────────────────┤
sk_diunggah, sk_berlaku ──────────R7──> sk_valid ───┘                       │
                                                                            ▼
                                                        R8 dokumen_lengkap = ya
                                                                            │
jarak_terdekat_m <= 500 ──R9──> status_lokasi = POTENTIAL_DUPLICATE         │
        │                                │                                 │
        │                 ┌──────────────┼───────────────┬──────────────┐  │
        │      belum_ditinjau   duplikat_terkonfirmasi  perlu_bukti  bukan_duplikat
        │                 │              │               │              │  │
        │                R10            R11             R12             │  │
        │          MENUNGGU_KURASI     TOLAK           REVISI           │  │
        │                         (satu destinasi)  (bukti lokasi)      │  │
        │                                                               ▼  │
jarak_terdekat_m > 500 ─────────────────────────────R13──> lokasi_lolos = ya
                                                                         │  │
                                              ┌──────────────────────────┴──┴─────────┐
                                    dokumen_lengkap = ya                  dokumen_lengkap belum terpenuhi
                                              R14                                      R15
                                           SETUJUI                              REVISI (dokumen mitra)
```

Aturan jembatan (kesimpulan satu aturan menjadi syarat aturan lain, seperti R5 ke R6 di materi):
- R1 sampai R4 menjembatani kategori menuju R8
- R5 sampai R7 menjembatani status dokumen menuju R8
- R8 menjembatani dokumen menuju R14 dan R15
- R9 menjembatani jarak menuju R10 sampai R13
- R13 menjembatani lokasi menuju R14 dan R15

Rantai terpanjang ada 4 tingkat. Contoh: kategori_mitra menghasilkan ktp_wajib (R1), lalu dokumen_lengkap (R8), lalu lokasi_lolos (R13) dan rekomendasi (R14).

## Alur dua tahap dengan admin kurator

1. Sistem menjalankan KB. Jika jarak 500 m atau kurang, pengajuan ditandai POTENTIAL_DUPLICATE dan masuk antrean dengan status belum_ditinjau (R9, R10). Penandaan ini tidak menolak apa pun.
2. Admin kurator meninjau lalu mengisi status_antrean_kurasi.
3. Sistem menjalankan KB lagi dengan status baru. Hasilnya TOLAK untuk pengajuan itu (R11), REVISI bukti lokasi (R12), atau lanjut ke pengecekan dokumen (R13 sampai R15).

Dengan alur ini keputusan akhir tetap di tangan admin, sesuai prinsip human in the loop pada materi. Destinasi yang berbeda walaupun berjarak 500 m atau kurang tetap bisa lanjut (bukan_duplikat).

## Pohon keputusan (per pengajuan destinasi)

```
Pengajuan destinasi masuk (akun mitra sudah punya kategori dan dokumen)
│
├─ Jarak Haversine ke destinasi terdekat?
│   │
│   ├─ <= 500 m ──> POTENTIAL_DUPLICATE (R9), hanya ditandai
│   │   └─ Status antrean kurasi (diisi admin)?
│   │       ├─ belum_ditinjau ─────────> MENUNGGU_KURASI (R10)
│   │       ├─ duplikat_terkonfirmasi ─> TOLAK pengajuan ini saja (R11)
│   │       ├─ perlu_bukti ────────────> REVISI bukti lokasi (R12)
│   │       └─ bukan_duplikat ─────────> lokasi lolos (R13), lanjut ke dokumen
│   │
│   └─ > 500 m ──> lokasi lolos (R13), lanjut ke dokumen
│
└─ Dokumen wajib sesuai kategori lengkap dan valid? (R1 sampai R8)
    ├─ YA ──────> SETUJUI (R14)
    └─ TIDAK ───> REVISI dokumen mitra (R15)
```

Pengecekan dokumen hanya menentukan hasil akhir jika lokasi sudah lolos.

## Syarat dokumen menurut kategori (USULAN, dari R1 sampai R4)

| Kategori | KTP | NIB | SK |
|---|---|---|---|
| perorangan | wajib | wajib | tidak wajib |
| usaha_pariwisata | wajib | wajib | wajib |
| pokdarwis | wajib | tidak wajib | wajib |
| bumdes | wajib | wajib | wajib |

Isi tabel ini masih USULAN dan mengikuti 01-tabel-aturan.md. Pertanyaan K1 sampai K9 yang belum terjawab ada di 01-tabel-aturan.md dan 03-rules.json.

## Penjelasan keputusan

Setiap keputusan menampilkan daftar aturan yang menyala dan kolom explain di 03-rules.json. Contoh untuk TOLAK (Profil 3b): R2, R5, R6, R7, R8, R9, R11. Penjelasannya: lokasi berjarak 500 m atau kurang, admin kurator mengonfirmasi duplikat, dan hanya pengajuan destinasi itu yang ditolak sedangkan akun mitra tidak terdampak.
