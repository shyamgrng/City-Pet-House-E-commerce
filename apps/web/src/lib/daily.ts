// Server-only: reads DAILY_API_KEY from process.env, so only ever import this from a
// Route Handler (app/api/**/route.ts) -- never from a client component.
const DAILY_API_BASE = "https://api.daily.co/v1";
const ROOM_LIFETIME_SECONDS = 24 * 60 * 60;

type DailyRoom = { url: string };

/** Reuses the room if it already exists (a booking's second call attempt, a page reload
 * mid-call, etc.), otherwise creates it fresh. Room names are the same on both the doctor's
 * and client's pages for a given booking, so they always land in the same room. */
export async function getOrCreateDailyRoom(roomName: string): Promise<DailyRoom | { skipped: true }> {
  const apiKey = process.env.DAILY_API_KEY;
  if (!apiKey) {
    console.warn(`[daily] DAILY_API_KEY not set -- cannot set up video room "${roomName}"`);
    return { skipped: true };
  }

  const headers = { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" };

  const existing = await fetch(`${DAILY_API_BASE}/rooms/${roomName}`, { headers });
  if (existing.ok) {
    const room = (await existing.json()) as DailyRoom;
    return { url: room.url };
  }

  const created = await fetch(`${DAILY_API_BASE}/rooms`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      name: roomName,
      privacy: "public",
      properties: {
        exp: Math.floor(Date.now() / 1000) + ROOM_LIFETIME_SECONDS,
        eject_at_room_exp: true,
        max_participants: 4,
        enable_chat: false,
        enable_screenshare: true,
      },
    }),
  });

  if (!created.ok) {
    const text = await created.text().catch(() => "");
    throw new Error(`Daily room creation failed (${created.status}): ${text}`);
  }

  const room = (await created.json()) as DailyRoom;
  return { url: room.url };
}
