// Data awal (seed) aplikasi KPI NusantaraGo
// Sumber: ps (5).xls (daftar tim/kelas) + blueprint_pengembangan_aplikasi_wisata_nusantarago.md
"use strict";

const ATT_BASE_TOTAL_DAYS = 20; // periode dasar kehadiran dari data kelas

// 27 anggota tim dari file ps (5).xls (Id kampus = Campus ID di file)
const RAW_MEMBERS = [
  ["202404560008", "ALBERTUS CHANDRA HALIM", 100],
  ["202404560040", "ALOYSIA CARLA PUTRI HARYADI", 100],
  ["202404560037", "ANASTASYA GEOVANI MANURUNG", 100],
  ["202404560045", "BINTANG NEERA", 100],
  ["202404560021", "BRIGID PAULINE RATU PATTY DIAZ", 100],
  ["202204560032", "CAESAR GATTACA", 88],
  ["202404560019", "CORNELIUS DICHO DHARMAWAN", 100],
  ["202404560005", "EDWARD ANTONIO HERLAMBANG HUTAURUK", 100],
  ["202404560009", "EZEKIEL MATHEO BARUS", 100],
  ["202404560029", "FRANS NICHOLAS RAFAEL", 100],
  ["202404560020", "GABRIELLA LAVIGNE PINK", 100],
  ["202404560049", "GEORGE BLACIANO KUNEMARA PUTRA", 100],
  ["202404560052", "HESEKIEL ANDHIKA NAINGGOLAN", 100],
  ["202404560039", "IMANUEL JULIVAL LUMBAN GAOL", 100],
  ["202404560050", "JESSICA HILLARY HUTAHAEAN", 100],
  ["202404560023", "JO SUK SIN", 100],
  ["202404560035", "JOEL OKTAVIANUS", 100],
  ["202404560027", "JOSUE FREITAS DA COSTA", 100],
  ["202404560033", "LINDA WATI PURBA", 100],
  ["202404560001", "MICHAEL DEVON EKA PUTRA", 100],
  ["202404560028", "ODA KARTIKA NURINGTYASANTI", 100],
  ["202404560036", "RADEN RORO ANINDYA ANGGITOPUTRI", 100],
  ["202404560054", "RAFAEL ELANO PRASETYA", 100],
  ["202204560029", "SYRILLYA CHANTIKA VALENTINA SITOHANG", 88],
  ["202404560017", "THEODOMIRO FIDELIO TOMASOA", 100],
  ["202404560025", "VICENTIUS ELANG KRISNANTO", 100],
  ["202404560051", "YOSEP HERMAWAN", 88],
];

// Kapasitas per disiplin mengikuti kebutuhan blueprint (total 27 orang)
const ROLE_CAPACITY = { backend: 5, frontend: 5, mobile: 5, uiux: 4, qa: 4, data: 4 };

function titleCase(s) {
  return s
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// Distribusi peran otomatis: timer sisa kapasitas, prioritas urut, agar
// setiap siklus 6 orang mencakup semua disiplin (BE, FE, Mobile, UI, QA, Data).
function buildRoles(n) {
  const remaining = { ...ROLE_CAPACITY };
  const out = [];
  for (let i = 0; i < n; i++) {
    let best = null;
    for (const role of Object.keys(ROLE_CAPACITY)) {
      if (remaining[role] > 0 && (!best || remaining[role] > remaining[best])) best = role;
    }
    remaining[best]--;
    out.push(best);
  }
  return out;
}

function buildMembers() {
  const roles = buildRoles(RAW_MEMBERS.length);
  return RAW_MEMBERS.map(([campusId, name, attPct], i) => ({
    id: "m" + String(i + 1).padStart(2, "0"),
    campusId,
    name: titleCase(name),
    role: roles[i],
    studentId: "S" + String(i + 1).padStart(3, "0"),
    attPct, // kehadiran awal dari data kelas
  }));
}

// Tugas kerja diambil dari Modul 1–6 & Peta Jalan (Fase 1–4) pada blueprint.
// offsetWk = estimasi tenggat (minggu) sejak tanggal mulai proyek.
const RAW_TASKS = [
  // ---------- FASE 1: Fondasi & Direktori Wisata (Bulan 1-2) ----------
  ["F1-01", 1, "Rancang UI/UX (Figma): wireframe & design system", ["uiux", "frontend"], 8, 2],
  ["F1-02", 1, "Setup repo, CI/CD & struktur Modular Monolith", ["data", "backend"], 5, 2],
  ["F1-03", 1, "Desain arsitektur & skema database (PostgreSQL + PostGIS)", ["backend", "data"], 8, 3],
  ["F1-04", 1, "API dasar & autentikasi (role tourist/partner/guide/admin)", ["backend"], 8, 4],
  ["F1-05", 1, "Setup Redis & index pencarian (Elasticsearch)", ["data", "backend"], 5, 4],
  ["F1-06", 1, "Pencarian geospasial & filter multi-dimensi direktori", ["backend"], 13, 6],
  ["F1-07", 1, "Halaman detail destinasi komprehensif (web)", ["frontend"], 8, 6],
  ["F1-08", 1, "Peta interaktif + clustering pin (web & mobile)", ["frontend", "mobile"], 8, 7],
  ["F1-09", 1, "Alur kontributor publik pendaftaran destinasi (geotag & poin)", ["mobile", "backend"], 8, 7],
  ["F1-10", 1, "Dashboard kurasi admin & moderasi berjenjang (dedup Haversine)", ["backend", "frontend"], 13, 8],
  ["F1-11", 1, "Data seeding destinasi utama 38 provinsi", ["data"], 5, 8],
  // ---------- FASE 2: Portal Mitra & Manajemen Paket (Bulan 3-4) ----------
  ["F2-01", 2, "Dashboard mitra & onboarding KYC/KYB", ["backend", "frontend"], 13, 10],
  ["F2-02", 2, "Tour Package Builder (open/private trip, itinerary harian)", ["backend", "mobile"], 13, 12],
  ["F2-03", 2, "Dynamic pricing bertingkat & kuota per tanggal", ["backend"], 8, 13],
  ["F2-04", 2, "E-Ticketing & QR code tiket masuk", ["backend", "mobile"], 8, 14],
  ["F2-05", 2, "Integrasi Payment Gateway (Midtrans/Xendit + webhook)", ["backend"], 13, 15],
  ["F2-06", 2, "Escrow ledger & split payment ke mitra", ["backend"], 8, 16],
  ["F2-07", 2, "UI pembuatan & pencarian paket wisata", ["frontend", "uiux"], 8, 16],
  ["F2-08", 2, "QA regresi modul mitra & transaksi", ["qa"], 5, 17],
  // ---------- FASE 3: Transportasi & Akomodasi (Bulan 5-6) ----------
  ["F3-01", 3, "Extranet akomodasi lokal (PMS sederhana & kalender kamar)", ["backend", "frontend"], 13, 19],
  ["F3-02", 3, "Integrasi API hotel komersial (agregator perhotelan)", ["backend"], 8, 20],
  ["F3-03", 3, "Radius mapping penginapan sekitar destinasi", ["backend", "frontend"], 5, 21],
  ["F3-04", 3, "Marketplace transportasi lokal (rental, kapal, jeep)", ["backend", "frontend"], 13, 22],
  ["F3-05", 3, "Agregator transportasi antarkota (KAI, Pelni, bus AKAP)", ["backend"], 13, 23],
  ["F3-06", 3, "Estimasi rute multi-moda (first-mile to last-mile)", ["mobile", "frontend"], 8, 23],
  ["F3-07", 3, "Custom bundling cart: destinasi + hotel + transport", ["frontend", "backend"], 13, 24],
  ["F3-08", 3, "QA regresi modul transportasi & akomodasi", ["qa"], 5, 25],
  // ---------- FASE 4: Fitur Cerdas, Pengujian & Peluncuran (Bulan 7-8) ----------
  ["F4-01", 4, "AI Smart Itinerary Planner", ["backend", "data"], 13, 27],
  ["F4-02", 4, "Mode peta offline per wilayah (blank spot)", ["mobile"], 8, 27],
  ["F4-03", 4, "Fitur SOS darurat & notifikasi BMKG/BNPB", ["mobile", "backend"], 8, 28],
  ["F4-04", 4, "Direktori kuliner, UMKM & kalender event budaya", ["frontend", "backend"], 8, 29],
  ["F4-05", 4, "Sistem ulasan & rating destinasi", ["backend", "frontend"], 8, 30],
  ["F4-06", 4, "Sistem komisi & program afiliasi", ["backend"], 5, 31],
  ["F4-07", 4, "Load testing & penetration testing", ["qa", "data"], 8, 31],
  ["F4-08", 4, "Beta testing desa wisata percontohan & perbaikan", ["qa"], 5, 32],
  ["F4-09", 4, "Rilis Play Store, App Store & Web", ["data", "frontend"], 5, 33],
];

function buildTasks(members) {
  // Antrean penugasan per peran (round-robin sesuai urutan anggota)
  const queue = {};
  for (const m of members) (queue[m.role] ||= []).push(m);
  const cursor = Object.fromEntries(Object.keys(queue).map((r) => [r, 0]));
  const next = (role) => {
    const list = queue[role] || [];
    if (!list.length) return null;
    const m = list[cursor[role] % list.length];
    cursor[role]++;
    return m.id;
  };

  // Status demo awal: sebagian kecil tugas Fase 1 sudah berjalan agar
  // dashboard tidak kosong; sisanya "todo" untuk diupdate tim.
  const initial = {
    "F1-01": { status: "done", reviewScore: 90 },
    "F1-03": { status: "done", reviewScore: 88 },
    "F1-02": { status: "in_progress" },
    "F1-04": { status: "in_progress" },
  };

  return RAW_TASKS.map(([code, phase, title, roles, weight, offsetWk]) => {
    const assignees = [];
    const p = next(roles[0]);
    if (p) assignees.push(p);
    if (roles[1]) {
      const s = next(roles[1]);
      if (s && s !== p) assignees.push(s);
    }
    const ini = initial[code];
    return {
      id: code.toLowerCase(),
      code,
      phase,
      title,
      roles,
      weight,
      dueDate: addDaysISO(PROJECT_START, offsetWk * 7 - 2),
      offsetWk,
      assignees,
      status: ini ? ini.status : "todo",
      reviewScore: (ini && ini.reviewScore) || null,
      completedAt:
        ini && ini.status === "done" ? addDaysISO(PROJECT_START, offsetWk * 7 - 5) : null,
    };
  });
}

const PROJECT_START = "2026-11-02"; // Senin mulai proyek (dapat diubah di aplikasi)

function addDaysISO(iso, days) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function buildAttendance(members) {
  const period = { id: "baseline", name: "Baseline kelas (data ps.xls)", startDate: null };
  const entries = members.map((m) => ({
    memberId: m.id,
    periodId: "baseline",
    present: Math.round((ATT_BASE_TOTAL_DAYS * m.attPct) / 100 * 10) / 10,
    total: ATT_BASE_TOTAL_DAYS,
    note: "Kehadiran kelas dari data ps (5).xls",
  }));
  return { periods: [period], entries };
}

function buildSeed() {
  const members = buildMembers();
  return {
    settings: { projectName: "NusantaraGo", startDate: PROJECT_START },
    members,
    tasks: buildTasks(members),
    attendance: buildAttendance(members),
  };
}

module.exports = { buildSeed };
