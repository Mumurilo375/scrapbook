import { router } from '@inertiajs/react';
import { useEffect } from 'react';

const DEFAULT_WARNING_MESSAGE = 'Há alterações ainda não salvas. Aguarde o indicador mostrar "Salvo" antes de sair.';

export function useUnsavedChangesWarning(hasUnsavedChanges: boolean, message = DEFAULT_WARNING_MESSAGE): void {
    useEffect(() => {
        function warnBeforeUnload(event: BeforeUnloadEvent) {
            if (!hasUnsavedChanges) {
                return;
            }

            event.preventDefault();
            event.returnValue = message;
        }

        window.addEventListener('beforeunload', warnBeforeUnload);

        return () => window.removeEventListener('beforeunload', warnBeforeUnload);
    }, [hasUnsavedChanges, message]);

    useEffect(() => {
        return router.on('before', () => {
            if (!hasUnsavedChanges) {
                return;
            }

            if (window.confirm(message)) {
                return;
            }

            return false;
        });
    }, [hasUnsavedChanges, message]);
}
