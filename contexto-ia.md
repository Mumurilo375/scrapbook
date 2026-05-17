# Contexto fixo para IA de programação - Scrapbook digital

> Este arquivo deve ser lido antes de qualquer alteração no código. Ele descreve o produto, regras de negócio, arquitetura, segurança e convenções. Não implemente features que contrariem este documento sem decisão explícita do dono do projeto.

## 1. Resumo do produto

Estamos criando um **scrapbook digital mobile-first**. O usuário cria um presente digital baseado em templates visuais, com páginas de caderno, fotos, textos, música, stickers, temas e interações. A pessoa presenteada recebe um link ou QR Code e abre uma experiência que parece um caderno real sendo folheado.

O foco inicial é:

- casais/namoro;
- aniversário;
- melhor amiga;
- aniversário de namoro.

O visual deve ser informal, jovem, emocional, bonito, com estética de scrapbook/caderno artesanal, mas com acabamento digital premium.

## Prioridade atual: fluxo de criação do cliente

A landing v1 já existe como rascunho inicial de exploração visual da estética kraft/scrapbook/vintage. Ela NÃO é versão final do produto, NÃO valida promessas comerciais e NÃO deve ser tratada como referência definitiva para demo, templates reais ou experiência final.

O domínio, banco real e admin inicial em Filament já foram implementados. O projeto já consegue operar ocasiões, planos, temas, templates, versões, páginas, gifts, mídia, pedidos, pagamentos e analytics sem hardcode administrativo.

Neste momento, a prioridade principal é o primeiro fluxo real do cliente:

1. visitante escolhe uma ocasião ativa em `/criar`;
2. visitante escolhe um template ativo com `TemplateVersion` publicada;
3. visitante vê detalhes do template, páginas, tema sugerido e plano padrão;
4. para criar o `Gift` draft, o usuário precisa estar autenticado;
5. `CreateGiftFromTemplate` cria o gift e copia `TemplatePage` para `GiftPage`;
6. usuário acessa `/app/gifts/{gift}/edit` para edição básica de metadados/canvas JSON;
7. usuário vê seus rascunhos em `/app/gifts`.

A IA deve seguir o roadmap e não continuar refinando front, landing, demo pública, editor, checkout ou viewer sem solicitação explícita. A próxima sequência esperada é:

1. fluxo de criação de gift a partir de template publicado;
2. editor MVP;
3. viewer público;
4. checkout/publicação;
5. demo pública refinada e landing final baseada no produto real.

### Restrições atuais

- Não refinar visualmente a landing page sem pedido explícito.
- Não criar demo pública agora.
- Não criar editor drag-and-drop agora.
- Não criar checkout real ou integração com provider de pagamento agora.
- Não integrar Spotify, streaming ou hospedagem real de música.
- Não hardcodear templates ou temas finais no frontend.
- Não assumir que a landing atual é definitiva.
- Não avançar para editor visual completo, viewer público, demo pública ou checkout real sem solicitação explícita.
- Não criar demo pública a partir do fluxo de criação atual.
- Não tratar a tela inicial de rascunho como editor final.

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
- `checkout_pending`
- `paid_unpublished`
- `published`
- `disabled`
- `expired`
- `deleted`

Status de order:

- `pending`
- `paid`
- `cancelled`
- `expired`
- `refunded`

Status de payment:

- `pending`
- `approved`
- `rejected`
- `refunded`
- `cancelled`

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
      "type": "text",
      "slotKey": "main_title",
      "text": "Feliz aniversário",
      "x": 20,
      "y": 40,
      "w": 350,
      "h": 80,
      "rotation": 0,
      "z": 10,
      "style": {
        "fontToken": "title",
        "fontSize": 42,
        "color": "var(--primary)",
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

Upload de imagem:

1. Validar request.
2. Criar registro `gift_media`.
3. Salvar original.
4. Disparar job de processamento.
5. Gerar versão otimizada.
6. Gerar thumbnail.
7. Remover EXIF.
8. Atualizar status.
9. Permitir uso no canvas.

Nunca permitir que usuário associe mídia de outro gift.

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
