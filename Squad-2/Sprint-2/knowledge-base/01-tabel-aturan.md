# 01 Tabel Aturan: KB Kelayakan Mitra (Squad 2)

Status: draf. Bagian bertanda USULAN atau PERLU KONFIRMASI belum menjadi aturan resmi NusantaraGo.

Issue: #7 Algoritma Anti-Duplikasi Lokasi (Haversine 500m) dan Antrean Kurasi Admin
Pengguna keputusan: Admin Kurator
Hasil kurasi: SETUJUI, REVISI, atau TOLAK. MENUNGGU_KURASI hanya status antrean, bukan keputusan.

## Dasar penentuan aturan

| Kode | Dasar | Isi yang dipakai | Status |
|---|---|---|---|
| S1 | Pertemuan 11 | KB kelayakan mitra memuat aturan kelengkapan KTP, NIB, SK, jarak Haversine 500 m, dan status antrean kurasi menuju setujui, revisi, atau tolak | Dibaca langsung |
| S2 | Brief proyek capstone | Hasil layak, revisi, atau tolak dari dokumen KYC dan dokumen legalitas. Keputusan akhir tetap di manusia | Dibaca langsung |
| S3 | Issue #7 | Pengajuan destinasi baru dalam jarak 500 meter atau kurang dari destinasi yang ada ditandai POTENTIAL_DUPLICATE untuk ditinjau admin kurator | Dibaca langsung |
| C1 | Konfirmasi teman satu squad | Syarat dokumen bisa berbeda menurut kategori mitra | Laporan pengguna, belum tertulis di SOP |
| C2 | Konfirmasi teman satu squad | Jika duplikat terkonfirmasi, hanya pengajuan destinasi tersebut yang ditolak, bukan seluruh akun mitra | Laporan pengguna, belum tertulis di SOP |

C1 dan C2 hanya menetapkan prinsipnya. Dokumen apa yang wajib untuk tiap kategori belum dikonfirmasi, jadi isi matriks di bawah tetap USULAN.

## Unit keputusan

KB ini bekerja pada dua tingkat yang berbeda.

| Tingkat | Yang dinilai | Aturan |
|---|---|---|
| Akun mitra (KYC) | Kategori mitra dan kelengkapan dokumen KTP, NIB, SK | R1 sampai R8 |
| Pengajuan destinasi | Jarak lokasi, status antrean kurasi, dan hasil kurasi | R9 sampai R15 |

Hasil TOLAK selalu berlaku untuk satu pengajuan destinasi. Akun mitra dan destinasi lain milik mitra yang sama tidak ikut ditolak. Penolakan atau penangguhan akun mitra tidak dimodelkan di sini karena belum ada aturan yang dikonfirmasi.

## Penjelasan dokumen KTP, NIB, dan SK

| Dokumen | Fungsi dalam KYC | Yang dicek KB | Status penjelasan |
|---|---|---|---|
| KTP | Identitas orang yang bertanggung jawab atas mitra. Untuk perorangan adalah pemilik. Untuk lembaga adalah ketua, direktur, atau pengurus | Terunggah dan terbaca jelas | Fungsi umum KYC. Siapa tepatnya per kategori PERLU KONFIRMASI |
| NIB | Bukti registrasi dan identitas pelaku usaha dalam perizinan berusaha berbasis risiko. PP 28/2025 mendefinisikan pelaku usaha sebagai orang perseorangan atau badan usaha (S4) | Terunggah dan berstatus aktif | Definisi NIB dari S4 terkonfirmasi lewat cuplikan pencarian. Kewajiban NIB untuk Pokdarwis dan BUMDes PERLU KONFIRMASI |
| SK | Surat keputusan yang menunjukkan legalitas atau pengukuhan lembaga pengelola | Terunggah dan masih berlaku | Nama dokumen konkret per kategori PERLU KONFIRMASI. Jika SK tidak punya masa berlaku, arti fakta sk_berlaku harus diubah menjadi belum dicabut |

## Fakta masukan

| Fakta | Tipe | Keterangan |
|---|---|---|
| kategori_mitra | teks | perorangan, usaha_pariwisata, pokdarwis, atau bumdes |
| ktp_diunggah, ktp_terbaca | boolean | Hasil cek berkas KTP |
| nib_diunggah, nib_status_aktif | boolean | Hasil cek NIB |
| sk_diunggah, sk_berlaku | boolean | Hasil cek SK |
| jarak_terdekat_m | angka | Jarak Haversine ke destinasi terdekat dalam meter, dibulatkan 1 desimal. Isi 999999 jika belum ada destinasi lain |
| status_antrean_kurasi | teks | belum_ditinjau, bukan_duplikat, duplikat_terkonfirmasi, atau perlu_bukti. Diisi admin kurator |

Fakta turunan: ktp_wajib, nib_wajib, sk_wajib, ktp_valid, nib_valid, sk_valid, dokumen_lengkap, status_lokasi, lokasi_lolos, cakupan, akun_mitra_terdampak. Nilai cakupan adalah pengajuan_destinasi atau dokumen_mitra.

Arti bukan_duplikat: admin menilai destinasi tersebut berbeda dari destinasi terdekat walaupun jaraknya 500 m atau kurang.

## Aturan IF-THEN (15 aturan)

| ID | IF | THEN | Jenis | Dasar |
|---|---|---|---|---|
| R1 | kategori_mitra = perorangan | ktp_wajib = ya; nib_wajib = ya; sk_wajib = tidak | Antara | USULAN, C1, S4 |
| R2 | kategori_mitra = usaha_pariwisata | ktp_wajib = ya; nib_wajib = ya; sk_wajib = ya | Antara | USULAN, C1, S4 |
| R3 | kategori_mitra = pokdarwis | ktp_wajib = ya; nib_wajib = tidak; sk_wajib = ya | Antara | USULAN, C1 |
| R4 | kategori_mitra = bumdes | ktp_wajib = ya; nib_wajib = ya; sk_wajib = ya | Antara | USULAN, C1 |
| R5 | ktp_diunggah DAN ktp_terbaca | ktp_valid = ya | Antara | S1, S2 |
| R6 | nib_diunggah DAN nib_status_aktif | nib_valid = ya | Antara | S1, S4 |
| R7 | sk_diunggah DAN sk_berlaku | sk_valid = ya | Antara | S1, S2 |
| R8 | (ktp_wajib = tidak ATAU ktp_valid) DAN (nib_wajib = tidak ATAU nib_valid) DAN (sk_wajib = tidak ATAU sk_valid) | dokumen_lengkap = ya | Antara | S1, S2 |
| R9 | jarak_terdekat_m <= 500 | status_lokasi = POTENTIAL_DUPLICATE | Antara | S3, S5 |
| R10 | status_lokasi = POTENTIAL_DUPLICATE DAN status_antrean_kurasi = belum_ditinjau | rekomendasi = MENUNGGU_KURASI; cakupan = pengajuan destinasi | Akhir | S1, S3 |
| R11 | status_lokasi = POTENTIAL_DUPLICATE DAN status_antrean_kurasi = duplikat_terkonfirmasi | rekomendasi = TOLAK; cakupan = pengajuan destinasi ini; akun mitra tidak terdampak | Akhir | S1, S3, C2 |
| R12 | status_lokasi = POTENTIAL_DUPLICATE DAN status_antrean_kurasi = perlu_bukti | rekomendasi = REVISI; cakupan = pengajuan destinasi ini | Akhir | S1, S3 |
| R13 | jarak_terdekat_m > 500 ATAU (status_lokasi = POTENTIAL_DUPLICATE DAN status_antrean_kurasi = bukan_duplikat) | lokasi_lolos = ya | Antara | S1, S3 |
| R14 | lokasi_lolos DAN dokumen_lengkap = ya | rekomendasi = SETUJUI; cakupan = pengajuan destinasi | Akhir | S1, S2 |
| R15 | lokasi_lolos DAN dokumen_lengkap belum terpenuhi | rekomendasi = REVISI; cakupan = dokumen mitra | Akhir | S1, S2 |

Aturan lokasi tidak pernah menolak hanya karena jarak. Jarak 500 m atau kurang hanya menandai (R9) dan mengirim pengajuan ke antrean kurasi (R10). Jika admin menilai destinasinya berbeda, pengajuan lanjut ke pengecekan dokumen (R13 sampai R15).

## Matriks syarat dokumen per kategori (USULAN)

Matriks ini adalah usulan desain yang mendasari R1 sampai R4. Belum ada SOP atau konfirmasi tertulis tentang dokumen persisnya.

| Kategori mitra | KTP | NIB | SK | Catatan |
|---|---|---|---|---|
| Perorangan | wajib (pemilik) | wajib | tidak wajib | NIB untuk perorangan sejalan dengan definisi pelaku usaha di S4. Tidak adanya SK adalah usulan |
| Usaha pariwisata (badan usaha) | wajib (pengurus) | wajib | wajib | SK diartikan legalitas badan usaha. Nama dokumen konkret PERLU KONFIRMASI |
| Pokdarwis | wajib (ketua) | tidak wajib | wajib | Usulan karena Pokdarwis berbentuk kelompok masyarakat. Apakah NIB wajib PERLU KONFIRMASI |
| BUMDes | wajib (pengurus) | wajib | wajib | Usulan karena BUMDes menjalankan usaha. Nama SK dan kewajiban NIB PERLU KONFIRMASI |

## Hasil kurasi dan cakupannya

| Hasil | Penyebab (aturan) | Cakupan | Akibat |
|---|---|---|---|
| SETUJUI | Lokasi lolos dan dokumen lengkap (R14) | Pengajuan destinasi | Destinasi lanjut tayang |
| REVISI | Dokumen wajib belum valid (R15) | Dokumen mitra | Mitra melengkapi dokumen |
| REVISI | Admin meminta bukti lokasi (R12) | Pengajuan destinasi | Mitra memperbaiki pengajuan destinasi itu |
| TOLAK | Admin mengonfirmasi duplikat (R11) | Pengajuan destinasi | Hanya pengajuan itu yang ditolak. Akun mitra dan destinasi lain tetap |
| MENUNGGU_KURASI | Potensi duplikat belum ditinjau (R10) | Pengajuan destinasi | Status antrean, belum keputusan |

Jika lokasi masih menunggu kurasi, pengecekan dokumen belum menentukan hasil akhir.

## Hal yang PERLU KONFIRMASI

| No | Pertanyaan | Dampak jika jawabannya berbeda |
|---|---|---|
| K1 | Apakah empat kategori ini final dan apa saja yang masuk usaha pariwisata (PT, CV, UD)? | Mengubah R1 sampai R4 |
| K2 | KTP siapa yang diminta untuk tiap lembaga? | Mengubah penjelasan KTP |
| K3 | Apakah Pokdarwis wajib NIB? | Mengubah R3 |
| K4 | Apakah BUMDes wajib NIB dan SK apa yang dimaksud? | Mengubah R4 |
| K5 | Apa nama SK untuk tiap kategori dan apakah punya masa berlaku? | Mengubah R7 dan arti sk_berlaku |
| K6 | Apakah perorangan perlu dokumen legalitas tambahan? | Mengubah R1 |
| K7 | Bagaimana jika destinasi terdekat milik mitra yang sama? | Mungkin perlu aturan tambahan |
| K8 | Apakah dokumen disimpan sekali per akun mitra? | Mengubah unit keputusan R15 |
| K9 | Apakah akun mitra bisa ditolak atau ditangguhkan, dan oleh aturan apa? | Di luar KB ini |

## Status verifikasi sumber

| Kode | Sumber | Status |
|---|---|---|
| S1 | Pertemuan 11 DSS.SIP117, dennyjcs.com/dss/pertemuan-11.html | Dibaca langsung, 23 Nov 2026 |
| S2 | Brief Proyek Capstone SIP117, dennyjcs.com/dss/project.html | Dibaca langsung, 23 Nov 2026 |
| S3 | GitHub Issue #7, pustahalab/wisata-indonesia | Dibaca langsung, 23 Nov 2026. Kriteria penerimaan memakai jarak 500 meter atau kurang |
| S4 | PP No. 28 Tahun 2025 tentang Penyelenggaraan Perizinan Berusaha Berbasis Risiko, berlaku 5 Juni 2025 | Definisi Pelaku Usaha dan NIB terkonfirmasi lewat cuplikan pencarian. Teks lengkap belum dibaca |
| S5 | Dokumentasi PostGIS, ST_Distance dan ST_DWithin tipe geography | Belum dibuka ulang. Cek versi terbaru sebelum dikutip |

Peraturan Menteri Pariwisata No. 6 Tahun 2025 (standar kegiatan usaha sektor pariwisata, menggantikan Permenpar No. 4 Tahun 2021) bisa menjadi rujukan untuk memvalidasi matriks dokumen. Lampirannya belum dibaca, jadi belum dipakai sebagai dasar aturan apa pun.

## Perubahan dari versi 2

| Bagian | Versi 2 | Versi 3 | Alasan |
|---|---|---|---|
| Kategori mitra | Dua kategori | Empat kategori: perorangan, usaha pariwisata, Pokdarwis, BUMDes | Sesuai permintaan dan C1 |
| Syarat dokumen | Matriks di luar aturan | Menjadi aturan R1 sampai R4, tetap berstatus USULAN | Diminta berbentuk aturan, tetapi isinya belum dikonfirmasi |
| TOLAK | Tanpa cakupan | R11 hanya menolak pengajuan destinasi, akun mitra tidak terdampak | Sesuai C2 |
| REVISI | Satu penyebab | Dua penyebab dengan cakupan berbeda (R12 dan R15) | Revisi bukti lokasi dan revisi dokumen berbeda sasarannya |
| Destinasi berbeda dalam 500 m | Lewat R11 lama | R13 secara eksplisit meloloskan destinasi yang dinilai admin bukan duplikat | Sesuai permintaan |
| Penjelasan KTP, NIB, SK | Tidak ada | Tabel fungsi, cek, dan status penjelasan | Diminta dijelaskan jelas |
| Daftar konfirmasi | Hanya catatan singkat | Tabel K1 sampai K9 | Memisahkan yang sudah pasti dari yang belum |

Penyesuaian nomor aturan:

| ID lama | ID baru | Catatan |
|---|---|---|
| R1 | R5 | KTP valid |
| R2 | R6 | NIB valid |
| R3 | R7 | SK valid |
| R4 | R8 | Dokumen lengkap |
| R5 | dihapus | Digabung ke R15, dokumen yang belum terpenuhi dibaca langsung |
| R6 | R9 | Potensi duplikat |
| R7 | dihapus | Digabung ke R13, jarak lebih dari 500 m langsung lolos |
| R8 | R10 | Menunggu kurasi |
| R9 | R11 | TOLAK, kini hanya untuk pengajuan destinasi |
| R10 | R12 | REVISI bukti lokasi |
| R11 | R13 | Lokasi lolos |
| R12 | R14 | SETUJUI |
| R13 | R15 | REVISI dokumen |
| baru | R1 sampai R4 | Syarat dokumen per kategori |

Penggabungan itu menjaga jumlah aturan tetap 15, batas atas pada P11.

## Rumus Haversine

d = 2 x R x arcsin( akar( sin kuadrat(Δφ/2) + cos φ1 x cos φ2 x sin kuadrat(Δλ/2) ) )

R = 6.371.000 m. φ adalah lintang dan λ adalah bujur dalam radian. Hasil dibulatkan 1 desimal. Jarak tepat 500,0 m termasuk POTENTIAL_DUPLICATE.
