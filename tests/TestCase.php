<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use RuntimeException;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        $this->guardAgainstUnsafeTestingDatabase();

        parent::setUp();
    }

    private function guardAgainstUnsafeTestingDatabase(): void
    {
        $connection = strtolower(trim((string) ($_ENV['DB_CONNECTION'] ?? getenv('DB_CONNECTION') ?: 'pgsql')));
        $database = strtolower(trim((string) ($_ENV['DB_DATABASE'] ?? getenv('DB_DATABASE') ?: '')));
        $url = trim((string) ($_ENV['DB_URL'] ?? getenv('DB_URL') ?: ''));
        $port = trim((string) ($_ENV['DB_PORT'] ?? getenv('DB_PORT') ?: ''));

        if ($url !== '') {
            $parsedPort = parse_url($url, PHP_URL_PORT);

            if (is_int($parsedPort)) {
                $port = (string) $parsedPort;
            }
        }

        if ($connection !== 'pgsql') {
            return;
        }

        if ($port === '' || $port === '5432') {
            throw new RuntimeException(
                'Testes bloqueados: PHPUnit nao pode usar PostgreSQL na porta 5432. '.
                'Use um banco descartavel em outra porta para evitar apagar dados reais.'
            );
        }

        if (! str_contains($database, 'test')) {
            throw new RuntimeException(
                'Testes bloqueados: o banco PostgreSQL de teste precisa ter "test" no nome. '.
                'Use um banco descartavel, como scrapbook_testing.'
            );
        }
    }
}
