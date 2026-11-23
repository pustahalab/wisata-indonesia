# Skenario Pengujian, Kesimpulan, dan Batasan – Knowledge Base Konten Detail Destinasi

> **Sumber Data Cuaca:** Pada implementasi, fakta `F10`–`F13` dipasok dari API publik BMKG (`https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4={kode_wilayah_tingkat_iv}`) melalui `bmkgAdapter.js` (Node.js). Skenario di bawah ini menguji seluruh cabang aturan pada `rules_squad4_detail_destinasi.json` dengan batas kesegaran data BMKG `<= 12` jam.

## 1. Skenario Pengujian

### Skenario 1: Data Fasilitas dan Jam Lengkap, BMKG Valid, Cuaca Normal

#### 1. Data Input
| Kode | Nama Fakta | Nilai Input |
|---|---|---|
| `F01` | `NAMA_DESTINASI` | `"Pantai Pandawa"` |
| `F02` | `FASILITAS_TOILET` | `"TERSEDIA"` |
| `F03` | `FASILITAS_PARKIR` | `"TERSEDIA"` |
| `F04` | `FASILITAS_IBADAH` | `"TERSEDIA"` |
| `F05` | `FASILITAS_MAKAN` | `"TERSEDIA"` |
| `F06` | `JAM_BUKA` | `"08:00"` |
| `F07` | `JAM_TUTUP` | `"18:00"` |
| `F08` | `HARI_LIBUR` | `false` |
| `F09` | `JAM_SEKARANG` | `"10:30"` |
| `F10` | `BMKG_TERSEDIA` | `true` |
| `F11` | `BMKG_USIA_JAM` | `2` |
| `F12` | `CURAH_HUJAN_MM` | `12` |
| `F13` | `PERINGATAN_DINI` | `"TIDAK_ADA"` |

#### 2. Aturan yang Aktif
`R01`, `R05`, `R10`, `R06`, `R11`, `R14` (6 dari 15 aturan).

#### 3. Urutan Proses Inferensi
- **Siklus 1:**
  - `R01` aktif karena `F02`–`F05` seluruhnya bernilai `TERSEDIA`.
  - `R05` aktif karena `JAM_BUKA` (`08:00`) dan `JAM_TUTUP` (`18:00`) terisi dan `08:00 < 18:00`.
  - `R10` aktif karena `BMKG_TERSEDIA = true` dan `BMKG_USIA_JAM = 2 <= 12`.
- **Siklus 2:**
  - `R06` aktif karena `STATUS_DATA_JAM = VALID`, `HARI_LIBUR = false`, dan `10:30` berada di antara `08:00` dan `18:00`.
  - `R11` aktif karena `STATUS_DATA_BMKG = VALID`, `PERINGATAN_DINI = TIDAK_ADA`, dan `CURAH_HUJAN_MM = 12 < 50`.
  - `R14` aktif karena `STATUS_FASILITAS = LENGKAP`, `STATUS_DATA_JAM = VALID`, dan `STATUS_DATA_BMKG = VALID`.
- **Siklus 3:** Tidak ada aturan baru yang terpenuhi, proses inferensi berhenti.

#### 4. Fakta Turunan yang Dihasilkan
| Kode | Nama Fakta Turunan | Nilai Hasil |
|---|---|---|
| `D01` | `STATUS_FASILITAS` | `LENGKAP` |
| `D02` | `STATUS_DATA_JAM` | `VALID` |
| `D03` | `STATUS_OPERASIONAL` | `BUKA` |
| `D04` | `STATUS_DATA_BMKG` | `VALID` |
| `D05` | `LEVEL_CUACA` | `NORMAL` |
| `D06` | `TAMPIL_PERINGATAN` | `TIDAK` |
| `D07` | `KEPUTUSAN_KONTEN` | `SIAP_TAYANG` |

#### 5. Output JSON
```json
{
  "destinasi": "Pantai Pandawa",
  "status_fasilitas": "LENGKAP",
  "status_data_jam": "VALID",
  "status_operasional": "BUKA",
  "status_data_bmkg": "VALID",
  "level_cuaca": "NORMAL",
  "tampil_peringatan": "TIDAK",
  "keputusan_konten": "SIAP_TAYANG",
  "aturan_aktif": ["R01", "R05", "R10", "R06", "R11", "R14"]
}
```

#### 6. Interpretasi Hasil Pengujian
Seluruh data fasilitas, jam operasional, dan data BMKG memenuhi syarat kelengkapan dan validitas sehingga konten berstatus **`SIAP_TAYANG`**. Karena cuaca berada pada level `NORMAL`, halaman detail destinasi tampil tanpa *banner* peringatan cuaca dan menampilkan status operasional **`BUKA`** bagi wisatawan.

---

### Skenario 2: Fasilitas Belum Diisi, Jam Tidak Lengkap, Data BMKG Kedaluwarsa

#### 1. Data Input
| Kode | Nama Fakta | Nilai Input |
|---|---|---|
| `F01` | `NAMA_DESTINASI` | `"Air Terjun Tumpak Sewu"` |
| `F02` | `FASILITAS_TOILET` | `"TERSEDIA"` |
| `F03` | `FASILITAS_PARKIR` | `"TERSEDIA"` |
| `F04` | `FASILITAS_IBADAH` | `"BELUM_DIISI"` |
| `F05` | `FASILITAS_MAKAN` | `"TIDAK_TERSEDIA"` |
| `F06` | `JAM_BUKA` | `"07:00"` |
| `F07` | `JAM_TUTUP` | `null` |
| `F08` | `HARI_LIBUR` | `false` |
| `F09` | `JAM_SEKARANG` | `"10:30"` |
| `F10` | `BMKG_TERSEDIA` | `true` |
| `F11` | `BMKG_USIA_JAM` | `15` |
| `F12` | `CURAH_HUJAN_MM` | `30` |
| `F13` | `PERINGATAN_DINI` | `"TIDAK_ADA"` |

#### 2. Aturan yang Aktif
`R02`, `R03`, `R09`, `R08`, `R15` (5 dari 15 aturan).

#### 3. Urutan Proses Inferensi
- **Siklus 1:**
  - `R02` aktif karena `FASILITAS_IBADAH = BELUM_DIISI` (meskipun `FASILITAS_MAKAN = TIDAK_TERSEDIA` dihitung terisi).
  - `R03` aktif karena `JAM_TUTUP` bernilai `null`.
  - `R09` aktif karena `BMKG_USIA_JAM = 15 > 12` (kedaluwarsa). Aturan ini langsung menetapkan `STATUS_DATA_BMKG = TIDAK_VALID`, `LEVEL_CUACA = TIDAK_DIKETAHUI`, dan `TAMPIL_PERINGATAN = INFO_TIDAK_TERSEDIA`.
- **Siklus 2:**
  - `R08` aktif karena `STATUS_DATA_JAM = KOSONG`.
  - `R15` aktif karena `STATUS_FASILITAS = TIDAK_LENGKAP`, `STATUS_DATA_JAM = KOSONG`, dan `STATUS_DATA_BMKG = TIDAK_VALID`.
  - *Catatan:* `R11` tidak aktif meskipun `CURAH_HUJAN_MM = 30` dan `PERINGATAN_DINI = TIDAK_ADA`, karena `STATUS_DATA_BMKG` bernilai `TIDAK_VALID`.
- **Siklus 3:** Tidak ada aturan baru yang terpenuhi, proses inferensi berhenti.

#### 4. Fakta Turunan yang Dihasilkan
| Kode | Nama Fakta Turunan | Nilai Hasil |
|---|---|---|
| `D01` | `STATUS_FASILITAS` | `TIDAK_LENGKAP` |
| `D02` | `STATUS_DATA_JAM` | `KOSONG` |
| `D03` | `STATUS_OPERASIONAL` | `TIDAK_DIKETAHUI` |
| `D04` | `STATUS_DATA_BMKG` | `TIDAK_VALID` |
| `D05` | `LEVEL_CUACA` | `TIDAK_DIKETAHUI` |
| `D06` | `TAMPIL_PERINGATAN` | `INFO_TIDAK_TERSEDIA` |
| `D07` | `KEPUTUSAN_KONTEN` | `PERLU_UPDATE` |

#### 5. Output JSON
```json
{
  "destinasi": "Air Terjun Tumpak Sewu",
  "status_fasilitas": "TIDAK_LENGKAP",
  "status_data_jam": "KOSONG",
  "status_operasional": "TIDAK_DIKETAHUI",
  "status_data_bmkg": "TIDAK_VALID",
  "level_cuaca": "TIDAK_DIKETAHUI",
  "tampil_peringatan": "INFO_TIDAK_TERSEDIA",
  "keputusan_konten": "PERLU_UPDATE",
  "aturan_aktif": ["R02", "R03", "R09", "R08", "R15"]
}
```

#### 6. Interpretasi Hasil Pengujian
Sistem menolak penayangan konten dan mengeluarkan keputusan **`PERLU_UPDATE`** karena ketiga komponen mengalami kekurangan (fasilitas ibadah kosong, jam tutup kosong, dan data BMKG berusia 15 jam melewati batas 12 jam). Sistem juga tidak menebak status buka/tutup (`TIDAK_DIKETAHUI`) maupun menganggap data cuaca kedaluwarsa sebagai kondisi `NORMAL`.

---

### Skenario 3: Data Fasilitas dan Jam Lengkap, Terdapat Peringatan Cuaca Ekstrem

#### 1. Data Input
| Kode | Nama Fakta | Nilai Input |
|---|---|---|
| `F01` | `NAMA_DESTINASI` | `"Kawah Putih Ciwidey"` |
| `F02` | `FASILITAS_TOILET` | `"TERSEDIA"` |
| `F03` | `FASILITAS_PARKIR` | `"TERSEDIA"` |
| `F04` | `FASILITAS_IBADAH` | `"TERSEDIA"` |
| `F05` | `FASILITAS_MAKAN` | `"TERSEDIA"` |
| `F06` | `JAM_BUKA` | `"07:00"` |
| `F07` | `JAM_TUTUP` | `"17:00"` |
| `F08` | `HARI_LIBUR` | `false` |
| `F09` | `JAM_SEKARANG` | `"13:15"` |
| `F10` | `BMKG_TERSEDIA` | `true` |
| `F11` | `BMKG_USIA_JAM` | `1` |
| `F12` | `CURAH_HUJAN_MM` | `120` |
| `F13` | `PERINGATAN_DINI` | `"SIAGA"` |

#### 2. Aturan yang Aktif
`R01`, `R05`, `R10`, `R06`, `R13`, `R14` (6 dari 15 aturan).

#### 3. Urutan Proses Inferensi
- **Siklus 1:**
  - `R01` aktif (`STATUS_FASILITAS = LENGKAP`).
  - `R05` aktif (`STATUS_DATA_JAM = VALID`).
  - `R10` aktif karena `BMKG_TERSEDIA = true` dan `BMKG_USIA_JAM = 1 <= 12` (`STATUS_DATA_BMKG = VALID`).
- **Siklus 2:**
  - `R06` aktif karena `13:15` berada dalam rentang `07:00`–`17:00` pada hari non-libur (`STATUS_OPERASIONAL = BUKA`).
  - `R13` aktif karena `STATUS_DATA_BMKG = VALID` dan syarat ekstrem terpenuhi baik dari `PERINGATAN_DINI = SIAGA` maupun `CURAH_HUJAN_MM = 120 >= 100`.
  - `R14` aktif karena ketiga syarat validitas data (`D01 = LENGKAP`, `D02 = VALID`, `D04 = VALID`) terpenuhi.
- **Siklus 3:** Tidak ada aturan baru yang terpenuhi, proses inferensi berhenti.

#### 4. Fakta Turunan yang Dihasilkan
| Kode | Nama Fakta Turunan | Nilai Hasil |
|---|---|---|
| `D01` | `STATUS_FASILITAS` | `LENGKAP` |
| `D02` | `STATUS_DATA_JAM` | `VALID` |
| `D03` | `STATUS_OPERASIONAL` | `BUKA` |
| `D04` | `STATUS_DATA_BMKG` | `VALID` |
| `D05` | `LEVEL_CUACA` | `EKSTREM` |
| `D06` | `TAMPIL_PERINGATAN` | `EKSTREM` |
| `D07` | `KEPUTUSAN_KONTEN` | `SIAP_TAYANG` |

#### 5. Output JSON
```json
{
  "destinasi": "Kawah Putih Ciwidey",
  "status_fasilitas": "LENGKAP",
  "status_data_jam": "VALID",
  "status_operasional": "BUKA",
  "status_data_bmkg": "VALID",
  "level_cuaca": "EKSTREM",
  "tampil_peringatan": "EKSTREM",
  "keputusan_konten": "SIAP_TAYANG",
  "aturan_aktif": ["R01", "R05", "R10", "R06", "R13", "R14"]
}
```

#### 6. Interpretasi Hasil Pengujian
Meskipun terdapat peringatan dini `SIAGA` dan curah hujan ekstrem `120` mm/hari, keputusan konten tetap **`SIAP_TAYANG`**. Hal ini membuktikan bahwa peringatan cuaca ekstrem tidak menurunkan konten, melainkan memicu tampilan *banner* keselamatan (`TAMPIL_PERINGATAN = EKSTREM`) agar wisatawan tetap mendapat informasi risiko sebelum berkunjung.

### Ringkasan Perbandingan (Termasuk Uji Pembeda Status Tutup)

Apabila Skenario 1 dijalankan pada pukul `19:00` (`JAM_SEKARANG >= JAM_TUTUP`), aturan `R07` aktif menggantikan `R06` sehingga `STATUS_OPERASIONAL = TUTUP`, namun `R14` tetap menghasilkan **`SIAP_TAYANG`**.

| Aspek | Skenario 1 | Skenario 2 | Skenario 3 | Uji Pembeda (`19:00`) |
|---|---|---|---|---|
| Destinasi | Pantai Pandawa | Air Terjun Tumpak Sewu | Kawah Putih Ciwidey | Pantai Pandawa |
| `STATUS_OPERASIONAL` | `BUKA` | `TIDAK_DIKETAHUI` | `BUKA` | `TUTUP` |
| `LEVEL_CUACA` | `NORMAL` | `TIDAK_DIKETAHUI` | `EKSTREM` | `NORMAL` |
| `TAMPIL_PERINGATAN` | `TIDAK` | `INFO_TIDAK_TERSEDIA` | `EKSTREM` | `TIDAK` |
| **`KEPUTUSAN_KONTEN`** | **`SIAP_TAYANG`** | **`PERLU_UPDATE`** | **`SIAP_TAYANG`** | **`SIAP_TAYANG`** |

## 2. Kesimpulan dan Batasan

### Kesimpulan
1. **Fungsi Knowledge Base:** Menstandarkan penilaian kelayakan konten detail destinasi menjadi 15 aturan IF–THEN berbasis *Forward Chaining* untuk menghasilkan keputusan **`SIAP_TAYANG`** atau **`PERLU_UPDATE`** secara transparan dan konsisten.
2. **Perbedaan `SIAP_TAYANG` dan Status `BUKA`/`TUTUP`:** `SIAP_TAYANG` menilai kelengkapan serta validitas data halaman destinasi, sedangkan `BUKA`/`TUTUP` hanya memberi informasi operasional saat pemeriksaan berlangsung. Destinasi yang sedang tutup tetap layak tayang.
3. **Peringatan Cuaca Ekstrem Tidak Mengubah Keputusan Konten:** Kondisi `EKSTREM` (`R13`) mengaktifkan *banner* peringatan keselamatan tanpa mengubah `KEPUTUSAN_KONTEN` menjadi `PERLU_UPDATE`, agar wisatawan tetap memperoleh informasi peringatan risiko.

### Batasan Sistem dan Asumsi
- **Sumber dan Siklus Pembaruan BMKG:** Data prakiraan cuaca diambil dari API publik BMKG (`api.bmkg.go.id/publik/prakiraan-cuaca?adm4=...`) yang diperbarui 2 kali sehari (~12 jam), sehingga batas usia data valid ditetapkan `<= 12` jam. Wajib mencantumkan BMKG sebagai sumber data pada tampilan aplikasi.
- **Peringatan Dini Cuaca:** Endpoint `prakiraan-cuaca` tidak menyertakan level peringatan dini (`WASPADA`/`SIAGA`/`AWAS`), sehingga secara *default* adapter mengisi `TIDAK_ADA` sampai dihubungkan ke kanal peringatan dini BMKG terpisah.
- **Ambang Curah Hujan:** Batas hujan waspada (`>= 50` mm/hari) dan ekstrem (`>= 100` mm/hari) merupakan kebijakan ambang internal sistem.
- **Jam Operasional Lintas Hari dan 24 Jam:** Aturan validasi jam (`R04`–`R05`) mengasumsikan jam buka lebih awal dari jam tutup pada hari yang sama (WIB).
- **Cakupan Fasilitas:** Pemeriksaan kelengkapan difokuskan pada empat fasilitas inti (`TOILET`, `PARKIR`, `IBADAH`, `MAKAN`).