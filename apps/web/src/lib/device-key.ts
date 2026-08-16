const STORAGE_KEY = "cph_device_key";

/** Anonymous cart identity before sign-in — merged into the owner's cart on login (never lost). */
export function getDeviceKey(): string {
  if (typeof window === "undefined") return "";
  let key = window.localStorage.getItem(STORAGE_KEY);
  if (!key) {
    key = crypto.randomUUID();
    window.localStorage.setItem(STORAGE_KEY, key);
  }
  return key;
}
