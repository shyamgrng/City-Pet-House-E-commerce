import type { EmailEvent } from "./email-templates";

export type NotifyResult = { ok: boolean; error?: string };

/**
 * Posts to /api/notify and resolves to whether the email actually went out, plus the server's
 * error detail when it didn't (e.g. Brevo rejecting an unverified sender) -- never throws, so
 * callers can always await this without a try/catch. A "skipped" response (e.g. BREVO_API_KEY
 * isn't configured) counts as a failure here, not a soft success, since no email actually sent.
 */
export async function notifyEvent(event: EmailEvent, to: string, toName: string, data: Record<string, unknown>): Promise<NotifyResult> {
  if (!to) return { ok: false, error: "No recipient email address." };
  try {
    const res = await fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, to, toName, data }),
    });
    const result = (await res.json().catch(() => null)) as { ok?: boolean; skipped?: boolean; error?: string } | null;

    if (!res.ok || !result?.ok) {
      const error = result?.error || `Request failed with status ${res.status}`;
      console.warn(`[notify] "${event}" to ${to} failed: ${error}`);
      return { ok: false, error };
    }
    if (result.skipped) {
      console.warn(`[notify] "${event}" to ${to} was skipped -- email sending isn't configured on the server`);
      return { ok: false, error: "Email sending isn't configured on the server." };
    }
    return { ok: true };
  } catch (err) {
    const error = err instanceof Error ? err.message : "Network error";
    console.warn(`[notify] failed to send "${event}"`, err);
    return { ok: false, error };
  }
}
