import { Entity, CylinderGraphics } from 'resium';
import * as Cesium from 'cesium';

type DrillCylinderProps = {
  id: string;
  position: Cesium.Cartesian3;
  depth: number;
  radius?: number;
  color?: Cesium.Color;
};

type DrillCylinderListProps = {
  holes: DrillCylinderProps[];
};

const DrillCylinder = ({ holes }: DrillCylinderListProps) => {
  return (
    <>
      {holes.map((hole) => (
        <Entity key={hole.id} position={hole.position}>
          <CylinderGraphics
            length={Math.abs(hole.depth)}
            topRadius={hole.radius ?? 2.0}
            bottomRadius={hole.radius ?? 2.0}
            material={hole.color ?? Cesium.Color.ORANGE.withAlpha(0.6)}
            heightReference={Cesium.HeightReference.RELATIVE_TO_GROUND}
            outline
            outlineColor={Cesium.Color.WHITE.withAlpha(0.6)}
          />
        </Entity>
      ))}
    </>
  );
};

export default DrillCylinder;
