<?php

namespace App\Http\Requests\Gifts;

use App\Domain\Gifts\Enums\GiftStatus;
use App\Domain\Gifts\Models\Gift;
use App\Domain\Gifts\Models\GiftPage;
use BackedEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateGiftPageCanvasRequest extends FormRequest
{
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
            'canvas.elements' => ['required', 'array'],
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

            $errors = [];
            $this->inspectCanvas($this->input('canvas'), $errors);

            if ($errors !== []) {
                $validator->errors()->add('canvas', $errors[0]);
            }
        });
    }

    /**
     * @param  array<int, string>  $errors
     */
    private function inspectCanvas(mixed $value, array &$errors, string $key = ''): void
    {
        if ($errors !== []) {
            return;
        }

        if (is_array($value)) {
            foreach ($value as $childKey => $child) {
                $this->inspectCanvas($child, $errors, strtolower((string) $childKey));
            }

            return;
        }

        if (! is_string($value)) {
            return;
        }

        if (preg_match('/https?:\/\//i', $value) === 1) {
            $errors[] = 'O canvas não pode referenciar URLs externas nesta etapa.';

            return;
        }

        if (in_array($key, ['html', 'innerhtml'], true)) {
            $errors[] = 'O canvas não pode receber HTML arbitrário.';

            return;
        }

        if ($key === 'text' && preg_match('/<[^>]+>/', $value) === 1) {
            $errors[] = 'Textos do canvas devem ser texto puro, sem HTML.';
        }
    }

    private function enumValue(mixed $value): string
    {
        return $value instanceof BackedEnum ? $value->value : (string) $value;
    }
}
