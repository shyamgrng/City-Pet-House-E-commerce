import type { EmailEvent } from "./email-templates";

/** Fire-and-forget: posts to /api/notify, never throws, never blocks the caller. */
export function notifyEvent(event: EmailEvent, to: string, toName: string, data: Record<string, unknown>) {
  if (!to) return;
  fetch("/api/notify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, to, toName, data }),
  }).catch((err) => {
    console.warn(`[notify] failed to send "${event}"`, err);
  });
}
