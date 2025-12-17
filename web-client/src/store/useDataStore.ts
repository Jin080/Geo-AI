import { create } from 'zustand';

export type MineFeature = {
  type: 'Feature';
  properties: {
    id: string;
    name: string;
    type: string;
    elevation?: number;
  };
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
};

type DataState = {
  mines: MineFeature[];
  selectedEntityId: string | null;
};

type DataActions = {
  setMines: (features: MineFeature[]) => void;
  setSelectedEntity: (id: string | null) => void;
};

export const useDataStore = create<DataState & DataActions>((set) => ({
  mines: [],
  selectedEntityId: null,
  setMines: (features) => set({ mines: features }),
  setSelectedEntity: (id) => set({ selectedEntityId: id })
}));
