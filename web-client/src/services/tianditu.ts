import * as Cesium from 'cesium';

// 使用您提供的 Key
export const TIANDITU_KEY = 'ebc881fd3a41009650a73e8e2433046e';

export type TiandituLayerType = 'img' | 'vec' | 'ter';

export const createTiandituProvider = (layerType: TiandituLayerType) => {
  const layerMap = {
    img: 'img_w',
    vec: 'vec_w', 
    ter: 'ter_w'
  };

  const labelMap = {
    img: 'cia_w',
    vec: 'cva_w',
    ter: 'cta_w'
  };

  const matrixSet = 'w'; 

  const baseProvider = new Cesium.WebMapTileServiceImageryProvider({
    url: `https://t{s}.tianditu.gov.cn/${layerMap[layerType]}/wmts?tk=${TIANDITU_KEY}`,
    layer: layerType === 'img' ? 'img' : (layerType === 'vec' ? 'vec' : 'ter'),
    style: 'default',
    format: 'tiles',
    tileMatrixSetID: matrixSet,
    subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
    maximumLevel: 18,
    credit: new Cesium.Credit('天地图')
  });

  const labelLayerName = labelMap[layerType].split('_')[0];
  const labelProvider = new Cesium.WebMapTileServiceImageryProvider({
    url: `https://t{s}.tianditu.gov.cn/${labelMap[layerType]}/wmts?tk=${TIANDITU_KEY}`,
    layer: labelLayerName,
    style: 'default',
    format: 'tiles',
    tileMatrixSetID: matrixSet,
    subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
    maximumLevel: 18
  });

  return { baseProvider, labelProvider };
};