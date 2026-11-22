# Tabel Aturan — KB Triase Performa Pencarian (Squad 5 · Sprint 2)

Domain: Infrastruktur pencarian destinasi (Elasticsearch vs PostgreSQL)

| No | ID Aturan | IF (Kondisi / Fakta Masukan) | THEN (Kesimpulan / Aksi) | Prioritas | Keterangan |
|----|-----------|------------------------------|--------------------------|-----------|------------|
| 1 | R_SEARCH_ES | `volume_query > 1000/detik` AND `elasticsearch_tersedia = true` | `pencarian_dipindah_ke_elasticsearch = true` | Tinggi | Lalu lintas tinggi + ES siap → gunakan Elasticsearch |
| 2 | R_SEARCH_SQL | `volume_query <= 1000/detik` OR `elasticsearch_tersedia = false` | `pencarian_tetap_gunakan_postgresql = true` | Tinggi | Lalu lintas rendah atau ES mati → fallback ke PostgreSQL |
| 3 | R_SEARCH_FUZZY | `query_mengandung_typo = true` AND `elasticsearch_tersedia = true` | `aktifkan_fuzziness_auto = true` | Menengah | ES tangani typo dengan fuzziness AUTO |
| 4 | R_SEARCH_FILTER | `category_ditentukan = true` OR `province_id_ditentukan = true` | `terapkan_filter_eksak = true` | Menengah | Filter kategori/provinsi via term query |
| 5 | R_SEARCH_RANK | `pencarian_dipindah_ke_elasticsearch = true` | `urutkan_berdasarkan_rating_avg = true` | Rendah | Hasil ES diurutkan rating tertinggi dulu |
| 6 | R_FALLBACK_CHAIN | `pencarian_tetap_gunakan_postgresql = true` AND `volume_query > 100/detik` | `aktifkan_paginasi_batasi_hasil = true` | Menengah | PostgreSQL dibatasi agar tidak overload saat lalu lintas sedang |
