const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".svg", ".tif", ".tiff", ".raw", ".cr2", ".heic", ".heif", ".webp", ".bmp"];
const VIDEO_EXTENSIONS = [".mp4", ".mpg", ".mpeg", ".wmv"];
const DOCUMENT_EXTENSIONS = [".doc", ".docx"];
const DOCUMENT_MIME_TYPES = ["application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

/**
 * A long list of specific extensions/MIME types in <input accept> can make mobile browsers fall
 * back to a generic file browser instead of the native Photos picker, which makes it look like
 * photos "can't be uploaded" even though the picker would technically allow it. The broad
 * "image/*" wildcard is what reliably opens the native photo picker on iOS/Android and still
 * covers PNG/JPEG/HEIC/etc.; isAllowedImageFile below stays permissive for the rare RAW/CR2 file
 * someone selects via "browse all files".
 */
export const IMAGE_ACCEPT = "image/*";
export const VIDEO_ACCEPT = [...VIDEO_EXTENSIONS, "video/mp4", "video/mpeg", "video/x-ms-wmv"].join(",");
/** For fields that accept a document as either a photo, a PDF, or a Word file. */
export const DOCUMENT_UPLOAD_ACCEPT = ["image/*", "application/pdf", ...DOCUMENT_EXTENSIONS, ...DOCUMENT_MIME_TYPES].join(",");

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

/** PDF or Word document (.doc/.docx) -- used for fields where either a scan or the original file is fine. */
export function isAllowedDocumentFile(file: File): boolean {
  if (file.type === "application/pdf" || DOCUMENT_MIME_TYPES.includes(file.type)) return true;
  const name = file.name.toLowerCase();
  return name.endsWith(".pdf") || DOCUMENT_EXTENSIONS.some((ext) => name.endsWith(ext));
}

const MAX_FALLBACK_BYTES = 8 * 1024 * 1024;

const DECODE_TIMEOUT_MS = 6000;

/**
 * Reads an image file, downscales it to fit within maxWidth/maxHeight, and returns a JPEG data URL.
 * Resizing is best-effort: some browsers (notably Safari, for certain wide-gamut/ICC-profile PNGs,
 * or HEIC photos straight off an iPhone camera) can fail to decode an image onto a canvas even
 * though the file itself is perfectly valid -- and on some mobile browsers that failure doesn't
 * even fire img.onerror, it just never fires anything, leaving the upload hanging forever with no
 * value set and no error shown (looks exactly like "nothing happened"). A timeout guarantees this
 * always settles one way or another: falls back to storing the original file's data URL untouched.
 */
export function resizeImageFile(file: File, maxWidth: number, maxHeight: number, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file."));
    reader.onload = () => {
      const original = reader.result as string;
      const img = new Image();
      let settled = false;
      const fallbackToOriginal = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timeoutId);
        if (file.size > MAX_FALLBACK_BYTES) {
          reject(new Error(`Could not process that image, and it's too large (over ${Math.round(MAX_FALLBACK_BYTES / (1024 * 1024))}MB) to use as-is.`));
          return;
        }
        resolve(original);
      };
      const timeoutId = setTimeout(fallbackToOriginal, DECODE_TIMEOUT_MS);
      img.onerror = fallbackToOriginal;
      img.onload = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timeoutId);
        try {
          const scale = Math.min(1, maxWidth / img.width, maxHeight / img.height);
          const width = Math.round(img.width * scale);
          const height = Math.round(img.height * scale);
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(original);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        } catch {
          resolve(original);
        }
      };
      img.src = original;
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
