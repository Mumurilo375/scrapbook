<?php

namespace App\Http\Requests\Gifts;

use App\Domain\Payments\Models\Plan;
use App\Domain\Templates\Enums\TemplateVersionStatus;
use App\Domain\Templates\Models\TemplateVersion;
use App\Domain\Themes\Enums\ThemeVersionStatus;
use App\Domain\Themes\Models\ThemeVersion;
use BackedEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreGiftFromTemplateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'template_version_id' => ['required', 'string', 'exists:template_versions,id'],
            'theme_version_id' => ['nullable', 'string', 'exists:theme_versions,id'],
            'plan_id' => ['nullable', 'string', 'exists:plans,id'],
            'occasion_id' => ['nullable', 'string', 'exists:occasions,id'],
            'title' => ['nullable', 'string', 'max:120'],
            'recipient_name' => ['nullable', 'string', 'max:80'],
            'sender_name' => ['nullable', 'string', 'max:80'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $templateVersion = TemplateVersion::query()
                ->with(['template.occasion', 'themeVersion.theme'])
                ->find($this->input('template_version_id'));

            if (! $templateVersion instanceof TemplateVersion) {
                return;
            }

            if ($this->enumValue($templateVersion->status) !== TemplateVersionStatus::Published->value) {
                $validator->errors()->add('template_version_id', 'Use uma versão publicada de template.');
            }

            if (! $templateVersion->template?->is_active) {
                $validator->errors()->add('template_version_id', 'Este template não está ativo.');
            }

            if (! $templateVersion->template?->occasion?->is_active) {
                $validator->errors()->add('template_version_id', 'A ocasião deste template não está ativa.');
            }

            if ($this->filled('occasion_id') && $this->input('occasion_id') !== $templateVersion->template?->occasion_id) {
                $validator->errors()->add('occasion_id', 'A ocasião não pertence ao template selecionado.');
            }

            if ($this->filled('theme_version_id')) {
                $themeVersion = ThemeVersion::query()
                    ->with('theme')
                    ->find($this->input('theme_version_id'));

                if ($themeVersion instanceof ThemeVersion) {
                    if ($this->enumValue($themeVersion->status) !== ThemeVersionStatus::Published->value) {
                        $validator->errors()->add('theme_version_id', 'Use uma versão publicada de tema.');
                    }

                    if (! $themeVersion->theme?->is_active) {
                        $validator->errors()->add('theme_version_id', 'O tema selecionado não está ativo.');
                    }
                }
            }

            if ($this->filled('plan_id')) {
                $plan = Plan::query()->find($this->input('plan_id'));

                if ($plan instanceof Plan && ! $plan->is_active) {
                    $validator->errors()->add('plan_id', 'Use um plano ativo.');
                }
            }
        });
    }

    public function templateVersion(): TemplateVersion
    {
        return TemplateVersion::query()
            ->with(['template.occasion', 'themeVersion.theme', 'pages'])
            ->findOrFail($this->validated('template_version_id'));
    }

    private function enumValue(mixed $value): string
    {
        return $value instanceof BackedEnum ? $value->value : (string) $value;
    }
}
