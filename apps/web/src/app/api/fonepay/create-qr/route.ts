import { NextResponse } from "next/server";
import { createFonepayQr, fonepayCreds } from "@/lib/fonepay";

export async function POST(request: Request) {
  if (!fonepayCreds()) {
    return NextResponse.json({ ok: false, error: "Fonepay isn't set up yet." }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const amount = Number(body?.amount);
  const reference = typeof body?.reference === "string" ? body.reference.trim() : "";
  const remarks1 = typeof body?.remarks1 === "string" && body.remarks1.trim() ? body.remarks1.trim().slice(0, 25) : "City Pet House";
  const remarks2 = typeof body?.remarks2 === "string" && body.remarks2.trim() ? body.remarks2.trim().slice(0, 25) : "Payment";

  if (!Number.isFinite(amount) || amount <= 0 || !reference) {
    return NextResponse.json({ ok: false, error: "Missing or invalid amount/reference." }, { status: 400 });
  }

  // Fonepay requires prn to be unique per request (max 25 chars) -- a customer re-opening the
  // payment page (or retrying) gets a fresh one rather than reusing a possibly-already-consumed
  // prn. The unique timestamp suffix is never truncated; the reference is shortened instead.
  const suffix = Date.now().toString(36);
  const prn = `${reference.slice(0, 25 - suffix.length - 1)}-${suffix}`;

  try {
    const qr = await createFonepayQr(amount, prn, remarks1, remarks2);
    return NextResponse.json({ ok: true, ...qr });
  } catch (err) {
    console.error("[api/fonepay/create-qr] failed", err);
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : "Could not create the Fonepay QR." }, { status: 502 });
  }
}
