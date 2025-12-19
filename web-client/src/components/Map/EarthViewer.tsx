import { useEffect, useRef } from 'react';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

import { useViewerStore } from '@/store/useViewerStore';
import { useDataStore } from '@/store/useDataStore';
import { useSceneStore } from '@/store/useSceneStore';
import { createTiandituProvider, TiandituLayerType } from '@/services/tianditu';

const EarthViewer = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const pinBuilderRef = useRef<Cesium.PinBuilder | null>(null);
  
  const setViewer = useViewerStore((s) => s.setViewer);
  const mines = useDataStore((s) => s.mines);
  
  const undergroundMode = useSceneStore((s) => s.undergroundMode);
  const transparency = useSceneStore((s) => s.transparency);
  const baseLayerType = useSceneStore((s) => s.baseLayerType);

  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return;
    
    // 使用椭球体地形（无高度），保证最快加载速度
    const terrainProvider = new Cesium.EllipsoidTerrainProvider();

    const viewer = new Cesium.Viewer(containerRef.current, {
      animation: false,
      timeline: false,
      homeButton: false,
      navigationHelpButton: false,
      geocoder: false,
      baseLayerPicker: false,
      sceneModePicker: false,
      fullscreenButton: false,
      vrButton: false,
      selectionIndicator: false,
      infoBox: false,
      // 【关键修复】Cesium 1.107+ 使用 baseLayer 替代 imageryProvider
      // 设置为 false 以禁用默认底图（如 BingMaps）
      baseLayer: false, 
      terrainProvider: terrainProvider,
      contextOptions: {
        webgl: {
          alpha: false,
          antialias: true,
          preserveDrawingBuffer: true,
        }
      }
    });

    // 确保没有残留图层
    viewer.imageryLayers.removeAll();
    viewerRef.current = viewer;
    setViewer(viewer);

    // 隐藏版权信息
    const creditContainer = viewer.cesiumWidget.creditContainer as HTMLElement;
    if (creditContainer) creditContainer.style.display = "none";

    viewer.scene.globe.depthTestAgainstTerrain = true;
    viewer.scene.globe.baseColor = new Cesium.Color(0.08, 0.12, 0.18, 1.0);

    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(101.5, 25.0, 500000),
      orientation: {
        heading: 0,
        pitch: Cesium.Math.toRadians(-90),
        roll: 0
      }
    });

    return () => {
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
      }
      viewerRef.current = null;
    };
  }, [setViewer]);

  // 动态切换底图
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;

    viewer.imageryLayers.removeAll();
    const { baseProvider, labelProvider } = createTiandituProvider(baseLayerType);
    viewer.imageryLayers.addImageryProvider(baseProvider);
    viewer.imageryLayers.addImageryProvider(labelProvider);
  }, [baseLayerType]);

  // 渲染实体
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;
    
    const entities = viewer.entities.values;
    for (let i = entities.length - 1; i >= 0; i--) {
      const entity = entities[i];
      // @ts-ignore
      if (entity.properties?.getValue?.(Cesium.JulianDate.now())?.source === 'mine') {
        viewer.entities.remove(entity);
      }
    }

    if (!pinBuilderRef.current) pinBuilderRef.current = new Cesium.PinBuilder();

    mines.forEach((feature) => {
      const [lon, lat] = feature.geometry.coordinates;
      let color = Cesium.Color.ROYALBLUE;
      if (feature.properties.type.includes("靶区")) color = Cesium.Color.CRIMSON;
      if (feature.properties.type.includes("钻孔")) color = Cesium.Color.TEAL;

      const pinCanvas = pinBuilderRef.current?.fromColor(color, 48).toDataURL();

      viewer.entities.add({
        name: feature.properties.name,
        position: Cesium.Cartesian3.fromDegrees(lon, lat, feature.properties.elevation ?? 0),
        billboard: {
          image: pinCanvas,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          scale: 0.8
        },
        properties: { source: 'mine', ...feature.properties }
      });
    });
  }, [mines]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};

export default EarthViewer;
