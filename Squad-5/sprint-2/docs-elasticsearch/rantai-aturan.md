# Rantai Aturan — Rule Chain (Squad 5 · Sprint 2 · Elasticsearch)

## Deskripsi Singkat

Rantai aturan menggambarkan bagaimana kesimpulan dari satu aturan menjadi fakta masukan (atau konteks) untuk aturan berikutnya dalam pencarian destinasi NusantaraGo. Semua aturan dievaluasi dengan strategi **forward chaining**: mulai dari fakta yang tersedia (volume query, ketersediaan Elasticsearch, dll.), mesin mencari aturan yang prasyaratnya terpenuhi, menyalakannya, dan menambahkan kesimpulannya ke memori kerja.

## Diagram Rantai

```
FAKTA AWAL
├── volume_query = 1500/detik
├── elasticsearch_tersedia = true
├── query_mengandung_typo = true
├── category_ditentukan = true
└── province_id_ditentukan = false
        │
        ▼
┌─────────────────────────────────────┐
│  R_SEARCH_ES (Prioritas: Tinggi)    │
│  IF volume_query > 1000 AND ES=true │
│  THEN pencarian_dipindah_ke_ES=true │
└─────────────────────────────────────┘
        │  (kesimpulan menjadi fakta baru)
        ▼
┌─────────────────────────────────────┐
│  R_SEARCH_RANK (Prioritas: Rendah)  │
│  IF pencarian_dipindah_ke_ES=true   │
│  THEN urutkan_berdasarkan_rating=true │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│  R_SEARCH_FUZZY (Prioritas: Men.)   │
│  IF typo=true AND ES=true           │
│  THEN aktifkan_fuzziness_auto=true  │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│  R_SEARCH_FILTER (Prioritas: Men.)  │
│  IF kategori/provinsi ditentukan    │
│  THEN terapkan_filter_eksak=true    │
└─────────────────────────────────────┘
        │
        ▼
HASIL AKHIR
├── Gunakan Elasticsearch untuk pencarian
├── Aktifkan fuzziness (toleran typo)
├── Terapkan filter kategori jika dipilih
├── Urutkan hasil berdasarkan rating_avg
└── Respons dikirim ke klien
```

## Rantai Alternatif (Fallback)

Jika `elasticsearch_tersedia = false`:

```
FAKTA AWAL
├── volume_query = 800/detik
└── elasticsearch_tersedia = false
        │
        ▼
┌─────────────────────────────────────┐
│  R_SEARCH_SQL (Prioritas: Tinggi)   │
│  IF ES=false                        │
│  THEN pencarian_tetap_gunakan_PG=true │
└─────────────────────────────────────┘
        │
        ▼ (karena volume_query > 100)
┌─────────────────────────────────────┐
│  R_FALLBACK_CHAIN (Prioritas: Men.) │
│  IF PG=true AND volume_query > 100  │
│  THEN aktifkan_paginasi_batasi=true │
└─────────────────────────────────────┘
        │
        ▼
HASIL AKHIR
├── Tetap gunakan PostgreSQL
├── Aktifkan paginasi terbatas (hindari overload)
└── Tidak ada fuzziness / filter eksak ES
```

## Catatan

- Kesimpulan `pencarian_dipindah_ke_elasticsearch` dari **R_SEARCH_ES** menjadi prasyarat implisit untuk **R_SEARCH_RANK**.
- Jika **R_SEARCH_SQL** nyala (ES mati), **R_SEARCH_FUZZY** dan **R_SEARCH_FILTER** tidak relevan karena fitur itu spesifik Elasticsearch.
- Prioritas digunakan untuk menentukan urutan penjelasan, bukan untuk menghentikan rantai (tidak ada aturan "stop" dalam prototype ini).
