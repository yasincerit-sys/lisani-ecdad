# PostgreSQL bağlantı rehberi (Windows)

## Durum kontrolü

1. **PHP eklentisi** — `pdo_pgsql` XAMPP `php.ini` içinde açıldı.
2. **Sunucu** — Laravel `127.0.0.1:5432` adresine bağlanamıyorsa PostgreSQL **servisi çalışmıyor** demektir.

## 1. PostgreSQL servisini başlatın

### Yöntem A — Windows Hizmetleri

1. `Win + R` → `services.msc`
2. Listede **postgresql** geçen hizmeti bulun (ör. `postgresql-x64-16`)
3. Sağ tık → **Başlat**
4. Başlangıç türü: **Otomatik**

### Yöntem B — pgAdmin

Kurulumla gelen **pgAdmin 4**’ü açın; sunucu yeşil görünüyorsa çalışıyordur.

## 2. Veritabanı ve kullanıcı oluşturun

pgAdmin → sunucuya sağ tık → **Query Tool** → `database/setup-postgres.sql` dosyasının içeriğini yapıştırıp çalıştırın.

Veya kendi `postgres` şifrenizle `.env` dosyasını güncelleyin:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=lisani_ecdad
DB_USERNAME=postgres
DB_PASSWORD=KURULUM_SIRASINDA_VERDIGINIZ_SIFRE
```

Sonra pgAdmin’de sadece veritabanı oluşturun:

```sql
CREATE DATABASE lisani_ecdad;
```

## 3. Laravel tablolarını kurun

```bash
cd c:\Users\ycerit\duolingo-app
php artisan config:clear
php artisan migrate:fresh --seed
php artisan serve
```

Bağlantı testi:

```bash
php artisan migrate:status
```

Hata yoksa PostgreSQL hazırdır.

## Sık hatalar

| Hata | Çözüm |
|------|--------|
| Connection refused | PostgreSQL servisini başlatın |
| password authentication failed | `.env` içindeki `DB_USERNAME` / `DB_PASSWORD` düzeltin |
| database "lisani_ecdad" does not exist | `setup-postgres.sql` veya `CREATE DATABASE` çalıştırın |
| could not find driver | Apache’yi yeniden başlatın; `php -m` ile `pdo_pgsql` kontrol edin |

## Demo hesap

```bash
php artisan db:seed
```

- **Demo Hoca** / **hoca123**
- Sınıf kodu: **DEMO01**
