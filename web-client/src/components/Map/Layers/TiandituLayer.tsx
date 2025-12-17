import { ImageryLayer } from 'resium';
import * as Cesium from 'cesium';

const tk = import.meta.env.VITE_TIANDITU_KEY as string | undefined;

const createProvider = (layer: 'img' | 'cia') =>
  new Cesium.UrlTemplateImageryProvider({
    url: `https://t{s}.tianditu.gov.cn/${layer}_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${layer}&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${tk}`,
    subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
    maximumLevel: 18,
    tilingScheme: new Cesium.GeographicTilingScheme(),
    credit: 'Tianditu'
  });

const TiandituLayer = () => {
  if (!tk) {
    // Avoid runtime errors if token missing; rely on default base layer.
    return null;
  }
  return (
    <>
      <ImageryLayer imageryProvider={createProvider('img')} />
      <ImageryLayer imageryProvider={createProvider('cia')} />
    </>
  );
};

export default TiandituLayer;
