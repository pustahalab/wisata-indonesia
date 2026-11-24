# 01 Tabel Aturan: KB Kelayakan Mitra dan Anti-Duplikasi Lokasi

Squad 2 Sprint 2, Issue #7 Anti-Duplikasi Haversine 500 m dan Antrean Kurasi Admin, P11 Milestone M1.

KB ini melanjutkan Sprint 1 (registrasi mitra, verifikasi KYC, dan tabel destinasi). Sprint 1 menghasilkan mitra dengan `partner_type` dan `is_verified`, serta destinasi dengan `coordinates` dan `status`. Sprint 2 menambahkan kurasi pengajuan destinasi: pemeriksaan jarak Haversine 500 m untuk mencegah duplikat, antrean tinjauan admin, dan rekomendasi bagi admin kurator.

Keluaran KB punya dua field yang dipisah:

- `rekomendasi`: SETUJUI, REVISI, atau TOLAK. Saran KB bagi admin.
- `status_tindak_lanjut`: MENUNGGU_KURASI atau MENUNGGU_VERIFIKASI_MITRA. Status antrean atau penahanan saat pengajuan perlu tinjauan admin atau menunggu keputusan reviewer KYC. Ini bukan rekomendasi dan bukan keputusan.

Setiap aturan akhir mengisi tepat satu dari kedua field itu. Keduanya bukan status database. Admin tetap pengambil keputusan akhir (KB adalah sistem pendukung keputusan).

Tiga status dijaga terpisah:

- Verifikasi KYC mitra (`partners.is_verified`) adalah keputusan reviewer atas dokumen mitra. KB hanya membacanya sebagai syarat persetujuan dan tidak pernah mengubahnya.
- Kurasi destinasi (`destinations.status`) adalah keputusan admin kurator atas satu pengajuan destinasi. KB hanya memberi rekomendasi dan tidak mengubahnya.
- Antrean kurasi (`status_antrean_kurasi`) adalah hasil tinjauan admin atas potensi duplikat. KB membacanya dan tidak mengubahnya.

Persetujuan atau penolakan satu destinasi tidak otomatis memverifikasi atau menolak akun mitra.

## Sumber

| Kode | Sumber |
|---|---|
| S1 | P11 Pertemuan 11 DSS.SIP117 (tabel tugas Squad 2), dennyjcs.com/dss/pertemuan-11.html |
| S2 | Brief Proyek Capstone SIP117, dennyjcs.com/dss/project.html |
| S3 | GitHub Issue #7, pustahalab/wisata-indonesia |
| S4 | Sprint 1: partner-registration-wireflow/wireflow.png (dokumen Attraction, halaman reviewer VERIFIED/REJECTED) |
| S5 | Sprint 1: mitra-destination_tickets-database/erd/README.md dan erd-nusantarago-mitra-tiket.png (tabel destinations, coordinates POINT, status) |
| S6 | Sprint 1: schema.sql dan mitra-destination_tickets-schema.md (partners, partner_type, legal_doc_url, is_verified) |
| S7 | Diskusi tim Squad 2: syarat dokumen berbeda per kategori mitra |
| S8 | Diskusi tim Squad 2: duplikat terkonfirmasi hanya menolak pengajuan destinasi, bukan akun mitra |
| S9 | Ketentuan operasional kurasi Sprint 2 (KT1 sampai KT9), disusun Squad 2 untuk melengkapi Issue #7 di atas dasar Sprint 1 |

## Dasar dari Sprint 1

Kategori mitra memakai `partner_type` Sprint 1: attraction, tour_agent, accommodation, transport. Field `partners` yang dipakai: id, user_id, business_name, partner_type, legal_doc_url, bank_account_info, is_verified (pending, verified, rejected), created_at. Tidak ada kolom baru yang ditambahkan pada tabel Sprint 1.

| Tabel | Dasar | Dipakai KB untuk |
|---|---|---|
| partners | schema.sql, schema.md, ERD | partner_type, is_verified (dibaca sebagai syarat) |
| destinations | ERD dan README | coordinates (POINT) untuk jarak Haversine, status (pending, approved, rejected) sebagai pembanding jarak |
| destination_tickets | schema.sql, schema.md, ERD | tidak dipakai Issue #7 |

Wireflow Sprint 1 menampilkan dokumen Attraction (KTP penanggung jawab, NIB, Bukti Hak Pengelolaan atau Izin Objek Wisata, SK Pokdarwis) dan halaman reviewer dengan keputusan VERIFIED atau REJECTED. Wireflow menyatakan persyaratan dokumen mengikuti jenis mitra. Ketentuan operasional di bawah melengkapi syarat dokumen untuk tiga jenis mitra lainnya.

## Ketentuan operasional

Ketentuan berikut melengkapi Issue #7 dan menjadi dasar aturan R1 sampai R15.

| ID | Ketentuan | Isi |
|---|---|---|
| KT1 | Syarat dokumen per tipe mitra | Attraction: KTP penanggung jawab dan Bukti Hak Pengelolaan atau Izin Objek Wisata selalu wajib. NIB wajib jika ditetapkan berlaku, SK Pokdarwis wajib jika ditetapkan berlaku (dikelola Kelompok Sadar Wisata). tour_agent, accommodation, dan transport: KTP penanggung jawab, NIB, dan izin usaha sesuai kategori (perjalanan wisata, akomodasi, angkutan wisata) selalu wajib |
| KT2 | Penerapan NIB dan SK Pokdarwis pada Attraction | Mitra menyatakan penerapannya pada formulir dokumen KYC, lalu reviewer menetapkan nilai akhir ya atau tidak pada checklist. Nilai itu wajib terisi sebelum KB dijalankan. Dokumen yang ditetapkan tidak berlaku diabaikan, dokumen yang ditetapkan berlaku wajib valid |
| KT3 | Destinasi pembanding jarak | Jarak dihitung ke destinasi berstatus approved atau pending, tidak termasuk yang rejected dan tidak termasuk pengajuan itu sendiri. Jika belum ada pembanding, jarak_terdekat_m diisi 999999 |
| KT4 | Tipe mitra yang boleh mengajukan destinasi | Keempat partner_type (attraction, tour_agent, accommodation, transport) boleh mengajukan destinasi. Perbedaannya hanya pada syarat dokumen (KT1) |
| KT5 | Verifikasi mitra sebagai syarat persetujuan | Pengajuan destinasi hanya direkomendasikan SETUJUI jika partners.is_verified = verified. Jika pending, pengajuan ditahan dengan status_tindak_lanjut MENUNGGU_VERIFIKASI_MITRA. Jika rejected, pengajuan direkomendasikan TOLAK. KB hanya membaca partners.is_verified dan tidak pernah mengubahnya |
| KT6 | Arti REVISI | REVISI berarti pengajuan atau dokumen dikembalikan ke mitra untuk diperbaiki dan destinations.status tetap pending. Keputusan KYC atas akun mitra tetap VERIFIED atau REJECTED oleh reviewer, dan REVISI tidak mengubahnya |
| KT7 | Pencatatan data kurasi | Checklist dokumen, penetapan penerapan NIB dan SK, tanda POTENTIAL_DUPLICATE, dan status antrean kurasi dicatat sebagai data kurasi yang terpisah dari tabel partners dan destinations Sprint 1. Kolom tabel Sprint 1 tidak berubah |
| KT8 | Sumber status verifikasi mitra | KB memakai partners.is_verified sebagai satu-satunya status verifikasi mitra. users.kyc_status tidak dibaca KB |
| KT9 | Urutan penilaian | KB menilai lokasi lebih dulu (R7 sampai R11), lalu kelengkapan dokumen (R12), lalu verifikasi mitra (R13 sampai R15). Satu pengajuan menghasilkan tepat satu keluaran akhir |

### Dokumen KYC per tipe mitra

| partner_type | Dokumen yang selalu wajib | Dokumen wajib jika berlaku | Aturan |
|---|---|---|---|
| attraction | KTP penanggung jawab; Bukti Hak Pengelolaan atau Izin Objek Wisata | NIB jika nib_diperlukan = ya; SK Pokdarwis jika sk_pokdarwis_diperlukan = ya (dikelola Kelompok Sadar Wisata) | R1 sampai R5 |
| tour_agent | KTP penanggung jawab; NIB; izin usaha perjalanan wisata | tidak ada | R1 sampai R3, R6 |
| accommodation | KTP penanggung jawab; NIB; izin usaha penyediaan akomodasi | tidak ada | R1 sampai R3, R6 |
| transport | KTP penanggung jawab; NIB; izin usaha angkutan wisata | tidak ada | R1 sampai R3, R6 |

Dokumen yang ditetapkan tidak berlaku diabaikan, termasuk hasil pemeriksaannya. Dokumen yang wajib tetapi belum diunggah atau tidak lolos pemeriksaan menghasilkan REVISI dokumen, tidak pernah TOLAK.

### Asal fakta dokumen

Rincian per dokumen dicatat reviewer sebagai checklist saat memeriksa dokumen mitra (halaman reviewer wireflow menampilkan dokumen satu per satu dengan tombol "Lihat file"). Penerapan NIB dan SK Pokdarwis pada Attraction ditetapkan reviewer pada checklist yang sama berdasarkan pernyataan mitra di formulir dokumen KYC (KT2). Nilainya wajib `ya` atau `tidak` sebelum KB dijalankan, dan engine menolak masukan Attraction yang tidak memenuhinya. Seluruh data kurasi ini dicatat terpisah dari tabel Sprint 1 (KT7).

## Status database dan rekomendasi KB

| Konsep | Nilai | Kedudukan |
|---|---|---|
| Status verifikasi mitra | pending, verified, rejected (`partners.is_verified`) | Keputusan reviewer KYC. Dibaca KB, tidak diubah |
| Status destinasi | pending, approved, rejected (`destinations.status`) | Keputusan admin kurator. Tidak diubah KB |
| Status antrean kurasi (`status_antrean_kurasi`) | belum_ditinjau, bukan_duplikat, duplikat_terkonfirmasi, perlu_bukti | Masukan KB dari admin kurator |
| Flag lokasi | POTENTIAL_DUPLICATE | Dicatat di working memory KB oleh R7 |
| Rekomendasi KB (`rekomendasi`) | SETUJUI, REVISI, TOLAK | Keluaran KB, bukan field database |
| Status tindak lanjut KB (`status_tindak_lanjut`) | MENUNGGU_KURASI, MENUNGGU_VERIFIKASI_MITRA | Keluaran KB untuk antrean atau penahanan, bukan rekomendasi dan bukan field database |

Semuanya tidak dipertukarkan. Rekomendasi KB hanya saran bagi admin, dan status tindak lanjut tidak pernah menjadi nilai rekomendasi.

### Tiga status yang terpisah

| Status | Field | Nilai | Pemutus | Dibaca KB | Diubah KB |
|---|---|---|---|---|---|
| Verifikasi KYC mitra | partners.is_verified | pending, verified, rejected | Reviewer KYC (VERIFIED atau REJECTED di wireflow) | ya, sebagai syarat R13 sampai R15 | tidak |
| Kurasi destinasi | destinations.status | pending, approved, rejected | Admin kurator | tidak | tidak |
| Antrean kurasi | status_antrean_kurasi | belum_ditinjau, bukan_duplikat, duplikat_terkonfirmasi, perlu_bukti | Admin kurator | ya, oleh R7 sampai R11 | tidak |

Aturan pemisahan: SETUJUI atau TOLAK atas satu pengajuan destinasi tidak mengubah `partners.is_verified`, dan keputusan reviewer atas mitra tidak mengubah `destinations.status`. Setiap keluaran akhir membawa akun_mitra_terdampak = tidak, artinya `partners.is_verified` tidak diubah oleh keluaran itu. `dokumen_lengkap` dari R5 dan R6 adalah prasyarat checklist bagi R13 dan tidak menggantikan verifikasi mitra. Mitra harus berstatus verified agar pengajuan destinasinya direkomendasikan SETUJUI (KT5).

Pemetaan ke database untuk setiap aturan akhir:

| Aturan | Rekomendasi | Status tindak lanjut | Cakupan | Catatan database |
|---|---|---|---|---|
| R8 | tidak ada | MENUNGGU_KURASI | pengajuan_destinasi | Pengajuan destinasi tetap pending (destinations.status). Status antrean kurasi dicatat pada data kurasi, terpisah dari tabel Sprint 1. partners.is_verified tidak diubah |
| R9 | TOLAK | tidak ada | pengajuan_destinasi | Admin dapat menolak pengajuan destinasi ini saja (destinations.status = rejected). partners.is_verified tidak diubah |
| R10 | REVISI | tidak ada | pengajuan_destinasi | Pengajuan dikembalikan ke mitra untuk melengkapi bukti lokasi. destinations.status tetap pending. partners.is_verified tidak diubah |
| R12 | REVISI | tidak ada | dokumen_mitra | destinations.status tetap pending selama dokumen dilengkapi. partners.is_verified tidak diubah KB, nilainya ditentukan reviewer KYC secara terpisah |
| R13 | SETUJUI | tidak ada | pengajuan_destinasi | Admin dapat menyetujui pengajuan destinasi ini saja (destinations.status = approved). partners.is_verified hanya dibaca sebagai syarat dan tidak diubah |
| R14 | tidak ada | MENUNGGU_VERIFIKASI_MITRA | pengajuan_destinasi | Pengajuan destinasi tetap pending (destinations.status) sampai reviewer KYC memutuskan verifikasi mitra. partners.is_verified hanya dibaca dan tidak diubah |
| R15 | TOLAK | tidak ada | pengajuan_destinasi | Admin dapat menolak pengajuan destinasi ini saja (destinations.status = rejected). partners.is_verified hanya dibaca dan tidak diubah |

## Unit keputusan

| Tingkat | Yang dinilai | Aturan |
|---|---|---|
| Dokumen akun mitra (KYC) | partner_type dan dokumen | R1 sampai R6 |
| Pengajuan destinasi | Jarak lokasi, antrean kurasi, dokumen, status verifikasi mitra, hasil | R7 sampai R15 |

TOLAK dan SETUJUI hanya berlaku untuk satu pengajuan destinasi. `partners.is_verified` dan destinasi lain milik mitra yang sama tidak berubah karenanya. R12 berbicara tentang dokumen mitra (cakupan dokumen_mitra) tetapi tetap hanya rekomendasi: dokumen dikembalikan ke mitra tanpa mengubah `partners.is_verified`. business_name tidak dipakai dan kemiripan nama bukan syarat penolakan.

## Fakta masukan

| Fakta | Tipe | Nilai | Asal |
|---|---|---|---|
| partner_type | teks | attraction / tour_agent / accommodation / transport | partners.partner_type |
| status_verifikasi_mitra | teks | pending / verified / rejected | partners.is_verified, hanya dibaca |
| nib_diperlukan | teks | ya / tidak | checklist reviewer (KT2). Wajib terisi untuk Attraction |
| sk_pokdarwis_diperlukan | teks | ya / tidak | checklist reviewer (KT2). Wajib terisi untuk Attraction |
| ktp_diunggah | boolean | | checklist reviewer |
| ktp_lolos_periksa | boolean | | checklist reviewer |
| nib_diunggah | boolean | | checklist reviewer |
| nib_lolos_periksa | boolean | | checklist reviewer |
| izin_operasional_diunggah | boolean | | checklist reviewer (Attraction: bukti hak pengelolaan atau izin objek wisata, tipe lain: izin usaha) |
| izin_operasional_lolos_periksa | boolean | | checklist reviewer |
| sk_pokdarwis_diunggah | boolean | | checklist reviewer |
| sk_pokdarwis_lolos_periksa | boolean | | checklist reviewer |
| jarak_terdekat_m | angka | | Haversine dari destinations.coordinates ke destinasi approved atau pending (KT3). Diisi 999999 jika belum ada pembanding |
| status_antrean_kurasi | teks | belum_ditinjau / bukan_duplikat / duplikat_terkonfirmasi / perlu_bukti | diisi admin kurator |

Fakta turunan: ktp_valid, nib_valid, izin_operasional_valid, sk_pokdarwis_valid, dokumen_lengkap, status_lokasi, lokasi_lolos, rekomendasi, status_tindak_lanjut, cakupan, akun_mitra_terdampak (tidak = partners.is_verified tidak diubah oleh keluaran KB).

## Aturan IF-THEN (15 aturan)

| ID | IF | THEN | Jenis | Sumber |
|---|---|---|---|---|
| R1 | ktp_diunggah DAN ktp_lolos_periksa | ktp_valid = ya | Antara | S4 |
| R2 | nib_diunggah DAN nib_lolos_periksa | nib_valid = ya | Antara | S4 |
| R3 | izin_operasional_diunggah DAN izin_operasional_lolos_periksa | izin_operasional_valid = ya | Antara | S4, S9 |
| R4 | sk_pokdarwis_diunggah DAN sk_pokdarwis_lolos_periksa | sk_pokdarwis_valid = ya | Antara | S4 |
| R5 | partner_type = attraction DAN ktp_valid DAN izin_operasional_valid DAN (nib_diperlukan = tidak ATAU (nib_diperlukan = ya DAN nib_valid)) DAN (sk_pokdarwis_diperlukan = tidak ATAU (sk_pokdarwis_diperlukan = ya DAN sk_pokdarwis_valid)) | dokumen_lengkap = ya | Antara | S1, S2, S4 |
| R6 | partner_type salah satu dari (tour_agent, accommodation, transport) DAN ktp_valid DAN nib_valid DAN izin_operasional_valid | dokumen_lengkap = ya | Antara | S7, S9 |
| R7 | jarak_terdekat_m <= 500 | status_lokasi = POTENTIAL_DUPLICATE; status_antrean_kurasi = belum_ditinjau jika belum diisi admin | Antara | S3, S5 |
| R8 | status_lokasi = POTENTIAL_DUPLICATE DAN status_antrean_kurasi = belum_ditinjau | status_tindak_lanjut = MENUNGGU_KURASI; cakupan = pengajuan_destinasi; akun_mitra_terdampak = tidak | Akhir | S1, S3 |
| R9 | status_lokasi = POTENTIAL_DUPLICATE DAN status_antrean_kurasi = duplikat_terkonfirmasi | rekomendasi = TOLAK; cakupan = pengajuan_destinasi; akun_mitra_terdampak = tidak | Akhir | S1, S3, S5, S8 |
| R10 | status_lokasi = POTENTIAL_DUPLICATE DAN status_antrean_kurasi = perlu_bukti | rekomendasi = REVISI; cakupan = pengajuan_destinasi; akun_mitra_terdampak = tidak | Akhir | S3, S9 |
| R11 | jarak_terdekat_m > 500 ATAU (status_lokasi = POTENTIAL_DUPLICATE DAN status_antrean_kurasi = bukan_duplikat) | lokasi_lolos = ya | Antara | S3 |
| R12 | lokasi_lolos DAN dokumen_lengkap bukan ya | rekomendasi = REVISI; cakupan = dokumen_mitra; akun_mitra_terdampak = tidak | Akhir | S1, S2, S4, S9 |
| R13 | lokasi_lolos DAN dokumen_lengkap DAN status_verifikasi_mitra = verified | rekomendasi = SETUJUI; cakupan = pengajuan_destinasi; akun_mitra_terdampak = tidak | Akhir | S1, S2, S9 |
| R14 | lokasi_lolos DAN dokumen_lengkap DAN status_verifikasi_mitra = pending | status_tindak_lanjut = MENUNGGU_VERIFIKASI_MITRA; cakupan = pengajuan_destinasi; akun_mitra_terdampak = tidak | Akhir | S4, S6, S9 |
| R15 | lokasi_lolos DAN dokumen_lengkap DAN status_verifikasi_mitra = rejected | rekomendasi = TOLAK; cakupan = pengajuan_destinasi; akun_mitra_terdampak = tidak | Akhir | S4, S6, S9 |

Catatan:
- Jarak 500 m atau kurang hanya menandai POTENTIAL_DUPLICATE (R7) dan memasukkan pengajuan ke antrean (R8). Tidak ada penolakan otomatis karena jarak.
- bukan_duplikat berarti admin menilai destinasi berbeda. Tanda dilepas dan pengajuan lanjut ke pemeriksaan dokumen (R11).
- Penilaian berurutan: lokasi (R7 sampai R11), dokumen (R12), lalu verifikasi mitra (R13 sampai R15). Pengajuan yang masih dalam antrean duplikat belum dinilai dokumen dan verifikasinya, dan pengajuan dengan dokumen tidak lengkap dikembalikan lebih dulu sebelum status verifikasi mitra diperiksa.
- R5 dan R6 saling lepas karena R5 hanya untuk attraction dan R6 hanya untuk tour_agent, accommodation, dan transport. R5 hanya memakai pembanding eq pada penerapan NIB dan SK (tidak, atau ya dan valid).
- R12 membaca dokumen_lengkap dengan operator ne, sehingga R5 dan R6 harus ber-ID lebih kecil (diperiksa engine_test.py).
- R13, R14, dan R15 saling lepas menurut nilai partners.is_verified (verified, pending, rejected). Ketiganya hanya membaca nilai itu dan tidak menulisnya.
- R8 dan R14 hanya mengisi status_tindak_lanjut, sedangkan R9, R10, R12, R13, dan R15 hanya mengisi rekomendasi. Tidak ada aturan yang memberi nilai status tindak lanjut pada field rekomendasi.
- Tidak ada aturan yang menulis partners.is_verified atau destinations.status. Semua aturan akhir membawa akun_mitra_terdampak = tidak.

## Hasil KB dan cakupannya

| Field | Hasil | Penyebab (aturan) | Cakupan | Arti |
|---|---|---|---|---|
| rekomendasi | SETUJUI | Lokasi lolos, dokumen lengkap, mitra verified (R13) | pengajuan_destinasi | Admin dapat menyetujui destinasi itu. Verifikasi mitra tetap keputusan terpisah |
| rekomendasi | REVISI | Dokumen wajib belum lengkap atau belum lolos (R12) | dokumen_mitra | Mitra melengkapi dokumen |
| rekomendasi | REVISI | Admin meminta bukti lokasi (R10) | pengajuan_destinasi | Mitra memperbaiki pengajuan itu |
| rekomendasi | TOLAK | Admin mengonfirmasi duplikat (R9) | pengajuan_destinasi | Hanya pengajuan itu, akun mitra tidak terdampak |
| rekomendasi | TOLAK | Mitra berstatus rejected pada verifikasi KYC (R15) | pengajuan_destinasi | Hanya pengajuan itu. Status mitra tidak diubah KB |
| status_tindak_lanjut | MENUNGGU_KURASI | Potensi duplikat menunggu tinjauan admin (R8) | pengajuan_destinasi | Status antrean. KB belum memberi rekomendasi |
| status_tindak_lanjut | MENUNGGU_VERIFIKASI_MITRA | Lokasi lolos dan dokumen lengkap, mitra masih pending (R14) | pengajuan_destinasi | Penahanan sampai reviewer KYC memutuskan. KB belum memberi rekomendasi |

## Struktur keluaran KB

| Field | Nilai | Diisi oleh | Keterangan |
|---|---|---|---|
| rekomendasi | SETUJUI, REVISI, TOLAK, atau kosong | R9 (TOLAK), R10 (REVISI), R12 (REVISI), R13 (SETUJUI), R15 (TOLAK) | Saran KB bagi admin |
| status_tindak_lanjut | MENUNGGU_KURASI, MENUNGGU_VERIFIKASI_MITRA, atau kosong | R8, R14 | Antrean atau penahanan. Bukan rekomendasi |
| cakupan | pengajuan_destinasi, dokumen_mitra | Semua aturan akhir | Yang dinilai |
| akun_mitra_terdampak | tidak | Semua aturan akhir | partners.is_verified tidak diubah |

Invarian: tepat satu dari rekomendasi atau status_tindak_lanjut terisi pada setiap hasil. Engine memeriksanya pada setiap kasus uji dan pada seluruh uji menyeluruh.

## Certainty Factor

CF biner. Setiap aturan punya cf = 1.0 dan kesimpulan yang muncul punya CF 1.0. Tidak ada penggabungan nilai CF karena fakta dan aturan bersifat pasti (menyala atau tidak).

## Rumus Haversine

d = 2 x R x arcsin( akar( sin kuadrat(Δφ/2) + cos φ1 x cos φ2 x sin kuadrat(Δλ/2) ) )

R = 6.371.000 m. φ adalah lintang dan λ adalah bujur dalam radian. Hasil dibulatkan 1 desimal. Jarak tepat 500,0 m termasuk POTENTIAL_DUPLICATE dan 500,1 m tidak. Jarak diukur ke destinasi pembanding berstatus approved atau pending, tidak termasuk yang rejected dan pengajuan itu sendiri (KT3). Nilai jarak_terdekat_m = 999999 dipakai jika belum ada destinasi pembanding.
