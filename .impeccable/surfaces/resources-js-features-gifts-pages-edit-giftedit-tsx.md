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

- **Scope and mode:** redesign integral de `GiftEdit`; modo Operate. É a primeira expressão do novo sistema visual e deve estabelecer a base reutilizável para o restante do produto.
- **Audience, job, and outcome:** pessoas iniciantes criando um presente romântico, frequentemente pelo celular e com pouco tempo. O caminho principal é escolher um layout pronto, preencher fotos e mensagens, fazer pequenos ajustes e chegar a um resultado bonito sem conhecimento de design.
- **Content and proof:** o scrapbook renderizado é a prova. Páginas, fotos, textos, adesivos, elementos interativos, papel, camadas, metadados, preview, autosave, histórico, estados offline/erro e revisão permanecem acessíveis.
- **Chosen direction:** Álbum de Figurinhas de Afeto dentro do mundo Álbum de Coleção Afetiva. A pessoa circula por Textos, Fotos, Adesivos, Interagir, Página, Presente e Camadas sem perder seleção, página ou escala. Numeração editorial e espaços preenchíveis orientam sem gamificação.
- **Memorable moment:** ao escolher outra página, a folha nova vira e assenta sobre a pilha; no celular, as ferramentas sobem como uma divisória de fichário sem diminuir o objeto.
- **Responsive behavior:** desktop usa fita vertical de páginas, palco central e fichário contextual; celular usa fita horizontal, palco preservado e gaveta inferior recolhível com paridade completa.
- **Constraints:** React/Inertia/Tailwind, português brasileiro, sem alterações destrutivas no backend, acessível por teclado e toque, reduced motion, estados reais de autosave e recuperação local, capacidades atuais preservadas.
- **Capability boundary:** o backend atual não expõe troca persistente de layout, tema ou música neste editor. A interface não simula essas operações; papel de página e todas as mutações já suportadas permanecem reais.
