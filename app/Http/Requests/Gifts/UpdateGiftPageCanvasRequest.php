<?php

namespace App\Http\Requests\Gifts;

use App\Domain\Editor\CanvasNormalizer;
use App\Domain\Editor\CanvasSecurity;
use App\Domain\Gifts\Enums\GiftStatus;
use App\Domain\Gifts\Models\Gift;
use App\Domain\Gifts\Models\GiftPage;
use BackedEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Validator;

class UpdateGiftPageCanvasRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $canvas = $this->input('canvas');

        if (is_array($canvas)) {
            $this->merge([
                'canvas' => app(CanvasNormalizer::class)->normalize($canvas),
            ]);
        }
    }

    public function authorize(): bool
    {
        $gift = $this->route('gift');
        $giftPage = $this->route('giftPage');

        return $gift instanceof Gift
            && $giftPage instanceof GiftPage
            && $giftPage->gift_id === $gift->id
            && $this->user() !== null
            && $this->user()->can('update', $giftPage);
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'canvas' => ['required', 'array'],
            'canvas.schemaVersion' => ['required', 'integer', 'in:1'],
            'canvas.elements' => ['present', 'array'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $gift = $this->route('gift');
            $giftPage = $this->route('giftPage');

            if ($gift instanceof Gift && $this->enumValue($gift->status) !== GiftStatus::Draft->value) {
                $validator->errors()->add('gift', 'Somente páginas de rascunhos podem ser editadas nesta etapa.');
            }

            if ($gift instanceof Gift && $giftPage instanceof GiftPage && $giftPage->gift_id !== $gift->id) {
                $validator->errors()->add('page', 'Esta página não pertence ao presente informado.');
            }

            $canvas = $this->input('canvas');

            if (is_array($canvas) && $giftPage instanceof GiftPage) {
                $canvasSecurity = app(CanvasSecurity::class);

                try {
                    $canvasSecurity->validate($canvas, $canvasSecurity->textMaxLengthForPage($giftPage));
                } catch (ValidationException $exception) {
                    foreach ($exception->errors() as $field => $messages) {
                        $validator->errors()->add($field, $messages[0] ?? 'Canvas inválido.');
                    }
                }
            }
        });
    }

    private function enumValue(mixed $value): string
    {
        return $value instanceof BackedEnum ? $value->value : (string) $value;
    }
}
