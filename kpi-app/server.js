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
const WEIGHTS = { kehadiran: 0.25, penyelesaian: 0.35, ketepatan: 0.2, kualitas: 0.2 };
const GRADES = [
  [90, "A", "Sangat Baik"],
  [80, "B", "Baik"],
  [70, "C", "Cukup"],
  [0, "D", "Perlu Perbaikan"],
];
const PHASES = [
  { n: 1, name: "Fondasi & Direktori Wisata", months: "Bulan 1–2" },
  { n: 2, name: "Portal Mitra & Paket Wisata", months: "Bulan 3–4" },
  { n: 3, name: "Transportasi & Akomodasi", months: "Bulan 5–6" },
  { n: 4, name: "Fitur Cerdas, Uji & Peluncuran", months: "Bulan 7–8" },
];

// ---------- Perhitungan KPI ----------
function computeKpi(memberId) {
  const att = db.attendance.entries.filter((e) => e.memberId === memberId);
  const totalDays = att.reduce((s, e) => s + (Number(e.total) || 0), 0);
  const presentDays = att.reduce((s, e) => s + (Number(e.present) || 0), 0);
  const attPct = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

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
    attPct * WEIGHTS.kehadiran +
    completion * WEIGHTS.penyelesaian +
    ontimePct * WEIGHTS.ketepatan +
    quality * WEIGHTS.kualitas;
  const g = GRADES.find(([min]) => score >= min);

  return {
    memberId,
    kehadiran: round(attPct),
    penyelesaian: round(completion),
    ketepatan: round(ontimePct),
    kualitas: round(quality),
    total: round(score),
    grade: g[1],
    label: g[2],
    detail: {
      periode: att.length,
      totalHari: totalDays,
      hariHadir: presentDays,
      tugasTotal: mine.length,
      tugasSelesai: done.length,
      tugasProses: mine.filter((t) => t.status === "in_progress").length,
      bobotTotal: totalW,
      bobotSelesai: doneW,
      bobotProses: wipW,
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
  const byPhase = PHASES.map((p) => {
    const list = tasks.filter((t) => t.phase === p.n);
    const w = list.reduce((s, t) => s + t.weight, 0);
    const d = list.filter((t) => t.status === "done").reduce((s, t) => s + t.weight, 0);
    const ip = list.filter((t) => t.status === "in_progress").reduce((s, t) => s + t.weight, 0);
    return { phase: p.n, name: p.name, months: p.months, progress: w ? round((d / w) * 100) : 0, totalTasks: list.length, doneTasks: list.filter((t) => t.status === "done").length, wipTasks: list.filter((t) => t.status === "in_progress").length };
  });
  const totalW = tasks.reduce((s, t) => s + t.weight, 0);
  return {
    kpiRata: round(kpis.reduce((s, k) => s + k.total, 0) / (kpis.length || 1)),
    kehadiranRata: round(kpis.reduce((s, k) => s + k.kehadiran, 0) / (kpis.length || 1)),
    totalTugas: tasks.length,
    tugasDone: tasks.filter((t) => t.status === "done").length,
    tugasWip: tasks.filter((t) => t.status === "in_progress").length,
    tugasTodo: tasks.filter((t) => t.status === "todo").length,
    tugasReview: tasks.filter((t) => t.status === "review").length,
    progressTotal: totalW ? round((tasks.filter((t) => t.status === "done").reduce((s, t) => s + t.weight, 0) / totalW) * 100) : 0,
    perPhase: byPhase,
    perRole: rollupRole(kpis),
    leaderboard: [...kpis].sort((a, b) => b.total - a.total).slice(0, 8),
  };
}

function rollupRole(kpis) {
  const map = {};
  for (const m of db.members) (map[m.role] ||= []).push(kpis.find((k) => k.memberId === m.id));
  return Object.entries(map).map(([role, arr]) => ({
    role,
    count: arr.length,
    kpiRata: round(arr.reduce((s, k) => s + k.total, 0) / arr.length),
  }));
}

function kpiAll() {
  return [...db.members]
    .map((m) => ({ ...m, roleName: ROLE_NAMES[m.role] || m.role, kpi: computeKpi(m.id) }))
    .sort((a, b) => b.kpi.total - a.kpi.total);
}

const ROLE_NAMES = { uiux: "UI/UX Designer", backend: "Backend Developer", frontend: "Frontend Developer", mobile: "Mobile Developer (Flutter)", qa: "QA & Testing", data: "Data & DevOps" };

// ---------- REST API ----------
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const api = express.Router();

api.get("/state", (req, res) =>
  res.json({ ...db, phaseDefs: PHASES, roleNames: ROLE_NAMES, weights: WEIGHTS })
);
api.get("/dashboard", (req, res) => res.json(dashboardSummary()));
api.get("/kpi", (req, res) => res.json(kpiAll()));

// ---_anggota---
api.post("/members", (req, res) => {
  const { name, role, campusId } = req.body;
  if (!name || !role) return res.status(400).json({ error: "nama & peran wajib" });
  const id = "m" + Date.now().toString(36);
  db.members.push({ id, name, role, campusId: campusId || "-", studentId: "-" });
  save();
  res.json({ ok: true, id });
});
api.put("/members/:id", (req, res) => {
  const m = db.members.find((x) => x.id === req.params.id);
  if (!m) return res.status(404).json({ error: "tidak ada" });
  for (const k of ["name", "role", "campusId"]) if (req.body[k] !== undefined) m[k] = req.body[k];
  save();
  res.json({ ok: true });
});
api.delete("/members/:id", (req, res) => {
  db.members = db.members.filter((m) => m.id !== req.params.id);
  db.tasks.forEach((t) => (t.assignees = (t.assignees || []).filter((a) => a !== req.params.id)));
  db.attendance.entries = db.attendance.entries.filter((e) => e.memberId !== req.params.id);
  save();
  res.json({ ok: true });
});

// ---tugas---
api.post("/tasks", (req, res) => {
  const { title, phase, roles = [], weight = 5, dueDate = null } = req.body;
  if (!title || !phase) return res.status(400).json({ error: "judul & fase wajib" });
  const phaseN = Number(phase);
  const count = db.tasks.filter((t) => t.phase === phaseN).length;
  const code = `F${phaseN}-${String(count + 1).padStart(2, "0")}`;
  const id = "t" + Date.now().toString(36);
  db.tasks.push({ id, code, phase: phaseN, title, roles, weight: Number(weight) || 5, dueDate, assignees: [], status: "todo", reviewScore: null, completedAt: null });
  save();
  res.json({ ok: true, id });
});
api.put("/tasks/:id", (req, res) => {
  const t = db.tasks.find((x) => x.id === req.params.id);
  if (!t) return res.status(404).json({ error: "tidak ada" });
  if (req.body.assignees !== undefined) t.assignees = req.body.assignees;
  if (req.body.roles !== undefined) t.roles = req.body.roles;
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

// ---kehadiran---
api.post("/attendance/periods", (req, res) => {
  const name = (req.body.name || "").trim();
  if (!name) return res.status(400).json({ error: "nama periode wajib" });
  const id = "p" + Date.now().toString(36);
  db.attendance.periods.push({ id, name, startDate: req.body.startDate || null });
  save();
  res.json({ ok: true, id });
});
api.put("/attendance", (req, res) => {
  const { memberId, present, total, note } = req.body;
  if (!memberId) return res.status(400).json({ error: "memberId wajib" });
  // Entri tanpa periode = periode aktif pertama? disimpan per (periodId,memberId)
  const periodId = req.body.periodId || (db.attendance.periods[0] || {}).id;
  let e = db.attendance.entries.find((x) => x.memberId === memberId && x.periodId === periodId);
  if (!e) {
    e = { memberId, periodId, present: 0, total: 0, note: "" };
    db.attendance.entries.push(e);
  }
  e.present = Number(present) || 0;
  e.total = Number(total) || 0;
  if (note !== undefined) e.note = note;
  save();
  res.json({ ok: true });
});
api.delete("/attendance/periods/:id", (req, res) => {
  db.attendance.periods = db.attendance.periods.filter((p) => p.id !== req.params.id);
  db.attendance.entries = db.attendance.entries.filter((e) => e.periodId !== req.params.id);
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
