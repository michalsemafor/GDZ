/**
 * Export assembly SVG element to crisp 2x retina PNG
 */
export async function renderSvgToCanvas(
  svgElement: SVGSVGElement,
  scale: number = 2
): Promise<HTMLCanvasElement> {
  // Clone element to avoid modifying the displayed DOM
  const clone = svgElement.cloneNode(true) as SVGSVGElement;

  // Read viewBox or bounding box
  const viewBox = svgElement.viewBox.baseVal;
  const width = viewBox && viewBox.width > 0 ? viewBox.width : svgElement.clientWidth || 800;
  const height = viewBox && viewBox.height > 0 ? viewBox.height : svgElement.clientHeight || 1200;

  clone.setAttribute('width', `${width}`);
  clone.setAttribute('height', `${height}`);

  // Ensure styles are preserved
  const serializer = new XMLSerializer();
  let svgString = serializer.serializeToString(clone);

  // Fix namespace if missing
  if (!svgString.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
    svgString = svgString.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  if (!svgString.match(/^<svg[^>]+"http:\/\/www\.w3\.org\/1999\/xlink"/)) {
    svgString = svgString.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
  }

  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const blobUrl = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.crossOrigin = 'anonymous';

  return new Promise<HTMLCanvasElement>((resolve, reject) => {
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(blobUrl);
        reject(new Error('Canvas context could not be acquired'));
        return;
      }

      // Transparent background
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Draw SVG at 2x scale
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(blobUrl);
      resolve(canvas);
    };

    img.onerror = (e) => {
      URL.revokeObjectURL(blobUrl);
      reject(new Error(`Chyba pri renderovaní SVG do Canvas: ${e}`));
    };

    img.src = blobUrl;
  });
}

/**
 * Converts canvas to PNG blob
 */
export function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Zlyhalo vytvorenie PNG blobu'));
      }
    }, 'image/png');
  });
}

/**
 * Triggers browser download of a blob
 */
export function downloadPngFile(blob: Blob, filename = 'dopravne-znacenie-2026.png') {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Copies PNG blob to system clipboard
 */
export async function copyPngToClipboard(blob: Blob): Promise<boolean> {
  if (!navigator.clipboard || !window.ClipboardItem) {
    throw new Error('Prehliadač nepodporuje priame kopírovanie obrázkov do schránky.');
  }

  const item = new ClipboardItem({ 'image/png': blob });
  await navigator.clipboard.write([item]);
  return true;
}
