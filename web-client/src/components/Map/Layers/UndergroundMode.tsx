import { useEffect } from 'react';
import { useSceneStore } from '@/store/useSceneStore';
import { useViewerStore } from '@/store/useViewerStore';

const UndergroundMode = () => {
  const undergroundMode = useSceneStore((s) => s.undergroundMode);
  const transparency = useSceneStore((s) => s.transparency);
  const viewer = useViewerStore((s) => s.viewer);

  useEffect(() => {
    if (!viewer || !viewer.scene) return;
    const { scene, globe } = viewer;
    // Disable collision to allow camera under terrain
    scene.screenSpaceCameraController.enableCollisionDetection = !undergroundMode;
    globe.translucency.enabled = undergroundMode;
    globe.translucency.frontFaceAlpha = undergroundMode ? transparency : 0.0;
    globe.translucency.backFaceAlpha = undergroundMode ? transparency : 0.0;
  }, [viewer, undergroundMode, transparency]);

  return null;
};

export default UndergroundMode;
