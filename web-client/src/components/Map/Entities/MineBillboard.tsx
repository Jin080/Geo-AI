import { Entity, BillboardGraphics, LabelGraphics } from 'resium';
import * as Cesium from 'cesium';
import { useMemo } from 'react';

import { useDataStore } from '@/store/useDataStore';

const MineBillboard = () => {
  const mines = useDataStore((s) => s.mines);
  const selectedEntityId = useDataStore((s) => s.selectedEntityId);
  const setSelected = useDataStore((s) => s.setSelectedEntity);

  const mapped = useMemo(
    () =>
      mines.map((feature) => ({
        id: feature.properties.id,
        name: feature.properties.name,
        position: Cesium.Cartesian3.fromDegrees(
          feature.geometry.coordinates[0],
          feature.geometry.coordinates[1],
          feature.properties.elevation ?? 0
        )
      })),
    [mines]
  );

  return (
    <>
      {mapped.map((item) => (
        <Entity
          key={item.id}
          name={item.name}
          position={item.position}
          onClick={() => setSelected(item.id)}
        >
          <BillboardGraphics
            image="https://cdn.jsdelivr.net/gh/ConceptCodes/assets/geo/pin-blue.png"
            scale={selectedEntityId === item.id ? 1.2 : 1.0}
            verticalOrigin={Cesium.VerticalOrigin.BOTTOM}
            heightReference={Cesium.HeightReference.CLAMP_TO_GROUND}
          />
          <LabelGraphics
            text={item.name}
            font="14px sans-serif"
            fillColor={Cesium.Color.WHITE}
            showBackground
            backgroundColor={new Cesium.Color(0.0, 0.0, 0.0, 0.6)}
            pixelOffset={new Cesium.Cartesian2(0, -30)}
          />
        </Entity>
      ))}
    </>
  );
};

export default MineBillboard;
