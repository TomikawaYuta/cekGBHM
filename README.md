<h1 align="center">Sistem Pengecekan GBHM</h1>

<p align="center">
Situs web statis (HTML/CSS/JS) untuk mengotomatisasi pengecekan file PDF GBHM (Garis Besar Haluan Mahasiswa) milik mahasiswa baru. Berjalan 100% di browser — diproses via GitHub Pages. Master data (Panitia/Quest/Rules) disimpan di <b>Firebase Firestore realtime</b> agar semua panitia melihat data yang sama; riwayat upload & hasil tetap lokal di browser masing-masing. Dilindungi login sederhana (2 akun).
</p>

<p align="center">
<a href="#fitur">Fitur</a> •
<a href="#setup-firebase">Setup Firebase</a> •
<a href="#cara-menjalankan-lokal">Jalankan Lokal</a> •
<a href="#deployment-github-pages">Deploy</a> •
<a href="#penggunaan">Penggunaan</a>
</p>

---

## Fitur

- 🔐 Login sederhana (username + password) — 2 akun: `admin` & `panitia`
- 📤 Upload file PDF GBHM (drag & drop, maks 10 MB)
- 🔍 Ekstraksi otomatis teks & deteksi gambar dari PDF (pdf.js di browser)
- ✅ Validasi otomatis berdasarkan Master Data
- 📊 Laporan hasil validasi detail (Lolos / Tidak Lolos + pesan error)
- 🖼️ Deteksi keberadaan pas foto
- 📝 CRUD Master Data (Panitia, Quest, Rules) — **realtime via Firebase Firestore**, hanya admin yang bisa menulis
- 🔄 Sinkronisasi realtime — perubahan master data langsung terlihat di semua browser panitia
- 🎯 Deteksi duplikasi NIM & profil copy-paste
- 🔤 Validasi format NIM (11 digit angka)
- 📏 Validasi minimum kata (First Impression & Paling Berkesan)
- 🔎 Pencarian riwayat hasil
- 📁 Riwayat upload & hasil disimpan per-browser (localStorage) — tidak dibagikan

## Tech Stack

| Komponen | Teknologi |
|----------|-----------|
| Markup | HTML5 |
| Styling | Tailwind CSS (CDN) |
| Logic | JavaScript vanilla (ES Modules) |
| PDF Parser | pdf.js (Mozilla) |
| Database realtime | Firebase Firestore (CDN) — master data bersama |
| Auth | Firebase Auth (Email/Password) |
| Penyimpanan lokal | localStorage (sessions/upload per-browser) |
| Deploy | GitHub Pages |

---

## Setup Firebase

> Wajib sekali sebelum website bisa dipakai. Gratis (Spark plan cukup untuk kegiatan panitia).
> **Panduan lengkap langkah demi langkah:** buka [`docs/TUTORIAL-FIREBASE.md`](docs/TUTORIAL-FIREBASE.md).

1. **Buat project** — buka [console.firebase.google.com](https://console.firebase.google.com) → *Add project* (nama bebas, mis. `cek-gbhm`).
2. **Tambah Web App** — ikon `</>` → daftarkan app → **copy config** (objek `firebaseConfig`) → tempel ke `js/firebase-config.js` (ganti placeholder).
3. **Aktifkan Auth** — menu **Build → Authentication → Get started → Email/Password → Enable**.
4. **Buat 2 akun** — tab **Users → Add user**, buat persis:
   | Email | Password |
   |-------|----------|
   | `admin@panitia.gbhm` | (pilih sendiri, catat) |
   | `panitia@panitia.gbhm` | (pilih sendiri, bisa sama) |
5. **Buat Firestore** — menu **Build → Firestore Database → Create database** → pilih **Production mode** → region **asia-southeast1** (terdekat Indonesia) → *Enable*.
6. **Pasang aturan keamanan** — tab **Rules** → hapus isi bawaan → tempel seluruh isi file `firestore.rules` → **Publish**.
7. **Login pertama sebagai `admin` di browser Anda** — buka `http://localhost:8000/login.html` (atau `https://<username>.github.io/` yang otomatis dialihkan ke `login.html`), isi username `admin` + password dari langkah 4. Data master lama (jika ada di localStorage) otomatis ter-migrasi ke Firestore; kalau belum ada, di-seed dari `js/data/master-data.json`.

> ⚠️ **Login `admin` dulu sebelum mengundang panitia lain** — supaya data master milik Anda yang dimigrasi (bukan data seed kosong dari browser orang lain).

Aturan akses yang diberlakukan (via `firestore.rules`):

| Akun | Baca master | Tulis master | Upload PDF |
|------|-------------|--------------|------------|
| `admin` | ✅ | ✅ | ✅ |
| `panitia` | ✅ | ❌ (ditolak server) | ✅ |

---

## Cara Menjalankan Lokal

Karena memakai ES Modules, `fetch` JSON, dan pdf.js worker, situs harus disajikan lewat HTTP (bukan dibuka langsung `file://`).

```bash
# Clone repository
git clone https://github.com/cekGBHM/cekGBHM.github.io.git
cd cekGBHM.github.io

# Pilih salah satu:
php -S localhost:8000            # PHP
# atau
python -m http.server 8000       # Python
# atau
npx serve .                      # Node
```

Buka `http://localhost:8000`. Tidak perlu install dependency apa pun.

Cek kesehatan kode (validasi rule + pemeriksaan modul ES):

```bash
npm test
```

> Test termasuk pemeriksaan statis `js/**`: **tidak boleh ada import bare specifier**
> (mis. `from "firebase/app"`) dan **tidak boleh ada nama import duplikat** — keduanya
> membuat seluruh modul gagal dimuat (situs terbuka tapi login & tombol Keluar mati).

---

## Deployment GitHub Pages

1. **Push ke GitHub**
```bash
git add .
git commit -m "Deploy static site"
git push origin main
```

2. **Aktifkan GitHub Pages**
- Buka repo di GitHub → **Settings** → **Pages**
- **Source:** *Deploy from a branch*
- **Branch:** `main`, folder `/ (root)` → **Save**

3. **Akses situs**
- Repo bernama persis `<username>.github.io` (mis. akun `cekGBHM` + repo `cekGBHM.github.io`) → `https://cekGBHM.github.io/`
- Repo proyek biasa (mis. `TomikawaYuta/cekGBHM.github.io`) → `https://tomikawayuta.github.io/cekGBHM.github.io/`

Semua path di HTML relatif, jadi situs berfungsi di base path mana pun tanpa konfigurasi tambahan.

> **Catatan:** Railway & seluruh kode PHP/Laravel sudah dihapus. Database realtime kini memakai **Firebase Firestore** (lihat [Setup Firebase](#setup-firebase)) — tanpa server/backend sendiri. Dokumentasi versi lama tersimpan sebagai riwayat di `docs/` (git-ignored).

---

## Penggunaan

### Akses Halaman

| Halaman | URL |
|---------|-----|
| Login | `login.html` |
| Dashboard | `index.html` |
| Upload PDF | `upload.html` |
| Hasil Validasi | `results.html` |
| Detail Hasil | `result.html?id=<sessionId>` |
| Data Panitia | `panitia.html` |
| Data Quest | `quest.html` |
| General Rules | `rules.html` |

Semua halaman (kecuali login) butuh login — jika belum masuk, otomatis dialihkan ke `login.html`. Navbar menampilkan username aktif + tombol **Keluar**.

### Alur Penggunaan

1. **Login** dengan username + password (akun `admin` atau `panitia`)
2. Buka **Upload** → drag & drop file PDF GBHM → **Upload & Validasi**
3. Sistem mengekstrak teks PDF, memetakan halaman (cover/panitia/angkatan), lalu menjalankan semua aturan validasi
4. Hasil otomatis tampil di **Detail Hasil** (ringkasan + tabel error per profil)
5. Akun **admin** kelola **Master Panitia/Quest/Rules** — perubahan tersimpan di Firestore dan **langsung terlihat realtime** di semua browser panitia yang sedang membuka situs
6. Akun **panitia** hanya bisa melihat master data (tombol Tambah/Edit/Hapus tidak tampil) + upload
7. Gunakan **Hasil** untuk mencari riwayat upload sebelumnya (riwayat per-browser)

### Data & Penyimpanan

| Data | Lokasi | Dibagikan? |
|------|--------|-----------|
| Master Panitia/Quest/Rules | Firebase Firestore | ✅ Semua login melihat sama, realtime |
| Riwayat upload + hasil validasi | `localStorage` browser masing-masing | ❌ Per-browser, tidak disinkron |

- Seed awal master data dari `js/data/master-data.json` (atau migrasi data lama) dijalankan saat **admin** login pertama.
- Untuk reset data lokal di browser, jalankan di console:
  ```js
  GBHMStore.reset(); location.reload();
  ```
  (Reset lokal hanya mempengaruhi sesi login & salinan lokal; data di Firestore tidak ikut terhapus.)

### Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Website terbuka langsung ke dashboard — **tidak ada login**, atau tombol **Keluar** tidak bereaksi | Tab Console (F12) penuh error module → biasanya `js/firebase-config.js` ikut memuat baris bawaan console `import { initializeApp } from "firebase/app"`. Hapus baris itu (hanya boleh import `https://www.gstatic.com/...`), simpan, lalu jalankan `npm test` |
| Form login tidak merespons sama sekali | Penyebab sama dengan baris di atas — seluruh ES module gagal dimuat sehingga handler form tidak terpasang |
| Selalu redirect ke login | Belum login / sesi expired — masuk ulang dengan username & password |
| Data master kosong | Pastikan **admin** sudah login sekali (seed/migrasi) — cek koneksi & Rules sudah di-Publish |
| "Permission denied" saat simpan | Akun `panitia` memang tidak boleh menulis master data — login sebagai `admin` |
| Master data tidak muncul realtime | Cek koneksi internet; cek Rules Firestore sudah benar; pastikan keduanya login akun berbeda |
| PDF gagal diproses | Pastikan PDF bukan hasil scan/gambar (harus ada teks yang bisa dibaca) |
| Halaman kosong / module error | Akses lewat `http://localhost:8000`, bukan `file://` |
| Riwayat upload "hilang" | Riwayat per-browser; cek memakai browser yang sama (bukan incognito) |
| pdf.js / Firebase gagal load | Pastikan koneksi internet aktif (library dimuat dari CDN) |
| Lupa password | Reset via Firebase Console → Authentication → Users |

---

## License

MIT License.
