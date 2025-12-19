import { create } from 'zustand';
import { TiandituLayerType } from '@/services/tianditu';

type SceneState = {
  undergroundMode: boolean;
  transparency: number;
  baseLayerType: TiandituLayerType; 
};

type SceneActions = {
  toggleUnderground: () => void;
  setUnderground: (value: boolean) => void;
  setTransparency: (value: number) => void;
  setBaseLayerType: (type: TiandituLayerType) => void;
};

export const useSceneStore = create<SceneState & SceneActions>((set) => ({
  undergroundMode: false,
  transparency: 0.5,
  baseLayerType: 'img',
  toggleUnderground: () => set((state) => ({ undergroundMode: !state.undergroundMode })),
  setUnderground: (value) => set({ undergroundMode: value }),
  setTransparency: (value) => set({ transparency: Math.min(1, Math.max(0, value)) }),
  setBaseLayerType: (type) => set({ baseLayerType: type })
}));