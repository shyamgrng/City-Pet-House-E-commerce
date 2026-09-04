import { NextResponse } from "next/server";
import { getOrCreateDailyRoom } from "@/lib/daily";

export async function GET(request: Request) {
  const room = new URL(request.url).searchParams.get("room");
  if (!room) {
    return NextResponse.json({ ok: false, error: "Missing room" }, { status: 400 });
  }

  try {
    const result = await getOrCreateDailyRoom(room);
    if ("skipped" in result) {
      return NextResponse.json({ ok: false, error: "Video calling isn't set up yet." }, { status: 503 });
    }
    return NextResponse.json({ ok: true, url: result.url });
  } catch (err) {
    console.error(`[api/daily-room] failed to set up room "${room}"`, err);
    return NextResponse.json({ ok: false, error: "Could not set up the video call room" }, { status: 502 });
  }
}
