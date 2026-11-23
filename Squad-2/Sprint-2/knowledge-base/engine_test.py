"""Uji KB Squad 2 (03-rules.json v3) dengan forward chaining.
Jarak dihitung dari koordinat memakai Haversine (R = 6.371.000 m, dibulatkan 1 desimal).
Jalankan: python3 engine_test.py  (03-rules.json harus satu folder)"""
import json
from math import radians, sin, cos, asin, sqrt, degrees

R = 6371000.0
EXIST = (-7.9425, 112.9530)  # destinasi contoh yang sudah terdaftar, acuan jarak

def haversine(a, b):
    p1, l1, p2, l2 = map(radians, [a[0], a[1], b[0], b[1]])
    h = sin((p2 - p1) / 2) ** 2 + cos(p1) * cos(p2) * sin((l2 - l1) / 2) ** 2
    return round(2 * R * asin(sqrt(h)), 1)

kb = json.load(open("03-rules.json"))

def leaf(c, f):
    v, o, x = f.get(c["fact"]), c["op"], c["value"]
    if o == "eq": return v == x
    if o == "ne": return v != x
    if v is None: return False
    if o == "lte": return v <= x
    if o == "gt": return v > x
    raise ValueError(o)

def ev(node, f):
    if "fact" in node: return leaf(node, f)
    if "all" in node: return all(ev(n, f) for n in node["all"])
    return any(ev(n, f) for n in node["any"])

def run(facts):
    f, fired, finals, changed = dict(facts), [], [], True
    while changed:
        changed = False
        for r in kb["rules"]:
            if r["id"] in fired: continue
            if ev(r, f):
                fired.append(r["id"]); changed = True
                if r["type"] == "akhir": finals.append(r)
                f.update(r["then"])
    assert len(finals) == 1, f"harus tepat satu aturan akhir, dapat {[r['id'] for r in finals]}"
    return fired, f

BASE = dict(ktp_diunggah=True, ktp_terbaca=True, nib_diunggah=True, nib_status_aktif=True,
            sk_diunggah=True, sk_berlaku=True)

def facts(kategori, coord, antrean=None, **dok):
    d = dict(BASE); d.update(dok)
    d["kategori_mitra"] = kategori
    d["jarak_terdekat_m"] = haversine(coord, EXIST)
    if antrean: d["status_antrean_kurasi"] = antrean
    return d

lat500 = EXIST[0] + degrees(500.0 / R)
lat5001 = EXIST[0] + degrees(500.1 / R)
NOSK = dict(sk_diunggah=False, sk_berlaku=False)
NONIB = dict(nib_diunggah=False, nib_status_aktif=False)

# kode, kategori, koordinat, antrean, dokumen, (hasil, status_lokasi, cakupan)
CASES = [
 ("P1",  "perorangan",       (-7.9190, 112.9500), None, NOSK,                    ("SETUJUI", None, "pengajuan_destinasi")),
 ("P2",  "usaha_pariwisata", (-7.9800, 112.9700), None, dict(sk_berlaku=False),  ("REVISI", None, "dokumen_mitra")),
 ("P3a", "usaha_pariwisata", (-7.9435, 112.9535), "belum_ditinjau", {},          ("MENUNGGU_KURASI", "POTENTIAL_DUPLICATE", "pengajuan_destinasi")),
 ("P3b", "usaha_pariwisata", (-7.9435, 112.9535), "duplikat_terkonfirmasi", {},  ("TOLAK", "POTENTIAL_DUPLICATE", "pengajuan_destinasi")),
 ("P4",  "pokdarwis",        (-7.9300, 112.9450), None, NONIB,                   ("SETUJUI", None, "pengajuan_destinasi")),
 ("P5",  "pokdarwis",        (-7.9300, 112.9450), None, NOSK,                    ("REVISI", None, "dokumen_mitra")),
 ("P6",  "bumdes",           (-7.9400, 112.9520), "bukan_duplikat", {},          ("SETUJUI", "POTENTIAL_DUPLICATE", "pengajuan_destinasi")),
 ("P7",  "bumdes",           (-7.9600, 112.9400), None, dict(nib_status_aktif=False), ("REVISI", None, "dokumen_mitra")),
 ("P8",  "perorangan",       (-7.9100, 112.9600), None, dict(sk_berlaku=False),  ("SETUJUI", None, "pengajuan_destinasi")),
 ("T1",  "perorangan",       (lat500, EXIST[1]),  "belum_ditinjau", {},          ("MENUNGGU_KURASI", "POTENTIAL_DUPLICATE", "pengajuan_destinasi")),
 ("T2",  "perorangan",       (lat5001, EXIST[1]), None, {},                      ("SETUJUI", None, "pengajuan_destinasi")),
 ("T3",  "perorangan",       (-7.9450, 112.9545), "perlu_bukti", {},             ("REVISI", "POTENTIAL_DUPLICATE", "pengajuan_destinasi")),
 ("T4",  "usaha_pariwisata", (-7.9400, 112.9520), "bukan_duplikat", dict(ktp_terbaca=False), ("REVISI", "POTENTIAL_DUPLICATE", "dokumen_mitra")),
 ("A1",  "usaha_pariwisata", (-7.9435, 112.9535), "duplikat_terkonfirmasi", {},  ("TOLAK", "POTENTIAL_DUPLICATE", "pengajuan_destinasi")),
 ("A2",  "usaha_pariwisata", (-7.9190, 112.9500), None, {},                      ("SETUJUI", None, "pengajuan_destinasi")),
]

def execute():
    rows, seen, ok = [], set(), True
    for code, kat, coord, antr, dok, (exp, expst, expcak) in CASES:
        fa = facts(kat, coord, antr, **dok)
        fired, f = run(fa)
        seen |= set(fired)
        good = (f["rekomendasi"] == exp and f.get("status_lokasi") == expst and f["cakupan"] == expcak)
        if exp == "TOLAK":
            good = good and f.get("akun_mitra_terdampak") is False
        ok &= good
        rows.append(dict(code=code, kategori=kat, coord=coord, antrean=antr, jarak=fa["jarak_terdekat_m"],
                         status=f.get("status_lokasi"), fired=fired, rekomendasi=f["rekomendasi"],
                         cakupan=f["cakupan"], good=good))
    allr = {r["id"] for r in kb["rules"]}
    return rows, seen, allr, ok

if __name__ == "__main__":
    rows, seen, allr, ok = execute()
    out = []
    for r in rows:
        out.append(f"{'LULUS' if r['good'] else 'GAGAL'} | {r['code']} | {r['kategori']} | jarak={r['jarak']} m | "
                   f"status_lokasi={r['status']} | aturan={','.join(r['fired'])} | hasil={r['rekomendasi']} | cakupan={r['cakupan']}")
    out.append("Cakupan aturan: " + str(sorted(seen, key=lambda x: int(x[1:]))) + "  tidak teruji: " + str(sorted(allr - seen)))
    out.append("SEMUA LULUS" if ok and seen == allr else "ADA MASALAH")
    text = "\n".join(out)
    print(text)
    open("hasil-uji.txt", "w").write(text + "\n")
