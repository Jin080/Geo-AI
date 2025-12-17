import { useEffect } from 'react';
import EarthViewer from '@/components/Map/EarthViewer';
import AIPanel from '@/components/UI/AIPanel';
import { fetchMines } from '@/services/api';
import { useDataStore } from '@/store/useDataStore';

const MainLayout = () => {
  const setMines = useDataStore((s) => s.setMines);

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
      
      // 降级加载本地数据
      try {
        const res = await import('@/mock/mines.json');
        if (!cancelled) setMines(res.default.features as any);
      } catch (e) {
        console.error("模拟数据加载失败", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setMines]);

  return (
    // 1. 最外层容器：强制占满全屏，黑色背景，禁止滚动
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 text-white">
      
      {/* 2. 地图层 (底层 z-0) */}
      <div className="absolute inset-0 z-0">
        <EarthViewer />
      </div>

      {/* 3. UI 交互层 (顶层 z-10) */}
      {/* pointer-events-none 让鼠标能穿透空白区域操作地图 */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        
        {/* 左侧：AI 悬浮窗 (开启点击) */}
        {/* 使用 absolute 定位，距离左边和顶部一定距离 */}
        <div className="pointer-events-auto absolute left-4 top-4">
          <AIPanel />
        </div>

        {/* 您可以在这里添加其他悬浮组件 */}
        
      </div>
    </div>
  );
};

export default MainLayout;