import { Save } from 'lucide-react';

export type GiftMetadataDraft = {
    title: string;
    recipient_name: string;
    sender_name: string;
};

type GiftMetadataPanelProps = {
    disabled: boolean;
    dirty: boolean;
    errors: Partial<Record<keyof GiftMetadataDraft, string>>;
    metadata: GiftMetadataDraft;
    onChange: (field: keyof GiftMetadataDraft, value: string) => void;
    onSave: () => void;
    saving: boolean;
    saved: boolean;
};

export function GiftMetadataPanel({ disabled, dirty, errors, metadata, onChange, onSave, saved, saving }: GiftMetadataPanelProps) {
    return (
        <section className="rounded-[8px] border border-[#D8B991] bg-[#FFF7EE] p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-sm font-semibold uppercase text-[#7A2634]">Dados do presente</h2>
                    <p className="mt-1 text-xs text-[#6F5A4A]">{dirty ? 'Alterações não salvas' : saved ? 'Salvo' : 'Metadados básicos'}</p>
                </div>
                <button
                    className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-[#8F211F] bg-[#D93632] px-3 text-sm font-semibold text-[#FFF7EE] hover:bg-[#B92827] disabled:opacity-60"
                    disabled={disabled || saving || !dirty}
                    onClick={onSave}
                    type="button"
                >
                    <Save aria-hidden="true" className="h-4 w-4" />
                    {saving ? 'Salvando...' : 'Salvar'}
                </button>
            </div>

            <div className="mt-4 grid gap-3">
                <Field
                    disabled={disabled}
                    error={errors.title}
                    label="Título"
                    maxLength={120}
                    onChange={(value) => onChange('title', value)}
                    value={metadata.title}
                />
                <Field
                    disabled={disabled}
                    error={errors.recipient_name}
                    label="Para"
                    maxLength={80}
                    onChange={(value) => onChange('recipient_name', value)}
                    value={metadata.recipient_name}
                />
                <Field
                    disabled={disabled}
                    error={errors.sender_name}
                    label="De"
                    maxLength={80}
                    onChange={(value) => onChange('sender_name', value)}
                    value={metadata.sender_name}
                />
            </div>
        </section>
    );
}

type FieldProps = {
    disabled: boolean;
    error?: string;
    label: string;
    maxLength: number;
    onChange: (value: string) => void;
    value: string;
};

function Field({ disabled, error, label, maxLength, onChange, value }: FieldProps) {
    return (
        <label className="grid gap-2 text-sm font-semibold text-[#1F150A]">
            {label}
            <input
                className="min-h-10 rounded-[6px] border border-[#CBA980] bg-white px-3 text-sm font-normal text-[#1F150A] outline-none focus:border-[#D93632]"
                disabled={disabled}
                maxLength={maxLength}
                onChange={(event) => onChange(event.target.value)}
                value={value}
            />
            {error && <span className="text-xs text-[#D93632]">{error}</span>}
        </label>
    );
}
