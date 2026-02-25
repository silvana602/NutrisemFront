const MAX_PREVIEW_SIDE = 640;
const TARGET_BYTES = 350 * 1024;
const QUALITY_STEPS = [0.86, 0.76, 0.66, 0.56];

function estimateDataUrlBytes(dataUrl: string): number {
  const separator = dataUrl.indexOf(",");
  if (separator === -1) return dataUrl.length;
  const base64Length = dataUrl.length - separator - 1;
  return Math.floor((base64Length * 3) / 4);
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("No se pudo leer la imagen seleccionada."));
    };
    reader.onerror = () => reject(new Error("No se pudo leer la imagen seleccionada."));
    reader.readAsDataURL(file);
  });
}

function loadImageFromObjectUrl(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("No se pudo procesar la imagen seleccionada."));
    };

    image.src = objectUrl;
  });
}

function drawScaledImage(image: HTMLImageElement): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const maxSide = Math.max(image.width, image.height);
  const scale = maxSide > MAX_PREVIEW_SIDE ? MAX_PREVIEW_SIDE / maxSide : 1;

  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("No se pudo preparar la vista previa de imagen.");
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function getCompressedDataUrl(canvas: HTMLCanvasElement, quality: number): string {
  try {
    const webp = canvas.toDataURL("image/webp", quality);
    if (webp.startsWith("data:image/webp")) return webp;
  } catch {
    // Si webp no está disponible, usar jpeg.
  }

  return canvas.toDataURL("image/jpeg", quality);
}

export async function fileToDataUrl(file: File): Promise<string> {
  const original = await readFileAsDataUrl(file);

  if (typeof window === "undefined") return original;

  try {
    const image = await loadImageFromObjectUrl(file);
    const canvas = drawScaledImage(image);

    let selected = original;
    for (const quality of QUALITY_STEPS) {
      const candidate = getCompressedDataUrl(canvas, quality);
      selected = estimateDataUrlBytes(candidate) < estimateDataUrlBytes(selected) ? candidate : selected;
      if (estimateDataUrlBytes(selected) <= TARGET_BYTES) break;
    }

    return selected;
  } catch {
    return original;
  }
}

export function isDataUrlSizeAllowed(dataUrl: string, maxBytes = 1024 * 1024): boolean {
  return estimateDataUrlBytes(dataUrl) <= maxBytes;
}
