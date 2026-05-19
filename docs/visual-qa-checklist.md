# Checklist interno de QA visual/mobile

Use este roteiro para validar o produto com assets reais antes de avancar para gateway, landing final, mini games ou novos componentes interativos.

## Objetivo

Garantir que admin, editor, Gift para Template, viewer publico, Book Mode, envelope, polaroid, QR Code/cartao e performance mobile funcionam bem com material visual real.

## Antes do teste manual, rode a auditoria automatica

```bash
php artisan scrapbook:visual-audit
```

- `error`: corrija antes de produzir/publicar templates reais. Exemplos: URL externa no canvas, `assetId` inexistente, `mediaItemId` em template, pagina sem artboard ou background invalido.
- `warning`: revise antes do celular real. Exemplos: asset sem categoria, papel pequeno, tema sem `paper_texture` ou template visual sem placeholders.
- `info`: observacao de producao que nao bloqueia o QA manual. Exemplos: categoria vazia, tema sem textura opcional de fundo ou template ainda em rascunho.
- A auditoria nao altera banco, nao apaga dados, nao corrige automaticamente, nao faz upload e nao acessa URLs externas.

## Assets

- Subir stickers reais pelo admin.
- Usar PNG/WebP transparente para stickers; idealmente 512px ou 1024px no maior lado.
- Evitar imagem pequena esticada, fundo falso ou recorte com borda suja.
- Criar categorias claras: Corações, Fitas, Flores, Papeis, Texturas, Molduras, Envelopes, Selos, Etiquetas, Aniversario, Romance, Amizade, Vintage e Kraft.
- Conferir preview, dimensoes, MIME, tamanho e status ativo.
- Associar assets a tema quando forem parte da direcao de arte; deixar global somente o que for reutilizavel.

## Temas e texturas

- Escolher `paper_texture`, `background_texture` e `book_texture` quando houver assets reais.
- Para papeis, usar proporcao proxima de 1080x1350; ideal 1080x1350 ou 2160x2700.
- Usar JPG/WebP otimizado para papeis, fundos e texturas grandes.
- Evitar texturas com borda estranha, baixa resolucao ou arquivo gigante.
- Conferir papel, fundo externo, superficie do livro, lombada, overlays e sombras no editor e viewer.

## Editor

- Criar Gift-base a partir de template publicado.
- Montar paginas no editor usando texto, fotos, stickers, papel personalizado e camadas.
- Trocar papel pela aba Pagina e voltar para "Usar papel do tema".
- Adicionar stickers por categoria, mover, redimensionar, rotacionar, duplicar, ocultar, bloquear e ajustar z/camadas.
- Adicionar envelope, editar titulo/conteudo e validar autosave, undo e redo.
- Adicionar polaroid viravel, trocar foto pelo fluxo contextual e editar legenda, placeholder e verso.
- Recarregar a pagina e confirmar que autosave/localStorage nao perdem alteracoes.

## Editor mobile

- Topbar nao deve quebrar nem criar overflow horizontal.
- Abas Conteudo, Imagens, Adesivos, Elementos, Pagina e Camadas devem ser acessiveis.
- Canvas precisa continuar grande o suficiente para toque.
- Botoes principais devem ter area tocavel confortavel.
- Editar envelope/polaroid nao deve ficar impraticavel com teclado virtual.
- Painel de propriedades nao deve estourar largura.

## Template

- Converter Gift-base em Template pelo admin.
- Confirmar que `interactive_envelope` preserva titulo/conteudo como default editavel.
- Confirmar que `flip_polaroid` remove `mediaItemId`/`src` pessoais e vira placeholder seguro.
- Publicar `TemplateVersion` somente depois de revisar paginas, canvas seguro e editable schema.
- Criar Gift de cliente a partir do template publicado e revisar os placeholders.

## Viewer mobile

- Publicar Gift pelo fluxo atual.
- Abrir preview privado e viewer publico em celular real ou viewport mobile.
- Confirmar abertura bonita e Book Mode em pagina unica no mobile.
- Testar swipe para proxima/anterior.
- Abrir envelope sem trocar pagina acidentalmente.
- Virar polaroid sem trocar pagina acidentalmente.
- Confirmar que botoes, CTA discreto, progresso e estado final nao cobrem conteudo importante.

## Compartilhamento

- Abrir tela de compartilhamento do Gift publicado.
- Copiar link publico.
- Abrir/baixar QR Code.
- Abrir cartao compartilhavel.
- Confirmar que QR/cartao apontam para `/p/{slug}-{public_code}`.
- Confirmar que payload publico nao expoe `storage_path`, IDs internos, dados de pagamento ou URLs externas.

## Performance

- Testar com varias paginas, stickers, papeis e fotos reais.
- Verificar se listas de assets continuam navegaveis.
- Confirmar que imagens em listas carregam sob demanda.
- Evitar texturas grandes que travem celular.
- Conferir abertura, swipe, envelope, polaroid e QR em rede lenta quando possivel.

## Criterio de aprovacao

- O fluxo completo funciona com assets reais.
- Editor mobile nao tem overflow horizontal obvio.
- Viewer publico navega bem no celular.
- Envelope/polaroid nao conflitam com swipe.
- Gift para Template remove midia pessoal da polaroid.
- Payload publico continua seguro.
- Nenhuma feature grande nova foi criada.
