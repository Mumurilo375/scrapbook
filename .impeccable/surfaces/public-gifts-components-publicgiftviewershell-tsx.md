---
version: 1
slug: "public-gifts-components-publicgiftviewershell-tsx"
primary_target: "resources/js/features/public-gifts/components/PublicGiftViewerShell.tsx"
related_targets: ["resources/js/features/public-gifts/components/PublicGiftOpening.tsx","resources/js/features/public-gifts/components/OpenBookSpread.tsx","resources/js/features/public-gifts/components/PublicGiftEnding.tsx","resources/js/features/gifts/components/viewer/GiftViewerLayout.tsx"]
---

# Visualização do presente

- **Scope and mode:** redesign integral da visualização privada e pública; modo Experience. A leitura deve parecer a entrega de um álbum encadernado, não uma apresentação de slides.
- **Audience, job, and outcome:** a pessoa presenteada abre uma lembrança afetiva sem precisar entender o editor. Ela reconhece imediatamente uma capa artesanal, abre o objeto, percorre as páginas com orientação mínima e termina com uma sensação de fechamento.
- **Content and proof:** capa, título, destinatário, remetente, páginas reais, elementos interativos, mídia, progresso, navegação, CTA, retorno e compartilhamento permanecem funcionais. O modo privado mantém ações de edição; o publicado mantém somente a apresentação e as ações públicas permitidas.
- **Chosen direction:** o “Ateliê do Álbum Aberto” continua fora do editor. A bancada lavanda enquadra uma capa de tecido berinjela com etiqueta de algodão, depois um spread de até 1380px com pilhas, lombada, quatro argolas, foliação e canto virado. Os controles vivem numa prateleira de tecido abaixo do álbum.
- **Memorable moment:** o presente começa fechado, abre como um objeto espesso e termina fechado com uma carta de algodão e selo de cera.
- **Responsive behavior:** em telas compactas, capa e página única ocupam quase toda a largura; a segunda folha entra na sequência natural. Progresso e navegação continuam acessíveis, sem overflow horizontal.
- **Constraints:** React/Inertia/Tailwind, português brasileiro, mídia e interações existentes preservadas, acesso por teclado/toque, reduced motion, sem simular ações privadas no link público.
- **Material contract:** papel usa `cotton-paper-fibers-v2.webp`; capa usa tecido berinjela; fitas, recortes, flores, filme, metal e selos seguem a regra de materiais honestos do DESIGN.md.
