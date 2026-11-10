// Data awal (seed) aplikasi KPI NusantaraGo
// Sumber: team.xlsx (Sheet: Sistem Pendukung Keputusan) + ps (5).xls + blueprint_pengembangan_aplikasi_wisata_nusantarago.md
// Target Rilis: 22 Desember 2026 (6 Minggu Akselerasi)
"use strict";

const SQUADS = [
  {
    id: "squad-1",
    name: "Squad 1: Direktori Wisata, GIS & Crowdsourcing",
    leadName: "ODA KARTIKA NURINGTYASANTI",
    focus: "Modul 1 (Direktori 38 Provinsi, PostGIS) & Modul 2 (Pendaftaran Publik & Geotagging EXIF)",
    members: [
      { campusId: "202404560033", name: "LINDA WATI PURBA", role: "qa", isLead: false },
      { campusId: "202404560036", name: "RADEN RORO ANINDYA ANGGITOPUTRI", role: "frontend", isLead: false },
      { campusId: "202404560028", name: "ODA KARTIKA NURINGTYASANTI", role: "backend", isLead: true },
      { campusId: "202404560037", name: "ANASTASYA GEOVANI MANURUNG", role: "mobile", isLead: false },
      { campusId: "202404560019", name: "CORNELIUS DICHO DHARMAWAN", role: "data", isLead: false }
    ]
  },
  {
    id: "squad-2",
    name: "Squad 2: Mitra Pengelola (KYC), Legalitas & E-Ticketing",
    leadName: "GABRIELLA LAVIGNE PINK",
    focus: "Modul 2 (Klaim Mitra Resmi, Validasi KYC) & Modul 5.1/6 (E-Ticketing & QR Code Scanner)",
    members: [
      { campusId: "202404560005", name: "EDWARD ANTONIO HERLAMBANG HUTAURUK", role: "frontend", isLead: false },
      { campusId: "202404560020", name: "GABRIELLA LAVIGNE PINK", role: "uiux", isLead: true },
      { campusId: "202404560021", name: "BRIGID PAULINE RATU PATTY DIAZ", role: "frontend", isLead: false },
      { campusId: "202404560023", name: "JO SUK SIN", role: "backend", isLead: false },
      { campusId: "202404560040", name: "ALOYSIA CARLA PUTRI HARYADI", role: "mobile", isLead: false }
    ]
  },
  {
    id: "squad-3",
    name: "Squad 3: Tour Package Builder & Custom Trip Bundling",
    leadName: "JESSICA HILLARY HUTAHAEAN",
    focus: "Modul 3 (Manajemen Paket Wisata, Open/Private Trip, Dynamic Pricing & Custom Bundling)",
    members: [
      { campusId: "202404560035", name: "JOEL OKTAVIANUS", role: "backend", isLead: false },
      { campusId: "202404560045", name: "BINTANG NEERA", role: "frontend", isLead: false },
      { campusId: "202404560025", name: "VICENTIUS ELANG KRISNANTO", role: "mobile", isLead: false },
      { campusId: "202404560008", name: "ALBERTUS CHANDRA HALIM", role: "qa", isLead: false },
      { campusId: "202404560050", name: "JESSICA HILLARY HUTAHAEAN", role: "uiux", isLead: true }
    ]
  },
  {
    id: "squad-4",
    name: "Squad 4: Transportasi Multi-Moda & Extranet Akomodasi",
    leadName: "HESEKIEL ANDHIKA NAINGGOLAN",
    focus: "Modul 4 (Transportasi Antarkota API, Last-Mile Rental) & Modul 5 (Extranet Homestay & Kalender Kamar)",
    members: [
      { campusId: "202404560052", name: "HESEKIEL ANDHIKA NAINGGOLAN", role: "backend", isLead: true },
      { campusId: "202404560027", name: "JOSUE FREITAS DA COSTA", role: "frontend", isLead: false },
      { campusId: "202204560029", name: "SYRILLYA CHANTIKA VALENTINA SITOHANG", role: "backend", isLead: false },
      { campusId: "202404560029", name: "FRANS NICHOLAS RAFAEL", role: "mobile", isLead: false },
      { campusId: "202404560017", name: "THEODOMIRO FIDELIO TOMASOA", role: "data", isLead: false },
      { campusId: "202204560032", name: "CAESAR GATTACA", role: "backend", isLead: false },
      { campusId: "202404560051", name: "YOSEP HERMAWAN", role: "qa", isLead: false }
    ]
  },
  {
    id: "squad-5",
    name: "Squad 5: Core Infrastructure, Escrow Payment & AI Services",
    leadName: "GEORGE BLACIANO KUNEMARA PUTRA",
    focus: "Modul 6 (AI Smart Itinerary Gemini, SOS Darurat) & Core Engine (Payment Gateway, Escrow, Redis Redlock)",
    members: [
      { campusId: "202404560054", name: "RAFAEL ELANO PRASETYA", role: "backend", isLead: false },
      { campusId: "202404560009", name: "EZEKIEL MATHEO BARUS", role: "backend", isLead: false },
      { campusId: "202404560001", name: "MICHAEL DEVON EKA PUTRA", role: "data", isLead: false },
      { campusId: "202404560039", name: "IMANUEL JULIVAL LUMBAN GAOL", role: "mobile", isLead: false },
      { campusId: "202404560049", name: "GEORGE BLACIANO KUNEMARA PUTRA", role: "uiux", isLead: true }
    ]
  }
];

function titleCase(s) {
  return s
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function buildMembers() {
  const members = [];
  let idx = 1;
  for (const sq of SQUADS) {
    for (const m of sq.members) {
      members.push({
        id: "m" + String(idx).padStart(2, "0"),
        campusId: m.campusId,
        name: titleCase(m.name),
        role: m.role,
        squadId: sq.id,
        squadName: sq.name,
        isLead: m.isLead,
        studentId: "S" + String(idx).padStart(3, "0"),
        attPct: (m.campusId === "202204560032" || m.campusId === "202204560029" || m.campusId === "202404560051") ? 88 : 100,
      });
      idx++;
    }
  }
  return members;
}

// 6 Sprint Mingguan (10 Nov 2026 - 22 Des 2026)
const RAW_TASKS = [
  // Sprint 1 (Minggu 1: 10 - 17 Nov)
  ["S1-01", 1, "Rancang UI/UX (Figma): wireframe & design system direktori", ["uiux", "frontend"], 8, 1, "squad-1"],
  ["S1-02", 1, "Setup monorepo GitHub, CI/CD Actions & JWT Auth", ["backend", "data"], 8, 1, "squad-5"],
  ["S1-03", 1, "Desain arsitektur database (PostgreSQL + PostGIS)", ["backend", "data"], 8, 1, "squad-1"],
  ["S1-04", 1, "Wireflow registrasi KYC mitra & skema tabel kemitraan", ["uiux", "backend"], 5, 1, "squad-2"],
  ["S1-05", 1, "Skema relasi tour packages & integrasi Google Maps Platform", ["backend"], 5, 1, "squad-3"],

  // Sprint 2 (Minggu 2: 17 - 24 Nov)
  ["S2-01", 2, "Pencarian geospasial PostGIS ST_DWithin & filter multi-dimensi", ["backend"], 8, 2, "squad-1"],
  ["S2-02", 2, "Peta interaktif + clustering pin (Flutter & Next.js)", ["frontend", "mobile"], 8, 2, "squad-1"],
  ["S2-03", 2, "Alur kontributor publik & ekstraksi geotag EXIF foto", ["mobile", "backend"], 8, 2, "squad-1"],
  ["S2-04", 2, "Algoritma deteksi duplikasi lokasi Haversine 500m & antrean kurasi", ["backend", "frontend"], 5, 2, "squad-2"],
  ["S2-05", 2, "Halaman detail destinasi & integrasi cuaca BMKG", ["frontend"], 5, 2, "squad-4"],
  ["S2-06", 2, "Pengindeksan Elasticsearch & kompresi WebP (BullMQ)", ["data", "backend"], 8, 2, "squad-5"],

  // Sprint 3 (Minggu 3: 24 Nov - 01 Des)
  ["S3-01", 3, "Portal registrasi mitra (upload KTP/NIB/SK) & validasi admin", ["backend", "frontend"], 8, 3, "squad-2"],
  ["S3-02", 3, "Manajemen kuota tiket harian & tarif WNI/WNA", ["backend"], 5, 3, "squad-4"],
  ["S3-03", 3, "Generator QR code tiket terenkripsi & mobile scanner app gerbang", ["mobile", "backend"], 8, 3, "squad-5"],
  ["S3-04", 3, "Prototipe wizard tour package builder", ["frontend", "backend"], 5, 3, "squad-3"],

  // Sprint 4 (Minggu 4: 01 - 08 Des)
  ["S4-01", 4, "Tour Package Builder lengkap (JSONB itinerary & pax tiering)", ["backend", "mobile"], 8, 4, "squad-3"],
  ["S4-02", 4, "Integrasi Payment Gateway Midtrans/Xendit (QRIS, VA, E-Wallet)", ["backend"], 8, 4, "squad-5"],
  ["S4-03", 4, "Pencatatan escrow ledger penampungan dana & payout webhook", ["backend"], 8, 4, "squad-5"],
  ["S4-04", 4, "Relasi package items ke penginapan dan armada rental", ["backend"], 5, 4, "squad-4"],

  // Sprint 5 (Minggu 5: 08 - 15 Des)
  ["S5-01", 5, "Extranet homestay (kalender kamar & tarif) & rental lokal", ["backend", "frontend"], 8, 5, "squad-4"],
  ["S5-02", 5, "Kalkulator estimasi rute multi-moda (first to last mile)", ["mobile", "frontend"], 5, 5, "squad-4"],
  ["S5-03", 5, "Custom trip bundling cart: destinasi + hotel + transport", ["frontend", "backend"], 8, 5, "squad-3"],
  ["S5-04", 5, "Inventory locking 15 menit dengan Redis Redlock", ["backend"], 8, 5, "squad-5"],

  // Sprint 6 (Minggu 6: 15 - 22 Des - FINAL RELEASE)
  ["S6-01", 6, "AI Smart Itinerary Planner (Gemini API)", ["backend", "data"], 8, 6, "squad-5"],
  ["S6-02", 6, "Fitur SOS darurat geolokasi & integrasi BMKG/SAR", ["mobile", "backend"], 8, 6, "squad-5"],
  ["S6-03", 6, "Mode peta offline per wilayah (blank spot)", ["mobile"], 5, 6, "squad-1"],
  ["S6-04", 6, "Load testing K6 (2.000 VUs) & audit keamanan KYC", ["qa", "data"], 8, 6, "squad-5"],
  ["S6-05", 6, "User Acceptance Testing (UAT) & Handover resmi ke PO Denny J.C. Sihombing", ["qa", "frontend"], 5, 6, "squad-3"]
];

function buildTasks(members) {
  const startDate = new Date("2026-11-10T00:00:00Z");
  return RAW_TASKS.map(([code, sprintNum, title, roleTags, storyPoints, offsetWk, squadId], i) => {
    const due = new Date(startDate);
    due.setDate(due.getDate() + offsetWk * 7);

    let squadMembers = members.filter((m) => m.squadId === squadId);
    let matched = squadMembers.filter((m) => roleTags.includes(m.role));
    if (matched.length === 0) matched = squadMembers;

    const assignee = matched[i % matched.length];

    return {
      id: "t" + String(i + 1).padStart(2, "0"),
      code,
      phase: sprintNum,
      title,
      roles: roleTags,
      storyPoints,
      dueDate: due.toISOString().slice(0, 10),
      squadId,
      assigneeId: assignee.id,
      assigneeName: assignee.name,
      status: sprintNum === 1 ? "in_progress" : "todo",
      progress: sprintNum === 1 ? 25 : 0,
    };
  });
}

function buildSeed() {
  const members = buildMembers();
  const tasks = buildTasks(members);
  return {
    meta: {
      project: "NusantaraGo (Super-App Pariwisata Indonesia)",
      productOwner: "Denny J.C. Sihombing",
      startDate: "2026-11-10",
      deadlineDate: "2026-12-22",
      totalMembers: members.length,
      totalSquads: SQUADS.length,
      squads: SQUADS.map((s) => ({ id: s.id, name: s.name, leadName: s.leadName, focus: s.focus })),
    },
    members,
    tasks,
  };
}

module.exports = { buildSeed, SQUADS };
