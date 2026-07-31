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
        <section className="gift-editor-inspector-section grid text-[#342E38]">
            <header className="border-b border-[#D8D2DE] pb-4">
                <h2 className="font-display text-lg font-bold tracking-[-0.02em] text-[#21162D]">Presente</h2>
                <p className="mt-1.5 text-sm leading-5 text-[#746D78]">
                    Esses dados aparecem no painel, revisão e experiência final.
                </p>
            </header>

            <div className="divide-y divide-[#D8D2DE]">
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
        <label className="grid gap-2 py-3.5 text-sm font-semibold text-[#342E38]">
            {label}
            <input
                aria-invalid={Boolean(error)}
                className={`h-11 rounded-[6px] border bg-white px-3 text-sm font-normal text-[#342E38] outline-none transition placeholder:text-[#746D78] focus:ring-2 disabled:cursor-not-allowed disabled:bg-[#EFEBF3] disabled:text-[#746D78] ${
                    error
                        ? 'border-[#C85B47] focus:border-[#C85B47] focus:ring-[#C85B4733]'
                        : 'border-[#978E9C] focus:border-[#21162D] focus:ring-[#FF765B66]'
                }`}
                disabled={disabled}
                maxLength={maxLength}
                onChange={(event) => onChange(event.target.value)}
                type="text"
                value={value}
            />
            {error && (
                <span className="text-xs font-semibold text-[#7C3024]" role="alert">
                    {error}
                </span>
            )}
        </label>
    );
}
