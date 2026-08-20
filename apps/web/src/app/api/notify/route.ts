import { NextResponse } from "next/server";
import { sendBrevoEmail } from "@/lib/brevo";
import { buildEmail, type EmailEvent } from "@/lib/email-templates";

export async function POST(request: Request) {
  let body: { event?: string; to?: string; toName?: string; data?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const { event, to, toName, data } = body;
  if (!event || !to) {
    return NextResponse.json({ ok: false, error: "Missing required fields: event, to" }, { status: 400 });
  }

  const rendered = buildEmail(event as EmailEvent, data ?? {});
  if (!rendered) {
    return NextResponse.json({ ok: false, error: `Unknown event: ${event}` }, { status: 400 });
  }

  try {
    const result = await sendBrevoEmail({ to, toName, subject: rendered.subject, html: rendered.html });
    return NextResponse.json({ ok: true, skipped: result.skipped });
  } catch (err) {
    console.error(`[api/notify] failed to send "${event}" to ${to}`, err);
    return NextResponse.json({ ok: false, error: "Failed to send email" }, { status: 502 });
  }
}
