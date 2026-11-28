# Identifikasi Fakta dan Tabel Aturan – Knowledge Base Konten Detail Destinasi

> **Sumber Data Cuaca:** Data cuaca diambil dari API publik BMKG (`https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4={kode_wilayah_tingkat_iv}`) melalui `bmkgAdapter.js` (Node.js). Karena pembaruan resmi API prakiraan cuaca BMKG dilakukan 2 kali sehari (~12 jam sekali), batas kedaluwarsa data ditetapkan **> 12 jam**.

## 1. Gambaran Umum dan Prinsip Desain

Knowledge Base ini menilai kelayakan konten halaman detail destinasi yang mencakup kelengkapan fasilitas inti, validitas serta status jam operasional, dan informasi peringatan cuaca BMKG, hingga menghasilkan keputusan akhir **`SIAP_TAYANG`** atau **`PERLU_UPDATE`**.

| Prinsip Desain | Penerapan dalam Aturan |
|---|---|
| **Kelayakan konten berbeda dengan status operasional** | Status `BUKA` atau `TUTUP` (`R06`–`R08`) hanya menjadi informasi bagi wisatawan dan tidak memengaruhi `R14`–`R15`. Destinasi yang sedang tutup tetap dapat berstatus `SIAP_TAYANG`. |
| **Cuaca ekstrem tidak membuat konten diturunkan** | Kondisi cuaca ekstrem (`R13`) mengaktifkan *banner* peringatan keselamatan (`TAMPIL_PERINGATAN = EKSTREM`), tanpa mengubah keputusan konten menjadi `PERLU_UPDATE`. |
| **Data BMKG bermasalah tidak dianggap cuaca normal** | Data BMKG yang tidak tersedia atau kedaluwarsa (`R09`) menghasilkan `STATUS_DATA_BMKG = TIDAK_VALID`, `LEVEL_CUACA = TIDAK_DIKETAHUI`, dan `TAMPIL_PERINGATAN = INFO_TIDAK_TERSEDIA`. Aturan cuaca normal (`R11`) hanya aktif jika data BMKG berstatus `VALID`. |

## 2. Identifikasi Fakta (Working Memory)

### 2.1 Fakta Input

| Kode | Nama Fakta | Tipe Data | Nilai yang Mungkin | Penjelasan |
|---|---|---|---|---|
| `F01` | `NAMA_DESTINASI` | `string` | Teks bebas | Identitas nama destinasi wisata. Tidak dipakai dalam kondisi aturan, hanya untuk tampilan hasil. |
| `F02` | `FASILITAS_TOILET` | `enum` | `TERSEDIA`, `TIDAK_TERSEDIA`, `BELUM_DIISI` | Status ketersediaan data fasilitas toilet di destinasi. |
| `F03` | `FASILITAS_PARKIR` | `enum` | `TERSEDIA`, `TIDAK_TERSEDIA`, `BELUM_DIISI` | Status ketersediaan data fasilitas area parkir di destinasi. |
| `F04` | `FASILITAS_IBADAH` | `enum` | `TERSEDIA`, `TIDAK_TERSEDIA`, `BELUM_DIISI` | Status ketersediaan data fasilitas tempat ibadah di destinasi. |
| `F05` | `FASILITAS_MAKAN` | `enum` | `TERSEDIA`, `TIDAK_TERSEDIA`, `BELUM_DIISI` | Status ketersediaan data fasilitas tempat makan di destinasi. |
| `F06` | `JAM_BUKA` | `string (HH:MM)` atau `null` | Format 24 jam `HH:MM` (contoh `08:00`), atau `null` | Jam buka operasional destinasi dalam zona waktu WIB. |
| `F07` | `JAM_TUTUP` | `string (HH:MM)` atau `null` | Format 24 jam `HH:MM` (contoh `17:00`), atau `null` | Jam tutup operasional destinasi dalam zona waktu WIB. |
| `F08` | `HARI_LIBUR` | `boolean` | `TRUE`, `FALSE` | Bernilai `TRUE` jika hari pemeriksaan merupakan hari tutup mingguan atau libur khusus destinasi. |
| `F09` | `JAM_SEKARANG` | `string (HH:MM)` | Format 24 jam `HH:MM` (contoh `10:30`) | Waktu saat konten dan status operasional destinasi diperiksa (WIB). |
| `F10` | `BMKG_TERSEDIA` | `boolean` | `TRUE`, `FALSE` | Bernilai `TRUE` jika *request* ke API publik BMKG (`adm4`) berhasil mengembalikan data cuaca. |
| `F11` | `BMKG_USIA_JAM` | `number` atau `null` | Angka `>= 0` (selisih waktu sekarang dengan `analysis_date`), atau `null` | Usia data prakiraan BMKG dalam satuan jam untuk menentukan apakah data masih segar atau kedaluwarsa. |
| `F12` | `CURAH_HUJAN_MM` | `number` atau `null` | Angka `>= 0` (field `tp` dari API BMKG, mm), atau `null` | Prakiraan intensitas curah hujan dari API BMKG sebagai dasar penentuan level cuaca. |
| `F13` | `PERINGATAN_DINI` | `enum` atau `null` | `TIDAK_ADA`, `WASPADA`, `SIAGA`, `AWAS`, `null` | Tingkat peringatan dini cuaca dari BMKG (diisi dari layanan peringatan dini atau *default* `TIDAK_ADA` oleh adapter). |

> **Perbedaan `BELUM_DIISI` dan `TIDAK_TERSEDIA`:** `BELUM_DIISI` berarti data masih kosong sehingga konten belum lengkap. `TIDAK_TERSEDIA` berarti data sudah diisi dan fasilitas tersebut memang tidak ada di lokasi, sehingga data tetap dianggap lengkap.

### 2.2 Fakta Turunan (Derived Facts)

| Kode | Nama Fakta | Tipe Data | Nilai yang Mungkin | Penjelasan |
|---|---|---|---|---|
| `D01` | `STATUS_FASILITAS` | `enum` | `LENGKAP`, `TIDAK_LENGKAP` | Hasil pemeriksaan kelengkapan seluruh fasilitas inti (dihasilkan oleh `R01` atau `R02`). |
| `D02` | `STATUS_DATA_JAM` | `enum` | `KOSONG`, `TIDAK_VALID`, `VALID` | Hasil validasi kelengkapan dan urutan jam operasional (dihasilkan oleh `R03`, `R04`, atau `R05`). |
| `D03` | `STATUS_OPERASIONAL` | `enum` | `BUKA`, `TUTUP`, `TIDAK_DIKETAHUI` | Status operasional destinasi saat pemeriksaan (dihasilkan oleh `R06`, `R07`, atau `R08`). Terpisah dari kelayakan konten. |
| `D04` | `STATUS_DATA_BMKG` | `enum` | `VALID`, `TIDAK_VALID` | Hasil validasi ketersediaan dan kesegaran data cuaca BMKG (dihasilkan oleh `R09` atau `R10`). |
| `D05` | `LEVEL_CUACA` | `enum` | `NORMAL`, `WASPADA`, `EKSTREM`, `TIDAK_DIKETAHUI` | Klasifikasi kondisi cuaca berdasarkan data BMKG (dihasilkan oleh `R09`, `R11`, `R12`, atau `R13`). |
| `D06` | `TAMPIL_PERINGATAN` | `enum` | `TIDAK`, `WASPADA`, `EKSTREM`, `INFO_TIDAK_TERSEDIA` | Jenis *banner* peringatan atau informasi cuaca yang ditampilkan di halaman detail (dihasilkan oleh `R09`, `R11`, `R12`, atau `R13`). |
| `D07` | `KEPUTUSAN_KONTEN` | `enum` | `SIAP_TAYANG`, `PERLU_UPDATE` | Keputusan akhir kelayakan tayang konten detail destinasi (dihasilkan oleh `R14` atau `R15`). |

## 3. Tabel Aturan (Rule Base)

Seluruh aturan menggunakan format **IF–THEN** (`AND` = semua syarat terpenuhi; `OR` = minimal satu syarat terpenuhi) dan disimpan secara terstruktur dalam file `rules_squad4_detail_destinasi.json`.

| Kode | Kondisi (IF) | Kesimpulan (THEN) | Dasar Aturan |
|---|---|---|---|
| | **Kelompok 1: Kelengkapan Fasilitas** | | |
| **R01** | `FASILITAS_TOILET` IN (`TERSEDIA`, `TIDAK_TERSEDIA`) **AND** `FASILITAS_PARKIR` IN (`TERSEDIA`, `TIDAK_TERSEDIA`) **AND** `FASILITAS_IBADAH` IN (`TERSEDIA`, `TIDAK_TERSEDIA`) **AND** `FASILITAS_MAKAN` IN (`TERSEDIA`, `TIDAK_TERSEDIA`) | `STATUS_FASILITAS = LENGKAP` | Seluruh fasilitas inti wajib sudah diisi statusnya. |
| **R02** | `FASILITAS_TOILET = BELUM_DIISI` **OR** `FASILITAS_PARKIR = BELUM_DIISI` **OR** `FASILITAS_IBADAH = BELUM_DIISI` **OR** `FASILITAS_MAKAN = BELUM_DIISI` | `STATUS_FASILITAS = TIDAK_LENGKAP` | Satu fasilitas saja berstatus `BELUM_DIISI` cukup menandai data belum lengkap. |
| | **Kelompok 2: Validasi Jam Operasional** | | |
| **R03** | `JAM_BUKA` kosong (`null`) **OR** `JAM_TUTUP` kosong (`null`) | `STATUS_DATA_JAM = KOSONG` | Jam buka dan jam tutup keduanya wajib terisi. |
| **R04** | `JAM_BUKA` terisi **AND** `JAM_TUTUP` terisi **AND** `JAM_BUKA >= JAM_TUTUP` | `STATUS_DATA_JAM = TIDAK_VALID` | Jam buka harus lebih awal dari jam tutup (asumsi operasional tidak melewati tengah malam). |
| **R05** | `JAM_BUKA` terisi **AND** `JAM_TUTUP` terisi **AND** `JAM_BUKA < JAM_TUTUP` | `STATUS_DATA_JAM = VALID` | Kedua jam terisi dan urutannya logis. |
| | **Kelompok 3: Status Operasional** | | |
| **R06** | `STATUS_DATA_JAM = VALID` **AND** `HARI_LIBUR = FALSE` **AND** `JAM_SEKARANG >= JAM_BUKA` **AND** `JAM_SEKARANG < JAM_TUTUP` | `STATUS_OPERASIONAL = BUKA` | Waktu pemeriksaan berada di dalam jam operasional yang valid pada hari non-libur. |
| **R07** | `STATUS_DATA_JAM = VALID` **AND** (`HARI_LIBUR = TRUE` **OR** `JAM_SEKARANG < JAM_BUKA` **OR** `JAM_SEKARANG >= JAM_TUTUP`) | `STATUS_OPERASIONAL = TUTUP` | Hari libur atau waktu di luar jam operasional. Status tutup tidak memengaruhi keputusan konten. |
| **R08** | `STATUS_DATA_JAM` IN (`KOSONG`, `TIDAK_VALID`) | `STATUS_OPERASIONAL = TIDAK_DIKETAHUI` | Jika data jam bermasalah, sistem tidak boleh menebak status buka atau tutup. |
| | **Kelompok 4: Validasi Data BMKG** | | |
| **R09** | `BMKG_TERSEDIA = FALSE` **OR** `BMKG_USIA_JAM > 12` | `STATUS_DATA_BMKG = TIDAK_VALID`<br>`LEVEL_CUACA = TIDAK_DIKETAHUI`<br>`TAMPIL_PERINGATAN = INFO_TIDAK_TERSEDIA` | Data tidak tersedia atau berusia lebih dari 12 jam (mengikuti siklus rilis API BMKG 2 kali sehari). Tidak dianggap cuaca normal. |
| **R10** | `BMKG_TERSEDIA = TRUE` **AND** `BMKG_USIA_JAM` terisi **AND** `BMKG_USIA_JAM <= 12` | `STATUS_DATA_BMKG = VALID` | Data BMKG tersedia dari API dan masih segar (usia `<= 12` jam). |
| | **Kelompok 5: Penentuan Peringatan Cuaca** | | |
| **R11** | `STATUS_DATA_BMKG = VALID` **AND** `PERINGATAN_DINI = TIDAK_ADA` **AND** `CURAH_HUJAN_MM < 50` | `LEVEL_CUACA = NORMAL`<br>`TAMPIL_PERINGATAN = TIDAK` | Data BMKG valid, tidak ada peringatan dini, dan curah hujan di bawah ambang kebijakan 50 mm/hari. |
| **R12** | `STATUS_DATA_BMKG = VALID` **AND** `PERINGATAN_DINI` IN (`TIDAK_ADA`, `WASPADA`) **AND** `CURAH_HUJAN_MM < 100` **AND** (`PERINGATAN_DINI = WASPADA` **OR** `CURAH_HUJAN_MM >= 50`) | `LEVEL_CUACA = WASPADA`<br>`TAMPIL_PERINGATAN = WASPADA` | Peringatan dini tingkat `WASPADA`, atau curah hujan 50 hingga `< 100` mm/hari. |
| **R13** | `STATUS_DATA_BMKG = VALID` **AND** (`PERINGATAN_DINI` IN (`SIAGA`, `AWAS`) **OR** `CURAH_HUJAN_MM >= 100`) | `LEVEL_CUACA = EKSTREM`<br>`TAMPIL_PERINGATAN = EKSTREM` | Peringatan dini `SIAGA`/`AWAS`, atau curah hujan `>= 100` mm/hari. Konten tetap tayang dengan peringatan keselamatan. |
| | **Kelompok 6: Keputusan Konten** | | |
| **R14** | `STATUS_FASILITAS = LENGKAP` **AND** `STATUS_DATA_JAM = VALID` **AND** `STATUS_DATA_BMKG = VALID` | `KEPUTUSAN_KONTEN = SIAP_TAYANG` | Ketiga komponen utama konten (fasilitas, jam operasional, dan data BMKG) lengkap dan valid. |
| **R15** | `STATUS_FASILITAS = TIDAK_LENGKAP` **OR** `STATUS_DATA_JAM` IN (`KOSONG`, `TIDAK_VALID`) **OR** `STATUS_DATA_BMKG = TIDAK_VALID` | `KEPUTUSAN_KONTEN = PERLU_UPDATE` | Salah satu atau lebih komponen utama konten belum lengkap atau tidak valid. |

### Pemeriksaan Konsistensi Aturan

Setiap kelompok aturan dirancang saling lepas (*mutually exclusive*) dan menyeluruh (*exhaustive*):
- `R01` dan `R02` saling melengkapi untuk seluruh status fasilitas.
- `R03`, `R04`, dan `R05` membagi kondisi jam operasional menjadi tiga himpunan terpisah.
- `R06` dan `R07` hanya aktif bila `STATUS_DATA_JAM = VALID` dan saling berlawanan, sedangkan `R08` menangani selain `VALID`.
- `R09` dan `R10` saling melengkapi untuk ketersediaan dan batas usia data BMKG (`<= 12` vs `> 12` jam).
- `R11`, `R12`, dan `R13` hanya aktif bila `STATUS_DATA_BMKG = VALID` dengan ambang nilai yang tidak tumpang tindih.
- `R14` dan `R15` saling berlawanan secara logika.
