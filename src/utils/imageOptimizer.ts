/**
 * High-performance Client-Side Image Optimizer
 * Resizes and compresses any camera or device photo to web-optimized dimensions
 * and JPEG quality (~40-80 KB each) so it stores seamlessly in Firestore (<1MB limit)
 * and transmits instantly over HTTP to all online clients.
 */

export interface OptimizedImageResult {
  dataUrl: string;
  originalSize: number;
  optimizedSize: number;
  width: number;
  height: number;
}

export async function compressImage(
  file: File,
  maxWidth = 720,
  maxHeight = 720,
  quality = 0.75
): Promise<OptimizedImageResult> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('El archivo seleccionado no es una imagen válida.'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Error al leer el archivo de imagen.'));

    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onerror = () => reject(new Error('No se pudo decodificar la imagen.'));

      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width <= 0 || height <= 0) {
          width = 800;
          height = 600;
        }

        // Scale while preserving aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Error al inicializar el procesador de imágenes en el navegador.'));
        }

        // Fill background with white in case of transparent PNGs
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);

        // Smooth rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const approxSize = Math.round((dataUrl.length * 3) / 4);

        resolve({
          dataUrl,
          originalSize: file.size,
          optimizedSize: approxSize,
          width,
          height,
        });
      };

      img.src = readerEvent.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

// Convert a remote URL to an optimized dataURL or validated URL
export function isValidImageUrl(url: string): boolean {
  if (!url) return false;
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:image/');
}
