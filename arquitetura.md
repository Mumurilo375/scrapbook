# Arquitetura e banco de dados - Scrapbook digital

> Documento de decisão técnica inicial para um produto de scrapbook digital mobile-first, baseado em templates, temas, páginas interativas, editor visual, pagamento por presente, painel do usuário e painel administrativo.

## 1. Decisão principal de stack

### Stack recomendada

- **Backend:** Laravel.
- **Frontend:** React + TypeScript.
- **Integração Laravel/React:** Inertia.js + Vite, em um monólito modular.
- **Banco:** PostgreSQL.
- **Cache/fila:** Redis.
- **Jobs/filas:** Laravel Queue + Horizon.
- **Storage:** S3-compatible, por exemplo AWS S3, Cloudflare R2, Backblaze B2 ou outro compatível.
- **Admin interno:** Filament.
- **Pagamento:** provider externo com Pix/cartão, integrado por uma camada própria `PaymentGateway`.
- **Observabilidade:** logs estruturados + Sentry/Flare + Laravel Pulse/Horizon.

### Por que Laravel em vez de TypeScript no backend

Você tem conhecimento parecido em Laravel e TypeScript. Para este produto, eu escolheria **Laravel** porque o seu desafio inicial não é uma API complexa em tempo real; é criar com segurança e rapidez um produto com:

- autenticação;
- dashboard de usuário;
- painel admin;
- upload de imagens;
- processamento em background;
- pagamento;
- webhooks;
- jobs;
- permissões;
- logs administrativos;
- banco relacional maduro;
- regras de acesso;
- templates e CRUDs internos.

Laravel entrega essas partes com menos decisões técnicas soltas. TypeScript no backend também funcionaria bem, principalmente com NestJS/Fastify, mas você teria que montar mais coisas manualmente: auth, policies, painel administrativo, fila, jobs, validação, auditoria, upload seguro, etc.

A recomendação é:

> **Laravel no backend para produtividade, segurança e operação; React/TypeScript no frontend para editor visual, preview e experiência interativa.**

## Frontend dividido entre Marketing e Produto

O frontend deve ser separado conceitualmente entre **Marketing** e **Produto**.

Marketing inclui:

- home;
- landing page;
- demo pública;
- FAQ;
- páginas comerciais;
- páginas institucionais.

Produto inclui:

- escolha de ocasião;
- escolha de template;
- fluxo de criação;
- editor;
- preview;
- checkout;
- painel do usuário.

A home deve ficar na camada de marketing. Ela é a primeira impressão comercial do produto e não deve ser substituída pelo fluxo interno de criação.

O fluxo de escolha de ocasião, templates, editor e checkout deve existir dentro da área de produto. Esse fluxo não deve ocupar o lugar da landing page enquanto a landing não estiver aprovada.

## Estrutura macro do frontend

O frontend do produto deve ser dividido conceitualmente em duas áreas:

1. Marketing / Landing:
   - Home
   - Hero
   - Seções comerciais
   - Demo pública
   - FAQ
   - Prova social
   - Páginas institucionais

2. Produto / Aplicação:
   - Escolha de ocasião
   - Escolha de template
   - Fluxo de criação
   - Editor
   - Preview
   - Checkout
   - Painel do usuário

A área de marketing deve ser tratada como produto de conversão e pode ter prioridades diferentes da aplicação interna.

## 2. Modelo arquitetural

Use um **monólito modular**, não microserviços.

Motivos:

- você é um desenvolvedor solo ou equipe pequena;
- o preço do produto é baixo;
- o MVP precisa sair rápido;
- a maior parte das regras depende do mesmo banco;
- microserviços aumentariam complexidade sem necessidade.

### Componentes principais

```txt
Browser
  |-- Landing page
  |-- Editor React
  |-- Viewer público do scrapbook
  |-- Dashboard do usuário
  |-- Admin Filament

Laravel App
  |-- Controllers / Inertia pages
  |-- Domain services / actions
  |-- Policies / authorization
  |-- Jobs / queues
  |-- Webhooks de pagamento
  |-- Media processing
  |-- Analytics/events

PostgreSQL
  |-- usuários
  |-- templates
  |-- temas
  |-- assets
  |-- presentes
  |-- páginas
  |-- pagamentos
  |-- eventos
  |-- logs

Redis
  |-- cache
  |-- queues
  |-- rate limiting
  |-- locks

S3-compatible storage
  |-- imagens originais
  |-- imagens processadas
  |-- thumbnails
  |-- assets do sistema
  |-- cartões QR/PDF gerados
```

## 3. Estrutura sugerida de pastas

A estrutura abaixo mantém Laravel idiomático, mas com organização por domínio.

```txt
app/
  Actions/
    Gifts/
    Templates/
    Themes/
    Media/
    Payments/
    Analytics/
  Domain/
    Editor/
      CanvasNormalizer.php
      CanvasValidator.php
      SlotMapper.php
    Security/
      PublicTokenGenerator.php
      TokenHasher.php
    Payments/
      PaymentGateway.php
      PaymentResult.php
  Enums/
    GiftStatus.php
    OrderStatus.php
    PaymentStatus.php
    TemplateStatus.php
    ThemeStatus.php
    MediaStatus.php
  Http/
    Controllers/
      GiftEditorController.php
      PublicGiftController.php
      CheckoutController.php
      MediaController.php
      MusicSearchController.php
    Requests/
      Gift/
      Template/
      Theme/
      Media/
      Payment/
    Middleware/
  Jobs/
    ProcessUploadedImage.php
    GenerateQrCard.php
    ExpireOldDrafts.php
    ExpirePaidGifts.php
    ProcessPaymentWebhook.php
    AggregateGiftAnalytics.php
  Models/
  Policies/
  Services/
  Support/

resources/js/
  app.tsx
  pages/
    Landing/
    Auth/
    Dashboard/
    Editor/
    PublicGift/
  features/
    editor/
      components/
      hooks/
      stores/
      renderer/
      schemas/
    scrapbook-viewer/
    media/
    templates/
    themes/
    checkout/
  components/
    ui/
    layout/
  lib/
    api.ts
    routes.ts
    security.ts
    canvas.ts

database/
  migrations/
  seeders/
    InitialOccasionSeeder.php
    InitialModuleSeeder.php
    InitialPlanSeeder.php
    InitialThemeSeeder.php
    InitialTemplateSeeder.php
```

## 4. Bibliotecas recomendadas desde o começo

### Backend Laravel

| Biblioteca / recurso | Uso | Entrar no começo? |
|---|---|---|
| Laravel React Starter Kit ou Laravel + Inertia + React | Base com React, TypeScript, Vite e auth | Sim |
| Laravel Sanctum | Só se você fizer API separada/SPAs em domínios separados; com Inertia e sessão pode não ser necessário para tudo | Talvez |
| Laravel Horizon | Monitorar filas Redis e jobs de imagem, pagamento e limpeza | Sim |
| Filament | Painel admin para templates, temas, assets, usuários, presentes, pagamentos e métricas | Sim |
| Spatie Laravel Permission | Papéis/permissões: admin, suporte, cliente | Sim |
| Spatie Laravel Activitylog ou logs próprios | Auditoria de ações importantes | Sim |
| Intervention Image | Redimensionar, comprimir, converter e limpar metadados das imagens | Sim |
| league/flysystem-aws-s3-v3 | Storage S3-compatible | Sim quando integrar storage real |
| Laravel Pulse | Métricas de performance/uso da aplicação | Depois do MVP ou no início se quiser observabilidade |
| Laravel Telescope | Debug local; não usar aberto em produção | Sim, apenas local |
| Sentry/Flare | Erros em produção | Antes do lançamento |
| Pest/PHPUnit | Testes | Sim |
| Larastan/PHPStan | Análise estática | Sim |
| Laravel Pint | Padronização de código | Sim |

### Frontend React

| Biblioteca | Uso | Entrar no começo? |
|---|---|---|
| React + TypeScript | UI, editor e viewer | Sim |
| Inertia.js React | SPA sem API separada complexa | Sim |
| Tailwind CSS | UI e velocidade | Sim |
| Zustand | Estado local do editor/canvas | Sim |
| Zod | Validação client-side dos documentos JSON/canvas | Sim |
| React Hook Form | Formulários administrativos/editoriais | Sim |
| dnd-kit | Reordenar páginas, listas e elementos simples | Sim |
| react-moveable ou biblioteca equivalente | Mover, redimensionar e rotacionar elementos no canvas | Sim para o editor visual |
| Framer Motion | Microinterações, abertura de envelope, transições | Sim, com parcimônia |
| DOMPurify | Apenas se algum dia permitir rich text/HTML; se usar texto puro, evitar | Talvez |
| QRCode generator | Gerar QR no frontend ou backend | Sim, mas prefira backend para arte final/PDF |

### Observação sobre editor visual

Não comece com um Canva completo. Comece com um **canvas controlado**:

- páginas têm um tamanho base fixo;
- elementos podem ser movidos, redimensionados e rotacionados;
- tudo é salvo em JSON;
- o renderer do editor e o renderer público devem usar o mesmo contrato de dados;
- templates e temas vêm do banco, não hardcoded.

## 5. Regras de negócio decididas até agora

### Produto

- Produto principal: **scrapbook digital**.
- Foco inicial: casais, namoro, amizade.
- Ocasiões iniciais:
  - amor/namoro;
  - feliz aniversário;
  - melhor amiga;
  - aniversário de namoro.
- Outras ocasiões podem vir depois.
- Visual: mistura de fofo/jovem, premium/elegante, romântico/delicado e artesanal/vintage.
- O presente final deve parecer um caderno real sendo folheado, com interações.

### Criação

- Usuário começa escolhendo uma **ocasião**.
- Depois escolhe um **template** daquela ocasião.
- Inicialmente não existe criação 100% do zero.
- Templates são gratuitos no começo.
- O usuário pode personalizar bastante:
  - trocar textos;
  - trocar fotos;
  - reordenar páginas;
  - remover páginas;
  - adicionar páginas;
  - repetir páginas;
  - trocar tema;
  - adicionar/remover stickers;
  - arrastar elementos;
  - redimensionar;
  - rotacionar;
  - mudar fundo/textura;
  - alterar moldura;
  - escolher música.

### Presente final

- Tem capa obrigatória.
- Página final não é obrigatória.
- Tem tela inicial do tipo: “Você recebeu um presente de X”.
- Pode ter barra/progresso quando o formato for caderno folheável.
- No celular, preferencialmente uma página por vez.
- No desktop, pode futuramente existir modo livro aberto, mas o MVP pode manter uma página por vez para simplificar.
- Deve funcionar sem som, mesmo tendo música/efeitos.
- Não terá resposta da pessoa presenteada no MVP.

### Módulos MVP desejados

- Capa.
- Carta principal.
- Galeria de fotos.
- Música.
- Mapa afetivo.
- Coisas que amo em você.
- Página de aniversário.
- Página de amizade.
- Puzzle com foto, se couber no tempo.

### Fotos/mídia

- Apenas fotos no começo.
- Limite inicial sugerido:
  - plano básico: 5 fotos;
  - plano completo: 8 fotos.
- Fotos devem ser comprimidas/processadas.
- Fotos podem ter filtros automáticos para combinar com o tema.
- Algumas fotos podem ficar secretas e aparecer após interação.

### Música

- O usuário deve poder procurar músicas em uma lista.
- A arquitetura deve tratar música como **metadata externo**, não como arquivo hospedado por você.
- No MVP, armazenar:
  - provider;
  - id externo;
  - título;
  - artista;
  - álbum;
  - capa;
  - duração;
  - link externo;
  - preview/embed quando permitido.
- Não hospedar áudio protegido por direitos autorais.

### Pagamento

Recomendação: **pagamento por presente**, não assinatura no início.

Motivos:

- público jovem;
- preço baixo;
- compra emocional e pontual;
- assinatura adiciona fricção;
- assinatura só faz sentido depois para criadores recorrentes, agências ou datas comemorativas.

Modelo inicial recomendado:

- **Presente básico:** preço baixo, poucas páginas/fotos.
- **Presente completo:** preço um pouco maior, mais páginas/fotos/QR/card.

Como você comentou teto de cerca de R$ 6, uma hipótese seria:

- Básico: R$ 3,90 ou R$ 4,90.
- Completo: R$ 5,90.

Não grave preços no código. Grave em tabela `plans`/`price_catalog` e copie snapshot para `orders`.

### Conta e login

Recomendação:

- usuário pode começar a criar sem cadastro;
- o rascunho é salvo por sessão convidada;
- antes de pagar/publicar, ele precisa informar e-mail ou entrar com Google;
- após login, o presente fica vinculado ao perfil;
- dashboard mostra presentes com status: em criação, aguardando pagamento, publicado, visualizado, expirado, desativado.

Isso reduz fricção e ainda resolve o problema de editar depois.

### Expiração

Recomendação:

- Rascunho abandonado: expira após **7 dias sem atividade**.
- Presente pago: expira após período definido pelo plano, por exemplo 180 ou 365 dias.
- Depois de expirar, o presente fica inacessível publicamente.
- Após uma janela de retenção, por exemplo 30 dias, a mídia pode ser removida definitivamente.

Para preço muito baixo, **não recomendo prometer vitalício** no início.

### Link público

Não use apenas slug bonito. Use slug bonito + token aleatório.

Exemplo:

```txt
/p/ana-e-joao-k7Qm92xA
/scrapbook/feliz-aniversario-bia-R8sP21zL
```

- O slug dá estética.
- O token dá segurança.
- Não use ID incremental na URL pública.
- Armazene hash do token, não o token puro.
- Adicione `noindex` para não indexar no Google.

### Edição depois de publicar

Recomendação:

- permitir edição depois do pagamento;
- manter o mesmo link;
- não permitir trocar template depois de publicado;
- permitir trocar tema, textos, fotos e elementos respeitando os limites do plano;
- não ter histórico completo de versões no MVP;
- manter snapshots técnicos curtos apenas para recuperação de autosave.

## 6. Princípios do banco de dados

### Use PostgreSQL

PostgreSQL é uma ótima escolha aqui porque você precisa misturar dados relacionais fortes com documentos flexíveis de design. Use:

- tabelas relacionais para entidades de negócio;
- `jsonb` para canvas, configurações de tema, propriedades de elementos, schema de slots e configurações visuais;
- índices normais para campos usados em filtros;
- GIN em `jsonb` apenas quando você realmente consultar dentro do JSON com frequência.

### ULID/UUID nos IDs

Use ULID ou UUID como chave primária das principais tabelas. Vantagens:

- não expõe volume do negócio;
- evita ID incremental público;
- facilita merge/importação;
- funciona bem para tokens/entidades distribuídas.

Mesmo usando ULID/UUID, para link público use token próprio, não o ID.

### Versionamento é obrigatório para templates e temas

Esta é uma das decisões mais importantes.

Nunca faça um presente depender dinamicamente do template atual. Se você editar um template amanhã, não pode quebrar presentes antigos.

Modelo correto:

- `templates` representa o produto conceitual.
- `template_versions` representa uma versão publicada imutável.
- `gifts` aponta para uma `template_version_id`.
- Ao criar um gift, as páginas do template são copiadas para `gift_pages`.

O mesmo vale para temas:

- `themes` representa o tema conceitual.
- `theme_versions` representa tokens/assets publicados.
- `gifts` aponta para uma `theme_version_id` usada no momento da criação/publicação.

## 7. Modelo de dados proposto

### 7.1 Usuários e autenticação

#### `users`

```txt
id ulid pk
name varchar nullable
email varchar unique nullable
email_verified_at timestamp nullable
password varchar nullable
avatar_url text nullable
locale varchar default 'pt_BR'
timezone varchar default 'America/Sao_Paulo'
last_login_at timestamp nullable
is_active boolean default true
timestamps
soft_deletes
```

#### `social_accounts`

```txt
id ulid pk
user_id fk users
provider varchar -- google
provider_user_id varchar
email varchar nullable
avatar_url text nullable
metadata jsonb
timestamps
unique(provider, provider_user_id)
```

#### `guest_sessions`

Para rascunhos antes do login.

```txt
id ulid pk
user_id fk users nullable
session_token_hash varchar unique
ip_hash varchar nullable
user_agent_hash varchar nullable
last_seen_at timestamp
expires_at timestamp
timestamps
```

#### `magic_login_tokens`

Opcional, se quiser login por e-mail/link mágico.

```txt
id ulid pk
user_id fk users nullable
email varchar
token_hash varchar unique
purpose varchar -- login, recover_draft, checkout
consumed_at timestamp nullable
expires_at timestamp
ip_hash varchar nullable
timestamps
```

### 7.2 Catálogo de criação

#### `occasions`

```txt
id ulid pk
key varchar unique -- love, birthday, best_friend, anniversary
name varchar
description text nullable
icon varchar nullable
sort_order int default 0
is_active boolean default true
default_theme_id fk themes nullable
metadata jsonb
timestamps
```

#### `modules`

Define tipos de página/bloco que o sistema sabe renderizar.

```txt
id ulid pk
key varchar unique -- cover, letter, gallery, music, affective_map, love_list, puzzle
name varchar
description text nullable
renderer_key varchar -- nome usado no React renderer
renderer_version int default 1
is_interactive boolean default false
is_active boolean default true
content_schema jsonb -- campos esperados
settings_schema jsonb -- configurações possíveis
limits_schema jsonb -- limites por plano/template
metadata jsonb
sort_order int default 0
timestamps
```

Observação: adicionar um **novo módulo real** quase sempre exige código no renderer. Adicionar **novos templates, temas e assets** deve ser possível pelo admin sem código.

### 7.3 Temas e assets visuais

#### `themes`

```txt
id ulid pk
key varchar unique
name varchar
description text nullable
mood varchar nullable -- fofo, premium, romantico, vintage
status varchar -- draft, published, archived
current_version_id fk theme_versions nullable
thumbnail_path text nullable
sort_order int default 0
created_by fk users nullable
timestamps
soft_deletes
```

#### `theme_versions`

```txt
id ulid pk
theme_id fk themes
version int
status varchar -- draft, published, archived
tokens jsonb -- cores, fontes, sombras, fundos, filtros, botões
asset_pack_ids jsonb -- ids de packs recomendados
preview_config jsonb
published_at timestamp nullable
created_by fk users nullable
timestamps
unique(theme_id, version)
```

Exemplo de `tokens`:

```json
{
  "colors": {
    "background": "#F8E9EF",
    "paper": "#FFF7F0",
    "primary": "#D94F7B",
    "accent": "#7A2E3C",
    "text": "#2A2024"
  },
  "fonts": {
    "title": "handwritten_01",
    "body": "rounded_01"
  },
  "textures": {
    "defaultPaper": "asset_ulid",
    "background": "asset_ulid"
  },
  "imageFilters": {
    "default": "warm_soft"
  }
}
```

#### `asset_categories`

```txt
id ulid pk
key varchar unique -- sticker, texture, frame, tape, paper, envelope, doodle
name varchar
sort_order int default 0
timestamps
```

#### `asset_packs`

```txt
id ulid pk
theme_id fk themes nullable
name varchar
key varchar unique
mood varchar nullable
is_global boolean default false
is_active boolean default true
sort_order int default 0
timestamps
```

#### `design_assets`

```txt
id ulid pk
asset_pack_id fk asset_packs nullable
asset_category_id fk asset_categories
type varchar -- sticker, texture, frame, tape, paper, envelope, icon
name varchar
file_disk varchar
file_path text
preview_path text nullable
mime_type varchar
width int nullable
height int nullable
size_bytes bigint nullable
tags jsonb
default_transform jsonb
usage_rules jsonb
license_info jsonb nullable
is_active boolean default true
created_by fk users nullable
timestamps
soft_deletes
```

### 7.4 Templates

#### `templates`

```txt
id ulid pk
occasion_id fk occasions
key varchar unique
name varchar
description text nullable
status varchar -- draft, published, archived
current_version_id fk template_versions nullable
thumbnail_path text nullable
is_featured boolean default false
sort_order int default 0
created_by fk users nullable
timestamps
soft_deletes
```

#### `template_versions`

```txt
id ulid pk
template_id fk templates
version int
status varchar -- draft, published, archived
default_theme_version_id fk theme_versions nullable
format varchar -- book, folded_sheet, poster, story
orientation varchar -- portrait, landscape, adaptive
artboard_width int -- ex: 390
artboard_height int -- ex: 844
page_mode varchar -- single_page, spread
min_pages int default 1
max_pages int nullable
canvas_config jsonb
rules jsonb
content_slot_schema jsonb
published_at timestamp nullable
created_by fk users nullable
timestamps
unique(template_id, version)
```

#### `template_pages`

```txt
id ulid pk
template_version_id fk template_versions
module_id fk modules
page_key varchar
name varchar
position int
is_required boolean default false
min_occurrences int default 0
max_occurrences int nullable
canvas_json jsonb
content_defaults jsonb
editable_slots jsonb
interaction_config jsonb
responsive_config jsonb
timestamps
unique(template_version_id, page_key)
```

#### `template_slots`

Tabela opcional, mas recomendada para mapear conteúdo entre templates.

```txt
id ulid pk
template_page_id fk template_pages
slot_key varchar -- cover_title, main_letter, gallery_photo_1
slot_type varchar -- text, image, music, map_point, sticker_group
label varchar
is_required boolean default false
default_value jsonb nullable
constraints jsonb nullable
timestamps
unique(template_page_id, slot_key)
```

### 7.5 Planos/preços

#### `plans`

```txt
id ulid pk
key varchar unique -- basic, complete
name varchar
description text nullable
price_cents int
currency char(3) default 'BRL'
max_pages int
max_photos int
max_user_assets int nullable
max_music_tracks int default 1
gift_duration_days int -- ex: 180 ou 365
features jsonb
is_active boolean default true
sort_order int default 0
timestamps
```

Exemplo de `features`:

```json
{
  "qr_code": true,
  "printable_card": true,
  "puzzle": false,
  "affective_map": true,
  "custom_stickers": true,
  "remove_branding": false
}
```

### 7.6 Presentes/scrapbooks

#### `gifts`

```txt
id ulid pk
owner_user_id fk users nullable
guest_session_id fk guest_sessions nullable
occasion_id fk occasions
template_id fk templates nullable
template_version_id fk template_versions nullable
theme_id fk themes nullable
theme_version_id fk theme_versions nullable
plan_id fk plans nullable
status varchar -- draft, checkout_pending, paid_unpublished, published, disabled, expired, deleted
visibility varchar default 'unlisted'
title varchar nullable
recipient_name varchar nullable
sender_name varchar nullable
cover_message text nullable
public_slug varchar nullable
public_token_hash varchar unique nullable
edit_token_hash varchar unique nullable
settings jsonb
limits_snapshot jsonb
price_snapshot jsonb
branding_enabled boolean default true
noindex boolean default true
paid_at timestamp nullable
published_at timestamp nullable
first_viewed_at timestamp nullable
last_viewed_at timestamp nullable
last_edited_at timestamp nullable
expires_at timestamp nullable
deleted_at timestamp nullable
timestamps
```

Notas:

- `limits_snapshot` copia limites do plano no momento da compra.
- `price_snapshot` copia preço e moeda no momento da compra.
- `public_token_hash` deve ser hash de token aleatório forte.
- Nunca exponha `edit_token_hash`.

#### `gift_pages`

```txt
id ulid pk
gift_id fk gifts
source_template_page_id fk template_pages nullable
module_id fk modules
page_key varchar
name varchar nullable
position int
status varchar -- active, hidden, deleted
canvas_json jsonb
content_json jsonb
interaction_state jsonb
style_overrides jsonb
responsive_overrides jsonb
created_by_user_id fk users nullable
timestamps
soft_deletes
index(gift_id, position)
```

### 7.7 Contrato do canvas JSON

O canvas é o coração do editor. Ele precisa ser versionado.

Exemplo simplificado:

```json
{
  "schemaVersion": 1,
  "artboard": {
    "width": 390,
    "height": 844,
    "safeArea": { "top": 24, "right": 16, "bottom": 24, "left": 16 }
  },
  "background": {
    "type": "asset",
    "assetId": "asset_ulid",
    "color": "var(--paper)"
  },
  "elements": [
    {
      "id": "el_01",
      "type": "image",
      "slotKey": "gallery_photo_1",
      "mediaId": "media_ulid",
      "x": 42,
      "y": 120,
      "w": 180,
      "h": 220,
      "rotation": -4,
      "z": 10,
      "opacity": 1,
      "locked": false,
      "style": {
        "frame": "polaroid_white",
        "shadow": "soft"
      },
      "crop": {
        "x": 0.5,
        "y": 0.5,
        "zoom": 1.1
      },
      "interactions": []
    },
    {
      "id": "el_02",
      "type": "text",
      "slotKey": "main_title",
      "text": "Feliz aniversário, amor",
      "x": 28,
      "y": 52,
      "w": 330,
      "h": 90,
      "rotation": 0,
      "z": 20,
      "style": {
        "fontToken": "title",
        "fontSize": 42,
        "color": "var(--primary)",
        "align": "center"
      }
    },
    {
      "id": "el_03",
      "type": "sticker",
      "assetId": "asset_heart_01",
      "x": 300,
      "y": 190,
      "w": 48,
      "h": 48,
      "rotation": 12,
      "z": 30
    }
  ]
}
```

### Regras do canvas

- Coordenadas sempre no sistema do artboard, não em pixels reais da tela.
- Renderer escala proporcionalmente no celular/desktop.
- Todo elemento precisa ter `id`, `type`, `x`, `y`, `w`, `h`, `z`.
- Elementos de usuário podem ser livres, mas devem respeitar limites mínimos e máximos.
- Textos de usuário devem ser texto puro, nunca HTML não sanitizado.
- Elementos interativos devem declarar `interactions` de forma explícita.
- Todo JSON deve ter `schemaVersion`.
- Mudança de schema exige migrator: `CanvasSchemaMigrator`.

### 7.8 Mídia

#### `media_items`

```txt
id ulid pk
user_id fk users nullable
gift_id fk gifts nullable
type varchar -- image
original_filename varchar nullable
size_bytes bigint
width int nullable
height int nullable
storage_disk varchar
storage_path text
mime_type varchar
variants jsonb -- thumbnail e futuras versões
metadata jsonb
status varchar -- pending, processing, processed, failed, deleted
timestamps
soft_deletes
```

No MVP de mídia do editor, cada upload gera apenas imagem processada em WebP e thumbnail, sem guardar o arquivo bruto original. O arquivo é sempre associado a `user_id` e `gift_id`.

#### `media_variants` conceitual

```txt
id ulid pk -- futuro, se sair de variants jsonb
media_id fk media_items
variant_key varchar -- thumb, preview, large, webp
storage_disk varchar
path text
mime_type varchar
width int nullable
height int nullable
size_bytes bigint nullable
metadata jsonb
timestamps
unique(media_id, variant_key)
```

### 7.9 Música

#### `music_tracks`

```txt
id ulid pk
provider varchar -- spotify, youtube, internal_future
provider_track_id varchar
name varchar
artist varchar nullable
album varchar nullable
duration_ms int nullable
cover_url text nullable
external_url text nullable
preview_url text nullable
metadata jsonb
last_synced_at timestamp nullable
timestamps
unique(provider, provider_track_id)
```

#### `gift_music`

```txt
id ulid pk
gift_id fk gifts
music_track_id fk music_tracks
page_id fk gift_pages nullable
display_style jsonb
start_at_ms int nullable
timestamps
unique(gift_id, music_track_id)
```

### 7.10 Pagamentos

#### `orders`

```txt
id ulid pk
user_id fk users
gift_id fk gifts
plan_id fk plans
status varchar -- pending, paid, cancelled, expired, refunded
subtotal_cents int
discount_cents int default 0
total_cents int
currency char(3) default 'BRL'
price_snapshot jsonb
provider varchar nullable
provider_checkout_id varchar nullable
provider_payment_url text nullable
expires_at timestamp nullable
paid_at timestamp nullable
cancelled_at timestamp nullable
timestamps
```

#### `payments`

```txt
id ulid pk
order_id fk orders
provider varchar
provider_payment_id varchar nullable
method varchar nullable -- pix, credit_card
status varchar -- pending, approved, rejected, refunded, cancelled
amount_cents int
currency char(3)
raw_payload jsonb
approved_at timestamp nullable
failed_at timestamp nullable
timestamps
unique(provider, provider_payment_id)
```

#### `payment_webhook_events`

```txt
id ulid pk
provider varchar
provider_event_id varchar nullable
payload jsonb
status varchar -- received, processed, ignored, failed
processed_at timestamp nullable
error_message text nullable
timestamps
unique(provider, provider_event_id)
```

### 7.11 QR Code e cartão imprimível

#### `gift_delivery_assets`

```txt
id ulid pk
gift_id fk gifts
type varchar -- qr_png, printable_card_pdf, printable_card_png
storage_disk varchar
path text
status varchar -- pending, ready, failed
metadata jsonb
generated_at timestamp nullable
timestamps
```

### 7.12 Analytics

#### `gift_events`

```txt
id ulid pk
gift_id fk gifts
page_id fk gift_pages nullable
event_type varchar -- opened, page_viewed, shared, interaction_clicked, music_played, qr_downloaded
viewer_session_hash varchar nullable
ip_hash varchar nullable
user_agent_hash varchar nullable
device_type varchar nullable
referrer_host varchar nullable
metadata jsonb
created_at timestamp
```

#### `gift_daily_metrics`

```txt
id ulid pk
gift_id fk gifts
date date
opens int default 0
unique_viewers int default 0
page_views int default 0
shares int default 0
interactions int default 0
last_opened_at timestamp nullable
timestamps
unique(gift_id, date)
```

### 7.13 Auditoria/admin

Se usar Spatie Activitylog, ele criará tabelas próprias. Ainda assim, você pode ter uma tabela de auditoria customizada para ações críticas.

#### `admin_audit_logs`

```txt
id ulid pk
actor_user_id fk users nullable
action varchar
subject_type varchar nullable
subject_id varchar nullable
ip_hash varchar nullable
user_agent_hash varchar nullable
before jsonb nullable
after jsonb nullable
metadata jsonb
created_at timestamp
```

## 8. Índices importantes

Crie índices pensando nos filtros reais.

### Gifts

```txt
index(owner_user_id, status)
index(owner_user_id, updated_at)
index(status, expires_at)
unique(public_token_hash)
index(public_slug)
index(template_version_id)
index(theme_version_id)
```

### Gift pages

```txt
index(gift_id, position)
index(gift_id, status)
```

### Media

```txt
index(gift_id, status)
index(uploaded_by_user_id)
index(sha256)
```

### Templates

```txt
index(occasion_id, status, sort_order)
index(current_version_id)
```

### Payments/orders

```txt
index(user_id, status)
index(gift_id)
index(status, created_at)
unique(provider, provider_payment_id)
unique(provider, provider_event_id)
```

### Analytics

```txt
index(gift_id, created_at)
index(gift_id, event_type, created_at)
index(event_type, created_at)
```

### JSONB

Só criar GIN quando houver query real dentro do JSON.

Exemplo:

```sql
CREATE INDEX design_assets_tags_gin ON design_assets USING gin (tags);
CREATE INDEX gift_pages_canvas_gin ON gift_pages USING gin (canvas_json);
```

Não indexe todo JSONB por ansiedade. Primeiro meça.

## 9. Fluxos principais

### 9.1 Criação de presente

```txt
1. Visitante escolhe ocasião.
2. Escolhe template.
3. Backend cria gift draft.
4. Gift recebe template_version publicada e theme_version padrão.
5. Backend copia template_pages para gift_pages.
6. Usuário edita no React.
7. Autosave salva páginas alteradas.
8. Uploads são enviados para gift_media.
9. Jobs processam imagens.
10. Preview usa o mesmo renderer do viewer público.
11. Antes de pagar/publicar, usuário faz login ou informa e-mail.
12. Gift passa a ter owner_user_id.
13. Usuário escolhe plano.
14. Order é criada.
15. Checkout/Pix é iniciado.
16. Webhook confirma pagamento.
17. Gift é liberado para publicar.
18. Usuário publica.
19. Sistema gera public token, QR code e card.
20. Dashboard mostra status publicado.
```

### 9.2 Viewer público

```txt
1. Pessoa abre URL /p/{slug-token}.
2. Backend localiza gift por hash do token.
3. Confere status published e expires_at.
4. Retorna view Inertia/React ou HTML com dados necessários.
5. Meta tags têm noindex.
6. Viewer carrega páginas e assets.
7. Eventos são enviados de forma assíncrona.
8. Dados de analytics são agregados posteriormente.
```

### 9.3 Troca de tema

```txt
1. Usuário escolhe novo theme_version.
2. Sistema aplica tokens do tema.
3. Elementos customizados do usuário permanecem.
4. Elementos de tema podem ser trocados apenas se ainda não foram editados manualmente.
5. Gift registra theme_version_id nova.
6. Páginas mantêm overrides do usuário.
```

### 9.4 Troca de template

No MVP, recomendo limitar bastante.

Regra sugerida:

- Só pode trocar template enquanto o presente estiver em `draft`.
- Se o usuário já fez muitas edições manuais, mostrar aviso.
- Conteúdos são mapeados por `slot_key`.
- Conteúdos sem destino vão para uma área de “itens não posicionados”.
- Depois de publicado, template não pode ser trocado.

## 10. Segurança

### Verdade importante

Não existe aplicação real com garantia de **0 vulnerabilidades**. O objetivo profissional é construir com segurança por padrão, reduzir superfície de ataque, testar, auditar, monitorar e corrigir rápido.

### Princípios obrigatórios

- Nenhum ID incremental em URL pública.
- Tokens aleatórios fortes e armazenados como hash.
- Políticas de autorização em todo recurso sensível.
- Form Requests para toda entrada importante.
- Validação server-side sempre. Validação frontend é apenas ajuda visual.
- Texto do usuário renderizado como texto, não HTML.
- Se algum dia permitir HTML/rich text, sanitizar no servidor e no cliente.
- Upload de imagem com validação real, limite de tamanho e reprocessamento.
- Remover EXIF/metadados das imagens processadas.
- Nunca confiar em MIME vindo do navegador.
- Bucket sem listagem pública.
- Nomes de arquivo aleatórios.
- Webhook de pagamento com assinatura verificada e idempotência.
- Rate limit em login, upload, criação de presente, busca de música e endpoints públicos.
- Cookies `HttpOnly`, `Secure`, `SameSite`.
- CSRF habilitado.
- CSP configurada.
- HSTS em produção.
- Logs sem dados sensíveis.
- Admin protegido por role, 2FA no futuro e allowlist opcional.
- Backups automáticos.
- Testes de autorização obrigatórios.

### Checklist mínimo por rota

Para cada rota, responder:

1. Precisa estar logado?
2. Quem é dono do recurso?
3. Admin pode acessar?
4. Suporte pode acessar?
5. A rota muda estado?
6. Precisa CSRF?
7. Precisa rate limit?
8. Quais campos são permitidos?
9. Há upload?
10. A resposta vaza dados internos?

## 11. Estratégia de storage

### Mídia do usuário

- Armazenar original em pasta privada ou semi-privada.
- Gerar versões processadas otimizadas.
- Renderizar preferencialmente versão processada.
- Apagar originais antigos se não forem necessários.
- Usar paths aleatórios:

```txt
gifts/{gift_ulid}/media/{media_ulid}/original.jpg
gifts/{gift_ulid}/media/{media_ulid}/large.webp
gifts/{gift_ulid}/media/{media_ulid}/thumb.webp
```

### Assets do sistema

```txt
system/assets/{asset_ulid}/file.png
system/assets/{asset_ulid}/preview.webp
```

### Cartões QR/PDF

```txt
gifts/{gift_ulid}/delivery/qr.png
gifts/{gift_ulid}/delivery/card.pdf
```

## 12. Autosave

O editor precisa de autosave bom.

Recomendação:

- salvar alterações com debounce, por exemplo 1 a 3 segundos;
- salvar por página, não o presente inteiro sempre;
- manter `last_edited_at` em gifts;
- em caso de falha, mostrar indicador;
- persistir draft local temporário para evitar perda imediata;
- servidor é a fonte da verdade;
- antes de checkout, forçar sincronização final.

Tabelas adicionais opcionais:

#### `gift_draft_snapshots`

```txt
id ulid pk
gift_id fk gifts
page_id fk gift_pages nullable
snapshot_type varchar -- autosave, before_checkout, recovery
payload jsonb
created_at timestamp
```

Guarde poucos snapshots técnicos, com limpeza automática.

## 13. Admin

O admin deve permitir:

- gerenciar ocasiões;
- gerenciar módulos;
- gerenciar temas;
- criar versões de temas;
- gerenciar assets/stickers/texturas;
- criar templates;
- criar versões de templates;
- montar páginas de template;
- publicar/despublicar templates;
- ver presentes criados;
- ver pagamentos;
- desativar presente;
- ver logs;
- ver métricas;
- reprocessar mídia com falha;
- verificar webhooks;
- editar configurações gerais.

Importante:

> O admin de template pode começar simples. Não tente construir um Figma interno no primeiro mês. Você pode cadastrar templates via JSON/seeders inicialmente, mas a arquitetura já deve ter tabelas e versionamento para no futuro editar tudo visualmente no admin.

## 14. MVP técnico recomendado

### MVP mínimo vendável

- Login/cadastro com Google e/ou e-mail.
- Dashboard do usuário.
- Ocasiões: amor, aniversário, melhor amiga, aniversário de namoro.
- Templates iniciais, mesmo que poucos.
- Temas iniciais, mesmo que poucos.
- Editor mobile-first.
- Upload de fotos.
- Canvas com mover/redimensionar/rotacionar.
- Capa, carta, galeria, música e página especial simples.
- Viewer público com link seguro.
- Pagamento por presente.
- QR code básico.
- Admin para ver gifts, pagamentos e ativos básicos.
- Logs/auditoria mínimos.
- Limpeza de drafts abandonados.

### Não colocar no MVP se atrasar muito

- Editor admin visual completo.
- Marketplace.
- Colaboração.
- IA.
- Vídeos.
- Assinatura.
- Muitos mini games.
- Páginas “abra quando”.
- Resposta da pessoa presenteada.
- Internacionalização.

## 15. Decisões que podem mudar depois

- Preço exato.
- Quantidade de templates iniciais.
- Quantidade de temas iniciais.
- Se o puzzle entra no MVP.
- Duração exata do presente pago.
- Provider de pagamento.
- Provider musical.
- Se vai existir login por senha ou apenas Google/e-mail mágico.

## 16. Decisões que eu não mudaria

- Laravel + React + PostgreSQL.
- Monólito modular.
- Templates e temas versionados.
- Gift copia páginas do template.
- Canvas JSON com schemaVersion.
- Public URL com slug + token forte.
- Pagamento por presente no início.
- Login exigido antes de pagamento/publicação.
- Admin com Filament.
- Storage S3-compatible.
- Jobs para processamento de imagens.
- Segurança desde o primeiro commit.

## 17. Modelo de domínio implementado nesta fase

O domínio real foi estruturado em `app/Domain`, mantendo `App\Models\User` como model de autenticação do starter kit. As entidades principais de produto usam ULID e ficam separadas por domínio:

- Catálogo e criação: `Occasion`, `Template`, `TemplateVersion`, `TemplatePage`, `Theme`, `ThemeVersion`, `Asset`, `Plan`.
- Presente: `Gift`, `GiftPage`, `MediaItem`, `MusicSelection`.
- Pagamento: `Order`, `Payment`.
- Analytics: `GiftVisit`, `GiftEvent`.

### Templates, temas e gifts

- `templates` e `themes` representam conceitos comerciais/editáveis.
- `template_versions` e `theme_versions` representam versões publicáveis com status `draft`, `published` ou `archived`.
- Gifts são criados a partir de uma `template_version` publicada e apontam para a `theme_version` usada no momento.
- Ao criar um gift, as `template_pages` são copiadas para `gift_pages`; gifts antigos não dependem da versão mutável do template.
- `canvas`, `config`, `editable_schema`, `constraints`, `settings`, `metadata`, `features` e snapshots são `jsonb` e devem conter `schemaVersion` quando definirem contrato de renderização.

### Link público

- O link público não usa ID incremental.
- `gifts.slug` é apenas estético e pode ser nulo.
- `gifts.public_code` é o token forte usado para resolver acesso público.
- Gift público precisa estar `published`, com `visibility = public_link`, `public_code` preenchido e sem expiração vencida.
- Gifts `disabled` ou `expired` não devem ser resolvidos publicamente.

### Mídia e música

- `media_items` guarda mídia enviada pelo usuário, principalmente imagens no MVP.
- Não aceitar vídeos no MVP.
- Não aceitar URL arbitrária como mídia enviada pelo usuário.
- Mídia deve pertencer ao usuário ou ao gift dele para poder ser usada no canvas.
- Música fica em `music_selections` como metadata externa; não hospedar áudio protegido.

### Orders e payments

- `plans.price_cents`, `orders.amount_cents` e `payments.amount_cents` usam inteiro em centavos, nunca float.
- `orders` pertencem a `user`, `gift` e `plan`.
- `payments` pertencem a `orders` e guardam eventos/transações do provider.
- Checkout e webhooks reais dependem de provider futuro; a estrutura local já preserva snapshots de preço/limites em metadata.

## 18. Painel administrativo inicial

O painel administrativo usa Filament em `/admin` e opera diretamente os models reais de `app/Domain`. Ele não substitui o domínio por models em `app/Models` e não cria dados hardcoded no frontend.

### Papel do Filament

- Administrar dados de catálogo, visual, templates, operação, pagamentos e analytics.
- Permitir que ocasiões, planos, temas, assets e templates existam no banco antes do fluxo público.
- Operar gifts, mídia, orders, payments, visitas e eventos sem criar checkout real, viewer público ou editor visual nesta fase.
- Manter autenticação por sessão e restrição por role via `User::canAccessPanel`.

### Resources principais

O admin inicial possui resources para:

- Produto: `Occasion`, `Plan`.
- Visual: `Theme`, `ThemeVersion`, `Asset`.
- Templates: `Template`, `TemplateVersion`, `TemplatePage`.
- Operação: `Gift`, `GiftPage`, `MediaItem`.
- Pagamentos: `Order`, `Payment`.
- Analytics: `GiftVisit`, `GiftEvent`.

`GiftPage` existe como resource auxiliar e fica fora da navegação principal, priorizando o uso pelo relation manager dentro de `Gift`.

### Relação com o domínio

- Resources usam os models de `app/Domain`.
- `admin` acessa todos os resources.
- `support` acessa recursos operacionais, pagamentos e analytics.
- `customer` e usuários não autenticados não acessam o painel.
- `/horizon` continua protegido por Gate para `admin` e `support`.

### JSON administrável

Campos como `metadata`, `config`, `preview_config`, `default_config`, `canvas`, `editable_schema`, `constraints`, `settings`, `variants`, `raw_payload`, `payload` e `features` são editados/visualizados como JSON e recebem validação mínima de JSON válido no formulário.

### Cuidado com versionamento

- `ThemeVersion` e `TemplateVersion` têm ações administrativas de publicar e arquivar.
- Publicar uma versão arquiva versões publicadas conflitantes do mesmo tema/template.
- `TemplateVersion` pode ser duplicada para criar um novo draft com cópia das páginas.
- Gifts continuam apontando para as versões usadas no momento de criação/publicação; o admin não deve criar lógica que faça gifts dependerem de versões mutáveis.

## 19. Fluxo inicial de criação do cliente

O primeiro fluxo real do cliente transforma dados administrados no banco em um `Gift` rascunho. A landing continua sendo marketing; o fluxo de produto começa em `/criar`.

### Separação de rotas

Rotas públicas de criação:

- `GET /criar`: lista `Occasion` ativas vindas do banco.
- `GET /criar/{occasion:slug}`: lista `Template` ativos daquela ocasião que possuam `TemplateVersion` publicada.
- `GET /criar/{occasion:slug}/{template:slug}`: mostra detalhes da versão publicada, páginas, tema sugerido e plano padrão ativo.

Rotas autenticadas:

- `POST /gifts`: cria o `Gift` draft a partir de uma `TemplateVersion` publicada.
- `GET /app/gifts`: lista gifts do usuário autenticado.
- `GET /app/gifts/{gift}/edit`: abre o Editor MVP do rascunho.
- `PATCH /app/gifts/{gift}`: atualiza metadados básicos do draft.
- `PATCH /app/gifts/{gift}/pages/{giftPage}`: atualiza o canvas JSON de uma página com `UpdateGiftPageCanvas`.
- `GET /app/gifts/{gift}/media`: lista imagens processadas do Gift.
- `POST /app/gifts/{gift}/media`: recebe upload de imagem do Gift draft.
- `GET /app/gifts/{gift}/media/{mediaItem}`: serve imagem por rota autenticada.
- `GET /app/gifts/{gift}/media/{mediaItem}/thumbnail`: serve thumbnail por rota autenticada.
- `DELETE /app/gifts/{gift}/media/{mediaItem}`: desativa mídia própria do Gift.

### Regras do draft

- A criação usa `CreateGiftFromTemplate`.
- Apenas `TemplateVersion` publicada pode gerar gift.
- Apenas `ThemeVersion` publicada e com tema ativo pode ser usada.
- O plano padrão vem de `template_versions.default_config.plan_id` ou do primeiro `Plan` ativo do banco.
- O `Gift` nasce como `draft`, privado, associado ao usuário autenticado, com `last_edited_at` preenchido.
- As `TemplatePage` da versão publicada são copiadas para `GiftPage`, preservando `sort_order`, `page_type`, `name` e `canvas`.
- O fluxo não gera publicação, checkout, viewer público nem editor visual avançado.

### Área do usuário

O painel em `/app/gifts` mostra apenas gifts do usuário autenticado. A tela `/app/gifts/{gift}/edit` é o Editor MVP: permite navegar entre páginas copiadas do template, visualizar preview via renderer compartilhado, editar textos existentes, enviar imagens do Gift, aplicar imagens em elementos `image` existentes no canvas e salvar metadados básicos do gift.

### Segurança aplicada

- Rotas que criam ou alteram gifts usam middleware `auth`.
- Policies bloqueiam visualização/edição de gifts de outro usuário.
- `GiftPage` só pode ser alterada pelo dono do gift e enquanto o gift está em `draft`.
- Form Requests validam versões publicadas, plano ativo, ownership da página, upload seguro e canvas sem HTML/URLs externas arbitrárias.
- Mídias só podem ser listadas, servidas, excluídas ou usadas no canvas quando pertencem ao mesmo usuário e ao mesmo Gift.
- Dados enviados às páginas Inertia são resumos mínimos, sem payloads de pagamento, hashes ou dados de outros usuários.

## 21. Editor MVP de drafts

O Editor MVP é uma camada de produto sobre drafts já existentes. Ele não é um editor livre estilo Canva; nesta etapa o usuário edita conteúdo textual e troca imagens em elementos já presentes no canvas.

### Fluxo de edição

- O usuário autenticado abre `/app/gifts/{gift}/edit`.
- A policy garante que o gift pertence ao usuário.
- O backend envia somente resumo seguro do gift, páginas ordenadas, canvas, mídias processadas do Gift, flags `is_visible`/`locked`, URLs de update/upload e limite de texto.
- O frontend mantém estado local para página selecionada, canvas local, dirty state, salvamento e metadados básicos.
- O usuário seleciona uma página, vê o preview, edita elementos `type: text`, envia imagens, aplica mídia em elementos `type: image` e salva manualmente.
- `PATCH /app/gifts/{gift}/pages/{giftPage}` persiste o canvas por `UpdateGiftPageCanvas`.

### Separação renderer/editor

- `resources/js/components/renderer` é a base compartilhada de renderização para editor e futuro viewer público.
- O editor não duplica regras visuais do renderer; ele monta UI de navegação e propriedades ao redor do preview.
- O renderer aceita fallback seguro para canvas simples, elementos desconhecidos e mídia ainda não disponível.

### Metadados permitidos

`PATCH /app/gifts/{gift}` aceita somente:

- `title`;
- `recipient_name`;
- `sender_name`.

O editor não altera `user_id`, `plan_id`, `status`, `public_code`, versões de template/tema, expiração, publicação ou dados de pagamento.

### Segurança do canvas

- Canvas é dado não confiável e sempre passa por validação server-side.
- `schemaVersion` precisa ser `1` e `elements` precisa ser uma lista.
- Textos são tratados como texto puro, sem HTML, `script`, `innerHTML`, URLs externas ou protocolos inseguros.
- O limite de texto vem de `constraints.maxTextLength` quando existir, com fallback seguro.
- Páginas `locked` podem ser visualizadas, mas não editadas.
- Referências de mídia são autorizadas por `user_id`, `gift_id`, tipo `image` e status `processed` antes de salvar.
- Elementos `image` não podem persistir `src` externo ou relativo arbitrário; quando `mediaItemId` é válido, o backend substitui `src` pela rota segura do app.

### Upload/mídia básica

- `GiftMediaController` lista, recebe upload, serve imagem/thumbnail autenticadas e desativa mídia.
- `StoreGiftMediaRequest` aceita apenas um arquivo por upload, com MIME/extensão de JPG/JPEG, PNG ou WebP, tamanho e dimensões máximas centralizados em `config/scrapbook.php`.
- `ProcessUploadedImage` é a action central: valida Gift próprio em `draft`, checa limites do plano/config, reprocessa com Intervention Image, salva WebP otimizado e thumbnail no disco configurado e cria `MediaItem` `processed`.
- O editor recebe somente `id`, tipo, nome original, URL segura, thumbnail, dimensões, tamanho, status e data; não recebe `storage_path` nem metadata interna.
- Storage continua S3-compatible/MinIO em desenvolvimento via `FILESYSTEM_DISK=s3`, mas o browser usa rotas autenticadas do Laravel.

### Limites desta etapa

Não entram neste MVP: drag-and-drop, redimensionamento, rotação livre, crop/filtros, publicação, checkout, viewer público, demo pública, integração musical externa e builder visual de templates no admin.

## 20. Autenticação real mínima do cliente

A autenticação do cliente usa sessão Laravel padrão com Inertia, sem autenticação paralela. As telas públicas de auth são:

- `GET /login` e `POST /login`.
- `GET /cadastro` e `POST /cadastro`.
- `POST /logout`.

### Regras de cadastro e login

- Cadastro cria `User` com `name`, `email` único e `password` com hash.
- O usuário público nunca escolhe role.
- Todo usuário cadastrado pelo fluxo público recebe a role `customer` via Spatie Permission.
- `admin` e `support` continuam reservados a seed/admin interno.
- Login usa `Auth::attempt`, erro genérico de credenciais, regeneração de sessão e rate limit.
- Logout encerra o guard web, invalida a sessão e regenera o token CSRF.
- Rotas `guest` redirecionam usuários já autenticados para `/app/gifts`.

### Integração com criação

O visitante pode explorar `/criar`, `/criar/{occasion}` e `/criar/{occasion}/{template}` sem login. Para executar `POST /gifts`, a rota continua protegida por `auth`.

Se um visitante tentar criar gift sem sessão, o backend preserva a intenção usando o `template_version_id` enviado e redireciona para `/login?return_to=/criar/{occasion}/{template}`. Depois de login ou cadastro, o usuário volta para o template escolhido e pode concluir a criação do draft com segurança.

### Rotas autenticadas do cliente

- `POST /gifts`: cria o draft com `CreateGiftFromTemplate`.
- `GET /app/gifts`: lista somente gifts do usuário autenticado.
- `GET /app/gifts/{gift}/edit`: abre o Editor MVP do rascunho.
- `PATCH /app/gifts/{gift}`: salva metadados básicos.
- `PATCH /app/gifts/{gift}/pages/{giftPage}`: salva canvas JSON da página.
- `GET|POST /app/gifts/{gift}/media`: lista e envia imagens do Gift draft.
- `GET /app/gifts/{gift}/media/{mediaItem}` e `/thumbnail`: servem mídia autenticada.
- `DELETE /app/gifts/{gift}/media/{mediaItem}`: desativa mídia própria.

### Dados globais no Inertia

`HandleInertiaRequests` compartilha apenas dados seguros do usuário autenticado:

- `id`;
- `name`;
- `email`;
- lista simples de `roles`;
- flag `isAdmin`.

Esses dados são usados pela landing/header para alternar entre Login, Meus presentes, Sair e Criar presente, sem transformar a landing em dashboard.
