---
name: Scrapbook
description: Um ateliê digital que transforma fotos e palavras em um álbum aberto, tátil e pronto para presentear.
colors:
  bookcloth-ink: "#181024"
  bookcloth-raised: "#281D36"
  plum-rule: "#4B3D59"
  lavender-worktable: "#E5DDED"
  lavender-grid: "#C9BAD8"
  cotton-paper: "#FBF7ED"
  paper-shadow: "#CFC1AE"
  coral-action: "#FF705F"
  coral-deep: "#D95045"
  graphite-print: "#292331"
  pencil-copy: "#6F6877"
  proof-white: "#FFFFFF"
  success-sage: "#73A58E"
  warning-ochre: "#B8792E"
  error-carmine: "#C8444B"
  leather-wine: "#43283D"
  kraft-tape: "#C9A779"
  memory-lilac: "#A98BC4"
typography:
  display:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 4vw, 4.5rem)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Atkinson Hyperlegible, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Atkinson Hyperlegible, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.1em"
  micro:
    fontFamily: "Atkinson Hyperlegible, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.625rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.12em"
  handwriting:
    fontFamily: "Caveat, cursive"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.3
rounded:
  paper: "3px"
  control: "4px"
  field: "6px"
  notice: "10px"
  album: "20px"
  drawer: "18px"
  full: "999px"
spacing:
  xxs: "4px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.coral-action}"
    textColor: "{colors.bookcloth-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "44px"
  button-secondary:
    backgroundColor: "{colors.bookcloth-ink}"
    textColor: "{colors.proof-white}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "44px"
  input:
    backgroundColor: "{colors.proof-white}"
    textColor: "{colors.graphite-print}"
    typography: "{typography.body}"
    rounded: "{rounded.field}"
    padding: "12px"
    height: "44px"
  inspector:
    backgroundColor: "{colors.proof-white}"
    textColor: "{colors.graphite-print}"
    typography: "{typography.body}"
    rounded: "{rounded.paper}"
    padding: "18px"
  filmstrip-selected:
    backgroundColor: "{colors.cotton-paper}"
    textColor: "{colors.bookcloth-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.paper}"
    padding: "8px"
---

# Design System: Scrapbook

## Overview

**Creative North Star: "Ateliê do Álbum Aberto"**

O produto acontece sobre uma bancada contemporânea de encadernação. A interface escura e precisa enquadra um álbum aberto de algodão, tecido, couro e metal; o presente é sempre o maior, mais iluminado e mais detalhado objeto da tela. O resultado deve parecer fotografável antes de parecer configurável.

As três referências aprovadas são vinculantes: barra berinjela com etapas, bancada lavanda, caderno físico aberto, faixa de páginas e inspector branco contextual. O caminho principal leva uma pessoa iniciante por Layout, Preencher, Decorar e Ajustar usando composições prontas; liberdade aparece como refinamento progressivo, não como obrigação de inventar.

**Key Characteristics:**

- Álbum aberto real, com duas folhas, pilha, lombada, ferragens, dobra e sombra de contato.
- Abertura, leitura e encerramento usam o mesmo objeto físico do editor, não uma moldura genérica.
- Chrome sóbrio em tecido berinjela, lavanda de bancada, branco de prova e coral de conclusão.
- Inspetor contínuo e funcional; miniaturas mostram páginas reais, não placeholders.
- Materialidade concentrada no presente e em objetos que representam papel, foto ou tecido.
- Templates contam uma pequena história pronta e emocional; cada página tem uma hierarquia dominante e respiro.
- Mesmas capacidades no desktop e no celular, reorganizadas para cada espaço.

## Colors

A paleta cria contraste entre a oficina fria e o presente quente sem competir com os temas das páginas.

### Primary

- **Tecido Berinjela** (`#181024`): barra superior, faixa de páginas e estruturas de ferramenta.
- **Coral de Conclusão** (`#FF705F`): única ação conclusiva, seleção e pequenos carimbos de atenção.

### Secondary

- **Bancada Lavanda** (`#E5DDED`): área de trabalho ao redor do álbum.
- **Algodão Natural** (`#FBF7ED`): folhas, bilhetes e superfícies que representam papel.
- **Lilás de Memória** (`#A98BC4`): detalhe editorial secundário, progresso concluído e materiais de página.

### Tertiary

- **Sálvia de Confirmação** (`#73A58E`): salvo e sucesso.
- **Ocre de Atenção** (`#B8792E`): rascunho e aviso.
- **Carmim de Erro** (`#C8444B`): falha que exige ação.

### Neutral

- **Grafite de Impressão** (`#292331`): texto principal.
- **Lápis de Apoio** (`#6F6877`): instrução e texto secundário.
- **Branco de Prova** (`#FFFFFF`): inspector e controles.
- **Linha Ameixa** (`#4B3D59`): divisões sobre superfícies escuras.

### Named Rules

**The Gift Owns the Warmth Rule.** Kraft, couro, fita e papel quente pertencem ao presente; controles permanecem berinjela, branco, lavanda e coral.

**The Coral Is a Conclusion Rule.** Coral marca seleção e a ação que conclui o fluxo. Não o use para decorar containers.

## Typography

**Display Font:** Bricolage Grotesque (with ui-sans-serif fallback)  
**Body Font:** Atkinson Hyperlegible (with system sans-serif fallback)  
**Handwritten Accent:** Caveat (inside scrapbook content only)

**Character:** Bricolage dá voz editorial firme e contemporânea; Atkinson mantém controles e instruções inequívocos. Caveat pertence à memória escrita sobre o papel.

### Hierarchy

- **Display** (700, fluid, 1): títulos de marketing e momentos de entrada.
- **Title** (700, 18px, 1.2): projeto, painel e grupo principal.
- **Body** (400–700, 14px, 1.5): instrução, edição e feedback.
- **Label** (700, 11px, 0.1em): etapas, números, status e metadados curtos.
- **Micro** (700, 10px, 0.12em): foliação, selo, progresso e legenda dentro de miniaturas; nunca texto de ação.
- **Handwriting** (600, theme-controlled): voz afetiva dentro das páginas.

### Named Rules

**The Handwriting Is a Memory Rule.** Caveat nunca aparece em botão, menu, status, formulário ou instrução da interface.

## Layout

No desktop, a barra de 72px contém identidade, quatro etapas e ações reais. Abaixo dela, o inspector branco ocupa 366–410px na lateral direita e toda a altura disponível. O restante divide-se entre o palco lavanda e uma faixa inferior de páginas de 148px. O álbum usa até 1320px e cresce pelo espaço e pela altura disponível sem ser cortado.

Abaixo de 1200px, a barra pode usar duas linhas para preservar alvos e rótulos. Abaixo de 1024px, a faixa continua horizontal, o palco mostra uma folha em escala legível e as mesmas ferramentas entram em uma gaveta inferior de até 82dvh. A largura mínima é 320px, sem overflow horizontal.

O ritmo segue 4px. Controles têm 44px; divisões internas usam 12–18px; ambientes usam 24–32px. A grade de corte só existe na bancada, nunca sobre o inspector ou texto.

## Elevation & Depth

Profundidade é física. A capa recebe tecido e sombra ampla; as folhas têm pilhas desalinhadas, bordas quentes, pressão de lombada e sombra de contato. Fotografias e fitas elevam-se dentro do renderer. O chrome é plano e separado por campo de cor, linha e encaixe.

### Shadow Vocabulary

- **Barra ancorada** (`0 4px 18px rgba(16, 8, 24, 0.22)`): separa navegação e bancada.
- **Inspector encaixado** (`-12px 0 26px rgba(39, 25, 49, 0.08)`): cria a junta lateral.
- **Capa do álbum** (`0 28px 54px rgba(35, 22, 42, 0.28)`): volume principal.
- **Pilha de papel** (`0 5px 0 #D7CAB7, 0 10px 0 #C8B79F`): espessura visível de folhas.
- **Foto e recorte**: sombras locais pertencem ao tema e nunca migram para campos de formulário.

### Named Rules

**The Honest Material Rule.** Só algo que poderia levantar da bancada recebe sombra física.

**The Same Gift Everywhere Rule.** Editor, prévia privada e link publicado representam o mesmo álbum, com as mesmas proporções, materiais e páginas.

**The Curated Before Creative Rule.** O primeiro resultado bonito vem do template; personalização é uma camada posterior, nunca um requisito para organizar a página.

## Shapes

Controles usam 4–6px; o inspector é essencialmente reto; avisos chegam a 10px. O álbum usa 18–28px apenas na capa e irregularidade controlada nas folhas. Papel pode ter clip-path sutil, canto virado, rasgo e rotação mínima, desde que a área interativa permaneça retangular e previsível. Círculos ficam reservados a ferragens, progresso e controles icon-only.

## Components

### Buttons

- **Shape:** 44px de altura, raio de 4px e rótulo 700.
- **Primary:** Coral de Conclusão sobre Tecido Berinjela, com linha inferior mais escura.
- **Secondary:** berinjela ou transparente com borda ameixa.
- **Hover / Focus:** mudança curta de cor e deslocamento máximo de 1px; foco visível Coral de 3px.

### Inputs / Fields

- **Style:** Branco de Prova, borda lilás-cinza, raio de 6px e pelo menos 44px.
- **Focus:** borda berinjela e anel tonal; o rótulo permanece visível.
- **Error / Disabled:** mensagem explícita em Carmim; desabilitado preserva leitura e não simula ação.

### Navigation

A barra superior transforma Layout, Preencher, Decorar e Ajustar em botões reais ligados aos painéis existentes. A faixa inferior usa miniaturas vivas, número, nome, visibilidade, bloqueio e estado de salvamento. As abas do inspector ocupam uma coluna berinjela; a ativa vira uma folha branca encaixada no painel.

### Cards / Containers

O produto não é uma grade de cartões flutuantes. Inspector, faixa, palco e barra são ambientes contínuos. Cards só representam templates, ocasiões, pedidos ou objetos físicos; usam borda, alinhamento e material antes de raio e sombra.

### Open Album

O álbum mostra a página ativa e a vizinha real. Clicar na vizinha a seleciona. Capa de tecido, duas pilhas de papel, sombra de lombada, quatro argolas, foliação e canto virado permanecem decorativos e não bloqueiam elementos editáveis.

### Scrapbook Materials

As folhas usam a textura raster `cotton-paper-fibers-v2.webp` como base de baixo contraste. Fotos recebem moldura de algodão irregular; bilhetes e etiquetas usam rasgo ou corte imperfeito; fita é translúcida ou kraft; metal tem brilho local; flores e tinta não recebem containers artificiais. Recortes podem girar poucos graus, mas não usam rotação aleatória que prejudique composição ou leitura.

### Ready-made Templates

Cada template entregue deve funcionar antes do usuário trocar qualquer conteúdo. A sequência mínima é começo, lembrança íntima, galeria, declaração e encerramento. Uma página tem no máximo um foco tipográfico, um foco fotográfico e dois ou três apoios materiais. Texto emocional curto substitui blocos genéricos, e elementos repetidos mantêm um vocabulário visual coerente.

### Gift Viewer

O presente publicado e a prévia privada compartilham capa fechada, álbum aberto, miolo, lombada, argolas, folhas empilhadas, foliação e encerramento. A bancada envolve o objeto sem disputar atenção. No celular, o spread vira uma página por vez e preserva proporção, textura, controles, teclado, toque e progresso.

### Mobile Tool Drawer

Fechada, a gaveta ocupa 58px e expõe nome e `aria-expanded`. Aberta, alcança no máximo 82dvh, tem rolagem própria, abas horizontais e todas as capacidades do desktop.

## Do's and Don'ts

### Do:

- **Do** manter o álbum maior e mais detalhado que qualquer painel.
- **Do** partir de layouts e temas prontos para entregar beleza imediata a iniciantes.
- **Do** mostrar páginas e estados reais em qualquer miniatura.
- **Do** preservar edição, autosave, histórico, erros, offline, teclado, toque e reduced motion.
- **Do** usar textura em tecido, papel e fotografia, com contraste suficiente.
- **Do** usar recortes que poderiam existir em um scrapbook real: flores prensadas, fita, bilhetes, selos, filme, clipes, tinta e papel rasgado.
- **Do** validar abertura, páginas e encerramento nos modos privado e publicado.

### Don't:

- **Don't** voltar à folha isolada dentro de um dashboard genérico.
- **Don't** substituir o conteúdo real por uma montagem decorativa falsa.
- **Don't** transformar todo container em cartão arredondado.
- **Don't** usar papel bege como fundo universal da aplicação.
- **Don't** esconder funções no celular; reorganize-as.
- **Don't** usar ícones vetoriais lisos como decoração final quando o elemento representa um objeto artesanal.
- **Don't** preencher uma página com vários focos equivalentes ou textos emocionais competindo entre si.
