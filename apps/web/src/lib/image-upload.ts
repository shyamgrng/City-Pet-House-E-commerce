const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".svg", ".tif", ".tiff", ".raw", ".cr2"];
const VIDEO_EXTENSIONS = [".mp4", ".mpg", ".mpeg", ".wmv"];

/** Passed to <input accept> so the OS file picker shows these formats even when the browser doesn't know their MIME type (e.g. .raw, .cr2). */
export const IMAGE_ACCEPT = [...IMAGE_EXTENSIONS, "image/jpeg", "image/png", "image/gif", "image/svg+xml", "image/tiff"].join(",");
export const VIDEO_ACCEPT = [...VIDEO_EXTENSIONS, "video/mp4", "video/mpeg", "video/x-ms-wmv"].join(",");

/** file.type is often blank for formats the browser doesn't recognize (RAW, TIFF), so fall back to the extension. */
export function isAllowedImageFile(file: File): boolean {
  if (file.type.startsWith("image/")) return true;
  const name = file.name.toLowerCase();
  return IMAGE_EXTENSIONS.some((ext) => name.endsWith(ext));
}

export function isAllowedVideoFile(file: File): boolean {
  if (file.type.startsWith("video/")) return true;
  const name = file.name.toLowerCase();
  return VIDEO_EXTENSIONS.some((ext) => name.endsWith(ext));
}

/** Reads an image file, downscales it to fit within maxWidth/maxHeight, and returns a JPEG data URL. */
export function resizeImageFile(file: File, maxWidth: number, maxHeight: number, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not decode image."));
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width, maxHeight / img.height);
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas not supported."));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Reads a video file as a data URL, unresized (video can't be downscaled via canvas).
 * Rejects files over maxBytes since a large video as base64 can blow the localStorage quota.
 */
export function readVideoFile(file: File, maxBytes = 5 * 1024 * 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size > maxBytes) {
      reject(new Error(`Video is too large — please choose one under ${Math.round(maxBytes / (1024 * 1024))}MB.`));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file."));
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}
