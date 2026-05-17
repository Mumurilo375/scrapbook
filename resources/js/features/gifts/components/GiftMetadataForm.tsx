import { useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
import type { FormEvent } from 'react';

import type { EditableGift } from '../types';

type GiftMetadataFormProps = {
    gift: EditableGift;
};

export function GiftMetadataForm({ gift }: GiftMetadataFormProps) {
    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        title: gift.title,
        recipient_name: gift.recipient_name ?? '',
        sender_name: gift.sender_name ?? '',
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        patch(gift.update_url, { preserveScroll: true });
    }

    return (
        <form className="rounded-[8px] border border-[#dfc7a7] bg-[#FFF8EC] p-5 shadow-sm" onSubmit={submit}>
            <div className="grid gap-4 md:grid-cols-3">
                <label className="grid gap-2 text-sm font-semibold text-[#3A2418] md:col-span-3">
                    Título
                    <input
                        className="min-h-11 rounded-[6px] border border-[#d8b98e] bg-white px-3 text-sm font-normal text-[#3A2418] outline-none focus:border-[#8E2F2F]"
                        maxLength={120}
                        onChange={(event) => setData('title', event.target.value)}
                        value={data.title}
                    />
                    {errors.title && <span className="text-xs text-[#8E2F2F]">{errors.title}</span>}
                </label>
                <label className="grid gap-2 text-sm font-semibold text-[#3A2418]">
                    Para
                    <input
                        className="min-h-11 rounded-[6px] border border-[#d8b98e] bg-white px-3 text-sm font-normal text-[#3A2418] outline-none focus:border-[#8E2F2F]"
                        maxLength={80}
                        onChange={(event) => setData('recipient_name', event.target.value)}
                        value={data.recipient_name}
                    />
                    {errors.recipient_name && <span className="text-xs text-[#8E2F2F]">{errors.recipient_name}</span>}
                </label>
                <label className="grid gap-2 text-sm font-semibold text-[#3A2418]">
                    De
                    <input
                        className="min-h-11 rounded-[6px] border border-[#d8b98e] bg-white px-3 text-sm font-normal text-[#3A2418] outline-none focus:border-[#8E2F2F]"
                        maxLength={80}
                        onChange={(event) => setData('sender_name', event.target.value)}
                        value={data.sender_name}
                    />
                    {errors.sender_name && <span className="text-xs text-[#8E2F2F]">{errors.sender_name}</span>}
                </label>
                <div className="flex items-end">
                    <button
                        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[6px] border border-[#5f2c24] bg-[#8E2F2F] px-4 text-sm font-semibold text-[#FFF8EC] transition hover:bg-[#742727] disabled:opacity-60"
                        disabled={processing}
                        type="submit"
                    >
                        <Save aria-hidden="true" className="h-4 w-4" />
                        Salvar
                    </button>
                </div>
            </div>
            {recentlySuccessful && <p className="mt-3 text-sm font-semibold text-[#65723d]">Rascunho salvo.</p>}
        </form>
    );
}
