/*
 * Salin file ini menjadi config.js lalu isi API key Anda:
 *     cp config.example.js config.js
 * config.js sudah masuk .gitignore -- jangan pernah di-commit.
 *
 * Google Cloud Console yang diperlukan:
 *   1. Aktifkan billing pada project.
 *   2. Aktifkan API:  "Maps JavaScript API"  dan  "Distance Matrix API".
 *      (Distance Matrix API berstatus Legacy; project baru mungkin tidak bisa
 *       mengaktifkannya -> lihat docs/README_PENGUJIAN.md bagian Catatan.)
 *   3. Credentials > API key > Application restrictions: "Websites (HTTP referrers)"
 *      mis. http://localhost:8080/*  dan domain produksi.
 *   4. API restrictions: batasi hanya ke dua API di atas.
 */
window.APP_CONFIG = {
    GOOGLE_MAPS_API_KEY: "ISI_API_KEY_ANDA_DI_SINI"
};
