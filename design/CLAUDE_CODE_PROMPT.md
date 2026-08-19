# Prompt for Claude Code

Copy everything below the line into Claude Code, with this folder attached/open.

---

I'm handing you a **design prototype package** for a product called **City Pet House & Animal Clinic (CPH)** — a pet-shop, veterinary telehealth, and pet-adoption platform operating in Kathmandu, Nepal. I need you to build the **real production system** from it.

## What's in this folder

- `CPH Phase1 Prototype.dc.html` — the **website** design, which also contains the **Admin Panel** and the **Doctor / Courier / B2B supplier portals**.
- `CPH Mobile Screen.dc.html` — the **mobile app** design (iOS + Android), rendered inside device frames. Covers the customer app, a staff-facing admin app, and mobile versions of all three portals.
- `support.js`, `image-slot.js`, `ios-frame.jsx`, `android-frame.jsx` — prototype-only runtime/scaffolding.
- `assets/` — brand and icon assets.
- `README.md` — detailed screen-by-screen feature breakdown. **Read it fully before writing code.**

**Open both `.dc.html` files in a browser first and click through every screen and state.** They are fully interactive. They are the source of truth for layout, content, copy, and behavior.

## Critical: these are design references, NOT code to port

The prototypes use a custom in-house templating runtime (`support.js`, with `<x-dc>`, `sc-if`, `sc-for`, `{{ }}` holes) that exists only to make the mockups clickable in a browser. **It has no production equivalent. Do not copy it, wrap it, or embed the HTML in a webview.** Read the rendered result — layouts, spacing, colors, copy, flows, states — and rebuild it properly in the target stack.

Likewise, all prototype "state" lives in one shared `localStorage` blob. That is a **stand-in for a real backend**. Every piece of it must become real server-side data behind an API.

## What to build

1. **Web app** — public storefront + pet-owner account + Doctor/Courier/B2B portals + Admin Panel. Suggest React/Next.js unless you have a strong reason otherwise.
2. **Mobile apps** — Android + iOS. React Native (or Flutter) sharing one codebase is preferred; recreate both platforms' navigation conventions (iOS back arrow / Android back).
3. **One backend/API** serving all three surfaces — auth, catalog, orders, vet bookings, finance, page content, notifications, file uploads.

## ⚠️ The single most important requirement: cross-platform sync

Website, mobile app, and admin panel are **one system sharing one backend**. An action on any surface must be immediately visible on all others. This is not a nice-to-have; it's the core of the product. Concretely:

- Pet owner checks out (web or app) → order appears in **Admin → Deliveries → Payment Queue** with the uploaded payment receipt, and in that owner's order history on **both** platforms, **scoped to the signed-in user only**.
- Admin approves payment → dispatches → assigns courier → courier marks received/on-the-way/delivered → the status **and its timestamp** advance everywhere that order is shown (owner's tracking, B2B status timeline, courier portal, admin).
- B2B supplier marks a line item out-of-stock, sends for refund, or marks "Sent to CPH" → reflects in Admin and in the owner's tracking.
- Doctor/Courier/B2B **registration documents**, verification ticks, and approval state are shared with Admin → Accounts.
- Vet consult: owner books and uploads receipt → Admin approves → doctor reconfirms → video call + chat + file sharing → full transcript, files, and call logs archived and visible to Admin, and continued in the next session for the same pet.
- **Cart, wishlist, addresses, profile, product catalog edits, page-editor content (banners/categories/brands/testimonials), pet listings, adoption posts, finance ledgers, and notification/alert badge counts** — all shared in both directions.
- **Alert badges** (the red/amber count pills on admin tabs and portal tabs) are *derived* from shared state and must recompute live — e.g. approving a payment raises the doctor's Booking badge and the B2B Incoming badge.
- **Only the login session is per-device.** Each platform has its own auth session; everything else is shared.

Use realtime (WebSocket/subscriptions) or short-interval polling so these propagate without a manual refresh.

## Business rules to enforce server-side (not just in the UI)

- **Sign-in gating**: checkout, pet purchase, vet booking, and the account area all require a signed-in pet owner. Preserve the user's cart/intent through the sign-in redirect and return them to where they were — never make them lose an uploaded receipt or a filled form.
- **Scoping**: a B2B supplier sees only orders containing *their own* products; a courier sees only deliveries assigned to *them*; a doctor sees only *their* bookings; a pet owner sees only *their* orders. Admin sees everything.
- **Role-based admin access**: Admin/Manager/Staff with per-section permissions; the mobile admin app shows only what that staff member is granted.
- **Money**: prices are Nepali Rupees formatted like `Rs. 1,300`. Parse carefully (the `Rs.` prefix must not corrupt the number) and store amounts as integers/decimals, never as display strings. Delivery fee is 0 when the cart is empty. B2B payouts are sale amount minus CPH commission percentage.
- **Refund/out-of-stock** actions are per-line-item, reversible, and gated on the order checklist being complete before "Mark as Sent to CPH".
- **Order IDs** must be globally unique — never reuse or collide with an existing order (the prototype had a real bug here).
- **Today's Deals** is admin-driven, not hardcoded: each product carries a `todaysDeal` flag (plus optional `dealStart`/`dealEnd` window, and an independent `hotSale` + `hotDiscount` %). The home page of both the website and the mobile app renders a "Today's Deals" row directly **below** the Hot Sales Banner, showing up to 6 products currently flagged and inside their time window — with the Hot Sale badge, struck-through original price, discounted price, and a live "Ends in Xh Ym" countdown when `dealEnd` is set. Ticking/unticking the flag in Admin → Shop (or in a B2B supplier's product form) must add/remove the product from that row on every surface. When nothing is flagged, show a short empty state rather than a blank gap.
- **Web Vet on/off switch**: when Admin toggles Web Vet inactive, the public booking flow is replaced with an "under construction" notice everywhere.

## Integrations referenced in the prototype

- **Agora** for the vet video/audio calls (the prototype has notes on a token endpoint pattern: verify the requester is the doctor or client on that booking *and* that payment is approved, then issue an RTC token for channel `booking_{id}`).
- **QR-code payment receipts** — customers pay via QR and upload a screenshot; admin reviews and approves.
- **Generated QR pet tags** — scanning a tag opens a public page showing that pet's and owner's details from the Pet Tag Archive.
- **Microchipping records** — lookup by chip number, visible only to signed-in Admin/Doctor/B2B users.

## How I'd like you to work

1. Read `README.md`, then click through both prototypes.
2. **Propose the architecture and data model first** — schema, API surface, realtime strategy, auth/roles, repo structure — and let me approve it before you write feature code.
3. Then build in this order: auth + data model → catalog/shop → cart/checkout/orders + admin deliveries (the sync backbone) → portals (B2B, courier, doctor) → vet consult + video → admin page editors, finance, archives → mobile app on the same API.
4. Flag anything in the prototype that's ambiguous or that you think is wrong rather than guessing.

## Known gaps — please confirm with me, don't invent

- All images in the prototypes are **placeholder drop-zones**. Real product/pet photography and brand imagery still need to be supplied.
- Mobile admin does **not** yet have Career (applications), Users (roles & permissions), or Settings screens — the website admin does. Build them for mobile from the website's versions.
- Payment gateway is manual QR + receipt upload today. If we should integrate a real gateway (eSewa/Khalti/etc.), ask me first.
