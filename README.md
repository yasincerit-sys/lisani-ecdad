# Lisanı Ecdad — Laravel + SQLite

Osmanlıca öğrenim uygulaması Laravel 12 üzerinde çalışır. Veriler **`database/database.sqlite`** dosyasında tutulur; ekstra veritabanı sunucusu gerekmez.

## Gereksinimler

- PHP 8.2+ (pdo_sqlite)
- Composer

## Kurulum

```bash
cd c:\Users\ycerit\duolingo-app
composer install
cp .env.example .env   # gerekirse
php artisan key:generate
php artisan config:clear
php artisan migrate
php artisan db:seed
php artisan serve
```

Tarayıcı: **http://127.0.0.1:8000**

`.env` içinde:

```env
DB_CONNECTION=sqlite
```

Veritabanı dosyası: `database/database.sqlite` (yoksa `migrate` oluşturur).

### Demo hoca

| | |
|---|---|
| Giriş | **Demo Hoca** / **hoca123** |
| Sınıf kodu | **DEMO01** |

### CSRF / oturum

`APP_URL` tarayıcı adresiyle aynı olmalı. Sorun olursa:

```bash
php artisan config:clear
```

## Render.com’a yayınlama

Canlı site için adım adım rehber: **[KURULUM-RENDER.md](KURULUM-RENDER.md)**

Özet: GitHub’a push → Render’da Blueprint veya Docker Web Service → PostgreSQL (ücretsiz) → `APP_URL` ayarla.

> Yerelde SQLite kullanmaya devam edebilirsiniz; Render’da PostgreSQL kullanılır.

## API özeti

| Metot | URL |
|-------|-----|
| POST | `/api/login` |
| POST | `/api/register` |
| GET | `/api/hoca/ogrenci-takip` |
| GET | `/api/odevler` |
| POST | `/api/progress/sync` |
