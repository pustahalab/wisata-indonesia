# Panduan Integrasi Slack dengan Repositori GitHub & Ekosistem NusantaraGo
**Repositori:** [pustahalab/wisata-indonesia](https://github.com/pustahalab/wisata-indonesia)  
**Product Owner:** Denny J.C. Sihombing  
**Scrum Master:** Denny J.C. Sihombing  

---

## 1. Struktur Kanal (Channels) Slack yang Direkomendasikan

Untuk mengelola 27 mahasiswa (5 Squads) dan Product Owner secara teratur, disarankan membuat struktur kanal berikut di ruang kerja (*workspace*) Slack:

```
#announcements               -> Pengumuman resmi PO & Scrum Master
#scrum-of-scrums             -> Koordinasi 5 Squad Leads, SM, dan PO
#github-activity             -> Notifikasi real-time commit, PR, dan CI/CD
#squad-1-directory           -> Diskusi internal Squad 1 (Lead: Oda)
#squad-2-partner-ticketing   -> Diskusi internal Squad 2 (Lead: Gabriella)
#squad-3-tour-package        -> Diskusi internal Squad 3 (Lead: Jessica)
#squad-4-transport-homestay  -> Diskusi internal Squad 4 (Lead: Hesekiel)
#squad-5-core-escrow-ai      -> Diskusi internal Squad 5 (Lead: George)
```

---

## 2. Metode 1: Integrasi Resmi Aplikasi GitHub untuk Slack (Paling Direkomendasikan)

Metode ini memungkinkan tim menerima notifikasi Issue, Pull Request, dan commit secara interaktif serta menjalankan perintah slash langsung di Slack.

### Langkah-Langkah:
1. **Pasang Aplikasi GitHub di Slack:**
   * Buka peramban dan kunjungi: [https://slack.github.com](https://slack.github.com)
   * Klik tombol **Add to Slack** dan pilih *Workspace* Slack tim Anda.
2. **Login & Otorisasi:**
   * Pada kanal Slack (misal: `#github-activity`), ketik perintah:
     ```
     /github signin
     ```
   * Klik tautan yang muncul untuk mengotorisasi akun GitHub Anda (`pustahalab`).
3. **Langganan (Subscribe) ke Repositori:**
   * Hubungkan kanal dengan repositori `pustahalab/wisata-indonesia`:
     ```
     /github subscribe pustahalab/wisata-indonesia
     ```
4. **Kustomisasi Fitur Notifikasi:**
   * Agar notifikasi mencakup Pull Request, Issue, dan hasil build CI:
     ```
     /github subscribe pustahalab/wisata-indonesia issues,pulls,statuses,deployments,comments
     ```
5. **Menghubungkan Kanal Tertentu per Squad:**
   * Pada kanal `#squad-1-directory`:
     ```
     /github subscribe pustahalab/wisata-indonesia issues,pulls +label:"squad-1"
     ```
   * Lakukan hal yang sama untuk squad lainnya (`squad-2` s.d. `squad-5`).

---

## 3. Metode 2: Integrasi Otomatis CI/CD via GitHub Actions (Slack Incoming Webhook)

Jika ingin mengirim pesan status otomatis ketika *build test* atau *deployment* sukses/gagal pada branch `main` dan `staging`:

### Langkah-Langkah:
1. **Buat Slack Incoming Webhook:**
   * Buka: [https://api.slack.com/apps](https://api.slack.com/apps) -> Klik **Create New App** -> Pilih *From scratch*.
   * Beri nama app (misal: `NusantaraGo CI Bot`) dan pilih *Workspace*.
   * Pilih menu **Incoming Webhooks** di bilah sisi kiri -> Aktifkan ke posisi **On**.
   * Klik **Add New Webhook to Workspace** -> Pilih kanal `#github-activity` -> Salin **Webhook URL** yang dihasilkan.
2. **Simpan Webhook URL di GitHub Secrets:**
   * Buka repositori: [https://github.com/pustahalab/wisata-indonesia/settings/secrets/actions](https://github.com/pustahalab/wisata-indonesia/settings/secrets/actions)
   * Klik **New repository secret**.
   * Nama: `SLACK_WEBHOOK_URL`
   * Nilai: *(Tempelkan URL Webhook Slack dari langkah 1)*.
3. **Pipeline Otomatis Aktif:**
   * Workflow GitHub Actions akan secara otomatis mengirim kartu pesan ke Slack setiap kali ada *push* atau *pull request*.
