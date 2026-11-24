# 02 Rantai Aturan dan Pohon Keputusan (Squad 2)

Selaras dengan 01-tabel-aturan.md dan 03-rules.json. Semua contoh keluaran di bawah diambil dari eksekusi engine_test.py.

## Metode

Mesin inferensi memakai forward chaining. Keluarannya punya dua field terpisah: rekomendasi (SETUJUI, REVISI, TOLAK) dan status_tindak_lanjut (MENUNGGU_KURASI, MENUNGGU_VERIFIKASI_MITRA). Fakta masuk ke working memory, lalu aturan yang syaratnya terpenuhi menyala dan menambah kesimpulan baru sampai tidak ada aturan baru. Aturan dievaluasi urut ID. R12 membaca dokumen_lengkap dengan operator ne, sehingga R5 dan R6 harus ber-ID lebih kecil. engine_test.py memeriksa bahwa penghasil setiap fakta selalu lebih awal daripada pembacanya. Penelusuran mundur (dari kesimpulan ke fakta) dipakai oleh explanation facility untuk menunjukkan aturan mana yang mendasari rekomendasi.

## Dua tingkat keputusan

| Tingkat | Yang dinilai | Aturan |
|---|---|---|
| Dokumen akun mitra | partner_type dan dokumen | R1 sampai R6 |
| Pengajuan destinasi | Jarak, antrean kurasi, dokumen, status verifikasi mitra, hasil | R7 sampai R15 |

TOLAK dan SETUJUI hanya berlaku untuk satu pengajuan destinasi (R9, R13, R15). partners.is_verified dan destinasi lain tidak terdampak.

## Tiga status tidak digabung

| Status | Field | Pemutus | Peran KB |
|---|---|---|---|
| Verifikasi KYC mitra | partners.is_verified (pending, verified, rejected) | Reviewer KYC | dibaca sebagai syarat (R13 sampai R15), tidak diubah |
| Kurasi destinasi | destinations.status (pending, approved, rejected) | Admin kurator | tidak dibaca dan tidak diubah, hanya rekomendasi |
| Antrean kurasi | status_antrean_kurasi (belum_ditinjau, bukan_duplikat, duplikat_terkonfirmasi, perlu_bukti) | Admin kurator | dibaca (R7 sampai R11), tidak diubah |

Tidak ada aturan yang menulis partners.is_verified maupun destinations.status. Semua aturan akhir (R8, R9, R10, R12, R13, R14, R15) membawa akun_mitra_terdampak = tidak. R13 hanya berarti admin dapat menyetujui pengajuan destinasi itu. dokumen_lengkap (R5 dan R6) adalah prasyarat checklist bagi R13, bukan status verifikasi mitra. Mitra harus berstatus verified agar pengajuannya direkomendasikan SETUJUI, mitra pending menahan pengajuan (R14), dan mitra rejected menghasilkan TOLAK untuk pengajuan itu (R15).

## Fakta awal

| Kelompok | Fakta |
|---|---|
| Tipe mitra | partner_type (partners.partner_type, Sprint 1) |
| Status verifikasi mitra | status_verifikasi_mitra (partners.is_verified, Sprint 1), hanya dibaca |
| Penerapan dokumen Attraction (ya atau tidak) | nib_diperlukan, sk_pokdarwis_diperlukan, ditetapkan reviewer pada checklist |
| Checklist reviewer | ktp_diunggah, ktp_lolos_periksa, nib_diunggah, nib_lolos_periksa, izin_operasional_diunggah, izin_operasional_lolos_periksa, sk_pokdarwis_diunggah, sk_pokdarwis_lolos_periksa |
| Lokasi | jarak_terdekat_m (Haversine dari destinations.coordinates ke destinasi approved atau pending) |
| Review admin | status_antrean_kurasi (default belum_ditinjau saat R7 menyala) |

## Kesimpulan antara

ktp_valid (R1), nib_valid (R2), izin_operasional_valid (R3), sk_pokdarwis_valid (R4), dokumen_lengkap (R5 untuk attraction, R6 untuk tour_agent, accommodation, dan transport), status_lokasi = POTENTIAL_DUPLICATE (R7), lokasi_lolos (R11).

## Struktur keluaran

| Field | Nilai | Diisi oleh |
|---|---|---|
| rekomendasi | SETUJUI, REVISI, TOLAK, atau kosong | R9 (TOLAK), R10 (REVISI), R12 (REVISI), R13 (SETUJUI), R15 (TOLAK) |
| status_tindak_lanjut | MENUNGGU_KURASI, MENUNGGU_VERIFIKASI_MITRA, atau kosong | R8, R14 |

status_tindak_lanjut adalah status antrean atau penahanan, bukan rekomendasi. Setiap hasil mengisi tepat satu dari kedua field. Engine memeriksa invarian ini pada setiap eksekusi, dan memeriksa bahwa tidak ada aturan yang mengisi rekomendasi dengan nilai status tindak lanjut.

## Aturan jembatan

Kesimpulan satu aturan menjadi syarat aturan lain:
- R1 sampai R4 menjembatani checklist menuju R5 dan R6
- R5 dan R6 menjembatani dokumen menuju R12 (pengecualian), R13, R14, dan R15
- R7 menjembatani jarak menuju R8 sampai R11
- R11 menjembatani lokasi menuju R12 sampai R15

## Rantai inferensi

```
ktp_diunggah, ktp_lolos_periksa ──────────R1──> ktp_valid ─────────────────┐
nib_diunggah, nib_lolos_periksa ──────────R2──> nib_valid ─────────────────┤ R5 (attraction): izin valid, NIB tidak berlaku
izin_operasional_* ───────────────────────R3──> izin_operasional_valid ────┼ atau berlaku dan valid, SK tidak berlaku
sk_pokdarwis_* ───────────────────────────R4──> sk_pokdarwis_valid ────────┘ atau berlaku dan valid ──────> dokumen_lengkap
                                                                              R6 (tour_agent, accommodation, transport):
                                                                              KTP, NIB, dan izin valid ───> dokumen_lengkap

jarak_terdekat_m <= 500 ──R7──> status_lokasi = POTENTIAL_DUPLICATE (+ antrean belum_ditinjau jika kosong)
      belum_ditinjau ───────────R8──> status_tindak_lanjut = MENUNGGU_KURASI (pengajuan_destinasi, tanpa rekomendasi)
      duplikat_terkonfirmasi ───R9──> rekomendasi = TOLAK (hanya pengajuan destinasi)
      perlu_bukti ──────────────R10─> rekomendasi = REVISI (bukti lokasi)
      bukan_duplikat ───────────R11─┐
jarak_terdekat_m > 500 ─────────R11─┴─> lokasi_lolos
                                            │
          lokasi_lolos + dokumen belum lengkap ────────────────R12──> rekomendasi = REVISI (dokumen_mitra)
          lokasi_lolos + dokumen_lengkap + mitra verified ─────R13──> rekomendasi = SETUJUI (kurasi destinasi)
          lokasi_lolos + dokumen_lengkap + mitra pending ──────R14──> status_tindak_lanjut = MENUNGGU_VERIFIKASI_MITRA
          lokasi_lolos + dokumen_lengkap + mitra rejected ─────R15──> rekomendasi = TOLAK (pengajuan itu saja)
```

R5 dan R6 tidak pernah menyala bersamaan, dan R12 sampai R15 tidak pernah menyala bersamaan. Nilai penerapan NIB dan SK hanya ya atau tidak, dan R5 hanya menerima tidak, atau ya bersama dokumen valid.

Rantai terpanjang ada 3 aturan berurutan (4 tingkat fakta). Contoh dokumen: ktp_lolos_periksa menghasilkan ktp_valid (R1), lalu dokumen_lengkap (R5), lalu rekomendasi (R13). Contoh lokasi: status_lokasi dari jarak (R7), lalu lokasi_lolos (R11), lalu rekomendasi (R13). Nilai 3 dihitung dan diperiksa oleh engine_test.py.

## Kesimpulan akhir

| Aturan | Rekomendasi | Status tindak lanjut | Cakupan | partners.is_verified | Catatan |
|---|---|---|---|---|---|
| R8 | tidak ada | MENUNGGU_KURASI | pengajuan_destinasi | tidak diubah | Status antrean, bukan rekomendasi dan bukan keputusan |
| R9 | TOLAK | tidak ada | pengajuan_destinasi | tidak diubah | Hanya setelah admin mengonfirmasi duplikat |
| R10 | REVISI | tidak ada | pengajuan_destinasi | tidak diubah | Admin meminta bukti lokasi |
| R12 | REVISI | tidak ada | dokumen_mitra | tidak diubah | Dokumen wajib belum lengkap, dikembalikan ke mitra |
| R13 | SETUJUI | tidak ada | pengajuan_destinasi | tidak diubah (dibaca: verified) | Lokasi lolos, dokumen lengkap, mitra verified. Admin dapat menyetujui destinasi itu saja |
| R14 | tidak ada | MENUNGGU_VERIFIKASI_MITRA | pengajuan_destinasi | tidak diubah (dibaca: pending) | Pengajuan ditahan sampai reviewer KYC memutuskan |
| R15 | TOLAK | tidak ada | pengajuan_destinasi | tidak diubah (dibaca: rejected) | Pengajuan itu saja, status mitra tidak diubah KB |

## Alur dua tahap dengan admin kurator

1. KB berjalan. Jika jarak 500 m atau kurang, R7 menandai POTENTIAL_DUPLICATE dan R8 menaruh pengajuan di antrean. Tidak ada penolakan otomatis.
2. Admin kurator meninjau lalu mengisi status_antrean_kurasi. Admin tetap pengambil keputusan akhir.
3. KB berjalan lagi dengan status baru. Hasilnya rekomendasi TOLAK untuk pengajuan itu saja (R9), REVISI bukti lokasi (R10), atau lanjut ke pengecekan dokumen dan verifikasi mitra (R11 sampai R15).

SETUJUI bersama POTENTIAL_DUPLICATE hanya muncul jika admin sudah menyatakan bukan_duplikat dan mitra berstatus verified (lihat P6 di 04-skenario-pengujian.md).

## Pohon keputusan (per pengajuan destinasi)

```
Pengajuan destinasi masuk
│
├─ Jarak Haversine ke destinasi approved atau pending terdekat?
│   ├─ <= 500 m ──> POTENTIAL_DUPLICATE (R7), hanya ditandai
│   │   └─ status_antrean_kurasi (diisi admin)?
│   │       ├─ belum_ditinjau ─────────> status_tindak_lanjut MENUNGGU_KURASI (R8)
│   │       ├─ duplikat_terkonfirmasi ─> rekomendasi TOLAK pengajuan ini saja (R9)
│   │       ├─ perlu_bukti ────────────> rekomendasi REVISI bukti lokasi (R10)
│   │       └─ bukan_duplikat ─────────> lokasi lolos (R11), lanjut ke dokumen
│   └─ > 500 m ──> lokasi lolos (R11), lanjut ke dokumen
│
├─ Dokumen lengkap? (R1 sampai R4 lalu R5 untuk attraction, R6 untuk tipe lain)
│   ├─ TIDAK ──> rekomendasi REVISI dokumen_mitra (R12)
│   └─ YA ─────> lanjut ke status verifikasi mitra
│
└─ partners.is_verified (hanya dibaca)?
    ├─ verified ──> rekomendasi SETUJUI pengajuan ini saja (R13)
    ├─ pending ───> status_tindak_lanjut MENUNGGU_VERIFIKASI_MITRA (R14)
    └─ rejected ──> rekomendasi TOLAK pengajuan ini saja (R15)
```

Pengecekan dokumen dan verifikasi mitra hanya menentukan hasil akhir jika lokasi sudah lolos. Pengajuan yang lolos lokasi tidak pernah SETUJUI selama dokumen belum lengkap atau mitra belum berstatus verified.

## Working memory

Working memory berisi fakta masukan dan kesimpulan yang dicatat berurutan beserta aturan yang menghasilkannya. Contoh untuk P3b (attraction, 124,1 m, admin mengonfirmasi duplikat, NIB dan SK tidak berlaku, mitra verified). Field rekomendasi terisi dan status_tindak_lanjut kosong:

```
  1. [input] ktp_diunggah = ya
  2. [input] ktp_lolos_periksa = ya
  3. [input] nib_diunggah = tidak
  4. [input] nib_lolos_periksa = tidak
  5. [input] izin_operasional_diunggah = ya
  6. [input] izin_operasional_lolos_periksa = ya
  7. [input] sk_pokdarwis_diunggah = tidak
  8. [input] sk_pokdarwis_lolos_periksa = tidak
  9. [input] partner_type = attraction
  10. [input] status_verifikasi_mitra = verified
  11. [input] nib_diperlukan = tidak
  12. [input] sk_pokdarwis_diperlukan = tidak
  13. [input] jarak_terdekat_m = 124.1
  14. [input] status_antrean_kurasi = duplikat_terkonfirmasi
  15. [R1] ktp_valid = ya
  16. [R3] izin_operasional_valid = ya
  17. [R5] dokumen_lengkap = ya
  18. [R7] status_lokasi = POTENTIAL_DUPLICATE
  19. [R9] rekomendasi = TOLAK
  20. [R9] cakupan = pengajuan_destinasi
  21. [R9] akun_mitra_terdampak = tidak
```

## Certainty Factor

CF biner. Setiap aturan cf = 1.0 dan setiap kesimpulan yang muncul bernilai 1.0. Tidak ada CF di antara 0 dan 1 karena semua fakta dan aturan bersifat pasti.

## Explanation facility

Engine mencetak aturan yang menyala, kondisi dengan nilai sebenarnya, kesimpulan, alasan, sumber, dan catatan database. Contoh V1, yaitu Attraction dengan dokumen lengkap dan lokasi lolos tetapi mitra masih pending. Hasilnya tanpa rekomendasi dan berstatus tindak lanjut MENUNGGU_VERIFIKASI_MITRA:

```
Rekomendasi KB  : tidak ada (pengajuan ditahan lewat status tindak lanjut)
Status tindak   : MENUNGGU_VERIFIKASI_MITRA (antrean atau penahanan, bukan rekomendasi)
Cakupan         : pengajuan_destinasi (CF 1.0 biner)
Status lokasi   : tidak ada (jarak lebih dari 500 m)
Aturan menyala  : R1, R3, R5, R11, R14
Fakta awal      : ktp_diunggah = ya; ktp_lolos_periksa = ya; nib_diunggah = tidak; nib_lolos_periksa = tidak; izin_operasional_diunggah = ya; izin_operasional_lolos_periksa = ya; sk_pokdarwis_diunggah = tidak; sk_pokdarwis_lolos_periksa = tidak; partner_type = attraction; status_verifikasi_mitra = pending; nib_diperlukan = tidak; sk_pokdarwis_diperlukan = tidak; jarak_terdekat_m = 2633.9
Kesimpulan berurutan di working memory:
  1. [R1] ktp_valid = ya
  2. [R3] izin_operasional_valid = ya
  3. [R5] dokumen_lengkap = ya
  4. [R11] lokasi_lolos = ya
  5. [R14] status_tindak_lanjut = MENUNGGU_VERIFIKASI_MITRA
  6. [R14] cakupan = pengajuan_destinasi
  7. [R14] akun_mitra_terdampak = tidak
Penjelasan aturan:
  [R1] KTP penanggung jawab valid (CF 1.0, sumber S4)
      JIKA  (ktp_diunggah = ya [OK] DAN ktp_lolos_periksa = ya [OK])
      MAKA  ktp_valid = ya
      ALASAN KTP penanggung jawab sudah diunggah dan lolos pemeriksaan reviewer
  [R3] Izin pengelolaan atau izin usaha valid (CF 1.0, sumber S4, S9)
      JIKA  (izin_operasional_diunggah = ya [OK] DAN izin_operasional_lolos_periksa = ya [OK])
      MAKA  izin_operasional_valid = ya
      ALASAN Izin sesuai kategori mitra sudah diunggah dan lolos pemeriksaan reviewer: bukti hak pengelolaan atau izin objek wisata untuk Attraction, izin usaha untuk tour_agent, accommodation, dan transport
  [R5] Dokumen Attraction lengkap (CF 1.0, sumber S1, S2, S4)
      JIKA  (partner_type = attraction [OK] DAN ktp_valid = ya [OK] DAN izin_operasional_valid = ya [OK] DAN (nib_diperlukan = tidak [OK] ATAU (nib_diperlukan = tidak [X] DAN nib_valid = belum ada [X])) DAN (sk_pokdarwis_diperlukan = tidak [OK] ATAU (sk_pokdarwis_diperlukan = tidak [X] DAN sk_pokdarwis_valid = belum ada [X])))
      MAKA  dokumen_lengkap = ya
      ALASAN KTP dan izin pengelolaan valid. NIB dan SK Pokdarwis wajib valid jika ditetapkan berlaku, dan diabaikan jika ditetapkan tidak berlaku
  [R11] Lokasi lolos (CF 1.0, sumber S3)
      JIKA  (jarak_terdekat_m = 2633.9, syarat > 500 [OK] ATAU (status_lokasi = belum ada [X] DAN status_antrean_kurasi = belum ada [X]))
      MAKA  lokasi_lolos = ya
      ALASAN Jarak lebih dari 500 m, atau admin menyatakan destinasi berbeda dan tanda duplikat dilepas
  [R14] Tahan pengajuan sampai mitra diverifikasi (CF 1.0, sumber S4, S6, S9)
      JIKA  (lokasi_lolos = ya [OK] DAN dokumen_lengkap = ya [OK] DAN status_verifikasi_mitra = pending [OK])
      MAKA  status_tindak_lanjut = MENUNGGU_VERIFIKASI_MITRA; cakupan = pengajuan_destinasi; akun_mitra_terdampak = tidak
      ALASAN Lokasi lolos dan dokumen lengkap, tetapi mitra masih berstatus pending. Pengajuan ditahan sampai reviewer KYC memutuskan verifikasi mitra. KB belum memberi rekomendasi
Catatan database: Pengajuan destinasi tetap pending (destinations.status) sampai reviewer KYC memutuskan verifikasi mitra. partners.is_verified hanya dibaca dan tidak diubah
Rekomendasi dan status tindak lanjut bukan status database. Keputusan akhir ada di admin kurator.
Verifikasi mitra (partners.is_verified), kurasi destinasi (destinations.status), dan antrean kurasi adalah tiga status yang terpisah.
```

Contoh P6, yaitu rekomendasi SETUJUI dengan POTENTIAL_DUPLICATE karena admin sudah menyatakan bukan_duplikat, NIB berlaku dan valid, dan mitra verified:

```
Rekomendasi KB  : SETUJUI
Status tindak   : tidak ada
Cakupan         : pengajuan_destinasi (CF 1.0 biner)
Status lokasi   : POTENTIAL_DUPLICATE
Aturan menyala  : R1, R2, R3, R5, R7, R11, R13
Fakta awal      : ktp_diunggah = ya; ktp_lolos_periksa = ya; nib_diunggah = ya; nib_lolos_periksa = ya; izin_operasional_diunggah = ya; izin_operasional_lolos_periksa = ya; sk_pokdarwis_diunggah = tidak; sk_pokdarwis_lolos_periksa = tidak; partner_type = attraction; status_verifikasi_mitra = verified; nib_diperlukan = ya; sk_pokdarwis_diperlukan = tidak; jarak_terdekat_m = 299.0; status_antrean_kurasi = bukan_duplikat
Kesimpulan berurutan di working memory:
  1. [R1] ktp_valid = ya
  2. [R2] nib_valid = ya
  3. [R3] izin_operasional_valid = ya
  4. [R5] dokumen_lengkap = ya
  5. [R7] status_lokasi = POTENTIAL_DUPLICATE
  6. [R11] lokasi_lolos = ya
  7. [R13] rekomendasi = SETUJUI
  8. [R13] cakupan = pengajuan_destinasi
  9. [R13] akun_mitra_terdampak = tidak
Penjelasan aturan:
  [R1] KTP penanggung jawab valid (CF 1.0, sumber S4)
      JIKA  (ktp_diunggah = ya [OK] DAN ktp_lolos_periksa = ya [OK])
      MAKA  ktp_valid = ya
      ALASAN KTP penanggung jawab sudah diunggah dan lolos pemeriksaan reviewer
  [R2] NIB valid (CF 1.0, sumber S4)
      JIKA  (nib_diunggah = ya [OK] DAN nib_lolos_periksa = ya [OK])
      MAKA  nib_valid = ya
      ALASAN NIB sudah diunggah dan lolos pemeriksaan reviewer
  [R3] Izin pengelolaan atau izin usaha valid (CF 1.0, sumber S4, S9)
      JIKA  (izin_operasional_diunggah = ya [OK] DAN izin_operasional_lolos_periksa = ya [OK])
      MAKA  izin_operasional_valid = ya
      ALASAN Izin sesuai kategori mitra sudah diunggah dan lolos pemeriksaan reviewer: bukti hak pengelolaan atau izin objek wisata untuk Attraction, izin usaha untuk tour_agent, accommodation, dan transport
  [R5] Dokumen Attraction lengkap (CF 1.0, sumber S1, S2, S4)
      JIKA  (partner_type = attraction [OK] DAN ktp_valid = ya [OK] DAN izin_operasional_valid = ya [OK] DAN (nib_diperlukan = ya [X] ATAU (nib_diperlukan = ya [OK] DAN nib_valid = ya [OK])) DAN (sk_pokdarwis_diperlukan = tidak [OK] ATAU (sk_pokdarwis_diperlukan = tidak [X] DAN sk_pokdarwis_valid = belum ada [X])))
      MAKA  dokumen_lengkap = ya
      ALASAN KTP dan izin pengelolaan valid. NIB dan SK Pokdarwis wajib valid jika ditetapkan berlaku, dan diabaikan jika ditetapkan tidak berlaku
  [R7] Potensi duplikat lokasi (CF 1.0, sumber S3, S5)
      JIKA  jarak_terdekat_m = 299.0, syarat <= 500 [OK]
      MAKA  status_lokasi = POTENTIAL_DUPLICATE
      ALASAN Jarak ke destinasi terdekat 500 m atau kurang. Hanya ditandai POTENTIAL_DUPLICATE dan masuk antrean admin, belum duplikat terkonfirmasi
  [R11] Lokasi lolos (CF 1.0, sumber S3)
      JIKA  (jarak_terdekat_m = 299.0, syarat > 500 [X] ATAU (status_lokasi = POTENTIAL_DUPLICATE [OK] DAN status_antrean_kurasi = bukan_duplikat [OK]))
      MAKA  lokasi_lolos = ya
      ALASAN Jarak lebih dari 500 m, atau admin menyatakan destinasi berbeda dan tanda duplikat dilepas
  [R13] Setujui pengajuan destinasi (CF 1.0, sumber S1, S2, S9)
      JIKA  (lokasi_lolos = ya [OK] DAN dokumen_lengkap = ya [OK] DAN status_verifikasi_mitra = verified [OK])
      MAKA  rekomendasi = SETUJUI; cakupan = pengajuan_destinasi; akun_mitra_terdampak = tidak
      ALASAN Lokasi lolos, dokumen lengkap, dan mitra berstatus verified. Ini rekomendasi kurasi destinasi, bukan verifikasi akun mitra
Catatan database: Admin dapat menyetujui pengajuan destinasi ini saja (destinations.status = approved). partners.is_verified hanya dibaca sebagai syarat dan tidak diubah
Rekomendasi dan status tindak lanjut bukan status database. Keputusan akhir ada di admin kurator.
Verifikasi mitra (partners.is_verified), kurasi destinasi (destinations.status), dan antrean kurasi adalah tiga status yang terpisah.
```

## Ketentuan operasional yang dipakai rantai ini

Ketentuan lengkap ada di 01-tabel-aturan.md dan di bagian ketentuan_operasional pada 03-rules.json. Yang langsung memengaruhi rantai ini:

- KT1 dan KT2: syarat dokumen per tipe mitra dan penerapan NIB dan SK Pokdarwis pada Attraction (R5 dan R6).
- KT3: destinasi pembanding jarak adalah destinasi approved atau pending (R7).
- KT5: mitra harus verified agar pengajuannya direkomendasikan SETUJUI, mitra pending ditahan, dan mitra rejected menghasilkan TOLAK (R13 sampai R15).
- KT9: urutan penilaian lokasi, dokumen, lalu verifikasi mitra (R7 sampai R15).
