# Railway Deployment Guide

## Setup Awal

### 1. Push ke GitHub

```bash
git init
git add .
git commit -m "Initial commit - GBHM Checker"
git branch -M main
git remote add origin https://github.com/cekGBHM/cekGBHM.github.io.git
git push -u origin main
```

### 2. Buat Akun Railway

1. Buka [railway.app](https://railway.app)
2. Login dengan GitHub
3. Klik **New Project** → **Deploy from GitHub repo**
4. Pilih repo `cekGBHM.github.io`

### 3. Setup Database PostgreSQL

1. Di project Railway, klik **+ New** → **Database** → **PostgreSQL**
2. Railway otomatis membuat environment variables:
   - `PGHOST`
   - `PGPORT`
   - `PGUSER`
   - `PGPASSWORD`
   - `PGDATABASE`

### 4. Setup Environment Variables

Di tab **Variables**, tambahkan:

```
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-app.up.railway.app
DB_CONNECTION=pgsql
SESSION_DRIVER=file
CACHE_STORE=file
QUEUE_CONNECTION=sync
```

> **Catatan:** Railway otomatis inject `DATABASE_URL` jika PostgreSQL sudah ditambahkan.

### 5. Deploy

Klik tab **Deployments** → **Deploy Latest Commit**

---

## Konfigurasi Database

### Menggunakan PostgreSQL (Recommended)

Railway akan otomatis set environment variables untuk PostgreSQL. Anda hanya perlu set:

```
DB_CONNECTION=pgsql
```

### Menggunakan SQLite (Alternatif)

Jika ingin pakai SQLite (data tidak persist setelah redeploy):

```
DB_CONNECTION=sqlite
SESSION_DRIVER=file
CACHE_STORE=file
```

**⚠️ Warning:** Data SQLite akan hilang setiap kali redeploy!

---

## Custom Domain

1. Buka tab **Settings** di project Railway
2. Scroll ke **Networking** → **Custom Domain**
3. Masukkan domain Anda (misal: `cekgbhm.xyz`)
4. Tambahkan CNAME record di DNS provider Anda:
   ```
   CNAME @ your-app.up.railway.app
   ```
5. Tunggu propagate (biasanya 5-30 menit)

---

## Perintah Berguna

### Local Development

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan serve
```

### Manual Deploy ke Railway

```bash
npm i -g @railway/cli
railway login
railway link
railway up
```

---

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| APP_KEY missing | Set `APP_KEY` di Railway Variables (generate via `php artisan key:generate --show`) |
| Database connection failed | Pastikan PostgreSQL sudah ditambahkan di project |
| 502 Bad Gateway | Cek logs di tab **Deployments** → **View Logs** |
| Storage permission denied | Tambahkan volume di Settings → Volumes |

---

## Biaya

| Komponen | Free Tier |
|----------|-----------|
| App | $5 credit/bulan (~750 jam) |
| PostgreSQL | $5 credit/bulan |
| **Total** | **Gratis** untuk usage kecil |
