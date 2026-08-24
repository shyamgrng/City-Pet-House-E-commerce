/**
 * localStorage is used as this app's entire "backend" -- every uploaded photo/video is stored
 * as a base64 string. Most browsers cap it around 5MB per site, which photo/video-heavy admin
 * content can genuinely reach. There's no reliable cross-browser API for the real quota, so this
 * assumes the common conservative 5MB baseline (matches Safari, the tightest major browser).
 */
const ASSUMED_QUOTA_BYTES = 5 * 1024 * 1024;

export function localStorageUsedBytes(): number {
  let total = 0;
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (!key) continue;
    total += key.length + (window.localStorage.getItem(key)?.length ?? 0);
  }
  return total;
}

export function localStorageUsedPercent(): number {
  return Math.min(100, Math.round((localStorageUsedBytes() / ASSUMED_QUOTA_BYTES) * 100));
}
