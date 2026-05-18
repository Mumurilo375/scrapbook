export type RendererAssetCategory = {
    id: number | string;
    name: string;
    slug: string;
};

export type RendererAsset = {
    id: number | string;
    name: string;
    slug?: string | null;
    type: string;
    category?: RendererAssetCategory | null;
    previewUrl?: string | null;
    renderMode?: 'image' | 'svg' | 'shape';
    config?: Record<string, unknown>;
    source?: 'global' | 'theme';
    role?: string | null;
    isThemeAsset?: boolean;
};

export type RendererAssetMap = Record<string, RendererAsset>;

export function assetMapFromList(assets: RendererAsset[] | undefined | null): RendererAssetMap {
    if (!Array.isArray(assets)) {
        return {};
    }

    return Object.fromEntries(assets.map((asset) => [String(asset.id), asset]));
}

export function assetFromMap(assetMap: RendererAssetMap | undefined, assetId: unknown): RendererAsset | null {
    if (assetId === null || assetId === undefined || !assetMap) {
        return null;
    }

    return assetMap[String(assetId)] ?? null;
}
