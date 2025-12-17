import { useEffect, useMemo, useState } from 'react';
import { Entity, PolylineGraphics, ScreenSpaceEvent, ScreenSpaceEventHandler } from 'resium';
import * as Cesium from 'cesium';

import { useViewerStore } from '@/store/useViewerStore';

type PointPick = {
  position: Cesium.Cartesian3;
};

const MeasureTool3D = () => {
  const viewer = useViewerStore((s) => s.viewer);
  const [points, setPoints] = useState<PointPick[]>([]);
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    if (points.length < 2) {
      setTotal(0);
      return;
    }
    let distance = 0;
    for (let i = 1; i < points.length; i++) {
      distance += Cesium.Cartesian3.distance(points[i - 1].position, points[i].position);
    }
    setTotal(distance);
  }, [points]);

  const handleLeftClick = (movement: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
    if (!viewer || !movement.position) return;
    const cartesian = viewer.scene.pickPosition(movement.position);
    if (!cartesian) return;
    setPoints((prev) => [...prev, { position: cartesian }]);
  };

  const handleRightClick = () => {
    setPoints([]);
    setTotal(0);
  };

  const polylinePositions = useMemo(
    () => points.map((p) => p.position),
    [points]
  );

  return (
    <>
      <ScreenSpaceEventHandler>
        <ScreenSpaceEvent
          type={Cesium.ScreenSpaceEventType.LEFT_CLICK}
          action={handleLeftClick}
        />
        <ScreenSpaceEvent
          type={Cesium.ScreenSpaceEventType.RIGHT_CLICK}
          action={handleRightClick}
        />
      </ScreenSpaceEventHandler>

      {polylinePositions.length > 1 && (
        <Entity>
          <PolylineGraphics
            positions={polylinePositions}
            width={3}
            material={Cesium.Color.CYAN}
            clampToGround
          />
        </Entity>
      )}

      {total > 0 && (
        <div className="absolute left-4 bottom-4 bg-black/60 text-white px-3 py-2 rounded">
          距离: {(total / 1000).toFixed(2)} km
        </div>
      )}
    </>
  );
};

export default MeasureTool3D;
