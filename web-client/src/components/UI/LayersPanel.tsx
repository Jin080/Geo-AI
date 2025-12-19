import { Layers, X } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { useSceneStore } from '@/store/useSceneStore';

const baseLayerOptions = [
  { id: 'img', label: '卫星影像' },
  { id: 'vec', label: '电子地图' },
  { id: 'ter', label: '地形晕渲' }
] as const;

const LayersPanel = () => {
  const { activePanel, setActivePanel } = useUIStore();
  const { baseLayerType, setBaseLayerType } = useSceneStore();

  if (activePanel !== 'layers') return null;

  return (
    <div className="pointer-events-auto absolute left-4 bottom-28 w-[320px] bg-white/95 text-slate-800 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-[70] animate-in slide-in-from-left-5 fade-in duration-300">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white/10 rounded-lg">
            <Layers size={16} />
          </div>
          <span className="text-sm font-semibold">天地图图层</span>
        </div>
        <button
          onClick={() => setActivePanel('none')}
          className="p-1 rounded-md hover:bg-white/10 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="p-4 space-y-2">
        {baseLayerOptions.map((opt) => {
          const active = baseLayerType === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setBaseLayerType(opt.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl border transition-all text-left ${
                active
                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                  : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  active ? 'border-blue-500 bg-blue-500/80' : 'border-slate-400'
                }`}
              >
                {active && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
              </span>
              <span className="text-sm">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LayersPanel;
