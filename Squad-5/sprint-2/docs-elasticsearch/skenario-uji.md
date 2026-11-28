# 3 Skenario Uji — Elasticsearch Search Triage (Squad 5 · Sprint 2)

Setiap skenario mencantumkan fakta masukan, aturan yang nyala, dan hasil yang diharapkan.

---

## Skenario 1: Lalu lintas tinggi + Elasticsearch siap + typo dalam query

**Fakta Masukan:**
- `volume_query`: 1500 requests/detik
- `elasticsearch_tersedia`: true
- `query_mengandung_typo`: true (user mengetik "borobudor" alih-alih "borobudur")
- `category_ditentukan`: false
- `province_id_ditentukan`: false

**Aturan yang Nyala:**
1. `R_SEARCH_ES` — volume 1500 > 1000 dan ES tersedia → pencarian dipindah ke Elasticsearch
2. `R_SEARCH_FUZZY` — typo terdeteksi dan ES tersedia → aktifkan fuzziness AUTO
3. `R_SEARCH_RANK` — pencarian menggunakan ES → urutkan berdasarkan rating_avg

**Aturan yang Tidak Nyala:**
- `R_SEARCH_SQL` — ES tersedia, kondisi fallback tidak terpenuhi
- `R_SEARCH_FILTER` — tidak ada kategori atau provinsi yang dipilih
- `R_FALLBACK_CHAIN` — tidak menggunakan PostgreSQL

**Hasil yang Diharapkan:**
- Sistem menggunakan Elasticsearch untuk mencari "borobudor"
- Fuzziness AUTO tetap mengembalikan "Candi Borobudur" meski ada typo
- Hasil diurutkan rating tertinggi dulu
- Respons JSON mencakup `total`, `page`, `size`, dan `data`

---

## Skenario 2: Elasticsearch mati + volume sedang

**Fakta Masukan:**
- `volume_query`: 800 requests/detik
- `elasticsearch_tersedia`: false (klaster down)
- `query_mengandung_typo`: false
- `category_ditentukan`: true (user memilih "Pantai")
- `province_id_ditentukan`: true (provinsi Bali)

**Aturan yang Nyala:**
1. `R_SEARCH_SQL` — ES tidak tersedia → pencarian tetap pakai PostgreSQL
2. `R_FALLBACK_CHAIN` — pakai PostgreSQL dan volume 800 > 100 → aktifkan paginasi batasi hasil

**Aturan yang Tidak Nyala:**
- `R_SEARCH_ES` — ES tidak tersedia
- `R_SEARCH_FUZZY` — ES tidak tersedia, fitur ES-only
- `R_SEARCH_FILTER` — filter eksak adalah fitur ES-only dalam prototype ini
- `R_SEARCH_RANK` — tidak menggunakan ES

**Hasil yang Diharapkan:**
- Sistem fallback ke PostgreSQL (`ST_DWithin` atau `LIKE` pada kolom teks)
- Paginasi dibatasi agar database tidak overload
- Tidak ada fuzziness (typo tidak ditangani)
- Kategori/provinsi difilter lewat SQL standar, bukan Elasticsearch term query

---

## Skenario 3: Volume rendah + ES siap + filter kategori

**Fakta Masukan:**
- `volume_query`: 200 requests/detik
- `elasticsearch_tersedia`: true
- `query_mengandung_typo`: false
- `category_ditentukan`: true ("Candi")
- `province_id_ditentukan`: false

**Aturan yang Nyala:**
1. `R_SEARCH_SQL` — volume 200 <= 1000 → pencarian tetap pakai PostgreSQL (meski ES tersedia, volume rendah)
2. `R_FALLBACK_CHAIN` — volume 200 > 100 → aktifkan paginasi batasi hasil

**Aturan yang Tidak Nyala:**
- `R_SEARCH_ES` — volume 200 tidak melebihi ambang 1000
- `R_SEARCH_FUZZY` — tidak ada typo
- `R_SEARCH_FILTER` — filter kategori adalah fitur ES-only dalam prototype ini
- `R_SEARCH_RANK` — tidak menggunakan ES

**Hasil yang Diharapkan:**
- Sistem tetap menggunakan PostgreSQL karena volume rendah
- Hasil difilter kategori "Candi" via SQL
- Paginasi aktif untuk menceburi overload
- Tidak ada fitur canggih Elasticsearch (fuzziness, ranking otomatis)

---

## Catatan Pelaksanaan

Ketiga skenario di atas dapat diuji dengan memodifikasi fakta masukan di aplikasi klien atau langsung melalui parameter query pada endpoint:

```
GET /api/v1/search?q=borobudor&category=Pantai&province_id=1
```

Untuk skenario fallback (ES mati), matikan layanan Elasticsearch secara sementara dan ulangi permintaan pencarian untuk memastikan sistem tidak error tetapi tetap merespons melalui PostgreSQL.
