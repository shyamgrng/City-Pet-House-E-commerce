// Server-only: reads BREVO_API_KEY from process.env, so only ever import this
// from a Route Handler (app/api/**/route.ts) — never from a client component.
type SendEmailInput = {
  to: string;
  toName?: string;
  subject: string;
  html: string;
};

export async function sendBrevoEmail({ to, toName, subject, html }: SendEmailInput): Promise<{ skipped: boolean }> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.warn(`[brevo] BREVO_API_KEY not set — skipping email "${subject}" to ${to}`);
    return { skipped: true };
  }

  const senderEmail = process.env.BREVO_SENDER_EMAIL || "no-reply@citypethouse.com.np";
  const senderName = process.env.BREVO_SENDER_NAME || "City Pet House & Animal Clinic";

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: { email: senderEmail, name: senderName },
      to: [{ email: to, name: toName || to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Brevo send failed (${res.status}): ${text}`);
  }

  return { skipped: false };
}
