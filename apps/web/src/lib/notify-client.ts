import type { EmailEvent } from "./email-templates";

/**
 * Posts to /api/notify and resolves to whether the email actually went out. Never throws --
 * a network failure, a non-2xx response, or the server reporting `skipped` (e.g. Brevo isn't
 * configured) all resolve to `false` rather than rejecting, so callers can always await this
 * without a try/catch.
 */
export async function notifyEvent(event: EmailEvent, to: string, toName: string, data: Record<string, unknown>): Promise<boolean> {
  if (!to) return false;
  try {
    const res = await fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, to, toName, data }),
    });
    if (!res.ok) {
      console.warn(`[notify] "${event}" to ${to} failed with status ${res.status}`);
      return false;
    }
    const result = (await res.json().catch(() => null)) as { ok?: boolean; skipped?: boolean } | null;
    if (result?.skipped) {
      console.warn(`[notify] "${event}" to ${to} was skipped -- email sending isn't configured`);
      return false;
    }
    return !!result?.ok;
  } catch (err) {
    console.warn(`[notify] failed to send "${event}"`, err);
    return false;
  }
}
