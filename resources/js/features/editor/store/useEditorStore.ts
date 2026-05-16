import { create } from 'zustand';

type SaveState = 'idle' | 'saving' | 'saved' | 'failed';

type EditorState = {
    selectedElementId: string | null;
    saveState: SaveState;
    setSaveState: (saveState: SaveState) => void;
    setSelectedElementId: (elementId: string | null) => void;
};

export const useEditorStore = create<EditorState>((set) => ({
    selectedElementId: null,
    saveState: 'idle',
    setSaveState: (saveState) => set({ saveState }),
    setSelectedElementId: (selectedElementId) => set({ selectedElementId }),
}));
