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
            className={`inline-flex min-h-9 items-center gap-2 rounded-[6px] border px-3 text-sm font-semibold ${meta.className}`}
        >
            <Icon aria-hidden="true" className={`h-4 w-4 ${status === 'saving' ? 'animate-spin' : ''}`} />
            <span>{meta.label}</span>
            {detail ? (
                <span className="hidden max-w-52 truncate text-xs font-medium opacity-80 lg:inline">{detail}</span>
            ) : null}
        </div>
    );
}

function statusMeta(status: SaveStatus) {
    if (status === 'dirty') {
        return {
            className: 'border-[#D8B991] bg-[#FFF7EE] text-[#6F4F22]',
            icon: Clock3,
            label: 'Alterações pendentes',
        };
    }

    if (status === 'saving') {
        return {
            className: 'border-[#CBA980] bg-[#FFF7EE] text-[#42291D]',
            icon: LoaderCircle,
            label: 'Salvando...',
        };
    }

    if (status === 'error') {
        return {
            className: 'border-[#D99A8B] bg-[#FFF0EC] text-[#8A2E21]',
            icon: AlertCircle,
            label: 'Erro ao salvar',
        };
    }

    if (status === 'offline') {
        return {
            className: 'border-[#B9A894] bg-[#F3E9DA] text-[#5B4A3A]',
            icon: CloudOff,
            label: 'Sem conexão',
        };
    }

    return {
        className: 'border-[#C7D2AE] bg-[#F4F8EC] text-[#50623C]',
        icon: CheckCircle2,
        label: 'Salvo',
    };
}
