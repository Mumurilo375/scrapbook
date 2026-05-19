<?php

namespace App\Filament\Pages;

use App\Domain\VisualQuality\VisualQualityAuditor;
use App\Filament\Support\AdminAccess;
use BackedEnum;
use Filament\Pages\Page;
use Filament\Support\Icons\Heroicon;
use UnitEnum;

class VisualQa extends Page
{
    protected static ?string $slug = 'visual-qa';

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedClipboardDocumentCheck;

    protected static string|UnitEnum|null $navigationGroup = 'Visual';

    protected static ?string $navigationLabel = 'QA visual';

    protected static ?int $navigationSort = 50;

    protected static ?string $title = 'QA visual/mobile';

    protected string $view = 'filament.pages.visual-qa';

    public static function canAccess(): bool
    {
        return AdminAccess::isStaff();
    }

    /**
     * @return array{counts: array{error: int, warning: int, info: int, total: int}, groups: array<string, array<int, array{severity: string, scope: string, model: string, id: string|null, title: string, message: string, hint: string}>>}
     */
    public function visualAudit(): array
    {
        return app(VisualQualityAuditor::class)->audit()->toArray();
    }

    /**
     * @return array<int, array{title: string, description: string, items: array<int, string>}>
     */
    public function checklistGroups(): array
    {
        return [
            [
                'title' => 'Assets',
                'description' => 'Validar o material real antes de montar templates finais.',
                'items' => [
                    'Subir stickers reais no admin usando PNG/WebP transparente com 512px ou 1024px no maior lado.',
                    'Criar categorias claras para romance, amizade, aniversario, fitas, selos, papeis e molduras.',
                    'Conferir preview, dimensoes, MIME, tamanho e ausencia de checkerboard fora do preview tecnico.',
                    'Associar assets ativos ao tema correto e deixar globais apenas quando fizer sentido.',
                ],
            ],
            [
                'title' => 'Tema',
                'description' => 'Confirmar que cada tema tem textura e direcao visual propria.',
                'items' => [
                    'Escolher paper_texture, background_texture e book_texture quando houver assets reais.',
                    'Usar papeis em proporcao proxima de 1080x1350 ou 2160x2700, JPG/WebP otimizado.',
                    'Evitar fundos pequenos esticados, bordas estranhas ou arquivos gigantes.',
                    'Abrir preview de tema e conferir papel, livro, lombada, sombras e overlays.',
                ],
            ],
            [
                'title' => 'Editor',
                'description' => 'Montar uma pagina real pelo fluxo usado pelo cliente.',
                'items' => [
                    'Criar Gift-base a partir de template publicado e montar paginas no editor.',
                    'Trocar papel da pagina pela aba Pagina e voltar para papel do tema.',
                    'Adicionar stickers por categoria, mover, redimensionar, rotacionar, duplicar e ajustar camadas.',
                    'Adicionar envelope, editar titulo/conteudo e garantir que autosave, undo e redo preservam o elemento.',
                    'Adicionar polaroid viravel, trocar foto pelo fluxo contextual e editar legenda/verso.',
                    'No celular, conferir topbar, abas, painel, teclado virtual, tamanho do canvas e ausencia de overflow horizontal.',
                ],
            ],
            [
                'title' => 'Template',
                'description' => 'Transformar a composicao real em template reutilizavel sem vazar dados pessoais.',
                'items' => [
                    'Converter Gift-base em Template pelo admin.',
                    'Confirmar que envelopes preservam textos default editaveis.',
                    'Confirmar que polaroids removem mediaItemId/src pessoais e viram placeholder.',
                    'Publicar TemplateVersion apenas depois de revisar canvas seguro, paginas e editable schema.',
                    'Criar Gift de cliente a partir do template publicado e revisar placeholders.',
                ],
            ],
            [
                'title' => 'Viewer',
                'description' => 'Validar a experiencia final como destinatario.',
                'items' => [
                    'Publicar Gift pelo fluxo atual e abrir preview privado.',
                    'Abrir viewer publico por slug + public_code em celular real ou viewport mobile.',
                    'Navegar no Book Mode, confirmar pagina unica no mobile e spread no desktop largo.',
                    'Abrir envelope e virar polaroid sem disparar troca de pagina acidental.',
                    'Checar que botoes, CTA discreto e estado final nao cobrem conteudo importante.',
                ],
            ],
            [
                'title' => 'Compartilhamento',
                'description' => 'Conferir o pacote final que o cliente vai enviar.',
                'items' => [
                    'Abrir tela de compartilhamento do Gift publicado.',
                    'Copiar link publico, abrir QR Code e abrir cartao compartilhavel.',
                    'Baixar QR/cartao quando aplicavel e validar que apontam para a URL publica.',
                    'Confirmar que viewer publico nao expoe storage_path, IDs internos ou dados de pagamento.',
                ],
            ],
            [
                'title' => 'Performance',
                'description' => 'Fazer uma passada curta para detectar travamentos obvios.',
                'items' => [
                    'Testar com muitas paginas, stickers, papeis e fotos reais.',
                    'Verificar se listas de assets continuam navegaveis e se imagens carregam sob demanda.',
                    'Checar se texturas grandes nao deixam editor/viewer travados no celular.',
                    'Repetir abertura, swipe, envelope, polaroid e QR em rede lenta quando possivel.',
                ],
            ],
        ];
    }
}
