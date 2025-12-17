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
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const pinBuilderRef = useRef(new Cesium.PinBuilder());
  const setViewer = useViewerStore((s) => s.setViewer);
  const mines = useDataStore((s) => s.mines);
  const undergroundMode = useSceneStore((s) => s.undergroundMode);
  const transparency = useSceneStore((s) => s.transparency);

  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return;
    let cancelled = false;
    (async () => {
      if (cesiumToken) {
        Cesium.Ion.defaultAccessToken = cesiumToken;
      }
      const terrainProvider = cesiumToken ? Cesium.Terrain.fromWorldTerrain() : new Cesium.EllipsoidTerrainProvider();

      if (cancelled || !containerRef.current) return;

      const viewer = new Cesium.Viewer(containerRef.current, {
        imageryProvider: undefined,
        terrainProvider,
        animation: false,
        timeline: false,
        homeButton: false,
        navigationHelpButton: false,
        geocoder: false,
        baseLayerPicker: false,
        vrButton: false,
        selectionIndicator: false,
        infoBox: false
      });
      viewerRef.current = viewer;
      setViewer(viewer);

      // Ensure globe is visible even if imagery fails
      viewer.scene.globe.baseColor = new Cesium.Color(0.08, 0.12, 0.18, 1.0);

      // Add base imagery with fallbacks
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
        viewer.scene.globe.baseColor = new Cesium.Color(0.1, 0.18, 0.32, 1.0);
      }

      // Default camera view to East Asia to avoid being in space
      viewer.camera.flyTo({
        destination: Cesium.Rectangle.fromDegrees(70, 10, 140, 55),
        duration: 0
      });
    })();
    return () => {
      cancelled = true;
      viewerRef.current?.destroy();
      viewerRef.current = null;
    };
  }, [setViewer]);

  // Add Tianditu imagery layers if key provided
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed() || !tiandituKey) return;
    const layers: Cesium.ImageryLayer[] = [];
    const addLayer = (layer: 'img' | 'cia') =>
      viewer.imageryLayers.addImageryProvider(
        new Cesium.UrlTemplateImageryProvider({
          url: `https://t{s}.tianditu.gov.cn/${layer}_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${layer}&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${tiandituKey}`,
          subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
          maximumLevel: 18,
          tilingScheme: new Cesium.GeographicTilingScheme(),
          credit: 'Tianditu'
        })
      );
    layers.push(addLayer('img'));
    layers.push(addLayer('cia'));
    return () => {
      layers.forEach((l) => viewer.imageryLayers.remove(l, true));
    };
  }, []);

  // Apply underground / transparency
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;
    const { scene, globe } = viewer;
    if (!scene || !globe) return;
    scene.screenSpaceCameraController.enableCollisionDetection = !undergroundMode;
    globe.translucency.enabled = undergroundMode;
    globe.translucency.frontFaceAlpha = undergroundMode ? transparency : 0.0;
    globe.translucency.backFaceAlpha = undergroundMode ? transparency : 0.0;
  }, [undergroundMode, transparency]);

  // Render mines as entities
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;
    // Clear previous mine entities
    const idsToRemove: Cesium.Entity[] = [];
    viewer.entities.values.forEach((ent) => {
      if (ent.properties && ent.properties.getValue()?.source === 'mine') {
        idsToRemove.push(ent);
      }
    });
    idsToRemove.forEach((ent) => viewer.entities.remove(ent));

    mines.forEach((feature) => {
      const [lon, lat] = feature.geometry.coordinates;
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
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          scale: 1.0
        },
        label: {
          text: feature.properties.name,
          font: '14px sans-serif',
          fillColor: Cesium.Color.WHITE,
          showBackground: true,
          backgroundColor: new Cesium.Color(0, 0, 0, 0.6),
          pixelOffset: new Cesium.Cartesian2(0, -30)
        },
        properties: {
          source: 'mine',
          id: feature.properties.id
        }
      });
    });

    if (mines.length > 0) {
      const lons = mines.map((f) => f.geometry.coordinates[0]);
      const lats = mines.map((f) => f.geometry.coordinates[1]);
      const minLon = Math.min(...lons);
      const maxLon = Math.max(...lons);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const padding = 0.5;
      const rectangle = Cesium.Rectangle.fromDegrees(
        minLon - padding,
        minLat - padding,
        maxLon + padding,
        maxLat + padding
      );
      viewer.camera.flyTo({ destination: rectangle, duration: 1.5 });
    }
  }, [mines]);

  return <div ref={containerRef} className="w-full h-full" />;
};

export default EarthViewer;
