// =============================================================
// Frontend KPI NusantaraGo — vanilla JS + Chart.js
// =============================================================
"use strict";

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

let db = null;      // state dari server
let dash = null;    // ringkasan dashboard
let kpis = null;    // daftar KPI + anggota
const charts = {};

const KEL_COLORS = ["#2dd4bf", "#38bdf8", "#a78bfa", "#fbbf24", "#f87171"];
const colorKel = (kelId) => {
  const n = parseInt((kelId || "k1").replace(/\D/g, "")) || 1;
  return KEL_COLORS[((n - 1) % KEL_COLORS.length + KEL_COLORS.length) % KEL_COLORS.length];
};
const AVG_COLORS = { done: "#34d399", in_progress: "#fbbf24", review: "#a78bfa", todo: "#475569" };
const STATUS_LABEL = { todo: "Belum", in_progress: "Dikerjakan", review: "Review", done: "Selesai" };

async function api(path, opts) {
  const res = await fetch("/api" + path, {
    headers: { "Content-Type": "application/json" },
    ...opts,
    ...(opts && opts.body ? {} : {}),
  });
  if (!res.ok) throw new Error((await res.json()).error || res.statusText);
  return res.json();
}
const post = (p, body) => api(p, { method: "POST", body: JSON.stringify(body) });
const put = (p, body) => api(p, { method: "PUT", body: JSON.stringify(body) });
const del = (p) => api(p, { method: "DELETE" });

async function refreshAll() {
  [db, dash, kpis] = await Promise.all([api("/state"), api("/dashboard"), api("/kpi")]);
  renderAll();
}

// ---------- util ----------
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const member = (id) => db.members.find((m) => m.id === id);
const memberName = (id) => (member(id) || { name: "?" }).name;
const initials = (name) => name.split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
function colorFor(id) {
  const hues = [174, 199, 262, 43, 0, 152];
  const n = parseInt((id || "").replace(/\D/g, "")) || 0;
  return `hsl(${hues[n % hues.length]} 62% 55%)`;
}
function gradeBadge(g) { return `<span class="g-badge g-${g}">${g}</span>`; }
function avatarHtml(m) {
  return `<span class="avatar" style="background:${colorFor(m.id)}">${esc(initials(m.name))}</span>`;
}
function barColor(v) { return v >= 90 ? "#34d399" : v >= 70 ? "#38bdf8" : v >= 50 ? "#fbbf24" : "#f87171"; }

// ---------- render utama ----------
function renderAll() {
  renderHeader();
  renderRingkasan();
  renderTim();
  renderTugas();
  renderBagi();
}

function renderHeader() {
  $("#h-progress").textContent = dash.progressTotal + "%";
  $("#h-kpi").textContent = dash.kpiRata.toFixed(1);
  $("#h-done").textContent = `${dash.tugasDone}/${dash.totalTugas}`;
  $("#subtitle").textContent = `${db.settings.projectName} — KPI pengerjaan tim (${db.members.length} anggota) & rencana kerja blueprint 4 fase`;
}

let statusChart, roleChart;
function renderRingkasan() {
  $("#c-progress").textContent = dash.progressTotal + "%";
  $("#c-kpi").textContent = dash.kpiRata.toFixed(1);
  $("#c-done").textContent = `${dash.tugasDone}/${dash.totalTugas}`;
  $("#c-wip").textContent = dash.tugasWip;

  // progress per fase
  $("#phasebars").innerHTML = dash.perPhase.map((p) => `
    <div class="phasebar">
      <div class="lbl"><b>Fase ${p.phase}: ${esc(p.name)}</b><small>${p.months} · ${p.doneTasks}/${p.totalTasks} tugas</small></div>
      <div class="bar"><i style="width:${p.progress}%;background:${barColor(p.progress)}"></i></div>
    </div>`).join("");

  // donut status tugas
  const sd = [
    { key: "done", v: dash.tugasDone }, { key: "in_progress", v: dash.tugasWip },
    { key: "review", v: dash.tugasReview }, { key: "todo", v: dash.tugasTodo },
  ];
  const ctx1 = $("#chartStatus");
  if (statusChart) statusChart.destroy();
  statusChart = new Chart(ctx1, {
    type: "doughnut",
    data: { labels: sd.map((s) => STATUS_LABEL[s.key]), datasets: [{ data: sd.map((s) => s.v), backgroundColor: sd.map((s) => AVG_COLORS[s.key]), borderWidth: 0 }] },
    options: { plugins: { legend: { labels: { color: "#a5b4cc" } } }, cutout: "62%" },
  });

  // bar KPI per kelompok
  const labels = dash.perKelompok.map((r) => "Squad " + r.id.replace("k", ""));
  const ctx2 = $("#chartRole");
  if (roleChart) roleChart.destroy();
  roleChart = new Chart(ctx2, {
    type: "bar",
    data: { labels, datasets: [{ label: "KPI rata-rata", data: dash.perKelompok.map((r) => r.kpiRata), backgroundColor: dash.perKelompok.map((r) => colorKel(r.id)), borderRadius: 6 }] },
    options: { plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 100, ticks: { color: "#8ea0b8" }, grid: { color: "#223048" } }, x: { ticks: { color: "#8ea0b8" } } } },
  });

  // top 8 leaderboard
  $("#toplist").innerHTML = dash.leaderboard.map((k, i) => {
    const m = member(k.memberId);
    return `<div class="toprow"><span class="rank">${i + 1}.</span>${avatarHtml(m)}
      <span style="flex:1">${esc(m.name)}<br><small style="color:var(--muted)">${esc((db.kelompoks.find((x) => x.id === m.kelompokId) || { name: "" }).name)}${m.isLead ? " ⭐" : ""}</small></span>${gradeBadge(k.grade)}
      <b style="width:46px;text-align:right;color:${barColor(k.total)}">${k.total}</b></div>`;
  }).join("");
}

const kelOf = (id) => db.kelompoks.find((k) => k.id === id) || { name: "-", short: "-", lead: "" };
const shortRole = (kelId) => "Squad " + String(kelId).replace("k", "");

// ---------- tab TIM ----------
function memberFiltered() {
  const kel = $("#f-role").value, grade = $("#f-grade").value, q = $("#f-q").value.toLowerCase();
  return kpis.filter((k) =>
    (!kel || k.kelompokId === kel) && (!grade || k.kpi.grade === grade) &&
    (!q || k.name.toLowerCase().includes(q) || k.campusId.includes(q)));
}

function renderTim() {
  const selRole = $("#f-role");
  if (selRole.options.length <= 1) {
    selRole.innerHTML = `<option value="">Semua Squad</option>` +
      db.kelompoks.map((k) => `<option value="${k.id}">${esc(k.name)} — Lead: ${esc(k.lead)}</option>`).join("");  }
  const selM = $("#f-member");
  if (selM.options.length <= 1) {
    selM.innerHTML = `<option value="">Semua Penanggung Jawab</option>` +
      db.members.map((m) => `<option value="${m.id}">${esc(m.name)} (${shortRole(m.kelompokId)})</option>`).join("");
  }

  const rows = memberFiltered().map((k) => `
    <tr data-id="${k.id}" style="cursor:pointer" title="Klik untuk detail KPI">
      <td>${avatarHtml(k)}<b>${esc(k.name)}</b>${k.isLead ? ' <span class="g-badge g-A" style="font-size:10px;padding:2px 6px">⭐ Lead</span>' : ""}<br><small style="color:var(--muted)">${esc(k.campusId)}</small></td>
      <td><span class="role-tag" style="background:${colorKel(k.kelompokId)}">${esc(kelOf(k.kelompokId).short)}</span></td>
      <td>${k.kpi.penyelesaian.toFixed(1)}%<br><small style="color:var(--muted)">${k.kpi.detail.tugasSelesai}/${k.kpi.detail.tugasTotal} tugas</small></td>
      <td>${k.kpi.ketepatan.toFixed(1)}%</td>
      <td>${k.kpi.kualitas ? k.kpi.kualitas.toFixed(1) : "–"}</td>
      <td><div class="score"><div class="bar"><i style="width:${k.kpi.total}%;background:${barColor(k.kpi.total)}"></i></div><b>${k.kpi.total.toFixed(1)}</b></div></td>
      <td>${gradeBadge(k.kpi.grade)}</td>
    </tr>`).join("");
  $("#tbl-members thead").innerHTML = `<tr><th>Anggota</th><th>Squad</th><th>Penyelesaian (40%)</th><th>Tepat Waktu (30%)</th><th>Kualitas (30%)</th><th>Skor KPI</th><th>Predikat</th></tr>`;
  $("#tbl-members tbody").innerHTML = rows || `<tr><td colspan="7" style="color:var(--muted)">Tidak ada anggota yang cocok.</td></tr>`;
}

// ---------- tab TUGAS ----------
function tasksFiltered() {
  const ph = $("#f-phase").value, st = $("#f-status").value, me = $("#f-member").value;
  return db.tasks.filter((t) =>
    (!ph || String(t.phase) === ph) && (!st || t.status === st) &&
    (!me || (t.assignees || []).includes(me)));
}

function renderTugas() {
  const rows = tasksFiltered().map((t) => {
    const tgl = t.dueDate ? t.dueDate.slice(5) : "–";
    const overdue = t.status !== "done" && t.dueDate && t.dueDate < new Date().toISOString().slice(0, 10);
    const names = (t.assignees || []).map((a) => memberName(a));
    return `<tr>
      <td><b>${t.code}</b><br><span class="role-tag" style="background:${colorKel(t.kelompokId)}">${esc(kelOf(t.kelompokId).short)}</span></td>
      <td>${esc(t.title)}</td>
      <td>F${t.phase}</td>
      <td><small>${esc(names.join(", ")) || "–"}</small></td>
      <td style="text-align:center">${t.weight}</td>
      <td style="color:${overdue ? "var(--bad)" : "inherit"}">${tgl}${overdue ? " ⚠" : ""}</td>
      <td><select data-act="status" data-id="${t.id}">
        ${["todo", "in_progress", "review", "done"].map((s) => `<option value="${s}" ${t.status === s ? "selected" : ""}>${STATUS_LABEL[s]}</option>`).join("")}
      </select></td>
      <td><input type="number" min="0" max="100" style="width:70px" data-act="score" data-id="${t.id}" value="${t.reviewScore ?? ""}" placeholder="skor"></td>
      <td><button class="ghost" data-act="edit" data-id="${t.id}">✎</button></td>
    </tr>`;
  }).join("");
  $("#tbl-tasks thead").innerHTML = `<tr><th>Kode</th><th>Tugas</th><th>Fase</th><th>PJ</th><th>Bobot</th><th>Tenggat</th><th>Status</th><th>Skor Kualitas</th><th></th></tr>`;
  $("#tbl-tasks tbody").innerHTML = rows || `<tr><td colspan="9" style="color:var(--muted)">Tidak ada tugas yang cocok.</td></tr>`;
}

// ---------- tab PEMBAGIAN TUGAS ----------
function renderBagi() {
  const acts = db.members.reduce((s, m) => s + db.tasks.filter((t) => (t.assignees || []).includes(m.id)).length, 0);
  const perMember = db.members.map((m) => ({ m, n: db.tasks.filter((t) => (t.assignees || []).includes(m.id)).length }));
  const mid = acts / db.members.length;
  const min = Math.min(...perMember.map((x) => x.n));
  const max = Math.max(...perMember.map((x) => x.n));
  $("#bagi-summary").innerHTML = `
    <div class="card"><small>Total Penugasan</small><b>${acts}</b><span>${db.tasks.length} tugas · dikerjakan ${db.members.length} orang</span></div>
    <div class="card"><small>Rata-rata per Anggota</small><b>${mid.toFixed(1)}</b><span>tugas per orang</span></div>
    <div class="card"><small>Beban Terkecil</small><b style="color:${barColor(min * 20)}">${min}</b><span>tugas</span></div>
    <div class="card"><small>Beban Terbesar</small><b style="color:${barColor(max * 15)}">${max}</b><span>tugas</span></div>`;

  const cards = db.kelompoks.map((k) => {
    const rows = db.members
      .filter((m) => m.kelompokId === k.id)
      .sort((a, b) => Number(b.isLead) - Number(a.isLead) || a.name.localeCompare(b.name))
      .map((m) => {
        const list = db.tasks
          .filter((t) => (t.assignees || []).includes(m.id))
          .map((t) => `<li><span class="pill ${t.status}">${STATUS_LABEL[t.status]}</span><b>${t.code}</b> · F${t.phase} · ${t.weight}sp<br><small style="color:var(--muted)">${esc(t.title)}</small></li>`)
          .join("");
        return `<div class="box mcard"><div class="mtop">${avatarHtml(m)}<div><b>${esc(m.name)}${m.isLead ? " ⭐" : ""}</b><br><span class="role-tag" style="background:${colorKel(k.id)}">${esc(k.name)}${m.isLead ? " — Lead" : ""}</span></div></div><ul>${list || "<li style='color:var(--muted)'>Belum ditugaskan.</li>"}</ul></div>`;
      }).join("");
    const subtasks = db.tasks.filter((t) => t.kelompokId === k.id);
    return `<h3 class="rolehead" style="border-left:4px solid ${colorKel(k.id)};padding-left:8px">${esc(k.name)} <small style="color:var(--muted)">Lead: ${esc(k.lead)} · ${subtasks.length} tugas</small></h3>
      <div class="mcards">${rows}</div>`;
  }).join("");
  $("#bagi-cards").innerHTML = cards;
}

// ---------- dialog ----------
const dlg = $("#dlg");
let dlgOnOk = null;
function openDialog(html, onOk) {
  $("#dlg-body").innerHTML = html;
  dlgOnOk = onOk;
  dlg.showModal();
}
$("#dlg-cancel").onclick = () => dlg.close();
$("#dlg-ok").onclick = async () => {
  if (dlgOnOk) { try { await dlgOnOk(); dlg.close(); } catch (e) { alert(e.message); } }
};

function dialogAddMember() {
  const optKel = db.kelompoks.map((k) => `<option value="${k.id}">${esc(k.name)}</option>`).join("");
  openDialog(`
    <h4>Tambah Anggota Tim</h4>
    <label>Nama lengkap</label><input type="text" id="dm-name">
    <label>ID kampus</label><input type="text" id="dm-campus">
    <label>Squad</label><select id="dm-kel">${optKel}</select>
    <label style="display:flex;gap:6px;align-items:center;margin-top:12px;color:var(--txt)"><input type="checkbox" id="dm-lead" style="width:auto"> Tandai sebagai Lead</label>`,
    async () => {
      const name = $("#dm-name").value.trim();
      if (!name) throw new Error("Nama wajib diisi");
      await post("/members", { name, campusId: $("#dm-campus").value, kelompokId: $("#dm-kel").value, isLead: $("#dm-lead").checked });
      await refreshAll();
    });
}

function dialogAddTask() {
  const optPhase = [1, 2, 3, 4].map((n) => {
    const p = db.phaseDefs.find((x) => x.n === n);
    return `<option value="${n}">Fase ${n} — ${p.name}</option>`;
  }).join("");
  const today = new Date().toISOString().slice(0, 10);
  openDialog(`
    <h4>Tambah Tugas</h4>
    <label>Judul tugas</label><input type="text" id="dt-title">
    <label>Fase</label><select id="dt-phase">${optPhase}</select>
    <label>Bobot (story point)</label><input type="number" id="dt-weight" value="5" min="1">
    <label>Tenggat</label><input type="date" id="dt-due" value="${today}">`,
    async () => {
      const title = $("#dt-title").value.trim();
      if (!title) throw new Error("Judul wajib diisi");
      await post("/tasks", {
        title, phase: $("#dt-phase").value, weight: $("#dt-weight").value, dueDate: $("#dt-due").value || null,
      });
      await refreshAll();
    });
}

function dialogEditTask(id) {
  const t = db.tasks.find((x) => x.id === id);
  if (!t) return;
  const chips = db.members.map((m) => `
    <label><input type="checkbox" value="${m.id}" ${(t.assignees || []).includes(m.id) ? "checked" : ""}>
      ${avatarHtml(m)} ${esc(m.name)}${m.isLead ? " ⭐" : ""} <small style="color:var(--muted)">${esc(kelOf(m.kelompokId).name)}</small></label>`).join("");
  openDialog(`
    <h4>${t.code} — ${esc(t.title)}</h4>
    <label>Penanggung jawab (bisa lebih dari satu)</label>
    <div class="chips">${chips}</div>
    <label>Judul</label><input type="text" id="de-title" value="${esc(t.title)}">
    <label>Tenggat</label><input type="date" id="de-due" value="${t.dueDate || ""}">`,
    async () => {
      const assignees = [...$("#dlg-body").querySelectorAll(".chips input:checked")].map((c) => c.value);
      await put(`/tasks/${id}`, { assignees, title: $("#de-title").value, dueDate: $("#de-due").value || null });
      await refreshAll();
    });
}

function dialogDetailMember(id) {
  const k = kpis.find((x) => x.id === id);
  if (!k) return;
  const kar = k.kpi;
  const comp = [["Penyelesaian", kar.penyelesaian, 40], ["Tepat Waktu", kar.ketepatan, 30], ["Kualitas", kar.kualitas, 30]];
  const assigned = db.tasks.filter((t) => (t.assignees || []).includes(id));
  const list = assigned.map((t) => `<li><span class="pill ${t.status}">${STATUS_LABEL[t.status]}</span> <b>${t.code}</b> ${esc(t.title)}</li>`).join("");
  openDialog(`
    <h4>${esc(k.name)} — KPI Detail</h4>
    <p style="margin:0;color:var(--muted);font-size:13px">${esc(kelOf(k.kelompokId).name)}${k.isLead ? " ⭐ Lead" : ""} · ID ${esc(k.campusId)}</p>
    <div class="kpibox">
      ${comp.map(([n, v, w]) => `<div class="kb"><small>${n} (bobot ${w}%)</small><b style="color:${barColor(v)}">${v.toFixed(1)}</b></div>`).join("")}
      <div class="kb"><small>Total KPI</small><b style="color:${barColor(kar.total)}">${kar.total} ${gradeBadge(kar.grade)}</b></div>
    </div>
    <p style="margin:12px 0 4px;font-size:13px;color:var(--muted)">Tugas terkait (${assigned.length}):</p>
    <ul style="font-size:13px;max-height:180px;overflow:auto;padding-left:18px;margin:0">${list || "<li>Belum ada tugas.</li>"}</ul>
    ${kar.detail.kebutuhanSkor ? '<p style="color:var(--warn);font-size:12.5px">⚠ Ada tugas selesai yang belum diberi skor kualitas.</p>' : ""}
  `, null);
  // aksinya
  $("#dlg-ok").textContent = "Tutup";
  dlgOnOk = () => {};
  $("#dlg-ok").onclick = () => dlg.close();
}

// ---------- event ----------
function bindOnce() {
  // tab
  $$(".tab").forEach((b) => b.onclick = () => {
    $$(".tab").forEach((x) => x.classList.toggle("active", x === b));
    $$(".panel").forEach((p) => p.classList.add("hidden"));
    $("#tab-" + b.dataset.tab).classList.remove("hidden");
  });

  // filter
  ["#f-role", "#f-grade", "#f-q"].forEach((s) => $(s).oninput = renderTim);
  ["#f-phase", "#f-status", "#f-member"].forEach((s) => $(s).onchange = renderTugas);
  $("#btn-add-member").onclick = dialogAddMember;
  $("#btn-add-task").onclick = dialogAddTask;

  // tabel anggota: klik baris = detail
  $("#tbl-members").onclick = (e) => {
    const tr = e.target.closest("tr[data-id]");
    if (tr) dialogDetailMember(tr.dataset.id);
  };

  // tabel tugas: status & skor inline, tombol edit
  $("#tbl-tasks").onchange = async (e) => {
    const el = e.target;
    if (!el.dataset.id) return;
    if (el.dataset.act === "status") await put(`/tasks/${el.dataset.id}`, { status: el.value });
    else if (el.dataset.act === "score") await put(`/tasks/${el.dataset.id}`, { reviewScore: el.value });
    await refreshAll();
  };
  $("#tbl-tasks").onclick = (e) => {
    const b = e.target.closest("button[data-act=edit]");
    if (b) dialogEditTask(b.dataset.id);
  };

  // reset seed
  $("#btn-reset").onclick = async () => {
    if (confirm("Reset seluruh data ke kondisi awal (seed dari file lampiran)?")) {
      await post("/reset");
      await refreshAll();
    }
  };
}

// ---------- init ----------
bindOnce();
refreshAll().catch((e) => {
  document.body.insertAdjacentHTML("beforeend", `<p style="color:var(--bad);padding:20px">Gagal memuat data: ${esc(e.message)}. Pastikan server berjalan (npm start).</p>`);
});
