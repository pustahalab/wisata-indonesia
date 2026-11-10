// =============================================================
// Aplikasi KPI Pengembangan NusantaraGo — Backend (Express)
// Menyimpan data ke data/db.json (tanpa dependensi native).
// =============================================================
"use strict";

const express = require("express");
const fs = require("fs");
const path = require("path");
const { buildSeed } = require("./lib/seed");

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

// ---------- Penyimpanan JSON sederhana ----------
let db;
if (fs.existsSync(DB_FILE)) {
  db = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
} else {
  db = buildSeed();
  save();
}
function save() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// ---------- Konstanta KPI & skala ----------
// Kehadiran tidak dihitung; bobot diredistribusi.
const WEIGHTS = { penyelesaian: 0.4, ketepatan: 0.3, kualitas: 0.3 };
const GRADES = [
  [90, "A", "Sangat Baik"],
  [80, "B", "Baik"],
  [70, "C", "Cukup"],
  [0, "D", "Perlu Perbaikan"],
];
// 6 Sprint mingguan dari docs/roadmap_pengembangan_nusantarago_deadline_22_desember_2026.md
const SPRINTS = [
  { n: 1, name: "Fondasi Monorepo, PostGIS & Desain Sistem", start: "2026-11-10", end: "2026-11-17", eval: "17 Nov: Demo autentikasi & persetujuan desain" },
  { n: 2, name: "Core Directory, GIS Radius & Crowdsourcing", start: "2026-11-17", end: "2026-11-24", eval: "24 Nov: Demo pencarian geospasial & crowdsourcing" },
  { n: 3, name: "Onboarding Mitra KYC & E-Ticketing", start: "2026-11-24", end: "2026-12-01", eval: "1 Des: Uji registrasi mitra & scan QR tiket" },
  { n: 4, name: "Tour Package Builder & Payment Gateway (Escrow)", start: "2026-12-01", end: "2026-12-08", eval: "8 Des: Demo checkout QRIS sandbox & webhook escrow" },
  { n: 5, name: "Transport Multi-Moda, Homestay & Inventory Lock", start: "2026-12-08", end: "2026-12-15", eval: "15 Des: Demo custom bundling & pencegahan overbooking" },
  { n: 6, name: "AI Itinerary, Load Test, UAT & Handover", start: "2026-12-15", end: "2026-12-22", eval: "22 Des: Rilis final & handover ke PO" },
];
function activeSprint() {
  const today = new Date().toISOString().slice(0, 10);
  return SPRINTS.find((s) => today >= s.start && today < s.end) || (today < SPRINTS[0].start ? SPRINTS[0] : SPRINTS[SPRINTS.length - 1]);
}

// ---------- Perhitungan KPI ----------
function computeKpi(memberId) {
  const mine = db.tasks.filter((t) => (t.assignees || []).includes(memberId));
  const totalW = mine.reduce((s, t) => s + t.weight, 0);
  const doneW = mine.filter((t) => t.status === "done").reduce((s, t) => s + t.weight, 0);
  const wipW = mine.filter((t) => t.status === "in_progress").reduce((s, t) => s + t.weight, 0);
  const completion = totalW > 0 ? (doneW / totalW) * 100 : 0;

  const done = db.tasks.filter((t) => (t.assignees || []).includes(memberId) && t.status === "done");
  const ontime = done.filter((t) => {
    if (!t.completedAt) return false;
    if (t.dueDate) return t.completedAt <= t.dueDate;
    return true;
  });
  const ontimePct = done.length ? (ontime.length / done.length) * 100 : 0;

  const scored = done.filter((t) => Number.isFinite(Number(t.reviewScore)) && t.reviewScore !== null);
  const quality = scored.length
    ? scored.reduce((s, t) => s + Number(t.reviewScore), 0) / scored.length
    : 0;

  const score =
    completion * WEIGHTS.penyelesaian +
    ontimePct * WEIGHTS.ketepatan +
    quality * WEIGHTS.kualitas;
  const g = GRADES.find(([min]) => score >= min);

  return {
    memberId,
    penyelesaian: round(completion),
    ketepatan: round(ontimePct),
    kualitas: round(quality),
    total: round(score),
    grade: g[1],
    label: g[2],
    detail: {
      tugasTotal: mine.length,
      tugasSelesai: done.length,
      tugasProses: mine.filter((t) => t.status === "in_progress").length,
      bobotTotal: totalW,
      bobotSelesai: doneW,
      kebutuhanSkor: scored.length < done.length, // ada tugas selesai yang belum dinilai
    },
  };
}

function round(x) {
  return Math.round(x * 10) / 10;
}

function dashboardSummary() {
  const kpis = db.members.map((m) => computeKpi(m.id));
  const tasks = db.tasks;
  const perSprint = SPRINTS.map((p) => {
    const list = tasks.filter((t) => t.phase === p.n);
    const w = list.reduce((s, t) => s + t.weight, 0);
    const d = list.filter((t) => t.status === "done").reduce((s, t) => s + t.weight, 0);
    const ip = list.filter((t) => t.status === "in_progress" || t.status === "review").reduce((s, t) => s + t.weight, 0);
    return {
      phase: p.n,
      name: p.name,
      start: p.start,
      end: p.end,
      eval: p.eval,
      progress: w ? round((d / w) * 100) : 0,
      ontrack: w ? round(((d + ip * 0.5) / w) * 100) : 0,
      totalTasks: list.length,
      doneTasks: list.filter((t) => t.status === "done").length,
      wipTasks: list.filter((t) => t.status !== "done" && t.status !== "todo").length,
    };
  });
  const totalW = tasks.reduce((s, t) => s + t.weight, 0);
  return {
    kpiRata: round(kpis.reduce((s, k) => s + k.total, 0) / (kpis.length || 1)),
    activeSprint: activeSprint().n,
    activeSprintName: activeSprint().name,
    activeSprintEnd: activeSprint().end,
    targetDate: "2026-12-22",
    totalTugas: tasks.length,
    tugasDone: tasks.filter((t) => t.status === "done").length,
    tugasWip: tasks.filter((t) => t.status === "in_progress").length,
    tugasTodo: tasks.filter((t) => t.status === "todo").length,
    tugasReview: tasks.filter((t) => t.status === "review").length,
    progressTotal: totalW ? round((tasks.filter((t) => t.status === "done").reduce((s, t) => s + t.weight, 0) / totalW) * 100) : 0,
    perPhase: perSprint,
    perKelompok: rollupKelompok(kpis),
    leaderboard: [...kpis].sort((a, b) => b.total - a.total).slice(0, 8),
  };
}

function rollupKelompok(kpis) {
  return db.kelompoks.map((k) => {
    const arr = db.members
      .filter((m) => m.kelompokId === k.id)
      .map((m) => kpis.find((x) => x.memberId === m.id))
      .filter(Boolean);
    return {
      id: k.id,
      name: k.name,
      lead: k.lead,
      count: arr.length,
      kpiRata: arr.length ? round(arr.reduce((s, x) => s + x.total, 0) / arr.length) : 0,
    };
  });
}

function kpiAll() {
  const kel = Object.fromEntries(db.kelompoks.map((k) => [k.id, k]));
  return [...db.members]
    .map((m) => ({
      ...m,
      kelompokName: kel[m.kelompokId] ? kel[m.kelompokId].name : "-",
      isLead: !!m.isLead,
      kpi: computeKpi(m.id),
    }))
    .sort((a, b) =>
      a.kelompokName.localeCompare(b.kelompokName) || Number(b.isLead) - Number(a.isLead) ||
      b.kpi.total - a.kpi.total);
}

// ---------- REST API ----------
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const api = express.Router();

api.get("/state", (req, res) =>
  res.json({ ...db, phaseDefs: SPRINTS, weights: WEIGHTS })
);
api.get("/dashboard", (req, res) => res.json(dashboardSummary()));
api.get("/kpi", (req, res) => res.json(kpiAll()));

// ---anggota---
api.post("/members", (req, res) => {
  const { name, kelompokId, campusId } = req.body;
  if (!name || !kelompokId) return res.status(400).json({ error: "nama & kelompok wajib" });
  if (!db.kelompoks.find((k) => k.id === kelompokId)) return res.status(400).json({ error: "kelompok tidak ditemukan" });
  const id = "m" + Date.now().toString(36);
  db.members.push({ id, name, kelompokId, isLead: !!req.body.isLead, campusId: campusId || "-" });
  save();
  res.json({ ok: true, id });
});
api.put("/members/:id", (req, res) => {
  const m = db.members.find((x) => x.id === req.params.id);
  if (!m) return res.status(404).json({ error: "tidak ada" });
  for (const k of ["name", "kelompokId", "isLead", "campusId"]) if (req.body[k] !== undefined) m[k] = req.body[k];
  save();
  res.json({ ok: true });
});
api.delete("/members/:id", (req, res) => {
  db.members = db.members.filter((m) => m.id !== req.params.id);
  db.tasks.forEach((t) => (t.assignees = (t.assignees || []).filter((a) => a !== req.params.id)));
  save();
  res.json({ ok: true });
});

// ---tugas---
api.post("/tasks", (req, res) => {
  const { title, phase, weight = 5, dueDate = null } = req.body;
  if (!title || !phase) return res.status(400).json({ error: "judul & sprint wajib" });
  const phaseN = Number(phase);
  const sprintDef = SPRINTS.find((s) => s.n === phaseN);
  if (!sprintDef) return res.status(400).json({ error: "sprint tidak ditemukan" });
  const nextNo = Math.max(0, ...db.tasks.map((t) => Number(String(t.code).replace(/\D/g, "")) || 0)) + 1;
  const code = "#" + nextNo;
  const id = "t" + Date.now().toString(36);
  // otomatis diberi ke squad yang paling sedikit tanggungan + 2 anggotanya
  const kel = [...db.kelompoks].sort(
    (a, b) =>
      db.tasks.filter((t) => t.kelompokId === a.id).length -
      db.tasks.filter((t) => t.kelompokId === b.id).length
  )[0];
  const roster = db.members.filter((m) => m.kelompokId === kel.id);
  const nKel = db.tasks.filter((t) => t.kelompokId === kel.id).length;
  const pjs = [];
  if (roster.length) {
    pjs.push(roster[nKel % roster.length].id);
    if (roster.length > 1) pjs.push(roster[(nKel + 1) % roster.length].id);
  }
  db.tasks.push({ id, code, phase: phaseN, title, weight: Number(weight) || 5, dueDate: dueDate || sprintDef.end, kelompokId: kel.id, assignees: pjs, status: "todo", reviewScore: null, completedAt: null });
  save();
  res.json({ ok: true, id });
});
api.put("/tasks/:id", (req, res) => {
  const t = db.tasks.find((x) => x.id === req.params.id);
  if (!t) return res.status(404).json({ error: "tidak ada" });
  if (req.body.assignees !== undefined) t.assignees = req.body.assignees;
  if (req.body.kelompokId !== undefined && db.kelompoks.find((k) => k.id === req.body.kelompokId)) t.kelompokId = req.body.kelompokId;
  if (req.body.status !== undefined) {
    t.status = req.body.status;
    t.completedAt = req.body.status === "done" ? new Date().toISOString().slice(0, 10) : null;
  }
  if (req.body.reviewScore !== undefined) t.reviewScore = req.body.reviewScore === "" ? null : Number(req.body.reviewScore);
  if (req.body.dueDate !== undefined) t.dueDate = req.body.dueDate;
  if (req.body.title !== undefined) t.title = req.body.title;
  save();
  res.json({ ok: true, task: t });
});
api.delete("/tasks/:id", (req, res) => {
  db.tasks = db.tasks.filter((t) => t.id !== req.params.id);
  save();
  res.json({ ok: true });
});

// ---reset & seed ulang---
api.post("/reset", (req, res) => {
  db = buildSeed();
  save();
  res.json({ ok: true });
});
api.post("/reset-status", (req, res) => {
  // kembalikan semua status tugas ke todo (tanpa mengubah saldo kehadiran)
  db.tasks.forEach((t) => { t.status = "todo"; t.completedAt = null; t.reviewScore = null; });
  save();
  res.json({ ok: true });
});

app.use("/api", api);

app.listen(PORT, () => {
  console.log(`Aplikasi KPI NusantaraGo berjalan di http://localhost:${PORT}`);
});
