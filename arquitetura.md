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
status varchar -- draft, pending_payment, published, disabled, expired
visibility varchar default 'private'
title varchar nullable
recipient_name varchar nullable
sender_name varchar nullable
cover_message text nullable
slug varchar nullable
public_code varchar unique nullable
edit_token_hash varchar unique nullable
settings jsonb
limits_snapshot jsonb
price_snapshot jsonb
branding_enabled boolean default true
noindex boolean default true
published_at timestamp nullable
first_viewed_at timestamp nullable
last_viewed_at timestamp nullable
last_edited_at timestamp nullable
expires_at timestamp nullable
deleted_at timestamp nullable
timestamps
```

Notas:

- `limits_snapshot` copia limites do plano no momento da criação/checkout.
- `public_code` deve ser token público forte e nunca funcionar sem slug.
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
      "name": "Foto principal",
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
      "hidden": false,
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
- Todo elemento pode ter `name`, `locked` e `hidden`; defaults são `name` ausente, `locked = false` e `hidden = false`.
- `name` serve para a UI de camadas e precisa ser texto curto, sem HTML/script.
- Elementos `locked` não podem ser transformados, editados ou deletados pelo editor.
- Elementos `hidden` não renderizam no canvas visual, preview privado ou viewer público.
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
status varchar -- draft, pending, paid, canceled, expired, refunded
amount_cents int
currency char(3) default 'BRL'
provider varchar nullable
provider_reference varchar nullable
checkout_url text nullable
metadata jsonb
expires_at timestamp nullable
paid_at timestamp nullable
timestamps
```

#### `payments`

```txt
id ulid pk
order_id fk orders
provider varchar
provider_payment_id varchar nullable
method varchar nullable -- pix, credit_card
status varchar -- pending, approved, rejected, refunded, canceled
amount_cents int
currency char(3)
raw_payload jsonb
processed_at timestamp nullable
timestamps
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

No MVP atual, QR Code e cartão compartilhável são gerados **on-demand** a partir do Gift publicado. A tabela `gift_delivery_assets` permanece como estrutura futura para cache/arquivamento de PNG/PDF, mas a primeira versão evita salvar arquivos e evita órfãos em storage.

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
system/assets/{asset_ulid}/asset.png
system/assets/{asset_ulid}/asset.webp
system/assets/{asset_ulid}/asset.jpg
```

Assets do sistema são enviados pelo admin/support e servidos ao editor/viewer por rota ou URL segura calculada pelo backend. O frontend não recebe `storage_path`; ele recebe um `previewUrl` seguro quando o asset é renderizado como imagem.

### Cartões QR/PDF

```txt
gifts/{gift_ulid}/delivery/qr.png
gifts/{gift_ulid}/delivery/card.pdf
```

## 12. Autosave

O editor mantém autosave confiável como mecanismo único de persistência também para a manipulação visual básica.

Contrato atual:

- alterações de metadados usam `PATCH /app/gifts/{gift}`;
- alterações de canvas usam `PATCH /app/gifts/{gift}/pages/{giftPage}`;
- requests de autosave usam JSON e não devem receber redirect;
- respostas JSON retornam `success`, `data`, `last_edited_at` quando aplicável e `message` opcional;
- o frontend salva com debounce curto, por página, sem disparar request a cada tecla;
- o estado visual deve sair de pendente/salvando para salvo, erro ou sem conexão;
- em caso de falha, a alteração local continua na tela e o erro fica visível;
- `last_edited_at` do gift é atualizado a cada salvamento de metadados ou página;
- o servidor continua sendo a fonte da verdade e sempre normaliza/sanitiza o canvas antes de persistir;
- quando o backend confirma sucesso e não há edição mais nova em andamento, o frontend adota o canvas normalizado retornado pelo servidor;
- antes de checkout, forçar sincronização final.

`localStorage` é apenas proteção temporária contra perda acidental:

- chaves devem incluir `giftId` e, para páginas, `pageId`;
- rascunhos locais só devem ser restaurados quando forem mais recentes que o estado conhecido do servidor;
- rascunhos antigos não devem sobrescrever dados já salvos;
- rascunhos devem ser limpos após sucesso confirmado do backend;
- ele não substitui o servidor como fonte de verdade.

### 12.1 Histórico local do editor

O editor mantém histórico local de canvas para desfazer/refazer durante a sessão. Esse histórico não é salvo no banco, não cria endpoint novo e não substitui o autosave.

Contrato atual:

- o histórico é mantido no frontend por `GiftPage`, usando snapshots de canvas JSON;
- cada página mantém pilhas próprias de undo e redo, com limite de 40 entradas por página;
- cada entrada guarda `pageId`, canvas `before`, canvas `after`, label opcional e timestamp;
- nova alteração depois de um undo limpa a pilha de redo daquela página;
- undo/redo aplica o canvas localmente, atualiza o rascunho de proteção em `localStorage` quando ele difere do salvo e deixa o autosave persistir por debounce;
- se o canvas aplicado por undo/redo for igual ao canvas salvo, o rascunho local daquela página pode ser limpo;
- o servidor continua sendo a fonte da verdade persistida e valida o canvas recebido pelo mesmo fluxo de autosave;
- preview privado e viewer público continuam read-only e não recebem controles de histórico.

Ações cobertas pelo histórico local:

- mover, redimensionar e rotacionar elemento;
- editar texto no canvas ou painel;
- trocar imagem de elemento `image`;
- adicionar sticker;
- duplicar e deletar elemento;
- bloquear/desbloquear;
- ocultar/exibir;
- renomear camada;
- alterar zIndex/camada;
- editar posição, tamanho, rotação, estilo e propriedades pelo painel.

Granularidade:

- transformações contínuas por ponteiro registram o estado antes da transformação e uma única entrada ao finalizar o gesto;
- texto, estilo e propriedades editadas em campos usam debounce/coalescing para evitar uma entrada por tecla ou pixel;
- navegação, troca de aba, seleção de elemento e upload de imagem sem aplicação na página não entram no histórico.

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
- `support` acessa recursos operacionais, pagamentos, analytics e gestão de assets/categorias visuais do sistema.
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
- `GET /app/gifts/{gift}/preview`: abre preview privado autenticado.
- `GET /app/gifts/{gift}/review`: mostra checklist de revisão/publicação.
- `POST /app/gifts/{gift}/publish`: publica tecnicamente o Gift em modo MVP/dev.
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

O painel em `/app/gifts` mostra apenas gifts do usuário autenticado. A tela `/app/gifts/{gift}/edit` é o Editor MVP: permite navegar entre páginas copiadas do template, visualizar preview via renderer compartilhado, selecionar/manipular elementos existentes, editar textos direto no canvas ou pelo painel, enviar imagens do Gift, aplicar imagens em elementos `image` existentes no canvas, desfazer/refazer alterações locais por página e salvar metadados básicos do gift por autosave.

### Segurança aplicada

- Rotas que criam ou alteram gifts usam middleware `auth`.
- Policies bloqueiam visualização/edição de gifts de outro usuário.
- `GiftPage` só pode ser alterada pelo dono do gift e enquanto o gift está em `draft`.
- Form Requests validam versões publicadas, plano ativo, ownership da página, upload seguro e canvas sem HTML/URLs externas arbitrárias.
- Mídias só podem ser listadas, servidas, excluídas ou usadas no canvas quando pertencem ao mesmo usuário e ao mesmo Gift.
- Dados enviados às páginas Inertia são resumos mínimos, sem payloads de pagamento, hashes ou dados de outros usuários.

## 21. Editor MVP de drafts

O Editor MVP é uma camada de produto sobre drafts já existentes. Ele não é um editor livre estilo Canva; nesta etapa o usuário manipula elementos existentes do canvas de forma controlada: textos, imagens e stickers quando já existem no schema/renderizador.

### Fluxo de edição

- O usuário autenticado abre `/app/gifts/{gift}/edit`.
- A policy garante que o gift pertence ao usuário.
- O backend envia somente resumo seguro do gift, páginas ordenadas, canvas, mídias processadas do Gift, flags `is_visible`/`locked`, URLs de update/upload e limite de texto.
- O frontend mantém estado local para página selecionada, canvas local, dirty state, autosave, rascunho local temporário, histórico local por página e metadados básicos.
- O usuário seleciona uma página, vê o preview, seleciona elementos no canvas, move/redimensiona/rotaciona elementos suportados, edita textos direto no canvas ou pelo painel, aplica mídia em elementos `type: image` existentes e desfaz/refaz alterações recentes da página.
- Metadados e canvas são salvos por autosave com debounce; não deve haver botão manual destacado como ação principal do editor.
- O indicador global de salvamento mostra pendente, salvando, salvo, erro ou sem conexão.
- Erros de validação do autosave devem ficar visíveis e não podem descartar alterações locais.
- `PATCH /app/gifts/{gift}/pages/{giftPage}` persiste o canvas por `UpdateGiftPageCanvas`.

### Separação renderer/editor

- `resources/js/components/renderer` é a base compartilhada de renderização para editor e futuro viewer público.
- O editor não duplica regras visuais do renderer; ele monta UI de navegação e propriedades ao redor do preview.
- A seleção/manipulação fica em componentes do editor, como overlay e handles sobre o `PageRenderer`; preview privado e viewer público continuam read-only.
- Controles de camadas, botões de ação, botões de undo/redo e atalhos existem somente no editor.
- O renderer aceita fallback seguro para canvas simples, elementos desconhecidos e mídia ainda não disponível.

### Editor visual básico

- O canvas continua usando coordenadas lógicas do artboard, com padrão `1080x1350`; movimento e resize convertem ponteiro/tela para esse sistema antes de salvar.
- Elementos manipuláveis usam o contrato atual `x`, `y`, `w`, `h`, `rotation` e `z`. Aliases antigos/conceituais como `width`, `height` e `zIndex` podem ser normalizados para `w`, `h` e `z`.
- Elementos podem ter `name`, `locked` e `hidden`. `name` é opcional e usado apenas como nome amigável de camada; `locked` e `hidden` recebem default `false` em elementos antigos.
- O clique curto em imagem seleciona o elemento e mantém os handles de mover/redimensionar/rotacionar; quando a imagem está selecionada, aparece um botão contextual `Trocar foto` abaixo dela.
- Em elementos `text` e stickers com texto editável, clique rápido seleciona e abre edição direta no canvas com textarea controlado. O texto é tratado como texto puro; não há `contentEditable` livre nem `dangerouslySetInnerHTML`.
- A diferença entre clique e arraste é feita por threshold simples de ponteiro. Movimentos curtos entram em edição; deslocamento acima do threshold move o elemento.
- Arrastar o elemento move; arrastar handles redimensiona; imagens mantêm proporção por padrão nesta primeira versão.
- A rotação pode ser feita por handle visual e também por campo numérico no painel.
- O painel de elemento selecionado permite editar posição, tamanho, rotação, camada, texto, fonte, cor e alinhamento.
- O painel de elemento selecionado usa grupos responsivos para posição, tamanho e transformação, sem overflow horizontal em desktop ou mobile.
- Camadas são persistidas como `z`, recalculadas de forma previsível em passos de 10. A UI oferece trazer para frente, enviar para trás, mover acima e mover abaixo.
- A aba `Camadas` lista elementos da página atual em ordem visual de zIndex, com seleção por camada, nome amigável, estado selecionado/bloqueado/oculto e ações rápidas.
- Nomes amigáveis devem evitar termos técnicos: texto usa o começo do conteúdo, imagem usa `Imagem`, sticker usa o nome do asset quando disponível, música usa `Música` e desconhecidos usam `Elemento`.
- Ações básicas de elemento no editor: renomear camada, duplicar, deletar, bloquear/desbloquear, ocultar/exibir e selecionar pela lista.
- Duplicar cria novo `id`, desloca levemente `x/y`, mantém `mediaItemId` ou `assetId`, coloca a cópia acima do original, seleciona a cópia e força `locked = false` e `hidden = false`.
- Deletar remove o elemento do canvas, mas elementos `locked` não podem ser deletados.
- Elementos `locked` continuam visíveis, podem ser selecionados pela lista e desbloqueados, mas não podem ser movidos, redimensionados, rotacionados, editados, deletados ou receber troca de imagem.
- Elementos `hidden` aparecem na lista de camadas e podem ser reexibidos, mas não aparecem no canvas do editor, não recebem clique no canvas e não aparecem no preview/viewer.
- Para imagem, clique curto no elemento apenas seleciona e permite mover/rotacionar; o botão contextual `Trocar foto` abre o upload direcionado para substituir aquela foto. Upload geral continua apenas adicionando à biblioteca.
- Stickers renderizados com texto visível (`text`, `content` ou `label`) podem ser editados como texto quando o elemento for textual/editável. Stickers sem texto visível continuam sem campo de texto.
- Elementos desconhecidos continuam preservados quando seguros, mas ficam read-only no editor visual básico.
- Atalhos simples podem existir no editor: `Ctrl/Cmd + Z` para desfazer, `Ctrl/Cmd + Shift + Z` e `Ctrl/Cmd + Y` para refazer, `Delete`/`Backspace` para deletar, `Ctrl/Cmd + D` para duplicar, `Esc` para limpar seleção e setas para mover elemento selecionado. Eles não disparam enquanto o usuário digita em `input`, `textarea`, `select` ou conteúdo editável, e respeitam `locked`/`hidden`.

### Histórico local de edição

- O histórico de edição do canvas é local ao editor e separado por página.
- As pilhas de undo/redo guardam snapshots de canvas JSON, não arquivos binários de imagem.
- O limite atual é 40 entradas por página para evitar consumo excessivo de memória.
- Mover, redimensionar e rotacionar entram como uma única ação ao fim do gesto, mesmo que o canvas tenha recebido várias atualizações visuais durante o drag.
- Texto, estilo e propriedades numéricas usam coalescing/debounce para reduzir entradas excessivas.
- Duplicar, deletar, trocar imagem, adicionar sticker, bloquear/desbloquear, ocultar/exibir, renomear camada e alterar zIndex registram entradas imediatas.
- Undo/redo atualiza o canvas local, marca a página para salvamento quando ela difere do último canvas salvo, atualiza/limpa o rascunho local de proteção e deixa o autosave salvar pelo debounce existente.
- O histórico não é persistido no servidor, não é versionamento completo de `Gift` e não altera o contrato visual do tema.

### Correções de UX do editor visual

- A folha/página mantém artboard lógico `1080x1350`, mas o limite visual do renderer foi ampliado em cerca de 25%; editor, preview e viewer escalam o mesmo canvas sem alterar coordenadas salvas.
- No mobile, a ordem do editor prioriza canvas e painel de propriedades antes da lista de páginas, reduzindo rolagem até os controles essenciais.
- As abas do painel direito ficam mais compactas no mobile. Debug continua restrito ao ambiente de desenvolvimento/teste.
- A biblioteca de imagens permanece limpa: upload geral adiciona mídia; trocar imagem exige selecionar o elemento de imagem na página e clicar no botão contextual `Trocar foto`.

### Polimento e QA do editor

O editor passou por uma etapa de estabilidade antes da fase de entrega por QR Code/cartão. Esta etapa não mudou o contrato principal do canvas; ela melhorou comportamento, feedback e usabilidade da experiência existente.

Diretrizes preservadas:

- Mobile precisa ser utilizável: topbar não deve quebrar, canvas deve continuar grande o suficiente para toque, abas precisam ser acessíveis, lista de páginas deve ter altura controlada e handles de transformação devem ser tocáveis.
- Estados vazios devem ser amigáveis para biblioteca de imagens, biblioteca de adesivos, busca sem resultado, página sem textos editáveis e painel de camadas sem itens.
- Estados de loading e erro devem aparecer para upload de imagem, carregamento/listagem de adesivos, autosave, salvamento de página, aplicação de imagem/adesivo e restauração de rascunho local.
- Autosave não deve limpar rascunho local antes de confirmação do backend; erro de save mantém alterações locais na tela e status global compreensível.
- `localStorage` continua sendo proteção temporária e deve avisar quando um rascunho local não puder ser restaurado.
- Undo/redo continua local e por página; ações contínuas de mover/redimensionar/rotacionar entram como uma única ação, e atalhos não disparam dentro de inputs/textareas.
- Elementos `locked` não podem ser movidos, redimensionados, rotacionados, editados, duplicados pela UI principal, deletados nem receber troca de imagem; elementos `hidden` não aparecem no canvas/viewer e podem ser reexibidos por Camadas.
- A UI final deve usar nomes amigáveis e evitar termos técnicos como `photo 1`, `zIndex`, `canvas`, `mediaItemId`, `assetId`, `debug`, JSON bruto ou paths internos. Esses termos ficam restritos a debug local/dev.
- Acessibilidade básica deve incluir labels claros, foco visível, `aria-label` em botões de ícone, estados destrutivos identificáveis e status de salvamento com anúncio educado.
- Performance básica deve evitar recálculos óbvios em listas de camadas/assets, listeners globais duplicados e loops de autosave.
- Painéis de debug, JSON bruto e logs de autosave só aparecem em ambiente local/desenvolvimento/teste; produção não deve exibir dados técnicos.

### Metadados permitidos

`PATCH /app/gifts/{gift}` aceita somente:

- `title`;
- `recipient_name`;
- `sender_name`.

O editor não altera `user_id`, `plan_id`, `status`, `public_code`, versões de template/tema, expiração, publicação ou dados de pagamento.

### Segurança do canvas

- Canvas é dado não confiável e sempre passa por validação server-side.
- `schemaVersion` precisa ser `1` e `elements` precisa ser uma lista.
- Elementos precisam ter `id`, `type`, `x`, `y`, `w`, `h`, `rotation` e `z` normalizados antes de persistir.
- `name` precisa ser string curta e sem HTML/script; `locked` e `hidden` precisam ser booleanos.
- Números de transformação precisam ser finitos e dentro de limites seguros; `NaN`, `Infinity`, strings inválidas, dimensões negativas/zero e valores extremos são rejeitados.
- O backend normaliza aliases `width`/`height`/`zIndex`, remove aliases depois de persistir, normaliza rotação e evita camadas duplicadas problemáticas.
- Textos são tratados como texto puro, sem HTML, `script`, `innerHTML`, URLs externas ou protocolos inseguros.
- O limite de texto vem de `constraints.maxTextLength` quando existir, com fallback seguro.
- Páginas `locked` podem ser visualizadas, mas não editadas.
- Elementos `locked` já persistidos não podem ser transformados, editados ou deletados por autosave malicioso; o backend permite apenas alterações de estado de camada como desbloquear/ocultar/renomear.
- Elementos `hidden` continuam passando por validação de segurança e referências, mesmo sem renderizar no viewer.
- Referências de mídia são autorizadas por `user_id`, `gift_id`, tipo `image` e status `processed` antes de salvar.
- Elementos `image` não podem persistir `src` externo ou relativo arbitrário; quando `mediaItemId` é válido, o backend substitui `src` pela rota segura do app.
- Elementos `sticker` com asset decorativo persistem `assetId`; o canvas não salva URL, `storage_path`, `previewUrl` nem `src` manual para sticker.
- `assetId` de sticker precisa apontar para `Asset` ativo e permitido ao Gift: global ou associado ao `theme_version` atual.

### Biblioteca de stickers/assets

Assets decorativos do sistema são diferentes de `MediaItem`.

- `MediaItem` representa arquivos enviados pelo usuário, vinculados a `User`/`Gift`: fotos pessoais e imagens do presente.
- `Asset` representa elementos decorativos do sistema, cadastrados/admins e reutilizáveis: adesivos, fitas, flores, molduras, papéis, texturas, envelopes, selos, etiquetas, fundos, overlays, bordas, ícones e recortes.
- `AssetCategory` organiza assets em categorias ativas/ordenadas como Corações, Fitas, Flores, Papéis, Texturas, Molduras, Envelopes, Selos, Etiquetas, Rabiscos, Aniversário, Romance, Amizade, Vintage, Kraft, Jornal e Polaroids.
- Tipos de asset suportados incluem `sticker`, `texture`, `paper`, `background`, `frame`, `tape`, `label`, `envelope`, `stamp`, `flower`, `decoration`, `icon`, `shape`, `border` e `overlay`.
- Um `Asset` pertence opcionalmente a uma categoria por `asset_category_id`; para o MVP não há many-to-many de categorias.
- Upload administrativo aceita PNG, WebP e JPG/JPEG com validação de MIME real e extensão. SVG fica bloqueado inicialmente para uploads, salvo decisão futura com sanitização explícita para admin confiável.
- Upload temporário do Filament/Livewire deve usar disk local (`LIVEWIRE_TEMPORARY_FILE_UPLOAD_DISK=local`) para evitar spinner infinito quando o disk final é S3/MinIO e o storage externo está indisponível em desenvolvimento.
- `ProcessUploadedAsset` salva o arquivo com nome seguro em storage configurado, sem usar nome original, e preenche `storage_disk`, `storage_path`, `mime_type`, `size_bytes`, `width` e `height`.
- Se o storage final falhar, `ProcessUploadedAsset` deve devolver erro de validação amigável em `asset_file`, não exceção silenciosa nem loading infinito.
- `storage_path` é dado interno. Preview no admin, editor, preview privado e viewer público deve usar rota/URL segura derivada pelo backend.
- Assets globais são assets ativos sem vínculo em `theme_asset`; assets do tema são os associados ao `ThemeVersion` atual por `theme_asset`.
- `theme_asset` permite definir `role`, `sort_order` e `config` para destacar/priorizar assets do tema sem criar builder visual de tema. Roles atuais incluem `sticker`, `paper_texture`, `background_texture`, `book_texture`, `spine_texture`, `page_overlay`, `edge_overlay`, `fabric_background`, `kraft_surface`, `page_background`, `aging_overlay`, `stain_overlay`, `tape`, `frame`, `decoration`, `overlay` e `border`.
- No admin, `AssetResource` deve indicar se o asset é Global ou associado a tema. `ThemeVersionResource` deve permitir associar/remover assets, definir uso no tema, prioridade e config avançado opcional.
- Ações rápidas como "Usar como papel", "Usar como fundo" e "Usar como livro" podem apenas alterar o role do vínculo `theme_asset`, sem alterar o arquivo nem o canvas.
- `Asset.metadata` controla renderização premium com `renderStyle`, `physical` e `defaultTransform`, por exemplo borda branca, sombra projetada, lift, textura de papel, rotação orgânica e dimensões padrão.
- Cadastrar novos assets reais, categorias e associações de tema deve ser feito pelo admin/support. Código só deve ser necessário para novo comportamento de renderer, novos tipos sem suporte ou mudanças de contrato.
- O endpoint autenticado `GET /app/gifts/{gift}/assets` lista categorias ativas e assets decorativos posicionáveis, com assets ativos do tema primeiro e assets globais depois. Ele exige Gift próprio em `draft`.
- O endpoint autenticado `GET /app/gifts/{gift}/page-backgrounds` lista papéis/texturas adequados para fundo da página atual. Ele não expõe `storage_path` e não mistura esses papéis com a aba `Adesivos`.
- O endpoint não expõe `storage_path` nem metadata administrativa; o frontend recebe `id`, `name`, `type`, categoria, `renderMode`, `previewUrl`, `renderStyle`, `physical`, `defaultTransform` e `config` allowlistado.
- O editor possui aba `Adesivos`, com instrução simples, busca, filtro por categoria e grid responsivo. Ao clicar em um asset, cria um elemento `sticker` no centro da página atual com `assetId`, dimensões/rotação padrão do metadata quando existirem, `locked = false`, `hidden = false` e camada acima das atuais.
- O renderer compartilhado resolve `assetId` por um mapa seguro `assetId -> asset` recebido do endpoint/editor ou do payload de preview/viewer. Se o asset estiver inativo/indisponível, o sticker fica em fallback seguro.
- Preview privado e viewer público recebem apenas os assets de textura necessários ao tema e os assets referenciados por elementos visíveis das páginas visíveis; não carregam a biblioteca inteira e não expõem caminhos internos.

### Papel/fundo da página

Papel da página não é elemento do canvas. Ele é propriedade visual da folha/artboard e deve ser salvo em `canvas.artboard.background`.

- `{"type": "theme"}` usa o papel padrão resolvido pelo tema.
- `{"type": "asset", "assetId": "...", "fit": "cover", "opacity": 1}` usa um papel específico somente naquela página.
- O canvas nunca deve salvar `previewUrl`, `storage_path`, `assetUrl`, URL externa ou path manual no background.
- `type: asset` exige asset ativo, permitido para o Gift e adequado para fundo de página.
- Papéis permitidos incluem roles `paper_texture`, `kraft_surface` e `page_background`, assets do tipo `paper`/`texture` e `background` marcado como fundo de página.

Separação obrigatória:

- stickers, fitas, selos, flores, etiquetas, recortes e molduras posicionáveis ficam em `canvas.elements[]`;
- papel kraft, papel creme, papel jornal, textura de diário e folha envelhecida ficam em `canvas.artboard.background`;
- a aba `Adesivos` cria elementos `sticker`; a aba `Página` troca o papel da folha inteira com 1 clique.

O renderer (`PageSurface`) aplica o papel como camada de fundo que cobre a folha inteira, com `background-size: cover` por padrão, `background-position: center` e overlays do tema por cima quando existirem. O usuário não redimensiona papel manualmente, não manda camada para trás e não cria sticker para isso.

O papel padrão do tema é resolvido preferencialmente por `paper_texture`, depois `kraft_surface`, depois config visual/CSS do tema. Para qualidade, papéis cadastrados no admin devem ter proporção próxima do artboard padrão `1080x1350` ou maior, preferencialmente WebP/JPG otimizados.

### Renderização física de assets

O renderer compartilhado aplica uma camada visual física para assets decorativos. A responsabilidade fica em `PhysicalAssetFrame` e utilitários de estilo do renderer; `StickerElement` continua apenas resolvendo `assetId` pelo mapa seguro e renderizando o conteúdo.

- `renderStyle` define a família visual do asset. Valores esperados: `sticker`, `cutout`, `paper`, `tape`, `frame`, `label`, `stamp`, `flower`, `decoration`, `texture`, `background`, `overlay`, `border` e `flat`.
- Quando `renderStyle` estiver ausente, o fallback vem de `asset.type`: sticker vira sticker, tape vira tape, paper/envelope/newspaper vira paper, frame/border vira frame/border, label vira label, stamp vira stamp, flower vira flower, texture/background/overlay não recebem sombra de sticker e decoration/icon/shape/doodle viram decoração.
- `physical` controla `whiteBorder`, `borderWidth`, `dropShadow`, `shadowIntensity`, `lift`, `paperTexture`, `slightRotation`, `edgeHighlight` e `opacity`, com defaults seguros por estilo.
- `defaultTransform` controla `w`, `h` e `rotation` ao adicionar assets no editor. Se ausente, o frontend usa fallbacks por estilo: sticker/decorativos menores, tape horizontal, paper/label retangulares, frame maior e texture/background ocupando a área útil da folha.
- `sticker` aplica borda branca aproximada, sombras em camadas, lift e highlight para parecer adesivo recortado.
- `tape` fica sem borda branca, com opacidade, textura leve, sombra discreta e aparência de fita colada.
- `paper` e `label` recebem textura, backing de papel, sombra e borda/highlight sutis para parecer recorte/etiqueta.
- `frame` e `border` usam sombra/profundidade sem virar adesivo branco.
- `stamp` usa opacidade, textura e sombra bem sutis.
- `flower`, `cutout` e `decoration` usam sombra orgânica e lift leve, sem borda branca obrigatória.
- `texture`, `background`, `overlay` e `flat` não recebem sombra individual de sticker; eles devem se misturar à folha ou funcionar como camada visual.

A borda branca de sticker é uma aproximação CSS feita com múltiplos `drop-shadow` sem deslocamento/pequeno deslocamento ao redor da imagem. Isso melhora PNG/WebP transparentes, mas não substitui processamento real de contorno por pixel. Uma borda perfeita ao redor do recorte deve ficar para uma etapa futura de processamento de imagem, caso vire requisito de qualidade.

Essa camada é apenas visual. O canvas continua salvando `assetId`, coordenadas e transformações; ele não salva `previewUrl`, `storage_path`, URL externa ou `src` manual para sticker. Editor, preview privado e viewer público usam a mesma renderização física, enquanto handles, seleção, bloqueio, ocultação, undo/redo e autosave continuam pertencendo somente ao editor.

### Texturas reais de tema e superfície

`ThemeVersion` também funciona como direção de arte material do scrapbook. Além de cores, fontes e sombras, o tema pode referenciar assets reais associados em `theme_asset` para compor papel, fundo, capa/livro, lombada e overlays.

O contrato público de `theme_versions.config` aceita `textures` com slots seguros:

- `appBackground` e `fabricBackground`: fundo externo, mesa ou tecido;
- `bookSurface` e `bookSpine`: superfície do livro/caderno e lombada;
- `pagePaper` e `kraftSurface`: papel real da folha;
- `pageOverlay`, `agingOverlay`, `stainOverlay` e `edgeOverlay`: envelhecimento, manchas e bordas.

Cada slot pode conter apenas `assetRole`, `assetId` seguro e valores visuais allowlistados como `opacity`, `blendMode`, `size`, `position` e `repeat`. O config do tema não salva URL de textura. Mesmo que um campo como `url`, `src`, `storage_path` ou URL externa apareça no JSON administrativo, `ThemeConfig::publicConfig()` não envia esses campos ao frontend.

A resolução segura acontece no backend:

- `ThemeConfig::textureAssetReferences()` extrai roles/assetIds necessários a partir do config público;
- `ThemeAssetCatalog` busca somente assets ativos associados ao `ThemeVersion`, com categoria ativa quando houver;
- `RendererAssetCatalog` une esses assets de textura com stickers realmente referenciados no canvas;
- `EditorAssetResource` envia `previewUrl` seguro, `role`, `renderStyle`, `physical` e `defaultTransform`, nunca `storage_path`.

No frontend, `themeTextureUtils.ts` resolve `assetRole -> asset.previewUrl` ou `assetId -> asset.previewUrl`. Os componentes só montam `background-image` a partir desse `previewUrl` resolvido pelo backend e ignoram qualquer URL presente no config. As camadas têm `pointer-events: none`, então não interferem em seleção, handles, autosave, camadas ou edição de texto/imagem.

Aplicação visual:

- `GiftViewerLayout` e a tela do editor aplicam textura de fundo externo quando disponível;
- `ScrapbookStage` aplica textura geral do palco/livro;
- `ScrapbookPageFrame` aplica textura de capa/superfície e, quando houver, textura de lombada;
- `PageSurface` aplica textura de papel, overlays de envelhecimento/mancha/borda e mantém os fallbacks CSS de grão, manchas e desgaste.

Fallbacks continuam obrigatórios: se o asset estiver ausente, inativo, sem `previewUrl` seguro ou com role inexistente, o renderer usa as texturas CSS atuais. Por performance, o viewer público não deve baixar todos os assets da biblioteca; ele recebe apenas texturas usadas pelo tema e assets visíveis/referenciados.

### Pipeline visual e Gift para Template

A criação visual de templates não deve depender de editar `TemplatePage.canvas` manualmente em JSON. O fluxo preferencial é:

1. admin cria ou escolhe um Gift de rascunho;
2. admin monta visualmente esse Gift no editor normal, usando fotos temporárias se precisar compor a página;
3. admin abre o `GiftResource` no Filament e executa a ação `Criar template`;
4. o sistema cria `Template`, `TemplateVersion` e `TemplatePages` a partir das `GiftPages`;
5. a `TemplateVersion` nasce como `draft` por padrão;
6. após revisão, a versão pode ser publicada pelo fluxo administrativo atual e então aparece em `/criar`.

Regras da conversão:

- copiar artboard, páginas, nomes, ordem visual, posições, tamanhos, rotações, `z`, `locked`/`hidden` de elementos e textos default;
- não copiar `user_id`, `MediaItem`, pedidos, pagamentos, `public_code`, destinatário/remetente reais nem dados operacionais do Gift;
- elementos `image` com foto pessoal (`mediaItemId`, `media_item_id` ou `src`) viram placeholders com labels genéricos como `Foto principal`, `Sua foto aqui` ou `Memória especial`;
- elementos `sticker` preservam `assetId` apenas quando o asset do sistema está ativo e é global ou está associado ao tema escolhido;
- remover `src`, `url`, `previewUrl`, `storage_path`, aliases de mídia e qualquer URL manual do canvas criado para template;
- validar o canvas convertido com `CanvasSecurity` antes de persistir `TemplatePage`;
- gerar `editable_schema.fields` a partir de textos, imagens/placeholders e stickers textuais editáveis.

`/admin/template-pages/{id}/edit` continua existindo para ajuste avançado de JSON, mas deve mostrar que esse é um caminho avançado. O uso normal para montar templates bonitos é editar um Gift visualmente e convertê-lo em template reutilizável.

### Upload/mídia básica

- `GiftMediaController` lista, recebe upload, serve imagem/thumbnail autenticadas e desativa mídia.
- `StoreGiftMediaRequest` aceita apenas um arquivo por upload, com MIME/extensão de JPG/JPEG, PNG ou WebP, tamanho e dimensões máximas centralizados em `config/scrapbook.php`.
- `ProcessUploadedImage` é a action central: valida Gift próprio em `draft`, checa limites do plano/config, reprocessa com Intervention Image, salva WebP otimizado e thumbnail no disco configurado e cria `MediaItem` `processed`.
- O editor recebe somente `id`, tipo, nome original, URL segura, thumbnail, dimensões, tamanho, status e data; não recebe `storage_path` nem metadata interna.
- A aba Imagens do editor é uma biblioteca simples do Gift, com upload geral, lista/grid de imagens e instrução de uso.
- Upload geral na biblioteca apenas adiciona a imagem à biblioteca; ele não altera automaticamente o canvas.
- Para substituir uma foto da página, o usuário deve selecionar o espaço de imagem dentro do scrapbook e clicar em `Trocar foto` para enviar a nova imagem; upload geral não altera canvas automaticamente.
- Não recriar o card técnico "Usar na página", nem listar slots como `photo 1`/`photo 2` fora de debug local.
- Storage continua S3-compatible/MinIO em desenvolvimento via `FILESYSTEM_DISK=s3`, mas o browser usa rotas autenticadas do Laravel.

### Limites do Editor MVP

Não entram no Editor MVP atual: marketplace de assets, upload avançado de assets pelo usuário final, edição visual de tema, histórico persistido no servidor, versionamento completo de Gift, agrupamento de elementos, multi-seleção complexa, crop/filtros, animação de virar página, gateway real, demo pública, integração musical externa e um builder visual separado de templates no admin. O caminho atual para criar template visual é Gift para Template, reutilizando o editor existente. QR Code e cartão compartilhável pertencem à camada de entrega do Gift publicado, não ao editor visual.

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
- `GET /app/gifts/{gift}/preview`: abre preview privado autenticado.
- `GET /app/gifts/{gift}/review`: abre revisão de publicação.
- `GET|POST /app/gifts/{gift}/checkout`: mostra checkout e cria/reusa `Order pending`.
- `GET /app/orders/{order}`: mostra status do pedido e pagamento.
- `POST /app/orders/{order}/dev-approve`: aprova pagamento apenas em ambiente local/test/dev controlado.
- `POST /app/gifts/{gift}/publish`: só publica se já existir `Order paid` para o Gift.
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

## 22. Viewer/preview do scrapbook

A visualização real do presente foi separada em dois contextos:

1. **Preview privado autenticado**
   - Rota: `GET /app/gifts/{gift}/preview`.
   - Exige sessão autenticada.
   - Usa `GiftPolicy::view`, então apenas o dono acessa.
   - Renderiza páginas visíveis do Gift sem controles de edição.
   - Pode exibir Gift em `draft` para o criador.
   - Resolve imagens pelo contexto privado usando as rotas autenticadas de mídia: `/app/gifts/{gift}/media/{mediaItem}` e `/thumbnail`.
   - Mostra caminho de volta para `/app/gifts/{gift}/edit`.

2. **Viewer público publicado**
   - Rota: `GET /p/{slug}-{public_code}`.
   - Não exige login.
   - Não resolve por slug isolado.
   - Só encontra Gift com `status = published`, `visibility = public_link`, `public_code` preenchido e `expires_at` nulo ou futuro.
   - Gifts `draft`, `disabled`, `expired` ou com código incorreto retornam 404 genérico.
   - A página pública deve usar `noindex,nofollow`.

### Resolução segura do link público

`PublicGiftResolver` extrai o último segmento após hífen como `public_code` e usa o restante como slug. O código precisa ser alfanumérico forte e a busca exige slug e código juntos. O modelo atual armazena `public_code` em coluna única, conforme domínio implementado; a geração do código continua centralizada em `PublishGift`, que agora é chamado pelo fluxo de pagamento aprovado.

### Resources do viewer

O viewer não envia models crus ao frontend. `GiftViewerResource` e `GiftPageViewerResource` expõem somente:

- no viewer público: título, destinatário, remetente, tema resumido, páginas, assets visíveis e URL de criação;
- no preview privado: dados do dono necessários para revisar, como `id`, `status`, datas, URL de edição, revisão, compartilhamento e link público quando já existir;
- páginas visíveis ordenadas;
- canvas sanitizado e resolvido para o contexto correto;
- elementos com `hidden = true` removidos do payload de preview/viewer;
- URLs de navegação necessárias ao contexto.

O payload público não envia `id`, `status`, `published_at`, `expires_at`, `user_id`, usuário, e-mail, plano, pedidos, pagamentos, `public_code` separado, `storage_path` ou metadata interna. Mesmo se a pessoa abrir o link público estando autenticada, o middleware Inertia não compartilha `auth.user` nas rotas `public.gifts.*`.

### Experiência refinada do viewer

O viewer público `/p/{slug}-{public_code}` é a experiência final do destinatário e deve parecer um presente digital, não uma tela administrativa. O fluxo atual é:

1. tela de abertura com “Você recebeu um scrapbook”, título, destinatário/remetente quando existirem e botão “Abrir presente”;
2. leitura página por página usando o renderer compartilhado;
3. navegação por anterior/próxima, teclado no desktop, swipe simples no mobile, indicador textual e progresso discreto;
4. estado final com “Fim deste scrapbook”, voltar ao início, voltar à última página, copiar/compartilhar link e CTA discreto para `/criar`.

O preview privado `/app/gifts/{gift}/preview` reutiliza a mesma experiência visual, incluindo a abertura, mas mantém uma barra privada discreta com voltar para editar, revisar/publicar ou compartilhar/abrir link público conforme o status. O preview não mostra CTA público “Criar o meu também”.

Gifts indisponíveis no viewer público renderizam uma tela amigável genérica com HTTP 404. Essa tela não revela se o Gift existe, expirou, foi desativado, está em rascunho, pendente de pagamento ou recebeu código público incorreto.

### Mídia no viewer

O canvas salvo é tratado como dado não confiável. No viewer:

- `src` salvo no canvas não é reaproveitado;
- elementos `image` precisam de `mediaItemId`;
- a mídia precisa pertencer ao mesmo Gift;
- a mídia precisa ser `image`, estar `processed` e não estar deletada;
- preview privado recebe URL autenticada em `/app/gifts/{gift}/media/{mediaItem}`;
- viewer público recebe URL controlada em `/p/{slug}-{public_code}/media/{mediaItem}`;
- se o `mediaItemId` for inválido, de outro Gift ou indisponível, o backend remove `src` e marca placeholder seguro.
- `locked` não altera a aparência no viewer; é metadado de edição e não cria controles públicos.

As rotas públicas de mídia também resolvem o Gift por slug + `public_code` e repetem as regras de `published`, `public_link`, não expirado e não desativado antes de servir o arquivo. A rota não expõe `storage_path` e só serve mídia pertencente ao Gift publicado.

### Registro de visitas

O viewer público registra abertura básica em `gift_visits` quando possível. O registro não bloqueia a renderização se falhar. IP e user agent são armazenados como hash SHA-256 com chave da aplicação; o referrer é reduzido ao host para evitar gravar URL completa com dados sensíveis.

### Limites desta etapa

Esta etapa não implementa gateway externo real, Pix real, demo pública, integração musical, crop/filtros, editor drag-and-drop, editor novo, envio automático, marketplace ou refinamento visual da landing. O checkout atual prepara o domínio de `Order`/`Payment` e usa aprovação manual/dev somente em ambiente controlado; QR Code e cartão compartilhável já existem e devem ser preservados.

## 23. Revisão, checkout e publicação condicionada a pagamento

A publicação técnica `draft -> published` foi substituída por um fluxo de checkout interno. O objetivo é preparar a arquitetura para gateway real sem criar cobrança fake visível ao usuário final.

### Fluxo atual

1. O usuário edita o Gift em `/app/gifts/{gift}/edit`.
2. O usuário abre o preview privado em `/app/gifts/{gift}/preview`.
3. O usuário acessa `/app/gifts/{gift}/review`.
4. O backend calcula o checklist de publicação.
5. Se não houver erro obrigatório, a revisão aponta para `/app/gifts/{gift}/checkout`.
6. `CreateCheckoutOrder` cria ou reutiliza uma `Order pending`, sempre com `amount_cents` vindo do `Plan` no banco.
7. O Gift passa de `draft` para `pending_payment`.
8. Enquanto o pagamento não estiver aprovado, o viewer público continua retornando 404.
9. Em ambiente local/test/dev, `/app/orders/{order}/dev-approve` simula aprovação interna controlada.
10. `ProcessApprovedPayment` marca `Payment approved`, marca `Order paid` e chama `PublishGift`.
11. `PublishGift` define `status = published`, `visibility = public_link`, `slug`, `public_code`, `published_at` e `expires_at`.
12. O link público passa a aparecer na tela do pedido, revisão, editor e dashboard.
13. O dono acessa `/app/gifts/{gift}/share` para copiar link, visualizar/baixar QR Code e abrir o cartão compartilhável.

### Checklist

`GiftPublicationChecklist` centraliza os requisitos mínimos antes de checkout e antes de publicar após pagamento:

- Gift pertence ao usuário autenticado;
- status permite avançar (`draft` para checkout, `pending_payment` para publicação após pagamento);
- Gift não está `disabled`;
- Gift não está `expired`;
- título preenchido;
- `template_version_id` definido;
- `theme_version_id` definido;
- ao menos uma página visível;
- canvas das páginas visíveis com `schemaVersion = 1`, `elements` e artboard válido;
- canvas sem HTML, scripts, protocolos inseguros ou URLs externas;
- elementos `image` com `mediaItemId` apontam para mídia `image`, `processed`, não deletada e pertencente ao mesmo Gift;
- limites simples de páginas e fotos são respeitados quando há plano ou snapshot;
- espaços de imagem vazios geram aviso e continuam renderizando placeholder seguro.

Warnings não bloqueiam publicação. Erros bloqueiam publicação e são retornados como validação.

### Domínio de checkout e pagamento

- `CreateCheckoutOrder` recebe usuário, Gift e Plan, valida dono, checklist e plano ativo, cria/reusa `Order pending`, grava snapshot mínimo de preço/limites e não publica Gift.
- `Order` pertence a `User`, `Gift` e `Plan`.
- `Payment` pertence a `Order`.
- `PaymentProvider` define a abstração mínima de provider.
- `ManualDevPaymentProvider` retorna uma sessão interna `manual_dev` sem cobrança real.
- `ProcessApprovedPayment` é idempotente: não duplica `Payment approved` e não republica Gift já publicado.
- `ProcessPaymentWebhook` permanece reservado para integração futura com provider real.

### Segurança de pagamento

- O frontend não envia nem controla `amount_cents`.
- O preço vem de `plans.price_cents`.
- O usuário só cria Order para Gift próprio.
- Gift inválido, sem página visível, com canvas inseguro ou mídia de outro Gift não cria Order.
- `POST /app/gifts/{gift}/publish` não permite bypass: sem `Order paid`, redireciona para checkout.
- A aprovação manual/dev é bloqueada em produção.
- Dados sensíveis de pagamento não são enviados ao viewer público.

### Action de publicação

`PublishGift` é a fonte central da regra de publicação. Controllers não alteram status nem tokens diretamente.

Nesta fase, a transição normal é:

```txt
draft -> pending_payment -> published
```

`PublishGift` exige contexto de pagamento aprovado. A action continua validando checklist, slug, `public_code`, `published_at`, `expires_at` e `visibility`, mas não deve ser chamada livremente por controller público para publicar rascunho sem pagamento.

### Link e expiração

- O slug é derivado do título com `Str::slug`, validado como slug seguro e limitado.
- `public_code` é alfanumérico forte, com 32 caracteres, e único.
- `expires_at` usa `limits_snapshot.gift_lifetime_days`, depois `plans.gift_lifetime_days`, com fallback em `config('scrapbook.gifts.default_lifetime_days')`.
- O viewer público continua exigindo `status = published`, `visibility = public_link`, `slug + public_code`, não expirado e não desativado.

## 24. QR Code e cartão compartilhável

A entrega do presente passa a ter uma camada privada de compartilhamento para o dono autenticado.

### Rotas autenticadas

- `GET /app/gifts/{gift}/share`: tela de compartilhamento do Gift.
- `GET /app/gifts/{gift}/qr-code`: retorna o QR Code como SVG seguro.
- `GET /app/gifts/{gift}/qr-code?download=1`: baixa o QR Code como arquivo SVG.
- `GET /app/gifts/{gift}/share-card`: mostra o cartão compartilhável.
- `GET /app/gifts/{gift}/share-card/download`: abre a versão imprimível com impressão automática pelo navegador.

### Regras de acesso

- Todas as rotas acima exigem sessão autenticada.
- `GiftPolicy::view` garante que somente o dono acesse share, QR e cartão.
- QR Code final e cartão compartilhável exigem `Gift::isPubliclyAccessible()`.
- Gifts `draft` e `pending_payment` não geram QR final; a tela de share pode mostrar placeholder “Publique o presente para gerar QR Code”.
- Gifts `disabled` ou `expired` não são tratados como ativos, e o viewer público continua bloqueando a abertura.

### Geração do QR Code

- `GiftShareUrlGenerator` monta a URL pública absoluta do Gift publicado.
- `GenerateGiftQrCode` usa `chillerlan/php-qrcode`, dependência já presente no projeto via Filament, para gerar SVG on-demand.
- O payload do QR é somente a URL pública `/p/{slug}-{public_code}`.
- O QR não contém `user_id`, e-mail, storage path, rota privada, pedido, pagamento ou dado interno.
- A geração on-demand evita arquivo órfão e dispensa `gift_delivery_assets` nesta primeira versão; cache/storage pode entrar depois.

### Cartão compartilhável

- `GiftShareCardData` monta título, destinatário, remetente, URL pública, URL visível e tokens visuais básicos do tema.
- O frontend usa `GiftShare`, `GiftQrCodePreview`, `CopyPublicLinkButton`, `GiftShareCard`, `PrintableShareCard` e `ShareActions`.
- O cartão segue estética scrapbook/papel/kraft, com QR Code, instrução curta e URL visível.
- O download complexo como PNG/PDF fica adiado; a versão MVP usa página imprimível com CSS `@media print` e botão “Imprimir/Salvar PDF”.

### Integração com publicação

- Dashboard mostra ação “Compartilhar” e “Abrir link” para Gifts publicados.
- Revisão e tela do pedido mostram link público, QR Code e ações de compartilhamento após publicação.
- Editor de Gift publicado mostra CTA para compartilhar.
- Gateway real, Pix, envio automático por WhatsApp/e-mail e sistema físico de impressão/entrega continuam fora desta etapa.

## 25. Fundação visual do scrapbook

A fase atual consolida o contrato visual do produto. Internamente a entidade continua sendo `GiftPage`; visualmente ela deve ser renderizada como uma folha temática de diário/scrapbook dentro de um caderno/livro.

### Canvas schema e artboard

Todo canvas de `TemplatePage` e `GiftPage` deve seguir o contrato mínimo:

```json
{
  "schemaVersion": 1,
  "version": 1,
  "artboard": {
    "width": 1080,
    "height": 1350,
    "unit": "px",
    "background": { "type": "theme" },
    "safeArea": { "top": 80, "right": 80, "bottom": 80, "left": 80 }
  },
  "elements": []
}
```

`schemaVersion` é mantido por compatibilidade com o contrato existente e `version` acompanha a versão visual esperada. Coordenadas e dimensões de elementos continuam no sistema do artboard. O renderer escala para a tela sem mudar os dados salvos. O default atual é `1080x1350`, uma proporção 4:5 mais equilibrada para mobile, editor central e viewer público do que a folha alta/estreita anterior.

Regras:

1. `artboard.width` e `artboard.height` precisam ser positivos.
2. `artboard.unit` deve ser `px`.
3. `safeArea` precisa ter lados não negativos.
4. `elements` precisa ser array.
5. Canvas sem `artboard` pode ser normalizado com defaults.
6. Canvas com artboard explicitamente inválido não passa na validação/checklist.
7. Textos continuam sendo texto puro; HTML, scripts, protocolos inseguros e URLs externas seguem bloqueados.

### Normalização de canvas

`App\Domain\Editor\CanvasNormalizer` centraliza defaults e normalização segura:

- adiciona `artboard` padrão quando ausente;
- adiciona `version = 1` quando ausente;
- preserva elementos existentes;
- completa `unit`, `background` e `safeArea`;
- não substitui width/height inválidos quando eles foram enviados explicitamente, permitindo que a validação reprove.

`CanvasSecurity` valida o canvas normalizado. `CreateGiftFromTemplate`, salvamento de página e checklist de publicação usam a mesma base para evitar divergência entre editor, preview, viewer e publicação.

### Relação entre Template e Theme

Template define estrutura:

- quais páginas existem;
- tipos de página;
- elementos iniciais;
- posições e tamanhos;
- textos default;
- placeholders de imagem;
- elementos editáveis e restrições.

Theme define aparência:

- textura e cor da folha;
- fundo do livro/caderno;
- fontes;
- sombras;
- bordas;
- moldura padrão de imagem;
- estilo padrão de stickers;
- tokens visuais aplicados pelo renderer.

Trocar tema deve ser não destrutivo: o layout e o conteúdo do canvas permanecem, e o renderer altera a aparência usando `theme_versions.config`.

### Contrato de `theme_versions.config`

O config de tema deve ter defaults úteis para o renderer:

```json
{
  "schemaVersion": 1,
  "tokens": {
    "colors": {
      "appBackground": "#F3E7D3",
      "bookBackground": "#D8BE96",
      "paper": "#FFF4DE",
      "paperAlt": "#F7E4C2",
      "ink": "#3A2418",
      "mutedInk": "#7B5A43",
      "accent": "#8E2F2F",
      "accentSoft": "#D9A6A1",
      "shadow": "rgba(58,36,24,0.22)",
      "muted": "#A77B55",
      "tape": "#D9B77E",
      "leaf": "#6E7C4F"
    },
    "fonts": {
      "heading": "serif",
      "body": "sans",
      "handwritten": "script"
    }
  },
  "book": {
    "style": "scrapbook",
    "binding": "left",
    "background": "#F3E7D3",
    "spineColor": "#7B4F32",
    "mode": "spread",
    "spineWidth": 28,
    "spreadGap": 0,
    "pageCurl": "subtle",
    "foldShadow": true
  },
	  "page": {
	    "surface": "kraft",
	    "backgroundColor": "#FFF4DE",
    "texture": "paper-grain",
    "textureAssetRole": "paper_texture",
    "edge": "deckled",
    "borderRadius": 32,
    "shadow": "deep-paper",
    "padding": 56,
    "decorations": {
      "cornerTape": true,
      "paperGrain": true,
      "subtleStains": true,
	      "edgeWear": true
	    }
	  },
	  "textures": {
	    "appBackground": {
	      "assetRole": "background_texture",
	      "opacity": 0.72,
	      "blendMode": "multiply",
	      "size": "cover"
	    },
	    "bookSurface": {
	      "assetRole": "book_texture",
	      "opacity": 0.58,
	      "blendMode": "overlay",
	      "size": "cover"
	    },
	    "pagePaper": {
	      "assetRole": "paper_texture",
	      "opacity": 0.84,
	      "blendMode": "multiply",
	      "size": "cover"
	    },
	    "agingOverlay": {
	      "assetRole": "aging_overlay",
	      "opacity": 0.18,
	      "blendMode": "multiply",
	      "size": "cover"
	    }
	  },
	  "elements": {
	    "text": { "defaultColor": "#3A2418", "headingColor": "#3A2418" },
    "image": { "defaultFrame": "polaroid", "shadow": true },
    "sticker": { "shadow": true }
  }
}
```

`App\Domain\Themes\ThemeConfig` fornece defaults, normalização e payload público allowlistado. O viewer público recebe apenas o config visual permitido, sem `storage_path`, URLs externas, dados de usuário, pedidos, pagamentos ou campos internos. `defaultShadow` ainda pode ser aceito como alias legado de `elements.sticker.shadow`, mas o contrato novo usa `shadow`.

Os tokens agora precisam afetar visualmente mais do que a borda: fundo da aplicação, fundo do livro, cor da folha, folha alternativa, tinta, tinta secundária, acento, fita, lombada, sombra, textura, desgaste de borda, grão de papel, manchas suaves e molduras de imagem. Os seeds iniciais mantêm pelo menos três temas publicados para comparação:

- `Kraft Vintage`: papel kraft/bege, marrom, creme, textura de jornal antigo, sombra quente e detalhe vintage;
- `Romance Delicado`: fundo off-white rosado, folha creme, acentos vinho/rosa queimado, sombras suaves e acabamento delicado;
- `Aniversário Fofo`: fundo claro quente, folha clara, acentos pêssego/rosa/dourado e visual comemorativo controlado.

Texturas reais agora podem vir de assets associados ao `ThemeVersion` por role. O config referencia roles/assetIds seguros; o renderer resolve `previewUrl` no payload de assets. Quando uma textura real não existir, `PageSurface` e os demais componentes mantêm CSS leve (`radial-gradient`, `linear-gradient`, grão simulado, manchas sutis, desgaste de borda e sombras multicamada), sem depender de URL externa.

### Seeds de templates

Os templates seedados publicados são estruturais e não carregam a aparência que pertence ao tema. A base antiga continua útil para comparação e fluxo simples:

- `Amor / Namoro`: capa, carta principal, galeria, música e página final;
- `Feliz Aniversário`: capa de aniversário, mensagem de parabéns, galeria, coisas que amo/admiro em você e página final;
- `Melhor Amiga`: capa, nossa amizade, melhores momentos, piadas/memórias e página final.

### Templates premium

A primeira leva premium usa a mesma estrutura versionada de `Template`, `TemplateVersion` e `TemplatePage`, mas com composição mais próxima de scrapbook real:

- `Love Letter Scrapbook`: casal/carta romântica, capa com foto principal, carta, galeria de polaroids, lista emocional e final;
- `Birthday Handmade`: aniversário, capa handmade, mensagem, galeria, calendário/data especial e desejos finais;
- `Best Friends Collage`: amizade, capa jovem, história, colagem de momentos, piadas internas e final;
- `Vintage Memory Book`: memória/retrospectiva, capa vintage, linha de memórias, fotos em molduras antigas, carta curta e final nostálgico.

Templates premium são construídos por `App\Domain\Templates\Support\PremiumTemplateCanvasFactory`. Esse helper evita JSON gigante no seeder e oferece primitivas reutilizáveis para:

- textos editáveis com nomes amigáveis;
- placeholders de imagem com `placeholderLabel`, sem `mediaItemId` fake;
- polaroids inclinadas;
- fitas sobre fotos;
- etiquetas editáveis;
- papéis rasgados, envelopes, selos, calendários, jornais e doodles;
- zIndex e rotações leves para colagem orgânica.

Template e Theme continuam separados:

- Template define estrutura, páginas, elementos iniciais, posições, tamanhos, rotações, textos, placeholders, ordem de camadas e composição;
- Theme define aparência, paleta, texturas, papel, fundo, sombra, profundidade e atmosfera.

Templates podem referenciar assets por `assetId` seguro quando o asset seedado/admin existir. Se um asset opcional não existir, a factory cria fallback de sticker textual seguro, sem URL externa. O canvas nunca salva `previewUrl`, `storage_path`, `src` manual em sticker, HTML ou script. Fotos do usuário continuam entrando depois por `mediaItemId` real do Gift.

Cada `TemplatePage.canvas` seedado tem `schemaVersion = 1`, `version = 1`, `artboard` `1080x1350`, `unit = px`, `safeArea` padrão e `elements` como array. `CreateGiftFromTemplate` copia esses canvases para `GiftPage` já normalizados, então gifts novos não devem falhar com erro de artboard da capa.

### Renderer temático

O renderer compartilhado continua sendo a fonte única para editor e viewer. A base visual agora é composta por:

- `ScrapbookStage`: moldura externa, mesa/fundo da aplicação e base do caderno/livro;
- `ScrapbookPageFrame`: encadernação, lombada, furos, camadas de papel, fitas e profundidade;
- `PageSurface`: superfície de papel temática, textura, grão, manchas, desgaste de borda, sombra e safe area visual no editor;
- `ThemedArtboard`: camada interna do artboard;
- `CanvasElementLayer`: ordenação por `z` e renderização dos elementos;
- `ElementRenderer`, `TextElement`, `ImageElement`, `StickerElement`, `MusicElement` e `InteractiveElement`.

`PageRenderer` segue sendo a entrada principal, recebendo `canvas`, `theme` e `context` (`editor`, `preview` ou `public`). Editor, preview privado e viewer público devem passar o mesmo `theme.config` resumido pelo backend.

### Book Mode no viewer e preview

O viewer público e o preview privado usam Book Mode para aproximar a experiência de um scrapbook/caderno real, sem transformar o editor em duas páginas.

No desktop/tablet largo:

- o livro é renderizado como spread aberto;
- página esquerda e direita aparecem lado a lado;
- a navegação avança por pares;
- há lombada central, sombra na dobra, textura/superfície do livro e profundidade;
- quando o número de páginas é ímpar, o último spread mostra a página real à esquerda e uma folha vazia decorativa à direita.

No mobile:

- o viewer mantém uma página por vez;
- a página continua grande o suficiente para leitura/toque;
- navegação por botões, teclado e swipe continua funcionando;
- o progresso mostra página individual, não par.

Componentes principais:

- `PublicGiftViewerShell`: controla abertura, páginas, final, teclado, swipe e estado atual;
- `BookViewerShell`: traduz range atual em página esquerda/direita;
- `OpenBookSpread`: monta o livro aberto, textura de capa/superfície, sombra externa e layout responsivo;
- `BookPageSlot`: renderiza página real ou folha vazia decorativa usando `PageSurface`, `ThemedArtboard` e `CanvasElementLayer`;
- `BookSpine`: renderiza lombada central e textura de lombada/livro.

O cálculo de pares fica em `bookModeUtils`: no modo `spread`, índice `0` mostra páginas 1–2, índice `2` mostra páginas 3–4 e assim por diante; no modo `single`, cada índice corresponde a uma página real. A folha vazia decorativa não entra no total de progresso.

`theme_versions.config.book` pode controlar `mode`, `spineWidth`, `spreadGap`, `pageCurl` e `foldShadow`, sempre com fallback seguro. O backend expõe esses campos por `ThemeConfig::publicConfig()` sem caminhos internos; o frontend normaliza/clampa valores antes de usar CSS. As texturas continuam vindo apenas de assets seguros resolvidos pelo backend.

### Estado visual mínimo esperado

A página renderizada não deve parecer um retângulo branco simples. Ela deve mostrar:

- fundo temático;
- textura ou simulação de papel com grão/fibras/manchas;
- borda e sombra;
- sensação de folha artesanal;
- safe area/padding visual, especialmente no editor;
- proporção consistente;
- placeholders bonitos para imagens vazias;
- responsividade para mobile e desktop.

Esta fase não implementa drag-and-drop completo, marketplace de assets, animação de virar página, autosave paralelo/complexo ou gateway real.
