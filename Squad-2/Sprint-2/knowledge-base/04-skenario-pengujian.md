# 04 Skenario Pengujian (Squad 2)

Selaras dengan 01-tabel-aturan.md dan 03-rules.json. Semua jarak dihitung dari koordinat memakai Haversine (R = 6.371.000 m, dibulatkan 1 desimal) oleh engine_test.py. Engine membaca 03-rules.json, menjalankan forward chaining, lalu membandingkan hasilnya dengan hasil yang diharapkan. Keluaran lengkap ada di hasil-uji.txt.

Destinasi pembanding (data contoh, bukan data asli). Jarak setiap skenario diukur ke destinasi berstatus approved atau pending yang terdekat (KT3):

| ID | Destinasi | Koordinat | Status | Pembanding jarak |
|---|---|---|---|---|
| D1 | Destinasi pembanding utama | -7,9425 ; 112,9530 | approved | dihitung |
| D2 | Pengajuan lain yang masih pending | -7,9700 ; 112,9000 | pending | dihitung |
| D3 | Pengajuan yang pernah ditolak | -7,9190 ; 112,9500 | rejected | tidak dihitung |

Fakta dokumen adalah checklist reviewer. Skenario P1 sampai P8 memakai Attraction dengan penerapan NIB dan SK Pokdarwis yang ditetapkan ya atau tidak. Skenario P9 sampai P13 memakai tour_agent, accommodation, dan transport yang syarat dokumennya KTP, NIB, dan izin usaha. Skenario V1 sampai V7 menguji status verifikasi mitra (`partners.is_verified`) sebagai syarat persetujuan. Setiap kasus juga dicek bahwa akun_mitra_terdampak = tidak, yaitu `partners.is_verified` tidak diubah oleh keluaran KB apa pun, dan bahwa status_verifikasi_mitra pada akhir inferensi sama dengan masukan.

Keluaran KB punya dua field terpisah. `rekomendasi` berisi SETUJUI, REVISI, atau TOLAK. `status_tindak_lanjut` berisi MENUNGGU_KURASI atau MENUNGGU_VERIFIKASI_MITRA saat pengajuan ditahan, dan pada saat itu rekomendasi kosong (tidak ada). Status tindak lanjut bukan rekomendasi. Setiap kasus dicek bahwa tepat satu dari kedua field terisi.

## Ringkasan 30 skenario

| Kode | partner_type | Koordinat | Jarak (m) | Antrean | Status mitra | Aturan menyala | Rekomendasi | Status tindak lanjut | Cakupan |
|---|---|---|---|---|---|---|---|---|---|
| P1 | attraction | -7,9190 ; 112,9500 | 2.633,9 | tidak diberikan | verified | R1, R3, R5, R11, R13 | SETUJUI | - | pengajuan_destinasi |
| P2 | attraction | -7,9800 ; 112,9700 | 4.570,8 | tidak diberikan | verified | R1, R11, R12 | REVISI | - | dokumen_mitra |
| P3a | attraction | -7,9435 ; 112,9535 | 124,1 | tidak diberikan | verified | R1, R3, R5, R7, R8 | - | MENUNGGU_KURASI | pengajuan_destinasi |
| P3b | attraction | -7,9435 ; 112,9535 | 124,1 | duplikat_terkonfirmasi | verified | R1, R3, R5, R7, R9 | TOLAK | - | pengajuan_destinasi |
| P4 | attraction | -7,9300 ; 112,9450 | 1.645,6 | tidak diberikan | verified | R1, R2, R3, R4, R5, R11, R13 | SETUJUI | - | pengajuan_destinasi |
| P5 | attraction | -7,9300 ; 112,9450 | 1.645,6 | tidak diberikan | verified | R1, R3, R11, R12 | REVISI | - | dokumen_mitra |
| P6 | attraction | -7,9400 ; 112,9520 | 299,0 | bukan_duplikat | verified | R1, R2, R3, R5, R7, R11, R13 | SETUJUI | - | pengajuan_destinasi |
| P7 | attraction | -7,9600 ; 112,9400 | 2.415,8 | tidak diberikan | verified | R1, R3, R11, R12 | REVISI | - | dokumen_mitra |
| P8 | attraction | -7,9100 ; 112,9600 | 3.695,2 | tidak diberikan | verified | R1, R3, R5, R11, R13 | SETUJUI | - | pengajuan_destinasi |
| P9 | tour_agent | -7,9190 ; 112,9500 | 2.633,9 | tidak diberikan | verified | R1, R2, R3, R6, R11, R13 | SETUJUI | - | pengajuan_destinasi |
| P10 | accommodation | -7,9400 ; 112,9520 | 299,0 | bukan_duplikat | verified | R1, R2, R3, R6, R7, R11, R13 | SETUJUI | - | pengajuan_destinasi |
| P11 | transport | -7,9435 ; 112,9535 | 124,1 | duplikat_terkonfirmasi | verified | R1, R2, R3, R6, R7, R9 | TOLAK | - | pengajuan_destinasi |
| P12 | tour_agent | -7,9190 ; 112,9500 | 2.633,9 | tidak diberikan | verified | R1, R3, R11, R12 | REVISI | - | dokumen_mitra |
| P13 | transport | -7,9190 ; 112,9500 | 2.633,9 | tidak diberikan | verified | R1, R2, R11, R12 | REVISI | - | dokumen_mitra |
| T1 | attraction | -7,938003392 ; 112,9530 | 500,0 | belum_ditinjau | verified | R1, R3, R5, R7, R8 | - | MENUNGGU_KURASI | pengajuan_destinasi |
| T2 | attraction | -7,9380024926 ; 112,9530 | 500,1 | tidak diberikan | verified | R1, R3, R5, R11, R13 | SETUJUI | - | pengajuan_destinasi |
| T3 | attraction | -7,9450 ; 112,9545 | 323,4 | perlu_bukti | verified | R1, R3, R5, R7, R10 | REVISI | - | pengajuan_destinasi |
| T4 | attraction | -7,9400 ; 112,9520 | 299,0 | bukan_duplikat | verified | R3, R7, R11, R12 | REVISI | - | dokumen_mitra |
| T5 | attraction | -7,9190 ; 112,9500 | 999.999,0 | tidak diberikan | verified | R1, R3, R5, R11, R13 | SETUJUI | - | pengajuan_destinasi |
| A1 | attraction | -7,9435 ; 112,9535 | 124,1 | duplikat_terkonfirmasi | verified | R1, R3, R5, R7, R9 | TOLAK | - | pengajuan_destinasi |
| A2 | attraction | -7,9190 ; 112,9500 | 2.633,9 | tidak diberikan | verified | R1, R3, R5, R11, R13 | SETUJUI | - | pengajuan_destinasi |
| A3 | attraction | -7,9682013568 ; 112,9000 | 200,0 | tidak diberikan | verified | R1, R3, R5, R7, R8 | - | MENUNGGU_KURASI | pengajuan_destinasi |
| A4 | attraction | -7,9190 ; 112,9500 | 2.633,9 | tidak diberikan | verified | R1, R3, R5, R11, R13 | SETUJUI | - | pengajuan_destinasi |
| V1 | attraction | -7,9190 ; 112,9500 | 2.633,9 | tidak diberikan | pending | R1, R3, R5, R11, R14 | - | MENUNGGU_VERIFIKASI_MITRA | pengajuan_destinasi |
| V2 | attraction | -7,9190 ; 112,9500 | 2.633,9 | tidak diberikan | rejected | R1, R3, R5, R11, R15 | TOLAK | - | pengajuan_destinasi |
| V3 | attraction | -7,9190 ; 112,9500 | 2.633,9 | tidak diberikan | pending | R1, R11, R12 | REVISI | - | dokumen_mitra |
| V4 | attraction | -7,9435 ; 112,9535 | 124,1 | tidak diberikan | pending | R1, R3, R5, R7, R8 | - | MENUNGGU_KURASI | pengajuan_destinasi |
| V5 | attraction | -7,9400 ; 112,9520 | 299,0 | bukan_duplikat | pending | R1, R3, R5, R7, R11, R14 | - | MENUNGGU_VERIFIKASI_MITRA | pengajuan_destinasi |
| V6 | tour_agent | -7,9190 ; 112,9500 | 2.633,9 | tidak diberikan | rejected | R1, R2, R3, R6, R11, R15 | TOLAK | - | pengajuan_destinasi |
| V7 | attraction | -7,9435 ; 112,9535 | 124,1 | duplikat_terkonfirmasi | rejected | R1, R3, R5, R7, R9 | TOLAK | - | pengajuan_destinasi |

Yang diuji:
- Batas 500 m: T1 (500,0 m, POTENTIAL_DUPLICATE) dan T2 (500,1 m, tidak memicu).
- Potensi duplikat masuk antrean tanpa penolakan: P3a, T1, A3, dan V4 (antrean didahulukan dari verifikasi mitra).
- Destinasi berbeda dalam 500 m lanjut: P6, P10, T4, dan V5.
- Duplikat terkonfirmasi hanya menolak pengajuan destinasi: P3b, P11, A1, dan V7 (alasan duplikat berlaku walau mitra rejected). A2 membuktikan pengajuan kedua mitra yang sama tetap diproses.
- Admin meminta bukti lokasi: T3.
- Pembanding jarak (KT3): A3 (pengajuan pending ikut dihitung), A4 (destinasi rejected tidak dihitung), T5 (tanpa pembanding, jarak 999999).
- Dokumen Attraction: lengkap dengan NIB dan SK tidak berlaku (P1, P8), lengkap dengan NIB dan SK berlaku (P4, P6), tidak lengkap (P2, P5, P7, T4).
- Dokumen tour_agent, accommodation, dan transport: lengkap (P9, P10) dan tidak lengkap (P12, P13).
- Verifikasi mitra sebagai syarat persetujuan: verified menghasilkan SETUJUI (P1, P4, P6, P8, P9, P10, T2, T5, A2, A4), pending ditahan MENUNGGU_VERIFIKASI_MITRA (V1, V5), rejected menghasilkan TOLAK pengajuan itu (V2, V6). Dokumen tidak lengkap didahulukan dari verifikasi (V3).
- Pemisahan rekomendasi dan status tindak lanjut: MENUNGGU_KURASI dan MENUNGGU_VERIFIKASI_MITRA hanya muncul di status_tindak_lanjut (P3a, T1, A3, V1, V4, V5) dengan rekomendasi kosong. SETUJUI, REVISI, dan TOLAK hanya muncul di rekomendasi dan status_tindak_lanjut kosong.
- Pemisahan status: semua kasus memakai akun_mitra_terdampak = tidak. SETUJUI hanya rekomendasi kurasi destinasi dan tidak memverifikasi mitra, dan TOLAK karena duplikat atau karena mitra rejected tidak mengubah `partners.is_verified` maupun `destinations.status`.

## Detail skenario

### P1: Attraction lokasi jauh, KTP dan izin pengelolaan valid, NIB dan SK Pokdarwis tidak berlaku, mitra verified

| Input | Nilai |
|---|---|
| partner_type | attraction |
| nib_diperlukan, sk_pokdarwis_diperlukan | tidak, tidak |
| Dokumen (checklist reviewer) | KTP lolos pemeriksaan; NIB tidak diunggah; bukti pengelolaan lolos pemeriksaan; SK Pokdarwis tidak diunggah |
| status_verifikasi_mitra | verified |
| Koordinat dan jarak | -7,9190 ; 112,9500 ; 2.633,9 m |
| Pembanding terdekat | D1 (approved) |
| status_antrean_kurasi | tidak diberikan |

Aturan menyala: R1, R3, R5, R11, R13

Proses inferensi:
1. R1: ktp_valid = ya
2. R3: izin_operasional_valid = ya
3. R5: dokumen_lengkap = ya
4. R11: lokasi_lolos = ya
5. R13: rekomendasi = SETUJUI
6. R13: cakupan = pengajuan_destinasi
7. R13: akun_mitra_terdampak = tidak

Hasil yang diharapkan: rekomendasi = SETUJUI, status_tindak_lanjut = tidak ada (cakupan pengajuan_destinasi)

Penjelasan: Lokasi lolos, dokumen lengkap, dan mitra berstatus verified. Ini rekomendasi kurasi destinasi, bukan verifikasi akun mitra. Admin dapat menyetujui pengajuan destinasi ini saja (destinations.status = approved). partners.is_verified hanya dibaca sebagai syarat dan tidak diubah.

### P2: Attraction lokasi jauh, izin pengelolaan tidak diunggah

| Input | Nilai |
|---|---|
| partner_type | attraction |
| nib_diperlukan, sk_pokdarwis_diperlukan | tidak, tidak |
| Dokumen (checklist reviewer) | KTP lolos pemeriksaan; NIB tidak diunggah; bukti pengelolaan tidak diunggah; SK Pokdarwis tidak diunggah |
| status_verifikasi_mitra | verified |
| Koordinat dan jarak | -7,9800 ; 112,9700 ; 4.570,8 m |
| Pembanding terdekat | D1 (approved) |
| status_antrean_kurasi | tidak diberikan |

Aturan menyala: R1, R11, R12

Proses inferensi:
1. R1: ktp_valid = ya
2. R11: lokasi_lolos = ya
3. R12: rekomendasi = REVISI
4. R12: cakupan = dokumen_mitra
5. R12: akun_mitra_terdampak = tidak

Hasil yang diharapkan: rekomendasi = REVISI, status_tindak_lanjut = tidak ada (cakupan dokumen_mitra)

Penjelasan: Lokasi lolos tetapi ada dokumen wajib yang belum valid. Dokumen dikembalikan ke mitra untuk dilengkapi. destinations.status tetap pending selama dokumen dilengkapi. partners.is_verified tidak diubah KB, nilainya ditentukan reviewer KYC secara terpisah.

### P3a: Attraction sangat dekat (124,1 m), status antrean belum diisi sehingga default belum_ditinjau

| Input | Nilai |
|---|---|
| partner_type | attraction |
| nib_diperlukan, sk_pokdarwis_diperlukan | tidak, tidak |
| Dokumen (checklist reviewer) | KTP lolos pemeriksaan; NIB tidak diunggah; bukti pengelolaan lolos pemeriksaan; SK Pokdarwis tidak diunggah |
| status_verifikasi_mitra | verified |
| Koordinat dan jarak | -7,9435 ; 112,9535 ; 124,1 m |
| Pembanding terdekat | D1 (approved) |
| status_antrean_kurasi | tidak diberikan |

Aturan menyala: R1, R3, R5, R7, R8

Proses inferensi:
1. R1: ktp_valid = ya
2. R3: izin_operasional_valid = ya
3. R5: dokumen_lengkap = ya
4. R7: status_lokasi = POTENTIAL_DUPLICATE
5. R7 default: status_antrean_kurasi = belum_ditinjau
6. R8: status_tindak_lanjut = MENUNGGU_KURASI
7. R8: cakupan = pengajuan_destinasi
8. R8: akun_mitra_terdampak = tidak

Hasil yang diharapkan: rekomendasi = tidak ada, status_tindak_lanjut = MENUNGGU_KURASI (cakupan pengajuan_destinasi)

Penjelasan: Potensi duplikat menunggu tinjauan admin. KB belum memberi rekomendasi dan pengajuan masuk antrean kurasi (status_tindak_lanjut). Pengajuan destinasi tetap pending (destinations.status). Status antrean kurasi dicatat pada data kurasi, terpisah dari tabel Sprint 1. partners.is_verified tidak diubah. Catatan: status_antrean_kurasi tidak diberikan. R7 mengisinya dengan belum_ditinjau. Pengajuan masuk antrean dan tidak ditolak.

### P3b: Titik yang sama dengan P3a, admin mengonfirmasi duplikat

| Input | Nilai |
|---|---|
| partner_type | attraction |
| nib_diperlukan, sk_pokdarwis_diperlukan | tidak, tidak |
| Dokumen (checklist reviewer) | KTP lolos pemeriksaan; NIB tidak diunggah; bukti pengelolaan lolos pemeriksaan; SK Pokdarwis tidak diunggah |
| status_verifikasi_mitra | verified |
| Koordinat dan jarak | -7,9435 ; 112,9535 ; 124,1 m |
| Pembanding terdekat | D1 (approved) |
| status_antrean_kurasi | duplikat_terkonfirmasi |

Aturan menyala: R1, R3, R5, R7, R9

Proses inferensi:
1. R1: ktp_valid = ya
2. R3: izin_operasional_valid = ya
3. R5: dokumen_lengkap = ya
4. R7: status_lokasi = POTENTIAL_DUPLICATE
5. R9: rekomendasi = TOLAK
6. R9: cakupan = pengajuan_destinasi
7. R9: akun_mitra_terdampak = tidak

Hasil yang diharapkan: rekomendasi = TOLAK, status_tindak_lanjut = tidak ada (cakupan pengajuan_destinasi)

Penjelasan: Admin mengonfirmasi destinasi sama dengan yang sudah ada. Hanya pengajuan destinasi ini yang ditolak, akun mitra tidak terdampak. Admin dapat menolak pengajuan destinasi ini saja (destinations.status = rejected). partners.is_verified tidak diubah.

### P4: Attraction lokasi jauh, NIB dan SK Pokdarwis berlaku dan keduanya valid

| Input | Nilai |
|---|---|
| partner_type | attraction |
| nib_diperlukan, sk_pokdarwis_diperlukan | ya, ya |
| Dokumen (checklist reviewer) | KTP lolos pemeriksaan; NIB lolos pemeriksaan; bukti pengelolaan lolos pemeriksaan; SK Pokdarwis lolos pemeriksaan |
| status_verifikasi_mitra | verified |
| Koordinat dan jarak | -7,9300 ; 112,9450 ; 1.645,6 m |
| Pembanding terdekat | D1 (approved) |
| status_antrean_kurasi | tidak diberikan |

Aturan menyala: R1, R2, R3, R4, R5, R11, R13

Proses inferensi:
1. R1: ktp_valid = ya
2. R2: nib_valid = ya
3. R3: izin_operasional_valid = ya
4. R4: sk_pokdarwis_valid = ya
5. R5: dokumen_lengkap = ya
6. R11: lokasi_lolos = ya
7. R13: rekomendasi = SETUJUI
8. R13: cakupan = pengajuan_destinasi
9. R13: akun_mitra_terdampak = tidak

Hasil yang diharapkan: rekomendasi = SETUJUI, status_tindak_lanjut = tidak ada (cakupan pengajuan_destinasi)

Penjelasan: Lokasi lolos, dokumen lengkap, dan mitra berstatus verified. Ini rekomendasi kurasi destinasi, bukan verifikasi akun mitra. Admin dapat menyetujui pengajuan destinasi ini saja (destinations.status = approved). partners.is_verified hanya dibaca sebagai syarat dan tidak diubah.

### P5: Attraction dikelola Pokdarwis (SK berlaku), SK Pokdarwis tidak diunggah

| Input | Nilai |
|---|---|
| partner_type | attraction |
| nib_diperlukan, sk_pokdarwis_diperlukan | tidak, ya |
| Dokumen (checklist reviewer) | KTP lolos pemeriksaan; NIB tidak diunggah; bukti pengelolaan lolos pemeriksaan; SK Pokdarwis tidak diunggah |
| status_verifikasi_mitra | verified |
| Koordinat dan jarak | -7,9300 ; 112,9450 ; 1.645,6 m |
| Pembanding terdekat | D1 (approved) |
| status_antrean_kurasi | tidak diberikan |

Aturan menyala: R1, R3, R11, R12

Proses inferensi:
1. R1: ktp_valid = ya
2. R3: izin_operasional_valid = ya
3. R11: lokasi_lolos = ya
4. R12: rekomendasi = REVISI
5. R12: cakupan = dokumen_mitra
6. R12: akun_mitra_terdampak = tidak

Hasil yang diharapkan: rekomendasi = REVISI, status_tindak_lanjut = tidak ada (cakupan dokumen_mitra)

Penjelasan: Lokasi lolos tetapi ada dokumen wajib yang belum valid. Dokumen dikembalikan ke mitra untuk dilengkapi. destinations.status tetap pending selama dokumen dilengkapi. partners.is_verified tidak diubah KB, nilainya ditentukan reviewer KYC secara terpisah.

### P6: Attraction dalam 500 m, admin menyatakan destinasi berbeda (bukan_duplikat), dokumen lengkap

| Input | Nilai |
|---|---|
| partner_type | attraction |
| nib_diperlukan, sk_pokdarwis_diperlukan | ya, tidak |
| Dokumen (checklist reviewer) | KTP lolos pemeriksaan; NIB lolos pemeriksaan; bukti pengelolaan lolos pemeriksaan; SK Pokdarwis tidak diunggah |
| status_verifikasi_mitra | verified |
| Koordinat dan jarak | -7,9400 ; 112,9520 ; 299,0 m |
| Pembanding terdekat | D1 (approved) |
| status_antrean_kurasi | bukan_duplikat |

Aturan menyala: R1, R2, R3, R5, R7, R11, R13

Proses inferensi:
1. R1: ktp_valid = ya
2. R2: nib_valid = ya
3. R3: izin_operasional_valid = ya
4. R5: dokumen_lengkap = ya
5. R7: status_lokasi = POTENTIAL_DUPLICATE
6. R11: lokasi_lolos = ya
7. R13: rekomendasi = SETUJUI
8. R13: cakupan = pengajuan_destinasi
9. R13: akun_mitra_terdampak = tidak

Hasil yang diharapkan: rekomendasi = SETUJUI, status_tindak_lanjut = tidak ada (cakupan pengajuan_destinasi)

Penjelasan: Lokasi lolos, dokumen lengkap, dan mitra berstatus verified. Ini rekomendasi kurasi destinasi, bukan verifikasi akun mitra. Admin dapat menyetujui pengajuan destinasi ini saja (destinations.status = approved). partners.is_verified hanya dibaca sebagai syarat dan tidak diubah.

### P7: Attraction dengan NIB berlaku tetapi NIB tidak lolos pemeriksaan

| Input | Nilai |
|---|---|
| partner_type | attraction |
| nib_diperlukan, sk_pokdarwis_diperlukan | ya, tidak |
| Dokumen (checklist reviewer) | KTP lolos pemeriksaan; NIB diunggah, tidak lolos; bukti pengelolaan lolos pemeriksaan; SK Pokdarwis tidak diunggah |
| status_verifikasi_mitra | verified |
| Koordinat dan jarak | -7,9600 ; 112,9400 ; 2.415,8 m |
| Pembanding terdekat | D1 (approved) |
| status_antrean_kurasi | tidak diberikan |

Aturan menyala: R1, R3, R11, R12

Proses inferensi:
1. R1: ktp_valid = ya
2. R3: izin_operasional_valid = ya
3. R11: lokasi_lolos = ya
4. R12: rekomendasi = REVISI
5. R12: cakupan = dokumen_mitra
6. R12: akun_mitra_terdampak = tidak

Hasil yang diharapkan: rekomendasi = REVISI, status_tindak_lanjut = tidak ada (cakupan dokumen_mitra)

Penjelasan: Lokasi lolos tetapi ada dokumen wajib yang belum valid. Dokumen dikembalikan ke mitra untuk dilengkapi. destinations.status tetap pending selama dokumen dilengkapi. partners.is_verified tidak diubah KB, nilainya ditentukan reviewer KYC secara terpisah.

### P8: Attraction dengan NIB tidak berlaku, NIB terunggah tetapi tidak lolos, diabaikan

| Input | Nilai |
|---|---|
| partner_type | attraction |
| nib_diperlukan, sk_pokdarwis_diperlukan | tidak, tidak |
| Dokumen (checklist reviewer) | KTP lolos pemeriksaan; NIB diunggah, tidak lolos; bukti pengelolaan lolos pemeriksaan; SK Pokdarwis tidak diunggah |
| status_verifikasi_mitra | verified |
| Koordinat dan jarak | -7,9100 ; 112,9600 ; 3.695,2 m |
| Pembanding terdekat | D1 (approved) |
| status_antrean_kurasi | tidak diberikan |

Aturan menyala: R1, R3, R5, R11, R13

Proses inferensi:
1. R1: ktp_valid = ya
2. R3: izin_operasional_valid = ya
3. R5: dokumen_lengkap = ya
4. R11: lokasi_lolos = ya
5. R13: rekomendasi = SETUJUI
6. R13: cakupan = pengajuan_destinasi
7. R13: akun_mitra_terdampak = tidak

Hasil yang diharapkan: rekomendasi = SETUJUI, status_tindak_lanjut = tidak ada (cakupan pengajuan_destinasi)

Penjelasan: Lokasi lolos, dokumen lengkap, dan mitra berstatus verified. Ini rekomendasi kurasi destinasi, bukan verifikasi akun mitra. Admin dapat menyetujui pengajuan destinasi ini saja (destinations.status = approved). partners.is_verified hanya dibaca sebagai syarat dan tidak diubah.

### P9: tour_agent lokasi jauh, KTP, NIB, dan izin usaha perjalanan wisata valid, mitra verified

| Input | Nilai |
|---|---|
| partner_type | tour_agent |
| nib_diperlukan, sk_pokdarwis_diperlukan | tidak dipakai untuk tipe ini |
| Dokumen (checklist reviewer) | KTP lolos pemeriksaan; NIB lolos pemeriksaan; izin usaha lolos pemeriksaan |
| status_verifikasi_mitra | verified |
| Koordinat dan jarak | -7,9190 ; 112,9500 ; 2.633,9 m |
| Pembanding terdekat | D1 (approved) |
| status_antrean_kurasi | tidak diberikan |

Aturan menyala: R1, R2, R3, R6, R11, R13

Proses inferensi:
1. R1: ktp_valid = ya
2. R2: nib_valid = ya
3. R3: izin_operasional_valid = ya
4. R6: dokumen_lengkap = ya
5. R11: lokasi_lolos = ya
6. R13: rekomendasi = SETUJUI
7. R13: cakupan = pengajuan_destinasi
8. R13: akun_mitra_terdampak = tidak

Hasil yang diharapkan: rekomendasi = SETUJUI, status_tindak_lanjut = tidak ada (cakupan pengajuan_destinasi)

Penjelasan: Lokasi lolos, dokumen lengkap, dan mitra berstatus verified. Ini rekomendasi kurasi destinasi, bukan verifikasi akun mitra. Admin dapat menyetujui pengajuan destinasi ini saja (destinations.status = approved). partners.is_verified hanya dibaca sebagai syarat dan tidak diubah.

### P10: accommodation dalam 500 m, admin menyatakan berbeda, KTP, NIB, dan izin usaha akomodasi valid

| Input | Nilai |
|---|---|
| partner_type | accommodation |
| nib_diperlukan, sk_pokdarwis_diperlukan | tidak dipakai untuk tipe ini |
| Dokumen (checklist reviewer) | KTP lolos pemeriksaan; NIB lolos pemeriksaan; izin usaha lolos pemeriksaan |
| status_verifikasi_mitra | verified |
| Koordinat dan jarak | -7,9400 ; 112,9520 ; 299,0 m |
| Pembanding terdekat | D1 (approved) |
| status_antrean_kurasi | bukan_duplikat |

Aturan menyala: R1, R2, R3, R6, R7, R11, R13

Proses inferensi:
1. R1: ktp_valid = ya
2. R2: nib_valid = ya
3. R3: izin_operasional_valid = ya
4. R6: dokumen_lengkap = ya
5. R7: status_lokasi = POTENTIAL_DUPLICATE
6. R11: lokasi_lolos = ya
7. R13: rekomendasi = SETUJUI
8. R13: cakupan = pengajuan_destinasi
9. R13: akun_mitra_terdampak = tidak

Hasil yang diharapkan: rekomendasi = SETUJUI, status_tindak_lanjut = tidak ada (cakupan pengajuan_destinasi)

Penjelasan: Lokasi lolos, dokumen lengkap, dan mitra berstatus verified. Ini rekomendasi kurasi destinasi, bukan verifikasi akun mitra. Admin dapat menyetujui pengajuan destinasi ini saja (destinations.status = approved). partners.is_verified hanya dibaca sebagai syarat dan tidak diubah.

### P11: transport sangat dekat, admin mengonfirmasi duplikat

| Input | Nilai |
|---|---|
| partner_type | transport |
| nib_diperlukan, sk_pokdarwis_diperlukan | tidak dipakai untuk tipe ini |
| Dokumen (checklist reviewer) | KTP lolos pemeriksaan; NIB lolos pemeriksaan; izin usaha lolos pemeriksaan |
| status_verifikasi_mitra | verified |
| Koordinat dan jarak | -7,9435 ; 112,9535 ; 124,1 m |
| Pembanding terdekat | D1 (approved) |
| status_antrean_kurasi | duplikat_terkonfirmasi |

Aturan menyala: R1, R2, R3, R6, R7, R9

Proses inferensi:
1. R1: ktp_valid = ya
2. R2: nib_valid = ya
3. R3: izin_operasional_valid = ya
4. R6: dokumen_lengkap = ya
5. R7: status_lokasi = POTENTIAL_DUPLICATE
6. R9: rekomendasi = TOLAK
7. R9: cakupan = pengajuan_destinasi
8. R9: akun_mitra_terdampak = tidak

Hasil yang diharapkan: rekomendasi = TOLAK, status_tindak_lanjut = tidak ada (cakupan pengajuan_destinasi)

Penjelasan: Admin mengonfirmasi destinasi sama dengan yang sudah ada. Hanya pengajuan destinasi ini yang ditolak, akun mitra tidak terdampak. Admin dapat menolak pengajuan destinasi ini saja (destinations.status = rejected). partners.is_verified tidak diubah.

### P12: tour_agent lokasi jauh, NIB terunggah tetapi tidak lolos pemeriksaan

| Input | Nilai |
|---|---|
| partner_type | tour_agent |
| nib_diperlukan, sk_pokdarwis_diperlukan | tidak dipakai untuk tipe ini |
| Dokumen (checklist reviewer) | KTP lolos pemeriksaan; NIB diunggah, tidak lolos; izin usaha lolos pemeriksaan |
| status_verifikasi_mitra | verified |
| Koordinat dan jarak | -7,9190 ; 112,9500 ; 2.633,9 m |
| Pembanding terdekat | D1 (approved) |
| status_antrean_kurasi | tidak diberikan |

Aturan menyala: R1, R3, R11, R12

Proses inferensi:
1. R1: ktp_valid = ya
2. R3: izin_operasional_valid = ya
3. R11: lokasi_lolos = ya
4. R12: rekomendasi = REVISI
5. R12: cakupan = dokumen_mitra
6. R12: akun_mitra_terdampak = tidak

Hasil yang diharapkan: rekomendasi = REVISI, status_tindak_lanjut = tidak ada (cakupan dokumen_mitra)

Penjelasan: Lokasi lolos tetapi ada dokumen wajib yang belum valid. Dokumen dikembalikan ke mitra untuk dilengkapi. destinations.status tetap pending selama dokumen dilengkapi. partners.is_verified tidak diubah KB, nilainya ditentukan reviewer KYC secara terpisah.

### P13: transport lokasi jauh, izin usaha angkutan wisata tidak diunggah

| Input | Nilai |
|---|---|
| partner_type | transport |
| nib_diperlukan, sk_pokdarwis_diperlukan | tidak dipakai untuk tipe ini |
| Dokumen (checklist reviewer) | KTP lolos pemeriksaan; NIB lolos pemeriksaan; izin usaha tidak diunggah |
| status_verifikasi_mitra | verified |
| Koordinat dan jarak | -7,9190 ; 112,9500 ; 2.633,9 m |
| Pembanding terdekat | D1 (approved) |
| status_antrean_kurasi | tidak diberikan |

Aturan menyala: R1, R2, R11, R12

Proses inferensi:
1. R1: ktp_valid = ya
2. R2: nib_valid = ya
3. R11: lokasi_lolos = ya
4. R12: rekomendasi = REVISI
5. R12: cakupan = dokumen_mitra
6. R12: akun_mitra_terdampak = tidak

Hasil yang diharapkan: rekomendasi = REVISI, status_tindak_lanjut = tidak ada (cakupan dokumen_mitra)

Penjelasan: Lokasi lolos tetapi ada dokumen wajib yang belum valid. Dokumen dikembalikan ke mitra untuk dilengkapi. destinations.status tetap pending selama dokumen dilengkapi. partners.is_verified tidak diubah KB, nilainya ditentukan reviewer KYC secara terpisah.

### T1: Batas tepat 500,0 m, belum ditinjau

| Input | Nilai |
|---|---|
| partner_type | attraction |
| nib_diperlukan, sk_pokdarwis_diperlukan | tidak, tidak |
| Dokumen (checklist reviewer) | KTP lolos pemeriksaan; NIB tidak diunggah; bukti pengelolaan lolos pemeriksaan; SK Pokdarwis tidak diunggah |
| status_verifikasi_mitra | verified |
| Koordinat dan jarak | -7,938003392 ; 112,9530 ; 500,0 m |
| Pembanding terdekat | D1 (approved) |
| status_antrean_kurasi | belum_ditinjau |

Aturan menyala: R1, R3, R5, R7, R8

Proses inferensi:
1. R1: ktp_valid = ya
2. R3: izin_operasional_valid = ya
3. R5: dokumen_lengkap = ya
4. R7: status_lokasi = POTENTIAL_DUPLICATE
5. R8: status_tindak_lanjut = MENUNGGU_KURASI
6. R8: cakupan = pengajuan_destinasi
7. R8: akun_mitra_terdampak = tidak

Hasil yang diharapkan: rekomendasi = tidak ada, status_tindak_lanjut = MENUNGGU_KURASI (cakupan pengajuan_destinasi)

Penjelasan: Potensi duplikat menunggu tinjauan admin. KB belum memberi rekomendasi dan pengajuan masuk antrean kurasi (status_tindak_lanjut). Pengajuan destinasi tetap pending (destinations.status). Status antrean kurasi dicatat pada data kurasi, terpisah dari tabel Sprint 1. partners.is_verified tidak diubah.

### T2: Batas 500,1 m

| Input | Nilai |
|---|---|
| partner_type | attraction |
| nib_diperlukan, sk_pokdarwis_diperlukan | tidak, tidak |
| Dokumen (checklist reviewer) | KTP lolos pemeriksaan; NIB tidak diunggah; bukti pengelolaan lolos pemeriksaan; SK Pokdarwis tidak diunggah |
| status_verifikasi_mitra | verified |
| Koordinat dan jarak | -7,9380024926 ; 112,9530 ; 500,1 m |
| Pembanding terdekat | D1 (approved) |
| status_antrean_kurasi | tidak diberikan |

Aturan menyala: R1, R3, R5, R11, R13

Proses inferensi:
1. R1: ktp_valid = ya
2. R3: izin_operasional_valid = ya
3. R5: dokumen_lengkap = ya
4. R11: lokasi_lolos = ya
5. R13: rekomendasi = SETUJUI
6. R13: cakupan = pengajuan_destinasi
7. R13: akun_mitra_terdampak = tidak

Hasil yang diharapkan: rekomendasi = SETUJUI, status_tindak_lanjut = tidak ada (cakupan pengajuan_destinasi)

Penjelasan: Lokasi lolos, dokumen lengkap, dan mitra berstatus verified. Ini rekomendasi kurasi destinasi, bukan verifikasi akun mitra. Admin dapat menyetujui pengajuan destinasi ini saja (destinations.status = approved). partners.is_verified hanya dibaca sebagai syarat dan tidak diubah.

### T3: Dalam 500 m, admin meminta bukti lokasi

| Input | Nilai |
|---|---|
| partner_type | attraction |
| nib_diperlukan, sk_pokdarwis_diperlukan | tidak, tidak |
| Dokumen (checklist reviewer) | KTP lolos pemeriksaan; NIB tidak diunggah; bukti pengelolaan lolos pemeriksaan; SK Pokdarwis tidak diunggah |
| status_verifikasi_mitra | verified |
| Koordinat dan jarak | -7,9450 ; 112,9545 ; 323,4 m |
| Pembanding terdekat | D1 (approved) |
| status_antrean_kurasi | perlu_bukti |

Aturan menyala: R1, R3, R5, R7, R10

Proses inferensi:
1. R1: ktp_valid = ya
2. R3: izin_operasional_valid = ya
3. R5: dokumen_lengkap = ya
4. R7: status_lokasi = POTENTIAL_DUPLICATE
5. R10: rekomendasi = REVISI
6. R10: cakupan = pengajuan_destinasi
7. R10: akun_mitra_terdampak = tidak

Hasil yang diharapkan: rekomendasi = REVISI, status_tindak_lanjut = tidak ada (cakupan pengajuan_destinasi)

Penjelasan: Admin meminta bukti lokasi tambahan untuk pengajuan destinasi ini. Pengajuan dikembalikan ke mitra untuk melengkapi bukti lokasi. destinations.status tetap pending. partners.is_verified tidak diubah.

### T4: Dalam 500 m, admin menyatakan berbeda, tetapi KTP tidak lolos pemeriksaan

| Input | Nilai |
|---|---|
| partner_type | attraction |
| nib_diperlukan, sk_pokdarwis_diperlukan | tidak, tidak |
| Dokumen (checklist reviewer) | KTP diunggah, tidak lolos; NIB tidak diunggah; bukti pengelolaan lolos pemeriksaan; SK Pokdarwis tidak diunggah |
| status_verifikasi_mitra | verified |
| Koordinat dan jarak | -7,9400 ; 112,9520 ; 299,0 m |
| Pembanding terdekat | D1 (approved) |
| status_antrean_kurasi | bukan_duplikat |

Aturan menyala: R3, R7, R11, R12

Proses inferensi:
1. R3: izin_operasional_valid = ya
2. R7: status_lokasi = POTENTIAL_DUPLICATE
3. R11: lokasi_lolos = ya
4. R12: rekomendasi = REVISI
5. R12: cakupan = dokumen_mitra
6. R12: akun_mitra_terdampak = tidak

Hasil yang diharapkan: rekomendasi = REVISI, status_tindak_lanjut = tidak ada (cakupan dokumen_mitra)

Penjelasan: Lokasi lolos tetapi ada dokumen wajib yang belum valid. Dokumen dikembalikan ke mitra untuk dilengkapi. destinations.status tetap pending selama dokumen dilengkapi. partners.is_verified tidak diubah KB, nilainya ditentukan reviewer KYC secara terpisah.

### T5: Belum ada destinasi pembanding, jarak_terdekat_m = 999999

| Input | Nilai |
|---|---|
| partner_type | attraction |
| nib_diperlukan, sk_pokdarwis_diperlukan | tidak, tidak |
| Dokumen (checklist reviewer) | KTP lolos pemeriksaan; NIB tidak diunggah; bukti pengelolaan lolos pemeriksaan; SK Pokdarwis tidak diunggah |
| status_verifikasi_mitra | verified |
| Koordinat dan jarak | -7,9190 ; 112,9500 ; 999.999,0 m |
| Pembanding terdekat | tidak ada pembanding |
| status_antrean_kurasi | tidak diberikan |

Aturan menyala: R1, R3, R5, R11, R13

Proses inferensi:
1. R1: ktp_valid = ya
2. R3: izin_operasional_valid = ya
3. R5: dokumen_lengkap = ya
4. R11: lokasi_lolos = ya
5. R13: rekomendasi = SETUJUI
6. R13: cakupan = pengajuan_destinasi
7. R13: akun_mitra_terdampak = tidak

Hasil yang diharapkan: rekomendasi = SETUJUI, status_tindak_lanjut = tidak ada (cakupan pengajuan_destinasi)

Penjelasan: Lokasi lolos, dokumen lengkap, dan mitra berstatus verified. Ini rekomendasi kurasi destinasi, bukan verifikasi akun mitra. Admin dapat menyetujui pengajuan destinasi ini saja (destinations.status = approved). partners.is_verified hanya dibaca sebagai syarat dan tidak diubah.

### A1: Mitra yang sama, pengajuan destinasi pertama dikonfirmasi duplikat

| Input | Nilai |
|---|---|
| partner_type | attraction |
| nib_diperlukan, sk_pokdarwis_diperlukan | tidak, tidak |
| Dokumen (checklist reviewer) | KTP lolos pemeriksaan; NIB tidak diunggah; bukti pengelolaan lolos pemeriksaan; SK Pokdarwis tidak diunggah |
| status_verifikasi_mitra | verified |
| Koordinat dan jarak | -7,9435 ; 112,9535 ; 124,1 m |
| Pembanding terdekat | D1 (approved) |
| status_antrean_kurasi | duplikat_terkonfirmasi |

Aturan menyala: R1, R3, R5, R7, R9

Proses inferensi:
1. R1: ktp_valid = ya
2. R3: izin_operasional_valid = ya
3. R5: dokumen_lengkap = ya
4. R7: status_lokasi = POTENTIAL_DUPLICATE
5. R9: rekomendasi = TOLAK
6. R9: cakupan = pengajuan_destinasi
7. R9: akun_mitra_terdampak = tidak

Hasil yang diharapkan: rekomendasi = TOLAK, status_tindak_lanjut = tidak ada (cakupan pengajuan_destinasi)

Penjelasan: Admin mengonfirmasi destinasi sama dengan yang sudah ada. Hanya pengajuan destinasi ini yang ditolak, akun mitra tidak terdampak. Admin dapat menolak pengajuan destinasi ini saja (destinations.status = rejected). partners.is_verified tidak diubah.

### A2: Mitra yang sama dengan dokumen yang sama, pengajuan destinasi kedua di lokasi jauh

| Input | Nilai |
|---|---|
| partner_type | attraction |
| nib_diperlukan, sk_pokdarwis_diperlukan | tidak, tidak |
| Dokumen (checklist reviewer) | KTP lolos pemeriksaan; NIB tidak diunggah; bukti pengelolaan lolos pemeriksaan; SK Pokdarwis tidak diunggah |
| status_verifikasi_mitra | verified |
| Koordinat dan jarak | -7,9190 ; 112,9500 ; 2.633,9 m |
| Pembanding terdekat | D1 (approved) |
| status_antrean_kurasi | tidak diberikan |

Aturan menyala: R1, R3, R5, R11, R13

Proses inferensi:
1. R1: ktp_valid = ya
2. R3: izin_operasional_valid = ya
3. R5: dokumen_lengkap = ya
4. R11: lokasi_lolos = ya
5. R13: rekomendasi = SETUJUI
6. R13: cakupan = pengajuan_destinasi
7. R13: akun_mitra_terdampak = tidak

Hasil yang diharapkan: rekomendasi = SETUJUI, status_tindak_lanjut = tidak ada (cakupan pengajuan_destinasi)

Penjelasan: Lokasi lolos, dokumen lengkap, dan mitra berstatus verified. Ini rekomendasi kurasi destinasi, bukan verifikasi akun mitra. Admin dapat menyetujui pengajuan destinasi ini saja (destinations.status = approved). partners.is_verified hanya dibaca sebagai syarat dan tidak diubah.

### A3: Mitra yang sama mengajukan lokasi 200 m dari pengajuan lain yang masih pending (pending ikut dihitung)

| Input | Nilai |
|---|---|
| partner_type | attraction |
| nib_diperlukan, sk_pokdarwis_diperlukan | tidak, tidak |
| Dokumen (checklist reviewer) | KTP lolos pemeriksaan; NIB tidak diunggah; bukti pengelolaan lolos pemeriksaan; SK Pokdarwis tidak diunggah |
| status_verifikasi_mitra | verified |
| Koordinat dan jarak | -7,9682013568 ; 112,9000 ; 200,0 m |
| Pembanding terdekat | D2 (pending) |
| status_antrean_kurasi | tidak diberikan |

Aturan menyala: R1, R3, R5, R7, R8

Proses inferensi:
1. R1: ktp_valid = ya
2. R3: izin_operasional_valid = ya
3. R5: dokumen_lengkap = ya
4. R7: status_lokasi = POTENTIAL_DUPLICATE
5. R7 default: status_antrean_kurasi = belum_ditinjau
6. R8: status_tindak_lanjut = MENUNGGU_KURASI
7. R8: cakupan = pengajuan_destinasi
8. R8: akun_mitra_terdampak = tidak

Hasil yang diharapkan: rekomendasi = tidak ada, status_tindak_lanjut = MENUNGGU_KURASI (cakupan pengajuan_destinasi)

Penjelasan: Potensi duplikat menunggu tinjauan admin. KB belum memberi rekomendasi dan pengajuan masuk antrean kurasi (status_tindak_lanjut). Pengajuan destinasi tetap pending (destinations.status). Status antrean kurasi dicatat pada data kurasi, terpisah dari tabel Sprint 1. partners.is_verified tidak diubah. Catatan: status_antrean_kurasi tidak diberikan. R7 mengisinya dengan belum_ditinjau. Pengajuan masuk antrean dan tidak ditolak.

### A4: Pengajuan tepat di titik destinasi yang pernah ditolak (rejected tidak dihitung sebagai pembanding)

| Input | Nilai |
|---|---|
| partner_type | attraction |
| nib_diperlukan, sk_pokdarwis_diperlukan | tidak, tidak |
| Dokumen (checklist reviewer) | KTP lolos pemeriksaan; NIB tidak diunggah; bukti pengelolaan lolos pemeriksaan; SK Pokdarwis tidak diunggah |
| status_verifikasi_mitra | verified |
| Koordinat dan jarak | -7,9190 ; 112,9500 ; 2.633,9 m |
| Pembanding terdekat | D1 (approved) |
| status_antrean_kurasi | tidak diberikan |

Aturan menyala: R1, R3, R5, R11, R13

Proses inferensi:
1. R1: ktp_valid = ya
2. R3: izin_operasional_valid = ya
3. R5: dokumen_lengkap = ya
4. R11: lokasi_lolos = ya
5. R13: rekomendasi = SETUJUI
6. R13: cakupan = pengajuan_destinasi
7. R13: akun_mitra_terdampak = tidak

Hasil yang diharapkan: rekomendasi = SETUJUI, status_tindak_lanjut = tidak ada (cakupan pengajuan_destinasi)

Penjelasan: Lokasi lolos, dokumen lengkap, dan mitra berstatus verified. Ini rekomendasi kurasi destinasi, bukan verifikasi akun mitra. Admin dapat menyetujui pengajuan destinasi ini saja (destinations.status = approved). partners.is_verified hanya dibaca sebagai syarat dan tidak diubah.

### V1: Attraction lokasi jauh, dokumen lengkap, mitra masih pending: pengajuan ditahan

| Input | Nilai |
|---|---|
| partner_type | attraction |
| nib_diperlukan, sk_pokdarwis_diperlukan | tidak, tidak |
| Dokumen (checklist reviewer) | KTP lolos pemeriksaan; NIB tidak diunggah; bukti pengelolaan lolos pemeriksaan; SK Pokdarwis tidak diunggah |
| status_verifikasi_mitra | pending |
| Koordinat dan jarak | -7,9190 ; 112,9500 ; 2.633,9 m |
| Pembanding terdekat | D1 (approved) |
| status_antrean_kurasi | tidak diberikan |

Aturan menyala: R1, R3, R5, R11, R14

Proses inferensi:
1. R1: ktp_valid = ya
2. R3: izin_operasional_valid = ya
3. R5: dokumen_lengkap = ya
4. R11: lokasi_lolos = ya
5. R14: status_tindak_lanjut = MENUNGGU_VERIFIKASI_MITRA
6. R14: cakupan = pengajuan_destinasi
7. R14: akun_mitra_terdampak = tidak

Hasil yang diharapkan: rekomendasi = tidak ada, status_tindak_lanjut = MENUNGGU_VERIFIKASI_MITRA (cakupan pengajuan_destinasi)

Penjelasan: Lokasi lolos dan dokumen lengkap, tetapi mitra masih berstatus pending. Pengajuan ditahan sampai reviewer KYC memutuskan verifikasi mitra. KB belum memberi rekomendasi. Pengajuan destinasi tetap pending (destinations.status) sampai reviewer KYC memutuskan verifikasi mitra. partners.is_verified hanya dibaca dan tidak diubah.

### V2: Attraction lokasi jauh, dokumen lengkap, mitra rejected

| Input | Nilai |
|---|---|
| partner_type | attraction |
| nib_diperlukan, sk_pokdarwis_diperlukan | tidak, tidak |
| Dokumen (checklist reviewer) | KTP lolos pemeriksaan; NIB tidak diunggah; bukti pengelolaan lolos pemeriksaan; SK Pokdarwis tidak diunggah |
| status_verifikasi_mitra | rejected |
| Koordinat dan jarak | -7,9190 ; 112,9500 ; 2.633,9 m |
| Pembanding terdekat | D1 (approved) |
| status_antrean_kurasi | tidak diberikan |

Aturan menyala: R1, R3, R5, R11, R15

Proses inferensi:
1. R1: ktp_valid = ya
2. R3: izin_operasional_valid = ya
3. R5: dokumen_lengkap = ya
4. R11: lokasi_lolos = ya
5. R15: rekomendasi = TOLAK
6. R15: cakupan = pengajuan_destinasi
7. R15: akun_mitra_terdampak = tidak

Hasil yang diharapkan: rekomendasi = TOLAK, status_tindak_lanjut = tidak ada (cakupan pengajuan_destinasi)

Penjelasan: Lokasi lolos dan dokumen lengkap, tetapi verifikasi KYC mitra berstatus rejected. Pengajuan destinasi ini tidak dapat disetujui. Admin dapat menolak pengajuan destinasi ini saja (destinations.status = rejected). partners.is_verified hanya dibaca dan tidak diubah.

### V3: Attraction lokasi jauh, izin pengelolaan tidak diunggah, mitra pending: dokumen didahulukan

| Input | Nilai |
|---|---|
| partner_type | attraction |
| nib_diperlukan, sk_pokdarwis_diperlukan | tidak, tidak |
| Dokumen (checklist reviewer) | KTP lolos pemeriksaan; NIB tidak diunggah; bukti pengelolaan tidak diunggah; SK Pokdarwis tidak diunggah |
| status_verifikasi_mitra | pending |
| Koordinat dan jarak | -7,9190 ; 112,9500 ; 2.633,9 m |
| Pembanding terdekat | D1 (approved) |
| status_antrean_kurasi | tidak diberikan |

Aturan menyala: R1, R11, R12

Proses inferensi:
1. R1: ktp_valid = ya
2. R11: lokasi_lolos = ya
3. R12: rekomendasi = REVISI
4. R12: cakupan = dokumen_mitra
5. R12: akun_mitra_terdampak = tidak

Hasil yang diharapkan: rekomendasi = REVISI, status_tindak_lanjut = tidak ada (cakupan dokumen_mitra)

Penjelasan: Lokasi lolos tetapi ada dokumen wajib yang belum valid. Dokumen dikembalikan ke mitra untuk dilengkapi. destinations.status tetap pending selama dokumen dilengkapi. partners.is_verified tidak diubah KB, nilainya ditentukan reviewer KYC secara terpisah.

### V4: Attraction dalam 500 m belum ditinjau, mitra pending: antrean kurasi didahulukan

| Input | Nilai |
|---|---|
| partner_type | attraction |
| nib_diperlukan, sk_pokdarwis_diperlukan | tidak, tidak |
| Dokumen (checklist reviewer) | KTP lolos pemeriksaan; NIB tidak diunggah; bukti pengelolaan lolos pemeriksaan; SK Pokdarwis tidak diunggah |
| status_verifikasi_mitra | pending |
| Koordinat dan jarak | -7,9435 ; 112,9535 ; 124,1 m |
| Pembanding terdekat | D1 (approved) |
| status_antrean_kurasi | tidak diberikan |

Aturan menyala: R1, R3, R5, R7, R8

Proses inferensi:
1. R1: ktp_valid = ya
2. R3: izin_operasional_valid = ya
3. R5: dokumen_lengkap = ya
4. R7: status_lokasi = POTENTIAL_DUPLICATE
5. R7 default: status_antrean_kurasi = belum_ditinjau
6. R8: status_tindak_lanjut = MENUNGGU_KURASI
7. R8: cakupan = pengajuan_destinasi
8. R8: akun_mitra_terdampak = tidak

Hasil yang diharapkan: rekomendasi = tidak ada, status_tindak_lanjut = MENUNGGU_KURASI (cakupan pengajuan_destinasi)

Penjelasan: Potensi duplikat menunggu tinjauan admin. KB belum memberi rekomendasi dan pengajuan masuk antrean kurasi (status_tindak_lanjut). Pengajuan destinasi tetap pending (destinations.status). Status antrean kurasi dicatat pada data kurasi, terpisah dari tabel Sprint 1. partners.is_verified tidak diubah. Catatan: status_antrean_kurasi tidak diberikan. R7 mengisinya dengan belum_ditinjau. Pengajuan masuk antrean dan tidak ditolak.

### V5: Attraction dalam 500 m, admin menyatakan berbeda, dokumen lengkap, mitra pending

| Input | Nilai |
|---|---|
| partner_type | attraction |
| nib_diperlukan, sk_pokdarwis_diperlukan | tidak, tidak |
| Dokumen (checklist reviewer) | KTP lolos pemeriksaan; NIB tidak diunggah; bukti pengelolaan lolos pemeriksaan; SK Pokdarwis tidak diunggah |
| status_verifikasi_mitra | pending |
| Koordinat dan jarak | -7,9400 ; 112,9520 ; 299,0 m |
| Pembanding terdekat | D1 (approved) |
| status_antrean_kurasi | bukan_duplikat |

Aturan menyala: R1, R3, R5, R7, R11, R14

Proses inferensi:
1. R1: ktp_valid = ya
2. R3: izin_operasional_valid = ya
3. R5: dokumen_lengkap = ya
4. R7: status_lokasi = POTENTIAL_DUPLICATE
5. R11: lokasi_lolos = ya
6. R14: status_tindak_lanjut = MENUNGGU_VERIFIKASI_MITRA
7. R14: cakupan = pengajuan_destinasi
8. R14: akun_mitra_terdampak = tidak

Hasil yang diharapkan: rekomendasi = tidak ada, status_tindak_lanjut = MENUNGGU_VERIFIKASI_MITRA (cakupan pengajuan_destinasi)

Penjelasan: Lokasi lolos dan dokumen lengkap, tetapi mitra masih berstatus pending. Pengajuan ditahan sampai reviewer KYC memutuskan verifikasi mitra. KB belum memberi rekomendasi. Pengajuan destinasi tetap pending (destinations.status) sampai reviewer KYC memutuskan verifikasi mitra. partners.is_verified hanya dibaca dan tidak diubah.

### V6: tour_agent lokasi jauh, dokumen lengkap, mitra rejected

| Input | Nilai |
|---|---|
| partner_type | tour_agent |
| nib_diperlukan, sk_pokdarwis_diperlukan | tidak dipakai untuk tipe ini |
| Dokumen (checklist reviewer) | KTP lolos pemeriksaan; NIB lolos pemeriksaan; izin usaha lolos pemeriksaan |
| status_verifikasi_mitra | rejected |
| Koordinat dan jarak | -7,9190 ; 112,9500 ; 2.633,9 m |
| Pembanding terdekat | D1 (approved) |
| status_antrean_kurasi | tidak diberikan |

Aturan menyala: R1, R2, R3, R6, R11, R15

Proses inferensi:
1. R1: ktp_valid = ya
2. R2: nib_valid = ya
3. R3: izin_operasional_valid = ya
4. R6: dokumen_lengkap = ya
5. R11: lokasi_lolos = ya
6. R15: rekomendasi = TOLAK
7. R15: cakupan = pengajuan_destinasi
8. R15: akun_mitra_terdampak = tidak

Hasil yang diharapkan: rekomendasi = TOLAK, status_tindak_lanjut = tidak ada (cakupan pengajuan_destinasi)

Penjelasan: Lokasi lolos dan dokumen lengkap, tetapi verifikasi KYC mitra berstatus rejected. Pengajuan destinasi ini tidak dapat disetujui. Admin dapat menolak pengajuan destinasi ini saja (destinations.status = rejected). partners.is_verified hanya dibaca dan tidak diubah.

### V7: Attraction dalam 500 m, duplikat terkonfirmasi, mitra rejected: alasan duplikat (R9) yang berlaku

| Input | Nilai |
|---|---|
| partner_type | attraction |
| nib_diperlukan, sk_pokdarwis_diperlukan | tidak, tidak |
| Dokumen (checklist reviewer) | KTP lolos pemeriksaan; NIB tidak diunggah; bukti pengelolaan lolos pemeriksaan; SK Pokdarwis tidak diunggah |
| status_verifikasi_mitra | rejected |
| Koordinat dan jarak | -7,9435 ; 112,9535 ; 124,1 m |
| Pembanding terdekat | D1 (approved) |
| status_antrean_kurasi | duplikat_terkonfirmasi |

Aturan menyala: R1, R3, R5, R7, R9

Proses inferensi:
1. R1: ktp_valid = ya
2. R3: izin_operasional_valid = ya
3. R5: dokumen_lengkap = ya
4. R7: status_lokasi = POTENTIAL_DUPLICATE
5. R9: rekomendasi = TOLAK
6. R9: cakupan = pengajuan_destinasi
7. R9: akun_mitra_terdampak = tidak

Hasil yang diharapkan: rekomendasi = TOLAK, status_tindak_lanjut = tidak ada (cakupan pengajuan_destinasi)

Penjelasan: Admin mengonfirmasi destinasi sama dengan yang sudah ada. Hanya pengajuan destinasi ini yang ditolak, akun mitra tidak terdampak. Admin dapat menolak pengajuan destinasi ini saja (destinations.status = rejected). partners.is_verified tidak diubah.

## Skenario status verifikasi mitra

Ketentuan KT5 menjadikan `partners.is_verified` syarat persetujuan. Tabel berikut merangkum perilaku KB untuk lokasi lolos dan dokumen lengkap.

| partners.is_verified | Hasil KB | Aturan | Skenario |
|---|---|---|---|
| verified | rekomendasi SETUJUI | R13 | P1, P4, P6, P8, P9, P10, T2, T5, A2, A4 |
| pending | status_tindak_lanjut MENUNGGU_VERIFIKASI_MITRA | R14 | V1, V5 |
| rejected | rekomendasi TOLAK (pengajuan itu saja) | R15 | V2, V6 |

KB hanya membaca nilai itu. Engine memeriksa bahwa nilai partners.is_verified pada working memory sama dengan masukan setelah inferensi, sehingga verifikasi mitra tetap keputusan reviewer KYC dan kurasi destinasi tetap keputusan admin kurator.

## Matriks cakupan aturan

| Aturan | Diuji oleh |
|---|---|
| R1 | P1, P2, P3a, P3b, P4, P5, P6, P7, P8, P9, P10, P11, P12, P13, T1, T2, T3, T5, A1, A2, A3, A4, V1, V2, V3, V4, V5, V6, V7 |
| R2 | P4, P6, P9, P10, P11, P13, V6 |
| R3 | P1, P3a, P3b, P4, P5, P6, P7, P8, P9, P10, P11, P12, T1, T2, T3, T4, T5, A1, A2, A3, A4, V1, V2, V4, V5, V6, V7 |
| R4 | P4 |
| R5 | P1, P3a, P3b, P4, P6, P8, T1, T2, T3, T5, A1, A2, A3, A4, V1, V2, V4, V5, V7 |
| R6 | P9, P10, P11, V6 |
| R7 | P3a, P3b, P6, P10, P11, T1, T3, T4, A1, A3, V4, V5, V7 |
| R8 | P3a, T1, A3, V4 |
| R9 | P3b, P11, A1, V7 |
| R10 | T3 |
| R11 | P1, P2, P4, P5, P6, P7, P8, P9, P10, P12, P13, T2, T4, T5, A2, A4, V1, V2, V3, V5, V6 |
| R12 | P2, P5, P7, P12, P13, T4, V3 |
| R13 | P1, P4, P6, P8, P9, P10, T2, T5, A2, A4 |
| R14 | V1, V5 |
| R15 | V2, V6 |

Semua 15 aturan teruji. Setiap kasus dicek bahwa tepat satu aturan akhir yang menyala, bahwa R5 dan R6 tidak menyala bersamaan, dan bahwa akun_mitra_terdampak = tidak. Beberapa kasus juga dicek aturan mana yang wajib dan yang tidak boleh menyala (misalnya V1, V2, V3, V4, V7).

## Uji menyeluruh

Selain skenario di atas, engine dibandingkan dengan perhitungan pembanding terpisah untuk 11907 kombinasi (4 partner_type, 81 kombinasi status dokumen [tidak diunggah, diunggah tidak lolos, lolos] untuk empat dokumen, 3 status verifikasi mitra, 4 kombinasi penerapan NIB dan SK [khusus Attraction], 7 keadaan lokasi dan antrean). Semuanya cocok. Properti yang dijaga di setiap kombinasi: SETUJUI hanya untuk mitra verified dengan lokasi lolos dan dokumen lengkap; mitra pending ditahan lewat MENUNGGU_VERIFIKASI_MITRA; potensi duplikat tidak langsung diputuskan; TOLAK hanya setelah duplikat_terkonfirmasi atau jika mitra rejected; status verifikasi mitra dan masukan tidak pernah diubah.

## Uji tambahan

engine_test.py juga menguji: struktur keluaran (rekomendasi dan status_tindak_lanjut terpisah, status tindak lanjut tidak pernah menjadi rekomendasi, tepat satu field terisi); pembanding jarak (approved dan pending dihitung, rejected tidak, tanpa pembanding = 999999); ketentuan operasional KT1, KT2, KT4, dan KT5; masukan tidak valid (partner_type tidak dikenal, jarak hilang, berupa teks atau negatif, status antrean tidak dikenal, status_verifikasi_mitra hilang atau tidak dikenal, penerapan NIB dan SK Attraction hilang atau di luar ya dan tidak) ditolak dengan ValueError; checklist KTP dan izin yang hilang tidak pernah menghasilkan SETUJUI; Haversine dibandingkan dengan pendekatan ekuirektangular independen; dan urutan evaluasi aturan (penghasil fakta selalu sebelum pembacanya).

## Cara menjalankan ulang

Letakkan 03-rules.json, engine_test.py, dan file markdown di satu folder lalu jalankan: python3 engine_test.py
