import { NextResponse } from "next/server";
import { sendBrevoEmail } from "@/lib/brevo";
import { buildEmail, type EmailEvent } from "@/lib/email-templates";
import { buildPrescriptionPdf, type PrescriptionPdfData } from "@/lib/prescription-pdf";

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
    let attachments: { name: string; content: string }[] | undefined;
    if (event === "vet_prescription") {
      const pdfBytes = await buildPrescriptionPdf(data as unknown as PrescriptionPdfData);
      attachments = [{ name: "Prescription.pdf", content: Buffer.from(pdfBytes).toString("base64") }];
    }

    const result = await sendBrevoEmail({ to, toName, subject: rendered.subject, html: rendered.html, attachments });
    return NextResponse.json({ ok: true, skipped: result.skipped });
  } catch (err) {
    console.error(`[api/notify] failed to send "${event}" to ${to}`, err);
    return NextResponse.json({ ok: false, error: "Failed to send email" }, { status: 502 });
  }
}
