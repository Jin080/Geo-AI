import { create } from 'zustand';

type SceneState = {
  undergroundMode: boolean;
  transparency: number; // 0 (opaque) to 1 (fully transparent)
  currentBaseLayer: string;
};

type SceneActions = {
  toggleUnderground: () => void;
  setUnderground: (value: boolean) => void;
  setTransparency: (value: number) => void;
  setBaseLayer: (layerId: string) => void;
};

export const useSceneStore = create<SceneState & SceneActions>((set) => ({
  undergroundMode: false,
  transparency: 0.4,
  currentBaseLayer: 'tianditu-img',
  toggleUnderground: () => set((state) => ({ undergroundMode: !state.undergroundMode })),
  setUnderground: (value) => set({ undergroundMode: value }),
  setTransparency: (value) => set({ transparency: Math.min(1, Math.max(0, value)) }),
  setBaseLayer: (layerId) => set({ currentBaseLayer: layerId })
}));
