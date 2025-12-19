import { useEffect } from 'react';
import EarthViewer from '@/components/Map/EarthViewer';
import AIPanel from '@/components/UI/AIPanel';
import AdminPanel from '@/components/UI/AdminPanel'; // 注意这里是 AdminPanel
import LayersPanel from '@/components/UI/LayersPanel';
import Dock from '@/components/UI/Dock';
import StatusBar from '@/components/UI/StatusBar';
import { fetchMines } from '@/services/api';
import { useDataStore } from '@/store/useDataStore';

const MainLayout = () => {
  const setMines = useDataStore((s) => s.setMines);

  // 数据预加载逻辑
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchMines();
        if (!cancelled && data.length > 0) {
          setMines(data);
          return;
        }
      } catch (err) {
        console.warn('API不可用，尝试加载本地模拟数据', err);
      }
      
      if (cancelled) return;
      
      try {
        const res = await import('@/mock/mines.json');
        if (!cancelled && res.default.features) {
           setMines(res.default.features as any);
        }
      } catch (e) {
        console.error("模拟数据加载失败", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setMines]);

  return (
    // 全屏视口
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 text-white font-sans selection:bg-blue-500/30">
      
      {/* 1. 底层地图 */}
      <div className="absolute inset-0 z-0">
        <EarthViewer />
      </div>

      {/* 2. UI 覆盖层 */}
      <div className="absolute inset-0 z-50 pointer-events-none">
        
        {/* 顶部或角落的装饰/Logo (可选) */}
        {/* <div className="absolute top-6 left-6 ...">Title</div> */}

        {/* 核心功能区 */}
        <AIPanel />
        <AdminPanel />
        <LayersPanel />
        
        {/* 底部导航 Dock (核心入口) */}
        <Dock />

        {/* 底部状态栏 */}
        <StatusBar />

      </div>
    </div>
  );
};

export default MainLayout;
