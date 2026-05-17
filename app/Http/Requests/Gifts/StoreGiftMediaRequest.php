<?php

namespace App\Http\Requests\Gifts;

use App\Domain\Gifts\Enums\GiftStatus;
use App\Domain\Gifts\Models\Gift;
use Illuminate\Foundation\Http\FormRequest;

class StoreGiftMediaRequest extends FormRequest
{
    public function authorize(): bool
    {
        $gift = $this->route('gift');

        return $gift instanceof Gift
            && $this->user() !== null
            && $gift->user_id === $this->user()->id
            && $gift->statusEnum() === GiftStatus::Draft;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        $maxUploadKb = max(1, (int) config('scrapbook.media.max_upload_kb', 5120));
        $maxWidth = max(1, (int) config('scrapbook.media.max_input_width', 6000));
        $maxHeight = max(1, (int) config('scrapbook.media.max_input_height', 6000));
        $mimeTypes = implode(',', config('scrapbook.media.allowed_mime_types', ['image/jpeg', 'image/png', 'image/webp']));
        $extensions = implode(',', config('scrapbook.media.allowed_extensions', ['jpg', 'jpeg', 'png', 'webp']));

        return [
            'image' => [
                'required',
                'file',
                "mimetypes:{$mimeTypes}",
                "mimes:{$extensions}",
                "extensions:{$extensions}",
                "dimensions:max_width={$maxWidth},max_height={$maxHeight}",
                "max:{$maxUploadKb}",
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'image' => 'imagem',
        ];
    }
}
