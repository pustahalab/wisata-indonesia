# 04 Skenario Pengujian (Squad 2)

selaras dengan 01-tabel-aturan.md dan 03-rules.json.

Semua jarak dihitung dari koordinat memakai rumus Haversine (R = 6.371.000 m, dibulatkan 1 desimal) oleh skrip engine_test.py. Skrip yang sama membaca 03-rules.json, menjalankan forward chaining, lalu membandingkan hasilnya dengan hasil yang diharapkan di bawah. Keluarannya tersimpan di hasil-uji.txt.

Destinasi acuan (data contoh, bukan data asli): -7,9425 ; 112,9530. Semua jarak diukur ke titik ini.

Matriks syarat dokumen yang dipakai adalah USULAN di 01-tabel-aturan.md (R1 sampai R4), bukan SOP resmi. Hasil uji untuk Pokdarwis dan BUMDes ikut berubah jika K3 sampai K5 dijawab berbeda.

## Tiga profil utama

### Profil 1: Perorangan, lokasi jauh (target SETUJUI)

| Fakta | Nilai |
|---|---|
| kategori_mitra | perorangan |
| Dokumen | KTP dan NIB valid, SK tidak diunggah |
| Koordinat | -7,9190 ; 112,9500 |
| jarak_terdekat_m | 2.633,9 |

Aturan menyala: R1, R5, R6, R8, R13, R14
Hasil yang diharapkan: SETUJUI, cakupan pengajuan_destinasi. SK tidak diwajibkan untuk perorangan (R1).

### Profil 2: Usaha pariwisata dengan SK tidak berlaku (target REVISI)

| Fakta | Nilai |
|---|---|
| kategori_mitra | usaha_pariwisata |
| Dokumen | KTP dan NIB valid, SK diunggah tetapi tidak berlaku |
| Koordinat | -7,9800 ; 112,9700 |
| jarak_terdekat_m | 4.570,8 |

Aturan menyala: R2, R5, R6, R13, R15
Hasil yang diharapkan: REVISI, cakupan dokumen_mitra. Alasan: SK wajib tetapi tidak berlaku (R2, R15).

### Profil 3: Lokasi sangat dekat (target TOLAK lewat antrean kurasi)

Kategori usaha_pariwisata, dokumen KTP, NIB, SK valid, koordinat -7,9435 ; 112,9535, jarak_terdekat_m 124,1.

| Tahap | status_antrean_kurasi | Aturan menyala | Hasil yang diharapkan | Cakupan |
|---|---|---|---|---|
| 3a | belum_ditinjau | R2, R5, R6, R7, R8, R9, R10 | MENUNGGU_KURASI (belum keputusan) | pengajuan_destinasi |
| 3b | duplikat_terkonfirmasi | R2, R5, R6, R7, R8, R9, R11 | TOLAK | pengajuan_destinasi, akun mitra tidak terdampak |

Jarak di bawah 500 m tidak pernah menolak sendiri. TOLAK baru muncul di tahap 3b setelah admin kurator mengonfirmasi duplikat.

## Kategori lain, uji batas, dan uji akun mitra

| Kode | Tujuan | Kategori | Dokumen | Koordinat | Jarak (m) | Antrean | Aturan menyala | Hasil | Cakupan |
|---|---|---|---|---|---|---|---|---|---|
| P4 | Pokdarwis lolos tanpa NIB (usulan, K3) | pokdarwis | KTP dan SK valid, NIB tidak diunggah | -7,9300 ; 112,9450 | 1.645,6 | tidak ada (jarak lebih dari 500 m) | R3, R5, R7, R8, R13, R14 | SETUJUI | pengajuan_destinasi |
| P5 | Pokdarwis tanpa SK | pokdarwis | KTP dan NIB valid, SK tidak diunggah | -7,9300 ; 112,9450 | 1.645,6 | tidak ada (jarak lebih dari 500 m) | R3, R5, R6, R13, R15 | REVISI | dokumen_mitra |
| P6 | BUMDes dalam 500 m, admin menilai destinasi berbeda | bumdes | KTP, NIB, SK valid | -7,9400 ; 112,9520 | 299,0 | bukan_duplikat | R4, R5, R6, R7, R8, R9, R13, R14 | SETUJUI | pengajuan_destinasi |
| P7 | BUMDes dengan NIB tidak aktif | bumdes | KTP dan SK valid, NIB tidak aktif | -7,9600 ; 112,9400 | 2.415,8 | tidak ada (jarak lebih dari 500 m) | R4, R5, R7, R13, R15 | REVISI | dokumen_mitra |
| P8 | SK yang tidak diwajibkan diabaikan | perorangan | KTP dan NIB valid, SK diunggah tetapi tidak berlaku | -7,9100 ; 112,9600 | 3.695,2 | tidak ada (jarak lebih dari 500 m) | R1, R5, R6, R8, R13, R14 | SETUJUI | pengajuan_destinasi |
| T1 | Batas tepat 500,0 m | perorangan | KTP, NIB, SK valid | -7,9380033920 ; 112,9530 | 500,0 | belum_ditinjau | R1, R5, R6, R7, R8, R9, R10 | MENUNGGU_KURASI | pengajuan_destinasi |
| T2 | Batas 500,1 m | perorangan | KTP, NIB, SK valid | -7,9380024926 ; 112,9530 | 500,1 | tidak ada (jarak lebih dari 500 m) | R1, R5, R6, R7, R8, R13, R14 | SETUJUI | pengajuan_destinasi |
| T3 | Admin meminta bukti lokasi | perorangan | KTP, NIB, SK valid | -7,9450 ; 112,9545 | 323,4 | perlu_bukti | R1, R5, R6, R7, R8, R9, R12 | REVISI | pengajuan_destinasi |
| T4 | Admin menilai berbeda tetapi KTP tidak terbaca | usaha_pariwisata | KTP diunggah tetapi tidak terbaca, NIB dan SK valid | -7,9400 ; 112,9520 | 299,0 | bukan_duplikat | R2, R6, R7, R9, R13, R15 | REVISI | dokumen_mitra |
| A1 | Mitra yang sama, pengajuan duplikat ditolak | usaha_pariwisata | KTP, NIB, SK valid | -7,9435 ; 112,9535 | 124,1 | duplikat_terkonfirmasi | R2, R5, R6, R7, R8, R9, R11 | TOLAK | pengajuan_destinasi |
| A2 | Mitra yang sama, pengajuan lain disetujui | usaha_pariwisata | KTP, NIB, SK valid | -7,9190 ; 112,9500 | 2.633,9 | tidak ada (jarak lebih dari 500 m) | R2, R5, R6, R7, R8, R13, R14 | SETUJUI | pengajuan_destinasi |

Catatan:
- P4 sampai P7 menguji kategori Pokdarwis dan BUMDes sesuai matriks USULAN.
- T1 dan T2 menguji batas. Jarak tepat 500,0 m wajib ditandai POTENTIAL_DUPLICATE sesuai Issue #7.
- P6 dan T4 menguji destinasi berbeda dalam 500 m yang tetap lanjut ke pengecekan dokumen.
- A1 dan A2 memakai mitra yang sama dengan dokumen yang sama. A1 ditolak sebagai duplikat, A2 tetap disetujui. Ini menunjukkan penolakan hanya berlaku untuk satu pengajuan destinasi (C2).

## Matriks cakupan aturan

| Aturan | Diuji oleh |
|---|---|
| R1 | P1, P8, T1, T2, T3 |
| R2 | P2, P3a, P3b, T4, A1, A2 |
| R3 | P4, P5 |
| R4 | P6, P7 |
| R5 | P1, P2, P3a, P3b, P4, P5, P6, P7, P8, T1, T2, T3, A1, A2 |
| R6 | P1, P2, P3a, P3b, P5, P6, P8, T1, T2, T3, T4, A1, A2 |
| R7 | P3a, P3b, P4, P6, P7, T1, T2, T3, T4, A1, A2 |
| R8 | P1, P3a, P3b, P4, P6, P8, T1, T2, T3, A1, A2 |
| R9 | P3a, P3b, P6, T1, T3, T4, A1 |
| R10 | P3a, T1 |
| R11 | P3b, A1 |
| R12 | T3 |
| R13 | P1, P2, P4, P5, P6, P7, P8, T2, T4, A2 |
| R14 | P1, P4, P6, P8, T2, A2 |
| R15 | P2, P5, P7, T4 |

Semua 15 aturan teruji. Setiap kasus dicek bahwa tepat satu aturan akhir yang menyala.

## Uji menyeluruh

Selain kasus di atas, mesin dibandingkan dengan perhitungan pembanding terpisah untuk 224 kombinasi (4 kategori, 8 kombinasi dokumen, 7 keadaan lokasi dan antrean). Semuanya cocok.

## Cara menjalankan ulang

Letakkan 03-rules.json dan engine_test.py di satu folder lalu jalankan: python3 engine_test.py
