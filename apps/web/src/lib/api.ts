const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  accessToken?: string | null;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (options.accessToken) headers["Authorization"] = `Bearer ${options.accessToken}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    const payload = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, payload.message ?? "Request failed");
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

const API_ORIGIN = API_BASE.replace(/\/api\/v1$/, "");

/** Resolves an API-relative path (e.g. a stored `/uploads/xxx.png`) to a fetchable URL. */
export function resolveUploadUrl(path: string): string {
  return path.startsWith("http") ? path : `${API_ORIGIN}${path}`;
}

export async function uploadFile(file: File): Promise<{ url: string }> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/uploads`, { method: "POST", body: form });
  if (!res.ok) throw new ApiError(res.status, "Upload failed");
  const data = await res.json();
  return { url: resolveUploadUrl(data.url) };
}
