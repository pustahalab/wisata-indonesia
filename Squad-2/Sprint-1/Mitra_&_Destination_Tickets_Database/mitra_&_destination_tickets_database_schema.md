# Skema Database Mitra & Tiket

## Tabel `partners`

| Atribut | Tipe Data | Value | Key | Keterangan |
| --- | --- | --- | --- | --- |
| id | UUID | `gen_random_uuid()` | Primary Key | ID unik setiap mitra |
| user_id | UUID | `users.id` | Foreign Key `users(id)` | Akun pengguna pemilik mitra |
| business_name | VARCHAR(200) | NOT NULL | - | Nama mitra atau organisasi |
| partner_type | ENUM | “attraction”, “tour_agent”, “accommodation”, “transport”; NOT NULL | - | Kategori mitra |
| legal_doc_url | TEXT | NULL | - | Lokasi file dokumen legalitas (url/path) |
| bank_account_info | JSONB | NOT NULL | - | Informasi rekening bank mitra |
| is_verified | ENUM | “pending”, “verified”, “rejected”; NOT NULL; DEFAULT = “pending” | - | Status verifikasi dokumen mitra |
| created_at | TIMESTAMPZ | CURRENT_TIMESTAMP | - | Waktu data mitra dibuat |

## Tabel `destination_tickets`

| Atribut | Tipe Data | Value | Key | Keterangan |
| --- | --- | --- | --- | --- |
| id | UUID | `gen_random_uuid()` | Primary Key | ID unik setiap jenis tiket |
| destination_id | UUID | `destinations.id` | Foreign Key `destinations(id)` | ID tujuan destinasi |
| ticket_name | VARCHAR(100) | NOT NULL | - | Nama atau jenis tiket |
| visitor_type | ENUM | “domestic”, “foreign”; NOT NULL | - | Jenis pengunjung |
| day_type | ENUM | “weekday”, “weekend”; NOT NULL | - | Jenis hari |
| price | NUMERIC(12,2) | NOT NULL | - | Harga tiket |
| daily_quota | INTEGER | 100; NOT NULL | - | Jumlah kuota tiket |
| is_active | BOOLEAN | TRUE | - | Status tiket aktif |
**Penjelasan Skema Database**

1. **Tabel Partners**

   Tabel partners digunakan untuk menyimpan informasi profil mitra yang mendaftarkan diri sebagai pengelola atau penyedia layanan wisata di platform NusantaraGo. Informasi yang disimpan meliputi identitas mitra, akun pengguna pemilik mitra, kategori kegiatan mitra, dokumen legalitas, informasi rekening bank, serta status verifikasi dokumen mitra.

   Atribut id digunakan sebagai Primary Key yang berfungsi untuk memberikan identitas unik pada setiap mitra. ID dibuat secara otomatis menggunakan UUID dengan fungsi gen\_random\_uuid().

   Atribut user\_id digunakan sebagai Foreign Key yang menghubungkan profil mitra dengan akun pengguna pada tabel users. Dengan hubungan ini, setiap profil mitra dapat dikaitkan dengan akun pengguna yang mendaftarkannya.

   Atribut business\_name digunakan untuk menyimpan nama usaha atau organisasi mitra yang terdaftar pada platform NusantaraGo.

   Atribut partner\_type digunakan untuk mengidentifikasi kategori kegiatan mitra, yang terdiri dari empat jenis, yaitu:

   1. `attraction`: Mitra yang menyediakan atau mengelola objek wisata.  
   2. `tour_agent`: Mitra yang menyediakan layanan agen perjalanan wisata.  
   3. `accommodation`: Mitra yang menyediakan layanan penginapan.  
   4. `transport`: Mitra yang menyediakan layanan transportasi wisata.  
   Atribut legal\_doc\_url digunakan untuk menyimpan lokasi file dokumen legalitas mitra dalam bentuk URL atau path. Atribut ini bersifat opsional sehingga dapat bernilai NULL apabila dokumen belum diunggah.

   Atribut bank\_account\_info digunakan untuk menyimpan informasi rekening bank milik mitra dalam format JSONB. Penggunaan JSONB memungkinkan informasi rekening disimpan dalam struktur data JSON.

   Atribut is\_verified digunakan untuk menunjukkan status verifikasi dokumen mitra, yang terdiri dari tiga status, yaitu:

   1. `pending`: Pengajuan mitra sedang menunggu pemeriksaan.  
   2. `verified`: Dokumen mitra telah diperiksa dan disetujui.  
   3. `rejected`: Pengajuan mitra ditolak setelah proses pemeriksaan.  
   Status awal atribut is\_verified secara otomatis diatur menjadi pending menggunakan nilai DEFAULT.

   Atribut created\_at digunakan untuk mencatat waktu ketika data profil mitra pertama kali dibuat. Waktu akan diisi secara otomatis menggunakan CURRENT\_TIMESTAMP.

2. **Tabel Destination Tickets**

   Tabel destination\_tickets digunakan untuk menyimpan informasi jenis tiket yang tersedia pada setiap destinasi wisata di platform NusantaraGo. Informasi yang disimpan meliputi identitas tiket, destinasi wisata terkait, nama tiket, kategori pengunjung, jenis hari berlakunya tiket, harga, kuota harian, serta status aktif tiket.

   Atribut id digunakan sebagai Primary Key yang berfungsi untuk memberikan identitas unik pada setiap jenis tiket. ID dibuat secara otomatis menggunakan UUID dengan fungsi gen\_random\_uuid().

   Atribut destination\_id digunakan sebagai Foreign Key yang menghubungkan setiap jenis tiket dengan destinasi wisata pada tabel destinations. Dengan atribut ini, setiap tiket dapat diidentifikasi berdasarkan destinasi wisata tempat tiket tersebut berlaku.

   Atribut ticket\_name digunakan untuk menyimpan nama atau jenis tiket yang ditawarkan kepada wisatawan. Nama tiket dapat digunakan untuk membedakan jenis tiket yang tersedia pada suatu destinasi.

   Atribut visitor\_type digunakan untuk membedakan kategori pengunjung yang dapat menggunakan tiket, yaitu:

   1. `domestic`: Tiket yang diperuntukkan bagi wisatawan domestik atau dalam negeri.  
   2. `foreign`: Tiket yang diperuntukkan bagi wisatawan asing atau mancanegara.  
   Atribut day\_type digunakan untuk membedakan jenis hari berlakunya tiket, yaitu:

   1. `weekday`: Tiket yang berlaku pada hari kerja.  
   2. `weekend`: Tiket yang berlaku pada akhir pekan.  
   Atribut price digunakan untuk menyimpan harga tiket yang ditawarkan kepada wisatawan. Tipe data NUMERIC(12,2) digunakan agar harga dapat menyimpan nilai numerik dengan dua angka di belakang desimal.

   Atribut daily\_quota digunakan untuk menentukan jumlah maksimal tiket yang tersedia dalam satu hari. Nilai default yang ditetapkan adalah 100 tiket apabila tidak ada nilai kuota yang diberikan.

   Atribut is\_active digunakan untuk menunjukkan apakah suatu jenis tiket masih aktif dan dapat ditawarkan kepada wisatawan. Nilai TRUE menunjukkan tiket masih aktif, sedangkan FALSE menunjukkan tiket tidak lagi ditawarkan.

**Relasi Antartabel**

Tabel users dan partners memiliki relasi one-to-many (1:N) berdasarkan struktur tabel yang digunakan. Artinya, satu akun pengguna dapat memiliki lebih dari satu profil mitra, sedangkan setiap profil mitra hanya terhubung dengan satu akun pengguna. Relasi ini dibentuk melalui atribut user\_id pada tabel partners yang mereferensikan Primary Key id pada tabel users.

Tabel destinations dan destination\_tickets memiliki relasi one-to-many (1:N). Artinya, satu destinasi wisata dapat memiliki lebih dari satu jenis tiket, sedangkan setiap jenis tiket hanya berlaku untuk satu destinasi wisata. Relasi ini dibentuk melalui atribut destination\_id pada tabel destination\_tickets yang mereferensikan Primary Key id pada tabel destinations.

## Database Migration Code (MySQL)

1. **partners**

```sql
CREATE TABLE partners (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    business_name VARCHAR(200) NOT NULL,
    partner_type ENUM(
        'attraction',
        'tour_agent',
        'accommodation',
        'transport'
    ) NOT NULL,
    legal_doc_url TEXT NULL,
    bank_account_info JSON NOT NULL,
    is_verified ENUM(
        'pending',
        'verified',
        'rejected'
    ) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_partners_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
) ENGINE=InnoDB;
```

2. **destination_tickets**

```sql
CREATE TABLE destination_tickets (
    id CHAR(36) PRIMARY KEY,
    destination_id CHAR(36) NOT NULL,
    ticket_name VARCHAR(100) NOT NULL,
    visitor_type ENUM(
        'domestic',
        'foreign'
    ) NOT NULL,
    day_type ENUM(
        'weekday',
        'weekend'
    ) NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    daily_quota INT NOT NULL DEFAULT 100,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_tickets_destination
        FOREIGN KEY (destination_id)
        REFERENCES destinations(id)
) ENGINE=InnoDB;
```