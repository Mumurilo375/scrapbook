<?php

namespace App\Http\Middleware;

use App\Domain\Templates\Models\TemplateVersion;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PreserveGiftCreationIntent
{
    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() === null && $request->isMethod('POST') && $request->routeIs('gifts.store')) {
            $returnTo = self::returnUrlFor($request);

            $request->session()->put('gift.create.return_to', $returnTo);
            $request->session()->put('url.intended', $returnTo);
        }

        return $next($request);
    }

    public static function returnUrlFor(Request $request): string
    {
        $templateVersionId = $request->input('template_version_id');

        if (is_string($templateVersionId) && $templateVersionId !== '') {
            $templateVersion = TemplateVersion::query()
                ->with('template.occasion')
                ->find($templateVersionId);

            $template = $templateVersion?->template;
            $occasion = $template?->occasion;

            if ($template?->slug && $occasion?->slug) {
                return route('create.template.show', [$occasion->slug, $template->slug], false);
            }
        }

        return route('create.index', absolute: false);
    }
}
