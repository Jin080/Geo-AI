// Global API type definitions for mines, drill holes, and chat messages.

export type Coordinate = [number, number];

export interface GeoJSONFeature<TProps, TGeometry> {
  type: 'Feature';
  properties: TProps;
  geometry: TGeometry;
}

export interface MineProperties {
  id: string;
  name: string;
  type: string;
  elevation?: number;
}

export type MineGeometry = {
  type: 'Point';
  coordinates: Coordinate;
};

export type MineFeature = GeoJSONFeature<MineProperties, MineGeometry>;

export interface DrillHoleProperties {
  id: string;
  mine_id: string;
  name: string;
  depth?: number;
}

export type DrillHoleGeometry = {
  type: 'LineString';
  coordinates: Coordinate[];
};

export type DrillHoleFeature = GeoJSONFeature<DrillHoleProperties, DrillHoleGeometry>;

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface FlyToCommand {
  action: 'flyTo';
  params: {
    lat: number;
    lon: number;
    height?: number;
    heading?: number;
    pitch?: number;
    roll?: number;
  };
}

export type AICommand = FlyToCommand;
