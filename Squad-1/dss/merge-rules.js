// Menggabungkan rules-roro.json + rules-anastasya.json menjadi rules.json (format P11).
// Urutan penting: R1–R7 dulu, lalu R8–R14 (kesimpulan antara harus muncul sebelum yang memakainya).
// Jalankan: node merge-rules.js
const fs = require('fs');
const merged = [...require('./rules-roro.json'), ...require('./rules-anastasya.json')];
const ids = merged.map(r => r.id);
if (new Set(ids).size !== ids.length) { console.error('ID aturan dobel:', ids); process.exit(1); }
fs.writeFileSync('./rules.json', JSON.stringify(merged, null, 2) + '\n');
console.log(`rules.json dibuat: ${merged.length} aturan (${ids[0]}–${ids[ids.length - 1]})`);
