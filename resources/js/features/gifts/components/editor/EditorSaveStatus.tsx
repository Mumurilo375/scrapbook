import { AlertCircle, CheckCircle2, CloudOff, Clock3, LoaderCircle } from 'lucide-react';

import type { SaveStatus } from './editorTypes';

type EditorSaveStatusProps = {
    detail?: string | null;
    status: SaveStatus;
};

export function EditorSaveStatus({ detail, status }: EditorSaveStatusProps) {
    const meta = statusMeta(status);
    const Icon = meta.icon;

    return (
        <div
            aria-atomic="true"
            aria-live="polite"
            className={`inline-flex min-h-10 shrink-0 snap-start items-center gap-2 whitespace-nowrap px-1 text-xs font-bold ${meta.className}`}
            role="status"
        >
            <Icon aria-hidden="true" className={`h-4 w-4 ${status === 'saving' ? 'motion-safe:animate-spin' : ''}`} />
            <span>{meta.label}</span>
            {detail ? (
                <span className="hidden max-w-52 truncate font-medium opacity-70 2xl:inline">{detail}</span>
            ) : null}
        </div>
    );
}

function statusMeta(status: SaveStatus) {
    if (status === 'dirty') {
        return {
            className: 'text-[#F0B875]',
            icon: Clock3,
            label: 'Alterações pendentes',
        };
    }

    if (status === 'saving') {
        return {
            className: 'text-[#D9CFE0]',
            icon: LoaderCircle,
            label: 'Salvando...',
        };
    }

    if (status === 'error') {
        return {
            className: 'text-[#FF9C8A]',
            icon: AlertCircle,
            label: 'Erro ao salvar',
        };
    }

    if (status === 'offline') {
        return {
            className: 'text-[#CFC3D7]',
            icon: CloudOff,
            label: 'Sem conexão',
        };
    }

    return {
        className: 'text-[#8CD7C1]',
        icon: CheckCircle2,
        label: 'Salvo',
    };
}
