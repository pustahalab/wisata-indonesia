# Sprint 2 - Squad 5: Elasticsearch Search

**Issue:** #10 Pengindeksan Pencarian Cepat Elasticsearch & Worker Kompresi WebP (BullMQ)  
**Scope ini:** Hanya bagian Elasticsearch full-text search.

## Struktur

```
sprint-2/
└── services/
    └── api-core/
        ├── package.json
        ├── src/
        │   ├── app.js
        │   ├── server.js
        │   ├── controllers/search.controller.js
        │   ├── routes/search.routes.js
        │   ├── utils/es.client.js
        │   └── data/destinations.mock.js
        └── scripts/
            └── seed-elasticsearch.js
```

## Endpoint

`GET /api/v1/search?q=bali&category=Pantai&province_id=1&page=1&size=20`

## Cara Menjalankan

1. Pastikan Elasticsearch berjalan di `http://localhost:9200` (atau atur `ELASTICSEARCH_URL` di `.env`).
2. Install dependensi:

   ```bash
   npm install
   ```

3. Index data dummy:

   ```bash
   npm run seed
   ```

4. Jalankan server:

   ```bash
   npm start
   ```

5. Coba pencarian:

   ```bash
   curl "http://localhost:3001/api/v1/search?q=borobudur"
   ```

## Catatan

- Hanya dokumen dengan `status: 'approved'` yang muncul dalam hasil pencarian.
- Pencarian menggunakan `multi_match` dengan fuzziness `AUTO` agar toleran terhadap typo (mis. "borobudur" vs "borobudor").
- Hasil diurutkan berdasarkan `rating_avg` secara menurun.
