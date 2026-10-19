<h1 align="center">Sistem Pengecekan GBHM</h1>

<p align="center">
Situs web statis (HTML/CSS/JS) untuk mengotomatisasi pengecekan file PDF GBHM (Garis Besar Haluan Mahasiswa) milik mahasiswa baru. Berjalan 100% di browser — diproses via GitHub Pages, tanpa server & database.
</p>

<p align="center">
<a href="#fitur">Fitur</a> •
<a href="#cara-menjalankan-lokal">Jalankan Lokal</a> •
<a href="#deployment-github-pages">Deploy</a> •
<a href="#penggunaan">Penggunaan</a>
</p>

---

## Fitur

- 📤 Upload file PDF GBHM (drag & drop, maks 10 MB)
- 🔍 Ekstraksi otomatis teks & deteksi gambar dari PDF (pdf.js di browser)
- ✅ Validasi otomatis berdasarkan Master Data
- 📊 Laporan hasil validasi detail (Lolos / Tidak Lolos + pesan error)
- 🖼️ Deteksi keberadaan pas foto
- 📝 CRUD Master Data (Panitia, Quest, Rules) via localStorage
- 🎯 Deteksi duplikasi NIM & profil copy-paste
- 🔤 Validasi format NIM (11 digit angka)
- 📏 Validasi minimum kata (First Impression & Paling Berkesan)
- 🔎 Pencarian riwayat hasil
- 🚫 Tanpa login, tanpa backend — semua diproses di browser

## Tech Stack

| Komponen | Teknologi |
|----------|-----------|
| Markup | HTML5 |
| Styling | Tailwind CSS (CDN) |
| Logic | JavaScript vanilla (ES Modules) |
| PDF Parser | pdf.js (Mozilla) |
| Penyapan | localStorage |
| Deploy | GitHub Pages |

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

> **Catatan:** Railway, database, dan seluruh kode PHP/Laravel sudah dihapus dari repo ini. Dokumentasi versi lama tersimpan sebagai riwayat di `docs/` (git-ignored).

---

## Penggunaan

### Akses Halaman

| Halaman | URL |
|---------|-----|
| Dashboard | `index.html` |
| Upload PDF | `upload.html` |
| Hasil Validasi | `results.html` |
| Detail Hasil | `result.html?id=<sessionId>` |
| Data Panitia | `panitia.html` |
| Data Quest | `quest.html` |
| General Rules | `rules.html` |

### Alur Penggunaan

1. Buka **Upload** → drag & drop file PDF GBHM → **Upload & Validasi**
2. Sistem mengekstrak teks PDF, memetakan halaman (cover/panitia/angkatan), lalu menjalankan semua aturan validasi
3. Hasil otomatis tampil di **Detail Hasil** (ringkasan + tabel error per profil)
4. Kelola **Master Panitia/Quest/Rules** sesuai kebutuhan (perubahan tersimpan di browser)
5. Gunakan **Hasil** untuk mencari riwayat upload sebelumnya

### Data & Penyimpanan

- Semua data disimpan di `localStorage` browser masing-masing — **tidak sinkron** antar device/browser.
- Master data di-seed otomatis dari `js/data/master-data.json` saat pertama dibuka.
- Untuk reset master data ke bawaan, jalankan di console browser:
  ```js
  GBHMStore.reset(); location.reload();
  ```

### Troubleshooting

| Masalah | Solusi |
|---------|--------|
| PDF gagal diproses | Pastikan PDF bukan hasil scan/gambar (harus ada teks yang bisa dibaca) |
| Halaman kosong / module error | Akses lewat `http://localhost:8000`, bukan `file://` |
| Data "hilang" | Data per-browser; cek apakah memakai browser/incognito yang sama |
| pdf.js gagal load | Pastikan koneksi internet aktif (library dimuat dari CDN) |

---

## License

MIT License.
