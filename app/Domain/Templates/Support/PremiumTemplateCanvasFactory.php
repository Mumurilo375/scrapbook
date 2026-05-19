<?php

namespace App\Domain\Templates\Support;

use App\Domain\Editor\CanvasNormalizer;
use App\Domain\Templates\Enums\PageType;

final class PremiumTemplateCanvasFactory
{
    /**
     * @param  array<string, string>  $assetIdsBySlug
     */
    public function __construct(private readonly array $assetIdsBySlug) {}

    /**
     * @return array<int, array<string, mixed>>
     */
    public function loveLetterPages(): array
    {
        return [
            $this->page(PageType::Cover, 'Capa com foto e fitas', 10, [
                $this->asset('papel-rasgado', 'Papel rasgado de fundo', 82, 118, 850, 330, -4, 4),
                $this->image('Foto principal da capa', 'Sua foto favorita juntos', 242, 300, 575, 610, -5, 18),
                $this->asset('fita-adesiva-kraft', 'Fita no topo da foto', 332, 258, 365, 92, 3, 30),
                $this->asset('fita-rosa-translucida', 'Fita lateral da foto', 164, 628, 280, 82, -9, 31),
                $this->text('Título da capa', "Love letter\nscrapbook", 140, 110, 790, 190, 72, 'heading', 'center', -2, 24),
                $this->text('Assinatura da capa', 'um pedacinho da nossa história', 202, 925, 675, 86, 34, 'handwritten', 'center', 2, 35),
                $this->asset('coracao-recortado', 'Coração recortado', 726, 180, 180, 160, 8, 38),
                $this->asset('selo-vintage', 'Selo romântico', 735, 765, 150, 150, 7, 37),
                $this->label('Etiqueta editável da capa', 'feito com amor', 104, 790, 300, 112, -8, 36),
            ]),
            $this->page(PageType::Letter, 'Carta principal', 20, [
                $this->asset('envelope-carta-creme', 'Envelope visual', 88, 852, 520, 320, 4, 5),
                $this->asset('papel-rasgado', 'Papel da carta', 132, 162, 820, 775, 2, 8),
                $this->asset('fita-adesiva-kraft', 'Fita da carta', 128, 112, 330, 80, -7, 26),
                $this->text(
                    'Carta editável',
                    "Nossa história começou de um jeito tão nosso...\n\nEu queria guardar aqui tudo que eu sinto quando penso em você: os detalhes pequenos, os abraços demorados e essa paz bonita de ter alguém para chamar de lar.",
                    190,
                    235,
                    700,
                    610,
                    42,
                    'handwritten',
                    'left',
                    -1,
                    20,
                ),
                $this->asset('selo-vintage', 'Selo da carta', 738, 872, 150, 150, -6, 32),
                $this->asset('coracao-recortado', 'Coração pequeno', 675, 106, 135, 120, 5, 30),
                $this->label('Etiqueta de rodapé', 'com todo meu carinho', 486, 1016, 360, 116, 4, 34),
            ]),
            $this->page(PageType::Gallery, 'Galeria de polaroids', 30, [
                $this->text('Título da galeria', 'Memórias que eu guardo no coração', 132, 98, 815, 108, 48, 'heading', 'center', -2, 28),
                ...$this->polaroidCluster([
                    ['Nossa primeira foto favorita', 'Primeira memória favorita', 112, 258, 318, 388, -7],
                    ['Um dia que virou saudade boa', 'Um dia que virou saudade boa', 568, 244, 335, 398, 5],
                    ['Nosso sorriso mais espontâneo', 'Sorriso espontâneo', 156, 728, 332, 398, 6],
                    ['A foto que sempre me faz sorrir', 'A foto que sempre faz sorrir', 586, 720, 325, 392, -4],
                ], 12),
                $this->asset('coracao-recortado', 'Coração da galeria', 450, 600, 165, 145, 7, 48),
                $this->label('Etiqueta da galeria', 'meu lugar favorito', 345, 1130, 390, 110, -3, 50),
            ]),
            $this->page(PageType::Generic, 'Coisas que amo em você', 40, [
                $this->asset('papel-rasgado', 'Papel de lista', 102, 142, 860, 220, -3, 4),
                $this->text('Título da lista', 'Coisas que eu amo em você', 150, 174, 780, 120, 56, 'heading', 'center', -2, 18),
                $this->label('Item editável 1', 'seu jeito de cuidar de tudo com calma', 128, 405, 700, 118, -3, 22),
                $this->label('Item editável 2', 'a sua risada no meio de qualquer caos', 245, 562, 710, 118, 4, 24),
                $this->label('Item editável 3', 'o conforto de ser eu mesma com você', 116, 724, 720, 118, -5, 26),
                $this->label('Item editável 4', 'nossos planos bobos que viram coisa séria', 254, 888, 690, 118, 3, 28),
                $this->asset('coracao-recortado', 'Coração decorativo', 752, 282, 155, 138, 8, 30),
                $this->asset('rabisco-alegre', 'Rabisco decorativo', 150, 1045, 300, 135, -4, 30),
            ]),
            $this->page(PageType::Final, 'Final emocional', 50, [
                $this->asset('envelope-carta-creme', 'Envelope final', 88, 292, 810, 500, -3, 6),
                $this->image('Foto pequena final', 'Uma última lembrança', 624, 180, 300, 365, 6, 18),
                $this->asset('fita-adesiva-kraft', 'Fita da foto final', 638, 152, 245, 72, -5, 30),
                $this->text('Texto final', "Obrigada por ser meu detalhe favorito nos dias comuns.\n\nCom carinho, sempre.", 146, 505, 700, 260, 54, 'handwritten', 'center', 2, 24),
                $this->asset('selo-vintage', 'Selo final', 170, 262, 155, 155, -8, 28),
                $this->label('Assinatura final', 'até a próxima página da nossa história', 245, 832, 590, 110, -2, 32),
            ]),
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function birthdayPages(): array
    {
        return [
            $this->page(PageType::Cover, 'Capa de aniversário handmade', 10, [
                $this->asset('confete-aniversario', 'Confete superior', 80, 82, 265, 190, -8, 14),
                $this->asset('balao-fofo', 'Balão decorativo', 780, 118, 170, 245, 7, 20),
                $this->image('Foto da pessoa aniversariante', 'Foto da pessoa aniversariante', 250, 340, 585, 610, 4, 18),
                $this->asset('fita-rosa-translucida', 'Fita da foto', 336, 300, 345, 88, -2, 30),
                $this->text('Título feliz aniversário', "Feliz\naniversário", 130, 125, 790, 200, 78, 'heading', 'center', -3, 34),
                $this->label('Etiqueta dia especial', 'hoje é todo seu', 330, 982, 410, 112, -5, 36),
                $this->asset('estrela-brilho', 'Estrela brilhante', 115, 840, 145, 145, -5, 34),
            ]),
            $this->page(PageType::Letter, 'Mensagem de parabéns', 20, [
                $this->asset('papel-rasgado', 'Papel da mensagem', 118, 176, 835, 742, -2, 8),
                $this->asset('fita-adesiva-kraft', 'Fita da mensagem', 118, 132, 320, 76, -8, 22),
                $this->asset('confete-aniversario', 'Confete da página', 715, 108, 220, 160, 7, 26),
                $this->text(
                    'Mensagem editável',
                    "Hoje é dia de celebrar você.\n\nQue esse novo ciclo venha leve, bonito e cheio de abraços que parecem casa. Você merece um mundo de coisas boas, daquelas que chegam devagar e ficam.",
                    184,
                    250,
                    716,
                    560,
                    42,
                    'handwritten',
                    'left',
                    1,
                    24,
                ),
                $this->label('Etiqueta parabéns', 'parabéns, meu amor', 435, 935, 410, 112, 4, 30),
                $this->asset('estrela-brilho', 'Estrela pequena', 182, 924, 130, 130, -6, 31),
            ]),
            $this->page(PageType::Gallery, 'Galeria de memórias', 30, [
                $this->text('Título memórias aniversário', 'Lembranças que merecem moldura', 124, 96, 830, 110, 48, 'heading', 'center', 2, 30),
                ...$this->polaroidCluster([
                    ['A lembrança mais feliz', 'Uma lembrança feliz', 105, 245, 330, 394, -6],
                    ['A foto do abraço bom', 'O abraço bom', 584, 270, 310, 382, 5],
                    ['A risada que marcou o dia', 'Risada que marcou', 168, 727, 325, 392, 4],
                    ['Mais um ano para guardar', 'Mais um ano para guardar', 595, 730, 318, 390, -5],
                ], 12),
                $this->asset('confete-aniversario', 'Confete central', 433, 608, 230, 170, -2, 46),
                $this->label('Legenda editável', 'momentos que aquecem o coração', 302, 1130, 520, 106, 3, 50),
            ]),
            $this->page(PageType::Generic, 'Data especial e desejos', 40, [
                $this->asset('calendario-especial', 'Calendário visual', 116, 156, 360, 360, -5, 8),
                $this->text('Data editável', '19\nMAI', 164, 235, 260, 190, 74, 'heading', 'center', 0, 18),
                $this->text('Título desejos', 'Desejos para o seu novo ciclo', 436, 165, 520, 132, 48, 'heading', 'left', 2, 20),
                $this->label('Desejo editável 1', 'mais leveza nos dias corridos', 155, 560, 705, 112, 3, 24),
                $this->label('Desejo editável 2', 'motivos bobos para rir alto', 250, 714, 670, 112, -4, 26),
                $this->label('Desejo editável 3', 'coragem para escolher o que faz bem', 132, 872, 740, 112, 2, 28),
                $this->asset('balao-fofo', 'Balão pequeno', 805, 970, 125, 180, 7, 30),
            ]),
            $this->page(PageType::Final, 'Página final com desejos', 50, [
                $this->asset('papel-rasgado', 'Papel final aniversário', 128, 250, 815, 480, 3, 8),
                $this->asset('fita-rosa-translucida', 'Fita final', 348, 215, 350, 86, -5, 22),
                $this->text('Mensagem final aniversário', "Que sua vida continue encontrando beleza nos detalhes.\n\nFeliz aniversário, hoje e em todos os dias em que você precisar lembrar o quanto é especial.", 170, 326, 730, 310, 52, 'handwritten', 'center', -1, 24),
                $this->image('Foto final de aniversário', 'Uma última memória', 366, 780, 350, 395, -4, 26),
                $this->asset('confete-aniversario', 'Confete final', 692, 710, 235, 180, 6, 32),
                $this->label('Etiqueta final aniversário', 'que venham histórias lindas', 225, 1088, 560, 106, 3, 36),
            ]),
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function bestFriendsPages(): array
    {
        return [
            $this->page(PageType::Cover, 'Capa de amizade', 10, [
                $this->asset('rabisco-alegre', 'Rabisco da capa', 108, 116, 330, 148, -5, 12),
                $this->image('Foto principal da amizade', 'Foto principal da amizade', 226, 318, 575, 590, -4, 18),
                $this->asset('fita-rosa-translucida', 'Fita da foto da capa', 322, 282, 350, 86, 4, 32),
                $this->text('Título melhores amigas', "Best friends\ncollage", 124, 118, 830, 190, 70, 'heading', 'center', 2, 35),
                $this->label('Etiqueta só a gente', 'só a gente entende', 332, 928, 420, 112, -6, 36),
                $this->asset('coracao-recortado', 'Coração amizade', 790, 740, 150, 135, 7, 34),
                $this->asset('flor-simples', 'Flor da capa', 116, 812, 165, 165, -5, 33),
            ]),
            $this->page(PageType::Letter, 'Nossa história', 20, [
                $this->asset('papel-rasgado', 'Papel história', 112, 158, 830, 610, 2, 8),
                $this->text('Nossa história editável', "Nossa história começou de um jeito simples e virou uma das minhas partes favoritas da vida.\n\nObrigada por ser conselho, riso, plano maluco e abrigo nos dias esquisitos.", 172, 250, 700, 390, 43, 'handwritten', 'left', -1, 22),
                $this->image('Foto pequena da nossa história', 'Foto de uma memória nossa', 605, 740, 310, 365, 5, 28),
                $this->asset('fita-adesiva-kraft', 'Fita da foto história', 642, 716, 230, 70, -6, 34),
                $this->label('Etiqueta guardado', 'guardado no coração', 132, 805, 390, 112, -4, 30),
                $this->asset('rabisco-alegre', 'Rabisco inferior', 140, 1030, 310, 136, 5, 32),
            ]),
            $this->page(PageType::Gallery, 'Melhores momentos em colagem', 30, [
                $this->text('Título melhores momentos', 'Melhores momentos em colagem', 118, 86, 840, 100, 48, 'heading', 'center', -1, 40),
                ...$this->polaroidCluster([
                    ['Nosso momento favorito', 'Nosso momento favorito', 92, 230, 300, 360, -8],
                    ['A foto do rolê inesquecível', 'Rolê inesquecível', 426, 250, 285, 350, 4],
                    ['A risada de sempre', 'A risada de sempre', 730, 220, 270, 340, 7],
                    ['Uma memória aleatória perfeita', 'Memória aleatória perfeita', 142, 690, 320, 382, 5],
                    ['A foto que explica tudo', 'A foto que explica tudo', 560, 720, 338, 392, -6],
                ], 10),
                $this->asset('flor-simples', 'Flor central', 452, 598, 160, 160, -5, 54),
                $this->label('Legenda colagem', 'a gente sempre dá um jeito de virar história', 255, 1135, 585, 105, 2, 56),
            ]),
            $this->page(PageType::Generic, 'Piadas e frases internas', 40, [
                $this->text('Título piadas internas', 'Piadas, códigos e frases internas', 125, 100, 830, 105, 48, 'heading', 'center', 2, 30),
                $this->label('Piada interna 1', 'a frase que ninguém mais entende', 120, 280, 690, 118, -5, 20),
                $this->label('Piada interna 2', 'aquele rolê que virou lenda', 250, 455, 650, 118, 4, 22),
                $this->label('Piada interna 3', 'o áudio que precisava virar patrimônio', 118, 635, 730, 118, -3, 24),
                $this->label('Piada interna 4', 'nossa promessa de rir disso para sempre', 235, 812, 690, 118, 5, 26),
                $this->asset('rabisco-alegre', 'Rabisco de amizade', 130, 1035, 340, 150, -6, 32),
                $this->asset('coracao-recortado', 'Coração de amizade', 780, 980, 150, 135, 8, 33),
            ]),
            $this->page(PageType::Final, 'Final de amizade', 50, [
                $this->asset('papel-rasgado', 'Papel final amizade', 132, 250, 805, 520, -2, 8),
                $this->text('Texto final amizade', "Obrigada por existir na minha vida.\n\nTem gente que chega como acaso e fica como escolha. Você é uma dessas pessoas.", 178, 330, 720, 315, 54, 'handwritten', 'center', 1, 22),
                $this->image('Foto final da amizade', 'Nossa foto final favorita', 346, 785, 365, 415, 4, 26),
                $this->asset('fita-rosa-translucida', 'Fita final amizade', 382, 752, 270, 78, -5, 34),
                $this->asset('flor-simples', 'Flor final', 710, 725, 160, 160, 6, 36),
                $this->label('Etiqueta final amizade', 'para sempre nós', 172, 820, 330, 104, -7, 35),
            ]),
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function vintageMemoryPages(): array
    {
        return [
            $this->page(PageType::Cover, 'Capa vintage', 10, [
                $this->asset('jornal-recortado', 'Recorte de jornal', 104, 128, 800, 410, -4, 5),
                $this->image('Foto principal vintage', 'Foto principal vintage', 260, 365, 540, 595, 3, 18),
                $this->asset('fita-adesiva-kraft', 'Fita vintage superior', 320, 332, 360, 86, -5, 30),
                $this->text('Título vintage', "Vintage\nmemory book", 140, 122, 790, 190, 68, 'heading', 'center', -2, 34),
                $this->asset('selo-vintage', 'Selo da capa vintage', 748, 812, 160, 160, 8, 36),
                $this->asset('flor-simples', 'Flor seca visual', 118, 820, 165, 165, -7, 36),
                $this->label('Etiqueta nostalgia', 'memórias delicadas', 316, 995, 445, 112, 4, 38),
            ]),
            $this->page(PageType::Generic, 'Linha de memórias', 20, [
                $this->text('Título linha de memórias', 'Pequena linha de memórias', 130, 106, 810, 110, 50, 'heading', 'center', 1, 30),
                $this->asset('jornal-recortado', 'Faixa de jornal', 128, 230, 350, 210, -5, 6),
                $this->label('Memória 1', 'o dia em que tudo ficou diferente', 372, 270, 540, 118, 3, 22),
                $this->label('Memória 2', 'uma conversa que virou caminho', 142, 510, 580, 118, -4, 24),
                $this->label('Memória 3', 'o detalhe pequeno que eu nunca esqueci', 322, 750, 610, 118, 4, 26),
                $this->label('Memória 4', 'a parte bonita de olhar para trás', 160, 978, 585, 118, -3, 28),
                $this->asset('selo-vintage', 'Selo da linha', 770, 475, 140, 140, -7, 30),
                $this->asset('rabisco-alegre', 'Linha rabiscada', 138, 1110, 350, 130, 5, 31),
            ]),
            $this->page(PageType::Gallery, 'Fotos em molduras antigas', 30, [
                $this->text('Título molduras antigas', 'Fotos que parecem achados antigos', 125, 98, 830, 110, 48, 'heading', 'center', -1, 34),
                $this->asset('moldura-instantanea', 'Moldura antiga 1', 82, 240, 420, 505, -6, 14),
                $this->image('Retrato antigo 1', 'Primeiro retrato antigo', 106, 282, 360, 430, -6, 24),
                $this->asset('moldura-instantanea', 'Moldura antiga 2', 560, 220, 410, 498, 5, 14),
                $this->image('Retrato antigo 2', 'Segundo retrato antigo', 590, 260, 345, 410, 5, 24),
                $this->asset('moldura-instantanea', 'Moldura antiga 3', 305, 730, 415, 500, -2, 14),
                $this->image('Retrato antigo 3', 'Terceiro retrato antigo', 335, 768, 350, 420, -2, 24),
                $this->asset('fita-adesiva-kraft', 'Fita de moldura', 358, 706, 270, 76, 5, 36),
                $this->asset('selo-vintage', 'Selo da galeria vintage', 774, 1015, 130, 130, 7, 38),
            ]),
            $this->page(PageType::Letter, 'Carta curta vintage', 40, [
                $this->asset('papel-rasgado', 'Papel carta vintage', 118, 180, 845, 650, 3, 8),
                $this->asset('jornal-recortado', 'Recorte atrás da carta', 88, 750, 450, 260, -6, 5),
                $this->text('Carta curta editável', "Tem lembranças que não fazem barulho.\n\nElas ficam aqui, entre uma foto antiga e outra, lembrando que algumas fases merecem ser guardadas com cuidado.", 180, 270, 725, 430, 44, 'handwritten', 'left', -1, 22),
                $this->asset('fita-adesiva-kraft', 'Fita carta vintage', 182, 142, 320, 78, -6, 24),
                $this->asset('flor-simples', 'Flor da carta vintage', 728, 728, 150, 150, 7, 30),
                $this->label('Etiqueta carta vintage', 'para guardar com calma', 275, 910, 510, 112, 3, 32),
            ]),
            $this->page(PageType::Final, 'Final nostálgico', 50, [
                $this->asset('envelope-carta-creme', 'Envelope nostálgico', 108, 310, 820, 500, 2, 6),
                $this->text('Texto final vintage', "Algumas memórias não precisam ser perfeitas.\n\nElas só precisam continuar aqui.", 160, 430, 760, 245, 60, 'handwritten', 'center', -2, 22),
                $this->image('Foto nostálgica final', 'Uma lembrança nostálgica', 350, 780, 360, 410, -4, 24),
                $this->asset('fita-adesiva-kraft', 'Fita final vintage', 382, 748, 270, 78, -6, 32),
                $this->asset('selo-vintage', 'Selo final vintage', 145, 776, 145, 145, 6, 34),
                $this->label('Etiqueta final vintage', 'fim de uma página bonita', 294, 1160, 500, 104, 4, 36),
            ]),
        ];
    }

    /**
     * @param  array<int, array{0: string, 1: string, 2: int, 3: int, 4: int, 5: int, 6: int}>  $items
     * @return array<int, array<string, mixed>>
     */
    private function polaroidCluster(array $items, int $baseZ): array
    {
        $elements = [];

        foreach ($items as $index => [$name, $placeholder, $x, $y, $w, $h, $rotation]) {
            $z = $baseZ + ($index * 4);
            $elements[] = $this->image($name, $placeholder, $x, $y, $w, $h, $rotation, $z);
            $elements[] = $this->asset(
                $index % 2 === 0 ? 'fita-adesiva-kraft' : 'fita-rosa-translucida',
                'Fita de '.$name,
                $x + (int) round($w * 0.22),
                $y - 30,
                max(205, (int) round($w * 0.58)),
                72,
                -$rotation,
                $z + 10,
            );
        }

        return $elements;
    }

    /**
     * @param  array<int, array<string, mixed>>  $elements
     * @return array<string, mixed>
     */
    private function page(PageType $type, string $name, int $sortOrder, array $elements): array
    {
        return [
            'page_type' => $type,
            'name' => $name,
            'sort_order' => $sortOrder,
            'canvas' => $this->canvas($elements),
            'editable_schema' => [
                'schemaVersion' => 1,
                'fields' => $this->editableFields($elements),
            ],
            'constraints' => [
                'schemaVersion' => 1,
                'maxTextLength' => 1000,
            ],
            'metadata' => [
                'schemaVersion' => 1,
                'premium' => true,
                'composition' => 'organic-scrapbook',
            ],
        ];
    }

    /**
     * @param  array<int, array<string, mixed>>  $elements
     * @return array<string, mixed>
     */
    private function canvas(array $elements): array
    {
        return [
            'schemaVersion' => 1,
            'version' => 1,
            'artboard' => [
                'width' => CanvasNormalizer::DEFAULT_WIDTH,
                'height' => CanvasNormalizer::DEFAULT_HEIGHT,
                'unit' => 'px',
                'background' => ['type' => 'theme'],
                'safeArea' => CanvasNormalizer::DEFAULT_SAFE_AREA,
            ],
            'background' => [
                'type' => 'themeToken',
                'value' => 'paper',
            ],
            'elements' => $elements,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function text(
        string $name,
        string $text,
        int $x,
        int $y,
        int $w,
        int $h,
        int $fontSize,
        string $fontToken,
        string $align,
        int $rotation,
        int $z,
    ): array {
        $id = $this->id($name);

        return [
            'id' => $id,
            'type' => 'text',
            'slotKey' => $id,
            'name' => $name,
            'text' => $text,
            'x' => $x,
            'y' => $y,
            'w' => $w,
            'h' => $h,
            'rotation' => $rotation,
            'z' => $z,
            'style' => [
                'fontToken' => $fontToken,
                'fontSize' => $fontSize,
                'color' => 'var(--ink)',
                'align' => $align,
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function image(string $name, string $placeholderLabel, int $x, int $y, int $w, int $h, int $rotation, int $z): array
    {
        $id = $this->id($name);

        return [
            'id' => $id,
            'type' => 'image',
            'slotKey' => $id,
            'name' => $name,
            'alt' => $placeholderLabel,
            'placeholderLabel' => $placeholderLabel,
            'x' => $x,
            'y' => $y,
            'w' => $w,
            'h' => $h,
            'rotation' => $rotation,
            'z' => $z,
            'style' => [
                'frame' => 'polaroid',
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function asset(string $slug, string $name, int $x, int $y, int $w, int $h, int $rotation, int $z): array
    {
        $id = $this->id($name);
        $element = [
            'id' => $id,
            'type' => 'sticker',
            'slotKey' => $id,
            'name' => $name,
            'x' => $x,
            'y' => $y,
            'w' => $w,
            'h' => $h,
            'rotation' => $rotation,
            'z' => $z,
        ];

        $assetId = $this->assetIdsBySlug[$slug] ?? null;

        if (is_string($assetId) && $assetId !== '') {
            $element['assetId'] = $assetId;

            return $element;
        }

        $element['label'] = $name;
        $element['text'] = $name;
        $element['editableText'] = false;

        return $element;
    }

    /**
     * @return array<string, mixed>
     */
    private function label(string $name, string $text, int $x, int $y, int $w, int $h, int $rotation, int $z): array
    {
        $element = $this->asset('etiqueta-manuscrita', $name, $x, $y, $w, $h, $rotation, $z);
        $element['label'] = $text;
        $element['text'] = $text;
        $element['editableText'] = true;
        $element['style'] = [
            'fontToken' => 'handwritten',
            'fontSize' => 34,
            'color' => 'var(--ink)',
            'align' => 'center',
        ];

        return $element;
    }

    /**
     * @param  array<int, array<string, mixed>>  $elements
     * @return array<int, string>
     */
    private function editableFields(array $elements): array
    {
        return collect($elements)
            ->filter(fn (array $element): bool => in_array($element['type'] ?? null, ['text', 'image'], true) || ($element['editableText'] ?? false) === true)
            ->map(fn (array $element): string => (string) ($element['slotKey'] ?? $element['id']))
            ->values()
            ->all();
    }

    private function id(string $name): string
    {
        $slug = preg_replace('/[^a-z0-9]+/', '_', strtolower(iconv('UTF-8', 'ASCII//TRANSLIT', $name) ?: $name));
        $slug = trim((string) $slug, '_');

        return $slug !== '' ? $slug : 'elemento';
    }
}
