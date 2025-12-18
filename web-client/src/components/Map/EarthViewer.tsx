import { useEffect, useRef } from 'react';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

import { useViewerStore } from '@/store/useViewerStore';
import { useDataStore } from '@/store/useDataStore';
import { useSceneStore } from '@/store/useSceneStore';

const cesiumToken = import.meta.env.VITE_CESIUM_TOKEN as string | undefined;
const tiandituKey = import.meta.env.VITE_TIANDITU_KEY as string | undefined;

const EarthViewer = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  // 【类型修复】使用 any 类型绕过 Cesium 类型定义不匹配的问题
  const viewerRef = useRef<any>(null);
  // 【性能优化】PinBuilder 懒加载
  const pinBuilderRef = useRef<any>(null);
  
  const setViewer = useViewerStore((s) => s.setViewer);
  const mines = useDataStore((s) => s.mines);
  const undergroundMode = useSceneStore((s) => s.undergroundMode);
  const transparency = useSceneStore((s) => s.transparency);

  // 初始化地图
  useEffect(() => {
    // 确保容器存在且没有重复初始化
    if (!containerRef.current || viewerRef.current) return;
    
    let cancelled = false;
    
    // 初始化 PinBuilder (单例模式)
    if (!pinBuilderRef.current) {
      pinBuilderRef.current = new Cesium.PinBuilder();
    }
    
    (async () => {
      if (cesiumToken) {
        Cesium.Ion.defaultAccessToken = cesiumToken;
      }

      // 【异步地形加载】
      let terrain: any = undefined;
      if (cesiumToken) {
        try {
          // 尝试加载世界地形，如果失败则回退
          const terrainFactory = (Cesium as any).Terrain;
          if (terrainFactory && typeof terrainFactory.fromWorldTerrain === 'function') {
             terrain = await terrainFactory.fromWorldTerrain({
              requestVertexNormals: true,
              requestWaterMask: true
            });
          } else {
             terrain = new Cesium.EllipsoidTerrainProvider();
          }
        } catch (e) {
          console.warn("Failed to load world terrain, falling back to ellipsoid", e);
        }
      }

      // 【安全检查】异步操作后再次检查组件状态和容器
      const container = containerRef.current;
      if (cancelled || !container) return;

      // 【配置对象】使用 any 允许传入 terrain 等新属性
      const viewerOptions: any = {
        imageryProvider: undefined, // 手动管理图层
        terrain: terrain, 
        animation: false,
        timeline: false,
        homeButton: false,
        navigationHelpButton: false,
        geocoder: false,
        baseLayerPicker: false,
        vrButton: false,
        selectionIndicator: false,
        infoBox: false,
        contextOptions: {
          webgl: {
            alpha: false,
            antialias: true,
            preserveDrawingBuffer: true,
          }
        }
      };

      // 【初始化 Viewer】
      const viewer: any = new Cesium.Viewer(container, viewerOptions);
      
      viewerRef.current = viewer;
      setViewer(viewer);

      // 设置地球背景色及深度检测 (防穿透)
      if (viewer.scene && viewer.scene.globe) {
        viewer.scene.globe.baseColor = new Cesium.Color(0.08, 0.12, 0.18, 1.0);
        viewer.scene.globe.depthTestAgainstTerrain = true;
      }
      
      // 加载底图 (Bing Maps 或 OSM)
      try {
        if (cesiumToken) {
          const ionProvider = await Cesium.IonImageryProvider.fromAssetId(3);
          viewer.imageryLayers.addImageryProvider(ionProvider);
        } else {
          const osm = new Cesium.OpenStreetMapImageryProvider({
            url: 'https://tile.openstreetmap.org/'
          });
          viewer.imageryLayers.addImageryProvider(osm);
        }
      } catch (err) {
        console.warn('Imagery provider failed, using solid color', err);
      }

      // 默认飞往东亚视角
      viewer.camera.flyTo({
        destination: Cesium.Rectangle.fromDegrees(70, 10, 140, 55),
        duration: 0
      });
    })();

    // 清理函数
    return () => {
      cancelled = true;
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
      }
      viewerRef.current = null;
    };
  }, [setViewer]);

  // 天地图图层管理
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed() || !tiandituKey) return;
    
    const layers: any[] = [];
    
    const addLayer = (layer: 'img' | 'cia') => {
       const options: any = {
          url: `https://t{s}.tianditu.gov.cn/${layer}_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${layer}&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${tiandituKey}`,
          subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
          maximumLevel: 18,
          tilingScheme: new Cesium.GeographicTilingScheme(),
          credit: 'Tianditu'
       };
       const provider = new Cesium.UrlTemplateImageryProvider(options);
       return viewer.imageryLayers.addImageryProvider(provider);
    };

    layers.push(addLayer('img'));
    layers.push(addLayer('cia'));
    
    return () => {
      if (viewer && !viewer.isDestroyed()) {
        layers.forEach((l: any) => viewer.imageryLayers.remove(l, true));
      }
    };
  }, []);

  // 地下模式 / 透明度控制
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;
    
    const scene = viewer.scene;
    const globe = scene?.globe;

    if (!scene || !globe) return;
    
    // 切换地下模式时，启用/禁用相机碰撞检测
    scene.screenSpaceCameraController.enableCollisionDetection = !undergroundMode;
    
    // 设置地表透明度
    globe.translucency.enabled = undergroundMode;
    globe.translucency.frontFaceAlpha = undergroundMode ? transparency : 1.0;
    globe.translucency.backFaceAlpha = undergroundMode ? transparency : 1.0;
    
    // 地下模式隐藏大气层，避免遮挡
    if (scene.skyAtmosphere) {
      scene.skyAtmosphere.show = !undergroundMode;
    }
    
  }, [undergroundMode, transparency]);

  // 渲染矿山实体 (Pins)
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;
    
    const idsToRemove: any[] = [];
    const currentTime = Cesium.JulianDate.now();

    // 1. 清理旧的矿山实体
    viewer.entities.values.forEach((ent: any) => {
      if (ent.properties) {
        try {
            // 防御性获取属性值
            let props: any = null;
            if (typeof ent.properties.getValue === 'function') {
                props = ent.properties.getValue(currentTime);
            } else {
                props = ent.properties;
            }

            if (props && props.source === 'mine') {
                idsToRemove.push(ent);
            }
        } catch (e) {
            // ignore error
        }
      }
    });
    
    idsToRemove.forEach((ent: any) => viewer.entities.remove(ent));

    // 2. 添加新的矿山实体
    mines.forEach((feature) => {
      const [lon, lat] = feature.geometry.coordinates;
      
      if (!pinBuilderRef.current) {
        pinBuilderRef.current = new Cesium.PinBuilder();
      }

      const pinImage = pinBuilderRef.current.fromColor(
        Cesium.Color.CYAN.withAlpha(0.9),
        48
      );
      
      viewer.entities.add({
        name: feature.properties.name,
        position: Cesium.Cartesian3.fromDegrees(lon, lat, feature.properties.elevation ?? 0),
        billboard: {
          image: pinImage,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 贴地
          scale: 1.0,
          disableDepthTestDistance: Number.POSITIVE_INFINITY, // 防止远处被地形遮挡
        },
        label: {
          text: feature.properties.name,
          font: '14px sans-serif',
          fillColor: Cesium.Color.WHITE,
          showBackground: true,
          backgroundColor: new Cesium.Color(0, 0, 0, 0.6),
          pixelOffset: new Cesium.Cartesian2(0, -30),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 500000)
        },
        properties: {
          source: 'mine',
          ...feature.properties
        }
      });
    });

    // 3. 自动聚焦到所有矿山范围
    if (mines.length > 0) {
      const lons = mines.map((f) => f.geometry.coordinates[0]);
      const lats = mines.map((f) => f.geometry.coordinates[1]);
      const minLon = Math.min(...lons);
      const maxLon = Math.max(...lons);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      
      const padding = 0.2; 
      
      const rectangle = Cesium.Rectangle.fromDegrees(
        minLon - padding,
        minLat - padding,
        maxLon + padding,
        maxLat + padding
      );
      
      viewer.camera.flyTo({ 
        destination: rectangle, 
        duration: 1.5 
      });
    }
  }, [mines]);

  return <div ref={containerRef} className="w-full h-full" />;
};

export default EarthViewer;
