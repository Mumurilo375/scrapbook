import { Check, Clipboard } from 'lucide-react';
import { useState } from 'react';

type CopyPublicLinkButtonProps = {
    className?: string;
    publicUrl: string;
};

export function CopyPublicLinkButton({ className, publicUrl }: CopyPublicLinkButtonProps) {
    const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle');

    async function copy() {
        const url = absoluteUrl(publicUrl);

        try {
            await navigator.clipboard.writeText(url);
            setStatus('copied');
            window.setTimeout(() => setStatus('idle'), 1800);
        } catch {
            setStatus('error');
            window.setTimeout(() => setStatus('idle'), 2400);
        }
    }

    return (
        <button className={className} onClick={copy} type="button">
            {status === 'copied' ? (
                <Check aria-hidden="true" className="h-4 w-4" />
            ) : (
                <Clipboard aria-hidden="true" className="h-4 w-4" />
            )}
            {status === 'copied' ? 'Copiado' : status === 'error' ? 'Não copiou' : 'Copiar link'}
        </button>
    );
}

function absoluteUrl(url: string): string {
    if (typeof window === 'undefined') {
        return url;
    }

    return new URL(url, window.location.origin).toString();
}
