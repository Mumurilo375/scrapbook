# Contexto fixo para IA de programação - Scrapbook digital

> Este arquivo deve ser lido antes de qualquer alteração no código. Ele descreve o produto, regras de negócio, arquitetura, segurança e convenções. Não implemente features que contrariem este documento sem decisão explícita do dono do projeto.

regra numero 1: nunca rode um teste que vai resetar meu banco de dados, estou passando por varios problemas por que sempre que voce (IA) vai fazer os testes acaba resetando meu banco de dados principal (postgres na porta 5432), se atente sempre a isso para que nao ocorra novamente! A suite de testes deve usar `scrapbook_testing` em porta segura (`55432`) ou outro banco descartavel com `test` no nome; PostgreSQL na porta `5432` e bancos sem `test` no nome devem ser bloqueados antes de `RefreshDatabase`.

## 1. Resumo do produto

Estamos criando um **scrapbook digital mobile-first**. O usuário cria um presente digital baseado em templates visuais, com páginas de caderno, fotos, textos, música, stickers, temas e interações. A pessoa presenteada recebe um link ou QR Code e abre uma experiência que parece um caderno real sendo folheado.

O foco inicial é:

- casais/namoro;
- aniversário;
- melhor amiga;
- aniversário de namoro.

O visual deve ser informal, jovem, emocional, bonito, com estética de scrapbook/caderno artesanal, mas com acabamento digital premium.

## Prioridade atual: analytics aggregation and retention

A landing v1 já existe como rascunho inicial de exploração visual da estética kraft/scrapbook/vintage. Ela NÃO é versão final do produto, NÃO valida promessas comerciais e NÃO deve ser tratada como referência definitiva para demo, templates reais ou experiência final.

O domínio, banco real e admin inicial em Filament já foram implementados. O projeto já consegue operar ocasiões, planos, temas, templates, versões, páginas, gifts, mídia, pedidos, pagamentos e analytics sem hardcode administrativo. O fluxo inicial de criação do cliente também já existe: o visitante escolhe ocasião, escolhe template publicado e o usuário autenticado consegue criar um `Gift` draft com páginas copiadas do template.

Autenticação real mínima, Editor MVP, upload/mídia básica, preview privado, viewer público seguro, revisão/publicação técnica MVP e checkout interno/manual-dev já existem. O usuário autenticado acessa `/app/gifts/{gift}/edit`, seleciona páginas, vê preview, seleciona elementos existentes, move/redimensiona/rotaciona elementos suportados, edita textos, salva canvas e metadados por autosave, envia fotos reais, aplica fotos em elementos `image`, abre `/app/gifts/{gift}/preview`, revisa requisitos em `/app/gifts/{gift}/review`, passa por checkout interno e gifts publicados podem ser vistos em `/p/{slug}-{public_code}`.

A fundação visual do scrapbook já foi aprofundada e as últimas etapas estabilizaram o editor sem criar feature grande nova: editor, preview e viewer usam renderer compartilhado, artboard padronizado, tema visual aplicado, autosave corrigido, aba Imagens limpa, seleção/manipulação básica de elementos existentes, correções de UX do editor visual, biblioteca inicial de stickers/assets decorativos, controles de elementos/camadas, histórico local com desfazer/refazer, link público de Gift publicado por slug + `public_code`, viewer público refinado, preview privado refinado, QR Code/cartão compartilhável, admin real de assets visuais, sistema correto de papel/fundo da página em `canvas.artboard.background`, Book Mode com duas páginas, transições leves no preview/viewer e componentes especiais de scrapbook (`interactive_envelope` e `flip_polaroid`).

Neste momento, a prioridade principal é **sustentabilidade do analytics: agregação diária, retenção e prune seguro**. A base de analytics, métricas e logs internos já existe; agora o foco é preencher `analytics_daily_metrics`, reduzir dependência de consultas brutas pesadas, controlar crescimento de `analytics_events`, `analytics_sessions`, `gift_visits` e `gift_events`, preservar eventos financeiros conforme configuração e manter o dashboard admin compatível.

A etapa visual mais recente priorizou o redesign do dashboard admin `/admin/analytics`: a funcionalidade de analytics já estava implementada, e a página foi reorganizada como um dashboard Filament profissional com header, filtro segmentado, abas de Visão geral/Funil/Receita/Viewer/Eventos/Saúde, cards fortes, linhas de funil visuais, listas/tabelas estilizadas, comandos formatados, estados vazios e payloads em chips resumidos sem dados sensíveis.

Analytics deve ser útil, mas seguro:

- não integrar Google Analytics, Meta Pixel ou ferramenta externa nesta fase;
- não avançar gateway real, landing final, demo pública ou feature visual nova;
- não coletar IP puro;
- não coletar user-agent puro;
- se precisar identificar IP/user-agent, usar hash com salt/config;
- não gravar textos escritos pelo usuário, carta, mensagens, HTML, nomes de arquivos, `storage_path`, `public_code` ou payload sensível;
- sanitizar e limitar payloads antes de persistir;
- mascarar paths públicos sensíveis em analytics, usando `/p/{slugToken}`;
- admin acessa analytics global;
- customer não acessa analytics global;
- dono do gift pode ver apenas analytics simples do próprio gift;
- tracking client-side deve ser controlado, permitido por taxonomia e leve;
- viewer público não pode ser bloqueado por analytics;
- não criar tracking novo invasivo nesta fase;
- agregação e prune devem preservar privacidade, sem IP puro, user-agent puro ou payload sensível;
- prune nunca deve apagar `orders`, `payments`, `gifts` ou `users`.

### QA visual/mobile com assets reais

A rodada de QA visual/mobile com assets reais continua importante, mas agora fica como fase de validação/polimento paralela ou posterior à base de analytics. O foco dessa rodada segue sendo validar o fluxo completo com material visual final ou próximo do final, principalmente em celular, e aplicar apenas correções pequenas e objetivas em editor, viewer, admin, performance e documentação.

### Checklist de QA visual/mobile com assets reais

- Existe checklist interno em `/admin/visual-qa` e espelho em `docs/visual-qa-checklist.md`.
- Antes de avançar feature nova, rode a auditoria automática com `php artisan scrapbook:visual-audit` e depois faça o QA manual com celular/assets reais.
- A auditoria automática é somente leitura: ela não corrige, não apaga, não faz upload, não acessa URL externa e não substitui o julgamento visual manual.
- A auditoria ajuda a produzir templates reais encontrando problemas estruturais em assets, categorias, temas, ThemeVersions, TemplateVersions, TemplatePages, canvas, backgrounds e referências antes do teste manual.
- O QA deve cobrir: upload de assets reais, categorias, associação a tema, texturas de papel/fundo/livro, Gift-base, editor, troca de papel, stickers, envelope, polaroid, autosave, undo/redo, Gift para Template, publicação de TemplateVersion, Gift de cliente, publicação de Gift, viewer público mobile, Book Mode, QR Code/cartão e performance.
- Recomendações de assets reais: stickers PNG/WebP transparentes com 512px ou 1024px no maior lado; papéis próximos de 1080x1350 ou 2160x2700 em JPG/WebP otimizado; fundos externos grandes o suficiente e otimizados.
- Correções desta fase devem ser pequenas: layout mobile, labels, estados vazios/erro/loading, overflow, sombras excessivas, imagens sem lazy loading, listas de assets pesadas, conflito de toque em envelope/polaroid e performance óbvia.
- Manter segurança: sem URL externa, sem `storage_path` no frontend público, stickers por `assetId`, mídia por `mediaItemId` autorizado, HTML/script bloqueado, customer sem admin e viewer público apenas para Gift publicado válido.
- Esta fase não avança gateway real, landing final, marketplace, template builder novo, editor novo, mini game, puzzle, page flip 3D pesado ou novo componente interativo.

O sistema de papel/fundo da página está estabilizado. Papel da página não é sticker, não entra em `canvas.elements[]` e não deve ser redimensionado manualmente. Tema define o papel padrão; cada página pode sobrescrever esse papel em `canvas.artboard.background` com um asset seguro; editor, preview privado e viewer público devem renderizar a mesma folha.

### Sistema estabilizado: papel/fundo da página

- Papel/fundo da página é propriedade visual do artboard, salvo em `canvas.artboard.background`.
- `background.type = theme` usa o papel padrão do tema, resolvido por `paper_texture`, `kraft_surface` ou fallback visual do tema.
- `background.type = asset` usa `assetId` seguro, ativo e permitido como papel/fundo para aquela página.
- Papel não pode virar elemento `sticker`, não deve aparecer misturado na aba `Adesivos` e não deve salvar URL, `previewUrl` ou `storage_path` no canvas.
- A aba `Página`/`Fundo` do editor deve permitir trocar o papel da página atual com 1 clique e voltar para "Usar papel do tema".
- Preview privado, viewer público e Book Mode precisam usar o mesmo renderer de fundo da folha.
- Gift para Template deve preservar background asset seguro e normalizar background inválido para `theme`.
- Bug crítico desta fase: o papel escolhido não pode voltar sozinho depois do clique/autosave. A resposta do backend, o estado local e o rascunho em `localStorage` precisam manter o mesmo `canvas.artboard.background`.
- A UI deve falar em "papel do tema", "papel herdado" ou "papel personalizado"; evitar o label confuso "tema atual" como estado de página.
- Não reintroduzir papel como sticker, nem permitir papel em `canvas.elements[]`.
- Checkerboard/quadriculado de transparência só é aceitável em preview técnico/admin de asset transparente, nunca no fundo geral do editor.

Depois desta rodada de QA visual/mobile, a próxima fase deve ser escolhida pelo resultado do teste real: corrigir mais polimento visual, adicionar bilhete secreto, avançar page flip mais sofisticado, revisar landing final ou integrar gateway real em etapa separada.

### Base atual: pipeline visual e Gift para Template

- O admin real de assets visuais já existe. Seeds e assets placeholder continuam como exemplo, não como fonte final de estética.
- `Asset` é decoração do sistema/admin; `MediaItem` continua sendo foto/imagem enviada pelo usuário final dentro de um Gift.
- Adesivos, papéis, texturas, fitas, molduras, envelopes, selos, flores e recortes devem ser cadastrados pelo admin/support, não hardcoded no frontend.
- Código novo na fase de QA visual/mobile deve focar documentação interna e polimentos pequenos, mantendo checkout, gateway real, publicação pesada, landing, editor pesado, page flip 3D, mini games e novos componentes fora do escopo. Na fase atual de analytics, o mesmo cuidado de escopo continua: não avançar gateway, landing ou feature pública nova.
- Template define estrutura: páginas, elementos iniciais, posições, tamanhos, rotações, placeholders, textos editáveis, ordem de camadas, composição e ritmo visual.
- Theme define aparência: texturas, paleta, papel, fundo, sombras, profundidade e atmosfera visual.
- Book Mode desktop/tablet largo já mostra livro aberto com página esquerda, página direita, lombada central, sombra na dobra e navegação por pares.
- Book Mode mobile mantém uma página por vez, sem espremer duas páginas na tela.
- Quando houver número ímpar de páginas, a direita do último par deve ser página vazia decorativa com o mesmo tema/textura, sem contar como página real.
- Preview privado e viewer público devem usar a mesma experiência visual; o preview só adiciona barra privada discreta.
- O editor continua uma página por vez. Não transformar o editor em spread nesta fase.
- Templates novos devem ser criados preferencialmente montando um Gift no editor visual e usando a ação admin "Criar template" no Gift.
- A conversão Gift para Template deve criar `Template`, `TemplateVersion` e `TemplatePages`, copiar canvas seguro, remover `mediaItemId`/URLs de fotos pessoais e transformar imagens em placeholders.
- Stickers/assets de sistema devem ser preservados por `assetId` seguro; o canvas de template nunca deve salvar `previewUrl`, `storage_path`, URL externa ou mídia pessoal.
- `TemplateVersion` criada a partir de Gift deve nascer como `draft` por padrão; publicar deve ser decisão posterior e consciente.
- `/admin/template-pages/{id}/edit` continua existindo para JSON avançado, mas não deve ser o fluxo principal de criação visual.
- Assets ativos aparecem no editor; assets inativos não aparecem e não são aceitos no autosave.
- Assets do tema atual aparecem priorizados; assets globais aparecem depois e podem ser usados por qualquer Gift/template.
- O frontend nunca deve receber `storage_path`, nem salvar URL arbitrária de sticker no canvas. Sticker salva `assetId`.
- O renderer compartilhado deve resolver `renderStyle` por metadata e cair para `asset.type` quando ausente.
- Metadata `physical` controla borda branca aproximada, sombra, lift, textura de papel, rotação sutil, highlight de borda e opacidade.
- Metadata `defaultTransform` controla tamanho e rotação inicial ao adicionar o asset no editor.
- `theme_versions.config.textures` pode referenciar apenas `assetRole`, `assetId` seguro e valores visuais como `opacity`, `blendMode`, `size`, `position` e `repeat`.
- O config de tema não deve salvar URL externa de textura. Stage, PageFrame e PageSurface só usam `previewUrl` resolvido a partir de assets seguros enviados pelo backend.
- Roles de textura importantes em `theme_asset.role`: `paper_texture`, `background_texture`, `book_texture`, `spine_texture`, `page_overlay`, `edge_overlay`, `fabric_background`, `kraft_surface`, `page_background`, `aging_overlay` e `stain_overlay`.
- Viewer público e preview privado recebem apenas assets de textura necessários e stickers visíveis/referenciados; não devem carregar a biblioteca inteira.
- Não avançar para gateway real, page flip 3D pesado, marketplace, landing final ou demo pública enquanto esta fase estiver aberta.

A fundação visual atual deve garantir:

1. todo `TemplatePage.canvas` e `GiftPage.canvas` tem `schemaVersion/version = 1`, `artboard` válido e `elements` como array;
2. canvas antigo sem `artboard` é normalizado de forma segura, sem apagar elementos do usuário;
3. artboard inválido, canvas inseguro, HTML, scripts, protocolos inseguros e URLs externas continuam bloqueando publicação;
4. `theme_versions.config` possui contrato visual utilizável, com `tokens`, `book`, `page` e defaults de `elements`;
5. Template define estrutura, páginas, posições, textos default, slots e placeholders;
6. Theme define aparência: papel, textura, cor, fontes, sombras, bordas, molduras e estilo geral do livro;
7. editor, preview privado e viewer público usam o mesmo renderer base;
8. a página renderizada deve ser uma folha temática de scrapbook dentro de um caderno/livro, não um retângulo branco simples;
9. a proporção padrão do artboard é `1080x1350`, mais próxima de uma folha 4:5 equilibrada para mobile e desktop;
10. `theme_versions.config` deve controlar fundo da aplicação, livro, lombada, papel, textura, grão, manchas, bordas, sombra, fitas e defaults de elementos;
11. os seeds iniciais devem manter múltiplos temas/templates publicados para comparar se trocar tema realmente muda o produto;
12. os temas seedados atuais são `Kraft Vintage`, `Romance Delicado` e `Aniversário Fofo`;
13. os templates seedados atuais incluem templates básicos e a primeira leva premium: `Love Letter Scrapbook`, `Birthday Handmade`, `Best Friends Collage` e `Vintage Memory Book`, todos com páginas estruturais, artboard válido e composição mais orgânica.
14. `MediaItem` continua sendo upload do usuário vinculado a `User`/`Gift`, enquanto `Asset` é decoração do sistema cadastrada/admin.
15. stickers decorativos no canvas salvam `assetId`, nunca URL arbitrária.
16. assets globais ativos e assets associados ao tema atual podem aparecer no editor; assets inativos não aparecem e não são aceitos no autosave.
17. elementos do canvas podem ter `name`, `locked` e `hidden` opcionais, normalizados com defaults seguros.
18. elementos `hidden` não aparecem em preview privado nem viewer público.
19. elementos `locked` continuam visíveis, mas não podem ser movidos, redimensionados, rotacionados, editados ou deletados.
20. o editor mantém histórico local por página para undo/redo durante a sessão, sem persistir versionamento no servidor.

Fluxo atual do produto:

1. visitante pode explorar `/criar` sem login até o template;
2. ao criar o `Gift` draft, precisa entrar ou criar conta;
3. login/cadastro/logout usam sessão Laravel/Inertia real;
4. cadastro público atribui role `customer`;
5. depois do login/cadastro, o usuário volta ao contexto do template escolhido;
6. `CreateGiftFromTemplate` cria o gift para o usuário autenticado e copia `TemplatePage` para `GiftPage`;
7. usuário acessa `/app/gifts/{gift}/edit` para selecionar páginas, selecionar elementos no canvas ou na lista de camadas, mover/redimensionar/rotacionar elementos editáveis, adicionar adesivos do sistema, duplicar/deletar elementos, bloquear/desbloquear, ocultar/exibir, editar textos direto no canvas ou pelo painel, desfazer/refazer alterações locais e salvar canvas por autosave;
8. usuário edita metadados básicos do gift: `title`, `recipient_name` e `sender_name`, também por autosave;
9. usuário envia imagens próprias para o Gift draft;
10. usuário aplica imagem em elementos `image` existentes selecionando a foto na página e clicando no botão contextual `Trocar foto`, que abre o upload direcionado para substituir aquela foto; upload geral da biblioteca apenas adiciona mídia;
11. usuário abre `/app/gifts/{gift}/preview` para ver o presente sem controles de edição;
12. gift publicado pode ser aberto por `/p/{slug}-{public_code}`;
13. viewer público só resolve gifts `published`, `public_link`, não expirados e não desativados;
14. mídia do viewer público é servida por rota controlada e precisa pertencer ao Gift publicado;
15. usuário acessa `/app/gifts/{gift}/review` para ver checklist de publicação;
16. revisão aprovada aponta para `/app/gifts/{gift}/checkout`;
17. checkout cria/reusa `Order pending` vinculada a Gift, User e Plan;
18. Gift em checkout fica `pending_payment` e não abre publicamente;
19. aprovação manual/dev controlada marca `Payment approved`, `Order paid` e chama `PublishGift`;
20. `PublishGift` publica apenas com pagamento aprovado, gera slug/`public_code`, `published_at` e `expires_at`;
21. editor, preview e viewer renderizam a folha com tema aplicado;
22. após publicar, o link público aparece na revisão, editor, pedido e dashboard;
23. usuário acessa `/app/gifts/{gift}/share` para copiar link, visualizar/baixar QR Code e abrir o cartão compartilhável;
24. o cartão compartilhável usa visual simples de scrapbook/papel/kraft e pode ser impresso ou salvo como PDF pelo navegador;
25. usuário volta depois e vê seus próprios gifts em `/app/gifts`.

A IA deve seguir o roadmap e não continuar refinando landing, demo pública, checkout ou publicação real sem solicitação explícita. A sequência esperada é:

1. aprofundamento visual dos temas: canvas/artboard, tema, renderer e folha temática;
2. redesign do editor e autosave simples/robusto;
3. correção do autosave e limpeza final da aba Imagens;
4. seleção e manipulação visual básica de elementos existentes;
5. correções de UX do editor visual básico;
6. biblioteca de stickers/assets e categorias;
7. controles de elementos e camadas;
8. histórico local de edição e desfazer/refazer;
9. polimento e QA do editor antes de novas features grandes;
10. QR Code e cartão compartilhável;
11. refinamento do viewer público e preview privado;
12. admin de assets visuais reais;
13. renderização premium/física de stickers/assets;
14. texturas reais de papel/tema usando assets do admin;
15. templates premium com assets reais;
16. book mode com duas páginas;
17. pipeline visual real: upload de assets sem travar, associação clara a temas e teste de texturas;
18. Gift para Template como fluxo principal para criar templates visualmente;
19. page flip leve/transições e componentes especiais de scrapbook;
20. escolha e integração de gateway real antes de produção;
21. demo pública refinada e landing final baseada no produto real.

### Restrições atuais

- Não refinar visualmente a landing page sem pedido explícito.
- Não criar demo pública agora.
- Não criar editor completo estilo Canva/Figma agora.
- Não integrar provider externo real de pagamento agora.
- Não criar cobrança fake, Pix fake ou gateway visível como real.
- Não integrar Spotify, streaming ou hospedagem real de música.
- Não hardcodear templates ou temas finais no frontend.
- Não assumir que a landing atual é definitiva.
- Não avançar para demo pública ou checkout real sem solicitação explícita.
- Não implementar marketplace de assets, upload avançado de assets pelo usuário final ou edição visual de tema nesta fase.
- Não recriar o card técnico "Usar na página" no editor.
- Biblioteca de imagens não deve aplicar imagem automaticamente no canvas; upload geral apenas adiciona à biblioteca.
- Clique curto em imagem no canvas seleciona a foto e mantém os handles de mover/redimensionar/rotacionar; o botão contextual `Trocar foto` aparece abaixo da imagem selecionada e abre o upload direcionado.
- Não criar demo pública a partir do fluxo de criação atual.
- Não tratar o Editor MVP como editor visual completo.
- Não recolocar placeholders de auth no lugar das páginas reais de login/cadastro.
- Não permitir publicação de Gift inválido, sem página visível, com canvas inseguro ou com mídia de outro Gift.
- Não permitir viewer público antes de pagamento aprovado e `status = published`.

### Status do viewer público refinado

- O editor estabilizado continua sendo a base: autosave, renderer compartilhado, assets, camadas, locked/hidden e histórico local devem ser preservados.
- O viewer público já deve abrir como presente: tela de abertura, título, destinatário/remetente quando existirem, botão “Abrir presente”, navegação página por página e encerramento emocional.
- O preview privado reutiliza a mesma experiência visual, mas com controles privados discretos para editar, revisar/publicar, compartilhar ou abrir link público conforme o status.
- O CTA público “Criar o meu também” deve continuar discreto e apontar para `/criar`, sem roubar atenção do scrapbook.
- Gifts indisponíveis devem retornar HTTP 404 com mensagem amigável genérica, sem revelar se expiraram, foram desativados, estão em rascunho ou receberam `public_code` incorreto.
- O payload público não deve enviar `id`, `status`, datas internas, usuário autenticado, usuário dono, pagamento, pedido, plano, admin, `public_code` separado ou `storage_path`.
- O viewer público continua exigindo `published`, `public_link`, slug + `public_code`, não expirado e não desativado.
- O QR Code e cartão compartilhável já existem e devem continuar apontando somente para a URL pública segura.
- Não implementar gateway real, Pix, pagamento externo, envio automático por WhatsApp/e-mail, sistema físico de impressão/entrega, landing final, demo pública, marketplace ou editor novo nesta etapa.
- O renderer compartilhado continua sendo a base visual; controles de seleção e handles aparecem somente no editor.
- O autosave existente deve ser preservado como único mecanismo de persistência do canvas, com `localStorage` apenas como proteção temporária.
- A UI técnica removida da aba Imagens não deve voltar. Upload geral adiciona à biblioteca; trocar imagem acontece pelo botão contextual `Trocar foto` abaixo da imagem selecionada.

## 2. Regras de negócio não negociáveis

1. O usuário começa escolhendo uma ocasião.
2. O usuário escolhe um template daquela ocasião.
3. Inicialmente não existe criação do zero; tudo parte de um modelo.
4. Templates e temas devem vir do banco, não do código fixo.
5. Templates e temas devem ser versionados.
6. Presentes já criados não podem quebrar se um template/tema for editado depois.
7. Ao criar um presente, copiar as páginas da versão publicada do template para `gift_pages`.
8. O editor salva páginas em JSON versionado.
9. O viewer público e o editor devem renderizar a partir do mesmo contrato de dados.
10. O usuário pode reordenar páginas.
11. O usuário pode remover/ocultar páginas.
12. O usuário pode adicionar páginas permitidas.
13. O usuário pode repetir páginas, respeitando limites.
14. O usuário pode mover, redimensionar e rotacionar elementos.
15. O usuário pode adicionar/remover stickers.
16. O usuário pode trocar tema.
17. O usuário pode trocar textos e fotos.
18. O usuário pode trocar fundo/textura quando permitido.
19. O usuário pode escolher música por metadata externo.
20. Não hospedar músicas protegidas por direitos autorais.
21. Fotos devem ser reprocessadas e comprimidas.
22. No MVP, aceitar apenas fotos, não vídeos.
23. O usuário pode começar sem login.
24. Antes de pagar/publicar, precisa entrar/criar conta ou vincular e-mail.
25. O usuário deve ter dashboard com seus presentes.
26. Pagamento inicial é por presente, não assinatura.
27. Presentes pagos têm expiração definida por plano.
28. Draft abandonado expira depois de 7 dias sem atividade.
29. Link público usa slug bonito + token forte.
30. Não usar ID incremental em URL pública.
31. Presentes públicos devem ser `noindex`.
32. Admin pode desativar presentes problemáticos.
33. Admin deve ter logs e métricas.
34. Segurança é requisito desde o começo.

## 3. Stack esperada

- Backend: Laravel.
- Frontend: React + TypeScript.
- Integração: Inertia.js + Vite.
- Banco: PostgreSQL.
- Cache/fila: Redis.
- Jobs: Laravel Queue + Horizon.
- Admin: Filament.
- Permissões: Spatie Laravel Permission.
- Auditoria: Spatie Activitylog ou logs próprios.
- Imagens: Intervention Image ou serviço equivalente.
- Storage: S3-compatible.
- Testes: Pest/PHPUnit.
- Qualidade: Laravel Pint, ESLint, Prettier, Larastan/PHPStan.

## 4. Estilo de arquitetura

Usar **monólito modular**.

Não criar microserviços.

Organizar código por domínios quando fizer sentido:

- Gifts;
- Templates;
- Themes;
- Assets;
- Media;
- Payments;
- Analytics;
- Admin;
- Editor.

Preferir Actions/Services explícitos para regras importantes.

Exemplos:

- `CreateGiftFromTemplate`
- `UpdateGiftPageCanvas`
- `PublishGift`
- `ChangeGiftTheme`
- `CreateCheckoutOrder`
- `ProcessApprovedPayment`
- `ProcessPaymentWebhook`
- `ProcessUploadedImage`
- `GenerateGiftQrCard`
- `ExpireOldDrafts`

Controllers devem ser finos.

## 5. Convenções de dados

### IDs

Usar ULID/UUID para entidades principais.

Nunca expor ID incremental em URL pública.

### Status

Usar enums PHP para status.

Status principais de gift:

- `draft`
- `pending_payment`
- `published`
- `disabled`
- `expired`

Status de order:

- `pending`
- `paid`
- `canceled`
- `expired`
- `refunded`

Status de payment:

- `pending`
- `approved`
- `rejected`
- `refunded`
- `canceled`

Status de template/theme version:

- `draft`
- `published`
- `archived`

### JSONB

Usar JSONB para:

- `canvas_json`;
- `content_json`;
- `settings`;
- `theme tokens`;
- `editable slots`;
- `interaction config`;
- `metadata`;
- `price_snapshot`;
- `limits_snapshot`.

Todo JSON que define layout/renderização deve ter `schemaVersion`.

## 6. Principais tabelas esperadas

Autenticação:

- `users`
- `social_accounts`
- `guest_sessions`
- `magic_login_tokens` opcional

Catálogo:

- `occasions`
- `modules`
- `themes`
- `theme_versions`
- `asset_categories`
- `asset_packs`
- `design_assets`
- `templates`
- `template_versions`
- `template_pages`
- `template_slots`
- `plans`

Presentes:

- `gifts`
- `gift_pages`
- `gift_media`
- `media_variants`
- `music_tracks`
- `gift_music`
- `gift_delivery_assets`

Pagamento:

- `orders`
- `payments`
- `payment_webhook_events`

Analytics/admin:

- `gift_events`
- `gift_daily_metrics`
- `admin_audit_logs`

## 7. Contrato do canvas

O canvas é salvo em `gift_pages.canvas_json`.

Formato conceitual:

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
  "elements": [
    {
      "id": "el_01",
      "type": "text",
      "slotKey": "main_title",
      "text": "Feliz aniversário",
      "x": 120,
      "y": 180,
      "w": 840,
      "h": 180,
      "rotation": 0,
      "z": 10,
      "style": {
        "fontToken": "title",
        "fontSize": 76,
        "color": "var(--ink)",
        "align": "center"
      }
    }
  ]
}
```

Regras:

1. Coordenadas ficam no sistema do artboard.
2. Renderer escala para o tamanho real da tela.
3. Todo elemento precisa ter `id`, `type`, `x`, `y`, `w`, `h`, `z`.
4. Texto deve ser texto puro.
5. Não aceitar HTML do usuário.
6. Se implementar rich text no futuro, sanitizar no server e no client.
7. Elementos interativos precisam declarar interação no JSON.
8. Toda alteração estrutural exige migrator de schema.

## 8. Renderer

Criar componentes compartilhados:

- `ScrapbookStage`
- `ScrapbookPageFrame`
- `PageSurface`
- `ThemedArtboard`
- `CanvasElementLayer`
- `ScrapbookRenderer`
- `PageRenderer`
- `ElementRenderer`
- `TextElement`
- `ImageElement`
- `StickerElement`
- `MusicElement`
- `InteractiveElement`

O editor e o viewer público devem usar o mesmo renderer base.

Nunca duplicar lógica de renderização em dois lugares incompatíveis.

`PageSurface` é responsável por fazer a folha parecer papel real: fundo temático, textura simulada, grão, manchas suaves, desgaste de borda, sombra e safe area visível no editor. O visual não deve voltar a ser um retângulo branco genérico.

## 9. Editor

O editor deve:

- ser mobile-first;
- permitir seleção de elementos;
- mover elementos;
- redimensionar elementos;
- rotacionar elementos;
- editar texto;
- trocar imagem;
- adicionar stickers;
- remover stickers;
- reordenar páginas;
- adicionar páginas;
- remover/ocultar páginas;
- trocar tema;
- autosalvar;
- mostrar estado de salvamento;
- preservar o rascunho em caso de reload;
- validar limites do plano/template;
- usar server como fonte da verdade.

Use Zustand para estado local do editor.

Use validação com Zod para canvas no frontend, mas sempre valide no backend também.

## 10. Templates

Templates são compostos por:

- ocasião;
- versão;
- tema padrão;
- formato;
- dimensões do artboard;
- páginas;
- slots editáveis;
- elementos decorativos;
- textos padrão;
- regras/limites.

Não alterar template publicado diretamente.

Fluxo correto:

1. Criar template draft.
2. Criar/editar template_version draft.
3. Testar preview.
4. Publicar versão.
5. Marcar como current_version.
6. Gifts novos usam essa versão.
7. Gifts antigos continuam apontando para versão antiga ou cópia própria.

## 11. Temas

Tema não deve controlar totalmente o layout. Layout é principalmente responsabilidade do template.

Tema controla:

- cores;
- fontes;
- texturas;
- stickers recomendados;
- molduras;
- estilo de botões;
- filtros de imagem;
- sombras;
- decoração padrão.

Trocar tema deve ser não destrutivo.

Elementos customizados pelo usuário não devem sumir ao trocar tema.

## 12. Mídia

Upload de imagem do editor:

1. Validar request.
2. Confirmar usuário autenticado, dono do Gift e Gift em `draft`.
3. Aceitar apenas JPG/JPEG, PNG e WebP.
4. Bloquear SVG, GIF, vídeo, PDF, executáveis e MIME/extensão inconsistentes.
5. Processar com Intervention Image, limitar dimensões, gerar WebP otimizado e thumbnail.
6. Remover metadados sensíveis quando possível por reencode/strip.
7. Criar registro `media_items` com `user_id`, `gift_id`, tipo `image`, storage, dimensões, tamanho, variantes e status `processed`.
8. Servir imagens no editor por rota autenticada do Laravel.
9. Permitir uso no canvas somente por `mediaItemId` pertencente ao mesmo Gift.

Nunca permitir que usuário associe mídia de outro usuário ou de outro Gift. O canvas não deve aceitar `src` externo ou relativo arbitrário; o backend deve gerar o `src` seguro a partir do `MediaItem`.

A aba Imagens do editor deve ser apenas a biblioteca do Gift com upload geral e lista de imagens enviadas. Não recriar a UI técnica "Usar na página", não listar slots como `photo 1`/`photo 2` fora de debug local e não fazer upload geral trocar a foto da página automaticamente. Para substituir foto, o fluxo correto é selecionar a imagem dentro do scrapbook e usar o botão contextual `Trocar foto` para enviar a nova imagem para aquele elemento.

## 12.1 Assets decorativos do sistema

`Asset` é decoração do sistema/admin, não upload do usuário. O admin pode cadastrar categorias e assets; o usuário final apenas escolhe assets permitidos no editor.

- Categorias vivem em `asset_categories`.
- Um asset pode ter uma categoria por `asset_category_id`.
- Upload administrativo de assets reais aceita PNG, WebP e JPG/JPEG, valida MIME real + extensão, bloqueia SVG nesta etapa e salva o arquivo com nome seguro gerado pelo sistema em storage configurado.
- O processamento do asset preenche `storage_disk`, `storage_path`, `mime_type`, `size_bytes`, `width`, `height` e usa rota/URL segura de preview; o admin não deve preencher `storage_path` manualmente.
- Assets globais são ativos sem vínculo em `theme_asset`.
- Assets de tema são ativos vinculados ao `ThemeVersion` atual em `theme_asset`, com `role`, `sort_order` e `config`.
- `theme_asset.role` deve suportar pelo menos `sticker`, `paper_texture`, `kraft_surface`, `page_background`, `background_texture`, `tape`, `frame`, `decoration`, `overlay` e `border`.
- `Asset.metadata` pode conter `renderStyle`, `physical` e `defaultTransform` para preparar aparência futura de sticker recortado, papel, fita, moldura, textura, fundo, envelope e decoração com volume.
- `GET /app/gifts/{gift}/assets` lista assets para o editor apenas para Gift próprio em `draft`.
- Sticker novo no canvas deve salvar `assetId` e transformações (`x`, `y`, `w`, `h`, `rotation`, `z`).
- Não aceitar `src`, `url`, `storage_path`, `previewUrl` ou URL externa/relativa manual em sticker.
- Preview privado e viewer público resolvem assets por payload seguro e não expõem `storage_path`.

## 13. Música

Música deve ser abstraída por provider.

Interface conceitual:

```php
interface MusicProvider
{
    public function search(string $query, int $limit = 10): array;
    public function getTrack(string $providerTrackId): MusicTrackData;
}
```

Não hospedar áudio protegido.

Não prometer reprodução completa se o provider não permitir.

## 14. Pagamento

Pagamento inicial é por presente.

Fluxo:

1. Usuário termina edição ou clica em publicar.
2. Se não estiver logado, precisa logar/criar conta.
3. Sistema faz autosave final.
4. Cria order com price_snapshot.
5. Envia para provider.
6. Recebe webhook.
7. Verifica assinatura.
8. Salva webhook bruto.
9. Processa em job.
10. Atualiza payment/order.
11. Libera publicação.

Webhooks precisam ser idempotentes.

Nunca confiar apenas no retorno do browser após pagamento.

## 15. Link público

Formato sugerido:

```txt
/p/{slug}-{token}
```

Exemplo:

```txt
/p/ana-e-joao-k7Qm92xA
```

Regras:

- Token aleatório forte.
- Armazenar hash do token.
- Não expor ID interno.
- Se inválido, retornar 404 genérico.
- Se expirado, retornar tela adequada ou 404, conforme decisão de UX.
- Presente deve ter `noindex`.

## 16. Segurança obrigatória

Não existe “0 vulnerabilidades” garantido, mas o código deve seguir segurança por padrão.

### Entrada de dados

- Usar Form Requests.
- Validar no backend.
- Não confiar no frontend.
- Usar allowlist de campos.
- Não usar mass assignment sem `$fillable`/DTO seguro.

### XSS

- Texto do usuário deve ser renderizado escapado.
- Não usar `dangerouslySetInnerHTML` com conteúdo do usuário.
- Não armazenar HTML de usuário no MVP.

### Upload

- Limitar tamanho.
- Validar imagem real.
- Reprocessar imagem.
- Remover metadados.
- Nomear arquivos com IDs aleatórios.
- Não executar nem servir arquivos perigosos.

### Autorização

- Toda rota que altera dado precisa policy.
- Usuário só edita seus gifts.
- Admin/suporte só acessa com role.
- Testes obrigatórios para acesso indevido.

### Pagamentos

- Validar assinatura do webhook.
- Usar idempotência.
- Salvar payload bruto.
- Nunca liberar pagamento só por query param de sucesso.

### Sessão/cookies

- Cookies seguros em produção.
- HttpOnly.
- SameSite.
- CSRF ativo.

### Logs

- Não logar token puro.
- Não logar senha.
- Não logar payload sensível completo se tiver dados pessoais excessivos.
- Mas webhooks podem ser armazenados com cuidado e acesso admin restrito.

## 17. Testes mínimos por feature

Toda feature deve vir com testes quando possível.

Para gift:

- dono pode editar;
- outro usuário não pode editar;
- guest com token válido pode continuar draft;
- gift publicado pode ser aberto por link;
- gift expirado não abre;
- gift desativado não abre.

Para media:

- upload válido funciona;
- upload inválido falha;
- limite de tamanho funciona;
- usuário não usa mídia de outro gift.

Para payment:

- order é criada;
- webhook aprovado libera gift;
- webhook duplicado não duplica pagamento;
- webhook inválido é rejeitado.

Para template:

- gift copia páginas do template;
- alteração no template não altera gift existente;
- template publicado não sofre edição destrutiva.

## 18. O que evitar

Não fazer:

- hardcode de templates no React;
- hardcode de temas no React;
- IDs incrementais em URL pública;
- salvar HTML de usuário;
- depender de localStorage como única fonte de draft;
- liberar publicação sem pagamento confirmado por webhook;
- editar template_version publicada diretamente;
- mudar schema do canvas sem versionar;
- deixar admin aberto sem role;
- upload sem processamento;
- prometer vitalício sem regra de expiração/custo;
- adicionar assinatura no início sem validação;
- construir editor estilo Canva completo antes do MVP.

## 19. Critério de pronto para uma task

Uma task só está pronta quando:

1. Código implementado.
2. Testes relevantes criados/atualizados.
3. Validação backend feita.
4. Policy/autorização verificada.
5. Estados de erro tratados.
6. Loading/feedback básico no frontend.
7. Migrações/seeders documentados.
8. Não quebra mobile.
9. Não viola este documento.

## 20. Prompt sugerido para Codex/Claude antes de uma task

Use algo neste estilo:

```txt
Leia o arquivo CONTEXTO_IA.md antes de alterar o projeto.
A tarefa é: [descrever tarefa].
Respeite a arquitetura Laravel + React + Inertia.
Não hardcode templates/temas no frontend.
Use policies e Form Requests.
Adicione ou atualize testes.
Se precisar alterar schema do canvas, explique a migração de schema antes.
Não implemente nada fora do escopo pedido.
Ao final, liste arquivos alterados, decisões técnicas e testes executados.
```

## 21. Prioridade depois da landing aprovada

Depois que a landing page v1 estiver aprovada, a ordem técnica volta a ser:

1. Base segura.
2. Banco bem modelado.
3. Templates/temas versionados.
4. Criação de gift a partir de template.
5. Renderer compartilhado.
6. Editor visual mobile-first.
7. Upload/processamento de fotos.
8. Viewer público bonito.
9. Pagamento/publicação.
10. Dashboard/admin/métricas.

Não usar esta lista para substituir a prioridade atual de branding e landing page.
