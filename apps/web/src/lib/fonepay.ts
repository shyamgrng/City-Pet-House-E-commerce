import crypto from "crypto";

// Server-only -- never import this from a "use client" file. Reads the merchant secret key,
// which must stay off the client bundle entirely (Fonepay's own guidance: generate the
// HMAC-SHA512 signature in the backend, never in a frontend app).
//
// Set these in Vercel (Project Settings > Environment Variables), same place as
// DAILY_API_KEY/BREVO_API_KEY: FONEPAY_MERCHANT_CODE, FONEPAY_USERNAME, FONEPAY_PASSWORD,
// FONEPAY_SECRET_KEY, and FONEPAY_ENV ("uat" while testing, "production" when live).

const BASE_URL =
  process.env.FONEPAY_ENV === "production"
    ? "https://merchantapi.fonepay.com/api/merchant/merchantDetailsForThirdParty"
    : "https://uat-new-merchant-api.fonepay.com/api/merchant/merchantDetailsForThirdParty";

type FonepayCreds = { merchantCode: string; username: string; password: string; secretKey: string };

export function fonepayCreds(): FonepayCreds | null {
  const merchantCode = process.env.FONEPAY_MERCHANT_CODE;
  const username = process.env.FONEPAY_USERNAME;
  const password = process.env.FONEPAY_PASSWORD;
  const secretKey = process.env.FONEPAY_SECRET_KEY;
  if (!merchantCode || !username || !password || !secretKey) return null;
  return { merchantCode, username, password, secretKey };
}

function sign(message: string, secretKey: string): string {
  return crypto.createHmac("sha512", secretKey).update(message).digest("hex");
}

export type FonepayQr = {
  qrMessage: string;
  prn: string;
  thirdpartyQrWebSocketUrl: string | null;
};

/** amount is in whole Rupees (this site never deals in paisa) -- kept as a plain digit string,
 * per Fonepay's "numeric digits 0-9 with optional single '.' " field spec. */
export async function createFonepayQr(amount: number, prn: string, remarks1: string, remarks2: string): Promise<FonepayQr> {
  const c = fonepayCreds();
  if (!c) throw new Error("Fonepay isn't configured yet — set FONEPAY_MERCHANT_CODE/USERNAME/PASSWORD/SECRET_KEY in Vercel.");

  const amountStr = String(Math.round(amount));
  const message = [amountStr, prn, c.merchantCode, remarks1, remarks2].join(",");
  const dataValidation = sign(message, c.secretKey);

  const res = await fetch(`${BASE_URL}/thirdPartyDynamicQrDownload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: amountStr,
      remarks1,
      remarks2,
      prn,
      merchantCode: c.merchantCode,
      dataValidation,
      username: c.username,
      password: c.password,
    }),
  });

  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.success || !body?.qrMessage) {
    throw new Error(body?.message || `Fonepay QR request failed (${res.status})`);
  }

  return { qrMessage: body.qrMessage, prn, thirdpartyQrWebSocketUrl: body.thirdpartyQrWebSocketUrl ?? null };
}

export type FonepayStatus = "success" | "failed" | "pending" | "unknown";

export async function checkFonepayStatus(prn: string): Promise<FonepayStatus> {
  const c = fonepayCreds();
  if (!c) throw new Error("Fonepay isn't configured yet — set FONEPAY_MERCHANT_CODE/USERNAME/PASSWORD/SECRET_KEY in Vercel.");

  const message = [prn, c.merchantCode].join(",");
  const dataValidation = sign(message, c.secretKey);

  const res = await fetch(`${BASE_URL}/thirdPartyDynamicQrGetStatus`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prn, merchantCode: c.merchantCode, dataValidation, username: c.username, password: c.password }),
  });

  const body = await res.json().catch(() => null);
  const status = body?.paymentStatus;
  return status === "success" || status === "failed" || status === "pending" ? status : "unknown";
}
