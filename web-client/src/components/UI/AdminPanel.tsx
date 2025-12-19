import { useUIStore } from '@/store/useUIStore';
import { Database, X, MapPin, Crosshair, TrendingUp } from 'lucide-react';
import { useDataStore } from '@/store/useDataStore';
import { useViewerStore } from '@/store/useViewerStore';
import * as Cesium from 'cesium';

const AdminPanel = () => {
  const { activePanel, setActivePanel } = useUIStore();
  const mines = useDataStore((s) => s.mines);
  const viewer = useViewerStore((s) => s.viewer);

  const isVisible = activePanel === 'data';

  const flyTo = (lon: number, lat: number, height: number = 2000) => {
    if (!viewer) return;
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(lon, lat, height),
      orientation: { heading: 0, pitch: Cesium.Math.toRadians(-60), roll: 0 },
      duration: 1.5
    });
  };

  if (!isVisible) return null;

  return (
    // 弹窗定位：屏幕左侧（与 AI 面板同侧，形成 Tab 切换感觉）或者右侧。
    // 为了平衡布局，我们将数据面板放在 右侧 bottom-32
    <div className="pointer-events-auto absolute right-6 bottom-32 w-[380px] h-[600px] max-h-[60vh] flex flex-col bg-[#0f172a]/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-300 z-50">
      
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-emerald-900/20 to-transparent border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500/20 rounded-lg">
            <Database size={18} className="text-emerald-400" />
          </div>
          <h2 className="text-white font-bold text-sm tracking-wide">矿区数据中心</h2>
        </div>
        <button 
          onClick={() => setActivePanel('none')}
          className="text-slate-400 hover:text-white transition p-1 hover:bg-white/10 rounded-full"
        >
          <X size={18} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
        
        {/* Section: 统计概览 */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-slate-800/50 rounded-xl p-3 border border-white/5">
            <div className="text-slate-400 text-xs mb-1">探测靶区</div>
            <div className="text-2xl font-bold text-white">3 <span className="text-xs text-emerald-500 font-normal">+12%</span></div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-white/5">
            <div className="text-slate-400 text-xs mb-1">钻孔总数</div>
            <div className="text-2xl font-bold text-white">128 <span className="text-xs text-blue-500 font-normal">Active</span></div>
          </div>
        </div>

        {/* Section: 靶区列表 */}
        <div className="mb-6">
          <h3 className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-3 flex items-center opacity-80">
            <TrendingUp size={12} className="mr-1.5" /> 预测靶区 (Targets)
          </h3>
          <div className="space-y-3">
            <div 
              onClick={() => flyTo(100.20, 27.10, 5000)}
              className="bg-gradient-to-br from-slate-800/80 to-slate-800/30 p-4 rounded-xl border border-white/5 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-900/20 cursor-pointer transition-all group"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-slate-200 font-medium group-hover:text-blue-300 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                  玉龙雪山靶区
                </span>
                <span className="text-[10px] font-mono text-blue-200 bg-blue-500/20 px-2 py-0.5 rounded border border-blue-500/30">P: 0.85</span>
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <MapPin size={10} /> 斑岩型铜钼矿 · 断裂带发育
              </div>
            </div>
          </div>
        </div>

        {/* Section: 矿山列表 */}
        <div className="mb-6">
          <h3 className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3 flex items-center opacity-80">
            <Database size={12} className="mr-1.5" /> 在产矿区 (Mines)
          </h3>
          <div className="space-y-2">
            {mines.map((mine) => (
              <div
                key={mine.properties.id}
                onClick={() => flyTo(mine.geometry.coordinates[0], mine.geometry.coordinates[1], mine.properties.elevation ?? 2000)}
                className="bg-slate-800/30 hover:bg-slate-800/80 p-3 rounded-lg border border-white/5 hover:border-emerald-500/30 cursor-pointer transition-all flex justify-between items-center group"
              >
                <div>
                  <div className="text-slate-200 font-medium text-sm group-hover:text-emerald-300 transition-colors">{mine.properties.name}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wide">{mine.properties.type}</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                  <Crosshair size={14} className="text-slate-500 group-hover:text-emerald-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminPanel;