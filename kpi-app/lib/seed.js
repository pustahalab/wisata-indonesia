// Data awal (seed) aplikasi KPI NusantaraGo
// Sumber: ps (5).xls (27 anggota + ID kampus), team.xlsx (5 squad & lead),
//         docs/roadmap_pengembangan_nusantarago_deadline_22_desember_2026.md
//         (6 sprint mingguan, 40 issue #1–#40 per squad)
"use strict";

const PROJECT_START = "2026-11-10";
const TARGET_END = "2026-12-22";

// Daftar 27 anggota + ID kampus dari ps (5).xls
const RAW_MEMBERS = [
  ["202404560008", "ALBERTUS CHANDRA HALIM"],
  ["202404560040", "ALOYSIA CARLA PUTRI HARYADI"],
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
  ["202404560025", "VICENTIUS ELANG KRISNANTO"],
  ["202404560051", "YOSEP HERMAWAN"],
];

// 5 Squad & Lead dari team.xlsx + README (tema domain blueprint)
const KELOMPOKS = [
  { id: "k1", name: "Squad 1: Direktori Wisata, GIS & Crowdsourcing", short: "Squad 1", members: ["ODA KARTIKA NURINGTYASANTI", "LINDA WATI PURBA", "RADEN RORO ANINDYA ANGGITOPUTRI", "ANASTASYA GEOVANI MANURUNG", "CORNELIUS DICHO DHARMAWAN"] },
  { id: "k2", name: "Squad 2: Mitra Pengelola (KYC), Legalitas & E-Ticketing", short: "Squad 2", members: ["GABRIELLA LAVIGNE PINK", "EDWARD ANTONIO HERLAMBANG HUTAURUK", "BRIGID PAULINE RATU PATTY DIAZ", "JO SUK SIN", "ALOYSIA CARLA PUTRI HARYADI"] },
  { id: "k3", name: "Squad 3: Tour Package Builder & Custom Trip Bundling", short: "Squad 3", members: ["JESSICA HILLARY HUTAHAEAN", "JOEL OKTAVIANUS", "BINTANG NEERA", "VICENTIUS ELANG KRISNANTO", "ALBERTUS CHANDRA HALIM"] },
  { id: "k4", name: "Squad 4: Transportasi Multi-Moda & Extranet Akomodasi", short: "Squad 4", members: ["HESEKIEL ANDHIKA NAINGGOLAN", "JOSUE FREITAS DA COSTA", "SYRILLYA CHANTIKA VALENTINA SITOHANG", "FRANS NICHOLAS RAFAEL", "THEODOMIRO FIDELIO TOMASOA", "CAESAR GATTACA", "YOSEP HERMAWAN"] },
  { id: "k5", name: "Squad 5: Core Infrastructure, Escrow Payment & AI Services", short: "Squad 5", members: ["GEORGE BLACIANO KUNEMARA PUTRA", "RAFAEL ELANO PRASETYA", "EZEKIEL MATHEO BARUS", "MICHAEL DEVON EKA PUTRA", "IMANUEL JULIVAL LUMBAN GAOL"] },
];

function titleCase(s) {
  return s
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const CAMPUS = Object.fromEntries(RAW_MEMBERS.map(([id, name]) => [name, id]));

function buildMembers() {
  const out = [];
  let n = 0;
  for (const k of KELOMPOKS) {
    for (const rawName of k.members) {
      n++;
      out.push({
        id: "m" + String(n).padStart(2, "0"),
        campusId: CAMPUS[rawName] || "-",
        name: titleCase(rawName),
        kelompokId: k.id,
        isLead: k.members[0] === rawName,
      });
    }
  }
  return out;
}

// 6 Sprint mingguan dari docs/roadmap_...deadline_22_desember_2026.md
const SPRINT_DATES = [
  { start: "2026-11-10", end: "2026-11-17" },
  { start: "2026-11-17", end: "2026-11-24" },
  { start: "2026-11-24", end: "2026-12-01" },
  { start: "2026-12-01", end: "2026-12-08" },
  { start: "2026-12-08", end: "2026-12-15" },
  { start: "2026-12-15", end: "2026-12-22" },
];

// 40 Issue roadmap: [no, squad, judul, bobot] — sama seperti issue #1–#40 GitHub
const ISSUES = [
  // Sprint 1 (10–17 Nov): Fondasi Monorepo, PostGIS & Desain Sistem
  [1, "k1", "Issue #1: DDL skema spasial destinations PostGIS, indeks GIST & wireframe UI direktori", 8],
  [2, "k2", "Issue #2: Wireflow KYC mitra & skema tabel partners dan destination_tickets", 8],
  [3, "k3", "Issue #3: Desain relasi tour_packages dan package_items", 8],
  [4, "k4", "Issue #4: Skema accommodations & transport_services, inisialisasi Google Maps SDK", 8],
  [5, "k5", "Issue #5: Setup monorepo GitHub, CI/CD GitHub Actions, JWT & RBAC auth service", 13],
  // Sprint 2 (17–24 Nov): Core Directory, GIS Radius Search & Crowdsourcing
  [6, "k1", "Issue #6: Endpoint PostGIS ST_DWithin, klaster pin peta & ekstraksi geotag EXIF", 13],
  [7, "k2", "Issue #7: Algoritma deteksi duplikasi lokasi Haversine 500m & antrean kurasi admin", 8],
  [8, "k3", "Issue #8: Komponen UI katalog paket wisata & detail timeline jadwal harian", 8],
  [9, "k4", "Issue #9: Halaman detail fasilitas destinasi & integrasi prakiraan cuaca BMKG", 8],
  [10, "k5", "Issue #10: Pengindeksan Elasticsearch & worker kompresi gambar WebP (BullMQ)", 8],
  // Sprint 3 (24 Nov–1 Des): Onboarding Mitra (KYC) & E-Ticketing
  [11, "k1", "Issue #11: Katalog destinasi terverifikasi dengan filter kategori 38 provinsi", 8],
  [12, "k2", "Issue #12: Portal registrasi mitra (upload KTP/NIB/SK) & dashboard verifikasi admin", 13],
  [13, "k3", "Issue #13: Prototipe wizard Tour Package Builder (open/private trip)", 8],
  [14, "k4", "Issue #14: Modul manajemen kuota tiket harian (WNI/WNA, Weekday/Weekend)", 8],
  [15, "k5", "Issue #15: Generator QR code e-tiket terenkripsi HMAC & scanner validasi gerbang", 13],
  // Sprint 4 (1–8 Des): Tour Package Builder & Payment Gateway (Escrow)
  [16, "k1", "Issue #16: Integrasi filter paket wisata ke halaman pencarian utama direktori", 8],
  [17, "k2", "Issue #17: Sistem kuota rombongan tur & konfirmasi booking tiket masuk", 8],
  [18, "k3", "Issue #18: Tour Package Builder Engine lengkap (JSONB itinerary & dynamic pax tiering)", 13],
  [19, "k4", "Issue #19: Integrasi relasi package_items ke penginapan & transportasi", 8],
  [20, "k5", "Issue #20: Integrasi Payment Gateway Midtrans/Xendit & skema escrow_ledgers", 13],
  // Sprint 5 (8–15 Des): Transport Multi-Moda, Homestay & Inventory Lock
  [21, "k1", "Issue #21: Radius mapping penginapan & transportasi terdekat destinasi", 8],
  [22, "k2", "Issue #22: Otomatisasi payout escrow pasca scan tiket", 13],
  [23, "k3", "Issue #23: Bundling paket wisata dengan homestay", 8],
  [24, "k4", "Issue #24: Extranet homestay (kalender ketersediaan kamar)", 13],
  [25, "k5", "Issue #25: Pencatatan bagi hasil komisi platform", 5],
  [26, "k1", "Issue #26: Mobile custom trip cart UI", 8],
  [27, "k2", "Issue #27: Validasi checkout multi-mitra atomik", 8],
  [28, "k3", "Issue #28: Mesin rekomendasi paket kustom", 8],
  [29, "k4", "Issue #29: Kalkulator estimasi rute multi-moda", 8],
  [30, "k5", "Issue #30: Inventory Locking 15 menit (Redis Redlock)", 13],
  // Sprint 6 (15–22 Des): AI Itinerary, Load Test, UAT & Handover
  [31, "k1", "Issue #31: Offline map caching (blank spot)", 8],
  [32, "k2", "Issue #32: Sistem review terverifikasi & gamifikasi poin", 8],
  [33, "k3", "Issue #33: Integrasi paket tur ke output AI", 8],
  [34, "k4", "Issue #34: Direktori UMKM & kalender event budaya", 8],
  [35, "k5", "Issue #35: Generator AI Itinerary (Gemini API)", 13],
  [36, "k1", "Issue #36: Optimasi performa LCP Frontend < 2 detik", 8],
  [37, "k2", "Issue #37: UAT modul mitra & tiket", 5],
  [38, "k3", "Issue #38: UAT pemesanan paket wisata kustom", 5],
  [39, "k4", "Issue #39: UAT modul akomodasi & transportasi", 5],
  [40, "k5", "Issue #40: SOS BMKG/SAR, Load Testing K6, security audit & handover resmi ke PO", 13],
];

function addDaysISO(iso, days) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function buildTasks(members) {
  // Proyek dimulai hari ini (10 Nov): tugas Sprint 1 langsung dikerjakan,
  // sisanya todo. Kosongkan status agar tim mengisi dari 0.
  const groups = KELOMPOKS.map((k) => ({
    ...k,
    roster: members.filter((m) => m.kelompokId === k.id),
  }));
  const roster = Object.fromEntries(groups.map((g) => [g.id, g.roster]));
  const cursor = Object.fromEntries(groups.map((g) => [g.id, 0]));
  const firstOfSquad = Object.fromEntries(groups.map((g) => [g.id, true]));

  return ISSUES.map(([no, squad, title, weight]) => {
    // Sprint: #1–#5 → S1 … #16–#20 → S4, #21–#30 → S5, #31–#40 → S6
    const sprint = no <= 20 ? Math.ceil(no / 5) : no <= 30 ? 5 : 6;
    const list = roster[squad];
    // Lead penggerak di issue pertama squad; setelahnya round-robin 2 anggota
    const first = firstOfSquad[squad];
    firstOfSquad[squad] = false;
    let assignees;
    if (first) {
      const p1 = cursor[squad] % list.length;
      const p2 = (cursor[squad] + 1) % list.length;
      assignees = [list[p1].id, list[p2].id];
      cursor[squad] += 2;
    } else {
      assignees = [];
      for (let i = 0; i < 2; i++) {
        assignees.push(list[cursor[squad] % list.length].id);
        cursor[squad]++;
      }
    }
    const due = SPRINT_DATES[sprint - 1].end;
    return {
      id: "i" + String(no).padStart(2, "0"),
      code: "#" + no,
      phase: sprint, // nomor sprint
      title,
      weight,
      dueDate: due,
      kelompokId: squad,
      assignees,
      status: sprint === 1 ? "in_progress" : "todo",
      reviewScore: null,
      completedAt: null,
    };
  });
}

function buildSeed() {
  const members = buildMembers();
  return {
    settings: { projectName: "NusantaraGo", startDate: PROJECT_START, targetDate: TARGET_END },
    kelompoks: KELOMPOKS.map((k) => ({
      id: k.id,
      name: k.name,
      short: k.short,
      lead: titleCase(k.members[0]),
      memberCount: k.members.length,
    })),
    members,
    tasks: buildTasks(members),
  };
}

module.exports = { buildSeed };
