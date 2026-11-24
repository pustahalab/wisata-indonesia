# 01 Tabel Aturan: KB Kelayakan Mitra dan Anti-Duplikasi Lokasi

Squad 2 Sprint 2, Issue #7 Anti-Duplikasi Haversine 500 m dan Antrean Kurasi Admin, P11 Milestone M1.

Keluaran KB punya dua field yang dipisah:

- `rekomendasi`: SETUJUI, REVISI, atau TOLAK. Saran KB bagi admin. Kosong jika KB belum memberi saran.
- `status_tindak_lanjut`: MENUNGGU_KURASI, dipakai saat tinjau manual admin diperlukan. Ini status antrean, bukan rekomendasi dan bukan keputusan.

Setiap aturan akhir mengisi tepat satu dari kedua field itu. Keduanya bukan status database. Admin tetap pengambil keputusan akhir (KB adalah sistem pendukung keputusan).

Dua keputusan tim belum terjawab dan tetap NEEDS_CONFIRMATION di seluruh dokumen: N4 (apakah semua partner_type boleh mengajukan destinasi) dan N9 (apakah mitra harus verified sebelum destinasinya boleh disetujui). KB tidak menetapkan jawaban atas keduanya. Skenario yang bergantung pada salah satunya adalah contoh bersyarat, bukan syarat bisnis terkonfirmasi (lihat bagian Asumsi bersyarat).

Dua keputusan database dipisah. Verifikasi KYC mitra (`partners.is_verified`) adalah keputusan reviewer atas dokumen mitra. Kurasi destinasi (`destinations.status`) adalah keputusan admin kurator atas satu pengajuan destinasi. KB tidak mengubah keduanya, dan persetujuan atau penolakan destinasi tidak otomatis memverifikasi atau menolak akun mitra.

Penerapan NIB dan SK Pokdarwis wajib berupa keputusan eksplisit `ya` atau `tidak`. Nilai yang tidak ada atau NEEDS_CONFIRMATION tidak pernah dianggap tidak berlaku atau opsional, dan KB tidak menyimpulkan dokumen lengkap selama keputusan itu belum ada.

## Label

| Label | Arti |
|---|---|
| CONFIRMED | Didukung dokumen Sprint 1, P11, Issue #7, atau keputusan tim yang dikonfirmasi |
| PROPOSED | Usulan teknis dari Sprint 2, belum dikonfirmasi |
| NEEDS_CONFIRMATION | Informasi belum ada dan harus dikonfirmasi |
| NOT_DEFINED_IN_SPRINT_1 | Tidak ditemukan di dokumen atau SQL Sprint 1 |

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

## Dasar dari Sprint 1

Kategori mitra memakai `partner_type` Sprint 1: attraction, tour_agent, accommodation, transport. Field partners yang dipakai: id, user_id, business_name, partner_type, legal_doc_url, bank_account_info, is_verified (pending, verified, rejected), created_at. Tidak ada field baru yang ditambahkan.

Implementasi dan dokumentasi tidak sama. Tabel berikut membedakannya.

| Tabel | Di schema.sql | Di ERD dan README | Di schema.md |
|---|---|---|---|
| partners | ya | ya | ya |
| destination_tickets | ya | ya | ya |
| users | tidak | ya | hanya disebut sebagai referensi FK |
| destinations | tidak | ya (coordinates POINT, status) | hanya disebut sebagai referensi FK |

Jadi duplikasi lokasi memakai destinations.coordinates yang baru didokumentasikan di ERD, bukan tabel yang sudah ada di SQL.

### Dokumen KYC menurut wireflow

Wireflow menulis bahwa dokumen disesuaikan dengan jenis usaha yang dipilih, tetapi hanya halaman Attraction yang digambar.

| Dokumen Attraction di wireflow | Penanda di wireflow | Dipakai KB sebagai | Aturan |
|---|---|---|---|
| KTP penanggung jawab | tanpa tanda "jika" | wajib | R1, R5 |
| NIB | (jika berlaku) | wajib jika nib_diperlukan = ya, dilewati hanya jika nib_diperlukan = tidak, belum terkonfirmasi untuk nilai lain | R2, R5, R6 |
| Bukti Hak Pengelolaan / Izin Objek Wisata | tanpa tanda "jika" | wajib | R3, R5 |
| SK Pokdarwis | (jika berlaku), "Jika dikelola Kelompok Sadar Wisata" | wajib jika sk_pokdarwis_diperlukan = ya, dilewati hanya jika sk_pokdarwis_diperlukan = tidak, belum terkonfirmasi untuk nilai lain | R4, R5, R6 |

| partner_type | Syarat dokumen | Label | Perilaku KB |
|---|---|---|---|
| attraction | Empat dokumen di atas. NIB dan SK hanya dinilai setelah penerapannya diputuskan eksplisit | CONFIRMED untuk dokumennya, NEEDS_CONFIRMATION untuk penerapan NIB dan SK | R5 menilai kelengkapan jika penerapan eksplisit, R6 dan R14 jika belum |
| tour_agent | Tidak ada di Sprint 1 | NEEDS_CONFIRMATION | R6 dan R14, tidak ada keputusan otomatis |
| accommodation | Tidak ada di Sprint 1 | NEEDS_CONFIRMATION | R6 dan R14, tidak ada keputusan otomatis |
| transport | Tidak ada di Sprint 1 | NEEDS_CONFIRMATION | R6 dan R14, tidak ada keputusan otomatis |

Syarat Attraction tidak dipakai untuk tipe lain. Dokumen yang kurang tidak pernah menghasilkan TOLAK.

### Keputusan penerapan NIB dan SK Pokdarwis

Wireflow hanya menulis "(jika berlaku)". Siapa yang memutuskan dan kapan itu dicatat belum ada di Sprint 1 (N2). Karena itu KB tidak boleh menebak. Fakta nib_diperlukan dan sk_pokdarwis_diperlukan punya tiga nilai.

| Nilai | Arti | Perilaku KB |
|---|---|---|
| ya | Berlaku, keputusan eksplisit | Dokumen wajib. R5 meminta dokumen valid (R2 atau R4) |
| tidak | Tidak berlaku, keputusan eksplisit | Dokumen dilewati. Hasil pemeriksaannya diabaikan (P8) |
| NEEDS_CONFIRMATION, tidak ada, boolean, atau nilai lain | Belum diputuskan | Tidak dianggap tidak berlaku dan tidak dianggap wajib. R6 menandai NEEDS_CONFIRMATION, R5 tidak menyala, KB berakhir di R14 (status_tindak_lanjut = MENUNGGU_KURASI, tanpa rekomendasi) setelah lokasi lolos |

Akibatnya SETUJUI (R12) dan REVISI dokumen (R13) hanya muncul jika kedua keputusan sudah eksplisit. Dokumen yang sudah diunggah dan lolos tidak menggantikan keputusan penerapan (K3). Nilai boolean bentuk lama (true atau false) juga belum terkonfirmasi, karena false lama berarti "tidak diisi" sekaligus "tidak berlaku" (K8). Jika penerapan belum terkonfirmasi dan dokumen lain juga bermasalah (K9), KB tetap memberi status_tindak_lanjut MENUNGGU_KURASI, tidak REVISI (PROPOSED, supaya admin memutuskan satu kali).

### Dari mana fakta dokumen berasal

Sprint 1 hanya menyimpan `legal_doc_url` (satu kolom TEXT, boleh NULL). Kolom itu tidak memisahkan KTP, NIB, dan SK. Di halaman reviewer wireflow, dokumen tampil satu per satu dengan tombol "Lihat file". Karena itu fakta seperti ktp_diunggah dan ktp_lolos_periksa diisi reviewer sebagai checklist saat memeriksa dokumen. Penyimpanan checklist ini NOT_DEFINED_IN_SPRINT_1. Fakta nib_diperlukan dan sk_pokdarwis_diperlukan menerjemahkan penanda "jika berlaku" di wireflow sebagai keputusan eksplisit ya atau tidak. Siapa yang menentukannya dan di mana disimpan NEEDS_CONFIRMATION (N2, N6).

## Status database dan rekomendasi KB

| Konsep | Nilai | Kedudukan |
|---|---|---|
| Status verifikasi mitra | pending, verified, rejected (partners.is_verified) | Sprint 1, ada di SQL |
| Status destinasi | pending, approved, rejected (destinations.status) | Hanya di ERD dan README |
| Status review duplikat (status_antrean_kurasi) | belum_ditinjau, bukan_duplikat, duplikat_terkonfirmasi, perlu_bukti | Input KB dari admin, NOT_DEFINED_IN_SPRINT_1 |
| Flag lokasi | POTENTIAL_DUPLICATE | Hanya ada di working memory KB, NOT_DEFINED_IN_SPRINT_1 |
| Rekomendasi KB (rekomendasi) | SETUJUI, REVISI, TOLAK | Output KB, bukan field database |
| Status tindak lanjut KB (status_tindak_lanjut) | MENUNGGU_KURASI | Output KB untuk antrean atau tinjau manual, bukan rekomendasi dan bukan field database |

Semuanya tidak dipertukarkan. Rekomendasi KB hanya saran bagi admin. MENUNGGU_KURASI tidak pernah menjadi nilai rekomendasi.

### Dua keputusan database yang terpisah

| Keputusan | Field | Nilai | Pemutus | Ada di | Diubah oleh KB |
|---|---|---|---|---|---|
| Verifikasi KYC mitra | partners.is_verified | pending, verified, rejected | Reviewer KYC (VERIFIED atau REJECTED di wireflow) | schema.sql dan schema.md | tidak |
| Kurasi destinasi | destinations.status | pending, approved, rejected | Admin kurator | Hanya ERD dan README | tidak |

Aturan pemisahan: SETUJUI atau TOLAK atas satu pengajuan destinasi tidak mengubah partners.is_verified, dan keputusan reviewer atas mitra tidak mengubah destinations.status. Setiap keluaran akhir (rekomendasi atau status_tindak_lanjut) membawa akun_mitra_terdampak = tidak, artinya partners.is_verified tidak diubah oleh rekomendasi itu. dokumen_lengkap dari R1 sampai R5 hanya prasyarat bagi R12 (checklist reviewer), bukan pengganti status verifikasi mitra. Apakah mitra harus berstatus verified lebih dulu sebelum destinasinya boleh disetujui belum ditentukan di Sprint 1 (N9). Hubungan users.kyc_status tetap N8.

Catatan pemetaan ke database untuk setiap aturan akhir:

| Aturan | Rekomendasi | Status tindak lanjut | Cakupan | Catatan database |
|---|---|---|---|---|
| R8 | tidak ada | MENUNGGU_KURASI | pengajuan_destinasi | Pengajuan destinasi tetap pending (destinations.status, hanya di ERD). Flag POTENTIAL_DUPLICATE dan status antrean tidak punya field di Sprint 1 (NOT_DEFINED_IN_SPRINT_1). partners.is_verified tidak diubah |
| R9 | TOLAK | tidak ada | pengajuan_destinasi | Admin dapat menolak pengajuan destinasi ini saja (destinations.status = rejected, hanya di ERD). partners.is_verified tidak diubah |
| R10 | REVISI | tidak ada | pengajuan_destinasi | Pengajuan dikembalikan ke mitra. REVISI tidak ada di Sprint 1 (NOT_DEFINED_IN_SPRINT_1). destinations.status tetap pending (PROPOSED). partners.is_verified tidak diubah |
| R12 | SETUJUI | tidak ada | pengajuan_destinasi | Admin dapat menyetujui pengajuan destinasi ini saja (destinations.status = approved, hanya di ERD). partners.is_verified tidak diubah: verifikasi KYC mitra (pending, verified, rejected) adalah keputusan reviewer yang terpisah. Belum diputuskan apakah mitra harus verified lebih dulu (N9), KB tidak membaca partners.is_verified |
| R13 | REVISI | tidak ada | dokumen_mitra | Dokumen dikembalikan ke mitra. Reviewer di wireflow hanya punya VERIFIED dan REJECTED (NOT_DEFINED_IN_SPRINT_1). partners.is_verified tidak diubah KB, nilainya ditentukan reviewer KYC secara terpisah (PROPOSED) |
| R14 | tidak ada | MENUNGGU_KURASI | dokumen_mitra | Tidak ada persetujuan atau penolakan otomatis karena syarat dokumen atau penerapan NIB dan SK belum terkonfirmasi. partners.is_verified tidak diubah |

## Unit keputusan

| Tingkat | Yang dinilai | Aturan |
|---|---|---|
| Dokumen akun mitra (KYC) | partner_type dan dokumen | R1 sampai R6 |
| Pengajuan destinasi | Jarak lokasi, antrean kurasi, hasil | R7 sampai R14 |

TOLAK hanya berlaku untuk satu pengajuan destinasi. partners.is_verified dan destinasi lain milik mitra yang sama tidak terdampak. R13 dan R14 berbicara tentang dokumen mitra (cakupan dokumen_mitra) tetapi tetap hanya rekomendasi: KB menahan pengajuan destinasi tanpa menyetujui dan tanpa mengubah partners.is_verified. business_name tidak dipakai dan kemiripan nama bukan syarat penolakan.

## Fakta masukan

| Fakta | Tipe | Nilai | Asal | Label |
|---|---|---|---|---|
| partner_type | teks | attraction / tour_agent / accommodation / transport | partners.partner_type | CONFIRMED |
| nib_diperlukan | teks | ya / tidak / NEEDS_CONFIRMATION | NIB (jika berlaku) di wireflow. Hanya ya atau tidak yang dianggap keputusan. Tidak ada atau NEEDS_CONFIRMATION berarti belum terkonfirmasi. Siapa yang memutuskan belum jelas (N2) | NEEDS_CONFIRMATION |
| sk_pokdarwis_diperlukan | teks | ya / tidak / NEEDS_CONFIRMATION | SK Pokdarwis (jika berlaku) di wireflow, yaitu jika dikelola Kelompok Sadar Wisata. Hanya ya atau tidak yang dianggap keputusan. Siapa yang memutuskan belum jelas (N2) | NEEDS_CONFIRMATION |
| ktp_diunggah | boolean |  | checklist reviewer | PROPOSED |
| ktp_lolos_periksa | boolean |  | checklist reviewer | PROPOSED |
| nib_diunggah | boolean |  | checklist reviewer | PROPOSED |
| nib_lolos_periksa | boolean |  | checklist reviewer | PROPOSED |
| izin_pengelolaan_diunggah | boolean |  | checklist reviewer | PROPOSED |
| izin_pengelolaan_lolos_periksa | boolean |  | checklist reviewer | PROPOSED |
| sk_pokdarwis_diunggah | boolean |  | checklist reviewer | PROPOSED |
| sk_pokdarwis_lolos_periksa | boolean |  | checklist reviewer | PROPOSED |
| jarak_terdekat_m | angka |  | Haversine dari destinations.coordinates (didokumentasikan di ERD, belum ada di SQL) | CONFIRMED |
| status_antrean_kurasi | teks | belum_ditinjau / bukan_duplikat / duplikat_terkonfirmasi / perlu_bukti | diisi admin kurator. Tidak ada field di Sprint 1 | NOT_DEFINED_IN_SPRINT_1 |

Fakta turunan: ktp_valid, nib_valid, izin_pengelolaan_valid, sk_pokdarwis_valid, dokumen_lengkap, syarat_dokumen_status, status_lokasi, lokasi_lolos, rekomendasi, status_tindak_lanjut, cakupan, akun_mitra_terdampak (tidak = partners.is_verified tidak diubah oleh rekomendasi).

## Aturan IF-THEN (14 aturan)

| ID | IF | THEN | Jenis | Sumber | Label |
|---|---|---|---|---|---|
| R1 | ktp_diunggah DAN ktp_lolos_periksa | ktp_valid = ya | Antara | S4 | CONFIRMED |
| R2 | nib_diunggah DAN nib_lolos_periksa | nib_valid = ya | Antara | S4 | CONFIRMED |
| R3 | izin_pengelolaan_diunggah DAN izin_pengelolaan_lolos_periksa | izin_pengelolaan_valid = ya | Antara | S4 | CONFIRMED |
| R4 | sk_pokdarwis_diunggah DAN sk_pokdarwis_lolos_periksa | sk_pokdarwis_valid = ya | Antara | S4 | CONFIRMED |
| R5 | partner_type = attraction DAN ktp_valid DAN izin_pengelolaan_valid DAN (nib_diperlukan = tidak ATAU (nib_diperlukan = ya DAN nib_valid)) DAN (sk_pokdarwis_diperlukan = tidak ATAU (sk_pokdarwis_diperlukan = ya DAN sk_pokdarwis_valid)) | dokumen_lengkap = ya | Antara | S1, S2, S4 | CONFIRMED |
| R6 | partner_type salah satu dari (tour_agent, accommodation, transport) ATAU (partner_type = attraction DAN (nib_diperlukan bukan salah satu dari (ya, tidak) ATAU sk_pokdarwis_diperlukan bukan salah satu dari (ya, tidak))) | syarat_dokumen_status = NEEDS_CONFIRMATION | Antara | S4, S6 | NEEDS_CONFIRMATION |
| R7 | jarak_terdekat_m <= 500 | status_lokasi = POTENTIAL_DUPLICATE; status_antrean_kurasi = belum_ditinjau jika belum diisi admin | Antara | S3, S5 | CONFIRMED |
| R8 | status_lokasi = POTENTIAL_DUPLICATE DAN status_antrean_kurasi = belum_ditinjau | status_tindak_lanjut = MENUNGGU_KURASI; cakupan = pengajuan_destinasi; akun_mitra_terdampak = tidak | Akhir | S1, S3 | CONFIRMED |
| R9 | status_lokasi = POTENTIAL_DUPLICATE DAN status_antrean_kurasi = duplikat_terkonfirmasi | rekomendasi = TOLAK; cakupan = pengajuan_destinasi; akun_mitra_terdampak = tidak | Akhir | S1, S3, S5, S8 | CONFIRMED |
| R10 | status_lokasi = POTENTIAL_DUPLICATE DAN status_antrean_kurasi = perlu_bukti | rekomendasi = REVISI; cakupan = pengajuan_destinasi; akun_mitra_terdampak = tidak | Akhir | S3 | PROPOSED |
| R11 | jarak_terdekat_m > 500 ATAU (status_lokasi = POTENTIAL_DUPLICATE DAN status_antrean_kurasi = bukan_duplikat) | lokasi_lolos = ya | Antara | S3 | CONFIRMED |
| R12 | lokasi_lolos DAN dokumen_lengkap | rekomendasi = SETUJUI; cakupan = pengajuan_destinasi; akun_mitra_terdampak = tidak | Akhir | S1, S2 | CONFIRMED |
| R13 | lokasi_lolos DAN partner_type = attraction DAN dokumen_lengkap bukan ya DAN syarat_dokumen_status bukan NEEDS_CONFIRMATION | rekomendasi = REVISI; cakupan = dokumen_mitra; akun_mitra_terdampak = tidak | Akhir | S1, S2, S4 | PROPOSED |
| R14 | lokasi_lolos DAN syarat_dokumen_status = NEEDS_CONFIRMATION | status_tindak_lanjut = MENUNGGU_KURASI; cakupan = dokumen_mitra; akun_mitra_terdampak = tidak | Akhir | S4, S6 | PROPOSED |

Catatan:
- Jarak 500 m atau kurang hanya menandai POTENTIAL_DUPLICATE (R7) dan masuk antrean (R8). Tidak ada penolakan otomatis karena jarak.
- bukan_duplikat berarti admin menilai destinasi berbeda. Tanda dilepas dan pengajuan lanjut (R11).
- R10 dan R13 memakai REVISI yang NOT_DEFINED_IN_SPRINT_1, karena reviewer di wireflow hanya punya VERIFIED dan REJECTED.
- R6 dan R14 adalah pengaman. Selama syarat dokumen tipe mitra NEEDS_CONFIRMATION, atau penerapan NIB dan SK Pokdarwis pada Attraction belum diputuskan eksplisit, KB hanya menyerahkan ke admin. Keadaan itu tidak pernah dibaca sebagai "tidak berlaku".
- R5 hanya memakai pembanding eq pada penerapan NIB dan SK (tidak, atau ya dan valid). Tidak ada jalur "bukan ya" yang meloloskan nilai kosong atau NEEDS_CONFIRMATION.
- R13 mengecualikan syarat_dokumen_status = NEEDS_CONFIRMATION, sehingga R13 dan R14 tidak pernah menyala bersamaan. R6 harus ber-ID lebih kecil dari R13 (diperiksa engine_test.py).
- R8 dan R14 hanya mengisi status_tindak_lanjut, sedangkan R9, R10, R12, dan R13 hanya mengisi rekomendasi. Tidak ada aturan yang memberi nilai MENUNGGU_KURASI pada field rekomendasi.
- R12 hanya merekomendasikan kurasi destinasi dan bergantung pada N9 (lihat Asumsi bersyarat). Tidak ada aturan yang menulis partners.is_verified atau destinations.status. Semua aturan akhir membawa akun_mitra_terdampak = tidak.

## Hasil KB dan cakupannya

| Field | Hasil | Penyebab (aturan) | Cakupan | Arti |
|---|---|---|---|---|
| rekomendasi | SETUJUI | Lokasi lolos dan dokumen Attraction lengkap, penerapan NIB dan SK sudah eksplisit (R12) | pengajuan_destinasi | Admin dapat menyetujui destinasi itu. Verifikasi mitra tetap keputusan terpisah |
| rekomendasi | REVISI | Dokumen Attraction belum valid, penerapan NIB dan SK sudah eksplisit (R13) | dokumen_mitra | Mitra melengkapi dokumen |
| rekomendasi | REVISI | Admin meminta bukti lokasi (R10) | pengajuan_destinasi | Mitra memperbaiki pengajuan itu |
| rekomendasi | TOLAK | Admin mengonfirmasi duplikat (R9) | pengajuan_destinasi | Hanya pengajuan itu, akun mitra tidak terdampak |
| status_tindak_lanjut | MENUNGGU_KURASI | Potensi duplikat belum ditinjau (R8) | pengajuan_destinasi | Status antrean. KB belum memberi rekomendasi |
| status_tindak_lanjut | MENUNGGU_KURASI | Syarat dokumen tipe mitra belum ditentukan, atau penerapan NIB dan SK Pokdarwis Attraction belum diputuskan eksplisit (R6 lalu R14) | dokumen_mitra | Status tinjau manual. KB belum memberi rekomendasi. Admin memeriksa dan memastikan keputusan penerapan |

## Struktur keluaran KB

| Field | Nilai | Diisi oleh | Keterangan |
|---|---|---|---|
| rekomendasi | SETUJUI, REVISI, TOLAK, atau kosong | R9 (TOLAK), R10 (REVISI), R12 (SETUJUI), R13 (REVISI) | Saran KB bagi admin |
| status_tindak_lanjut | MENUNGGU_KURASI atau kosong | R8, R14 | Antrean atau tinjau manual. Bukan rekomendasi |
| cakupan | pengajuan_destinasi, dokumen_mitra | Semua aturan akhir | Yang dinilai |
| akun_mitra_terdampak | tidak | Semua aturan akhir | partners.is_verified tidak diubah |

Invarian: tepat satu dari rekomendasi atau status_tindak_lanjut terisi pada setiap hasil. Engine memeriksanya pada setiap kasus uji dan pada seluruh uji menyeluruh.

## Asumsi bersyarat (N4 dan N9)

Dua pertanyaan tim belum terjawab. KB tidak menjawabnya dan tidak menerapkan salah satu jawaban sebagai aturan bisnis.

| Butir | Label | Pertanyaan | Yang dilakukan KB | Skenario terdampak |
|---|---|---|---|---|
| N4 | NEEDS_CONFIRMATION | Apakah semua partner_type boleh mengajukan destinasi | KB tetap memproses pengajuan dari keempat partner_type supaya logikanya dapat diuji. Itu bukan keputusan bahwa semuanya boleh mengajukan. Aturan R6 dan R14 bergantung pada N4 | Contoh bersyarat: skenario dengan tour_agent, accommodation, atau transport (P9, P10, P11) |
| N9 | NEEDS_CONFIRMATION | Apakah mitra harus berstatus verified sebelum destinasinya boleh disetujui | KB tidak membaca partners.is_verified, jadi hasilnya sama untuk pending, verified, dan rejected. Itu bukan jawaban bahwa verified tidak diperlukan. Aturan R12 bergantung pada N9 | Contoh bersyarat: semua skenario dengan hasil rekomendasi SETUJUI (P1, P4, P6, P8, T2, A2) |

Jika tim menjawab N4 atau N9, aturan dan skenario di atas harus ditinjau ulang sebelum menjadi syarat bisnis. Engine mencetak catatan asumsi bersyarat pada penjelasan setiap kasus yang terdampak.

## Certainty Factor

CF biner. Setiap aturan punya cf = 1.0 dan kesimpulan yang muncul punya CF 1.0. Tidak ada penggabungan nilai CF karena fakta dan aturan bersifat pasti (menyala atau tidak).

## Rumus Haversine

d = 2 x R x arcsin( akar( sin kuadrat(Δφ/2) + cos φ1 x cos φ2 x sin kuadrat(Δλ/2) ) )

R = 6.371.000 m. φ adalah lintang dan λ adalah bujur dalam radian. Hasil dibulatkan 1 desimal. Jarak tepat 500,0 m termasuk POTENTIAL_DUPLICATE. Nilai jarak_terdekat_m = 999999 dipakai jika belum ada destinasi pembanding (PROPOSED).

## Perbedaan dokumentasi Sprint 1 (dicatat, tidak diubah)

| Item | schema.md | schema.sql |
|---|---|---|
| id | UUID gen_random_uuid() | CHAR(36) tanpa default |
| bank_account_info | JSONB | JSON |
| created_at | TIMESTAMPZ | TIMESTAMP |
| price | NUMERIC(12,2) | DECIMAL(12,2) |
| daily_quota | INTEGER | INT |

Perbedaan lain: relasi partners ke tiket ditulis 1:M di schema.md dan 1:N di README. README menyebut empat tabel tetapi schema.sql hanya membuat dua. schema.sql punya FK ke users dan destinations yang tidak dibuat di file itu. File ERD_NusantaraGo.drawio tidak ada di ZIP. users.kyc_status ada di ERD, dan hubungannya dengan partners.is_verified tidak dijelaskan.

## Belum terjawab

| No | Label | Hal |
|---|---|---|
| N1 | NEEDS_CONFIRMATION | Dokumen wajib untuk tour_agent, accommodation, dan transport |
| N2 | NEEDS_CONFIRMATION | Siapa yang menentukan dan kapan keputusan berlaku atau tidaknya NIB dan SK Pokdarwis dicatat (deklarasi mitra atau reviewer). Sampai terjawab, nilai yang belum diputuskan harus NEEDS_CONFIRMATION dan KB tidak menyimpulkan dokumen lengkap |
| N3 | NEEDS_CONFIRMATION | Destinasi pembanding jarak: hanya approved atau termasuk pending |
| N4 | NEEDS_CONFIRMATION | Apakah semua partner_type boleh mengajukan destinasi. KB tidak menetapkan jawaban, skenario tour_agent, accommodation, dan transport adalah contoh bersyarat |
| N5 | NOT_DEFINED_IN_SPRINT_1 | Status REVISI. Reviewer di wireflow hanya punya VERIFIED dan REJECTED |
| N6 | NOT_DEFINED_IN_SPRINT_1 | Penyimpanan checklist dokumen, keputusan penerapan NIB dan SK, flag POTENTIAL_DUPLICATE, dan status antrean kurasi |
| N7 | NOT_DEFINED_IN_SPRINT_1 | Tabel destinations di schema.sql dan alur pengajuan destinasi di wireflow |
| N8 | NOT_DEFINED_IN_SPRINT_1 | Hubungan users.kyc_status dengan partners.is_verified |
| N9 | NEEDS_CONFIRMATION | Urutan antara verifikasi KYC mitra (partners.is_verified) dan kurasi destinasi: apakah mitra harus verified sebelum destinasinya boleh disetujui, atau admin memutuskan keduanya terpisah. KB tidak menetapkan jawaban: KB hanya memakai dokumen_lengkap sebagai prasyarat, tidak membaca dan tidak mengubah partners.is_verified. Skenario SETUJUI adalah contoh bersyarat |
