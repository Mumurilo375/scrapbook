<?php

namespace App\Http\Controllers\Gifts;

use App\Domain\Gifts\Models\Gift;
use App\Http\Controllers\Controller;
use BackedEnum;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserGiftDashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $gifts = Gift::query()
            ->where('user_id', $request->user()->id)
            ->with(['occasion', 'templateVersion.template'])
            ->orderByDesc('last_edited_at')
            ->orderByDesc('updated_at')
            ->get()
            ->map(fn (Gift $gift): array => [
                'id' => $gift->id,
                'title' => $gift->title,
                'status' => $this->enumValue($gift->status),
                'updated_at' => $gift->updated_at?->toIso8601String(),
                'last_edited_at' => $gift->last_edited_at?->toIso8601String(),
                'expires_at' => $gift->expires_at?->toIso8601String(),
                'occasion' => $gift->occasion ? [
                    'name' => $gift->occasion->name,
                    'slug' => $gift->occasion->slug,
                ] : null,
                'template' => $gift->templateVersion?->template ? [
                    'name' => $gift->templateVersion->template->name,
                    'slug' => $gift->templateVersion->template->slug,
                ] : null,
                'edit_url' => route('app.gifts.edit', $gift),
            ])
            ->values();

        return Inertia::render('gifts/Dashboard/GiftIndex', [
            'gifts' => $gifts,
            'createUrl' => route('create.index'),
        ]);
    }

    private function enumValue(mixed $value): string
    {
        return $value instanceof BackedEnum ? $value->value : (string) $value;
    }
}
