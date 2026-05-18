# Roadmap completo de implementação - Scrapbook digital

> Este documento é uma lista de execução em ordem recomendada. A ideia é você usar como backlog/todo técnico. Não precisa fazer tudo em uma sprint. O objetivo é evitar começar por uma parte bonita e depois descobrir que faltou base de segurança, banco, versionamento ou fluxo de pagamento.

## Status atual

- Landing v1 criada como rascunho inicial de branding/marketing, não como versão final do produto.
- Domínio e banco real implementados em `app/Domain`, com migrations, models, enums, relações, casts, policies, factories, seeders, actions prioritárias e testes de domínio.
- Admin inicial em Filament implementado para operar temas, templates, assets, planos, gifts, mídia, pedidos, pagamentos e analytics.
- Fluxo de criação inicial implementado: `/criar`, escolha de ocasião, escolha de template publicado, criação de `Gift` draft, cópia de páginas e dashboard simples.
- Autenticação real mínima implementada: login, cadastro, logout, role `customer`, proteção de `/app/*` e integração com criação/retomada de draft.
- Editor MVP implementado em `/app/gifts/{gift}/edit`, com seleção de páginas, preview, edição de textos existentes, metadados básicos e salvamento seguro de canvas.
- Upload/mídia básica no editor implementado, com upload seguro de imagens, `media_items`, biblioteca simples e aplicação em elementos `image` existentes.
- Viewer/preview do scrapbook implementado, com preview privado autenticado, viewer público por slug + `public_code`, navegação de páginas e mídia pública controlada.
- Revisão/publicação técnica MVP implementada, com checklist de requisitos mínimos.
- Checkout interno/publicação condicionada a pagamento implementado, com `Order`, `Payment`, provider manual/dev e publicação após aprovação.
- Artboard/canvas padronizado com `schemaVersion/version = 1`, `artboard` válido, `elements` como array e proporção padrão `1080x1350`.
- Fase atual: aprofundamento visual de temas e folhas, com `PageSurface`, textura CSS sem asset externo obrigatório, moldura de caderno/livro e seeds comparáveis de temas/templates.
- Próxima fase: redesign do editor e autosave simples/robusto.
- Depois: manipulação visual, camadas e stickers.
- Gateway externo real, QR Code, entrega, demo pública refinada e landing final ficam para etapas futuras.

## Nota técnica de ambiente

- O erro local de `npm run build` em `public/build/assets` ocorre quando o serviço `vite` do Docker escreve artefatos como `root`.
- O `compose.yaml` deve rodar o serviço `vite` com `${UID:-1000}:${GID:-1000}` para novos builds não recriarem artefatos root-owned.
- Se o diretório já estiver root-owned, a correção recomendada é uma limpeza pontual de `public/build` ou `chown` apenas nesse diretório ignorado pelo Git, nunca uma mudança ampla de permissão no projeto.
- A suíte PHPUnit usa PostgreSQL local em `127.0.0.1:5432`, alinhado ao `compose.yaml`. Se os testes recusarem conexão, suba o serviço com `docker compose up -d postgres` e confirme `docker compose ps`.

## Fase 0 — Branding, posicionamento e landing page

Esta fase gerou uma landing v1 como rascunho visual inicial. Ela não deve ser tratada como versão final, nem como referência definitiva do produto.

1. Definir branding visual.
2. Definir paleta.
3. Definir tom de voz.
4. Criar landing page.
5. Criar seção de demo interativa.
6. Criar showcase de templates.
7. Revisitar landing final somente depois que o produto real tiver fluxo validável.

## Fase 0.1 - Decisões congeladas antes de codar

1. Definir o nome provisório do projeto no repositório, mesmo que a marca mude depois.
2. Definir que o produto é um scrapbook digital mobile-first.
3. Definir que o usuário começa por ocasião e template.
4. Definir as ocasiões iniciais: amor/namoro, feliz aniversário, melhor amiga, aniversário de namoro.
5. Definir que templates e temas serão dinâmicos e versionados.
6. Definir que o presente copia a versão do template no momento da criação.
7. Definir que o editor salva páginas como JSON versionado.
8. Definir que o backend será Laravel.
9. Definir que o frontend será React + TypeScript.
10. Definir que a integração será Inertia.js, salvo se você decidir conscientemente por API separada.
11. Definir PostgreSQL como banco principal.
12. Definir Redis para filas/cache/rate limit.
13. Definir storage S3-compatible para produção.
14. Definir que o MVP terá pagamento por presente, não assinatura.
15. Definir que o usuário pode começar sem login, mas precisa logar antes de pagar/publicar.
16. Definir que link público terá slug bonito + token aleatório forte.
17. Definir que drafts abandonados expiram após 7 dias sem atividade.
18. Definir que presentes pagos terão expiração por plano.
19. Definir que o produto não prometerá armazenamento vitalício no início.
20. Definir que imagens serão reprocessadas e comprimidas.
21. Definir que não haverá vídeo no MVP.
22. Definir que música será metadata externo, não upload/streaming próprio de áudio protegido.
23. Definir que admin será Filament.
24. Definir que segurança é requisito de produto, não tarefa final.

## Detalhamento da Fase 0 — Branding, posicionamento e landing page

A landing v1 cumpriu o papel de explorar direção visual. A prioridade saiu de refinamento de marketing e voltou para backend, domínio, banco e admin.

## Etapas da fase 0

1. Definir conceito central da marca.
2. Definir público principal e secundário.
3. Definir tom de voz.
4. Definir estilo visual da marca.
5. Definir paleta de cores.
6. Definir sistema tipográfico.
7. Definir direção de mockups.
8. Definir estrutura da landing page.
9. Definir copy principal do hero.
10. Definir CTA principal e CTA secundário.
11. Definir seção de demo interativa como parte obrigatória da landing.
12. Definir estrutura das seções de templates e funcionalidades.
13. Definir prova social.
14. Definir FAQ.
15. Criar versão 1 da landing page.
16. Revisar a landing final com base em produto real, depois de fluxo, viewer e checkout estarem encaminhados.

## Regra de dependência

Não continuar refinando landing, demo pública ou front avançado sem solicitação explícita. A fundação de domínio/banco já foi criada; a dependência real agora é concluir e usar o admin inicial, depois avançar para o fluxo de criação de gift.

## Fase 1 - Repositório e ambiente

25. Criar repositório Git.
26. Criar `.editorconfig`.
27. Criar `.gitignore` adequado para Laravel/Node.
28. Criar projeto Laravel com React/TypeScript/Inertia.
29. Configurar Node/pnpm ou npm, escolhendo um gerenciador e mantendo padrão.
30. Configurar PostgreSQL local.
31. Configurar Redis local.
32. Criar `.env.example` completo.
33. Criar Docker Compose para desenvolvimento, se quiser padronizar ambiente.
34. Configurar Laravel Pint.
35. Configurar ESLint.
36. Configurar Prettier.
37. Configurar PHPStan/Larastan.
38. Configurar Pest ou PHPUnit.
39. Configurar scripts de `test`, `lint`, `format` e `analyse`.
40. Criar README técnico inicial.
41. Criar documentação `docs/architecture.md` apontando para este planejamento.
42. Criar branch principal protegida no futuro.
43. Criar pipeline CI simples, se usar GitHub Actions.
44. Configurar execução automática de testes no CI.
45. Configurar `composer audit` e `npm audit`/ferramenta equivalente no CI.

## Fase 2 - Base de segurança

46. Garantir que `APP_DEBUG=false` será obrigatório em produção.
47. Configurar cookies seguros para produção.
48. Configurar CSRF padrão.
49. Configurar rate limit global moderado.
50. Configurar rate limit específico para login.
51. Configurar rate limit específico para upload.
52. Configurar rate limit específico para busca de música.
53. Configurar rate limit específico para criação de drafts.
54. Configurar headers de segurança básicos.
55. Planejar Content Security Policy.
56. Bloquear indexação de viewer público por padrão com meta `noindex`.
57. Criar helper para hash de tokens públicos.
58. Criar gerador de tokens aleatórios fortes.
59. Criar padrão para mascarar logs sensíveis.
60. Criar middleware ou helper para capturar IP/user-agent de forma segura e com hash quando possível.
61. Criar política de não renderizar HTML vindo do usuário.
62. Criar testes básicos contra acesso indevido a recursos de outro usuário.
63. Criar checklist de segurança por rota.
64. Configurar Sentry/Flare somente quando perto do deploy.
65. Instalar Telescope apenas para ambiente local.

## Fase 3 - Modelagem inicial do banco

66. Criar migrations para `users`.
67. Criar migrations para `social_accounts`.
68. Criar migrations para `guest_sessions`.
69. Criar migrations para `magic_login_tokens`, se for usar login por link.
70. Criar migrations para `occasions`.
71. Criar migrations para `modules`.
72. Criar migrations para `themes`.
73. Criar migrations para `theme_versions`.
74. Criar migrations para `asset_categories`.
75. Criar migrations para `asset_packs`.
76. Criar migrations para `design_assets`.
77. Criar migrations para `templates`.
78. Criar migrations para `template_versions`.
79. Criar migrations para `template_pages`.
80. Criar migrations para `template_slots`.
81. Criar migrations para `plans`.
82. Criar migrations para `gifts`.
83. Criar migrations para `gift_pages`.
84. Criar migrations para `gift_media`.
85. Criar migrations para `media_variants`.
86. Criar migrations para `music_tracks`.
87. Criar migrations para `gift_music`.
88. Criar migrations para `orders`.
89. Criar migrations para `payments`.
90. Criar migrations para `payment_webhook_events`.
91. Criar migrations para `gift_delivery_assets`.
92. Criar migrations para `gift_events`.
93. Criar migrations para `gift_daily_metrics`.
94. Criar migrations para `admin_audit_logs`, se não usar somente pacote externo.
95. Criar todos os índices básicos.
96. Criar constraints de unicidade importantes.
97. Criar check constraints para status quando fizer sentido.
98. Criar enums PHP para status, mesmo se no banco usar string.
99. Criar seeders para ocasiões iniciais.
100. Criar seeders para módulos iniciais.
101. Criar seeders para planos iniciais.
102. Criar seeders para categorias de assets.

## Fase 4 - Modelos, policies e Form Requests

103. Criar modelos Eloquent principais.
104. Definir casts JSON para `array` ou DTOs nos modelos.
105. Definir casts de enum nos status.
106. Definir relacionamentos: User -> Gifts.
107. Definir relacionamentos: Occasion -> Templates.
108. Definir relacionamentos: Template -> TemplateVersions.
109. Definir relacionamentos: TemplateVersion -> TemplatePages.
110. Definir relacionamentos: Theme -> ThemeVersions.
111. Definir relacionamentos: Gift -> GiftPages.
112. Definir relacionamentos: Gift -> Media.
113. Definir relacionamentos: Gift -> Orders.
114. Criar `GiftPolicy`.
115. Criar `TemplatePolicy`.
116. Criar `ThemePolicy`.
117. Criar `MediaPolicy`.
118. Criar `OrderPolicy`.
119. Criar Form Request para criar draft.
120. Criar Form Request para atualizar gift.
121. Criar Form Request para atualizar página.
122. Criar Form Request para upload de imagem.
123. Criar Form Request para alterar tema.
124. Criar Form Request para criar order.
125. Criar Form Request para webhook, se aplicável.
126. Criar testes de policy para usuário dono e usuário não dono.

## Fase 5 - Autenticação e perfil

127. Implementar auth com starter kit.
128. Implementar login com Google, se for entrar no MVP.
129. Implementar login por e-mail/link mágico ou cadastro simples, se preferir.
130. Criar fluxo de visitante/guest session.
131. Criar endpoint para associar draft guest a usuário logado.
132. Criar dashboard básico do usuário.
133. Mostrar presentes por status no dashboard.
134. Mostrar presente em criação.
135. Mostrar presente aguardando pagamento.
136. Mostrar presente publicado.
137. Mostrar presente expirado.
138. Criar rota para excluir/desativar presente.
139. Criar testes de acesso ao dashboard.
140. Criar testes para não deixar usuário acessar gift de outro usuário.

## Fase 6 - Admin inicial

141. Instalar Filament.
142. Criar usuário admin.
143. Instalar Spatie Permission.
144. Criar roles: admin, support, customer.
145. Proteger painel admin por role.
146. Criar resource de `Occasion`.
147. Criar resource de `Module`.
148. Criar resource de `Theme`.
149. Criar resource de `ThemeVersion`.
150. Criar resource de `AssetCategory`.
151. Criar resource de `AssetPack`.
152. Criar resource de `DesignAsset`.
153. Criar resource de `Template`.
154. Criar resource de `TemplateVersion`.
155. Criar resource de `TemplatePage`.
156. Criar resource de `Plan`.
157. Criar resource de `Gift` somente leitura no começo.
158. Criar resource de `Order` somente leitura no começo.
159. Criar action admin para desativar gift.
160. Criar action admin para reativar gift, se fizer sentido.
161. Criar action admin para reprocessar mídia.
162. Criar tela admin de métricas básicas.
163. Criar logs administrativos para ações críticas.
164. Criar seed inicial de admin em ambiente local apenas.

## Fase 7 - Sistema de assets visuais

165. Definir tipos de asset: sticker, texture, frame, tape, paper, envelope, doodle.
166. Definir formato aceito para assets do sistema.
167. Criar upload admin de assets.
168. Criar thumbnails de assets.
169. Permitir tags nos assets.
170. Permitir associar assets a packs.
171. Permitir associar packs a temas.
172. Criar endpoint para listar assets disponíveis no editor.
173. Criar filtro por tema.
174. Criar opção de listar assets globais.
175. Criar cache de assets por tema.
176. Criar testes para assets desativados não aparecerem.

## Fase 8 - Sistema de temas

177. Definir contrato JSON de `theme_tokens`.
178. Criar primeiro tema: fofo/rosa.
179. Criar segundo tema: kraft/vintage.
180. Criar terceiro tema: premium/delicado.
181. Criar preview visual de tema no frontend.
182. Permitir trocar tema no editor.
183. Garantir que troca de tema não destrói layout.
184. Salvar tema escolhido no gift.
185. Criar regras para overrides de estilo do usuário.
186. Criar testes para troca de tema.
187. Criar botão no admin para publicar versão de tema.
188. Impedir edição destrutiva de theme_version publicada.
189. Criar duplicação de theme_version para nova versão draft.

## Fase 9 - Sistema de templates

Status: templates e temas versionados já existem e os seeds iniciais devem manter pelo menos três templates publicados, associados a temas diferentes, para validar troca visual sem hardcode no frontend.

190. Definir contrato JSON de `canvas_json`.
191. Definir contrato JSON de `editable_slots`.
192. Definir contrato JSON de `interaction_config`.
193. Criar primeiro template de amor/namoro.
194. Criar primeiro template de feliz aniversário.
195. Criar primeiro template de melhor amiga.
196. Criar primeiro template de aniversário de namoro.
197. Criar seeders com templates iniciais.
198. Criar action `CreateGiftFromTemplate`.
199. Ao criar gift, copiar template_pages para gift_pages.
200. Ao criar gift, copiar tema padrão.
201. Ao criar gift, preencher textos padrões.
202. Ao criar gift, criar pages com position correto.
203. Criar teste de criação de gift a partir de template.
204. Criar teste garantindo que alterar template depois não altera gift já criado.
205. Criar publicação de template_version.
206. Impedir edição destrutiva de template_version publicada.
207. Criar duplicação de template_version para novo draft.

## Fase 10 - Renderer do scrapbook

Status: renderer compartilhado já alimenta editor, preview privado e viewer público. A etapa atual aprofunda `ScrapbookStage`, `ScrapbookPageFrame`, `PageSurface`, `ThemedArtboard` e `CanvasElementLayer` para que a folha pareça papel/caderno artesanal, com textura, grão, manchas, desgaste de borda, encadernação e tokens reais de tema. Os seeds comparáveis atuais são `Kraft Vintage`, `Romance Delicado` e `Aniversário Fofo`, aplicados aos templates `Amor / Namoro`, `Feliz Aniversário` e `Melhor Amiga`.

208. Criar componente `ScrapbookRenderer`.
209. Criar componente `PageRenderer`.
210. Criar renderizador de elemento `text`.
211. Criar renderizador de elemento `image`.
212. Criar renderizador de elemento `sticker`.
213. Criar renderizador de elemento `shape` se precisar.
214. Criar renderizador de elemento `frame`.
215. Criar renderizador de elemento `paper`.
216. Implementar escala do artboard para viewport.
217. Implementar safe area.
218. Implementar z-index.
219. Implementar rotação.
220. Implementar opacity.
221. Implementar fonte por token de tema.
222. Implementar cor por token de tema.
223. Implementar background por asset ou cor.
224. Criar Storybook ou página interna de testes visuais, se quiser.
225. Garantir que editor e viewer usam o mesmo renderer.
226. Criar fallback quando asset/media não carregar.
227. Criar teste visual manual para mobile.
228. Criar teste visual manual para desktop.

## Fase 11 - Editor visual MVP

229. Criar página de editor.
230. Carregar gift e gift_pages.
231. Criar estado local do editor com Zustand.
232. Criar lista de páginas.
233. Criar canvas da página selecionada.
234. Permitir selecionar elemento.
235. Permitir mover elemento.
236. Permitir redimensionar elemento.
237. Permitir rotacionar elemento.
238. Permitir alterar z-index.
239. Permitir deletar elemento.
240. Permitir duplicar elemento.
241. Permitir editar texto.
242. Permitir adicionar sticker.
243. Permitir trocar imagem de slot.
244. Permitir mudar fundo/textura.
245. Permitir trocar moldura da imagem.
246. Permitir reordenar páginas.
247. Permitir ocultar/remover página.
248. Permitir adicionar página a partir de módulos permitidos.
249. Validar limites de plano/template mesmo no draft.
250. Criar autosave com debounce.
251. Criar indicador “salvando”.
252. Criar indicador “salvo”.
253. Criar indicador de erro de sincronização.
254. Criar botão de preview.
255. Criar preview em tempo real ao lado ou em modal.
256. Garantir mobile-first.
257. Criar modo de edição simplificado para celular.
258. Evitar menus gigantes no celular.
259. Testar edição com toque.
260. Testar edição com mouse.
261. Testar rotação/redimensionamento em telas pequenas.

## Fase 12 - Upload e processamento de fotos

262. Criar endpoint de upload.
263. Validar tamanho máximo.
264. Validar tipo real de imagem.
265. Aceitar apenas formatos definidos.
266. Criar registro `gift_media` com status uploaded.
267. Salvar arquivo original.
268. Disparar job `ProcessUploadedImage`.
269. Reprocessar imagem para webp/jpg otimizado.
270. Criar thumbnail.
271. Remover EXIF/metadados.
272. Salvar dimensões.
273. Atualizar status para ready.
274. Retornar media_id para frontend.
275. Bloquear uso de media que não pertence ao gift/usuário.
276. Implementar crop metadata no editor.
277. Aplicar filtro visual por tema no frontend ou gerar variante se necessário.
278. Criar limpeza de media não usada em drafts expirados.
279. Criar testes de upload válido.
280. Criar testes de upload inválido.
281. Criar testes de usuário tentando usar mídia de outro gift.

## Fase 13 - Módulos de página MVP

282. Implementar módulo Capa.
283. Implementar módulo Carta principal.
284. Implementar módulo Galeria de fotos.
285. Implementar módulo Música.
286. Implementar módulo Coisas que amo em você.
287. Implementar módulo Página de aniversário.
288. Implementar módulo Página de amizade.
289. Implementar módulo Mapa afetivo simples.
290. Implementar interações básicas: abrir item, revelar, ampliar foto.
291. Implementar virar página.
292. Implementar som de virar página como opcional.
293. Implementar som desligado por padrão ou respeitando autoplay policy.
294. Garantir que tudo funciona sem áudio.
295. Criar puzzle se couber no MVP.
296. Se puzzle atrasar, marcar como v2.

## Fase 14 - Música

297. Definir provider inicial de busca musical.
298. Criar abstração `MusicProvider`.
299. Criar endpoint de busca musical.
300. Criar cache de resultados em `music_tracks`.
301. Salvar música escolhida em `gift_music`.
302. Mostrar música de forma visualmente bonita no scrapbook.
303. Não prometer execução completa de faixa protegida.
304. Usar link externo/embed/preview somente quando permitido pelo provider.
305. Criar fallback se a música não puder tocar.
306. Criar rate limit da busca.
307. Criar tratamento de erro da API musical.

## Fase 15 - Viewer público

308. Criar rota pública `/p/{slugToken}`.
309. Extrair token do slug.
310. Hash do token e busca segura.
311. Validar gift publicado.
312. Validar expiração.
313. Validar que gift não está desativado.
314. Retornar 404 genérico quando não puder acessar.
315. Renderizar tela inicial “Você recebeu um presente”.
316. Renderizar capa.
317. Renderizar navegação de páginas.
318. Renderizar interações.
319. Renderizar botão discreto “criar o meu também”.
320. Adicionar meta `noindex`.
321. Adicionar Open Graph básico com cuidado para não vazar demais.
322. Registrar evento `opened`.
323. Registrar evento `page_viewed`.
324. Registrar evento de interação.
325. Agregar métricas de forma assíncrona.
326. Testar URL inválida.
327. Testar gift expirado.
328. Testar gift desativado.
329. Testar gift publicado.

## Fase 16 - Checkout e pagamento

Status: checkout interno sem gateway externo real implementado. A transição de produto é `draft -> pending_payment -> published`, com `Order pending`, `Payment approved` e provider `manual_dev` limitado a ambiente controlado. Gateway real continua fora da fase atual.

330. Criar seleção/uso de plano ativo. Implementado inicialmente via plano do Gift/fallback ativo.
331. Criar `CreateCheckoutOrder` action. Implementado.
332. Criar snapshot de preço no order. Implementado.
333. Criar checkout no provider. Implementado com abstração `PaymentProvider` e provider `manual_dev`.
334. Redirecionar ou mostrar QR Pix conforme provider. Pendente para gateway real; não implementar Pix fake.
335. Antes de sair para pagamento, forçar autosave final.
336. Garantir que usuário não perde draft ao voltar.
337. Criar webhook receiver. Pendente para provider real.
338. Verificar assinatura do webhook. Pendente para provider real.
339. Salvar webhook bruto em `payment_webhook_events`. Pendente para provider real.
340. Processar webhook em job. Pendente para provider real.
341. Garantir idempotência. Implementado no processamento interno aprovado.
342. Atualizar payment. Implementado no fluxo interno aprovado.
343. Atualizar order. Implementado no fluxo interno aprovado.
344. Atualizar gift para pago/liberado. Implementado publicando após pagamento aprovado.
345. Enviar notificação interna, se necessário.
346. Testar pagamento aprovado. Implementado para fluxo manual/dev.
347. Testar pagamento duplicado. Implementado via idempotência.
348. Testar webhook inválido. Pendente para provider real.
349. Testar order expirada.
350. Testar usuário tentando publicar sem pagar. Implementado.

## Fase 17 - Publicação

Status: publicação condicionada a pagamento aprovado implementada. A publicação técnica direta não deve burlar checkout; `POST /app/gifts/{gift}/publish` exige `Order paid` ou redireciona para checkout.

351. Criar ação `PublishGift`.
352. Validar owner.
353. Validar status pago ou plano gratuito, se existir. Implementado para `Order paid`.
354. Validar limites de fotos.
355. Validar limites de páginas.
356. Validar que não existem uploads pendentes obrigatórios.
357. Gerar public_slug.
358. Gerar public_token.
359. Salvar hash do token.
360. Definir published_at.
361. Definir expires_at conforme plano.
362. Gerar QR code.
363. Gerar card imprimível básico.
364. Mostrar link final ao usuário. Implementado após publicação.
365. Adicionar botão copiar link. Implementado na revisão quando publicado.
366. Adicionar botão baixar QR.
367. Adicionar botão baixar cartão.
368. Criar testes de publicação.

## Fase 18 - QR Code e cartão imprimível

369. Escolher biblioteca de QR code.
370. Criar serviço `QrCodeGenerator`.
371. Criar layout de cartão simples.
372. Criar cartão com tema do gift.
373. Gerar PNG do QR.
374. Gerar PDF ou PNG do cartão.
375. Salvar em `gift_delivery_assets`.
376. Permitir download pelo dono.
377. Permitir regenerar se tema/link mudar.
378. Testar download autorizado.
379. Testar acesso não autorizado.

## Fase 19 - Dashboard do usuário

380. Listar presentes.
381. Filtrar por status.
382. Mostrar thumbnail/capa.
383. Mostrar data de criação.
384. Mostrar status de pagamento.
385. Mostrar status publicado.
386. Mostrar se já foi visualizado.
387. Mostrar número básico de aberturas.
388. Botão continuar edição.
389. Botão copiar link.
390. Botão baixar QR.
391. Botão desativar.
392. Botão excluir.
393. Bloquear ações conforme status.
394. Criar testes de dashboard.

## Fase 20 - Analytics

395. Criar endpoint leve para eventos públicos.
396. Não armazenar dados pessoais desnecessários.
397. Hash de IP quando usar.
398. Criar job de agregação diária.
399. Criar painel do usuário com métricas simples.
400. Mostrar: abriu quantas vezes.
401. Mostrar: primeira visualização.
402. Mostrar: última visualização.
403. Mostrar: interações totais.
404. Criar painel admin com funil.
405. Métricas admin: drafts criados.
406. Métricas admin: checkout iniciado.
407. Métricas admin: pagamentos aprovados.
408. Métricas admin: presentes publicados.
409. Métricas admin: templates mais usados.
410. Métricas admin: temas mais usados.
411. Métricas admin: receita.
412. Métricas admin: falhas de pagamento.

## Fase 21 - Limpeza e expiração

413. Criar command `ExpireOldDrafts`.
414. Criar command `ExpirePaidGifts`.
415. Criar command `PurgeDeletedMedia`.
416. Agendar commands no scheduler.
417. Draft sem atividade por 7 dias vira expirado/deletável.
418. Gift pago vencido vira expired.
419. Media de draft expirado é removida após janela definida.
420. Media de gift deletado é removida após janela definida.
421. Registrar logs das limpezas.
422. Criar testes de expiração.

## Fase 22 - Admin avançado

423. Melhorar listagem de gifts.
424. Ver páginas do gift no admin.
425. Ver mídia do gift no admin.
426. Ver orders/payments do gift.
427. Ver eventos do gift.
428. Desativar gift por suporte.
429. Reativar gift por suporte.
430. Adicionar nota interna de suporte.
431. Ver webhooks recebidos.
432. Reprocessar webhook.
433. Reprocessar imagem.
434. Ver erros recentes.
435. Ver jobs falhos.
436. Link para Horizon.
437. Link para Pulse.
438. Criar permissões separadas entre admin e suporte.

## Fase 23 - Testes e qualidade

439. Testar criação de gift por template.
440. Testar autosave.
441. Testar reorder de páginas.
442. Testar upload.
443. Testar troca de tema.
444. Testar edição de elemento.
445. Testar publish.
446. Testar viewer público.
447. Testar pagamento fake/sandbox.
448. Testar webhook.
449. Testar permissões.
450. Testar rate limit.
451. Testar expiração de draft.
452. Testar expiração de presente pago.
453. Testar XSS básico em textos.
454. Testar tentativa de acessar mídia de outro gift.
455. Testar usuário tentando editar gift de outro usuário.
456. Testar admin sem permissão.
457. Testar mobile real.
458. Testar desktop real.
459. Testar internet lenta.
460. Testar upload grande.
461. Testar fechar navegador durante edição.
462. Testar voltar do pagamento sem perder draft.
463. Testar reload no editor.
464. Testar gift com foto faltando.
465. Testar gift com asset removido/desativado.

## Fase 24 - Performance

466. Otimizar imagens.
467. Usar lazy loading no viewer.
468. Carregar página atual e próxima primeiro.
469. Evitar baixar todos os assets da biblioteca no editor.
470. Paginar assets/stickers.
471. Cachear templates publicados.
472. Cachear temas publicados.
473. Cachear assets públicos.
474. Usar CDN para assets e mídia processada.
475. Reduzir bundle do viewer público.
476. Separar bundle do editor e do viewer.
477. Evitar bibliotecas pesadas no viewer se só são usadas no editor.
478. Medir LCP/CLS.
479. Medir tempo de upload.
480. Medir tempo de processamento de imagem.

## Fase 25 - Deploy de produção

481. Escolher hospedagem.
482. Configurar domínio.
483. Configurar HTTPS.
484. Configurar banco PostgreSQL gerenciado ou VPS segura.
485. Configurar Redis.
486. Configurar storage S3-compatible.
487. Configurar worker de queue.
488. Configurar scheduler.
489. Configurar backups do banco.
490. Configurar backups/retention do storage, se possível.
491. Configurar variáveis de ambiente.
492. Configurar logs.
493. Configurar monitoramento de erro.
494. Configurar healthcheck.
495. Configurar deploy automático.
496. Rodar migrations em produção.
497. Rodar seeders essenciais.
498. Criar usuário admin.
499. Testar fluxo completo em produção com pagamento sandbox ou valor baixo.
500. Fazer checklist final de segurança.

## Fase 26 - Lançamento inicial

501. Publicar landing simples.
502. Publicar poucos templates bem feitos.
503. Publicar poucos temas consistentes.
504. Criar demo pública.
505. Criar botão “criar meu scrapbook”.
506. Garantir que suporte/contato existe.
507. Adicionar termos de uso.
508. Adicionar política de privacidade simples.
509. Adicionar FAQ.
510. Adicionar explicação de expiração.
511. Adicionar explicação de privacidade do link.
512. Testar compra real.
513. Testar recebimento de pagamento real.
514. Testar publicação real.
515. Testar visualização real no celular.
516. Coletar feedback dos primeiros usuários.

## Fase 27 - Depois do MVP

517. Adicionar puzzle se não entrou no MVP.
518. Adicionar mais temas.
519. Adicionar mais templates por ocasião.
520. Adicionar template de mãe.
521. Adicionar template de formatura.
522. Adicionar template de pedido de desculpas.
523. Melhorar builder visual de templates no admin.
524. Permitir salvar blocos reutilizáveis.
525. Melhorar geração de card QR.
526. Adicionar mapa afetivo mais elaborado.
527. Adicionar interações novas.
528. Adicionar modo livro aberto no desktop.
529. Adicionar preview de compartilhamento mais bonito.
530. Adicionar testes E2E.
531. Adicionar sistema de feature flags.
532. Adicionar recuperação de gift por e-mail.
533. Adicionar renovação de presente expirado.
534. Adicionar plano para quem cria muitos presentes.
535. Adicionar IA só depois que o fluxo principal estiver validado.

## Critério de MVP vendável

O MVP está vendável quando alguém consegue:

1. abrir a landing;
2. escolher ocasião;
3. escolher template;
4. editar textos/fotos;
5. ver preview bonito;
6. salvar sem perder progresso;
7. pagar;
8. publicar;
9. compartilhar link;
10. a pessoa presenteada abrir no celular e ter uma experiência bonita.

Todo o resto é melhoria.
