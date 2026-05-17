import { router } from '@inertiajs/react';
import type { FormDataConvertible } from '@inertiajs/core';
import { Code2, Save } from 'lucide-react';
import { useMemo, useState } from 'react';

import type { GiftPageSummary } from '../types';

type GiftPageListProps = {
    pages: GiftPageSummary[];
};

export function GiftPageList({ pages }: GiftPageListProps) {
    const initialDrafts = useMemo(
        () =>
            Object.fromEntries(
                pages.map((page) => [page.id, JSON.stringify(page.canvas, null, 2)]),
            ) as Record<string, string>,
        [pages],
    );
    const [drafts, setDrafts] = useState<Record<string, string>>(initialDrafts);
    const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
    const [savingPageId, setSavingPageId] = useState<string | null>(null);

    function savePage(page: GiftPageSummary) {
        let canvas: unknown;

        try {
            canvas = JSON.parse(drafts[page.id] ?? '{}');
        } catch {
            setLocalErrors((current) => ({ ...current, [page.id]: 'JSON inválido.' }));
            return;
        }

        if (!canvas || typeof canvas !== 'object' || Array.isArray(canvas)) {
            setLocalErrors((current) => ({ ...current, [page.id]: 'O canvas precisa ser um objeto JSON.' }));
            return;
        }

        setLocalErrors((current) => ({ ...current, [page.id]: '' }));
        setSavingPageId(page.id);

        router.patch(
            page.update_url,
            { canvas: canvas as FormDataConvertible },
            {
                preserveScroll: true,
                onFinish: () => setSavingPageId(null),
            },
        );
    }

    return (
        <div className="grid gap-4">
            {pages.map((page) => (
                <section className="rounded-[8px] border border-[#D8B991] bg-[#FFF7EE] p-5 shadow-sm" key={page.id}>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-[#D93632]">
                                <Code2 aria-hidden="true" className="h-4 w-4" />
                                <span className="text-xs font-semibold uppercase">Página {page.sort_order}</span>
                            </div>
                            <h3 className="mt-2 text-lg font-semibold text-[#1F150A]">{page.name}</h3>
                            <p className="mt-1 text-sm text-[#42291D]">{page.page_type}</p>
                        </div>
                        <button
                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[6px] border border-[#8F211F] bg-[#D93632] px-4 text-sm font-semibold text-[#FFF7EE] transition hover:bg-[#B92827] disabled:opacity-60"
                            disabled={page.locked || savingPageId === page.id}
                            onClick={() => savePage(page)}
                            type="button"
                        >
                            <Save aria-hidden="true" className="h-4 w-4" />
                            Salvar página
                        </button>
                    </div>
                    <textarea
                        className="mt-4 min-h-72 w-full resize-y rounded-[6px] border border-[#CBA980] bg-[#FFFBF6] p-3 font-mono text-xs leading-5 text-[#1F150A] outline-none focus:border-[#D93632]"
                        onChange={(event) => setDrafts((current) => ({ ...current, [page.id]: event.target.value }))}
                        spellCheck={false}
                        value={drafts[page.id] ?? ''}
                    />
                    {localErrors[page.id] && <p className="mt-2 text-sm font-semibold text-[#D93632]">{localErrors[page.id]}</p>}
                </section>
            ))}
        </div>
    );
}
