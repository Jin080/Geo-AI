import { useEffect } from 'react';
import EarthViewer from '@/components/Map/EarthViewer';
import AIPanel from '@/components/UI/AIPanel';
import { fetchMines } from '@/services/api';
import { useDataStore } from '@/store/useDataStore';

// Placeholder stubs for components to be implemented later.
const DataDrawer = () => null;
const LayerSwitch = () => null;

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
        console.warn('Failed to fetch mines, falling back to mock', err);
      }
      if (cancelled) return;
      const res = await import('@/mock/mines.json');
      if (!cancelled) setMines(res.default.features);
    })();
    return () => {
      cancelled = true;
    };
  }, [setMines]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0">
        <EarthViewer />
      </div>

      {/* UI overlay */}
      <div className="pointer-events-none absolute inset-0 z-10">
        <div className="absolute top-4 right-4 pointer-events-auto">
          <LayerSwitch />
        </div>
        <div className="absolute left-4 top-4 pointer-events-auto">
          <AIPanel />
        </div>
        <div className="absolute left-0 right-0 bottom-0 pointer-events-auto">
          <DataDrawer />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
