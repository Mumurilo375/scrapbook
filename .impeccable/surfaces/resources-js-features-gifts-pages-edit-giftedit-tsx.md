---
version: 1
slug: 'resources-js-features-gifts-pages-edit-giftedit-tsx'
primary_target: 'resources/js/features/gifts/pages/Edit/GiftEdit.tsx'
related_targets:
    - 'resources/js/features/gifts/components/editor/GiftEditorLayout.tsx'
    - 'resources/js/features/gifts/components/editor/GiftEditorTopBar.tsx'
    - 'resources/js/features/gifts/components/editor/GiftPagePreview.tsx'
    - 'resources/js/features/gifts/components/editor/GiftPageSidebar.tsx'
    - 'resources/js/features/gifts/components/editor/EditorTabs.tsx'
---

# Editor principal

- **Scope and mode:** redesign integral de `GiftEdit`; modo Operate. Esta superfície é a expressão vinculante do “Ateliê do Álbum Aberto” e estabelece a base visual reutilizável para o restante do produto.
- **Audience, job, and outcome:** pessoas iniciantes criando um presente romântico, frequentemente pelo celular e com pouco tempo. O caminho principal é escolher um layout pronto, preencher fotos e mensagens, fazer pequenos ajustes e chegar a um resultado bonito sem conhecimento de design.
- **Content and proof:** o álbum renderizado é a prova. A página ativa e a vizinha são páginas reais, e as miniaturas da faixa inferior usam o mesmo conteúdo; fotos, textos, adesivos, elementos interativos, papel, camadas, metadados, preview, autosave, histórico, estados offline/erro e revisão permanecem acessíveis.
- **Chosen direction:** “Ateliê do Álbum Aberto”, síntese literal das três referências aprovadas. Tecido berinjela enquadra uma bancada lavanda; um álbum físico aberto de duas páginas, papel algodão, pilhas desalinhadas, lombada, argolas, foliação e canto virado domina o palco; o inspector branco integral permanece encaixado à direita. A barra organiza o percurso real em Layout, Preencher, Decorar e Ajustar.
- **Memorable moment:** o presente deixa de ser uma folha isolada e aparece como livro aberto fotografável; a página vizinha real pode ser selecionada diretamente, enquanto lombada, ferragens, textura e dobra mantêm a sensação de objeto encadernado.
- **Responsive behavior:** desktop reserva o palco maior para o álbum aberto, mantém a faixa inferior horizontal com miniaturas vivas e faz o inspector branco ocupar toda a altura à direita. Abaixo de 1024px, o palco mostra uma única folha legível e as mesmas ferramentas entram em uma gaveta inferior recolhível de até 82dvh, com paridade funcional completa.
- **Constraints:** React/Inertia/Tailwind, português brasileiro, sem alterações destrutivas no backend, acessível por teclado e toque, reduced motion, estados reais de autosave e recuperação local, capacidades atuais preservadas.
- **Capability boundary:** o backend atual não expõe troca persistente de layout, tema ou música neste editor. A interface não simula essas operações; papel de página e todas as mutações já suportadas permanecem reais.
