"""Mesin inferensi dan uji KB Squad 2 Sprint 2, Issue #7 (KB versi 5.0.0).

Membaca 03-rules.json, menjalankan forward chaining, mencatat working memory,
mencetak penjelasan aturan yang menyala, lalu menulis hasil-uji.txt.

Jalankan: python3 engine_test.py   (letakkan di folder yang sama dengan 03-rules.json)

Keluaran KB punya dua field terpisah: rekomendasi (SETUJUI, REVISI, TOLAK) dan status_tindak_lanjut
(MENUNGGU_KURASI, MENUNGGU_VERIFIKASI_MITRA). Keduanya bukan status database dan admin tetap pengambil
keputusan akhir. KB hanya membaca partners.is_verified sebagai syarat persetujuan. KB tidak mengubah
partners.is_verified (verifikasi KYC mitra) dan tidak mengubah destinations.status (kurasi destinasi).
"""
import itertools
import json
import os
import re
import sys
from math import asin, cos, degrees, radians, sin, sqrt

HERE = os.path.dirname(os.path.abspath(__file__))
R_BUMI = 6371000.0
JARAK_TANPA_PEMBANDING = 999999
ANTREAN = ("belum_ditinjau", "bukan_duplikat", "duplikat_terkonfirmasi", "perlu_bukti")
VERIFIKASI = ("pending", "verified", "rejected")
APPLICABILITY_FACTS = ("nib_diperlukan", "sk_pokdarwis_diperlukan")
NON_ATTRACTION = ("tour_agent", "accommodation", "transport")


def load_kb(path=None):
    with open(path or os.path.join(HERE, "03-rules.json"), encoding="utf-8") as f:
        return json.load(f)


KB = load_kb()
VALID_APPLICABILITY = tuple(KB["facts_input"]["nib_diperlukan"]["nilai_valid"])  # ("ya", "tidak")


# ---------- jarak ----------
def haversine(a, b):
    """Jarak dalam meter, dibulatkan 1 desimal."""
    p1, l1, p2, l2 = map(radians, [a[0], a[1], b[0], b[1]])
    h = sin((p2 - p1) / 2) ** 2 + cos(p1) * cos(p2) * sin((l2 - l1) / 2) ** 2
    return round(2 * R_BUMI * asin(sqrt(h)), 1)


def equirect(a, b):
    """Pembanding independen untuk jarak pendek (pendekatan ekuirektangular), meter, tanpa pembulatan."""
    p1, l1, p2, l2 = map(radians, [a[0], a[1], b[0], b[1]])
    x = (l2 - l1) * cos((p1 + p2) / 2)
    return R_BUMI * sqrt(x * x + (p2 - p1) ** 2)


def jarak_terdekat(coord, destinasi):
    """Jarak ke destinasi pembanding terdekat (KT3): status approved atau pending, bukan rejected."""
    jarak = [haversine(coord, d["coord"]) for d in destinasi if d["status"] in ("approved", "pending")]
    return min(jarak) if jarak else JARAK_TANPA_PEMBANDING


# ---------- inferensi ----------
def fmt(v):
    if v is True: return "ya"
    if v is False: return "tidak"
    if v is None: return "belum ada"
    if isinstance(v, (list, tuple)): return " / ".join(str(i) for i in v)
    return str(v)


def leaf(c, wm):
    v, op, x = wm.get(c["fact"]), c["op"], c["value"]
    if op == "eq": return v == x
    if op == "ne": return v != x
    if op == "in": return v in x
    if v is None: return False
    if op == "lte": return v <= x
    if op == "gt": return v > x
    raise ValueError(f"operator tidak dikenal: {op}")


def ev(node, wm):
    if "fact" in node: return leaf(node, wm)
    if "all" in node: return all(ev(n, wm) for n in node["all"])
    return any(ev(n, wm) for n in node["any"])


def describe(node, wm):
    """Teks kondisi dengan nilai sebenarnya di working memory. [OK] terpenuhi, [X] tidak terpenuhi."""
    if "fact" in node:
        v, op, x = wm.get(node["fact"]), node["op"], node["value"]
        mark = "[OK]" if leaf(node, wm) else "[X]"
        if op == "eq":
            return f"{node['fact']} = {fmt(v)} {mark}"
        sym = {"ne": "bukan", "lte": "<=", "gt": ">", "in": "salah satu dari"}[op]
        return f"{node['fact']} = {fmt(v)}, syarat {sym} {fmt(x)} {mark}"
    key = "all" if "all" in node else "any"
    glue = " DAN " if key == "all" else " ATAU "
    inner = glue.join(describe(n, wm) for n in node[key])
    return inner if len(node[key]) == 1 else "(" + inner + ")"


def validate(facts, kb=None):
    """Masukan yang tidak bisa ditafsirkan ditolak dengan ValueError, bukan ditebak."""
    kb = kb or KB
    pt = facts.get("partner_type")
    if pt not in kb["sprint1_reference"]["partner_type"]:
        raise ValueError(f"partner_type tidak valid: {pt!r}")
    j = facts.get("jarak_terdekat_m")
    if isinstance(j, bool) or not isinstance(j, (int, float)) or j < 0:
        raise ValueError(f"jarak_terdekat_m wajib berupa angka tidak negatif, dapat {j!r}")
    a = facts.get("status_antrean_kurasi")
    if a is not None and a not in ANTREAN:
        raise ValueError(f"status_antrean_kurasi tidak valid: {a!r}")
    sv = facts.get("status_verifikasi_mitra")
    if sv not in VERIFIKASI:
        raise ValueError(f"status_verifikasi_mitra wajib salah satu dari {VERIFIKASI}, dapat {sv!r}")
    if pt == "attraction":
        for k in APPLICABILITY_FACTS:
            if facts.get(k) not in VALID_APPLICABILITY:
                raise ValueError(f"{k} wajib bernilai ya atau tidak untuk Attraction, dapat {facts.get(k)!r}")


def run(facts, kb=None):
    """Forward chaining. Mengembalikan hasil lengkap termasuk working memory dan jejak aturan."""
    kb = kb or KB
    validate(facts, kb)
    wm, log, fired, finals = {}, [], [], []
    for k, v in facts.items():
        wm[k] = v
        log.append(("input", k, v))
    seen, changed = set(), True
    while changed:
        changed = False
        for r in kb["rules"]:
            if r["id"] in seen: continue
            if ev(r, wm):
                seen.add(r["id"]); fired.append(r); changed = True
                for k, v in r["then"].items():
                    wm[k] = v; log.append((r["id"], k, v))
                for k, v in r.get("then_default", {}).items():
                    if k not in wm:
                        wm[k] = v; log.append((r["id"] + " default", k, v))
                if r["type"] == "akhir": finals.append(r)
    assert len(finals) == 1, f"harus tepat satu aturan akhir, dapat {[r['id'] for r in finals]}"
    out = kb["output_structure"]
    wm.setdefault("rekomendasi", None)
    wm.setdefault("status_tindak_lanjut", None)
    assert (wm["rekomendasi"] is None) != (wm["status_tindak_lanjut"] is None), "tepat satu dari rekomendasi atau status_tindak_lanjut"
    assert wm["rekomendasi"] is None or wm["rekomendasi"] in out["rekomendasi"]["nilai"], f"rekomendasi tidak valid: {wm['rekomendasi']!r}"
    assert wm["status_tindak_lanjut"] is None or wm["status_tindak_lanjut"] in out["status_tindak_lanjut"]["nilai"], "status_tindak_lanjut tidak valid"
    return {"wm": wm, "log": log, "fired": fired, "final": finals[0], "facts": dict(facts)}


def explain(res):
    wm, fin = res["wm"], res["final"]
    out = ["Rekomendasi KB  : " + (wm["rekomendasi"] or "tidak ada (pengajuan ditahan lewat status tindak lanjut)")]
    out.append("Status tindak   : " + (f"{wm['status_tindak_lanjut']} (antrean atau penahanan, bukan rekomendasi)" if wm["status_tindak_lanjut"] else "tidak ada"))
    out.append(f"Cakupan         : {wm['cakupan']} (CF {fin['cf']} biner)")
    out.append("Status lokasi   : " + (wm.get("status_lokasi") or "tidak ada (jarak lebih dari 500 m)"))
    out.append("Aturan menyala  : " + ", ".join(r["id"] for r in res["fired"]))
    out.append("Fakta awal      : " + "; ".join(f"{k} = {fmt(v)}" for k, v in res["facts"].items()))
    out.append("Kesimpulan berurutan di working memory:")
    for i, (src, k, v) in enumerate([x for x in res["log"] if x[0] != "input"], 1):
        out.append(f"  {i}. [{src}] {k} = {fmt(v)}")
    out.append("Penjelasan aturan:")
    for r in res["fired"]:
        out.append(f"  [{r['id']}] {r['name']} (CF {r['cf']}, sumber {', '.join(r['sources'])})")
        out.append("      JIKA  " + describe(r, wm))
        out.append("      MAKA  " + "; ".join(f"{k} = {fmt(v)}" for k, v in r["then"].items()))
        out.append("      ALASAN " + r["explain"])
    if fin.get("db_hint"):
        out.append("Catatan database: " + fin["db_hint"])
    out.append("Rekomendasi dan status tindak lanjut bukan status database. Keputusan akhir ada di admin kurator.")
    out.append("Verifikasi mitra (partners.is_verified), kurasi destinasi (destinations.status), dan antrean kurasi adalah tiga status yang terpisah.")
    return out


# ---------- data uji ----------
EXIST = (-7.9425, 112.9530)   # destinasi pembanding utama (approved), data contoh
PEND = (-7.9700, 112.9000)    # pengajuan lain yang masih pending, data contoh
JAUH = (-7.9190, 112.9500)    # titik jauh. Di sini ada destinasi rejected yang tidak dihitung
DESTINASI = [
    dict(id="D1", nama="Destinasi pembanding utama", coord=EXIST, status="approved"),
    dict(id="D2", nama="Pengajuan lain yang masih pending", coord=PEND, status="pending"),
    dict(id="D3", nama="Pengajuan yang pernah ditolak", coord=JAUH, status="rejected"),
]
DOC_KEYS = ["ktp", "nib", "izin_operasional", "sk_pokdarwis"]
BASE_DOCS = {f"{d}_{s}": True for d in DOC_KEYS for s in ("diunggah", "lolos_periksa")}
NO_NIB = dict(nib_diunggah=False, nib_lolos_periksa=False)
NO_SK = dict(sk_pokdarwis_diunggah=False, sk_pokdarwis_lolos_periksa=False)
NO_IZIN = dict(izin_operasional_diunggah=False, izin_operasional_lolos_periksa=False)


def F(ptype, coord, antrean=None, verif="verified", nib_perlu="tidak", sk_perlu="tidak", dest=None, **over):
    """Penerapan NIB dan SK hanya diisi untuk Attraction. Jarak dihitung dari daftar destinasi pembanding."""
    d = dict(BASE_DOCS); d.update(over)
    d["partner_type"] = ptype
    d["status_verifikasi_mitra"] = verif
    if ptype == "attraction":
        d["nib_diperlukan"] = nib_perlu
        d["sk_pokdarwis_diperlukan"] = sk_perlu
    d["jarak_terdekat_m"] = jarak_terdekat(coord, DESTINASI if dest is None else dest)
    if antrean: d["status_antrean_kurasi"] = antrean
    return d


def lat_pada_jarak(meter):
    return EXIST[0] + degrees(meter / R_BUMI)


LAT500, LAT5001 = lat_pada_jarak(500.0), lat_pada_jarak(500.1)
SAJA, DOKM, POT = "pengajuan_destinasi", "dokumen_mitra", "POTENTIAL_DUPLICATE"
MK, MV = "MENUNGGU_KURASI", "MENUNGGU_VERIFIKASI_MITRA"
DEKAT, DEKAT2, SEDANG = (-7.9435, 112.9535), (-7.9450, 112.9545), (-7.9400, 112.9520)
DEKAT_PEND = (PEND[0] + degrees(200.0 / R_BUMI), PEND[1])   # 200 m dari pengajuan pending
P2C, P4C, P7C, P8C = (-7.9800, 112.9700), (-7.9300, 112.9450), (-7.9600, 112.9400), (-7.9100, 112.9600)
ATT, TA, AC, TR = "attraction", "tour_agent", "accommodation", "transport"

# kode, deskripsi, koordinat, fakta, (rekomendasi, status_tindak_lanjut, status_lokasi, cakupan)
CASES = [
 ("P1", "Attraction lokasi jauh, KTP dan izin pengelolaan valid, NIB dan SK Pokdarwis tidak berlaku, mitra verified",
   JAUH, F(ATT, JAUH, **NO_NIB, **NO_SK), ("SETUJUI", None, None, SAJA)),
 ("P2", "Attraction lokasi jauh, izin pengelolaan tidak diunggah",
   P2C, F(ATT, P2C, **NO_IZIN, **NO_NIB, **NO_SK), ("REVISI", None, None, DOKM)),
 ("P3a", "Attraction sangat dekat (124,1 m), status antrean belum diisi sehingga default belum_ditinjau",
   DEKAT, F(ATT, DEKAT, **NO_NIB, **NO_SK), (None, MK, POT, SAJA)),
 ("P3b", "Titik yang sama dengan P3a, admin mengonfirmasi duplikat",
   DEKAT, F(ATT, DEKAT, antrean="duplikat_terkonfirmasi", **NO_NIB, **NO_SK), ("TOLAK", None, POT, SAJA)),
 ("P4", "Attraction lokasi jauh, NIB dan SK Pokdarwis berlaku dan keduanya valid",
   P4C, F(ATT, P4C, nib_perlu="ya", sk_perlu="ya"), ("SETUJUI", None, None, SAJA)),
 ("P5", "Attraction dikelola Pokdarwis (SK berlaku), SK Pokdarwis tidak diunggah",
   P4C, F(ATT, P4C, sk_perlu="ya", **NO_NIB, **NO_SK), ("REVISI", None, None, DOKM)),
 ("P6", "Attraction dalam 500 m, admin menyatakan destinasi berbeda (bukan_duplikat), dokumen lengkap",
   SEDANG, F(ATT, SEDANG, antrean="bukan_duplikat", nib_perlu="ya", **NO_SK), ("SETUJUI", None, POT, SAJA)),
 ("P7", "Attraction dengan NIB berlaku tetapi NIB tidak lolos pemeriksaan",
   P7C, F(ATT, P7C, nib_perlu="ya", nib_lolos_periksa=False, **NO_SK), ("REVISI", None, None, DOKM)),
 ("P8", "Attraction dengan NIB tidak berlaku, NIB terunggah tetapi tidak lolos, diabaikan",
   P8C, F(ATT, P8C, nib_lolos_periksa=False, **NO_SK), ("SETUJUI", None, None, SAJA)),
 ("P9", "tour_agent lokasi jauh, KTP, NIB, dan izin usaha perjalanan wisata valid, mitra verified",
   JAUH, F(TA, JAUH, **NO_SK), ("SETUJUI", None, None, SAJA)),
 ("P10", "accommodation dalam 500 m, admin menyatakan berbeda, KTP, NIB, dan izin usaha akomodasi valid",
   SEDANG, F(AC, SEDANG, antrean="bukan_duplikat", **NO_SK), ("SETUJUI", None, POT, SAJA)),
 ("P11", "transport sangat dekat, admin mengonfirmasi duplikat",
   DEKAT, F(TR, DEKAT, antrean="duplikat_terkonfirmasi", **NO_SK), ("TOLAK", None, POT, SAJA)),
 ("P12", "tour_agent lokasi jauh, NIB terunggah tetapi tidak lolos pemeriksaan",
   JAUH, F(TA, JAUH, nib_lolos_periksa=False, **NO_SK), ("REVISI", None, None, DOKM)),
 ("P13", "transport lokasi jauh, izin usaha angkutan wisata tidak diunggah",
   JAUH, F(TR, JAUH, **NO_IZIN, **NO_SK), ("REVISI", None, None, DOKM)),
 ("T1", "Batas tepat 500,0 m, belum ditinjau",
   (LAT500, EXIST[1]), F(ATT, (LAT500, EXIST[1]), antrean="belum_ditinjau", **NO_NIB, **NO_SK), (None, MK, POT, SAJA)),
 ("T2", "Batas 500,1 m",
   (LAT5001, EXIST[1]), F(ATT, (LAT5001, EXIST[1]), **NO_NIB, **NO_SK), ("SETUJUI", None, None, SAJA)),
 ("T3", "Dalam 500 m, admin meminta bukti lokasi",
   DEKAT2, F(ATT, DEKAT2, antrean="perlu_bukti", **NO_NIB, **NO_SK), ("REVISI", None, POT, SAJA)),
 ("T4", "Dalam 500 m, admin menyatakan berbeda, tetapi KTP tidak lolos pemeriksaan",
   SEDANG, F(ATT, SEDANG, antrean="bukan_duplikat", ktp_lolos_periksa=False, **NO_NIB, **NO_SK), ("REVISI", None, POT, DOKM)),
 ("T5", "Belum ada destinasi pembanding, jarak_terdekat_m = 999999",
   JAUH, F(ATT, JAUH, dest=[], **NO_NIB, **NO_SK), ("SETUJUI", None, None, SAJA)),
 ("A1", "Mitra yang sama, pengajuan destinasi pertama dikonfirmasi duplikat",
   DEKAT, F(ATT, DEKAT, antrean="duplikat_terkonfirmasi", **NO_NIB, **NO_SK), ("TOLAK", None, POT, SAJA)),
 ("A2", "Mitra yang sama dengan dokumen yang sama, pengajuan destinasi kedua di lokasi jauh",
   JAUH, F(ATT, JAUH, **NO_NIB, **NO_SK), ("SETUJUI", None, None, SAJA)),
 ("A3", "Mitra yang sama mengajukan lokasi 200 m dari pengajuan lain yang masih pending (pending ikut dihitung)",
   DEKAT_PEND, F(ATT, DEKAT_PEND, **NO_NIB, **NO_SK), (None, MK, POT, SAJA)),
 ("A4", "Pengajuan tepat di titik destinasi yang pernah ditolak (rejected tidak dihitung sebagai pembanding)",
   JAUH, F(ATT, JAUH, **NO_NIB, **NO_SK), ("SETUJUI", None, None, SAJA)),
 ("V1", "Attraction lokasi jauh, dokumen lengkap, mitra masih pending: pengajuan ditahan",
   JAUH, F(ATT, JAUH, verif="pending", **NO_NIB, **NO_SK), (None, MV, None, SAJA)),
 ("V2", "Attraction lokasi jauh, dokumen lengkap, mitra rejected",
   JAUH, F(ATT, JAUH, verif="rejected", **NO_NIB, **NO_SK), ("TOLAK", None, None, SAJA)),
 ("V3", "Attraction lokasi jauh, izin pengelolaan tidak diunggah, mitra pending: dokumen didahulukan",
   JAUH, F(ATT, JAUH, verif="pending", **NO_IZIN, **NO_NIB, **NO_SK), ("REVISI", None, None, DOKM)),
 ("V4", "Attraction dalam 500 m belum ditinjau, mitra pending: antrean kurasi didahulukan",
   DEKAT, F(ATT, DEKAT, verif="pending", **NO_NIB, **NO_SK), (None, MK, POT, SAJA)),
 ("V5", "Attraction dalam 500 m, admin menyatakan berbeda, dokumen lengkap, mitra pending",
   SEDANG, F(ATT, SEDANG, antrean="bukan_duplikat", verif="pending", **NO_NIB, **NO_SK), (None, MV, POT, SAJA)),
 ("V6", "tour_agent lokasi jauh, dokumen lengkap, mitra rejected",
   JAUH, F(TA, JAUH, verif="rejected", **NO_SK), ("TOLAK", None, None, SAJA)),
 ("V7", "Attraction dalam 500 m, duplikat terkonfirmasi, mitra rejected: alasan duplikat (R9) yang berlaku",
   DEKAT, F(ATT, DEKAT, antrean="duplikat_terkonfirmasi", verif="rejected", **NO_NIB, **NO_SK), ("TOLAK", None, POT, SAJA)),
]
# aturan yang wajib dan tidak boleh menyala pada kasus tertentu
RULE_EXPECT = {
    "P8": ({"R5", "R13"}, {"R6", "R14", "R15"}),
    "P9": ({"R6", "R13"}, {"R5"}),
    "P7": ({"R12"}, {"R5", "R13"}),
    "V1": ({"R5", "R11", "R14"}, {"R13", "R15", "R12"}),
    "V2": ({"R5", "R11", "R15"}, {"R9", "R13", "R14"}),
    "V3": ({"R12"}, {"R13", "R14", "R15"}),
    "V4": ({"R7", "R8"}, {"R11", "R14", "R15"}),
    "V6": ({"R6", "R11", "R15"}, {"R5", "R9"}),
    "V7": ({"R7", "R9"}, {"R11", "R15"}),
    "T5": ({"R11", "R13"}, {"R7"}),
    "A4": ({"R11", "R13"}, {"R7"}),
}


def execute_cases():
    rows, seen, ok = [], set(), True
    for code, desc, coord, facts, (rek, tl, st, cak) in CASES:
        res = run(facts)
        wm = res["wm"]
        fired = {r["id"] for r in res["fired"]}
        good = wm["rekomendasi"] == rek and wm["status_tindak_lanjut"] == tl and wm.get("status_lokasi") == st and wm["cakupan"] == cak
        good = good and wm.get("akun_mitra_terdampak") is False                       # partners.is_verified tidak diubah
        good = good and wm["status_verifikasi_mitra"] == facts["status_verifikasi_mitra"]
        good = good and not ({"R5", "R6"} <= fired)
        if rek == "SETUJUI":
            good = good and "R13" in fired and facts["status_verifikasi_mitra"] == "verified"
        if code in RULE_EXPECT:
            must, mustnot = RULE_EXPECT[code]
            good = good and must <= fired and not (mustnot & fired)
        seen |= fired
        ok &= good
        rows.append(dict(code=code, desc=desc, coord=coord, facts=facts, res=res, good=good, expected=(rek, tl, st, cak)))
    return rows, seen, ok


# ---------- masukan tidak valid dan fakta hilang ----------
def invalid_inputs():
    base = F(ATT, JAUH, **NO_NIB, **NO_SK)
    msgs = []
    cases = [
        ("partner_type tidak dikenal", dict(partner_type="hotel")),
        ("jarak_terdekat_m hilang", dict(jarak_terdekat_m=None)),
        ("jarak_terdekat_m berupa teks", dict(jarak_terdekat_m="dekat")),
        ("jarak_terdekat_m negatif", dict(jarak_terdekat_m=-1)),
        ("status_antrean_kurasi tidak dikenal", dict(jarak_terdekat_m=100.0, status_antrean_kurasi="ditolak")),
        ("status_verifikasi_mitra hilang", dict(status_verifikasi_mitra=None)),
        ("status_verifikasi_mitra tidak dikenal", dict(status_verifikasi_mitra="approved")),
        ("nib_diperlukan hilang untuk Attraction", dict(nib_diperlukan=None)),
        ("sk_pokdarwis_diperlukan hilang untuk Attraction", dict(sk_pokdarwis_diperlukan=None)),
        ("nib_diperlukan berupa boolean", dict(nib_diperlukan=True)),
        ("sk_pokdarwis_diperlukan bernilai di luar ya atau tidak", dict(sk_pokdarwis_diperlukan="mungkin")),
    ]
    for label, mut in cases:
        f = dict(base); f.update(mut)
        try:
            run(f)
        except ValueError:
            msgs.append(f"ditolak dengan ValueError: {label}")
        else:
            raise AssertionError(f"masukan tidak valid diterima: {label}")
    # penerapan NIB dan SK tidak dipakai tipe lain: tidak wajib dan tidak memengaruhi hasil
    f = F(TA, JAUH, **NO_SK)
    assert "nib_diperlukan" not in f
    r1 = run(f)["wm"]
    f2 = dict(f); f2["nib_diperlukan"] = "tidak"; f2["sk_pokdarwis_diperlukan"] = "tidak"
    r2 = run(f2)["wm"]
    assert (r1["rekomendasi"], r1["status_tindak_lanjut"]) == (r2["rekomendasi"], r2["status_tindak_lanjut"]) == ("SETUJUI", None)
    msgs.append("penerapan NIB dan SK tidak wajib dan tidak memengaruhi hasil untuk tour_agent, accommodation, dan transport")
    # checklist dokumen yang hilang dibaca sebagai belum diunggah dan tidak boleh berujung SETUJUI
    for ptype in (ATT, TA):
        f = F(ptype, JAUH, **NO_NIB, **NO_SK)
        for k in list(f):
            if k.startswith(("ktp_", "izin_operasional_")): del f[k]
        wm = run(f)["wm"]
        assert wm["rekomendasi"] == "REVISI" and wm["status_tindak_lanjut"] is None and wm["cakupan"] == DOKM
    msgs.append("checklist KTP dan izin yang hilang dibaca sebagai belum diunggah: REVISI, tidak pernah SETUJUI")
    return msgs


# ---------- uji pembanding jarak (KT3) ----------
def check_comparators():
    msgs = []
    p = (-7.9500, 112.9100)
    near = (p[0] + degrees(100.0 / R_BUMI), p[1])
    assert jarak_terdekat(p, []) == JARAK_TANPA_PEMBANDING
    for status in ("approved", "pending"):
        assert jarak_terdekat(p, [dict(coord=near, status=status)]) == haversine(p, near) <= 500
    assert jarak_terdekat(p, [dict(coord=near, status="rejected")]) == JARAK_TANPA_PEMBANDING
    far = dict(coord=EXIST, status="approved")
    assert jarak_terdekat(p, [dict(coord=near, status="rejected"), far]) == haversine(p, EXIST)
    assert jarak_terdekat(p, [far, dict(coord=near, status="pending")]) == haversine(p, near)
    msgs.append("pembanding jarak (KT3): approved dan pending dihitung, rejected tidak dihitung, tanpa pembanding = 999999, yang terdekat dipilih")
    d3 = next(d for d in DESTINASI if d["status"] == "rejected")
    assert haversine(d3["coord"], EXIST) > 500 and jarak_terdekat(d3["coord"], DESTINASI) == haversine(d3["coord"], EXIST)
    return msgs


# ---------- uji menyeluruh dengan pembanding independen ----------
def oracle(pt, ktp, nib, izin, sk, nibp, skp, verif, jarak, antr):
    """ktp, nib, izin, sk bernilai True hanya jika diunggah DAN lolos. nibp, skp adalah penerapan NIB dan SK (Attraction)."""
    if jarak <= 500:
        a = antr or "belum_ditinjau"
        if a == "belum_ditinjau": return (None, MK, SAJA)
        if a == "duplikat_terkonfirmasi": return ("TOLAK", None, SAJA)
        if a == "perlu_bukti": return ("REVISI", None, SAJA)
    if pt == "attraction":
        lengkap = ktp and izin and (nibp == "tidak" or nib) and (skp == "tidak" or sk)
    else:
        lengkap = ktp and nib and izin
    if not lengkap: return ("REVISI", None, DOKM)
    if verif == "verified": return ("SETUJUI", None, SAJA)
    if verif == "pending": return (None, MV, SAJA)
    return ("TOLAK", None, SAJA)


def exhaustive():
    n, outcomes = 0, {}
    states = [(2000, None), (500.1, None), (500.0, None), (500.0, "belum_ditinjau"),
              (500.0, "duplikat_terkonfirmasi"), (500.0, "perlu_bukti"), (500.0, "bukan_duplikat")]
    doc_states = [(False, False), (True, False), (True, True)]       # (diunggah, lolos_periksa)
    for pt in KB["sprint1_reference"]["partner_type"]:
        app_states = list(itertools.product(VALID_APPLICABILITY, repeat=2)) if pt == "attraction" else [(None, None)]
        for ktp, nib, izin, sk in itertools.product(doc_states, repeat=4):
            for (nibp, skp), verif in itertools.product(app_states, VERIFIKASI):
                for jarak, antr in states:
                    f = dict(partner_type=pt, jarak_terdekat_m=jarak, status_verifikasi_mitra=verif,
                             ktp_diunggah=ktp[0], ktp_lolos_periksa=ktp[1],
                             nib_diunggah=nib[0], nib_lolos_periksa=nib[1],
                             izin_operasional_diunggah=izin[0], izin_operasional_lolos_periksa=izin[1],
                             sk_pokdarwis_diunggah=sk[0], sk_pokdarwis_lolos_periksa=sk[1])
                    if nibp is not None: f["nib_diperlukan"] = nibp; f["sk_pokdarwis_diperlukan"] = skp
                    if antr: f["status_antrean_kurasi"] = antr
                    before = dict(f)
                    res = run(f)
                    wm, fired = res["wm"], {r["id"] for r in res["fired"]}
                    got = (wm["rekomendasi"], wm["status_tindak_lanjut"], wm["cakupan"])
                    assert f == before, "masukan tidak boleh diubah oleh engine"
                    assert wm["status_verifikasi_mitra"] == verif, "KB tidak boleh mengubah status verifikasi mitra"
                    assert (got[0] is None) != (got[1] is None), "tepat satu dari rekomendasi atau status_tindak_lanjut"
                    assert wm["rekomendasi"] not in (MK, MV), "status tindak lanjut bukan rekomendasi"
                    ok = lambda d: d[0] and d[1]
                    exp = oracle(pt, ok(ktp), ok(nib), ok(izin), ok(sk), nibp, skp, verif, jarak, antr)
                    assert got == exp, (pt, ktp, nib, izin, sk, nibp, skp, verif, jarak, antr, got, exp)
                    near = jarak <= 500
                    assert wm["akun_mitra_terdampak"] is False
                    assert not ({"R5", "R6"} <= fired)
                    if got[0] == "TOLAK":
                        assert (near and antr == "duplikat_terkonfirmasi") or (not near or antr == "bukan_duplikat") and verif == "rejected"
                    if near and antr in (None, "belum_ditinjau"):
                        assert got == (None, MK, SAJA), "potensi duplikat tidak boleh langsung diputuskan"
                    if got[0] == "SETUJUI":
                        assert verif == "verified" and "R13" in fired, "SETUJUI hanya untuk mitra verified"
                    if verif != "verified":
                        assert got[0] != "SETUJUI"
                    if got[1] == MV:
                        assert verif == "pending" and "R14" in fired
                    outcomes[got] = outcomes.get(got, 0) + 1
                    n += 1
    return n, outcomes


def check_haversine():
    msgs = []
    pts = [(-7.9435, 112.9535), (-7.9400, 112.9520), (-7.9450, 112.9545), (-7.9190, 112.9500),
           (LAT500, EXIST[1]), (LAT5001, EXIST[1]), (EXIST[0], EXIST[1] + 0.0045)]
    for p in pts:
        d, e = haversine(p, EXIST), equirect(p, EXIST)
        assert abs(d - e) < 0.5 + e * 1e-5, (p, d, e)
    assert haversine((LAT500, EXIST[1]), EXIST) == 500.0 and haversine((LAT5001, EXIST[1]), EXIST) == 500.1
    msgs.append("Haversine cocok dengan pendekatan ekuirektangular independen (selisih < 0,5 m) dan batas 500,0 m dan 500,1 m benar")
    return msgs


# ---------- pemeriksaan struktur KB dan konsistensi file ----------
def facts_read(node):
    if "fact" in node: return {node["fact"]}
    return set().union(*(facts_read(n) for n in node.get("all", node.get("any", []))))


def check_kb():
    msgs = []
    ids = [r["id"] for r in KB["rules"]]
    assert ids == [f"R{i}" for i in range(1, len(ids) + 1)], "ID aturan tidak berurutan"
    assert 10 <= len(ids) <= 15, "jumlah aturan harus 10 sampai 15"
    ops_ok = set(KB["meta"]["operators"])

    def ops(n):
        if "fact" in n: return {n["op"]}
        return set().union(*(ops(c) for c in n.get("all", n.get("any", []))))
    for r in KB["rules"]:
        assert r["sources"] and all(s in KB["sources"] for s in r["sources"]), (r["id"], "sumber tidak dikenal")
        assert r["type"] in ("antara", "akhir")
        assert r["cf"] == 1.0
        assert ops(r) <= ops_ok, (r["id"], "operator tidak tercantum di meta.operators")
        assert (("all" in r) != ("any" in r)), (r["id"], "harus punya tepat satu all atau any di puncak")
    assert KB["sprint1_reference"]["partner_type"] == ["attraction", "tour_agent", "accommodation", "transport"]
    assert KB["sprint1_reference"]["is_verified"] == list(VERIFIKASI)
    msgs.append(f"{len(ids)} aturan, ID berurutan, sumber dan operator valid, partner_type dan is_verified sesuai Sprint 1")

    # urutan evaluasi: penghasil fakta selalu ber-ID lebih kecil daripada pembacanya (penting untuk operator ne)
    prod = {}
    for r in KB["rules"]:
        for k in list(r["then"]) + list(r.get("then_default", {})):
            prod.setdefault(k, []).append(int(r["id"][1:]))
    depth = {}
    for r in KB["rules"]:
        rid = int(r["id"][1:])
        ds = [0]
        for k in facts_read(r):
            for p in prod.get(k, []):
                assert p < rid, f"{r['id']} membaca {k} yang dihasilkan R{p} (urutan evaluasi salah)"
                ds.append(depth[p])
        depth[rid] = 1 + max(ds)
    longest = max(depth.values())
    assert longest == 3, f"rantai terpanjang berubah: {longest}"
    msgs.append("urutan evaluasi benar (penghasil fakta selalu sebelum pembaca), rantai terpanjang 3 aturan berurutan")

    # penerapan NIB dan SK: dua nilai eksplisit, R5 hanya memakai eq
    for k in APPLICABILITY_FACTS:
        assert KB["facts_input"][k]["tipe"] == "teks" and KB["facts_input"][k]["nilai_valid"] == ["ya", "tidak"]
    r5 = next(r for r in KB["rules"] if r["id"] == "R5")
    assert '"op": "ne"' not in json.dumps(r5), "R5 tidak boleh memakai operator ne"
    r12 = next(r for r in KB["rules"] if r["id"] == "R12")
    assert any(c.get("fact") == "dokumen_lengkap" and c["op"] == "ne" and c["value"] is True for c in r12["all"])
    msgs.append("penerapan NIB dan SK bernilai ya atau tidak: R5 hanya memakai eq, R12 memakai ne pada dokumen_lengkap setelah R5 dan R6")

    # pemisahan tiga status
    sep = KB["separation"]
    assert sep["partner_kyc"]["field"] == "partners.is_verified" and sep["destination_curation"]["field"] == "destinations.status"
    assert sep["partner_kyc"]["dibaca_kb"] is True and sep["partner_kyc"]["diubah_oleh_kb"] is False
    assert sep["destination_curation"]["dibaca_kb"] is False and sep["destination_curation"]["diubah_oleh_kb"] is False
    for r in KB["rules"]:
        assert not any(k.startswith(("partners.", "destinations.", "is_verified", "status_verifikasi")) for k in r["then"]), r["id"]
        if r["type"] == "akhir":
            assert r["then"].get("akun_mitra_terdampak") is False, (r["id"], "akun_mitra_terdampak harus tidak")
            assert "partners.is_verified" in r.get("db_hint", "") and "tidak diubah" in r["db_hint"], (r["id"], "db_hint harus menyebut partners.is_verified tidak diubah")
    readers = [r["id"] for r in KB["rules"] if "status_verifikasi_mitra" in facts_read(r)]
    assert readers == ["R13", "R14", "R15"], readers
    assert not any(k.startswith("destinations.") or k == "status_destinasi" for r in KB["rules"] for k in facts_read(r))
    msgs.append("pemisahan status: hanya R13, R14, R15 membaca status verifikasi mitra, tidak ada aturan yang menulisnya, tidak ada aturan yang membaca atau menulis destinations.status, semua aturan akhir membawa akun_mitra_terdampak = tidak")
    return msgs


def check_output_structure():
    msgs = []
    out = KB["output_structure"]
    assert out["rekomendasi"]["nilai"] == ["SETUJUI", "REVISI", "TOLAK"]
    assert out["status_tindak_lanjut"]["nilai"] == ["MENUNGGU_KURASI", "MENUNGGU_VERIFIKASI_MITRA"]
    allowed = {"rekomendasi", "status_tindak_lanjut", "cakupan", "akun_mitra_terdampak"}
    by_rek, by_tl = [], []
    for r in KB["rules"]:
        if r["type"] != "akhir":
            assert not ({"rekomendasi", "status_tindak_lanjut"} & set(r["then"])), r["id"]
            continue
        assert set(r["then"]) == allowed - ({"status_tindak_lanjut"} if "rekomendasi" in r["then"] else {"rekomendasi"}), (r["id"], r["then"])
        assert ("rekomendasi" in r["then"]) != ("status_tindak_lanjut" in r["then"]), r["id"]
        assert r["then"].get("rekomendasi") not in out["status_tindak_lanjut"]["nilai"], (r["id"], "status tindak lanjut bukan rekomendasi")
        (by_rek if "rekomendasi" in r["then"] else by_tl).append(r["id"])
        for k, v in r["then"].items():
            if k in out and "nilai" in out[k]:
                assert v in out[k]["nilai"], (r["id"], k, v)
    assert by_rek == ["R9", "R10", "R12", "R13", "R15"] and by_tl == ["R8", "R14"], (by_rek, by_tl)
    assert "R9, R10, R12, R13, R15" in out["invarian"] and "R8, R14" in out["invarian"]
    msgs.append("keluaran dipisah: rekomendasi (SETUJUI, REVISI, TOLAK) diisi R9, R10, R12, R13, R15. status_tindak_lanjut (MENUNGGU_KURASI, MENUNGGU_VERIFIKASI_MITRA) diisi R8, R14. Tidak ada aturan yang memberi nilai status tindak lanjut pada field rekomendasi")
    return msgs


def check_ketentuan():
    """Ketentuan operasional KT1 sampai KT9 terpasang pada engine: yang diuji perilakunya diperiksa langsung."""
    msgs = []
    kt = {k["id"]: k for k in KB["ketentuan_operasional"]}
    assert list(kt) == [f"KT{i}" for i in range(1, 10)]
    # KT1: syarat dokumen per tipe
    for pt in NON_ATTRACTION:
        for lepas in ("ktp", "nib", "izin_operasional"):
            f = F(pt, JAUH, **NO_SK); f[f"{lepas}_lolos_periksa"] = False
            assert run(f)["wm"]["rekomendasi"] == "REVISI", (pt, lepas)
    f = F(ATT, JAUH, **NO_NIB, **NO_SK)
    assert run(f)["wm"]["rekomendasi"] == "SETUJUI"
    # KT2: penerapan NIB dan SK menentukan dokumen yang wajib
    g = dict(f); g["nib_diperlukan"] = "ya"
    assert run(g)["wm"]["rekomendasi"] == "REVISI"
    g = dict(f); g["sk_pokdarwis_diperlukan"] = "ya"
    assert run(g)["wm"]["rekomendasi"] == "REVISI"
    # KT4: keempat partner_type diproses
    for pt in KB["sprint1_reference"]["partner_type"]:
        assert run(F(pt, JAUH, **NO_SK, **(NO_NIB if pt == ATT else {})))["wm"]["rekomendasi"] == "SETUJUI", pt
    # KT5: status verifikasi mitra sebagai syarat persetujuan
    hasil = {v: run(F(ATT, JAUH, verif=v, **NO_NIB, **NO_SK))["wm"] for v in VERIFIKASI}
    assert (hasil["verified"]["rekomendasi"], hasil["pending"]["status_tindak_lanjut"], hasil["rejected"]["rekomendasi"]) == ("SETUJUI", MV, "TOLAK")
    msgs.append("ketentuan operasional teruji: KT1 syarat dokumen per tipe, KT2 penerapan NIB dan SK, KT4 empat partner_type diproses, KT5 verified = SETUJUI, pending = MENUNGGU_VERIFIKASI_MITRA, rejected = TOLAK")
    return msgs


# ---------- konsistensi file ----------
# kosakata huruf kapital yang sah di berkas serahan: nilai keluaran KB, flag lokasi, keputusan reviewer wireflow, dan istilah umum
def vocab_sah():
    out = KB["output_structure"]
    return set(out["rekomendasi"]["nilai"]) | set(out["status_tindak_lanjut"]["nilai"]) | {
        "POTENTIAL_DUPLICATE", "VERIFIED", "REJECTED", "README", "POINT", "ALASAN", "TIDAK"}


KAPITAL = re.compile(r"\b[A-Z][A-Z_]{4,}\b")
QUEUE_AS_REK = re.compile(r"rekomendasi\s*(=|:)\s*MENUNGGU_(KURASI|VERIFIKASI_MITRA)|Rekomendasi KB\s*:\s*MENUNGGU", re.I)
FORBIDDEN = re.compile(r"is_verified\s*=\s*verified\s*(oleh|karena|setelah)\s*(kurasi|persetujuan)", re.I)
DELIVERABLES = ("01-tabel-aturan.md", "02-rantai-aturan.md", "03-rules.json", "04-skenario-pengujian.md", "engine_test.py")


def read(name):
    p = os.path.join(HERE, name)
    return open(p, encoding="utf-8").read() if os.path.exists(p) else None


def idn(x):
    return f"{x:,.1f}".replace(",", "X").replace(".", ",").replace("X", ".")


def check_files():
    msgs = []
    t1 = read("01-tabel-aturan.md")
    if t1 is None:
        return ["01-tabel-aturan.md tidak ada di folder ini, pemeriksaan konsistensi file dilewati"]
    assert f"Versi KB: {KB['meta']['kb_version']}" in t1, "versi KB di 01 berbeda dari JSON"
    rows = {}
    for line in t1.splitlines():
        m = re.match(r"^\| (R\d+) \| .* \| (Antara|Akhir) \| (S\d(?:, S\d)*) \|$", line)
        if m: rows[m.group(1)] = m.groups()[1:]
    assert list(rows) == [r["id"] for r in KB["rules"]], "ID di 01-tabel-aturan.md tidak sama dengan JSON"
    for r in KB["rules"]:
        jenis, src = rows[r["id"]]
        assert jenis.lower() == r["type"] and src.split(", ") == r["sources"], r["id"]
    msgs.append("01-tabel-aturan.md: versi KB, ID, jenis, dan sumber sama dengan 03-rules.json")
    krows = {}
    for line in t1.splitlines():
        m = re.match(r"^\| (KT\d+) \| (.+?) \| (.+) \|$", line)
        if m: krows[m.group(1)] = (m.group(2), m.group(3))
    exp = {k["id"]: (k["judul"], k["isi"]) for k in KB["ketentuan_operasional"]}
    assert krows == exp, "ketentuan operasional di 01 tidak sama dengan JSON"
    msgs.append(f"01-tabel-aturan.md: {len(exp)} ketentuan operasional sama persis dengan JSON")
    for r in KB["rules"]:
        if r.get("db_hint"):
            assert r["db_hint"] in t1, f"db_hint {r['id']} tidak ada di 01-tabel-aturan.md"
    msgs.append("01-tabel-aturan.md: catatan database setiap aturan akhir sama persis dengan db_hint di JSON")
    for sid, teks in KB["sources"].items():
        assert f"| {sid} | {teks} |" in t1, f"sumber {sid} di 01 tidak sama dengan JSON"
    msgs.append("01-tabel-aturan.md: sembilan sumber (S1 sampai S9) sama dengan JSON")

    for name in ("02-rantai-aturan.md", "04-skenario-pengujian.md"):
        t = read(name)
        if t is not None:
            miss = [r["id"] for r in KB["rules"] if not re.search(rf"\b{r['id']}\b", t)]
            assert not miss, f"{name} tidak menyebut {miss}"
            msgs.append(f"{name}: menyebut semua ID aturan")
    t2 = read("02-rantai-aturan.md")
    if t2 is not None:
        assert "3 aturan berurutan" in t2, "02 harus menyebut rantai terpanjang 3 aturan berurutan"
        assert f"KB versi {KB['meta']['kb_version']}" in t2
    t4 = read("04-skenario-pengujian.md")
    if t4 is not None:
        assert f"KB versi {KB['meta']['kb_version']}" in t4
        assert f"Ringkasan {len(CASES)} skenario" in t4, "jumlah skenario di 04 tidak sama dengan CASES"
        srows = {}
        pola = (r"^\| (\w+) \| (\w+) \| ([^|]+) \| ([\d.,]+) \| (\S+(?: \S+)*) \| (\w+) \| ([R\d, ]+) \| (\w+|-) \| (\w+|-) \| (\w+) \|$")
        for line in t4.splitlines():
            m = re.match(pola, line)
            if m: srows[m.group(1)] = m.groups()
        assert list(srows) == [c[0] for c in CASES], "daftar skenario di 04 tidak sama dengan CASES"
        for code, desc, coord, facts, exp_ in CASES:
            res = run(facts); wm = res["wm"]; g = srows[code]
            assert g[1] == facts["partner_type"] and g[3] == idn(facts["jarak_terdekat_m"]), code
            assert g[4] == facts.get("status_antrean_kurasi", "tidak diberikan"), code
            assert g[5] == facts["status_verifikasi_mitra"], code
            assert g[6].split(", ") == [r["id"] for r in res["fired"]], (code, g[6])
            assert g[7] == (wm["rekomendasi"] or "-") and g[8] == (wm["status_tindak_lanjut"] or "-") and g[9] == wm["cakupan"], code
            sec = re.search(rf"^### {code}: .*?(?=^### |^## )", t4, re.S | re.M).group(0)
            exp_text = "rekomendasi = " + (wm["rekomendasi"] or "tidak ada") + ", status_tindak_lanjut = " + (wm["status_tindak_lanjut"] or "tidak ada")
            assert f"Hasil yang diharapkan: {exp_text}" in sec, (code, "hasil yang diharapkan di 04 tidak sama dengan engine")
            assert not QUEUE_AS_REK.search(sec), code
        msgs.append(f"04-skenario-pengujian.md: tabel ringkasan {len(CASES)} skenario cocok dengan hasil eksekusi engine")
    for name in DELIVERABLES:
        t = read(name)
        if t is not None:
            assert not FORBIDDEN.search(t), f"{name} mengaitkan persetujuan destinasi dengan perubahan partners.is_verified"
            assert not QUEUE_AS_REK.search(t), f"{name} menulis status tindak lanjut sebagai rekomendasi"
            if name != "engine_test.py":
                asing = sorted(set(KAPITAL.findall(t)) - vocab_sah())
                assert not asing, f"{name} memuat istilah status di luar kosakata KB: {asing}"
    msgs.append("berkas 01, 02, 03, dan 04 hanya memakai kosakata status milik KB (tidak ada label status sementara atau peringatan sisa)")
    msgs.append("berkas 01, 02, 03, dan 04: status tindak lanjut tidak pernah ditulis sebagai rekomendasi dan persetujuan destinasi tidak mengubah partners.is_verified")
    for name in ("01-tabel-aturan.md", "02-rantai-aturan.md", "04-skenario-pengujian.md"):
        t = read(name)
        if t is not None:
            for kata in ("status_tindak_lanjut", "MENUNGGU_VERIFIKASI_MITRA", "partners.is_verified", "destinations.status"):
                assert kata in t, f"{name} tidak menyebut {kata}"
    msgs.append("berkas 01, 02, dan 04 menyebut status_tindak_lanjut, MENUNGGU_VERIFIKASI_MITRA, partners.is_verified, dan destinations.status")
    return msgs


def main():
    out = []
    out.append(f"HASIL UJI KB SQUAD 2 SPRINT 2 ISSUE #7 (KB versi {KB['meta']['kb_version']})")
    out.append("Dibuat oleh engine_test.py dari eksekusi nyata atas 03-rules.json")
    out.append("")
    out.append("1. STRUKTUR KB")
    for m in check_kb(): out.append("   " + m)
    out.append("   03-rules.json dapat dibaca sebagai JSON valid")
    for m in check_haversine(): out.append("   " + m)
    for m in check_comparators(): out.append("   " + m)
    for m in check_output_structure(): out.append("   " + m)
    for m in check_ketentuan(): out.append("   " + m)
    out.append("")
    rows, seen, ok = execute_cases()
    out.append(f"2. KASUS UJI ({len(rows)} kasus)")
    for r in rows:
        wm = r["res"]["wm"]
        out.append(f"   {'LULUS' if r['good'] else 'GAGAL'} | {r['code']} | {r['facts']['partner_type']} | "
                   f"jarak={r['facts']['jarak_terdekat_m']} m | status_lokasi={wm.get('status_lokasi')} | "
                   f"status_mitra={wm['status_verifikasi_mitra']} | "
                   f"aturan={','.join(x['id'] for x in r['res']['fired'])} | rekomendasi={wm['rekomendasi'] or '-'} | "
                   f"status_tindak_lanjut={wm['status_tindak_lanjut'] or '-'} | cakupan={wm['cakupan']} | "
                   f"partners.is_verified_diubah={fmt(wm['akun_mitra_terdampak'])}")
    allr = {r["id"] for r in KB["rules"]}
    out.append("   Cakupan aturan: " + ", ".join(sorted(seen, key=lambda x: int(x[1:]))) +
               (f"  (semua {len(allr)} aturan teruji)" if seen == allr else f"  TIDAK TERUJI: {sorted(allr - seen)}"))
    out.append("")
    out.append("3. MASUKAN TIDAK VALID DAN FAKTA HILANG")
    for m in invalid_inputs(): out.append("   " + m)
    out.append("")
    n, outcomes = exhaustive()
    out.append("4. UJI MENYELURUH")
    out.append(f"   {n} kombinasi (4 partner_type, 81 kombinasi status dokumen, 3 status verifikasi mitra, 4 kombinasi penerapan "
               f"NIB dan SK khusus Attraction, 7 keadaan lokasi dan antrean) cocok dengan pembanding independen")
    out.append("   Sebaran hasil (rekomendasi / status_tindak_lanjut / cakupan): " + "; ".join(
        f"{k[0] or '-'} / {k[1] or '-'} / {k[2]} = {v}" for k, v in sorted(outcomes.items(), key=lambda kv: tuple(str(x) for x in kv[0]))))
    out.append("   Properti terjaga: potensi duplikat tidak pernah langsung ditolak; TOLAK hanya setelah duplikat_terkonfirmasi "
               "atau jika mitra berstatus rejected; SETUJUI hanya untuk mitra verified dengan lokasi lolos dan dokumen lengkap; "
               "mitra pending ditahan lewat MENUNGGU_VERIFIKASI_MITRA; status verifikasi mitra dan masukan tidak pernah diubah engine; "
               "setiap keluaran membawa partners.is_verified tidak diubah")
    out.append("")
    out.append("5. KONSISTENSI FILE")
    for m in check_files(): out.append("   " + m)
    out.append("")
    out.append("6. PENJELASAN PER KASUS")
    for r in rows:
        out.append("")
        out.append(f"--- {r['code']}: {r['desc']} ---")
        out.extend(explain(r["res"]))
    final = ok and seen == allr
    out.append("")
    out.append("SEMUA LULUS" if final else "ADA MASALAH")
    text = "\n".join(out) + "\n"
    print(text)
    with open(os.path.join(HERE, "hasil-uji.txt"), "w", encoding="utf-8") as f:
        f.write(text)
    sys.exit(0 if final else 1)


if __name__ == "__main__":
    main()
