# Scrapbook

## Desenvolvimento local

Suba os serviços principais:

```bash
docker compose up -d postgres redis minio
```

Os testes PHPUnit usam o banco dedicado `scrapbook_testing` no PostgreSQL local e forçam esse ambiente, então não encostam no banco principal `scrapbook`.

Se a suíte falhar por problema de banco de teste:

```bash
docker compose ps
docker compose up -d postgres
```

O ambiente de desenvolvimento continua usando PostgreSQL; só a suíte de testes foi isolada em `scrapbook_testing`.

## Build frontend

Se `npm run build` falhar com `EACCES` em `public/build`, normalmente há artefatos antigos criados como `root` pelo serviço `vite`. Faça apenas uma limpeza pontual do diretório ignorado pelo Git ou ajuste propriedade somente de `public/build`, sem `chmod/chown` amplo no projeto.

## Pagamentos nesta fase

O checkout atual cria `Order pending` e usa provider `manual_dev` somente para ambiente local/test/dev. Não há gateway externo, Pix real ou cobrança real nesta etapa. A publicação pública do Gift depende de `Order paid`/`Payment approved`.
