import { useEffect, useState } from 'react';
import * as Cesium from 'cesium';
import { useViewerStore } from '@/store/useViewerStore';

const StatusBar = () => {
  const viewer = useViewerStore((s) => s.viewer);
  const [coords, setCoords] = useState({ lon: 0, lat: 0, height: 0 });
  const [zoom, setZoom] = useState(0); 
  const [heading, setHeading] = useState(0);

  useEffect(() => {
    if (!viewer) return;
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((movement: any) => {
      const position = movement.endPosition;
      if (!position) return;
      const cartesian = viewer.camera.pickEllipsoid(position, viewer.scene.globe.ellipsoid);
      if (cartesian) {
        const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        setCoords({
          lon: Cesium.Math.toDegrees(cartographic.longitude),
          lat: Cesium.Math.toDegrees(cartographic.latitude),
          height: viewer.camera.positionCartographic.height
        });
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    const updateCameraStats = () => {
      setZoom(viewer.camera.positionCartographic.height); 
      setHeading(Cesium.Math.toDegrees(viewer.camera.heading));
    };

    viewer.camera.moveEnd.addEventListener(updateCameraStats);
    updateCameraStats();

    return () => {
      if (!handler.isDestroyed()) handler.destroy();
      if (viewer && !viewer.isDestroyed()) viewer.camera.moveEnd.removeEventListener(updateCameraStats);
    };
  }, [viewer]);

  return (
    <div className="pointer-events-auto absolute bottom-0 left-0 w-full h-[28px] bg-[#0f172a]/95 border-t border-slate-700/50 flex items-center px-4 text-[11px] text-slate-400 z-[90] font-mono select-none backdrop-blur-sm shadow-[0_-4px_10px_rgba(0,0,0,0.2)]">
      <div className="flex gap-6">
        <span className="w-32 truncate hover:text-white transition-colors cursor-help">Lat: <span className="text-blue-300">{coords.lat.toFixed(5)}°</span></span>
        <span className="w-32 truncate hover:text-white transition-colors cursor-help">Lon: <span className="text-blue-300">{coords.lon.toFixed(5)}°</span></span>
        <span className="w-32 border-l border-slate-700 pl-4 truncate">Height: <span className="text-green-300">{Math.round(zoom).toLocaleString()} m</span></span>
        <span className="w-24 border-l border-slate-700 pl-4 truncate">Heading: <span className="text-yellow-300">{heading.toFixed(1)}°</span></span>
      </div>
      <div className="flex-1 text-right text-slate-600 hidden sm:block">CS: CGCS2000 &nbsp;•&nbsp; Source: Tianditu</div>
    </div>
  );
};

export default StatusBar;