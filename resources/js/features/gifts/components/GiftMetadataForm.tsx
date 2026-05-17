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
        <form className="rounded-[8px] border border-[#D8B991] bg-[#FFF7EE] p-5 shadow-sm" onSubmit={submit}>
            <div className="grid gap-4 md:grid-cols-3">
                <label className="grid gap-2 text-sm font-semibold text-[#1F150A] md:col-span-3">
                    Título
                    <input
                        className="min-h-11 rounded-[6px] border border-[#CBA980] bg-white px-3 text-sm font-normal text-[#1F150A] outline-none focus:border-[#D93632]"
                        maxLength={120}
                        onChange={(event) => setData('title', event.target.value)}
                        value={data.title}
                    />
                    {errors.title && <span className="text-xs text-[#D93632]">{errors.title}</span>}
                </label>
                <label className="grid gap-2 text-sm font-semibold text-[#1F150A]">
                    Para
                    <input
                        className="min-h-11 rounded-[6px] border border-[#CBA980] bg-white px-3 text-sm font-normal text-[#1F150A] outline-none focus:border-[#D93632]"
                        maxLength={80}
                        onChange={(event) => setData('recipient_name', event.target.value)}
                        value={data.recipient_name}
                    />
                    {errors.recipient_name && <span className="text-xs text-[#D93632]">{errors.recipient_name}</span>}
                </label>
                <label className="grid gap-2 text-sm font-semibold text-[#1F150A]">
                    De
                    <input
                        className="min-h-11 rounded-[6px] border border-[#CBA980] bg-white px-3 text-sm font-normal text-[#1F150A] outline-none focus:border-[#D93632]"
                        maxLength={80}
                        onChange={(event) => setData('sender_name', event.target.value)}
                        value={data.sender_name}
                    />
                    {errors.sender_name && <span className="text-xs text-[#D93632]">{errors.sender_name}</span>}
                </label>
                <div className="flex items-end">
                    <button
                        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[6px] border border-[#8F211F] bg-[#D93632] px-4 text-sm font-semibold text-[#FFF7EE] transition hover:bg-[#B92827] disabled:opacity-60"
                        disabled={processing}
                        type="submit"
                    >
                        <Save aria-hidden="true" className="h-4 w-4" />
                        Salvar
                    </button>
                </div>
            </div>
            {recentlySuccessful && <p className="mt-3 text-sm font-semibold text-[#6F7E55]">Rascunho salvo.</p>}
        </form>
    );
}
