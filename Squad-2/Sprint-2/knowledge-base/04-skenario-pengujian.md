# 04 Skenario Pengujian (Squad 2)

Selaras dengan 01-tabel-aturan.md dan 03-rules.json (KB versi 4.2.0). Semua jarak dihitung dari koordinat memakai Haversine (R = 6.371.000 m, dibulatkan 1 desimal) oleh engine_test.py. Engine membaca 03-rules.json, menjalankan forward chaining, lalu membandingkan hasilnya dengan hasil yang diharapkan. Keluaran lengkap ada di hasil-uji.txt.

Destinasi pembanding (data contoh, bukan data asli): -7,9425 ; 112,9530. Semua jarak diukur ke titik ini. Fakta dokumen adalah checklist reviewer (PROPOSED), karena Sprint 1 hanya punya legal_doc_url. Skenario P9 sampai P11 memakai tipe mitra yang syarat dokumennya NEEDS_CONFIRMATION, sehingga penerapan NIB dan SK tidak relevan dan tidak diberikan. Skenario K1 sampai K9 menguji penerapan NIB dan SK Pokdarwis yang belum terkonfirmasi.

Penerapan NIB dan SK Pokdarwis (nib_diperlukan, sk_pokdarwis_diperlukan) adalah keputusan eksplisit ya atau tidak. Nilai tidak ada, NEEDS_CONFIRMATION, atau boolean tidak pernah dianggap tidak berlaku. Setiap kasus juga dicek bahwa akun_mitra_terdampak = tidak, yaitu partners.is_verified tidak diubah oleh keluaran KB apa pun.

Keluaran KB punya dua field terpisah. `rekomendasi` berisi SETUJUI, REVISI, atau TOLAK. `status_tindak_lanjut` berisi MENUNGGU_KURASI saat tinjau manual admin diperlukan, dan pada saat itu rekomendasi kosong (tidak ada). MENUNGGU_KURASI bukan rekomendasi. Setiap kasus dicek bahwa tepat satu dari kedua field terisi.

N4 (apakah semua partner_type boleh mengajukan destinasi) dan N9 (apakah mitra harus verified sebelum destinasinya boleh disetujui) belum terjawab dan tetap NEEDS_CONFIRMATION. Skenario yang bergantung pada salah satunya ditandai di kolom Bersyarat dan dalam bagian Skenario bersyarat. Itu adalah contoh bersyarat untuk menguji logika KB, bukan syarat bisnis terkonfirmasi.

## Ringkasan 27 skenario

| Kode | partner_type | Koordinat | Jarak (m) | Antrean | Aturan menyala | Rekomendasi | Status tindak lanjut | Cakupan | Bersyarat |
|---|---|---|---|---|---|---|---|---|---|
| P1 | attraction | -7,9190 ; 112,9500 | 2.633,9 | tidak diberikan | R1, R3, R5, R11, R12 | SETUJUI | - | pengajuan_destinasi | N9 |
| P2 | attraction | -7,9800 ; 112,9700 | 4.570,8 | tidak diberikan | R1, R11, R13 | REVISI | - | dokumen_mitra | - |
| P3a | attraction | -7,9435 ; 112,9535 | 124,1 | tidak diberikan | R1, R3, R5, R7, R8 | - | MENUNGGU_KURASI | pengajuan_destinasi | - |
| P3b | attraction | -7,9435 ; 112,9535 | 124,1 | duplikat_terkonfirmasi | R1, R3, R5, R7, R9 | TOLAK | - | pengajuan_destinasi | - |
| P4 | attraction | -7,9300 ; 112,9450 | 1.645,6 | tidak diberikan | R1, R2, R3, R4, R5, R11, R12 | SETUJUI | - | pengajuan_destinasi | N9 |
| P5 | attraction | -7,9300 ; 112,9450 | 1.645,6 | tidak diberikan | R1, R3, R11, R13 | REVISI | - | dokumen_mitra | - |
| P6 | attraction | -7,9400 ; 112,9520 | 299,0 | bukan_duplikat | R1, R2, R3, R5, R7, R11, R12 | SETUJUI | - | pengajuan_destinasi | N9 |
| P7 | attraction | -7,9600 ; 112,9400 | 2.415,8 | tidak diberikan | R1, R3, R11, R13 | REVISI | - | dokumen_mitra | - |
| P8 | attraction | -7,9100 ; 112,9600 | 3.695,2 | tidak diberikan | R1, R3, R5, R11, R12 | SETUJUI | - | pengajuan_destinasi | N9 |
| P9 | tour_agent | -7,9190 ; 112,9500 | 2.633,9 | tidak diberikan | R6, R11, R14 | - | MENUNGGU_KURASI | dokumen_mitra | N4 |
| P10 | accommodation | -7,9400 ; 112,9520 | 299,0 | bukan_duplikat | R6, R7, R11, R14 | - | MENUNGGU_KURASI | dokumen_mitra | N4 |
| P11 | transport | -7,9435 ; 112,9535 | 124,1 | duplikat_terkonfirmasi | R6, R7, R9 | TOLAK | - | pengajuan_destinasi | N4 |
| T1 | attraction | -7,9380033920 ; 112,9530 | 500,0 | belum_ditinjau | R1, R3, R5, R7, R8 | - | MENUNGGU_KURASI | pengajuan_destinasi | - |
| T2 | attraction | -7,9380024926 ; 112,9530 | 500,1 | tidak diberikan | R1, R3, R5, R11, R12 | SETUJUI | - | pengajuan_destinasi | N9 |
| T3 | attraction | -7,9450 ; 112,9545 | 323,4 | perlu_bukti | R1, R3, R5, R7, R10 | REVISI | - | pengajuan_destinasi | - |
| T4 | attraction | -7,9400 ; 112,9520 | 299,0 | bukan_duplikat | R3, R7, R11, R13 | REVISI | - | dokumen_mitra | - |
| A1 | attraction | -7,9435 ; 112,9535 | 124,1 | duplikat_terkonfirmasi | R1, R3, R5, R7, R9 | TOLAK | - | pengajuan_destinasi | - |
| A2 | attraction | -7,9190 ; 112,9500 | 2.633,9 | tidak diberikan | R1, R3, R5, R11, R12 | SETUJUI | - | pengajuan_destinasi | N9 |
| K1 | attraction | -7,9190 ; 112,9500 | 2.633,9 | tidak diberikan | R1, R3, R6, R11, R14 | - | MENUNGGU_KURASI | dokumen_mitra | - |
| K2 | attraction | -7,9190 ; 112,9500 | 2.633,9 | tidak diberikan | R1, R3, R6, R11, R14 | - | MENUNGGU_KURASI | dokumen_mitra | - |
| K3 | attraction | -7,9190 ; 112,9500 | 2.633,9 | tidak diberikan | R1, R2, R3, R4, R6, R11, R14 | - | MENUNGGU_KURASI | dokumen_mitra | - |
| K4 | attraction | -7,9190 ; 112,9500 | 2.633,9 | tidak diberikan | R1, R2, R3, R6, R11, R14 | - | MENUNGGU_KURASI | dokumen_mitra | - |
| K5 | attraction | -7,9435 ; 112,9535 | 124,1 | tidak diberikan | R1, R3, R6, R7, R8 | - | MENUNGGU_KURASI | pengajuan_destinasi | - |
| K6 | attraction | -7,9400 ; 112,9520 | 299,0 | bukan_duplikat | R1, R3, R6, R7, R11, R14 | - | MENUNGGU_KURASI | dokumen_mitra | - |
| K7 | attraction | -7,9435 ; 112,9535 | 124,1 | duplikat_terkonfirmasi | R1, R3, R6, R7, R9 | TOLAK | - | pengajuan_destinasi | - |
| K8 | attraction | -7,9190 ; 112,9500 | 2.633,9 | tidak diberikan | R1, R3, R6, R11, R14 | - | MENUNGGU_KURASI | dokumen_mitra | - |
| K9 | attraction | -7,9190 ; 112,9500 | 2.633,9 | tidak diberikan | R1, R3, R6, R11, R14 | - | MENUNGGU_KURASI | dokumen_mitra | - |

Yang diuji:
- Batas 500 m: T1 (500,0 m, POTENTIAL_DUPLICATE) dan T2 (500,1 m, tidak memicu).
- Potensi duplikat masuk antrean tanpa penolakan: P3a dan T1.
- Destinasi berbeda dalam 500 m lanjut: P6, P10, T4.
- Duplikat terkonfirmasi hanya menolak pengajuan destinasi: P3b, P11, A1 dan A2.
- Dokumen tidak lengkap: P2, P5, P7, T4.
- Syarat dokumen belum terkonfirmasi untuk tipe mitra lain: P9, P10, P11.
- NIB dan SK Pokdarwis berlaku atau tidak berlaku secara eksplisit: P1, P4, P5, P7, P8.
- NIB dan SK Pokdarwis belum terkonfirmasi (NEEDS_CONFIRMATION, tidak ada, boolean lama) tidak pernah SETUJUI: K1, K2, K3, K4, K8.
- Belum terkonfirmasi bersama lokasi dan hasil lain: K5 (antrean), K6 (bukan_duplikat), K7 (duplikat tetap TOLAK), K9 (didahulukan dari REVISI).
- Pemisahan rekomendasi dan status tindak lanjut: MENUNGGU_KURASI hanya muncul di status_tindak_lanjut (P3a, P9, P10, T1, K1 sampai K6, K8, K9) dan rekomendasi kosong pada kasus itu. SETUJUI, REVISI, dan TOLAK hanya muncul di rekomendasi dan status_tindak_lanjut kosong.
- Pemisahan status: semua kasus memakai akun_mitra_terdampak = tidak. SETUJUI (P1, P4, P6, P8, T2, A2) hanya rekomendasi kurasi destinasi dan tidak memverifikasi mitra.

## Detail skenario

### P1: Attraction lokasi jauh, KTP dan bukti pengelolaan valid, NIB dan SK diputuskan tidak berlaku

| Input | Nilai |
|---|---|
| partner_type | attraction |
| nib_diperlukan, sk_pokdarwis_diperlukan | tidak, tidak |
| KTP; NIB; bukti pengelolaan; SK Pokdarwis | lolos pemeriksaan; tidak diunggah; lolos pemeriksaan; tidak diunggah |
| Koordinat dan jarak | -7,9190 ; 112,9500 ; 2.633,9 m |
| status_antrean_kurasi | tidak diberikan |

Aturan menyala: R1, R3, R5, R11, R12

Proses inferensi:
1. R1: ktp_valid = ya
2. R3: izin_pengelolaan_valid = ya
3. R5: dokumen_lengkap = ya
4. R11: lokasi_lolos = ya
5. R12: rekomendasi = SETUJUI
6. R12: cakupan = pengajuan_destinasi
7. R12: akun_mitra_terdampak = tidak

Hasil yang diharapkan: rekomendasi = SETUJUI, status_tindak_lanjut = tidak ada (cakupan pengajuan_destinasi)

Penjelasan: Lokasi lolos dan dokumen Attraction lengkap. Ini rekomendasi kurasi destinasi, bukan verifikasi akun mitra. Admin dapat menyetujui pengajuan destinasi ini saja (destinations.status = approved, hanya di ERD). partners.is_verified tidak diubah: verifikasi KYC mitra (pending, verified, rejected) adalah keputusan reviewer yang terpisah. Belum diputuskan apakah mitra harus verified lebih dulu (N9), KB tidak membaca partners.is_verified.

Asumsi bersyarat (N9, NEEDS_CONFIRMATION): Contoh bersyarat: rekomendasi SETUJUI dihitung tanpa membaca partners.is_verified. Ini bukan jawaban bahwa mitra tidak perlu verified. Belum diputuskan apakah mitra harus verified sebelum destinasinya boleh disetujui.

### P2: Attraction lokasi jauh, bukti hak pengelolaan tidak diunggah

| Input | Nilai |
|---|---|
| partner_type | attraction |
| nib_diperlukan, sk_pokdarwis_diperlukan | tidak, tidak |
| KTP; NIB; bukti pengelolaan; SK Pokdarwis | lolos pemeriksaan; tidak diunggah; tidak diunggah; tidak diunggah |
| Koordinat dan jarak | -7,9800 ; 112,9700 ; 4.570,8 m |
| status_antrean_kurasi | tidak diberikan |

Aturan menyala: R1, R11, R13

Proses inferensi:
1. R1: ktp_valid = ya
2. R11: lokasi_lolos = ya
3. R13: rekomendasi = REVISI
4. R13: cakupan = dokumen_mitra
5. R13: akun_mitra_terdampak = tidak

Hasil yang diharapkan: rekomendasi = REVISI, status_tindak_lanjut = tidak ada (cakupan dokumen_mitra)

Penjelasan: Lokasi lolos, penerapan NIB dan SK sudah diputuskan eksplisit, tetapi ada dokumen Attraction yang belum valid. Dokumen dikembalikan ke mitra. Reviewer di wireflow hanya punya VERIFIED dan REJECTED (NOT_DEFINED_IN_SPRINT_1). partners.is_verified tidak diubah KB, nilainya ditentukan reviewer KYC secara terpisah (PROPOSED).

### P3a: Attraction sangat dekat (124,1 m), status antrean belum diisi sehingga default belum_ditinjau

| Input | Nilai |
|---|---|
| partner_type | attraction |
| nib_diperlukan, sk_pokdarwis_diperlukan | tidak, tidak |
| KTP; NIB; bukti pengelolaan; SK Pokdarwis | lolos pemeriksaan; tidak diunggah; lolos pemeriksaan; tidak diunggah |
| Koordinat dan jarak | -7,9435 ; 112,9535 ; 124,1 m |
| status_antrean_kurasi | tidak diberikan |

Aturan menyala: R1, R3, R5, R7, R8

Proses inferensi:
1. R1: ktp_valid = ya
2. R3: izin_pengelolaan_valid = ya
3. R5: dokumen_lengkap = ya
4. R7: status_lokasi = POTENTIAL_DUPLICATE
5. R7 default: status_antrean_kurasi = belum_ditinjau
6. R8: status_tindak_lanjut = MENUNGGU_KURASI
7. R8: cakupan = pengajuan_destinasi
8. R8: akun_mitra_terdampak = tidak

Hasil yang diharapkan: rekomendasi = tidak ada, status_tindak_lanjut = MENUNGGU_KURASI (cakupan pengajuan_destinasi)

Penjelasan: Potensi duplikat belum ditinjau admin. KB belum memberi rekomendasi, pengajuan masuk antrean (status_tindak_lanjut). Pengajuan destinasi tetap pending (destinations.status, hanya di ERD). Flag POTENTIAL_DUPLICATE dan status antrean tidak punya field di Sprint 1 (NOT_DEFINED_IN_SPRINT_1). partners.is_verified tidak diubah. Catatan: status_antrean_kurasi tidak diberikan. R7 mengisinya dengan belum_ditinjau. Pengajuan masuk antrean dan tidak ditolak.

### P3b: Titik yang sama dengan P3a, admin mengonfirmasi duplikat

| Input | Nilai |
|---|---|
| partner_type | attraction |
| nib_diperlukan, sk_pokdarwis_diperlukan | tidak, tidak |
| KTP; NIB; bukti pengelolaan; SK Pokdarwis | lolos pemeriksaan; tidak diunggah; lolos pemeriksaan; tidak diunggah |
| Koordinat dan jarak | -7,9435 ; 112,9535 ; 124,1 m |
| status_antrean_kurasi | duplikat_terkonfirmasi |

Aturan menyala: R1, R3, R5, R7, R9

Proses inferensi:
1. R1: ktp_valid = ya
2. R3: izin_pengelolaan_valid = ya
3. R5: dokumen_lengkap = ya
4. R7: status_lokasi = POTENTIAL_DUPLICATE
5. R9: rekomendasi = TOLAK
6. R9: cakupan = pengajuan_destinasi
7. R9: akun_mitra_terdampak = tidak

Hasil yang diharapkan: rekomendasi = TOLAK, status_tindak_lanjut = tidak ada (cakupan pengajuan_destinasi)

Penjelasan: Admin mengonfirmasi destinasi sama dengan yang sudah ada. Hanya pengajuan destinasi ini yang ditolak, akun mitra tidak terdampak. Admin dapat menolak pengajuan destinasi ini saja (destinations.status = rejected, hanya di ERD). partners.is_verified tidak diubah. Catatan: Hanya pengajuan destinasi yang ditolak. Tidak ada aturan yang mengubah partners.is_verified.

### P4: Attraction lokasi jauh, NIB dan SK Pokdarwis diputuskan berlaku dan keduanya valid

| Input | Nilai |
|---|---|
| partner_type | attraction |
| nib_diperlukan, sk_pokdarwis_diperlukan | ya, ya |
| KTP; NIB; bukti pengelolaan; SK Pokdarwis | lolos pemeriksaan; lolos pemeriksaan; lolos pemeriksaan; lolos pemeriksaan |
| Koordinat dan jarak | -7,9300 ; 112,9450 ; 1.645,6 m |
| status_antrean_kurasi | tidak diberikan |

Aturan menyala: R1, R2, R3, R4, R5, R11, R12

Proses inferensi:
1. R1: ktp_valid = ya
2. R2: nib_valid = ya
3. R3: izin_pengelolaan_valid = ya
4. R4: sk_pokdarwis_valid = ya
5. R5: dokumen_lengkap = ya
6. R11: lokasi_lolos = ya
7. R12: rekomendasi = SETUJUI
8. R12: cakupan = pengajuan_destinasi
9. R12: akun_mitra_terdampak = tidak

Hasil yang diharapkan: rekomendasi = SETUJUI, status_tindak_lanjut = tidak ada (cakupan pengajuan_destinasi)

Penjelasan: Lokasi lolos dan dokumen Attraction lengkap. Ini rekomendasi kurasi destinasi, bukan verifikasi akun mitra. Admin dapat menyetujui pengajuan destinasi ini saja (destinations.status = approved, hanya di ERD). partners.is_verified tidak diubah: verifikasi KYC mitra (pending, verified, rejected) adalah keputusan reviewer yang terpisah. Belum diputuskan apakah mitra harus verified lebih dulu (N9), KB tidak membaca partners.is_verified.

Asumsi bersyarat (N9, NEEDS_CONFIRMATION): Contoh bersyarat: rekomendasi SETUJUI dihitung tanpa membaca partners.is_verified. Ini bukan jawaban bahwa mitra tidak perlu verified. Belum diputuskan apakah mitra harus verified sebelum destinasinya boleh disetujui.

### P5: Attraction dikelola Pokdarwis (SK berlaku), SK Pokdarwis tidak diunggah

| Input | Nilai |
|---|---|
| partner_type | attraction |
| nib_diperlukan, sk_pokdarwis_diperlukan | tidak, ya |
| KTP; NIB; bukti pengelolaan; SK Pokdarwis | lolos pemeriksaan; tidak diunggah; lolos pemeriksaan; tidak diunggah |
| Koordinat dan jarak | -7,9300 ; 112,9450 ; 1.645,6 m |
| status_antrean_kurasi | tidak diberikan |

Aturan menyala: R1, R3, R11, R13

Proses inferensi:
1. R1: ktp_valid = ya
2. R3: izin_pengelolaan_valid = ya
3. R11: lokasi_lolos = ya
4. R13: rekomendasi = REVISI
5. R13: cakupan = dokumen_mitra
6. R13: akun_mitra_terdampak = tidak

Hasil yang diharapkan: rekomendasi = REVISI, status_tindak_lanjut = tidak ada (cakupan dokumen_mitra)

Penjelasan: Lokasi lolos, penerapan NIB dan SK sudah diputuskan eksplisit, tetapi ada dokumen Attraction yang belum valid. Dokumen dikembalikan ke mitra. Reviewer di wireflow hanya punya VERIFIED dan REJECTED (NOT_DEFINED_IN_SPRINT_1). partners.is_verified tidak diubah KB, nilainya ditentukan reviewer KYC secara terpisah (PROPOSED).

### P6: Attraction dalam 500 m, admin menyatakan destinasi berbeda (bukan_duplikat), dokumen lengkap

| Input | Nilai |
|---|---|
| partner_type | attraction |
| nib_diperlukan, sk_pokdarwis_diperlukan | ya, tidak |
| KTP; NIB; bukti pengelolaan; SK Pokdarwis | lolos pemeriksaan; lolos pemeriksaan; lolos pemeriksaan; tidak diunggah |
| Koordinat dan jarak | -7,9400 ; 112,9520 ; 299,0 m |
| status_antrean_kurasi | bukan_duplikat |

Aturan menyala: R1, R2, R3, R5, R7, R11, R12

Proses inferensi:
1. R1: ktp_valid = ya
2. R2: nib_valid = ya
3. R3: izin_pengelolaan_valid = ya
4. R5: dokumen_lengkap = ya
5. R7: status_lokasi = POTENTIAL_DUPLICATE
6. R11: lokasi_lolos = ya
7. R12: rekomendasi = SETUJUI
8. R12: cakupan = pengajuan_destinasi
9. R12: akun_mitra_terdampak = tidak

Hasil yang diharapkan: rekomendasi = SETUJUI, status_tindak_lanjut = tidak ada (cakupan pengajuan_destinasi)

Penjelasan: Lokasi lolos dan dokumen Attraction lengkap. Ini rekomendasi kurasi destinasi, bukan verifikasi akun mitra. Admin dapat menyetujui pengajuan destinasi ini saja (destinations.status = approved, hanya di ERD). partners.is_verified tidak diubah: verifikasi KYC mitra (pending, verified, rejected) adalah keputusan reviewer yang terpisah. Belum diputuskan apakah mitra harus verified lebih dulu (N9), KB tidak membaca partners.is_verified. Catatan: POTENTIAL_DUPLICATE bersama SETUJUI sah karena admin sudah menyatakan bukan_duplikat (R11). Tanpa itu hasilnya MENUNGGU_KURASI seperti P3a.

Asumsi bersyarat (N9, NEEDS_CONFIRMATION): Contoh bersyarat: rekomendasi SETUJUI dihitung tanpa membaca partners.is_verified. Ini bukan jawaban bahwa mitra tidak perlu verified. Belum diputuskan apakah mitra harus verified sebelum destinasinya boleh disetujui.

### P7: Attraction dengan NIB berlaku tetapi NIB tidak lolos pemeriksaan

| Input | Nilai |
|---|---|
| partner_type | attraction |
| nib_diperlukan, sk_pokdarwis_diperlukan | ya, tidak |
| KTP; NIB; bukti pengelolaan; SK Pokdarwis | lolos pemeriksaan; diunggah tetapi tidak lolos; lolos pemeriksaan; tidak diunggah |
| Koordinat dan jarak | -7,9600 ; 112,9400 ; 2.415,8 m |
| status_antrean_kurasi | tidak diberikan |

Aturan menyala: R1, R3, R11, R13

Proses inferensi:
1. R1: ktp_valid = ya
2. R3: izin_pengelolaan_valid = ya
3. R11: lokasi_lolos = ya
4. R13: rekomendasi = REVISI
5. R13: cakupan = dokumen_mitra
6. R13: akun_mitra_terdampak = tidak

Hasil yang diharapkan: rekomendasi = REVISI, status_tindak_lanjut = tidak ada (cakupan dokumen_mitra)

Penjelasan: Lokasi lolos, penerapan NIB dan SK sudah diputuskan eksplisit, tetapi ada dokumen Attraction yang belum valid. Dokumen dikembalikan ke mitra. Reviewer di wireflow hanya punya VERIFIED dan REJECTED (NOT_DEFINED_IN_SPRINT_1). partners.is_verified tidak diubah KB, nilainya ditentukan reviewer KYC secara terpisah (PROPOSED).

### P8: Attraction dengan NIB diputuskan tidak berlaku, NIB terunggah tetapi tidak lolos, diabaikan

| Input | Nilai |
|---|---|
| partner_type | attraction |
| nib_diperlukan, sk_pokdarwis_diperlukan | tidak, tidak |
| KTP; NIB; bukti pengelolaan; SK Pokdarwis | lolos pemeriksaan; diunggah tetapi tidak lolos; lolos pemeriksaan; tidak diunggah |
| Koordinat dan jarak | -7,9100 ; 112,9600 ; 3.695,2 m |
| status_antrean_kurasi | tidak diberikan |

Aturan menyala: R1, R3, R5, R11, R12

Proses inferensi:
1. R1: ktp_valid = ya
2. R3: izin_pengelolaan_valid = ya
3. R5: dokumen_lengkap = ya
4. R11: lokasi_lolos = ya
5. R12: rekomendasi = SETUJUI
6. R12: cakupan = pengajuan_destinasi
7. R12: akun_mitra_terdampak = tidak

Hasil yang diharapkan: rekomendasi = SETUJUI, status_tindak_lanjut = tidak ada (cakupan pengajuan_destinasi)

Penjelasan: Lokasi lolos dan dokumen Attraction lengkap. Ini rekomendasi kurasi destinasi, bukan verifikasi akun mitra. Admin dapat menyetujui pengajuan destinasi ini saja (destinations.status = approved, hanya di ERD). partners.is_verified tidak diubah: verifikasi KYC mitra (pending, verified, rejected) adalah keputusan reviewer yang terpisah. Belum diputuskan apakah mitra harus verified lebih dulu (N9), KB tidak membaca partners.is_verified. Catatan: nib_diperlukan = tidak adalah keputusan eksplisit sehingga hasil pemeriksaan NIB diabaikan.

Asumsi bersyarat (N9, NEEDS_CONFIRMATION): Contoh bersyarat: rekomendasi SETUJUI dihitung tanpa membaca partners.is_verified. Ini bukan jawaban bahwa mitra tidak perlu verified. Belum diputuskan apakah mitra harus verified sebelum destinasinya boleh disetujui.

### P9: tour_agent lokasi jauh tanpa dokumen, syarat dokumen NEEDS_CONFIRMATION

| Input | Nilai |
|---|---|
| partner_type | tour_agent |
| nib_diperlukan, sk_pokdarwis_diperlukan | tidak diberikan, tidak diberikan |
| KTP; NIB; bukti pengelolaan; SK Pokdarwis | tidak diunggah; tidak diunggah; tidak diunggah; tidak diunggah |
| Koordinat dan jarak | -7,9190 ; 112,9500 ; 2.633,9 m |
| status_antrean_kurasi | tidak diberikan |

Aturan menyala: R6, R11, R14

Proses inferensi:
1. R6: syarat_dokumen_status = NEEDS_CONFIRMATION
2. R11: lokasi_lolos = ya
3. R14: status_tindak_lanjut = MENUNGGU_KURASI
4. R14: cakupan = dokumen_mitra
5. R14: akun_mitra_terdampak = tidak

Hasil yang diharapkan: rekomendasi = tidak ada, status_tindak_lanjut = MENUNGGU_KURASI (cakupan dokumen_mitra)

Penjelasan: Lokasi lolos tetapi syarat dokumen tipe mitra ini, atau berlaku tidaknya NIB dan SK Pokdarwis, belum terkonfirmasi. KB tidak memberi rekomendasi (tidak menyetujui, tidak merevisi, tidak menolak), status_tindak_lanjut = MENUNGGU_KURASI dan admin memeriksa manual. Tidak ada persetujuan atau penolakan otomatis karena syarat dokumen atau penerapan NIB dan SK belum terkonfirmasi. partners.is_verified tidak diubah. Catatan: Syarat dokumen tour_agent NEEDS_CONFIRMATION. Tanpa dokumen apa pun KB tidak menolak dan tidak merevisi.

Asumsi bersyarat (N4, NEEDS_CONFIRMATION): Contoh bersyarat: partner_type tour_agent, accommodation, atau transport mengajukan destinasi. KB hanya menguji logikanya. Belum diputuskan apakah ketiganya boleh mengajukan destinasi.

### P10: accommodation dalam 500 m, admin menyatakan berbeda, tanpa dokumen

| Input | Nilai |
|---|---|
| partner_type | accommodation |
| nib_diperlukan, sk_pokdarwis_diperlukan | tidak diberikan, tidak diberikan |
| KTP; NIB; bukti pengelolaan; SK Pokdarwis | tidak diunggah; tidak diunggah; tidak diunggah; tidak diunggah |
| Koordinat dan jarak | -7,9400 ; 112,9520 ; 299,0 m |
| status_antrean_kurasi | bukan_duplikat |

Aturan menyala: R6, R7, R11, R14

Proses inferensi:
1. R6: syarat_dokumen_status = NEEDS_CONFIRMATION
2. R7: status_lokasi = POTENTIAL_DUPLICATE
3. R11: lokasi_lolos = ya
4. R14: status_tindak_lanjut = MENUNGGU_KURASI
5. R14: cakupan = dokumen_mitra
6. R14: akun_mitra_terdampak = tidak

Hasil yang diharapkan: rekomendasi = tidak ada, status_tindak_lanjut = MENUNGGU_KURASI (cakupan dokumen_mitra)

Penjelasan: Lokasi lolos tetapi syarat dokumen tipe mitra ini, atau berlaku tidaknya NIB dan SK Pokdarwis, belum terkonfirmasi. KB tidak memberi rekomendasi (tidak menyetujui, tidak merevisi, tidak menolak), status_tindak_lanjut = MENUNGGU_KURASI dan admin memeriksa manual. Tidak ada persetujuan atau penolakan otomatis karena syarat dokumen atau penerapan NIB dan SK belum terkonfirmasi. partners.is_verified tidak diubah. Catatan: Lokasi lolos karena admin menyatakan berbeda. Syarat dokumen accommodation NEEDS_CONFIRMATION sehingga admin memeriksa manual.

Asumsi bersyarat (N4, NEEDS_CONFIRMATION): Contoh bersyarat: partner_type tour_agent, accommodation, atau transport mengajukan destinasi. KB hanya menguji logikanya. Belum diputuskan apakah ketiganya boleh mengajukan destinasi.

### P11: transport sangat dekat, admin mengonfirmasi duplikat, tanpa dokumen

| Input | Nilai |
|---|---|
| partner_type | transport |
| nib_diperlukan, sk_pokdarwis_diperlukan | tidak diberikan, tidak diberikan |
| KTP; NIB; bukti pengelolaan; SK Pokdarwis | tidak diunggah; tidak diunggah; tidak diunggah; tidak diunggah |
| Koordinat dan jarak | -7,9435 ; 112,9535 ; 124,1 m |
| status_antrean_kurasi | duplikat_terkonfirmasi |

Aturan menyala: R6, R7, R9

Proses inferensi:
1. R6: syarat_dokumen_status = NEEDS_CONFIRMATION
2. R7: status_lokasi = POTENTIAL_DUPLICATE
3. R9: rekomendasi = TOLAK
4. R9: cakupan = pengajuan_destinasi
5. R9: akun_mitra_terdampak = tidak

Hasil yang diharapkan: rekomendasi = TOLAK, status_tindak_lanjut = tidak ada (cakupan pengajuan_destinasi)

Penjelasan: Admin mengonfirmasi destinasi sama dengan yang sudah ada. Hanya pengajuan destinasi ini yang ditolak, akun mitra tidak terdampak. Admin dapat menolak pengajuan destinasi ini saja (destinations.status = rejected, hanya di ERD). partners.is_verified tidak diubah. Catatan: Penolakan duplikat tidak bergantung pada syarat dokumen. Apakah transport boleh mengajukan destinasi NEEDS_CONFIRMATION (N4), kasus ini hanya menguji logika KB.

Asumsi bersyarat (N4, NEEDS_CONFIRMATION): Contoh bersyarat: partner_type tour_agent, accommodation, atau transport mengajukan destinasi. KB hanya menguji logikanya. Belum diputuskan apakah ketiganya boleh mengajukan destinasi.

### T1: Batas tepat 500,0 m, belum ditinjau

| Input | Nilai |
|---|---|
| partner_type | attraction |
| nib_diperlukan, sk_pokdarwis_diperlukan | tidak, tidak |
| KTP; NIB; bukti pengelolaan; SK Pokdarwis | lolos pemeriksaan; tidak diunggah; lolos pemeriksaan; tidak diunggah |
| Koordinat dan jarak | -7,9380033920 ; 112,9530 ; 500,0 m |
| status_antrean_kurasi | belum_ditinjau |

Aturan menyala: R1, R3, R5, R7, R8

Proses inferensi:
1. R1: ktp_valid = ya
2. R3: izin_pengelolaan_valid = ya
3. R5: dokumen_lengkap = ya
4. R7: status_lokasi = POTENTIAL_DUPLICATE
5. R8: status_tindak_lanjut = MENUNGGU_KURASI
6. R8: cakupan = pengajuan_destinasi
7. R8: akun_mitra_terdampak = tidak

Hasil yang diharapkan: rekomendasi = tidak ada, status_tindak_lanjut = MENUNGGU_KURASI (cakupan pengajuan_destinasi)

Penjelasan: Potensi duplikat belum ditinjau admin. KB belum memberi rekomendasi, pengajuan masuk antrean (status_tindak_lanjut). Pengajuan destinasi tetap pending (destinations.status, hanya di ERD). Flag POTENTIAL_DUPLICATE dan status antrean tidak punya field di Sprint 1 (NOT_DEFINED_IN_SPRINT_1). partners.is_verified tidak diubah. Catatan: Jarak tepat 500,0 m harus POTENTIAL_DUPLICATE.

### T2: Batas 500,1 m

| Input | Nilai |
|---|---|
| partner_type | attraction |
| nib_diperlukan, sk_pokdarwis_diperlukan | tidak, tidak |
| KTP; NIB; bukti pengelolaan; SK Pokdarwis | lolos pemeriksaan; tidak diunggah; lolos pemeriksaan; tidak diunggah |
| Koordinat dan jarak | -7,9380024926 ; 112,9530 ; 500,1 m |
| status_antrean_kurasi | tidak diberikan |

Aturan menyala: R1, R3, R5, R11, R12

Proses inferensi:
1. R1: ktp_valid = ya
2. R3: izin_pengelolaan_valid = ya
3. R5: dokumen_lengkap = ya
4. R11: lokasi_lolos = ya
5. R12: rekomendasi = SETUJUI
6. R12: cakupan = pengajuan_destinasi
7. R12: akun_mitra_terdampak = tidak

Hasil yang diharapkan: rekomendasi = SETUJUI, status_tindak_lanjut = tidak ada (cakupan pengajuan_destinasi)

Penjelasan: Lokasi lolos dan dokumen Attraction lengkap. Ini rekomendasi kurasi destinasi, bukan verifikasi akun mitra. Admin dapat menyetujui pengajuan destinasi ini saja (destinations.status = approved, hanya di ERD). partners.is_verified tidak diubah: verifikasi KYC mitra (pending, verified, rejected) adalah keputusan reviewer yang terpisah. Belum diputuskan apakah mitra harus verified lebih dulu (N9), KB tidak membaca partners.is_verified. Catatan: Jarak 500,1 m tidak memicu ambang.

Asumsi bersyarat (N9, NEEDS_CONFIRMATION): Contoh bersyarat: rekomendasi SETUJUI dihitung tanpa membaca partners.is_verified. Ini bukan jawaban bahwa mitra tidak perlu verified. Belum diputuskan apakah mitra harus verified sebelum destinasinya boleh disetujui.

### T3: Dalam 500 m, admin meminta bukti lokasi

| Input | Nilai |
|---|---|
| partner_type | attraction |
| nib_diperlukan, sk_pokdarwis_diperlukan | tidak, tidak |
| KTP; NIB; bukti pengelolaan; SK Pokdarwis | lolos pemeriksaan; tidak diunggah; lolos pemeriksaan; tidak diunggah |
| Koordinat dan jarak | -7,9450 ; 112,9545 ; 323,4 m |
| status_antrean_kurasi | perlu_bukti |

Aturan menyala: R1, R3, R5, R7, R10

Proses inferensi:
1. R1: ktp_valid = ya
2. R3: izin_pengelolaan_valid = ya
3. R5: dokumen_lengkap = ya
4. R7: status_lokasi = POTENTIAL_DUPLICATE
5. R10: rekomendasi = REVISI
6. R10: cakupan = pengajuan_destinasi
7. R10: akun_mitra_terdampak = tidak

Hasil yang diharapkan: rekomendasi = REVISI, status_tindak_lanjut = tidak ada (cakupan pengajuan_destinasi)

Penjelasan: Admin meminta bukti lokasi tambahan untuk pengajuan destinasi ini. Pengajuan dikembalikan ke mitra. REVISI tidak ada di Sprint 1 (NOT_DEFINED_IN_SPRINT_1). destinations.status tetap pending (PROPOSED). partners.is_verified tidak diubah. Catatan: REVISI untuk bukti lokasi memakai R10 (PROPOSED).

### T4: Dalam 500 m, admin menyatakan berbeda, tetapi KTP tidak lolos pemeriksaan

| Input | Nilai |
|---|---|
| partner_type | attraction |
| nib_diperlukan, sk_pokdarwis_diperlukan | tidak, tidak |
| KTP; NIB; bukti pengelolaan; SK Pokdarwis | diunggah tetapi tidak lolos; tidak diunggah; lolos pemeriksaan; tidak diunggah |
| Koordinat dan jarak | -7,9400 ; 112,9520 ; 299,0 m |
| status_antrean_kurasi | bukan_duplikat |

Aturan menyala: R3, R7, R11, R13

Proses inferensi:
1. R3: izin_pengelolaan_valid = ya
2. R7: status_lokasi = POTENTIAL_DUPLICATE
3. R11: lokasi_lolos = ya
4. R13: rekomendasi = REVISI
5. R13: cakupan = dokumen_mitra
6. R13: akun_mitra_terdampak = tidak

Hasil yang diharapkan: rekomendasi = REVISI, status_tindak_lanjut = tidak ada (cakupan dokumen_mitra)

Penjelasan: Lokasi lolos, penerapan NIB dan SK sudah diputuskan eksplisit, tetapi ada dokumen Attraction yang belum valid. Dokumen dikembalikan ke mitra. Reviewer di wireflow hanya punya VERIFIED dan REJECTED (NOT_DEFINED_IN_SPRINT_1). partners.is_verified tidak diubah KB, nilainya ditentukan reviewer KYC secara terpisah (PROPOSED). Catatan: Lokasi lolos tetapi KTP tidak lolos pemeriksaan, jadi dokumen_lengkap tidak terbentuk dan R13 menyala.

### A1: Mitra yang sama, pengajuan destinasi pertama dikonfirmasi duplikat

| Input | Nilai |
|---|---|
| partner_type | attraction |
| nib_diperlukan, sk_pokdarwis_diperlukan | tidak, tidak |
| KTP; NIB; bukti pengelolaan; SK Pokdarwis | lolos pemeriksaan; tidak diunggah; lolos pemeriksaan; tidak diunggah |
| Koordinat dan jarak | -7,9435 ; 112,9535 ; 124,1 m |
| status_antrean_kurasi | duplikat_terkonfirmasi |

Aturan menyala: R1, R3, R5, R7, R9

Proses inferensi:
1. R1: ktp_valid = ya
2. R3: izin_pengelolaan_valid = ya
3. R5: dokumen_lengkap = ya
4. R7: status_lokasi = POTENTIAL_DUPLICATE
5. R9: rekomendasi = TOLAK
6. R9: cakupan = pengajuan_destinasi
7. R9: akun_mitra_terdampak = tidak

Hasil yang diharapkan: rekomendasi = TOLAK, status_tindak_lanjut = tidak ada (cakupan pengajuan_destinasi)

Penjelasan: Admin mengonfirmasi destinasi sama dengan yang sudah ada. Hanya pengajuan destinasi ini yang ditolak, akun mitra tidak terdampak. Admin dapat menolak pengajuan destinasi ini saja (destinations.status = rejected, hanya di ERD). partners.is_verified tidak diubah. Catatan: Mitra yang sama dengan A2. Penolakan A1 tidak memengaruhi A2.

### A2: Mitra yang sama dengan dokumen yang sama, pengajuan destinasi kedua di lokasi jauh

| Input | Nilai |
|---|---|
| partner_type | attraction |
| nib_diperlukan, sk_pokdarwis_diperlukan | tidak, tidak |
| KTP; NIB; bukti pengelolaan; SK Pokdarwis | lolos pemeriksaan; tidak diunggah; lolos pemeriksaan; tidak diunggah |
| Koordinat dan jarak | -7,9190 ; 112,9500 ; 2.633,9 m |
| status_antrean_kurasi | tidak diberikan |

Aturan menyala: R1, R3, R5, R11, R12

Proses inferensi:
1. R1: ktp_valid = ya
2. R3: izin_pengelolaan_valid = ya
3. R5: dokumen_lengkap = ya
4. R11: lokasi_lolos = ya
5. R12: rekomendasi = SETUJUI
6. R12: cakupan = pengajuan_destinasi
7. R12: akun_mitra_terdampak = tidak

Hasil yang diharapkan: rekomendasi = SETUJUI, status_tindak_lanjut = tidak ada (cakupan pengajuan_destinasi)

Penjelasan: Lokasi lolos dan dokumen Attraction lengkap. Ini rekomendasi kurasi destinasi, bukan verifikasi akun mitra. Admin dapat menyetujui pengajuan destinasi ini saja (destinations.status = approved, hanya di ERD). partners.is_verified tidak diubah: verifikasi KYC mitra (pending, verified, rejected) adalah keputusan reviewer yang terpisah. Belum diputuskan apakah mitra harus verified lebih dulu (N9), KB tidak membaca partners.is_verified. Catatan: Dokumen identik dengan A1 dan hasilnya SETUJUI, bukti bahwa penolakan hanya berlaku per pengajuan destinasi.

Asumsi bersyarat (N9, NEEDS_CONFIRMATION): Contoh bersyarat: rekomendasi SETUJUI dihitung tanpa membaca partners.is_verified. Ini bukan jawaban bahwa mitra tidak perlu verified. Belum diputuskan apakah mitra harus verified sebelum destinasinya boleh disetujui.

### K1: Attraction lokasi jauh, KTP dan bukti pengelolaan valid, penerapan NIB NEEDS_CONFIRMATION, NIB tidak diunggah

| Input | Nilai |
|---|---|
| partner_type | attraction |
| nib_diperlukan, sk_pokdarwis_diperlukan | NEEDS_CONFIRMATION, tidak |
| KTP; NIB; bukti pengelolaan; SK Pokdarwis | lolos pemeriksaan; tidak diunggah; lolos pemeriksaan; tidak diunggah |
| Koordinat dan jarak | -7,9190 ; 112,9500 ; 2.633,9 m |
| status_antrean_kurasi | tidak diberikan |

Aturan menyala: R1, R3, R6, R11, R14

Proses inferensi:
1. R1: ktp_valid = ya
2. R3: izin_pengelolaan_valid = ya
3. R6: syarat_dokumen_status = NEEDS_CONFIRMATION
4. R11: lokasi_lolos = ya
5. R14: status_tindak_lanjut = MENUNGGU_KURASI
6. R14: cakupan = dokumen_mitra
7. R14: akun_mitra_terdampak = tidak

Hasil yang diharapkan: rekomendasi = tidak ada, status_tindak_lanjut = MENUNGGU_KURASI (cakupan dokumen_mitra)

Penjelasan: Lokasi lolos tetapi syarat dokumen tipe mitra ini, atau berlaku tidaknya NIB dan SK Pokdarwis, belum terkonfirmasi. KB tidak memberi rekomendasi (tidak menyetujui, tidak merevisi, tidak menolak), status_tindak_lanjut = MENUNGGU_KURASI dan admin memeriksa manual. Tidak ada persetujuan atau penolakan otomatis karena syarat dokumen atau penerapan NIB dan SK belum terkonfirmasi. partners.is_verified tidak diubah. Catatan: Sebelum perbaikan, fakta kosong atau false dianggap tidak berlaku sehingga kasus ini menghasilkan SETUJUI. Sekarang NEEDS_CONFIRMATION tidak pernah dianggap tidak berlaku: R5 tidak menyala dan R14 menyerahkan ke admin.

### K2: Attraction lokasi jauh, KTP dan bukti pengelolaan valid, fakta penerapan NIB dan SK tidak diberikan sama sekali

| Input | Nilai |
|---|---|
| partner_type | attraction |
| nib_diperlukan, sk_pokdarwis_diperlukan | tidak diberikan, tidak diberikan |
| KTP; NIB; bukti pengelolaan; SK Pokdarwis | lolos pemeriksaan; tidak diunggah; lolos pemeriksaan; tidak diunggah |
| Koordinat dan jarak | -7,9190 ; 112,9500 ; 2.633,9 m |
| status_antrean_kurasi | tidak diberikan |

Aturan menyala: R1, R3, R6, R11, R14

Proses inferensi:
1. R1: ktp_valid = ya
2. R3: izin_pengelolaan_valid = ya
3. R6: syarat_dokumen_status = NEEDS_CONFIRMATION
4. R11: lokasi_lolos = ya
5. R14: status_tindak_lanjut = MENUNGGU_KURASI
6. R14: cakupan = dokumen_mitra
7. R14: akun_mitra_terdampak = tidak

Hasil yang diharapkan: rekomendasi = tidak ada, status_tindak_lanjut = MENUNGGU_KURASI (cakupan dokumen_mitra)

Penjelasan: Lokasi lolos tetapi syarat dokumen tipe mitra ini, atau berlaku tidaknya NIB dan SK Pokdarwis, belum terkonfirmasi. KB tidak memberi rekomendasi (tidak menyetujui, tidak merevisi, tidak menolak), status_tindak_lanjut = MENUNGGU_KURASI dan admin memeriksa manual. Tidak ada persetujuan atau penolakan otomatis karena syarat dokumen atau penerapan NIB dan SK belum terkonfirmasi. partners.is_verified tidak diubah. Catatan: Fakta penerapan NIB dan SK tidak diberikan. Engine lama menghasilkan SETUJUI. Sekarang tidak ada keputusan eksplisit sehingga R6 menyala dan R5 tidak.

### K3: Attraction lokasi jauh, semua dokumen terunggah dan lolos, tetapi penerapan SK Pokdarwis NEEDS_CONFIRMATION

| Input | Nilai |
|---|---|
| partner_type | attraction |
| nib_diperlukan, sk_pokdarwis_diperlukan | tidak, NEEDS_CONFIRMATION |
| KTP; NIB; bukti pengelolaan; SK Pokdarwis | lolos pemeriksaan; lolos pemeriksaan; lolos pemeriksaan; lolos pemeriksaan |
| Koordinat dan jarak | -7,9190 ; 112,9500 ; 2.633,9 m |
| status_antrean_kurasi | tidak diberikan |

Aturan menyala: R1, R2, R3, R4, R6, R11, R14

Proses inferensi:
1. R1: ktp_valid = ya
2. R2: nib_valid = ya
3. R3: izin_pengelolaan_valid = ya
4. R4: sk_pokdarwis_valid = ya
5. R6: syarat_dokumen_status = NEEDS_CONFIRMATION
6. R11: lokasi_lolos = ya
7. R14: status_tindak_lanjut = MENUNGGU_KURASI
8. R14: cakupan = dokumen_mitra
9. R14: akun_mitra_terdampak = tidak

Hasil yang diharapkan: rekomendasi = tidak ada, status_tindak_lanjut = MENUNGGU_KURASI (cakupan dokumen_mitra)

Penjelasan: Lokasi lolos tetapi syarat dokumen tipe mitra ini, atau berlaku tidaknya NIB dan SK Pokdarwis, belum terkonfirmasi. KB tidak memberi rekomendasi (tidak menyetujui, tidak merevisi, tidak menolak), status_tindak_lanjut = MENUNGGU_KURASI dan admin memeriksa manual. Tidak ada persetujuan atau penolakan otomatis karena syarat dokumen atau penerapan NIB dan SK belum terkonfirmasi. partners.is_verified tidak diubah. Catatan: Dokumen SK yang sudah diunggah dan lolos tidak menggantikan keputusan penerapan. Selama sk_pokdarwis_diperlukan NEEDS_CONFIRMATION, KB tidak menyimpulkan dokumen lengkap.

### K4: Attraction lokasi jauh, NIB diputuskan berlaku dan valid, penerapan SK tidak diberikan

| Input | Nilai |
|---|---|
| partner_type | attraction |
| nib_diperlukan, sk_pokdarwis_diperlukan | ya, tidak diberikan |
| KTP; NIB; bukti pengelolaan; SK Pokdarwis | lolos pemeriksaan; lolos pemeriksaan; lolos pemeriksaan; tidak diunggah |
| Koordinat dan jarak | -7,9190 ; 112,9500 ; 2.633,9 m |
| status_antrean_kurasi | tidak diberikan |

Aturan menyala: R1, R2, R3, R6, R11, R14

Proses inferensi:
1. R1: ktp_valid = ya
2. R2: nib_valid = ya
3. R3: izin_pengelolaan_valid = ya
4. R6: syarat_dokumen_status = NEEDS_CONFIRMATION
5. R11: lokasi_lolos = ya
6. R14: status_tindak_lanjut = MENUNGGU_KURASI
7. R14: cakupan = dokumen_mitra
8. R14: akun_mitra_terdampak = tidak

Hasil yang diharapkan: rekomendasi = tidak ada, status_tindak_lanjut = MENUNGGU_KURASI (cakupan dokumen_mitra)

Penjelasan: Lokasi lolos tetapi syarat dokumen tipe mitra ini, atau berlaku tidaknya NIB dan SK Pokdarwis, belum terkonfirmasi. KB tidak memberi rekomendasi (tidak menyetujui, tidak merevisi, tidak menolak), status_tindak_lanjut = MENUNGGU_KURASI dan admin memeriksa manual. Tidak ada persetujuan atau penolakan otomatis karena syarat dokumen atau penerapan NIB dan SK belum terkonfirmasi. partners.is_verified tidak diubah. Catatan: Satu keputusan eksplisit (NIB = ya) tidak cukup. Fakta SK yang tidak diberikan tetap belum terkonfirmasi.

### K5: Attraction dalam 500 m belum ditinjau, penerapan NIB dan SK NEEDS_CONFIRMATION: antrean kurasi lebih dulu

| Input | Nilai |
|---|---|
| partner_type | attraction |
| nib_diperlukan, sk_pokdarwis_diperlukan | NEEDS_CONFIRMATION, NEEDS_CONFIRMATION |
| KTP; NIB; bukti pengelolaan; SK Pokdarwis | lolos pemeriksaan; tidak diunggah; lolos pemeriksaan; tidak diunggah |
| Koordinat dan jarak | -7,9435 ; 112,9535 ; 124,1 m |
| status_antrean_kurasi | tidak diberikan |

Aturan menyala: R1, R3, R6, R7, R8

Proses inferensi:
1. R1: ktp_valid = ya
2. R3: izin_pengelolaan_valid = ya
3. R6: syarat_dokumen_status = NEEDS_CONFIRMATION
4. R7: status_lokasi = POTENTIAL_DUPLICATE
5. R7 default: status_antrean_kurasi = belum_ditinjau
6. R8: status_tindak_lanjut = MENUNGGU_KURASI
7. R8: cakupan = pengajuan_destinasi
8. R8: akun_mitra_terdampak = tidak

Hasil yang diharapkan: rekomendasi = tidak ada, status_tindak_lanjut = MENUNGGU_KURASI (cakupan pengajuan_destinasi)

Penjelasan: Potensi duplikat belum ditinjau admin. KB belum memberi rekomendasi, pengajuan masuk antrean (status_tindak_lanjut). Pengajuan destinasi tetap pending (destinations.status, hanya di ERD). Flag POTENTIAL_DUPLICATE dan status antrean tidak punya field di Sprint 1 (NOT_DEFINED_IN_SPRINT_1). partners.is_verified tidak diubah. Catatan: Antrean kurasi lokasi tetap lebih dulu. R6 menyala tetapi R14 baru bisa menyala setelah lokasi lolos. Partners.is_verified tidak berubah.

### K6: Attraction dalam 500 m, admin menyatakan berbeda, penerapan NIB NEEDS_CONFIRMATION

| Input | Nilai |
|---|---|
| partner_type | attraction |
| nib_diperlukan, sk_pokdarwis_diperlukan | NEEDS_CONFIRMATION, tidak |
| KTP; NIB; bukti pengelolaan; SK Pokdarwis | lolos pemeriksaan; tidak diunggah; lolos pemeriksaan; tidak diunggah |
| Koordinat dan jarak | -7,9400 ; 112,9520 ; 299,0 m |
| status_antrean_kurasi | bukan_duplikat |

Aturan menyala: R1, R3, R6, R7, R11, R14

Proses inferensi:
1. R1: ktp_valid = ya
2. R3: izin_pengelolaan_valid = ya
3. R6: syarat_dokumen_status = NEEDS_CONFIRMATION
4. R7: status_lokasi = POTENTIAL_DUPLICATE
5. R11: lokasi_lolos = ya
6. R14: status_tindak_lanjut = MENUNGGU_KURASI
7. R14: cakupan = dokumen_mitra
8. R14: akun_mitra_terdampak = tidak

Hasil yang diharapkan: rekomendasi = tidak ada, status_tindak_lanjut = MENUNGGU_KURASI (cakupan dokumen_mitra)

Penjelasan: Lokasi lolos tetapi syarat dokumen tipe mitra ini, atau berlaku tidaknya NIB dan SK Pokdarwis, belum terkonfirmasi. KB tidak memberi rekomendasi (tidak menyetujui, tidak merevisi, tidak menolak), status_tindak_lanjut = MENUNGGU_KURASI dan admin memeriksa manual. Tidak ada persetujuan atau penolakan otomatis karena syarat dokumen atau penerapan NIB dan SK belum terkonfirmasi. partners.is_verified tidak diubah. Catatan: Setelah admin menyatakan destinasi berbeda, lokasi lolos tetapi penerapan NIB belum terkonfirmasi sehingga KB berhenti di R14, bukan di R12.

### K7: Attraction dalam 500 m, duplikat terkonfirmasi, penerapan NIB dan SK NEEDS_CONFIRMATION: tetap TOLAK pengajuan itu saja

| Input | Nilai |
|---|---|
| partner_type | attraction |
| nib_diperlukan, sk_pokdarwis_diperlukan | NEEDS_CONFIRMATION, NEEDS_CONFIRMATION |
| KTP; NIB; bukti pengelolaan; SK Pokdarwis | lolos pemeriksaan; tidak diunggah; lolos pemeriksaan; tidak diunggah |
| Koordinat dan jarak | -7,9435 ; 112,9535 ; 124,1 m |
| status_antrean_kurasi | duplikat_terkonfirmasi |

Aturan menyala: R1, R3, R6, R7, R9

Proses inferensi:
1. R1: ktp_valid = ya
2. R3: izin_pengelolaan_valid = ya
3. R6: syarat_dokumen_status = NEEDS_CONFIRMATION
4. R7: status_lokasi = POTENTIAL_DUPLICATE
5. R9: rekomendasi = TOLAK
6. R9: cakupan = pengajuan_destinasi
7. R9: akun_mitra_terdampak = tidak

Hasil yang diharapkan: rekomendasi = TOLAK, status_tindak_lanjut = tidak ada (cakupan pengajuan_destinasi)

Penjelasan: Admin mengonfirmasi destinasi sama dengan yang sudah ada. Hanya pengajuan destinasi ini yang ditolak, akun mitra tidak terdampak. Admin dapat menolak pengajuan destinasi ini saja (destinations.status = rejected, hanya di ERD). partners.is_verified tidak diubah. Catatan: Penolakan duplikat tidak bergantung pada penerapan NIB dan SK. TOLAK hanya untuk pengajuan itu dan partners.is_verified tidak diubah.

### K8: Attraction lokasi jauh, penerapan NIB diisi boolean false (bentuk lama), bukan keputusan eksplisit

| Input | Nilai |
|---|---|
| partner_type | attraction |
| nib_diperlukan, sk_pokdarwis_diperlukan | false (boolean bentuk lama), tidak |
| KTP; NIB; bukti pengelolaan; SK Pokdarwis | lolos pemeriksaan; tidak diunggah; lolos pemeriksaan; tidak diunggah |
| Koordinat dan jarak | -7,9190 ; 112,9500 ; 2.633,9 m |
| status_antrean_kurasi | tidak diberikan |

Aturan menyala: R1, R3, R6, R11, R14

Proses inferensi:
1. R1: ktp_valid = ya
2. R3: izin_pengelolaan_valid = ya
3. R6: syarat_dokumen_status = NEEDS_CONFIRMATION
4. R11: lokasi_lolos = ya
5. R14: status_tindak_lanjut = MENUNGGU_KURASI
6. R14: cakupan = dokumen_mitra
7. R14: akun_mitra_terdampak = tidak

Hasil yang diharapkan: rekomendasi = tidak ada, status_tindak_lanjut = MENUNGGU_KURASI (cakupan dokumen_mitra)

Penjelasan: Lokasi lolos tetapi syarat dokumen tipe mitra ini, atau berlaku tidaknya NIB dan SK Pokdarwis, belum terkonfirmasi. KB tidak memberi rekomendasi (tidak menyetujui, tidak merevisi, tidak menolak), status_tindak_lanjut = MENUNGGU_KURASI dan admin memeriksa manual. Tidak ada persetujuan atau penolakan otomatis karena syarat dokumen atau penerapan NIB dan SK belum terkonfirmasi. partners.is_verified tidak diubah. Catatan: Boolean false bentuk lama bukan keputusan eksplisit. Engine mencatat peringatan dan memperlakukannya sebagai belum terkonfirmasi. Peringatan engine: nib_diperlukan = False bukan ya atau tidak: dianggap belum terkonfirmasi, bukan tidak berlaku.

### K9: Attraction lokasi jauh, NIB berlaku tetapi tidak lolos, penerapan SK NEEDS_CONFIRMATION: belum terkonfirmasi didahulukan dari REVISI

| Input | Nilai |
|---|---|
| partner_type | attraction |
| nib_diperlukan, sk_pokdarwis_diperlukan | ya, NEEDS_CONFIRMATION |
| KTP; NIB; bukti pengelolaan; SK Pokdarwis | lolos pemeriksaan; diunggah tetapi tidak lolos; lolos pemeriksaan; tidak diunggah |
| Koordinat dan jarak | -7,9190 ; 112,9500 ; 2.633,9 m |
| status_antrean_kurasi | tidak diberikan |

Aturan menyala: R1, R3, R6, R11, R14

Proses inferensi:
1. R1: ktp_valid = ya
2. R3: izin_pengelolaan_valid = ya
3. R6: syarat_dokumen_status = NEEDS_CONFIRMATION
4. R11: lokasi_lolos = ya
5. R14: status_tindak_lanjut = MENUNGGU_KURASI
6. R14: cakupan = dokumen_mitra
7. R14: akun_mitra_terdampak = tidak

Hasil yang diharapkan: rekomendasi = tidak ada, status_tindak_lanjut = MENUNGGU_KURASI (cakupan dokumen_mitra)

Penjelasan: Lokasi lolos tetapi syarat dokumen tipe mitra ini, atau berlaku tidaknya NIB dan SK Pokdarwis, belum terkonfirmasi. KB tidak memberi rekomendasi (tidak menyetujui, tidak merevisi, tidak menolak), status_tindak_lanjut = MENUNGGU_KURASI dan admin memeriksa manual. Tidak ada persetujuan atau penolakan otomatis karena syarat dokumen atau penerapan NIB dan SK belum terkonfirmasi. partners.is_verified tidak diubah. Catatan: NIB berlaku tetapi tidak lolos akan menjadi REVISI jika kedua keputusan eksplisit (lihat P7). Karena penerapan SK belum terkonfirmasi, KB menyerahkan seluruhnya ke admin (PROPOSED).

## Skenario bersyarat (N4 dan N9)

Dua keputusan tim belum terjawab. Skenario di bawah ini adalah contoh bersyarat. Skenario itu menguji logika KB dan tidak menetapkan syarat bisnis.

| Butir | Label | Pertanyaan yang belum terjawab | Skenario terdampak | Yang dibuktikan skenario |
|---|---|---|---|---|
| N4 | NEEDS_CONFIRMATION | Apakah semua partner_type boleh mengajukan destinasi | P9, P10, P11 | Hanya bahwa KB tidak menolak, tidak merevisi, dan tidak menyetujui otomatis untuk tipe tanpa syarat dokumen. Bukan bukti bahwa tipe itu boleh mengajukan destinasi |
| N9 | NEEDS_CONFIRMATION | Apakah mitra harus berstatus verified sebelum destinasinya boleh disetujui | P1, P4, P6, P8, T2, A2 | Hanya bahwa KB menghitung SETUJUI tanpa membaca partners.is_verified. Bukan bukti bahwa verified tidak diperlukan |

Engine menguji bahwa nilai partners.is_verified (pending, verified, rejected) tidak mengubah hasil, sehingga KB tidak menjawab N9 ke salah satu arah. Jika tim memutuskan mitra harus verified, perlu aturan atau fakta baru dan skenario SETUJUI harus diulang. Jika tim memutuskan tipe tertentu tidak boleh mengajukan destinasi, skenario tipe itu menjadi masukan tidak valid.

## Matriks cakupan aturan

| Aturan | Diuji oleh |
|---|---|
| R1 | P1, P2, P3a, P3b, P4, P5, P6, P7, P8, T1, T2, T3, A1, A2, K1, K2, K3, K4, K5, K6, K7, K8, K9 |
| R2 | P4, P6, K3, K4 |
| R3 | P1, P3a, P3b, P4, P5, P6, P7, P8, T1, T2, T3, T4, A1, A2, K1, K2, K3, K4, K5, K6, K7, K8, K9 |
| R4 | P4, K3 |
| R5 | P1, P3a, P3b, P4, P6, P8, T1, T2, T3, A1, A2 |
| R6 | P9, P10, P11, K1, K2, K3, K4, K5, K6, K7, K8, K9 |
| R7 | P3a, P3b, P6, P10, P11, T1, T3, T4, A1, K5, K6, K7 |
| R8 | P3a, T1, K5 |
| R9 | P3b, P11, A1, K7 |
| R10 | T3 |
| R11 | P1, P2, P4, P5, P6, P7, P8, P9, P10, T2, T4, A2, K1, K2, K3, K4, K6, K8, K9 |
| R12 | P1, P4, P6, P8, T2, A2 |
| R13 | P2, P5, P7, T4 |
| R14 | P9, P10, K1, K2, K3, K4, K6, K8, K9 |

Semua 14 aturan teruji. Setiap kasus dicek bahwa tepat satu aturan akhir yang menyala, bahwa R5 dan R6 tidak menyala bersamaan, dan bahwa akun_mitra_terdampak = tidak. Kasus K1 sampai K9 dan P7, P8 juga dicek aturan mana yang wajib dan yang tidak boleh menyala.

## Uji menyeluruh

Selain skenario di atas, engine dibandingkan dengan perhitungan pembanding terpisah untuk 81648 kombinasi (4 partner_type, 81 kombinasi status dokumen [tidak diunggah, diunggah tidak lolos, lolos] untuk empat dokumen, 36 kombinasi penerapan NIB dan SK [ya, tidak, NEEDS_CONFIRMATION, tidak ada, true, false], 7 keadaan lokasi dan antrean). Semuanya cocok. Properti yang dijaga di setiap kombinasi: SETUJUI hanya untuk Attraction dengan penerapan NIB dan SK eksplisit; penerapan yang belum terkonfirmasi tidak pernah menjadi SETUJUI atau REVISI dokumen; potensi duplikat tidak langsung diputuskan; TOLAK hanya setelah duplikat_terkonfirmasi; partners.is_verified tidak pernah diubah.

## Uji tambahan

engine_test.py juga menguji: struktur keluaran (rekomendasi dan status_tindak_lanjut terpisah, MENUNGGU_KURASI tidak pernah menjadi rekomendasi, tepat satu field terisi); N4 dan N9 tetap NEEDS_CONFIRMATION dan tidak dibaca oleh aturan mana pun; masukan tidak valid (partner_type tidak dikenal, jarak hilang, berupa teks atau negatif, status antrean tidak dikenal) ditolak dengan ValueError; checklist KTP dan bukti pengelolaan yang hilang tidak pernah menghasilkan SETUJUI; Haversine dibandingkan dengan pendekatan ekuirektangular independen; dan urutan evaluasi aturan (penghasil fakta selalu sebelum pembacanya).

## Cara menjalankan ulang

Letakkan 03-rules.json, engine_test.py, dan file markdown di satu folder lalu jalankan: python3 engine_test.py
