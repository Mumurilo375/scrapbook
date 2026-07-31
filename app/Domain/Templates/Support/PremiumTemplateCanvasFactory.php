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
            $this->page(PageType::Cover, 'Nosso começo', 10, [
                $this->text('Título da capa', "Nosso\ncomeço", 108, 115, 620, 190, 76, 'handwritten', 'left', -2, 30),
                $this->label('Data da história', '14 FEV. 2020', 126, 315, 305, 92, -3, 22),
                $this->image('Foto principal da capa', 'A foto que parece o começo de tudo', 310, 405, 575, 600, 3, 18),
                $this->asset('fita-adesiva-kraft', 'Fita da foto principal', 478, 365, 265, 76, -4, 31),
                $this->asset('raminho-prensado', 'Raminho guardado', 110, 620, 155, 335, -8, 26),
                $this->asset('bilhete-de-memoria', 'Bilhete da nossa história', 614, 990, 330, 150, 5, 34),
                $this->label('Frase da capa', 'foi simples, foi leve, foi a gente', 156, 1060, 430, 118, -2, 35),
                $this->asset('coracao-papel-rasgado', 'Coração pequeno da capa', 792, 180, 130, 122, 9, 37),
            ]),
            $this->page(PageType::Letter, 'Carta guardada', 20, [
                $this->asset('papel-rasgado', 'Folha da carta', 112, 145, 842, 700, 1, 8),
                $this->asset('clipe-de-metal', 'Clipe da carta', 815, 115, 86, 180, 8, 34),
                $this->text(
                    'Carta editável',
                    "Tem coisas que eu queria conseguir guardar entre estas páginas.\n\nO jeito como você me faz rir sem perceber. A calma dos nossos silêncios. E essa sensação bonita de que, com você, até os dias comuns viram memória.",
                    178,
                    235,
                    700,
                    500,
                    43,
                    'handwritten',
                    'left',
                    -1,
                    20,
                ),
                $this->asset('raminho-prensado', 'Flor seca da carta', 105, 770, 145, 310, -7, 28),
                $this->asset('marca-de-batom', 'Beijo no papel', 745, 715, 180, 122, -8, 31),
                $this->interactiveEnvelope(
                    'Envelope abra quando',
                    'Abra quando sentir saudade',
                    "Se a saudade apertar, volta aqui.\n\nQuero que você lembre que meu lugar favorito continua sendo qualquer lugar onde a gente possa ser nós dois.",
                    405,
                    890,
                    520,
                    300,
                    3,
                    40,
                    'cream',
                ),
                $this->label('Assinatura da carta', 'com todo meu carinho', 122, 1095, 345, 102, -4, 35),
            ]),
            $this->page(PageType::Gallery, 'Pequenos momentos', 30, [
                $this->text('Título da galeria', 'Pequenos momentos, grandes memórias', 112, 92, 835, 108, 48, 'heading', 'left', -1, 36),
                $this->image('Foto do nosso lugar', 'Nosso lugar favorito', 112, 248, 380, 470, -5, 16),
                $this->asset('fita-adesiva-kraft', 'Fita da foto do nosso lugar', 194, 216, 235, 72, 4, 30),
                $this->image('Foto do abraço', 'Um abraço que virou casa', 586, 210, 350, 430, 4, 18),
                $this->asset('fita-rosa-translucida', 'Fita da foto do abraço', 652, 184, 230, 70, -3, 31),
                $this->image('Foto espontânea', 'O riso que eu queria guardar', 314, 755, 410, 470, 2, 20),
                $this->asset('fita-adesiva-kraft', 'Fita da foto espontânea', 405, 720, 250, 72, -4, 32),
                $this->asset('tira-de-filme', 'Tira de filme lateral', 820, 690, 125, 430, 6, 28),
                $this->label('Lembrança da galeria', 'a gente parou o tempo só para caber aqui', 92, 805, 280, 188, -5, 38),
                $this->asset('raminho-prensado', 'Raminho da galeria', 105, 985, 130, 255, -10, 40),
            ]),
            $this->page(PageType::Generic, 'Coisas que amo em você', 40, [
                $this->text('Título da lista', 'Coisas que eu amo em você', 112, 95, 780, 110, 52, 'heading', 'left', -2, 30),
                $this->image('Retrato para a lista', 'Uma foto que tem a sua essência', 570, 245, 360, 455, 4, 16),
                $this->asset('fita-rosa-translucida', 'Fita do retrato', 628, 216, 245, 72, -4, 32),
                $this->label('Item editável 1', 'seu jeito de transformar cuidado em gesto', 105, 285, 390, 150, -4, 22),
                $this->label('Item editável 2', 'a risada que encontra luz em qualquer caos', 140, 485, 390, 160, 3, 24),
                $this->label('Item editável 3', 'o conforto de poder ser inteira com você', 525, 770, 410, 165, -3, 26),
                $this->label('Item editável 4', 'os planos bobos que ganham coragem quando são nossos', 110, 810, 395, 205, 3, 28),
                $this->asset('coracao-papel-rasgado', 'Coração da lista', 740, 1005, 145, 138, 8, 34),
                $this->asset('bilhete-de-memoria', 'Bilhete da lista', 225, 1080, 360, 150, -2, 35),
            ]),
            $this->page(PageType::Final, 'Final emocional', 50, [
                $this->image('Foto pequena final', 'Uma última lembrança', 138, 215, 390, 470, -5, 18),
                $this->asset('fita-adesiva-kraft', 'Fita da foto final', 205, 180, 245, 72, 5, 31),
                $this->asset('papel-rasgado', 'Papel da mensagem final', 475, 300, 475, 465, 3, 10),
                $this->text('Texto final', "Não é sobre ter todos os planos certos.\n\nÉ sobre escolher fazer cada um deles juntos.", 530, 385, 360, 270, 48, 'handwritten', 'center', 2, 24),
                $this->asset('raminho-prensado', 'Flor do final', 780, 720, 140, 300, 6, 28),
                $this->asset('selo-vintage', 'Selo final', 100, 720, 155, 155, -8, 30),
                $this->label('Assinatura final', 'você + eu · ainda temos tantas páginas', 240, 940, 600, 130, -2, 34),
                $this->asset('marca-de-batom', 'Beijo final', 730, 1070, 190, 128, -8, 36),
            ]),
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function birthdayPages(): array
    {
        return [
            $this->page(PageType::Cover, 'Um novo capítulo', 10, [
                $this->text('Título feliz aniversário', "Um novo\ncapítulo", 112, 110, 640, 190, 74, 'handwritten', 'left', -2, 30),
                $this->label('Etiqueta de aniversário', 'hoje o mundo celebra você', 135, 300, 420, 110, -3, 28),
                $this->image('Foto da pessoa aniversariante', 'A foto que tem a sua energia', 290, 430, 580, 595, 3, 18),
                $this->asset('fita-rosa-translucida', 'Fita da foto', 430, 390, 290, 78, -4, 32),
                $this->asset('calendario-especial', 'Calendário da capa', 105, 675, 190, 210, -6, 24),
                $this->asset('confete-aniversario', 'Confete da capa', 735, 160, 205, 155, 7, 26),
                $this->asset('bilhete-de-memoria', 'Bilhete do novo ciclo', 605, 1025, 340, 150, -4, 35),
                $this->asset('estrela-brilho', 'Estrela da capa', 130, 1025, 125, 125, -6, 34),
            ]),
            $this->page(PageType::Letter, 'Mensagem de parabéns', 20, [
                $this->asset('papel-rasgado', 'Papel da mensagem', 112, 155, 840, 700, -1, 8),
                $this->asset('fita-adesiva-kraft', 'Fita da mensagem', 170, 120, 300, 76, -7, 25),
                $this->asset('clipe-de-metal', 'Clipe da mensagem', 800, 130, 84, 180, 8, 30),
                $this->text(
                    'Mensagem editável',
                    "Hoje é dia de celebrar tudo o que existe de bonito em você.\n\nQue o novo ciclo traga coragem para os sonhos grandes, tempo para os detalhes pequenos e pessoas que façam os dias parecerem casa.",
                    180,
                    245,
                    710,
                    500,
                    43,
                    'handwritten',
                    'left',
                    1,
                    24,
                ),
                $this->image('Foto pequena da carta', 'Um sorriso para guardar', 590, 835, 330, 390, 4, 28),
                $this->asset('fita-rosa-translucida', 'Fita da foto da carta', 650, 805, 220, 70, -4, 33),
                $this->label('Etiqueta parabéns', 'que sorte a nossa ter você', 125, 935, 390, 155, -4, 31),
                $this->asset('estrela-brilho', 'Estrela pequena', 170, 1110, 115, 115, -6, 32),
            ]),
            $this->page(PageType::Gallery, 'Galeria de memórias', 30, [
                $this->text('Título memórias aniversário', 'A vida fica bonita nestes detalhes', 115, 92, 830, 105, 48, 'heading', 'left', -1, 34),
                $this->image('A lembrança mais feliz', 'Uma lembrança feliz', 105, 245, 365, 455, -5, 16),
                $this->asset('fita-adesiva-kraft', 'Fita da lembrança feliz', 175, 215, 230, 70, 4, 31),
                $this->image('A foto do abraço bom', 'O abraço bom', 585, 225, 350, 430, 4, 18),
                $this->asset('fita-rosa-translucida', 'Fita da foto do abraço', 650, 195, 230, 70, -3, 32),
                $this->image('A risada que marcou', 'A risada que marcou o dia', 330, 760, 410, 470, 2, 20),
                $this->asset('fita-adesiva-kraft', 'Fita da risada', 415, 725, 250, 72, -4, 33),
                $this->label('Legenda editável', 'um punhado de instantes que merece ficar', 95, 800, 280, 180, -5, 38),
                $this->asset('confete-aniversario', 'Confete discreto', 775, 745, 180, 140, 5, 39),
            ]),
            $this->page(PageType::Generic, 'Data especial e desejos', 40, [
                $this->asset('calendario-especial', 'Calendário visual', 110, 145, 300, 330, -5, 8),
                $this->text('Data editável', '19\nMAI', 145, 218, 230, 175, 68, 'heading', 'center', 0, 18),
                $this->text('Título desejos', 'Para o seu novo ciclo', 445, 160, 500, 120, 50, 'heading', 'left', 1, 24),
                $this->label('Desejo editável 1', 'mais leveza para os dias que chegam correndo', 465, 315, 455, 155, 3, 26),
                $this->label('Desejo editável 2', 'mais motivos bobos para rir alto', 125, 585, 420, 150, -4, 28),
                $this->label('Desejo editável 3', 'coragem para escolher o que faz o coração respirar', 525, 560, 420, 195, 3, 30),
                $this->image('Foto do novo ciclo', 'Uma foto para abrir o novo ciclo', 245, 835, 520, 400, -2, 20),
                $this->asset('bilhete-de-memoria', 'Bilhete de aniversário', 650, 1000, 330, 150, 6, 34),
                $this->asset('balao-fofo', 'Balão pequeno', 115, 1015, 120, 175, -6, 32),
            ]),
            $this->page(PageType::Final, 'Página final com desejos', 50, [
                $this->asset('papel-rasgado', 'Papel final aniversário', 120, 170, 840, 510, 2, 8),
                $this->text('Mensagem final aniversário', "Que sua vida continue encontrando beleza nos detalhes.\n\nFeliz aniversário — hoje e em todos os dias em que você precisar lembrar o quanto é especial.", 180, 270, 710, 310, 50, 'handwritten', 'center', -1, 24),
                $this->image('Foto final de aniversário', 'Uma última memória', 560, 760, 365, 430, 4, 26),
                $this->asset('fita-rosa-translucida', 'Fita final', 625, 725, 230, 72, -5, 34),
                $this->label('Etiqueta final aniversário', 'que venham histórias lindas', 125, 815, 385, 145, -4, 33),
                $this->asset('confete-aniversario', 'Confete final', 125, 1010, 210, 165, -5, 35),
                $this->interactiveEnvelope(
                    'Envelope de desejos',
                    'Abra para um desejo',
                    'Que este novo ciclo te encontre com coragem, carinho e muitas histórias boas para contar.',
                    160,
                    975,
                    390,
                    255,
                    -3,
                    38,
                    'rose',
                ),
            ]),
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function bestFriendsPages(): array
    {
        return [
            $this->page(PageType::Cover, 'O nosso caos favorito', 10, [
                $this->text('Título melhores amigas', "O nosso caos\nfavorito", 110, 105, 760, 190, 72, 'handwritten', 'left', -2, 34),
                $this->image('Foto principal da amizade', 'A foto que resume a nossa amizade', 290, 385, 585, 610, -3, 18),
                $this->asset('fita-rosa-translucida', 'Fita da foto da capa', 430, 345, 285, 78, 4, 32),
                $this->label('Etiqueta só a gente', 'uma coleção de risadas, áudios e planos improváveis', 115, 325, 390, 160, -5, 30),
                $this->asset('tira-de-filme', 'Tira de filme da capa', 105, 690, 135, 400, -6, 26),
                $this->asset('coracao-papel-rasgado', 'Coração amizade', 785, 180, 140, 132, 7, 36),
                $this->asset('bilhete-de-memoria', 'Bilhete só a gente', 590, 1025, 350, 150, 4, 37),
            ]),
            $this->page(PageType::Letter, 'Nossa história', 20, [
                $this->asset('papel-rasgado', 'Papel história', 105, 145, 845, 650, 1, 8),
                $this->asset('clipe-de-metal', 'Clipe da nossa história', 815, 120, 84, 180, 8, 30),
                $this->text('Nossa história editável', "Algumas amizades chegam sem aviso e, quando a gente percebe, já viraram casa.\n\nObrigada por ser conselho, riso sem hora, plano maluco e abrigo nos dias em que tudo parece meio torto.", 175, 235, 705, 470, 43, 'handwritten', 'left', -1, 22),
                $this->image('Foto pequena da nossa história', 'Uma memória que só a gente entende', 565, 835, 360, 405, 4, 28),
                $this->asset('fita-adesiva-kraft', 'Fita da foto história', 635, 803, 230, 70, -5, 34),
                $this->label('Etiqueta guardado', 'você deixa a vida mais leve', 115, 855, 390, 145, -4, 31),
                $this->asset('rabisco-alegre', 'Rabisco inferior', 145, 1080, 300, 125, 4, 32),
            ]),
            $this->page(PageType::Gallery, 'Melhores momentos em colagem', 30, [
                $this->text('Título melhores momentos', 'Momentos que viraram patrimônio', 112, 90, 850, 105, 48, 'heading', 'left', -1, 40),
                $this->image('Nosso momento favorito', 'Nosso momento favorito', 105, 250, 365, 445, -5, 16),
                $this->asset('fita-adesiva-kraft', 'Fita do momento favorito', 175, 218, 230, 70, 4, 32),
                $this->image('A foto do rolê inesquecível', 'Rolê inesquecível', 590, 225, 345, 425, 4, 18),
                $this->asset('fita-rosa-translucida', 'Fita do rolê', 650, 195, 230, 70, -3, 33),
                $this->image('A risada de sempre', 'A risada de sempre', 325, 770, 410, 465, 2, 20),
                $this->asset('fita-adesiva-kraft', 'Fita da risada', 410, 735, 250, 72, -4, 34),
                $this->asset('tira-de-filme', 'Filme das memórias', 805, 735, 125, 415, 6, 38),
                $this->label('Legenda colagem', 'a gente sempre dá um jeito de virar história', 90, 820, 280, 170, -5, 40),
                $this->flipPolaroid(
                    'Polaroid segredo da amizade',
                    'Foto surpresa',
                    'segredo nosso',
                    'Essa lembrança tem a nossa cara: um pouco bagunçada, muito feliz e impossível de explicar para quem não estava lá.',
                    95,
                    1005,
                    235,
                    285,
                    -6,
                    46,
                ),
            ]),
            $this->page(PageType::Generic, 'Piadas e frases internas', 40, [
                $this->text('Título piadas internas', 'O arquivo confidencial da amizade', 115, 95, 820, 105, 48, 'heading', 'left', 1, 30),
                $this->asset('jornal-recortado', 'Recorte de fundo das piadas', 105, 220, 420, 260, -5, 7),
                $this->label('Piada interna 1', 'a frase que ninguém mais entende', 135, 280, 380, 145, -4, 20),
                $this->label('Piada interna 2', 'aquele rolê que virou lenda', 545, 260, 385, 145, 4, 22),
                $this->label('Piada interna 3', 'o áudio que precisava virar patrimônio', 115, 575, 410, 175, -3, 24),
                $this->label('Piada interna 4', 'nossa promessa de rir disso quando ficarmos velhas', 535, 550, 400, 200, 4, 26),
                $this->image('Foto do arquivo confidencial', 'Uma prova dos nossos melhores dias', 315, 840, 440, 410, -2, 28),
                $this->asset('rabisco-alegre', 'Rabisco de amizade', 120, 1020, 260, 125, -6, 32),
                $this->asset('coracao-papel-rasgado', 'Coração de amizade', 785, 980, 140, 132, 8, 33),
            ]),
            $this->page(PageType::Final, 'Final de amizade', 50, [
                $this->asset('papel-rasgado', 'Papel final amizade', 115, 160, 840, 510, -1, 8),
                $this->text('Texto final amizade', "Tem gente que chega como acaso e fica como escolha.\n\nObrigada por existir na minha vida e por fazer dela um lugar mais engraçado, corajoso e bonito.", 180, 255, 710, 315, 51, 'handwritten', 'center', 1, 22),
                $this->image('Foto final da amizade', 'Nossa foto final favorita', 560, 760, 365, 430, 4, 26),
                $this->asset('fita-rosa-translucida', 'Fita final amizade', 630, 728, 230, 72, -5, 34),
                $this->asset('raminho-prensado', 'Flor final', 120, 900, 145, 300, -7, 35),
                $this->label('Etiqueta final amizade', 'em todas as versões da vida, eu escolheria você', 135, 785, 390, 185, -4, 36),
                $this->asset('bilhete-de-memoria', 'Bilhete final da amizade', 590, 1110, 330, 145, 4, 38),
            ]),
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function vintageMemoryPages(): array
    {
        return [
            $this->page(PageType::Cover, 'Memórias que ficaram', 10, [
                $this->asset('jornal-recortado', 'Recorte de jornal da capa', 90, 135, 430, 290, -5, 5),
                $this->text('Título vintage', "Memórias\nque ficaram", 120, 110, 740, 190, 70, 'handwritten', 'left', -2, 34),
                $this->image('Foto principal vintage', 'A foto que o tempo deixou mais bonita', 300, 390, 570, 600, 3, 18),
                $this->asset('fita-adesiva-kraft', 'Fita vintage superior', 430, 352, 285, 78, -5, 30),
                $this->asset('selo-vintage', 'Selo da capa vintage', 760, 180, 150, 150, 8, 36),
                $this->asset('raminho-prensado', 'Flor seca da capa', 110, 650, 150, 330, -7, 35),
                $this->label('Etiqueta nostalgia', 'algumas histórias merecem envelhecer no papel', 160, 1030, 500, 155, -3, 38),
                $this->asset('bilhete-de-memoria', 'Bilhete vintage', 650, 1035, 310, 145, 4, 39),
            ]),
            $this->page(PageType::Generic, 'Linha de memórias', 20, [
                $this->text('Título linha de memórias', 'Uma pequena linha do tempo', 115, 95, 820, 110, 50, 'heading', 'left', 1, 30),
                $this->asset('jornal-recortado', 'Faixa de jornal', 105, 225, 355, 245, -5, 6),
                $this->label('Memória 1', 'o dia em que tudo ficou diferente', 500, 250, 430, 145, 3, 22),
                $this->label('Memória 2', 'uma conversa que, sem querer, virou caminho', 115, 535, 430, 170, -4, 24),
                $this->image('Foto da linha do tempo', 'Uma memória no meio do caminho', 570, 505, 360, 430, 4, 18),
                $this->asset('fita-adesiva-kraft', 'Fita da memória', 635, 475, 230, 70, -4, 31),
                $this->label('Memória 3', 'o detalhe pequeno que eu nunca esqueci', 120, 825, 400, 170, 3, 26),
                $this->label('Memória 4', 'a parte bonita de olhar para trás', 535, 1010, 390, 150, -3, 28),
                $this->asset('selo-vintage', 'Selo da linha', 145, 1050, 135, 135, -7, 32),
            ]),
            $this->page(PageType::Gallery, 'Fotos em molduras antigas', 30, [
                $this->text('Título molduras antigas', 'Fotografias encontradas entre páginas', 112, 92, 840, 110, 48, 'heading', 'left', -1, 34),
                $this->image('Retrato antigo 1', 'Primeiro retrato antigo', 105, 245, 365, 450, -5, 20),
                $this->asset('fita-adesiva-kraft', 'Fita do primeiro retrato', 175, 214, 230, 70, 4, 32),
                $this->image('Retrato antigo 2', 'Segundo retrato antigo', 590, 225, 345, 425, 4, 22),
                $this->asset('clipe-de-metal', 'Clipe do segundo retrato', 825, 185, 80, 170, 8, 33),
                $this->image('Retrato antigo 3', 'Terceiro retrato antigo', 330, 765, 405, 465, -2, 24),
                $this->asset('fita-adesiva-kraft', 'Fita do terceiro retrato', 410, 730, 245, 72, 5, 36),
                $this->asset('tira-de-filme', 'Filme antigo', 810, 720, 125, 420, 6, 37),
                $this->label('Legenda da galeria vintage', 'a luz muda; o que sentimos continua aqui', 95, 825, 275, 180, -5, 38),
            ]),
            $this->page(PageType::Letter, 'Carta curta vintage', 40, [
                $this->asset('papel-rasgado', 'Papel carta vintage', 110, 155, 845, 660, 2, 8),
                $this->asset('clipe-de-metal', 'Clipe da carta vintage', 805, 125, 84, 180, 8, 30),
                $this->text('Carta curta editável', "Tem lembranças que não fazem barulho.\n\nElas ficam por perto, entre uma fotografia antiga e uma frase meio apagada, lembrando que algumas fases não acabam: apenas mudam de lugar dentro da gente.", 175, 245, 710, 485, 43, 'handwritten', 'left', -1, 22),
                $this->asset('jornal-recortado', 'Recorte atrás da carta', 95, 845, 410, 260, -6, 5),
                $this->asset('raminho-prensado', 'Flor da carta vintage', 745, 770, 145, 310, 7, 31),
                $this->label('Etiqueta carta vintage', 'para guardar com calma', 420, 970, 360, 120, 3, 32),
            ]),
            $this->page(PageType::Final, 'Final nostálgico', 50, [
                $this->asset('papel-rasgado', 'Papel do final nostálgico', 120, 165, 835, 485, 2, 8),
                $this->text('Texto final vintage', "Algumas memórias não precisam ser perfeitas.\n\nElas só precisam continuar aqui.", 180, 285, 710, 245, 57, 'handwritten', 'center', -2, 22),
                $this->image('Foto nostálgica final', 'Uma lembrança nostálgica', 560, 745, 365, 430, 4, 24),
                $this->asset('fita-adesiva-kraft', 'Fita final vintage', 630, 713, 230, 72, -5, 32),
                $this->asset('selo-vintage', 'Selo final vintage', 125, 760, 145, 145, 6, 34),
                $this->label('Etiqueta final vintage', 'o tempo passa; a parte bonita fica', 145, 925, 390, 165, -4, 36),
                $this->asset('raminho-prensado', 'Raminho final vintage', 175, 1040, 135, 250, -7, 37),
                $this->asset('bilhete-de-memoria', 'Bilhete final vintage', 600, 1100, 330, 145, 4, 38),
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
    private function interactiveEnvelope(
        string $name,
        string $title,
        string $content,
        int $x,
        int $y,
        int $w,
        int $h,
        int $rotation,
        int $z,
        string $variant = 'kraft',
    ): array {
        $id = $this->id($name);

        return [
            'id' => $id,
            'type' => 'interactive_envelope',
            'slotKey' => $id,
            'name' => $name,
            'title' => $title,
            'content' => $content,
            'x' => $x,
            'y' => $y,
            'w' => $w,
            'h' => $h,
            'rotation' => $rotation,
            'z' => $z,
            'state' => [
                'defaultOpen' => false,
            ],
            'style' => [
                'variant' => $variant,
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function flipPolaroid(
        string $name,
        string $placeholderLabel,
        string $caption,
        string $backText,
        int $x,
        int $y,
        int $w,
        int $h,
        int $rotation,
        int $z,
    ): array {
        $id = $this->id($name);

        return [
            'id' => $id,
            'type' => 'flip_polaroid',
            'slotKey' => $id,
            'name' => $name,
            'x' => $x,
            'y' => $y,
            'w' => $w,
            'h' => $h,
            'rotation' => $rotation,
            'z' => $z,
            'front' => [
                'mediaItemId' => null,
                'placeholderLabel' => $placeholderLabel,
                'caption' => $caption,
            ],
            'back' => [
                'text' => $backText,
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
            'fontSize' => mb_strlen($text) > 52 ? 25 : (mb_strlen($text) > 36 ? 29 : 33),
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
            ->filter(fn (array $element): bool => in_array($element['type'] ?? null, ['text', 'image', 'interactive_envelope', 'flip_polaroid'], true) || ($element['editableText'] ?? false) === true)
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
