# 02 Rantai Aturan dan Pohon Keputusan (Squad 2)

Selaras dengan 01-tabel-aturan.md dan 03-rules.json (KB versi 4.2.0). Semua contoh keluaran di bawah diambil dari eksekusi engine_test.py.

## Metode

Mesin inferensi memakai forward chaining. Keluarannya punya dua field terpisah: rekomendasi (SETUJUI, REVISI, TOLAK) dan status_tindak_lanjut (MENUNGGU_KURASI). Fakta masuk ke working memory, lalu aturan yang syaratnya terpenuhi menyala dan menambah kesimpulan baru sampai tidak ada aturan baru. Aturan dievaluasi urut ID. R13 membaca dokumen_lengkap dan syarat_dokumen_status dengan operator ne, sehingga R5 dan R6 harus ber-ID lebih kecil. engine_test.py memeriksa bahwa penghasil setiap fakta selalu lebih awal daripada pembacanya. Penelusuran mundur (dari kesimpulan ke fakta) dipakai oleh explanation facility untuk menunjukkan aturan mana yang mendasari rekomendasi.

## Dua tingkat keputusan

| Tingkat | Yang dinilai | Aturan |
|---|---|---|
| Dokumen akun mitra | partner_type dan dokumen | R1 sampai R6 |
| Pengajuan destinasi | Jarak, antrean kurasi, hasil | R7 sampai R14 |

TOLAK hanya berlaku untuk satu pengajuan destinasi (R9). partners.is_verified dan destinasi lain tidak terdampak.

## Dua keputusan database tidak digabung

| Keputusan | Field | Pemutus | Disentuh KB |
|---|---|---|---|
| Verifikasi KYC mitra | partners.is_verified (pending, verified, rejected) | Reviewer KYC | tidak |
| Kurasi destinasi | destinations.status (pending, approved, rejected, hanya di ERD) | Admin kurator | tidak, hanya rekomendasi |

Tidak ada aturan yang menulis salah satu field itu. Semua aturan akhir (R8, R9, R10, R12, R13, R14) membawa akun_mitra_terdampak = tidak. R12 hanya berarti admin dapat menyetujui pengajuan destinasi itu. Status verifikasi mitra tetap keputusan reviewer yang terpisah. dokumen_lengkap (R1 sampai R5) adalah prasyarat checklist untuk R12, bukan status verifikasi mitra. Apakah mitra harus verified dulu belum ditentukan (N9).

## Fakta awal

| Kelompok | Fakta |
|---|---|
| Tipe mitra | partner_type (partners.partner_type, Sprint 1) |
| Keputusan penerapan (ya, tidak, atau NEEDS_CONFIRMATION) | nib_diperlukan, sk_pokdarwis_diperlukan. Hanya ya dan tidak dianggap keputusan |
| Checklist reviewer | ktp_diunggah, ktp_lolos_periksa, nib_diunggah, nib_lolos_periksa, izin_pengelolaan_diunggah, izin_pengelolaan_lolos_periksa, sk_pokdarwis_diunggah, sk_pokdarwis_lolos_periksa |
| Lokasi | jarak_terdekat_m (Haversine dari destinations.coordinates) |
| Review admin | status_antrean_kurasi (default belum_ditinjau saat R7 menyala) |

Checklist reviewer dipakai karena Sprint 1 hanya punya satu legal_doc_url, bukan kolom per dokumen.

## Kesimpulan antara

ktp_valid (R1), nib_valid (R2), izin_pengelolaan_valid (R3), sk_pokdarwis_valid (R4), dokumen_lengkap (R5), syarat_dokumen_status = NEEDS_CONFIRMATION (R6, dari tipe mitra tanpa syarat atau penerapan NIB dan SK Attraction yang belum eksplisit), status_lokasi = POTENTIAL_DUPLICATE (R7), lokasi_lolos (R11).

## Struktur keluaran

| Field | Nilai | Diisi oleh |
|---|---|---|
| rekomendasi | SETUJUI, REVISI, TOLAK, atau kosong | R9 (TOLAK), R10 (REVISI), R12 (SETUJUI), R13 (REVISI) |
| status_tindak_lanjut | MENUNGGU_KURASI atau kosong | R8, R14 |

MENUNGGU_KURASI adalah status antrean atau tinjau manual, bukan rekomendasi. Setiap hasil mengisi tepat satu dari kedua field. Engine memeriksa invarian ini pada setiap eksekusi, dan memeriksa bahwa tidak ada aturan yang mengisi rekomendasi dengan MENUNGGU_KURASI.

## Aturan jembatan

Kesimpulan satu aturan menjadi syarat aturan lain:
- R1 sampai R4 menjembatani checklist menuju R5
- R5 menjembatani dokumen menuju R12 dan R13
- R6 menjembatani tipe mitra dan penerapan NIB dan SK yang belum eksplisit menuju R13 (pengecualian) dan R14
- R7 menjembatani jarak menuju R8 sampai R11
- R11 menjembatani lokasi menuju R12, R13, dan R14

## Rantai inferensi

```
ktp_diunggah, ktp_lolos_periksa ───────R1──> ktp_valid ───────────┐
nib_diunggah, nib_lolos_periksa ───────R2──> nib_valid ───────────┤ nib_diperlukan = tidak, atau ya dan nib_valid
izin_pengelolaan_* ────────────────────R3──> izin_pengelolaan_valid ┼─R5 (attraction)──> dokumen_lengkap
sk_pokdarwis_* ────────────────────────R4──> sk_pokdarwis_valid ──┘ sk_pokdarwis_diperlukan = tidak, atau ya dan sk_pokdarwis_valid

partner_type: tour_agent, accommodation, transport ─────────────────────────┐
attraction + nib_diperlukan atau sk_pokdarwis_diperlukan                    ├─R6──> syarat_dokumen_status = NEEDS_CONFIRMATION
   bukan ya dan bukan tidak (kosong, NEEDS_CONFIRMATION, boolean, lain) ───┘

jarak_terdekat_m <= 500 ──R7──> status_lokasi = POTENTIAL_DUPLICATE (+ antrean belum_ditinjau jika kosong)
      belum_ditinjau ───────────R8──> status_tindak_lanjut = MENUNGGU_KURASI (pengajuan_destinasi, tanpa rekomendasi)
      duplikat_terkonfirmasi ───R9──> rekomendasi = TOLAK (hanya pengajuan destinasi)
      perlu_bukti ──────────────R10─> rekomendasi = REVISI (bukti lokasi)
      bukan_duplikat ───────────R11─┐
jarak_terdekat_m > 500 ─────────R11─┴─> lokasi_lolos
                                            │
          lokasi_lolos + dokumen_lengkap ───R12──> rekomendasi = SETUJUI (kurasi destinasi)
          lokasi_lolos + attraction + dokumen belum lengkap + penerapan eksplisit ──R13──> rekomendasi = REVISI (dokumen_mitra)
          lokasi_lolos + syarat NEEDS_CONFIRMATION ──────────R14──> status_tindak_lanjut = MENUNGGU_KURASI (tinjau manual, tanpa rekomendasi)
```

R5 dan R6 tidak pernah menyala bersamaan, begitu pula R13 dan R14. Nilai kosong atau NEEDS_CONFIRMATION pada penerapan NIB dan SK tidak membuat R5 menyala, karena R5 hanya menerima tidak, atau ya bersama dokumen valid.

Rantai terpanjang ada 3 aturan berurutan (4 tingkat fakta). Contoh dokumen: ktp_lolos_periksa menghasilkan ktp_valid (R1), lalu dokumen_lengkap (R5), lalu rekomendasi (R12). Contoh lokasi: status_lokasi dari jarak (R7), lalu lokasi_lolos (R11), lalu rekomendasi (R12). Nilai 3 dihitung dan diperiksa oleh engine_test.py.

## Kesimpulan akhir

| Aturan | Rekomendasi | Status tindak lanjut | Cakupan | partners.is_verified | Catatan |
|---|---|---|---|---|---|
| R8 | tidak ada | MENUNGGU_KURASI | pengajuan_destinasi | tidak diubah | Status antrean, bukan rekomendasi dan bukan keputusan |
| R9 | TOLAK | tidak ada | pengajuan_destinasi | tidak diubah | Hanya setelah admin mengonfirmasi duplikat |
| R10 | REVISI | tidak ada | pengajuan_destinasi | tidak diubah | Admin meminta bukti lokasi (PROPOSED) |
| R12 | SETUJUI | tidak ada | pengajuan_destinasi | tidak diubah | Lokasi lolos, dokumen lengkap, penerapan NIB dan SK eksplisit. Admin dapat menyetujui destinasi itu saja. Bersyarat pada N9 (NEEDS_CONFIRMATION) |
| R13 | REVISI | tidak ada | dokumen_mitra | tidak diubah | Dokumen Attraction belum valid, penerapan NIB dan SK sudah eksplisit (PROPOSED) |
| R14 | tidak ada | MENUNGGU_KURASI | dokumen_mitra | tidak diubah | Syarat dokumen atau penerapan NIB dan SK belum terkonfirmasi, admin memeriksa manual (PROPOSED) |

## Alur dua tahap dengan admin kurator

1. KB berjalan. Jika jarak 500 m atau kurang, R7 menandai POTENTIAL_DUPLICATE dan R8 menaruh pengajuan di antrean. Tidak ada penolakan otomatis.
2. Admin kurator meninjau lalu mengisi status_antrean_kurasi. Admin tetap pengambil keputusan akhir.
3. KB berjalan lagi dengan status baru. Hasilnya rekomendasi TOLAK untuk pengajuan itu saja (R9), REVISI bukti lokasi (R10), atau lanjut ke pengecekan dokumen (R11 sampai R14).

SETUJUI bersama POTENTIAL_DUPLICATE hanya muncul jika admin sudah menyatakan bukan_duplikat (lihat P6 di 04-skenario-pengujian.md).

## Pohon keputusan (per pengajuan destinasi)

```
Pengajuan destinasi masuk
│
├─ Jarak Haversine ke destinasi terdekat?
│   ├─ <= 500 m ──> POTENTIAL_DUPLICATE (R7), hanya ditandai
│   │   └─ status_antrean_kurasi (diisi admin)?
│   │       ├─ belum_ditinjau ─────────> status_tindak_lanjut MENUNGGU_KURASI (R8)
│   │       ├─ duplikat_terkonfirmasi ─> rekomendasi TOLAK pengajuan ini saja (R9)
│   │       ├─ perlu_bukti ────────────> rekomendasi REVISI bukti lokasi (R10)
│   │       └─ bukan_duplikat ─────────> lokasi lolos (R11), lanjut ke dokumen
│   └─ > 500 m ──> lokasi lolos (R11), lanjut ke dokumen
│
└─ partner_type?
    ├─ attraction ──> nib_diperlukan dan sk_pokdarwis_diperlukan sudah eksplisit (ya atau tidak)?
    │       ├─ BELUM (kosong, NEEDS_CONFIRMATION, boolean, lain) ──> R6 ──> status_tindak_lanjut MENUNGGU_KURASI, admin memastikan keputusan (R14)
    │       └─ SUDAH ──> dokumen lengkap? (R1 sampai R5)
    │              ├─ YA ───> rekomendasi SETUJUI (R12)
    │              └─ TIDAK ─> rekomendasi REVISI dokumen (R13)
    └─ tour_agent, accommodation, transport ──> syarat NEEDS_CONFIRMATION (R6)
            └─────────> status_tindak_lanjut MENUNGGU_KURASI, admin memeriksa manual (R14)
```

Pengecekan dokumen hanya menentukan hasil akhir jika lokasi sudah lolos. Pengajuan yang lolos lokasi tidak pernah SETUJUI selama penerapan NIB dan SK belum eksplisit.

## Working memory

Working memory berisi fakta masukan dan kesimpulan yang dicatat berurutan beserta aturan yang menghasilkannya. Contoh untuk P3b (attraction, 124,1 m, admin mengonfirmasi duplikat, NIB dan SK diputuskan tidak berlaku). Field rekomendasi terisi dan status_tindak_lanjut kosong:

```
  1. [input] ktp_diunggah = ya
  2. [input] ktp_lolos_periksa = ya
  3. [input] nib_diunggah = tidak
  4. [input] nib_lolos_periksa = tidak
  5. [input] izin_pengelolaan_diunggah = ya
  6. [input] izin_pengelolaan_lolos_periksa = ya
  7. [input] sk_pokdarwis_diunggah = tidak
  8. [input] sk_pokdarwis_lolos_periksa = tidak
  9. [input] partner_type = attraction
  10. [input] nib_diperlukan = tidak
  11. [input] sk_pokdarwis_diperlukan = tidak
  12. [input] jarak_terdekat_m = 124.1
  13. [input] status_antrean_kurasi = duplikat_terkonfirmasi
  14. [R1] ktp_valid = ya
  15. [R3] izin_pengelolaan_valid = ya
  16. [R5] dokumen_lengkap = ya
  17. [R7] status_lokasi = POTENTIAL_DUPLICATE
  18. [R9] rekomendasi = TOLAK
  19. [R9] cakupan = pengajuan_destinasi
  20. [R9] akun_mitra_terdampak = tidak
```

## Certainty Factor

CF biner. Setiap aturan cf = 1.0 dan setiap kesimpulan yang muncul bernilai 1.0. Tidak ada CF di antara 0 dan 1 karena tidak ada fakta yang bersifat tidak pasti.

## Explanation facility

Engine mencetak aturan yang menyala, kondisi dengan nilai sebenarnya, kesimpulan, alasan, label, sumber, catatan database, dan peringatan masukan. Untuk kasus yang bergantung pada N4 atau N9, engine juga mencetak catatan asumsi bersyarat. Contoh K1, yaitu Attraction yang penerapan NIB-nya NEEDS_CONFIRMATION. Hasilnya tanpa rekomendasi dan berstatus tindak lanjut MENUNGGU_KURASI:

```
Rekomendasi KB  : tidak ada (KB belum memberi saran)
Status tindak   : MENUNGGU_KURASI (antrean atau tinjau manual admin, bukan rekomendasi)
Cakupan         : dokumen_mitra (CF 1.0 biner)
Status lokasi   : tidak ada (jarak lebih dari 500 m)
Aturan menyala  : R1, R3, R6, R11, R14
Fakta awal      : ktp_diunggah = ya; ktp_lolos_periksa = ya; nib_diunggah = tidak; nib_lolos_periksa = tidak; izin_pengelolaan_diunggah = ya; izin_pengelolaan_lolos_periksa = ya; sk_pokdarwis_diunggah = tidak; sk_pokdarwis_lolos_periksa = tidak; partner_type = attraction; nib_diperlukan = NEEDS_CONFIRMATION; sk_pokdarwis_diperlukan = tidak; jarak_terdekat_m = 2633.9
Peringatan      : nib_diperlukan = NEEDS_CONFIRMATION: belum terkonfirmasi
Kesimpulan berurutan di working memory:
  1. [R1] ktp_valid = ya
  2. [R3] izin_pengelolaan_valid = ya
  3. [R6] syarat_dokumen_status = NEEDS_CONFIRMATION
  4. [R11] lokasi_lolos = ya
  5. [R14] status_tindak_lanjut = MENUNGGU_KURASI
  6. [R14] cakupan = dokumen_mitra
  7. [R14] akun_mitra_terdampak = tidak
Penjelasan aturan:
  [R1] KTP penanggung jawab valid (CONFIRMED, CF 1.0, sumber S4)
      JIKA  (ktp_diunggah = ya [OK] DAN ktp_lolos_periksa = ya [OK])
      MAKA  ktp_valid = ya
      ALASAN KTP penanggung jawab sudah diunggah dan lolos pemeriksaan reviewer
  [R3] Bukti hak pengelolaan atau izin objek wisata valid (CONFIRMED, CF 1.0, sumber S4)
      JIKA  (izin_pengelolaan_diunggah = ya [OK] DAN izin_pengelolaan_lolos_periksa = ya [OK])
      MAKA  izin_pengelolaan_valid = ya
      ALASAN Bukti hak pengelolaan atau izin objek wisata sudah diunggah dan lolos pemeriksaan reviewer
  [R6] Syarat dokumen belum dapat ditentukan (NEEDS_CONFIRMATION, CF 1.0, sumber S4, S6)
      JIKA  (partner_type = attraction, syarat salah satu dari tour_agent / accommodation / transport [X] ATAU (partner_type = attraction [OK] DAN (nib_diperlukan = NEEDS_CONFIRMATION, syarat bukan salah satu dari ya / tidak [OK] ATAU sk_pokdarwis_diperlukan = tidak, syarat bukan salah satu dari ya / tidak [X])))
      MAKA  syarat_dokumen_status = NEEDS_CONFIRMATION
      ALASAN Syarat dokumen belum dapat ditentukan. Untuk tour_agent, accommodation, dan transport, wireflow Sprint 1 hanya menggambarkan dokumen Attraction. Untuk Attraction, NIB dan SK Pokdarwis bertanda (jika berlaku) di wireflow, dan selama penerapannya belum diputuskan eksplisit (ya atau tidak) KB tidak menganggapnya wajib maupun tidak wajib. Apakah tipe mitra ini boleh mengajukan destinasi belum diputuskan (N4)
  [R11] Lokasi lolos (CONFIRMED, CF 1.0, sumber S3)
      JIKA  (jarak_terdekat_m = 2633.9, syarat > 500 [OK] ATAU (status_lokasi = belum ada [X] DAN status_antrean_kurasi = belum ada [X]))
      MAKA  lokasi_lolos = ya
      ALASAN Jarak lebih dari 500 m, atau admin menyatakan destinasi berbeda dan tanda duplikat dilepas
  [R14] Tinjau manual karena syarat dokumen atau penerapan NIB dan SK belum terkonfirmasi (PROPOSED, CF 1.0, sumber S4, S6)
      JIKA  (lokasi_lolos = ya [OK] DAN syarat_dokumen_status = NEEDS_CONFIRMATION [OK])
      MAKA  status_tindak_lanjut = MENUNGGU_KURASI; cakupan = dokumen_mitra; akun_mitra_terdampak = tidak
      ALASAN Lokasi lolos tetapi syarat dokumen tipe mitra ini, atau berlaku tidaknya NIB dan SK Pokdarwis, belum terkonfirmasi. KB tidak memberi rekomendasi (tidak menyetujui, tidak merevisi, tidak menolak), status_tindak_lanjut = MENUNGGU_KURASI dan admin memeriksa manual
Catatan database (Sprint 1): Tidak ada persetujuan atau penolakan otomatis karena syarat dokumen atau penerapan NIB dan SK belum terkonfirmasi. partners.is_verified tidak diubah
Rekomendasi dan status tindak lanjut bukan status database. Keputusan akhir ada di admin kurator.
Verifikasi mitra (partners.is_verified) dan kurasi destinasi (destinations.status) adalah dua keputusan terpisah.
```

Contoh P6, yaitu rekomendasi SETUJUI dengan POTENTIAL_DUPLICATE karena admin sudah menyatakan bukan_duplikat dan NIB diputuskan berlaku. Catatan asumsi N9 muncul karena SETUJUI hanya contoh bersyarat:

```
Rekomendasi KB  : SETUJUI
Status tindak   : tidak ada
Cakupan         : pengajuan_destinasi (CF 1.0 biner)
Status lokasi   : POTENTIAL_DUPLICATE
Aturan menyala  : R1, R2, R3, R5, R7, R11, R12
Fakta awal      : ktp_diunggah = ya; ktp_lolos_periksa = ya; nib_diunggah = ya; nib_lolos_periksa = ya; izin_pengelolaan_diunggah = ya; izin_pengelolaan_lolos_periksa = ya; sk_pokdarwis_diunggah = tidak; sk_pokdarwis_lolos_periksa = tidak; partner_type = attraction; nib_diperlukan = ya; sk_pokdarwis_diperlukan = tidak; jarak_terdekat_m = 299.0; status_antrean_kurasi = bukan_duplikat
Kesimpulan berurutan di working memory:
  1. [R1] ktp_valid = ya
  2. [R2] nib_valid = ya
  3. [R3] izin_pengelolaan_valid = ya
  4. [R5] dokumen_lengkap = ya
  5. [R7] status_lokasi = POTENTIAL_DUPLICATE
  6. [R11] lokasi_lolos = ya
  7. [R12] rekomendasi = SETUJUI
  8. [R12] cakupan = pengajuan_destinasi
  9. [R12] akun_mitra_terdampak = tidak
Penjelasan aturan:
  [R1] KTP penanggung jawab valid (CONFIRMED, CF 1.0, sumber S4)
      JIKA  (ktp_diunggah = ya [OK] DAN ktp_lolos_periksa = ya [OK])
      MAKA  ktp_valid = ya
      ALASAN KTP penanggung jawab sudah diunggah dan lolos pemeriksaan reviewer
  [R2] NIB valid (CONFIRMED, CF 1.0, sumber S4)
      JIKA  (nib_diunggah = ya [OK] DAN nib_lolos_periksa = ya [OK])
      MAKA  nib_valid = ya
      ALASAN NIB sudah diunggah dan lolos pemeriksaan reviewer
  [R3] Bukti hak pengelolaan atau izin objek wisata valid (CONFIRMED, CF 1.0, sumber S4)
      JIKA  (izin_pengelolaan_diunggah = ya [OK] DAN izin_pengelolaan_lolos_periksa = ya [OK])
      MAKA  izin_pengelolaan_valid = ya
      ALASAN Bukti hak pengelolaan atau izin objek wisata sudah diunggah dan lolos pemeriksaan reviewer
  [R5] Dokumen Attraction lengkap (CONFIRMED, CF 1.0, sumber S1, S2, S4)
      JIKA  (partner_type = attraction [OK] DAN ktp_valid = ya [OK] DAN izin_pengelolaan_valid = ya [OK] DAN (nib_diperlukan = ya [X] ATAU (nib_diperlukan = ya [OK] DAN nib_valid = ya [OK])) DAN (sk_pokdarwis_diperlukan = tidak [OK] ATAU (sk_pokdarwis_diperlukan = tidak [X] DAN sk_pokdarwis_valid = belum ada [X])))
      MAKA  dokumen_lengkap = ya
      ALASAN KTP dan bukti pengelolaan valid. NIB dan SK Pokdarwis masing-masing sudah diputuskan eksplisit: tidak berlaku, atau berlaku dan valid
  [R7] Potensi duplikat lokasi (CONFIRMED, CF 1.0, sumber S3, S5)
      JIKA  jarak_terdekat_m = 299.0, syarat <= 500 [OK]
      MAKA  status_lokasi = POTENTIAL_DUPLICATE
      ALASAN Jarak ke destinasi terdekat 500 m atau kurang. Hanya ditandai POTENTIAL_DUPLICATE dan masuk antrean admin, belum duplikat terkonfirmasi
  [R11] Lokasi lolos (CONFIRMED, CF 1.0, sumber S3)
      JIKA  (jarak_terdekat_m = 299.0, syarat > 500 [X] ATAU (status_lokasi = POTENTIAL_DUPLICATE [OK] DAN status_antrean_kurasi = bukan_duplikat [OK]))
      MAKA  lokasi_lolos = ya
      ALASAN Jarak lebih dari 500 m, atau admin menyatakan destinasi berbeda dan tanda duplikat dilepas
  [R12] Setujui (CONFIRMED, CF 1.0, sumber S1, S2)
      JIKA  (lokasi_lolos = ya [OK] DAN dokumen_lengkap = ya [OK])
      MAKA  rekomendasi = SETUJUI; cakupan = pengajuan_destinasi; akun_mitra_terdampak = tidak
      ALASAN Lokasi lolos dan dokumen Attraction lengkap. Ini rekomendasi kurasi destinasi, bukan verifikasi akun mitra
Catatan database (Sprint 1): Admin dapat menyetujui pengajuan destinasi ini saja (destinations.status = approved, hanya di ERD). partners.is_verified tidak diubah: verifikasi KYC mitra (pending, verified, rejected) adalah keputusan reviewer yang terpisah. Belum diputuskan apakah mitra harus verified lebih dulu (N9), KB tidak membaca partners.is_verified
Asumsi bersyarat: N9 (NEEDS_CONFIRMATION): Contoh bersyarat: rekomendasi SETUJUI dihitung tanpa membaca partners.is_verified. Ini bukan jawaban bahwa mitra tidak perlu verified. Belum diputuskan apakah mitra harus verified sebelum destinasinya boleh disetujui
Rekomendasi dan status tindak lanjut bukan status database. Keputusan akhir ada di admin kurator.
Verifikasi mitra (partners.is_verified) dan kurasi destinasi (destinations.status) adalah dua keputusan terpisah.
```

## Belum terjawab

Daftar NEEDS_CONFIRMATION dan NOT_DEFINED_IN_SPRINT_1 (N1 sampai N9) ada di 01-tabel-aturan.md dan di bagian needs_confirmation pada 03-rules.json. Tiga yang langsung memengaruhi rantai ini:

- N2 (NEEDS_CONFIRMATION): siapa yang memutuskan berlaku tidaknya NIB dan SK, sehingga KB menolak menebaknya.
- N4 (NEEDS_CONFIRMATION): apakah semua partner_type boleh mengajukan destinasi. KB tidak menjawabnya. Aturan R6 dan R14 bergantung padanya, dan skenario tour_agent, accommodation, dan transport adalah contoh bersyarat.
- N9 (NEEDS_CONFIRMATION): apakah mitra harus verified sebelum destinasinya disetujui. KB tidak menjawabnya dan tidak membaca atau mengubah partners.is_verified. R12 bergantung padanya, dan skenario SETUJUI adalah contoh bersyarat.
