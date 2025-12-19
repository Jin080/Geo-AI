import { create } from 'zustand';

export type PanelType = 'none' | 'ai' | 'data' | 'layers' | 'settings';

type UIState = {
  activePanel: PanelType;
  setActivePanel: (panel: PanelType) => void;
  togglePanel: (panel: PanelType) => void;
};

export const useUIStore = create<UIState>((set) => ({
  activePanel: 'none', // 默认不显示任何面板
  
  setActivePanel: (panel) => set({ activePanel: panel }),
  
  // 点击已激活的图标则关闭，否则切换到新面板
  togglePanel: (panel) => set((state) => ({ 
    activePanel: state.activePanel === panel ? 'none' : panel 
  })),
}));