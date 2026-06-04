# Render.com’a yükleme rehberi (Lisanı Ecdad)

Render’da **SQLite kalıcı değildir** (her deploy’da silinebilir). Canlı ortam için **Render PostgreSQL** (ücretsiz plan) kullanıyoruz.

---

## Ön hazırlık (bilgisayarınızda)

### 1. GitHub’a kod yükleyin

Projeyi GitHub’a push edin (`.env` dosyası **asla** git’e girmemeli — zaten `.gitignore`’da).

```bash
cd c:\Users\ycerit\duolingo-app
git init
git add .
git commit -m "Lisanı Ecdad Laravel uygulaması"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADINIZ/lisani-ecdad.git
git push -u origin main
```

`vendor/` klasörü büyükse yine de push edilebilir; Docker build sırasında `composer install` tekrar çalışır (`.dockerignore` vendor’ı hariç tutar).

---

## Yöntem A — Blueprint (en kolay, önerilen)

1. [render.com](https://render.com) → giriş yapın.
2. **New +** → **Blueprint**.
3. GitHub repo’nuzu bağlayın ve `render.yaml` dosyasını seçin.
4. Deploy başlar; otomatik oluşur:
   - **Web Service** `lisani-ecdad` (Docker)
   - **PostgreSQL** `lisani-db`
5. Web servisinde **Environment** → `APP_URL` değerini sitenizin tam adresi yapın, örn.  
   `https://lisani-ecdad.onrender.com`
6. **Manual Deploy** veya otomatik deploy sonrası site açılır.

İlk deploy’da `RUN_SEED=true` ile **Demo Hoca** oluşur:

| | |
|---|---|
| Giriş | Demo Hoca |
| Şifre | hoca123 |
| Sınıf kodu | DEMO01 |

İkinci deploy’dan sonra `RUN_SEED` → `false` yapın (aynı kullanıcıyı tekrar eklemesin).

---

## Yöntem B — Elle (zaten Render’da servis oluşturduysanız)

### 1. PostgreSQL veritabanı

1. **New +** → **PostgreSQL** → Free.
2. Ad: `lisani-db`.
3. Oluşunca **Connections** → **Internal Database URL** kopyalayın.

### 2. Web Service (Docker)

1. **New +** → **Web Service**.
2. Repo’nuzu seçin.
3. Ayarlar:

| Alan | Değer |
|------|--------|
| **Runtime** | Docker |
| **Dockerfile Path** | `./Dockerfile` |
| **Plan** | Free |
| **Health Check Path** | `/up` |

### 3. Ortam değişkenleri (Environment)

| Key | Value |
|-----|--------|
| `APP_ENV` | `production` |
| `APP_DEBUG` | `false` |
| `APP_NAME` | `Lisanı Ecdad` |
| `APP_KEY` | Generate (Render butonu) |
| `APP_URL` | `https://SIZIN-SERVIS.onrender.com` |
| `LOG_CHANNEL` | `stderr` |
| `SESSION_DRIVER` | `database` |
| `CACHE_STORE` | `database` |
| `DB_CONNECTION` | `pgsql` |
| `DB_URL` | PostgreSQL **Internal** URL (yapıştırın) |
| `RUN_SEED` | `true` (sadece ilk kurulum) |

### 4. Deploy

**Create Web Service** → build bitince URL’nizi açın.

---

## Yerel geliştirme vs Render

| | Yerel (şimdi) | Render (canlı) |
|--|----------------|----------------|
| Veritabanı | SQLite dosyası | PostgreSQL |
| `.env` | `DB_CONNECTION=sqlite` | Panelden `pgsql` + `DB_URL` |

Yerelde SQLite ile çalışmaya devam edebilirsiniz; Render kendi ortam değişkenlerini kullanır.

---

## Sık sorunlar

**502 / uygulama açılmıyor**  
- Loglar: Render → servis → **Logs**.  
- `APP_KEY` ve `DB_URL` tanımlı mı kontrol edin.

**CSRF / oturum**  
- `APP_URL` tam adres olmalı (`https://...`, sondaki `/` olmadan).

**Veritabanı bağlantı hatası**  
- `DB_URL` = PostgreSQL **Internal** URL (External değil, web servisi ile aynı bölgede).

**Ücretsiz plan uyku modu**  
- İlk istek 30–60 sn sürebilir; normaldir.

---

## Güncelleme

GitHub’a push → Render otomatik yeniden deploy eder.

```bash
git add .
git commit -m "Güncelleme"
git push
```

---

## Dosyalar

| Dosya | Görev |
|--------|--------|
| `Dockerfile` | Canlı sunucu imajı |
| `docker/render-start.sh` | Migrate + `artisan serve` |
| `render.yaml` | Blueprint tek tık kurulum |
| `.dockerignore` | Gereksiz dosyaları build dışı bırakır |
