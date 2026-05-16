# Scrapbook

Base inicial para um scrapbook digital mobile-first em Laravel + React + TypeScript, usando Inertia, Vite, PostgreSQL, Redis, Horizon, Filament, Spatie Permission/Activitylog e Intervention Image.

## Requisitos

- PHP 8.3+ com `intl`, `pcntl`, `pdo_pgsql` e `gd` ou `imagick`.
- Composer.
- Node 20+ e npm.
- Docker opcional para PostgreSQL, Redis e S3 local.

## Setup local

```bash
docker compose up -d postgres redis minio
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
npm run dev
```

Para criar um admin inicial no ambiente local, preencha `ADMIN_EMAIL` e `ADMIN_PASSWORD` antes de rodar o seeder.

## Qualidade

```bash
composer test
composer format:test
composer analyse
npm run typecheck
npm run lint
npm run build
```

Pest ainda nao foi instalado porque o plugin Laravel disponivel conflita com Laravel 13/Pao. A base fica em PHPUnit ate essa combinacao estabilizar.
