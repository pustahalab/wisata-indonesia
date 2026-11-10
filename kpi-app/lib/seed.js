// Data awal (seed) aplikasi KPI NusantaraGo
// Sumber: ps (5).xls (daftar tim/kelas), team.xlsx (pembagian kelompok & lead),
//         blueprint_pengembangan_aplikasi_wisata_nusantarago.md (rencana kerja)
"use strict";

const PROJECT_START = "2026-11-02"; // Senin mulai proyek (dapat diubah di aplikasi)

// Pembagian kelompok & Lead dari team.xlsx, sheet "Sistem Pendukung Keputusan"
// (satu-satunya sheet yang mencakup tepat 27 anggota tim proyek ini).
const RAW_MEMBERS = [
  ["202404560008", "ALBERTUS CHANDRA HALIM"],
  ["202404560025", "ALOYSIA CARLA PUTRI HARYADI"],
  ["202404560037", "ANASTASYA GEOVANI MANURUNG"],
  ["202404560045", "BINTANG NEERA"],
  ["202404560021", "BRIGID PAULINE RATU PATTY DIAZ"],
  ["202204560032", "CAESAR GATTACA"],
  ["202404560019", "CORNELIUS DICHO DHARMAWAN"],
  ["202404560005", "EDWARD ANTONIO HERLAMBANG HUTAURUK"],
  ["202404560009", "EZEKIEL MATHEO BARUS"],
  ["202404560029", "FRANS NICHOLAS RAFAEL"],
  ["202404560020", "GABRIELLA LAVIGNE PINK"],
  ["202404560049", "GEORGE BLACIANO KUNEMARA PUTRA"],
  ["202404560052", "HESEKIEL ANDHIKA NAINGGOLAN"],
  ["202404560039", "IMANUEL JULIVAL LUMBAN GAOL"],
  ["202404560050", "JESSICA HILLARY HUTAHAEAN"],
  ["202404560023", "JO SUK SIN"],
  ["202404560035", "JOEL OKTAVIANUS"],
  ["202404560027", "JOSUE FREITAS DA COSTA"],
  ["202404560033", "LINDA WATI PURBA"],
  ["202404560001", "MICHAEL DEVON EKA PUTRA"],
  ["202404560028", "ODA KARTIKA NURINGTYASANTI"],
  ["202404560036", "RADEN RORO ANINDYA ANGGITOPUTRI"],
  ["202404560054", "RAFAEL ELANO PRASETYA"],
  ["202204560029", "SYRILLYA CHANTIKA VALENTINA SITOHANG"],
  ["202404560017", "THEODOMIRO FIDELIO TOMASOA"],
  ["202404560025a", "VICENTIUS ELANG KRISNANTO"],
  ["202404560051", "YOSEP HERMAWAN"],
];

// [lead, ...anggota] — urutan sesuai sheet Excel (kolom Lead + kolom Nama Mahasiswa)
const KELOMPOKS = [
  { id: "k1", name: "Kelompok 1", lead: "ODA KARTIKA NURINGTYASANTI", members: ["LINDA WATI PURBA", "RADEN RORO ANINDYA ANGGITOPUTRI", "ODA KARTIKA NURINGTYASANTI", "ANASTASYA GEOVANI MANURUNG", "CORNELIUS DICHO DHARMAWAN"] },
  { id: "k2", name: "Kelompok 2", lead: "GABRIELLA LAVIGNE PINK", members: ["EDWARD ANTONIO HERLAMBANG HUTAURUK", "GABRIELLA LAVIGNE PINK", "BRIGID PAULINE RATU PATTY DIAZ", "JO SUK SIN", "ALOYSIA CARLA PUTRI HARYADI"] },
  { id: "k3", name: "Kelompok 3", lead: "JESSICA HILLARY HUTAHAEAN", members: ["JOEL OKTAVIANUS", "BINTANG NEERA", "VICENTIUS ELANG KRISNANTO", "ALBERTUS CHANDRA HALIM", "JESSICA HILLARY HUTAHAEAN"] },
  { id: "k4", name: "Kelompok 4", lead: "HESEKIEL ANDHIKA NAINGGOLAN", members: ["HESEKIEL ANDHIKA NAINGGOLAN", "JOSUE FREITAS DA COSTA", "SYRILLYA CHANTIKA VALENTINA SITOHANG", "FRANS NICHOLAS RAFAEL", "THEODOMIRO FIDELIO TOMASOA", "CAESAR GATTACA", "YOSEP HERMAWAN"] },
  { id: "k5", name: "Kelompok 5", lead: "GEORGE BLACIANO KUNEMARA PUTRA", members: ["RAFAEL ELANO PRASETYA", "EZEKIEL MATHEO BARUS", "MICHAEL DEVON EKA PUTRA", "IMANUEL JULIVAL LUMBAN GAOL", "GEORGE BLACIANO KUNEMARA PUTRA"] },
];

const ATT_BASE_TOTAL_DAYS = 20; // periode dasar kehadiran dari data kelas

titleCase = (s) => s
  .toLowerCase()
  .split(/\s+/)
  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
  .join(" ");

// lookup id kampus per nama (dari ps.xls). Perbaiki ketidakcocokan ejaan.
const CAMPUS = Object.fromEntries(RAW_MEMBERS.map(([id, name]) => [name, id]));

function buildMembers() {
  const out = [];
  let n = 0;
  for (const k of KELOMPOKS) {
    for (const rawName of k.members) {
      n++;
      const isLead = k.lead === rawName;
      // Vicentius di sheet 2 tertulis "Vincentius" — samakan dengan data kelas
      const cId = CAMPUS[rawName] || CAMPUS[rawName.replace("VICENTIUS", "VINCENTIUS")] || "-";
      out.push({
        id: "m" + String(n).padStart(2, "0"),
 campusId: cId,
        name: titleCase(rawName),
        kelompokId: k.id,
        isLead,
      });
    }
  }
  return out;
}

// Tugas kerja diambil dari Modul 1–6 & Peta Jalan (Fase 1–4) pada blueprint.
// offsetWk = estimasi tenggat (minggu) sejak tanggal mulai proyek.
const RAW_TASKS = [
  // ---------- FASE 1: Fondasi & Direktori Wisata (Bulan 1-2) ----------
  ["F1-01", 1, "Rancang UI/UX (Figma): wireframe & design system", 8, 2],
  ["F1-02", 1, "Setup repo, CI/CD & struktur Modular Monolith", 5, 2],
  ["F1-03", 1, "Desain arsitektur & skema database (PostgreSQL + PostGIS)", 8, 3],
  ["F1-04", 1, "API dasar & autentikasi (role tourist/partner/guide/admin)", 8, 4],
  ["F1-05", 1, "Setup Redis & index pencarian (Elasticsearch)", 5, 4],
  ["F1-06", 1, "Pencarian geospasial & filter multi-dimensi direktori", 13, 6],
  ["F1-07", 1, "Halaman detail destinasi komprehensif (web)", 8, 6],
  ["F1-08", 1, "Peta interaktif + clustering pin (web & mobile)", 8, 7],
  ["F1-09", 1, "Alur kontributor publik pendaftaran destinasi (geotag & poin)", 8, 7],
  ["F1-10", 1, "Dashboard kurasi admin & moderasi berjenjang (dedup Haversine)", 13, 8],
  ["F1-11", 1, "Data seeding destinasi utama 38 provinsi", 5, 8],
  // ---------- FASE 2: Portal Mitra & Manajemen Paket (Bulan 3-4) ----------
  ["F2-01", 2, "Dashboard mitra & onboarding KYC/KYB", 13, 10],
  ["F2-02", 2, "Tour Package Builder (open/private trip, itinerary harian)", 13, 12],
  ["F2-03", 2, "Dynamic pricing bertingkat & kuota per tanggal", 8, 13],
  ["F2-04", 2, "E-Ticketing & QR code tiket masuk", 8, 14],
  ["F2-05", 2, "Integrasi Payment Gateway (Midtrans/Xendit + webhook)", 13, 15],
  ["F2-06", 2, "Escrow ledger & split payment ke mitra", 8, 16],
  ["F2-07", 2, "UI pembuatan & pencarian paket wisata", 8, 16],
  ["F2-08", 2, "QA regresi modul mitra & transaksi", 5, 17],
  // ---------- FASE 3: Transportasi & Akomodasi (Bulan 5-6) ----------
  ["F3-01", 3, "Extranet akomodasi lokal (PMS sederhana & kalender kamar)", 13, 19],
  ["F3-02", 3, "Integrasi API hotel komersial (agregator perhotelan)", 8, 20],
  ["F3-03", 3, "Radius mapping penginapan sekitar destinasi", 5, 21],
  ["F3-04", 3, "Marketplace transportasi lokal (rental, kapal, jeep)", 13, 22],
  ["F3-05", 3, "Agregator transportasi antarkota (KAI, Pelni, bus AKAP)", 13, 23],
  ["F3-06", 3, "Estimasi rute multi-moda (first-mile to last-mile)", 8, 23],
  ["F3-07", 3, "Custom bundling cart: destinasi + hotel + transport", 13, 24],
  ["F3-08", 3, "QA regresi modul transportasi & akomodasi", 5, 25],
  // ---------- FASE 4: Fitur Cerdas, Pengujian & Peluncuran (Bulan 7-8) ----------
  ["F4-01", 4, "AI Smart Itinerary Planner", 13, 27],
  ["F4-02", 4, "Mode peta offline per wilayah (blank spot)", 8, 27],
  ["F4-03", 4, "Fitur SOS darurat & notifikasi BMKG/BNPB", 8, 28],
  ["F4-04", 4, "Direktori kuliner, UMKM & kalender event budaya", 8, 29],
  ["F4-05", 4, "Sistem ulasan & rating destinasi", 8, 30],
  ["F4-06", 4, "Sistem komisi & program afiliasi", 5, 31],
  ["F4-07", 4, "Load testing & penetration testing", 8, 31],
  ["F4-08", 4, "Beta testing desa wisata percontohan & perbaikan", 5, 32],
  ["F4-09", 4, "Rilis Play Store, App Store & Web", 5, 33],
];

function addDaysISO(iso, days) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function buildTasks(members) {
  // Status demo awal: sebagian kecil tugas Fase 1 sudah berjalan agar
  // dashboard tidak kosong; sisanya "todo" untuk diupdate tim.
  const initial = {
    "F1-01": { status: "done", reviewScore: 90 },
    "F1-03": { status: "done", reviewScore: 88 },
    "F1-02": { status: "in_progress" },
    "F1-04": { status: "in_progress" },
  };

  // Penugasan per kelompok (dari team.xlsx): tugas dibagi round-robin ke
  // 5 kelompok sehingga tiap kelompok mendapat tugas dari semua fase.
  // Setiap tugas dikerjakan 2 anggota kelompok tersebut (round-robin);
  // taks pertama tiap kelompok diikuti Lead sebagai penggerak.
  const groups = KELOMPOKS.map((k) => ({
    ...k,
    rile: members.filter((m) => m.kelompokId === k.id),
  }));
  const cursor = Object.fromEntries(groups.map((g) => [g.id, 0]));
  const pick = (g, howMany) => {
    const list = g.mem.length ? g.mem : [];
    const out = [];
    for (let i = 0; i < howMany && list.length; i++) {
      out.push(list[cursor[g.id] % list.length].id);
      cursor[g.id]++;
    }
    return out;
  };

  const out = RAW_TASKS.map(([code, phase, title, weight, offsetWk], i) => {
    const g = groups[i % groups.length];
    let assignees = [];
    const ini = initial[code];
    if (!ini) {
      // penggerak: Lead di tugas pertama tiap kelompok, round-robin setelahnya
      const first = g.members[0];
      assignees = pick(g, 2);
      const second = assignees.find((a) => a !== first);
      assignees = first && second ? [first, second] : assignees;
    }
    return {
      id: code.toLowerCase(),
      code,
      phase,
      title,
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
  return out;
}

function buildSeed() {
  const members = buildMembers();
  return {
    settings: { projectName: "NusantaraGo", startDate: PROJECT_START },
    kelompoks: KELOMPOKS.map((k) => ({
      id: k.id, name: k.name, lead: titleCase(k.lead),
    })),
    members,
    tasks: buildTasks(members),
  };
}

module.exports = { buildSeed };
