export type SignSizePreset = 'size1' | 'size2' | 'size3';

export type SignShape = 'circle' | 'triangle' | 'triangle_inverted' | 'octagon' | 'diamond' | 'square' | 'plate' | 'other';

export interface SignData {
  id: string;
  code: string;
  number: string;
  name: string;
  alt: string;
  svgPath: string;
  shape: SignShape;
  width: number;  // in mm at Size 2
  height: number; // in mm at Size 2
  category: string;
  svgContent?: string;
  customSvgContent?: string; // in case of user custom upload
}

export interface PlacedSign {
  instanceId: string;
  sign: SignData;
}

export interface AssemblySettings {
  sizePreset: SignSizePreset;
  showPole: boolean;
  showLabels: boolean;
  showDimensions: boolean; // optional helper for engineer/draftsman
}

export interface SignScaleResult {
  width: number;
  height: number;
  gap: number;
  scaleFactor: number;
}
