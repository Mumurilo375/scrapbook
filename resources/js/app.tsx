import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import type { ComponentType } from 'react';

type PageModule = {
    default: ComponentType;
};

const pages = import.meta.glob<PageModule>('./pages/**/*.tsx', { eager: true });
const featurePages = import.meta.glob<PageModule>('./features/**/pages/**/*.tsx', { eager: true });

createInertiaApp({
    title: (title) => (title ? `${title} - Scrapbook` : 'Scrapbook'),
    resolve: (name) => {
        const page =
            pages[`./pages/${name}.tsx`] ??
            featurePages[`./features/${name}.tsx`] ??
            featurePageFromName(name);

        if (!page) {
            throw new Error(`Inertia page not found: ${name}`);
        }

        return page;
    },
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
    progress: {
        color: '#be3455',
    },
});

function featurePageFromName(name: string): PageModule | undefined {
    const [feature, ...rest] = name.split('/');

    if (!feature || rest.length === 0) {
        return undefined;
    }

    return featurePages[`./features/${feature}/pages/${rest.join('/')}.tsx`];
}
