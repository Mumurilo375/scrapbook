# Scrapbook

## Desenvolvimento local

Suba os serviços principais:

```bash
docker compose up -d postgres redis minio
```

O PostgreSQL local usado pela suíte PHPUnit fica em `127.0.0.1:5432`, com banco/usuário/senha `scrapbook`. Essa porta está alinhada ao `compose.yaml`, `.env.example` e `phpunit.xml`.

Se os testes recusarem conexão com PostgreSQL:

```bash
docker compose ps
docker compose up -d postgres
```

Não troque a suíte para SQLite para contornar esse erro; o produto usa PostgreSQL.

## Build frontend

Se `npm run build` falhar com `EACCES` em `public/build`, normalmente há artefatos antigos criados como `root` pelo serviço `vite`. Faça apenas uma limpeza pontual do diretório ignorado pelo Git ou ajuste propriedade somente de `public/build`, sem `chmod/chown` amplo no projeto.

## Pagamentos nesta fase

O checkout atual cria `Order pending` e usa provider `manual_dev` somente para ambiente local/test/dev. Não há gateway externo, Pix real ou cobrança real nesta etapa. A publicação pública do Gift depende de `Order paid`/`Payment approved`.
