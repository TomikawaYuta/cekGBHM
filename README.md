<p align="center"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="200" alt="Laravel Logo"></p>

<h1 align="center">Sistem Pengecekan GBHM</h1>

<p align="center">
Aplikasi web untuk mengotomatisasi pengecekan file PDF GBHM (Garis Besar Haluan Mahasiswa) milik mahasiswa baru.
</p>

<p align="center">
<a href="#fitur">Fitur</a> •
<a href="#prasyarat">Prasyarat</a> •
<a href="#instalasi">Instalasi</a> •
<a href="#penggunaan">Penggunaan</a> •
<a href="#deployment">Deployment</a>
</p>

---

## Fitur

- 📤 Upload file PDF GBHM (multiple file)
- 🔍 Ekstraksi otomatis teks & gambar dari PDF
- ✅ Validasi otomatis berdasarkan Master Data
- 📊 Laporan hasil validasi detail
- 🖼️ Deteksi keberadaan pas foto
- 📝 CRUD Master Data (Panitia, Quest, Rules)
- 🎯 Deteksi duplikasi NIM
- 🔤 Validasi format NIM (11 digit)
- 📏 Validasi minimum kata (First Impression & Kesannya)

## Tech Stack

| Komponen | Teknologi |
|----------|-----------|
| Framework | Laravel 13 |
| Database | SQLite (default) / PostgreSQL / MySQL |
| PDF Parser | smalot/pdfparser |
| Image | intervention/image |
| Frontend | Tailwind CSS |

---

## Prasyarat

Pastikan terinstal di komputer Anda:

- **PHP** >= 8.3 ([Download](https://www.php.net/downloads.php))
- **Composer** ([Download](https://getcomposer.org/download/)
- **Node.js** & **npm** (opsional, untuk Vite assets) ([Download](https://nodejs.org/))

---

## Instalasi

### macOS

```bash
# 1. Install PHP via Homebrew
brew install php@8.3
brew link php@8.3 --force --overwrite

# 2. Install Composer
brew install composer

# 3. Clone repository
git clone https://github.com/cekGBHM/cekGBHM.github.io.git
cd cekGBHM.github.io

# 4. Install dependencies
composer install

# 5. Setup environment
cp .env.example .env
php artisan key:generate

# 6. Setup database (SQLite sudah default)
touch database/database.sqlite
php artisan migrate
php artisan db:seed

# 7. Install Node.js dependencies (opsional)
npm install
npm run build

# 8. Jalankan server
php artisan serve
```

### Windows

```powershell
# 1. Install PHP & Composer via Chocolatey
choco install php composer

# 2. Clone repository
git clone https://github.com/cekGBHM/cekGBHM.github.io.git
cd cekGBHM.github.io

# 3. Install dependencies
composer install

# 4. Setup environment
copy .env.example .env
php artisan key:generate

# 5. Setup database (SQLite sudah default)
type nul > database\database.sqlite
php artisan migrate
php artisan db:seed

# 6. Install Node.js dependencies (opsional)
npm install
npm run build

# 7. Jalankan server
php artisan serve
```

**Alternatif Windows (Laragon/XAMPP):**
```powershell
# Jika menggunakan Laragon, pastikan PHP 8.3+ sudah terpilih
# Buka terminal di folder project

composer install
copy .env.example .env
php artisan key:generate
type nul > database\database.sqlite
php artisan migrate
php artisan db:seed
php artisan serve
```

### VPS (Ubuntu/Debian)

```bash
# 1. Install PHP 8.3 & dependencies
sudo apt update
sudo apt install -y php8.3 php8.3-cli php8.3-fpm php8.3-sqlite3 \
    php8.3-mbstring php8.3-xml php8.3-curl php8.3-zip php8.3-gd \
    php8.3-bcmath php8.3-intl unzip curl git

# 2. Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# 3. Clone repository
git clone https://github.com/cekGBHM/cekGBHM.github.io.git
cd cekGBHM.github.io

# 4. Install dependencies
composer install --optimize-autoloader --no-dev

# 5. Setup environment
cp .env.example .env
php artisan key:generate

# 6. Setup database
touch database/database.sqlite
php artisan migrate --force
php artisan db:seed --force

# 7. Set permissions
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache

# 8. Optimize untuk production
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 9. Jalankan server
php artisan serve --host=0.0.0.0 --port=8000
```

#### Deploy dengan Nginx (Ubuntu)

```bash
# Install Nginx
sudo apt install -y nginx

# Buat konfigurasi
sudo nano /etc/nginx/sites-available/gbhm
```

Tambahkan konfigurasi berikut:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/gbhm/public;

    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.ht {
        deny all;
    }
}
```

```bash
# Aktifkan site
sudo ln -s /etc/nginx/sites-available/gbhm /etc/nginx/sites-enabled/
sudo systemctl restart nginx
sudo systemctl restart php8.3-fpm
```

#### Deploy dengan Apache (Ubuntu)

```bash
sudo apt install -y apache2 libapache2-mod-php8.3
sudo a2enmod rewrite

sudo nano /etc/apache2/sites-available/gbhm.conf
```

Tambahkan konfigurasi:

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /var/www/gbhm/public

    <Directory /var/www/gbhm/public>
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/gbhm_error.log
    CustomLog ${APACHE_LOG_DIR}/gbhm_access.log combined
</VirtualHost>
```

```bash
sudo a2ensite gbhm
sudo systemctl restart apache2
```

---

## Deployment ke Railway (Gratis)

### Langkah Cepat

1. **Push ke GitHub**
```bash
git add .
git commit -m "Setup Railway deployment"
git push origin main
```

2. **Deploy ke Railway**
- Buka [railway.app](https://railway.app) → Login dengan GitHub
- **New Project** → **Deploy from GitHub repo** → Pilih repo `cekGBHM.github.io`

3. **Setup Database**
- Klik **+ New** → **Database** → **PostgreSQL**

4. **Environment Variables**
Tambahkan di tab **Variables**:
```
DB_CONNECTION=pgsql
APP_ENV=production
APP_DEBUG=false
SESSION_DRIVER=file
CACHE_STORE=file
QUEUE_CONNECTION=sync
APP_KEY=base64:xxx...  # dari php artisan key:generate --show
APP_URL=https://your-app.up.railway.app
```

5. **Deploy Ulang**
- Klik **Deployments** → **Redeploy**

### Hasil

Aplikasi akan bisa diakses di: `https://your-app.up.railway.app`

> Panduan lengkap: [DEPLOY_RAILWAY.md](DEPLOY_RAILWAY.md)

---

## Penggunaan

### Login

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | password |
| User | user@example.com | password |

### Akses Aplikasi

| Halaman | URL |
|---------|-----|
| Login | `/login` |
| Dashboard | `/admin/dashboard` |
| Upload PDF | `/upload` |
| Hasil Validasi | `/results` |
| Data Panitia | `/admin/panitia` |
| Data Quest | `/admin/quest` |
| General Rules | `/admin/rules` |

### Alur Penggunaan

1. **Login** ke aplikasi
2. **Upload** file PDF GBHM
3. **Tunggu** proses ekstraksi & validasi
4. **Lihat** hasil validasi (Lolos / Tidak Lolos)
5. **Review** detail error jika ada kesalahan

---

## Konfigurasi Database

### SQLite (Default)

```env
DB_CONNECTION=sqlite
```

### PostgreSQL

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=gbhm_checker
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

### MySQL

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=gbhm_checker
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

Setelah mengubah konfigurasi database:
```bash
php artisan migrate:fresh --seed
```

---

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| `Permission denied` storage | `sudo chmod -R 775 storage bootstrap/cache` |
| `No application encryption key` | `php artisan key:generate` |
| `Database file not found` | `touch database/database.sqlite` |
| PDF gagal dipastikan | Pastikan PDF bukan hasil scan/gambar |
| Composer timeout | `COMPOSER_MEMORY_LIMIT=-1 composer install` |

---

## Testing

```bash
# Jalankan semua tests
php artisan test

# Jalankan tests tertentu
php artisan test --filter=CompletenessRuleTest
```

---

## License

MIT License. See [LICENSE](LICENSE) for more information.
