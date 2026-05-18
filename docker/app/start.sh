#!/usr/bin/env sh
set -eu

if [ ! -f .env ]; then
    cp .env.example .env
fi

set_env_value() {
    key="$1"
    value="$2"
    escaped_value="$(printf '%s' "$value" | sed 's/[\/&#]/\\&/g')"

    if grep -q "^${key}=" .env; then
        sed -i "s#^${key}=.*#${key}=${escaped_value}#" .env
    else
        printf '\n%s=%s\n' "$key" "$value" >> .env
    fi
}

if [ "${SYNC_DOCKER_ENV:-true}" = "true" ]; then
    set_env_value APP_ENV "${APP_ENV:-local}"
    set_env_value APP_DEBUG "${APP_DEBUG:-true}"
    set_env_value APP_URL "${APP_URL:-http://localhost:8000}"
    set_env_value DB_CONNECTION "pgsql"
    set_env_value DB_HOST "postgres"
    set_env_value DB_PORT "5432"
    set_env_value DB_DATABASE "scrapbook"
    set_env_value DB_USERNAME "scrapbook"
    set_env_value DB_PASSWORD "246810"
    set_env_value SESSION_DRIVER "database"
    set_env_value CACHE_STORE "redis"
    set_env_value QUEUE_CONNECTION "redis"
    set_env_value REDIS_CLIENT "predis"
    set_env_value REDIS_HOST "redis"
    set_env_value REDIS_PORT "6379"
    set_env_value FILESYSTEM_DISK "s3"
    set_env_value AWS_ACCESS_KEY_ID "scrapbook"
    set_env_value AWS_SECRET_ACCESS_KEY "scrapbook-secret"
    set_env_value AWS_DEFAULT_REGION "us-east-1"
    set_env_value AWS_BUCKET "scrapbook"
    set_env_value AWS_URL "${AWS_URL:-http://localhost:9000/scrapbook}"
    set_env_value AWS_ENDPOINT "http://minio:9000"
    set_env_value AWS_USE_PATH_STYLE_ENDPOINT "true"
fi

composer install

if ! grep -q '^APP_KEY=base64:' .env; then
    php artisan key:generate --force
fi

php <<'PHP'
<?php

$database = getenv('DB_TEST_DATABASE') ?: 'scrapbook_testing';

if ($database === '') {
    exit(0);
}

$host = getenv('DB_HOST') ?: 'postgres';
$port = getenv('DB_PORT') ?: '5432';
$username = getenv('DB_USERNAME') ?: 'scrapbook';
$password = getenv('DB_PASSWORD') ?: '';

try {
    $pdo = new PDO("pgsql:host={$host};port={$port};dbname=postgres", $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);

    $statement = $pdo->prepare('SELECT 1 FROM pg_database WHERE datname = ?');
    $statement->execute([$database]);

    if (! $statement->fetchColumn()) {
        $pdo->exec(sprintf('CREATE DATABASE "%s"', str_replace('"', '""', $database)));
    }
} catch (Throwable $exception) {
    fwrite(STDERR, "Could not ensure testing database [{$database}]: {$exception->getMessage()}\n");
}
PHP

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
    php artisan migrate --force
fi

exec "$@"
