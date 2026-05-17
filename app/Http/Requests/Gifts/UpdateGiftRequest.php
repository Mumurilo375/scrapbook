<?php

namespace App\Http\Requests\Gifts;

use App\Domain\Gifts\Enums\GiftStatus;
use App\Domain\Gifts\Models\Gift;
use BackedEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateGiftRequest extends FormRequest
{
    public function authorize(): bool
    {
        $gift = $this->route('gift');

        return $gift instanceof Gift
            && $this->user() !== null
            && $this->user()->can('update', $gift);
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'required', 'string', 'max:120'],
            'recipient_name' => ['sometimes', 'nullable', 'string', 'max:80'],
            'sender_name' => ['sometimes', 'nullable', 'string', 'max:80'],
            'settings' => ['sometimes', 'array'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $gift = $this->route('gift');

            if (! $gift instanceof Gift) {
                return;
            }

            if ($this->enumValue($gift->status) !== GiftStatus::Draft->value) {
                $validator->errors()->add('gift', 'Somente rascunhos podem ser editados nesta etapa.');
            }
        });
    }

    private function enumValue(mixed $value): string
    {
        return $value instanceof BackedEnum ? $value->value : (string) $value;
    }
}
