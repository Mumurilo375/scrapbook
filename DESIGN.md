---
name: Scrapbook
description: Uma bancada editorial para montar presentes que parecem álbuns feitos à mão.
colors:
    aubergine-ink: '#21162D'
    aubergine-raised: '#2A1D36'
    mineral-workbench: '#EFEBF3'
    album-paper: '#FBFAF6'
    coral-stamp: '#FF765B'
    print-graphite: '#342E38'
    cool-pencil: '#746D78'
    registration-rule: '#C9C1CD'
    confirmation-pine: '#357263'
    attention-ochre: '#B86C22'
  error-carmine: '#C63C43'
  proof-white: '#FFFFFF'
  artifact-shadow-brown: '#3A2418'
  artifact-ink: '#221C19'
  artifact-gold: '#BD8558'
  artifact-paper-warm: '#FFF7EE'
  artifact-kraft-light: '#B78D5C'
  artifact-stain: '#7B5A43'
  artifact-wine: '#8E2F2F'
  artifact-leaf: '#6E7C4F'
  artifact-mauve: '#4C2630'
  artifact-leather: '#8B5E3C'
  artifact-fold: '#E8E1D7'
typography:
    display:
        fontFamily: 'Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif'
        fontSize: '1.125rem'
        fontWeight: 700
        lineHeight: 1.2
        letterSpacing: '-0.01em'
    title:
        fontFamily: 'Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif'
        fontSize: '1rem'
        fontWeight: 700
        lineHeight: 1.25
    body:
        fontFamily: 'Atkinson Hyperlegible, ui-sans-serif, system-ui, sans-serif'
        fontSize: '0.875rem'
        fontWeight: 400
        lineHeight: 1.5
  label:
        fontFamily: 'Atkinson Hyperlegible, ui-sans-serif, system-ui, sans-serif'
        fontSize: '0.6875rem'
        fontWeight: 700
    lineHeight: 1.2
    letterSpacing: '0.12em'
  caption:
    fontFamily: 'Atkinson Hyperlegible, ui-sans-serif, system-ui, sans-serif'
    fontSize: '0.75rem'
    fontWeight: 700
    lineHeight: 1.3
  overline:
    fontFamily: 'Atkinson Hyperlegible, ui-sans-serif, system-ui, sans-serif'
    fontSize: '0.625rem'
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: '0.12em'
    handwriting:
        fontFamily: 'Caveat, cursive'
        fontSize: '1rem'
        fontWeight: 600
        lineHeight: 1.3
rounded:
    clipped: '4px'
    control: '5px'
    field: '6px'
  notice: '10px'
  turn: '12px'
  canvas: '14px'
  panel: '16px'
  sheet: '22px'
  full: '999px'
spacing:
    xxs: '4px'
    xs: '8px'
    sm: '12px'
    md: '16px'
    lg: '24px'
    xl: '32px'
components:
    button-primary:
        backgroundColor: '{colors.coral-stamp}'
        textColor: '{colors.aubergine-ink}'
        typography: '{typography.body}'
        rounded: '{rounded.control}'
        padding: '0 12px'
        height: '40px'
    button-utility:
        backgroundColor: '{colors.aubergine-raised}'
        textColor: '{colors.album-paper}'
        typography: '{typography.body}'
        rounded: '{rounded.control}'
        padding: '0 12px'
        height: '40px'
    input:
        backgroundColor: '{colors.proof-white}'
        textColor: '{colors.print-graphite}'
        typography: '{typography.body}'
        rounded: '{rounded.field}'
        padding: '12px'
        height: '44px'
    binder-tab-active:
        backgroundColor: '{colors.aubergine-ink}'
        textColor: '{colors.album-paper}'
        typography: '{typography.label}'
        rounded: '{rounded.clipped}'
        padding: '6px'
        height: '48px'
    page-ticket-active:
        backgroundColor: '{colors.album-paper}'
        textColor: '{colors.aubergine-ink}'
        typography: '{typography.body}'
        rounded: '{rounded.clipped}'
        padding: '8px 10px'
        height: '76px'
    tool-panel:
        backgroundColor: '{colors.album-paper}'
        textColor: '{colors.print-graphite}'
        typography: '{typography.body}'
        rounded: '{rounded.panel}'
        padding: '16px'
---

# Design System: Scrapbook

## Overview

**Creative North Star: "Álbum de Coleção Afetiva"**

O sistema visual nasce dos álbuns brasileiros de coleção, cadernos de lembranças e estojos de papelaria bem usados. A interface é a bancada organizada ao redor do presente: precisa, legível e discreta. O scrapbook é a peça expressiva — com folhas empilhadas, fibra, recortes, fita, lombada, volume e marcas de manuseio — enquanto o chrome evita competir com ele.

A personalidade é gráfica, tátil e adulta. Numeração editorial, abas recortadas, marcas de registro e pequenas etiquetas dão ritmo sem transformar o produto em jogo. O movimento vem do mundo físico: páginas viram, folhas assentam e painéis deslizam como divisórias de um fichário.

O caminho principal atende iniciantes: layouts prontos carregam a composição e cada área de edição explica o próximo gesto. Liberdade existe como ajuste progressivo; nunca como uma tela vazia que exige repertório visual.

**Key Characteristics:**

- O presente permanece o maior e mais rico objeto da interface.
- A criação é guiada por layouts prontos e espaços reconhecíveis para preencher.
- Matéria aparece onde existe matéria: papel, fotografia, tecido, fita e encadernação.
- A interface usa contraste e tipografia de ferramenta; ornamento pertence ao conteúdo.
- Desktop e celular oferecem as mesmas capacidades com composições diferentes.

## Colors

A paleta mantém o chrome frio e restrito para que cada tema possa ser exuberante dentro do presente.

### Primary

- **Tinta de Berinjela:** estrutura global, navegação, texto de alta ênfase e fundos de ferramentas.
- **Carimbo Coral:** ação principal, seleção e marcas editoriais raras.

### Secondary

- **Bancada Lavanda Mineral:** campo de trabalho que separa a interface do papel.
- **Folha de Álbum:** superfícies físicas do presente e áreas de escrita, nunca o fundo indiscriminado da aplicação.
- **Materiais do Artefato:** uma família terrosa de tinta, kraft, couro, ouro gasto, mancha, vinho, folha e dobra sustenta receitas de textura dentro do renderer. Ela não migra para controles.

### Tertiary

- **Pinho de Confirmação:** sucesso, salvo e estados positivos.
- **Ocre de Atenção:** avisos, rascunhos locais e atenção sem alarme.
- **Carmim de Erro:** falhas destrutivas ou de salvamento que exigem ação.

### Neutral

- **Grafite de Impressão:** texto corrido.
- **Lápis Frio:** texto secundário e instruções.
- **Linha de Registro:** divisores, contornos técnicos e campos.
- **Branco de Prova:** controles e contraste limpo.

### Named Rules

**The Artifact Owns Color Rule.** Temas podem ser exuberantes dentro do presente; o chrome mantém Tinta de Berinjela, Bancada Lavanda e um único Carimbo Coral.

**The Paper Is Precious Rule.** Folha de Álbum representa papel real ou escrita. Não cubra a aplicação inteira com bege, creme ou textura.

## Typography

**Display Font:** Bricolage Grotesque (with ui-sans-serif fallback)  
**Body Font:** Atkinson Hyperlegible (with system sans-serif fallback)  
**Handwritten Accent:** Caveat (only inside scrapbook content)

**Character:** Bricolage Grotesque traz recorte editorial e personalidade para títulos curtos. Atkinson Hyperlegible mantém instruções e controles inequívocos. A letra manual é conteúdo do presente, nunca fonte de interface.

### Hierarchy

- **Display** (700, 18px, 1.2): nomes do presente, ambiente de ferramenta e cabeçalhos de maior ênfase.
- **Title** (700, 16px, 1.25): páginas, grupos e títulos de painel.
- **Body** (400–700, 14px, 1.5): instruções, conteúdo, botões e feedback.
- **Label** (700, 11px, 0.12em, uppercase sparingly): número de coleção, estado e metadados curtos.
- **Handwriting** (600, theme-controlled): voz da pessoa dentro do scrapbook.

### Named Rules

**The Handwriting Is a Memory Rule.** Caveat só aparece como voz da pessoa dentro da folha; nunca em botões, menus, status ou instruções.

## Layout

O editor amplo divide a bancada em três ambientes: fita de páginas à esquerda (214px), palco fluido ao centro e fichário de ferramentas à direita (368px). Em telas muito largas, as laterais crescem para 236px e 404px; o presente absorve todo o espaço central restante e chega a 980px sem perder sua proporção.

A partir de 1024px, páginas e ferramentas permanecem fixas enquanto a folha pode continuar verticalmente. Abaixo desse ponto, a fita vira um filme horizontal e o palco ocupa a largura. As ferramentas tornam-se uma gaveta inferior recolhível de 58px, expandindo até 76dvh sem retirar funções ou reduzir permanentemente o scrapbook.

O ritmo usa múltiplos de 4px, com 8–16px dentro de controles e 24–32px entre ambientes. O canvas é o único campo com grade técnica; o restante usa blocos tonais e divisores. A largura mínima suportada é 320px e o documento nunca cria overflow horizontal.

## Elevation & Depth

Profundidade é estrutural, não cosmética. Folhas têm pilha, borda, sombra de contato e luz de dobra; fotos e recortes têm espessura própria. O chrome é majoritariamente plano e separado por campos de cor, bordas e encaixes.

### Shadow Vocabulary

- **Barra ancorada** (`0 4px 16px rgba(18, 10, 25, 0.14)`): separa apenas a navegação fixa.
- **Canvas ambiente** (`0 18px 50px rgba(33, 22, 45, 0.08)`): dá campo ao objeto central sem fazê-lo flutuar.
- **Painel encaixado** (`0 14px 32px rgba(11, 6, 17, 0.24)`): aparece somente na folha clara inserida no fichário escuro.
- **Gaveta móvel** (`0 -14px 38px rgba(33, 22, 45, 0.16)`): comunica uma folha que sobe da base.
- **Contato de papel** (`drop-shadow(0 20px 20px rgba(33, 22, 45, 0.12))`): pertence à pilha física do scrapbook.

### Named Rules

**The Honest Material Rule.** Só objetos que poderiam levantar da bancada recebem sombra física. Painéis de interface usam contraste, linha e posição.

## Shapes

Controles são compactos e quase retos, com 4–6px de raio. Avisos usam 10px, o canvas 14px, painéis 16px e somente a gaveta móvel chega a 22px. A hierarquia de raio acompanha a escala do objeto, não uma preferência universal por arredondamento.

Abas, marcadores de página e ações principais podem usar silhuetas de etiqueta ou ticket com um canto recortado. Papéis usam assimetria controlada, bordas imperfeitas, cantos dobrados e sobreposição; a irregularidade nunca altera área de toque, leitura ou alinhamento de controles. Círculos ficam reservados a alças de encadernação, indicadores pequenos e controles icon-only.

## Components

### Buttons

- **Shape:** etiquetas compactas com raio de 5px e altura mínima de 40px.
- **Primary:** Carimbo Coral sobre Tinta de Berinjela, linha interna inferior mais escura e peso 700; uma ação conclusiva por contexto.
- **Utility:** superfície Berinjela Elevada com texto Folha de Álbum e borda tonal.
- **Hover / Focus:** mudança curta de cor; foco visível com contorno Coral de 3px e offset de 3px.

### Inputs / Fields

- **Style:** Branco de Prova, borda Linha de Registro, raio de 6px, texto Grafite e pelo menos 44px de altura.
- **Focus:** borda Tinta de Berinjela e anel tonal discreto; nunca remover o foco sem substituição.
- **Error / Disabled:** Carmim identifica erro com texto explicativo; desabilitado reduz contraste, preserva rótulo e não simula interatividade.

### Navigation

Abas de fichário usam um canto superior recortado, ícone acima do rótulo e estado ativo Berinjela com linha Coral. A fita de páginas usa tickets numerados, estado selecionado claro com deslocamento Coral e status reais de visibilidade, bloqueio e salvamento. No celular, ambas permanecem roláveis por toque e as ações superiores preservam seus nomes acessíveis quando exibem apenas ícones.

### Cards / Containers

Containers de interface não formam uma grade de cartões flutuantes. A folha de ferramenta é clara e encaixada no fichário, com 16px de raio e 16px de padding. Grupos internos preferem linha, alinhamento e mudança tonal; miniaturas só recebem volume quando representam papel, foto ou adesivo físico.

### Scrapbook Artifact

O objeto central combina capa, lombada, furos, folhas levemente rotacionadas, textura temática, sombra de contato, dobra inferior e marcas de registro externas. Trocar de página dispara um assentamento de 360ms com origem próxima à encadernação. Em `prefers-reduced-motion`, a página muda sem animação.

### Mobile Tool Drawer

A gaveta permanece fixa na base com um puxador, rótulo explícito e `aria-expanded`. Fechada, ocupa 58px; aberta, alcança no máximo 76dvh, contém rolagem própria e não aprisiona a rolagem do documento.

## Do's and Don'ts

### Do:

- **Do** manter o scrapbook maior, mais iluminado e mais detalhado que qualquer painel.
- **Do** usar layouts prontos como caminho principal e edição livre como ajuste progressivo.
- **Do** diferenciar interface, fotografia, papel, fita e tecido por material e comportamento.
- **Do** preservar affordances familiares e alvos de toque generosos em qualquer composição.
- **Do** reduzir movimento quando solicitado sem esconder conteúdo ou estado.

### Don't:

- **Don't** recriar o antigo mundo creme, serifado e vermelho em uma versão apenas mais polida.
- **Don't** transformar cada container em cartão arredondado flutuante.
- **Don't** usar pontos, medalhas, mascotes ou recompensas para simular progresso.
- **Don't** aplicar textura sobre texto pequeno, controles ou áreas que precisam de precisão.
- **Don't** esconder funções no celular; reorganize-as em ambientes próprios.
