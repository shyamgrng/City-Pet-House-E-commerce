import { NextResponse } from "next/server";
import { checkFonepayStatus, fonepayCreds } from "@/lib/fonepay";

export async function GET(request: Request) {
  if (!fonepayCreds()) {
    return NextResponse.json({ ok: false, error: "Fonepay isn't set up yet." }, { status: 503 });
  }

  const prn = new URL(request.url).searchParams.get("prn");
  if (!prn) {
    return NextResponse.json({ ok: false, error: "Missing prn." }, { status: 400 });
  }

  try {
    const paymentStatus = await checkFonepayStatus(prn);
    return NextResponse.json({ ok: true, paymentStatus });
  } catch (err) {
    console.error("[api/fonepay/status] failed", err);
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : "Could not check payment status." }, { status: 502 });
  }
}
