-- PostgreSQL kurulum scripti (pgAdmin veya psql ile çalıştırın)
-- Önce süper kullanıcı (postgres) ile bağlanın.

CREATE USER lisani WITH PASSWORD 'lisani_secret';

CREATE DATABASE lisani_ecdad OWNER lisani;

GRANT ALL PRIVILEGES ON DATABASE lisani_ecdad TO lisani;

-- PostgreSQL 15+ için şema yetkisi (migrate için)
\c lisani_ecdad
GRANT ALL ON SCHEMA public TO lisani;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO lisani;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO lisani;
