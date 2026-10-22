import { SignData, SignSizePreset, SignScaleResult } from '../types/signs';

export const BASE_GAP_MM = 50; // mm at Size 2
export const POLE_DIAMETER_MM = 60; // mm standard galvanized steel pole
export const POLE_GROUND_CLEARANCE_MM = 2000; // 2.0 m according to TP 117 / VL 6.1

/**
 * Returns scaling factor and computed dimensions (in mm) for a sign based on chosen size preset
 * according to TP 117 and VL 6.1:
 * - Veľkosť 1: 0.7x for all signs and gaps
 * - Veľkosť 2: 1.0x (native SVG scale)
 * - Veľkosť 3:
 *     - Circles and additional plates (codes 501-599): 1.25x
 *     - Other shapes (triangles, squares, rectangles, octagons): 1.4x
 *     - Gaps: 1.25x
 */
export function calculateSignDimensions(sign: SignData, preset: SignSizePreset): SignScaleResult {
  const num = parseInt(sign.number || sign.code.split('-')[0], 10);
  const isCircleOrPlate = sign.shape === 'circle' || (num >= 501 && num <= 599) || sign.shape === 'plate';

  let scaleFactor = 1.0;
  let gap = BASE_GAP_MM;

  switch (preset) {
    case 'size1':
      scaleFactor = 0.7;
      gap = BASE_GAP_MM * 0.7; // 35 mm
      break;

    case 'size2':
      scaleFactor = 1.0;
      gap = BASE_GAP_MM; // 50 mm
      break;

    case 'size3':
      scaleFactor = isCircleOrPlate ? 1.25 : 1.4;
      gap = BASE_GAP_MM * 1.25; // 62.5 mm
      break;
  }

  return {
    width: Math.round(sign.width * scaleFactor),
    height: Math.round(sign.height * scaleFactor),
    gap,
    scaleFactor
  };
}

/**
 * Normalizes text for accent-insensitive and case-insensitive search
 */
export function normalizeSearchString(text: string): string {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}
