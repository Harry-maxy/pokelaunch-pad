import html2canvas from 'html2canvas';

/**
 * Capture a DOM element as a square PNG image
 * @param element The DOM element to capture
 * @param size Output size (width and height)
 * @returns Data URL of the captured image
 */
export async function captureElementAsImage(
  element: HTMLElement,
  size: number = 512
): Promise<string> {
  // Use html2canvas to capture the element
  const canvas = await html2canvas(element, {
    backgroundColor: '#0a0a0a', // Dark background
    scale: 2, // Higher quality
    logging: false,
    useCORS: true,
    allowTaint: true,
  });

  // Create a square output canvas
  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = size;
  outputCanvas.height = size;
  const ctx = outputCanvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Fill with dark background
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, size, size);

  // Calculate scaling to fit the card in the square
  const scale = Math.min(size / canvas.width, size / canvas.height) * 0.9;
  const scaledWidth = canvas.width * scale;
  const scaledHeight = canvas.height * scale;
  
  // Center the card
  const x = (size - scaledWidth) / 2;
  const y = (size - scaledHeight) / 2;

  // Draw the captured card centered
  ctx.drawImage(canvas, x, y, scaledWidth, scaledHeight);

  return outputCanvas.toDataURL('image/png', 0.95);
}

/**
 * Check if html2canvas is available
 */
export function isHtml2CanvasAvailable(): boolean {
  return typeof html2canvas !== 'undefined';
}

