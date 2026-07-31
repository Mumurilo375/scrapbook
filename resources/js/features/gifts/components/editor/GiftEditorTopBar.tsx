import { Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRight,
    BookOpen,
    Check,
    CheckCircle2,
    ClipboardCheck,
    Clock3,
    CloudOff,
    CreditCard,
    Eye,
    LoaderCircle,
    LogOut,
    Redo2,
    Share2,
    Undo2,
} from 'lucide-react';

import { humanStatus } from '../formatters';
import type { EditorTab, SaveStatus } from './editorTypes';

type GiftEditorTopBarProps = {
    activeTab: EditorTab;
    canRedo: boolean;
    canUndo: boolean;
    dashboardUrl: string;
    historyDisabled: boolean;
    onChangeTab: (tab: EditorTab) => void;
    onRedo: () => void;
    onUndo: () => void;
    orderUrl: string | null;
    previewUrl: string;
    reviewUrl: string;
    saveDetail?: string | null;
    saveStatus: SaveStatus;
    shareUrl: string | null;
    status: string;
    title: string;
};

type EditorStep = {
    id: 'layout' | 'fill' | 'decorate' | 'adjust';
    label: string;
    tabs: readonly EditorTab[];
    targetTab: EditorTab;
};

const EDITOR_STEPS: readonly EditorStep[] = [
    {
        id: 'layout',
        label: 'Layout',
        tabs: ['page'],
        targetTab: 'page',
    },
    {
        id: 'fill',
        label: 'Preencher',
        tabs: ['content', 'images'],
        targetTab: 'content',
    },
    {
        id: 'decorate',
        label: 'Decorar',
        tabs: ['stickers', 'interactive'],
        targetTab: 'stickers',
    },
    {
        id: 'adjust',
        label: 'Ajustar',
        tabs: ['layers', 'gift', 'debug'],
        targetTab: 'layers',
    },
];

export function GiftEditorTopBar({
    activeTab,
    canRedo,
    canUndo,
    dashboardUrl,
    historyDisabled,
    onChangeTab,
    onRedo,
    onUndo,
    orderUrl,
    previewUrl,
    reviewUrl,
    saveDetail,
    saveStatus,
    shareUrl,
    status,
    title,
}: GiftEditorTopBarProps) {
    const activeStepIndex = Math.max(
        EDITOR_STEPS.findIndex((step) => step.tabs.includes(activeTab)),
        0,
    );
    const saveMeta = getSaveMeta(saveStatus);
    const SaveIcon = saveMeta.icon;

    return (
        <header className="gift-editor-topbar" data-save-status={saveStatus}>
            <div className="gift-editor-topbar__inner">
                <div className="gift-editor-topbar__identity">
                    <Link
                        aria-label="Ir para a página inicial do Scrapbook"
                        className="gift-editor-topbar__brand"
                        href="/"
                    >
                        <span aria-hidden="true" className="gift-editor-topbar__brand-mark">
                            <BookOpen />
                        </span>
                        <span aria-hidden="true" className="gift-editor-topbar__brand-copy">
                            <span>Álbum de</span>
                            <span>coleção afetiva</span>
                        </span>
                    </Link>

                    <span aria-hidden="true" className="gift-editor-topbar__identity-divider" />

                    <Link
                        aria-label={`Voltar para meus presentes. Presente atual: ${title}`}
                        className="gift-editor-topbar__project"
                        href={dashboardUrl}
                        title="Voltar para meus presentes"
                    >
                        <h1 className="gift-editor-topbar__title">{title}</h1>
                    </Link>

                    <div
                        aria-label={`Status do presente: ${humanStatus(status)}`}
                        className="gift-editor-topbar__gift-status"
                        data-status={status}
                        title={`Status do presente: ${humanStatus(status)}`}
                    >
                        <span aria-hidden="true" className="gift-editor-topbar__gift-status-mark" />
                        <span>{humanStatus(status)}</span>
                    </div>

                    <div
                        aria-atomic="true"
                        aria-live="polite"
                        className="gift-editor-topbar__save"
                        data-status={saveStatus}
                        role="status"
                    >
                        <SaveIcon
                            aria-hidden="true"
                            className={`gift-editor-topbar__save-icon ${
                                saveStatus === 'saving' ? 'gift-editor-topbar__save-icon--spinning' : ''
                            }`}
                        />
                        <span className="gift-editor-topbar__save-copy">
                            <span className="gift-editor-topbar__save-label">{saveMeta.label}</span>
                            {saveDetail ? <span className="gift-editor-topbar__save-detail">{saveDetail}</span> : null}
                        </span>
                    </div>
                </div>

                <nav aria-label="Etapas de criação do presente" className="gift-editor-topbar__steps">
                    <ol className="gift-editor-topbar__step-list">
                        {EDITOR_STEPS.map((step, index) => {
                            const state =
                                index === activeStepIndex
                                    ? 'current'
                                    : index < activeStepIndex
                                      ? 'complete'
                                      : 'upcoming';
                            const isCurrent = state === 'current';
                            const isComplete = state === 'complete';

                            return (
                                <li className="gift-editor-topbar__step-item" data-state={state} key={step.id}>
                                    <button
                                        aria-controls="editor-active-panel"
                                        aria-current={isCurrent ? 'step' : undefined}
                                        aria-label={`${index + 1}. ${step.label}${isComplete ? ', concluída' : isCurrent ? ', etapa atual' : ''}`}
                                        className="gift-editor-topbar__step-button"
                                        data-complete={isComplete}
                                        data-current={isCurrent}
                                        data-state={state}
                                        onClick={() => onChangeTab(step.targetTab)}
                                        type="button"
                                    >
                                        <span aria-hidden="true" className="gift-editor-topbar__step-number">
                                            {isComplete ? <Check /> : index + 1}
                                        </span>
                                        <span className="gift-editor-topbar__step-label">{step.label}</span>
                                    </button>

                                    {index < EDITOR_STEPS.length - 1 ? (
                                        <span
                                            aria-hidden="true"
                                            className="gift-editor-topbar__step-connector"
                                            data-complete={index < activeStepIndex}
                                        />
                                    ) : null}
                                </li>
                            );
                        })}
                    </ol>
                </nav>

                <div className="gift-editor-topbar__actions">
                    <div aria-label="Histórico da edição" className="gift-editor-topbar__history" role="group">
                        <button
                            aria-label="Desfazer"
                            className="gift-editor-topbar__icon-button"
                            disabled={historyDisabled || !canUndo}
                            onClick={onUndo}
                            title="Desfazer"
                            type="button"
                        >
                            <Undo2 aria-hidden="true" />
                        </button>
                        <button
                            aria-label="Refazer"
                            className="gift-editor-topbar__icon-button"
                            disabled={historyDisabled || !canRedo}
                            onClick={onRedo}
                            title="Refazer"
                            type="button"
                        >
                            <Redo2 aria-hidden="true" />
                        </button>
                    </div>

                    <Link
                        aria-label="Visualizar presente"
                        className="gift-editor-topbar__action gift-editor-topbar__action--preview"
                        href={previewUrl}
                    >
                        <Eye aria-hidden="true" />
                        <span>Visualizar</span>
                    </Link>

                    {shareUrl ? (
                        <Link
                            aria-label="Compartilhar presente"
                            className="gift-editor-topbar__action gift-editor-topbar__action--primary"
                            href={shareUrl}
                        >
                            <Share2 aria-hidden="true" />
                            <span>Compartilhar</span>
                        </Link>
                    ) : status === 'pending_payment' && orderUrl ? (
                        <Link
                            aria-label="Ver pedido do presente"
                            className="gift-editor-topbar__action gift-editor-topbar__action--primary"
                            href={orderUrl}
                        >
                            <CreditCard aria-hidden="true" />
                            <span>Ver pedido</span>
                        </Link>
                    ) : (
                        <Link
                            aria-label="Finalizar presente"
                            className="gift-editor-topbar__action gift-editor-topbar__action--primary"
                            href={reviewUrl}
                        >
                            <ClipboardCheck aria-hidden="true" className="gift-editor-topbar__primary-leading-icon" />
                            <span>Finalizar</span>
                            <ArrowRight aria-hidden="true" className="gift-editor-topbar__primary-arrow" />
                        </Link>
                    )}

                    <button
                        aria-label="Sair da conta"
                        className="gift-editor-topbar__icon-button gift-editor-topbar__logout"
                        onClick={() => router.post('/logout')}
                        title="Sair da conta"
                        type="button"
                    >
                        <LogOut aria-hidden="true" />
                    </button>
                </div>
            </div>
        </header>
    );
}

function getSaveMeta(status: SaveStatus) {
    if (status === 'dirty') {
        return {
            icon: Clock3,
            label: 'Alterações pendentes',
        };
    }

    if (status === 'saving') {
        return {
            icon: LoaderCircle,
            label: 'Salvando...',
        };
    }

    if (status === 'error') {
        return {
            icon: AlertCircle,
            label: 'Erro ao salvar',
        };
    }

    if (status === 'offline') {
        return {
            icon: CloudOff,
            label: 'Sem conexão',
        };
    }

    return {
        icon: CheckCircle2,
        label: 'Tudo salvo',
    };
}
