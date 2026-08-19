# Handoff: City Pet House & Animal Clinic — Web + Mobile Platform

## Overview
City Pet House is a pet-shop, vet-consult, and adoption platform for Kathmandu, Nepal. This package covers the full platform across **three surfaces that share one backend**: the public **website**, the **mobile app (Android + iOS)**, and the **admin panel**. Features: public storefront, pet-owner account, vet-consult booking + video-call flow, B2B supplier portal, courier portal, doctor portal, and admin (deliveries, vet consults, finance, user roles/permissions, page editors), with everything synced across all three surfaces.

## About the Design Files
This package contains **two** design references built in HTML — interactive, clickable prototypes showing intended layout, content, and behavior. They are **not production code to copy directly**. The task is to **build a real web app (React/Next.js or the team's chosen stack) AND native mobile apps for Android + iOS** (React Native/Flutter, or fully native) from these references, with a shared backend, proper auth, and real data persistence — not by embedding this HTML.

- `CPH Phase1 Prototype.dc.html` — the **desktop website** plus an in-file "Admin Panel" mode. This is the source of truth for the storefront, pet-owner account, vet-consult flow, B2B/courier/doctor portals, and the full admin panel.
- `CPH Mobile Screen.dc.html` — the **mobile app** (rendered inside iOS/Android device frames). This is the source of truth for the phone-native layouts of the same features: customer app, admin app, and the doctor/courier/B2B portals.

Both prototypes use a custom templating runtime (`support.js`) plus `image-slot.js` (drop-zone placeholders) and `ios-frame.jsx`/`android-frame.jsx` (device bezels) purely to make the mockups interactive in-browser. That runtime and its `<x-dc>` / `sc-if` / `sc-for` template syntax are **prototype-only** and have no production equivalent — ignore them when reading structure and focus on the rendered layout/content/styles/behavior.

## ⚠️ Cross-platform sync is a hard requirement, not a visual detail
The website, mobile app, and admin panel are **one system sharing one backend**. In the prototypes this is faked with a shared `localStorage` blob so the three views stay in lock-step; in production this MUST be real server-side state exposed via APIs. Concretely, an action on any surface must be visible on all others:
- Pet owner places/checks-out an order (web or app) → appears in **Admin Payment Queue** and in that owner's order history on **both** platforms, scoped to the signed-in user.
- Admin approves payment / dispatches / a courier marks delivered → order status + timestamp advances everywhere it's shown (owner account, B2B status, courier portal, admin).
- B2B marks a line item out-of-stock / sends for refund / marks "Sent to CPH" → reflects in Admin and the owner's tracking.
- Cart, wishlist, addresses, profile, product catalog edits, page-editor content, vet bookings, finance ledgers, notification/alert badge counts — all shared both directions. Only the **session/`isSignedIn`** state is per-device (each platform has its own login session).
- **Alert badges** (red count pills) on Admin tabs and on the Doctor/Courier/B2B portal tabs are derived from that shared state and must recompute live as events occur (e.g. approving a payment raises the doctor's Booking badge and the B2B Incoming badge).

## Fidelity
**High-fidelity (hifi).** Colors, typography, spacing, copy, and component states shown are final-intent — recreate pixel-close using the target codebase's component library/design system, substituting real design tokens where the codebase already has an equivalent (e.g. its own button/input components) rather than inventing new ones.

## How State Is Simulated (for reference only)
The prototype uses in-memory React-like state (via a `DCLogic` class) to fake: cart, orders, vet bookings/video calls, B2B/courier order fulfillment steps, refunds, finance ledgers, and role-based views. In production these must be backed by real persistence, auth, and APIs — treat every "state" field visible in the prototype (order status, checklist ticks, dispatch status, payment-approval flags, etc.) as a hint for the data model, not as something to keep client-only.

## Screens / Views
The single file renders many screens behind a top switcher (Website / Mobile App / Admin Panel) and, within Website, a `webScreen` router. Major areas:

### Public Website
- **Home** — hero banner, category shortcuts (Dog/Cat/Small Pets/Birds/Fish), Hot Sales Banner followed by an admin-driven **"Today's Deals"** row (up to 6 products flagged `todaysDeal`, with Hot Sale badge, struck-through original price and optional countdown), then "Pet Food"/"Fashion Wear" etc. product rails (including B2B-supplied products), promo tiles. Mobile home mirrors the same order and behaviour.
- **Shop** — product grid with brand/category/rating/price filters, keyword search (instant client-side filter) and an AI-assisted "Ask AI" search (natural-language/typo-tolerant matching over the catalog).
- **Product detail** — gallery, price, wishlist, add-to-cart, "Similar Products" (same-category recommendations).
- **Cart → Checkout → Payment receipt upload (QR/Fonepay) → Order placed.**
- **Services / Pets Available / Dog Adoption** (with "Post an adoption notice" form) **/ Web Vet** (booking flow, timeline, waiting room/Join Call button active 15 min before scheduled time, video-call session via Jitsi) **/ Blog** (incl. Dog Breed Archive, Microchipping Archive, Pet Tag Archive pages) **/ Contact**.
- **Pet Tag QR landing page** — public page shown when a physical pet tag QR is scanned; displays the pet + owner details entered in the Pet Tag Archive.
- **Account** (pet owner) — profile with editable address + Google Maps pin, orders (with status + timestamped progress), wishlist, vet bookings, sign in/out.
- Header: logo, top info bar (phone/address/hours), search, "Pet Owner Sign In" vs "Sign In" (staff-facing) — these are two separate identities and must not be conflated; footer quick links + legal pages.

### Vet Consult
- Booking → payment receipt upload → admin approval → doctor reconfirm/finalize → scheduled/backdated reminder → video call (waiting room, join button gated by time) → chat/notes/document upload during and after the call.
- Admin toggle: Vet Consults **Active/Inactive** — when inactive, the public Web Vet section shows an "under construction" state instead of the live booking flow.

### B2B Supplier Portal
- Sign in/out, Add Product (full field set incl. images, price, stock, category, brand), edit/delete listed products, mark out of stock.
- Orders: shows only orders containing this supplier's products; checklist (picked/packed/labelled), "Mark as Sent to CHP", refund workflow (request only via explicit "Send for Refund" action tied to out-of-stock).
- Finance: Total Sale, Total Amount Received, Total Remaining, date-range search, paid/unpaid order list with detail drill-in.
- Profile: like courier profile — phone, alternate phone, address, documents, ID, change password.

### Courier Portal
- Sign in, assigned deliveries with full order/product detail, mark delivered (propagates to Admin/Deliveries), cancellation with reason.
- Profile: registration documents, courier ID, change password, phone/alt phone/address.

### Mobile App (Android + iOS) — `CPH Mobile Screen.dc.html`
A full phone-native build of the platform, shown inside iOS and Android device frames (recreate both; respect each OS's back-navigation and status-bar conventions — the prototype shows an iOS back arrow and an Android hardware-style back). It mirrors the website 1:1 in features while using mobile layouts (bottom tab nav, stacked cards, sheets):
- **Customer app**: Home (hero banner, animal categories, product rails — all wired to the same catalog/admin content as the website), Shop (searchable, wishlist hearts on every product/pet/adoption card), Product detail (image gallery + zoom, add to cart), Cart → checkout → QR receipt upload (sign-in gated, cart survives sign-out), Orders with timestamped tracking, Pets Available (gallery + zoom, book), Adoption (browse + post), Web Vet booking + WhatsApp-style consult (corner video PiP + chat + attachments), Account (Wishlist/Orders/Web Vet/Adoption/Profile — profile merges personal details + primary/alternative addresses; Account requires pet-owner sign-in).
- **Admin app**: bottom-nav admin for staff — Deliveries (Payment Queue/Orders/Dispatch/Delivery/Cancelled with receipt view, checklist, dispatch, alert badges), Vet Consults, Shop/Product (add/edit/delete/out-of-stock), Pet Available (star rating + video upload), Pet Tag & Microchipping archives (QR scan-to-view, downloadable generated QR), Finance (amount collected + due payments/refunds). Access is limited to what Admin grants each staff role.
- **Doctor / Courier / B2B portals**: phone versions of all three web portals, feature-matched — Doctor (Overview/Booking/Upcoming/Availability/Finance/Profile with consult video+chat), Courier (Overview/Deliveries/Delivered/Finance/Profile with docs + change password), B2B (Dashboard/Incoming/Status/Products/Finance/Profile — incoming-order checklist, out-of-stock/refund actions, Mark as Sent to CPH, 7-step tracking, finance with commission breakdown, registration docs). All tabs show live alert badges from shared state.
- **Menus**: top "⋮" menu holds Services/Blog/Careers/FAQ/How to Buy etc. (closes on outside tap); footer/3-dot menu holds Admin login, Terms & Conditions, Privacy Policy, Return & Refund, change password.

### Admin Panel
- **Deliveries**: Payment Queue → Orders → Dispatch → Delivery → Cancelled, each with receipt view, itemized product list + per-supplier id, checklist ticks, dispatch-to-courier, out-of-stock and refund-requested flags, delivered status synced from courier, cancellation + reason.
- **Vet Consults**: payment receipt review/approve, doctor reconfirm/finalize visibility, Active/Inactive toggle.
- **Shop / Product**: add/edit/delete, mark out of stock; home-page category placement.
- **Pending Registrations**: approve doctor/courier/B2B accounts.
- **Pages**: editable Dog Breed Archive, Microchipping Archive, Pet Tag QR page (images, copy, banners) — edits reflect on the live public pages.
- **Finance**: amount collected, due payments (refunds, doctor payouts, B2B payouts) with receipt upload + mark-paid flow.
- **User Roles & Permissions**: Admin/Manager/Staff accounts, email+password login, per-portal access assignment.
- Cancellation button + reason-for-cancellation section (Admin and Courier).

### Mobile App (legacy note)
An earlier "Mobile App" mode also lived inside `CPH Phase1 Prototype.dc.html`. The **authoritative mobile design is now the separate `CPH Mobile Screen.dc.html`** (see the dedicated Mobile App section above) — prefer it.

## Interactions & Behavior
- **Sync first**: see the "Cross-platform sync" section above — treat every visible status/flag/count as shared server state, not client-only.
- Sign-in/out is scoped per identity: Pet Owner sign-in only ever affects the "Pet Owner Sign In" control (next to Account); staff/B2B/courier/doctor sign-in only affects "Sign In" (next to Blog) — the two must never toggle each other.
- Order/booking status changes must always stamp a date+time and surface it wherever that status is shown (all portals).
- Supplier-scoped visibility: a placed order's line items should only appear in the order history of the supplier(s) who actually supplied those specific products; Admin sees everything, tagged with supplier id per product.
- Refund requests are only ever created by an explicit supplier action (Send for Refund, gated on that product being marked out of stock) — never inferred/auto-applied to unrelated products.
- Checklist and dispatch controls are real toggles (not decorative) — ticking the checklist should be reflected in state and gate the next control (e.g. dispatch enables after checklist complete; "Mark as Sent to CHP" label only appears once checklist is complete).
- Web Vet "Join Call"/waiting room button is disabled until 15 minutes before the scheduled slot.

## State Management (data model hints)
- **Orders**: id, items[] (each with supplier id, out-of-stock flag, refund-requested flag), status history with timestamps, payment receipt image, assigned courier, cancellation reason.
- **Vet bookings**: id, pet owner, doctor, date/time, payment receipt, approval state, finalize state, video-room reference, chat/notes/doc uploads.
- **Products**: name, category, brand, price, images, stock flag, supplier id, tags (for search).
- **Users**: role (pet owner / doctor / B2B / courier / admin-staff), profile fields (phone, alt phone, address, map pin, documents, id), auth credentials.
- **Finance ledgers**: per B2B supplier and per doctor — amount due/paid, linked order/booking ids, receipt uploads.

## Design Tokens
- **Colors**: primary blue `#1996C8`, dark text `#1A2027`, secondary text `#5B6773`, muted text `#8A96A3`, border `#E4E9EC`, page background `#EEF2F4`/`#F7F9FA`, success/accent green `#25D366`, error/red `#D64545`, purple accent (AI features) `#7A56C8`.
- **Typography**: headings in Poppins (weight 700), body in Inter; base body ~13–14px, section titles ~19–22px.
- **Radius**: cards/panels 10–16px, buttons/inputs 8–9px, pills 999px.
- **Shadows**: soft, e.g. `0 4px 14px rgba(0,0,0,0.25)` for floating elements, `0 12px 32px rgba(0,0,0,0.22)` for panels.

## Assets
Bundled in `assets/`: `cph-logo.jpeg` (brand logo), `fonepay-qr.png` (payment QR), category/service icons (`icon-desexing.png`, `icon-grooming.png`, `icon-microchipping.png`, `icon-surgery.png`, `icon-vaccinations.png`), role icons (`role-icon-b2b.png`, `role-icon-courier.png`, `role-icon-doctor.png`), social icons (`instagram-logo.svg`, `tiktok-logo.webp`). All other imagery in the prototype is a placeholder drop-zone (`<image-slot>`) — real photography/product images still need to be sourced before production.

## Recent additions since last sync
- **AI-assisted Shop search**: instant client-side keyword filter plus an "Ask AI" natural-language/typo-tolerant search over the catalog.
- **Microchipping Records (Admin)**: new admin page — search, add/edit/delete chip records (chip number, owner info incl. ward/municipality/district/province/zone/map link, pet info, vet declaration). Public Microchipping Archive lookup page now matches against these records.
- **Microchip lookup access gate**: the public Microchip Archive lookup is now restricted to signed-in B2B suppliers, doctors, or admin — signed-out visitors see a "Restricted — Authorized Access Only" screen with sign-in entry points routed through the real credential forms.
- Layout fix on the microchip result page (avatar photo no longer overlaps the banner).

## Files
- `CPH Phase1 Prototype.dc.html` — **website + admin panel** design reference (open in a browser to click through every screen/state).
- `CPH Mobile Screen.dc.html` — **mobile app (Android + iOS)** design reference (renders inside device frames).
- `support.js` — prototype templating runtime (needed to open either .dc.html locally; **not** for production).
- `image-slot.js` — placeholder drop-zone web component used by the prototypes.
- `ios-frame.jsx`, `android-frame.jsx` — device bezels used only to preview the mobile app.
- `assets/` — brand and icon assets referenced by the designs.

## Recommended production shape
- **One backend / API** serving website, mobile apps, and admin (auth, catalog, orders, vet bookings, finance, page content, notifications).
- **Web**: React/Next.js (or team standard). **Mobile**: React Native or Flutter for shared Android + iOS, or fully native if preferred.
- **Realtime** for the sync behaviors and live badge counts (WebSocket/subscriptions or polling).
- Map every prototype "state" field to real DB tables; enforce the supplier-scoping, refund-gating, and per-identity sign-in rules server-side.
