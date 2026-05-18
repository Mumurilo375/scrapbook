<?php

namespace App\Domain\Gifts\Actions;

use App\Domain\Gifts\Data\GiftQrCode;
use App\Domain\Gifts\Models\Gift;
use App\Domain\Gifts\Services\GiftShareUrlGenerator;
use chillerlan\QRCode\Common\EccLevel;
use chillerlan\QRCode\Output\QROutputInterface;
use chillerlan\QRCode\QRCode;
use chillerlan\QRCode\QROptions;
use Illuminate\Support\Str;

final readonly class GenerateGiftQrCode
{
    public function __construct(private GiftShareUrlGenerator $urlGenerator) {}

    public function handle(Gift $gift): GiftQrCode
    {
        $publicUrl = $this->urlGenerator->publicUrlOrFail($gift);

        $options = new QROptions([
            'addQuietzone' => true,
            'eccLevel' => EccLevel::M,
            'outputBase64' => false,
            'outputType' => QROutputInterface::MARKUP_SVG,
            'quietzoneSize' => 4,
            'scale' => 10,
            'svgAddXmlHeader' => true,
            'svgUseFillAttributes' => true,
        ]);

        $svg = (new QRCode($options))->render($publicUrl);

        return new GiftQrCode(
            payload: $publicUrl,
            svg: $svg,
            filename: $this->filename($gift),
        );
    }

    private function filename(Gift $gift): string
    {
        $slug = is_string($gift->slug) && $gift->slug !== ''
            ? $gift->slug
            : Str::slug((string) $gift->title);

        $slug = $slug !== '' ? $slug : 'presente';

        return Str::limit($slug, 80, '').'-qr-code.svg';
    }
}
