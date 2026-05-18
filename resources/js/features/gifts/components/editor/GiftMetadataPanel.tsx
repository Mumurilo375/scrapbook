export type GiftMetadataDraft = {
    title: string;
    recipient_name: string;
    sender_name: string;
};

type GiftMetadataPanelProps = {
    disabled: boolean;
    errors: Partial<Record<keyof GiftMetadataDraft, string>>;
    metadata: GiftMetadataDraft;
    onChange: (field: keyof GiftMetadataDraft, value: string) => void;
};

export function GiftMetadataPanel({ disabled, errors, metadata, onChange }: GiftMetadataPanelProps) {
    return (
        <section className="grid gap-4">
            <div>
                <h2 className="text-base font-semibold text-[#1F150A]">Presente</h2>
                <p className="mt-1 text-sm text-[#6F5A4A]">
                    Esses dados aparecem no painel, revisão e experiência final.
                </p>
            </div>

            <div className="grid gap-3">
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
