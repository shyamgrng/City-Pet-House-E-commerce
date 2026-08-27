import { siteSettings } from "./site-settings";

export type EmailEvent =
  | "order_placed"
  | "order_dispatched"
  | "order_delivered"
  | "payment_approved"
  | "vet_booked"
  | "vet_confirmed"
  | "vet_completed"
  | "account_created"
  | "forgot_password"
  | "doctor_registration_received"
  | "doctor_registration_approved";

type Rendered = { subject: string; html: string };

function shell(heading: string, bodyHtml: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#F0F2F4;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F0F2F4;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="background:#1996C8;padding:22px 28px;">
                <div style="font-size:18px;font-weight:700;color:#ffffff;">🐾 ${siteSettings.shortName}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <div style="font-size:19px;font-weight:700;color:#1A2027;margin-bottom:14px;">${heading}</div>
                <div style="font-size:14px;color:#3A4652;line-height:1.7;">${bodyHtml}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 28px;background:#F7F9FA;border-top:1px solid #E4E9EC;">
                <div style="font-size:12px;color:#8A96A3;line-height:1.7;">
                  ${siteSettings.businessName}<br />
                  ${siteSettings.phone} · ${siteSettings.email}<br />
                  ${siteSettings.address}
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function money(n: number) {
  return `Rs. ${n.toLocaleString("en-IN")}`;
}

export function buildEmail(event: EmailEvent, data: Record<string, unknown>): Rendered | null {
  switch (event) {
    case "order_placed": {
      const { orderId, ownerName, items, total } = data as {
        orderId: string;
        ownerName: string;
        items: { name: string; qty: number; price: number }[];
        total: number;
      };
      const rows = items
        .map((it) => `<div style="padding:6px 0;border-bottom:1px solid #F0F2F4;">${it.name} × ${it.qty} — ${money(it.price * it.qty)}</div>`)
        .join("");
      return {
        subject: `Order ${orderId} received — ${siteSettings.shortName}`,
        html: shell(
          "We've received your order 🎉",
          `Hi ${ownerName}, thanks for your order <strong>${orderId}</strong>. We're reviewing your payment receipt now — you'll get another email once it's approved.<br /><br />
          ${rows}
          <div style="padding-top:10px;font-weight:700;color:#1A2027;">Total: ${money(total)}</div>`
        ),
      };
    }
    case "payment_approved": {
      const { orderId, ownerName, total } = data as { orderId: string; ownerName: string; total: number };
      return {
        subject: `Payment approved for ${orderId} — ${siteSettings.shortName}`,
        html: shell(
          "Payment approved ✓",
          `Hi ${ownerName}, we've approved your payment of <strong>${money(total)}</strong> for order <strong>${orderId}</strong>. We're preparing it for dispatch — you'll hear from us again once it's on the way.`
        ),
      };
    }
    case "order_dispatched": {
      const { orderId, ownerName } = data as { orderId: string; ownerName: string };
      return {
        subject: `Order ${orderId} is on the way — ${siteSettings.shortName}`,
        html: shell(
          "Your order is on the way 🚚",
          `Hi ${ownerName}, order <strong>${orderId}</strong> has been handed to our courier and is on its way to you.`
        ),
      };
    }
    case "order_delivered": {
      const { orderId, ownerName } = data as { orderId: string; ownerName: string };
      return {
        subject: `Order ${orderId} delivered — ${siteSettings.shortName}`,
        html: shell(
          "Delivered! ✓",
          `Hi ${ownerName}, order <strong>${orderId}</strong> has been delivered. We hope your pet loves it — let us know if anything's wrong with your order.`
        ),
      };
    }
    case "vet_booked": {
      const { bookingId, ownerName, petName, doctorName, scheduledDate, scheduledTime } = data as {
        bookingId: string;
        ownerName: string;
        petName: string;
        doctorName: string;
        scheduledDate: string;
        scheduledTime: string;
      };
      return {
        subject: `Vet consult request received — ${siteSettings.shortName}`,
        html: shell(
          "We've got your booking request",
          `Hi ${ownerName}, your consult request <strong>${bookingId}</strong> for ${petName} with ${doctorName} on ${scheduledDate} at ${scheduledTime} has been received. We'll confirm it once your payment is verified.`
        ),
      };
    }
    case "vet_confirmed": {
      const { bookingId, ownerName, petName, doctorName, scheduledDate, scheduledTime } = data as {
        bookingId: string;
        ownerName: string;
        petName: string;
        doctorName: string;
        scheduledDate: string;
        scheduledTime: string;
      };
      return {
        subject: `Vet consult confirmed — ${siteSettings.shortName}`,
        html: shell(
          "Your consult is confirmed ✓",
          `Hi ${ownerName}, your consult <strong>${bookingId}</strong> for ${petName} with ${doctorName} is confirmed for ${scheduledDate} at ${scheduledTime}. Join from your account when it's time.`
        ),
      };
    }
    case "vet_completed": {
      const { bookingId, ownerName, petName, doctorName } = data as {
        bookingId: string;
        ownerName: string;
        petName: string;
        doctorName: string;
      };
      return {
        subject: `Your consult summary — ${siteSettings.shortName}`,
        html: shell(
          "Consult completed",
          `Hi ${ownerName}, your consult <strong>${bookingId}</strong> for ${petName} with ${doctorName} has ended. Any notes from the doctor are visible in your account.`
        ),
      };
    }
    case "account_created": {
      const { name } = data as { name: string };
      return {
        subject: `Welcome to ${siteSettings.shortName}!`,
        html: shell(
          `Welcome, ${name} 🐾`,
          `Your ${siteSettings.shortName} account has been created. You can now shop for pet products, book vet consults, browse puppies, and post adoptions — all from your account.`
        ),
      };
    }
    case "forgot_password": {
      const { name, code } = data as { name: string; code: string };
      return {
        subject: `Your ${siteSettings.shortName} password reset code`,
        html: shell(
          "Reset your password",
          `Hi ${name}, use this code to reset your password:<br /><br />
          <div style="font-size:28px;font-weight:700;letter-spacing:4px;color:#1996C8;">${code}</div><br />
          This code expires in 15 minutes. If you didn't request this, you can safely ignore this email.`
        ),
      };
    }
    case "doctor_registration_received": {
      const { name } = data as { name: string };
      return {
        subject: `We've received your doctor application — ${siteSettings.shortName}`,
        html: shell(
          "Application received",
          `Hi ${name}, thanks for applying to join ${siteSettings.shortName} as a doctor. Our admin team is reviewing your details and documents — we'll email you your Doctor ID and password once you're verified.`
        ),
      };
    }
    case "doctor_registration_approved": {
      const { name, doctorId, password } = data as { name: string; doctorId: string; password: string };
      return {
        subject: `You're verified — Doctor Sign In details — ${siteSettings.shortName}`,
        html: shell(
          "Welcome to the team ✓",
          `Hi ${name}, your doctor application has been verified. Sign in to the Doctor Portal with:<br /><br />
          <div style="font-size:14px;"><strong>Doctor ID:</strong> ${doctorId}</div>
          <div style="font-size:14px;margin-bottom:10px;"><strong>Password:</strong> ${password}</div>
          Please sign in and change your password from your profile.`
        ),
      };
    }
    default:
      return null;
  }
}
