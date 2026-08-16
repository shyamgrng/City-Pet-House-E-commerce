# City Pet House (CPH) — Production Architecture Proposal

Status: **draft for approval** — no feature code has been written yet. This
covers the stack, data model, API surface, realtime strategy, auth model, and
repo layout for the whole platform (web, mobile, one backend), derived from a
full read of `README.md` and the `DCLogic` state object in both `.dc.html`
prototypes (the shared `localStorage['cph-admin-data']` blob is the de-facto
spec for every entity below).

---

## 1. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Web | **Next.js 14 (App Router) + TypeScript** | SSR for SEO on public storefront/blog/pet-tag pages, one framework for storefront + admin + all four portals. |
| Mobile | **React Native (Expo, bare workflow) + TypeScript** | One codebase for iOS + Android as the brief prefers; shares types/API client/business logic with web via a `packages/shared` package. |
| API | **Node.js + TypeScript, NestJS** | Modular structure maps 1:1 to the domains below (catalog, orders, vet, finance, admin); built-in DI makes per-surface auth guards and role scoping explicit and testable. |
| DB | **PostgreSQL** | Relational integrity for orders/line-items/finance ledgers/refunds matters more here than schema flexibility; JSONB columns for the few genuinely free-form bits (page-editor content blocks, checklist arrays). |
| ORM | **Prisma** | Schema-as-code, migrations, generates types shared by the NestJS API. |
| Realtime | **WebSocket via Socket.IO**, namespaced per user/role, falling back to 15s polling if a socket can't connect (some corporate/mobile networks block WS) | Badge counts and status changes need to be sub-second, not "refresh the page." |
| File storage | **S3-compatible object storage** (AWS S3 or DigitalOcean Spaces) behind signed URLs | Receipts, product/pet photos, doctor documents, registration docs, vet-session file shares. |
| Video calling | **Agora RTC**, token minted server-side per the pattern the prototype's notes describe | Matches the brief's explicit ask. |
| Push notifications | **Firebase Cloud Messaging** (Android + iOS via APNs through FCM) | Standard for Expo/RN. |
| Auth | **JWT access + refresh tokens, per-surface sessions**, argon2 password hashing | Satisfies "only the login session is per-device" — everything else is shared server state. |
| Hosting | API + Postgres on a single managed VPS/App Platform to start (e.g. Fly.io / Railway / DO App Platform); web on Vercel or same host | Flag: **your call** — see open questions. |

**Monorepo**, managed with **Turborepo + pnpm workspaces**:

```
cph/
  apps/
    api/            # NestJS backend
    web/             # Next.js storefront + admin + portals
    mobile/          # Expo React Native app
  packages/
    shared-types/    # Zod schemas + TS types generated from Prisma, shared by all three apps
    api-client/       # typed fetch/socket client used by web + mobile
    ui-tokens/        # design tokens from the README (#1996C8 etc.), Tailwind config shared by web
  docs/
    architecture-proposal.md  (this file)
```

---

## 2. Data model

Every field below is traced to a concrete field in the prototype's shared
state (`clientAccountsList`, `adminOrdersData`, `vetBookings`, `b2bAccounts`,
`courierSuppliersList`, `doctorAccounts`, `petsData`, `petTagsData`,
`microchipRecordsData`, `newProducts`, `usersData`/`rolePerms`, etc.) so
nothing here is invented.

### Identity & roles
- **`User`** — one polymorphic account table: `id, email, phone, passwordHash, role (PET_OWNER | DOCTOR | B2B_SUPPLIER | COURIER | ADMIN_STAFF), status (active/pending_verification/suspended), createdAt`.
  - The prototype keeps "Pet Owner Sign In" and staff/portal "Sign In" as two separate identities that must never conflate (README §Interactions) — enforced by role, and by **separate JWT audiences** per surface so a pet-owner token is never accepted on a portal endpoint and vice versa.
- **`PetOwnerProfile`** (1:1 User) — name, email, phone, `Address[]` (label, address, phone, altPhone, mapLink, `isPrimary`).
- **`DoctorProfile`** (1:1 User) — qualification, NVC/license no., emergency contact, bank details, consult fee, commission type/value, verification docs, `status` (pending_verification/active), `isOnline`, unavailable days/closed slots.
- **`B2BSupplierProfile`** (1:1 User) — company name, contact person, phone/altPhone, address, categories, commission %, registration docs, verification status, `amountOwed`.
- **`CourierProfile`** (1:1 User) — company/contact name, phone/altPhone, address, registration docs, courier ID, verification status.
- **`AdminStaffProfile`** (1:1 User) — `role` (Admin/Manager/Staff, extensible), `RolePermission[]` per-section booleans (dashboard/deliveries/vetconsults/shop/finance/users) exactly matching `rolePerms` in the prototype.

### Catalog & inventory
- **`Product`** — name, description, category, brand, sku, price (integer, paisa or whole-rupee — see §5 Money), costPrice, qty, lowStockThreshold, size/color, tags[], images[], `supplierId` (nullable → CPH-owned stock vs B2B), `commissionPct` (B2B only), `outOfStock`, `status` (active/hidden), deal fields (todaysDeal, dealStart/End, badge), `homeCategoryPlacement`.
- **`PetListing`** (puppies/kittens/small pets/birds/fish for sale) — breed, species, sex, age, price, deliveryFee, photos[], videos[], tags[], status (available/reserved/sold), star rating.
- **`AdoptionPost`** — name, breed, age, sex, vaccinationStatus, address, description, contact, postedAt, `postedBy` (User), status (active/expired — 15-day window per prototype), photos[].

### Orders (the sync backbone)
- **`Order`** — id (see §5 for uniqueness), `buyerId`, deliveryAddress snapshot, amount (derived from items, not stored as display string), paymentMethod (Fonepay/Bank Transfer/QR), paymentReceiptUrl, `paymentStatus` (pending_review/approved/rejected), `stage` (payment_queue → confirmed → dispatch → out_for_delivery → delivered → cancelled), `courierId` (nullable), cancellationReason, `statusHistory: OrderStatusEvent[]` (status, actor, timestamp — every transition, not just current state).
- **`OrderItem`** — orderId, productId (nullable if a custom/pet line), nameSnapshot, priceSnapshot, qty, `supplierId` (denormalized at order time so supplier-scoping survives future product edits), `outOfStock` flag, `refundRequested` flag, `sentToCph` flag.
- **`OrderChecklistItem`** — orderId, label, checked, checkedAt, checkedBy — real toggles, not decorative, and gate `dispatch`/"Mark as Sent to CPH" per README.
- **`Refund`** — orderItemId, requestedBy (B2B), reason, amount, status (requested/approved/paid), createdAt. Only ever created by an explicit B2B "Send for Refund" action gated on that item being out-of-stock — never inferred.
- **`Cart`** / **`CartItem`** — server-side, keyed by userId, survives sign-out per the mobile spec ("cart survives sign-out") by keying an anonymous cart to a device/session id that merges into the user's cart on sign-in.
- **`Wishlist`** — userId, productId | petListingId.

### Vet consult
- **`VetBooking`** — id, ownerId, petName/species/age (or `petId` if we formalize a Pet entity — see open question), doctorId, isOnline, scheduledAt, reason, amount, paymentReceiptUrl, `paymentApprovedAt`, `doctorReconfirmedAt`, status (pending_payment/payment_approved/confirmed/completed/cancelled), roomChannel (`booking_{id}` per the Agora note), callStartedAt/callEndedAt/durationSec, invoiceNumber.
- **`VetChatMessage`** — bookingId, from (client/doctor), text, attachmentUrl, sentAt. Persisted per booking so history "continues in the next session for the same pet" as the brief requires — modeled as one thread per **(owner, pet, doctor)**, not reset per booking.
- **`VetDocument`** — bookingId, uploadedBy, fileUrl, name, uploadedAt.
- **`VetConsultNote`** — bookingId, doctorId, text, createdAt (the `noteHistory` array in the prototype).
- **`WebVetSetting`** — singleton, `active: boolean` (admin on/off switch).

### B2B / Courier fulfillment
- **`B2BIncomingOrder`** view = `OrderItem`s where `supplierId = me`, joined to parent `Order` — not a separate table, just scoped queries, so it never drifts from the single order source of truth.
- **`B2BFinanceLedgerEntry`** — supplierId, orderItemId, saleAmount, commissionPct, payableAmount, paidStatus, paidAt, receiptUrl.
- **`DoctorPayoutSlip`** — doctorId, bookingIds[], amount, slipNumber, paidAt.
- **`CourierAssignment`** — orderId, courierId, assignedAt, receivedAt, deliveredAt, cancelledAt, cancellationReason.

### Registries
- **`PetTag`** — tagId (QR payload), petName, sex, age, breed, color, ownerId (or snapshot name/phone/altPhone/address for non-account owners), microchipNumber, photo, scanCount. Public GET by tagId powers the QR-scan landing page.
- **`MicrochipRecord`** — chipNumber, pet fields, owner fields incl. ward/municipality/houseNo/district/province/zone/mapLink, vetName, clinic, date, photo. Lookup restricted server-side to signed-in `DOCTOR | B2B_SUPPLIER | ADMIN_STAFF` (401/redirect for everyone else, matching the "Restricted — Authorized Access Only" screen).

### Content / CMS
- **`PageContent`** — key (home-hero, about, terms, privacy, refund-policy, faq, dog-breed-archive, microchip-archive-page, pet-tag-archive-page, careers…), JSONB body, updatedAt, updatedBy. Powers every admin "Pages" editor and renders live on the public site — this is the one place JSONB is the right call, since the shape genuinely varies per page and the prototype already treats it as free-form blocks.
- **`Testimonial`**, **`Brand`**, **`ShopCategory`**, **`FaqEntry`**, **`BlogPost`**, **`HowToBuyStep`** — straightforward tables, admin-CRUD, publicly readable.

### Notifications
- **`Notification`** — userId, type, title, body, readAt, createdAt, linkRef.
- **`NotificationTemplate`**, **`NotificationCampaign`**, **`NotificationAutomation`**, **`NotificationLog`** — matches the admin Notifications section (`notifTemplatesList`, `notifCampaignsList`, `notifAutomationsList`, `notifLogsList`).
- **Alert badge counts are never stored** — always computed on read (or pushed via socket event) from a live query, e.g. doctor Booking badge = `count(VetBooking where doctorId=me and status='payment_approved' and not doctorReconfirmed)`. This is what makes "approving a payment raises the doctor's badge" true by construction instead of needing a manual recompute step.

### Open modeling question
The prototype books vet consults by typing `petName`/`species`/`age` inline
per booking rather than a first-class `Pet` entity, yet the brief requires
chat/notes to "continue in the next session **for the same pet**." I'm
proposing an actual `Pet` entity (name, species, breed, age, ownerId) that
`VetBooking` and `PetTag` both reference, so continuity across bookings is a
real foreign key instead of a name-string match. Flagging this because it's
a deliberate deviation from the prototype's literal fields — confirm you're
fine with it.

---

## 3. API surface (by domain, REST + one WS namespace)

All routes under `/api/v1`. Every list/detail endpoint enforces scoping in
the service layer, not just the controller, so a leaked/forged ID can't leak
cross-tenant data.

- **Auth**: `POST /auth/{owner|staff|doctor|b2b|courier}/register|login|refresh|logout`, `POST /auth/*/forgot-password`. Separate audiences per the "two identities" rule.
- **Catalog**: `GET /products`, `GET /products/:id`, `POST/PUT/DELETE /admin/products` (admin + B2B, scoped to own supplierId for B2B), `GET /pets`, admin CRUD, `GET /adoption-posts`, `POST /adoption-posts` (signed-in owner).
- **Cart/Checkout**: `GET/POST/PATCH /cart`, `POST /orders` (creates order + items from cart, requires sign-in, requires receipt upload), `GET /orders/mine`, `GET /orders/:id`.
- **Admin deliveries**: `GET /admin/orders?stage=`, `POST /admin/orders/:id/approve-payment|reject-payment|dispatch|cancel`, `PATCH /admin/orders/:id/checklist`.
- **Courier**: `GET /courier/assignments`, `POST /courier/assignments/:id/receive|deliver|cancel`.
- **B2B**: `GET /b2b/incoming-orders`, `POST /b2b/order-items/:id/out-of-stock|send-refund|mark-sent`, `GET /b2b/finance`.
- **Vet**: `POST /vet/bookings`, `POST /vet/bookings/:id/approve-payment` (admin), `POST /vet/bookings/:id/reconfirm` (doctor), `POST /vet/bookings/:id/agora-token` (see §6), `GET/POST /vet/bookings/:id/chat`, `POST /vet/bookings/:id/documents`, `GET/PUT /admin/web-vet-setting`.
- **Finance**: `GET /admin/finance/overview|payables`, `POST /admin/finance/payables/:id/mark-paid`.
- **Registries**: `GET /pet-tags/:tagId` (public), admin CRUD; `GET /microchips?query=` (auth-gated), admin CRUD.
- **Users/roles**: `GET/POST/PUT /admin/users`, `GET/PUT /admin/role-permissions`.
- **Pages/CMS**: `GET /pages/:key` (public), `PUT /admin/pages/:key`.
- **Notifications**: `GET /notifications`, `POST /notifications/:id/read`, admin campaign CRUD.
- **WS namespace `/realtime`**: client joins room `user:{id}` and, for staff, `role:{role}`; server emits `order.updated`, `booking.updated`, `badge.updated`, `b2b.incoming.updated`, `notification.new`. Mobile falls back to polling `GET /sync/since?cursor=` every 15s if the socket can't connect.

---

## 4. Auth & session model

- Per-surface JWT audiences (`owner`, `admin`, `doctor`, `b2b`, `courier`) — a token minted for one can never authenticate against another surface's guard, even if the underlying user row is somehow shared (it won't be: these are separate account types per role).
- Access token 15 min, refresh token 30 days, refresh rotated on use, stored httpOnly-cookie on web / SecureStore on mobile.
- **Sign-in gating with intent preservation**: checkout/booking/purchase attempts while signed out are captured client-side (cart + form state kept in local state / persisted draft), redirected to sign-in, and replayed automatically on success — no lost receipt uploads or filled forms, per the brief.
- Admin RBAC: middleware checks `RolePermission[section]` per request; mobile admin app calls the same `/admin/users/me/permissions` endpoint so it only renders tabs it's granted — no separate mobile-only permission table.

---

## 5. Business rules enforced server-side

- **Money**: all amounts stored as `integer` (whole NPR, no paisa observed in the prototype) in the DB; `Rs. 1,300` is a formatter applied at the API/UI edge only, never parsed back from a display string. A shared `formatNPR()`/`parseNPR()` pair lives in `packages/shared-types` so web, mobile, and API format identically.
- **Delivery fee** = 0 when cart is empty (computed, not stored per-cart).
- **B2B payout** = `saleAmount - round(saleAmount * commissionPct/100)`, computed server-side at fulfillment time and snapshotted onto the ledger entry (so a later commission-rate change doesn't retroactively rewrite paid history).
- **Order ID uniqueness**: DB-level unique constraint plus a dedicated sequence/generator (`ORD-{year}{monotonic}`), not the prototype's ad hoc counter — this directly targets the "real bug" the brief calls out.
- **Refund/out-of-stock**: reversible (status enum, not a deletion), and "Mark as Sent to CPH" is only enabled once all `OrderChecklistItem`s for that supplier's items are checked — enforced in the service layer, not just disabled in the UI.
- **Web Vet toggle**: `WebVetSetting.active = false` makes `POST /vet/bookings` return 423 and the public site render the "under construction" state — one flag, checked server-side so it can't be bypassed by hitting the API directly.

---

## 6. Video calling (Agora)

Token endpoint: `POST /vet/bookings/:id/agora-token`
1. Verify requester is the `doctorId` or `ownerId` on that booking.
2. Verify `paymentStatus = approved`.
3. Verify `now >= scheduledAt - 15min` (matches the Join Call gating rule).
4. Mint an Agora RTC token scoped to channel `booking_{id}`, short TTL (e.g. 1hr), return it.

Call metadata (join/leave times, duration, recording flag if enabled) is written back via a `POST /vet/bookings/:id/call-events` the client fires on join/leave, so admin gets a full archived log without trusting the client's own timer.

---

## 7. Realtime propagation — concrete example

Payment approval end-to-end, to make the "sync is the core of the product"
requirement concrete:

1. Admin calls `POST /admin/orders/:id/approve-payment`.
2. API transaction: update `Order.paymentStatus`, append `OrderStatusEvent`, recompute affected badge counts.
3. API emits on the `/realtime` namespace: `order.updated` to `user:{buyerId}` (owner's app/web both connected get it), `order.updated` to `role:courier` if now dispatch-eligible, `badge.updated` to any doctor/B2B room whose badge count just changed.
4. Web and mobile clients holding a live socket patch their local query cache immediately (React Query + socket-driven invalidation); clients on the 15s poll fallback pick it up on the next tick.

---

## 8. Build order (matches the brief's requested sequence)

1. Monorepo scaffold, Prisma schema, NestJS auth module (all 5 audiences), Next.js + Expo skeletons wired to a shared API client.
2. Catalog (products, pets, adoption posts) + storefront browse/search + admin catalog CRUD.
3. Cart → checkout → order creation → Admin Deliveries (payment queue → dispatch → delivery) + realtime sync — this is the backbone; every later domain reuses its patterns (scoping, status history, badges).
4. B2B, courier, doctor portals against the order/booking backbone.
5. Vet consult booking + Agora video/chat/file-share + archive.
6. Admin page editors, finance, pet-tag/microchip archives.
7. Mobile app screens against the now-stable API (customer app, admin app, three portals).

---

## 9. Things I think are ambiguous or wrong in the prototype (flagging, not guessing)

1. **Vet booking has no `Pet` entity** (§2 open question) — proposing to add one for cross-session continuity; needs your sign-off since it's a genuine schema addition beyond what's in the prototype.
2. **Order ID generation is a known bug per your brief** — I'm replacing the prototype's counter with a DB sequence + unique constraint; flagging in case you had a specific ID format in mind (current prototype uses `ORD-1044` style four-digit sequential — happy to keep that shape, just backed by a real sequence).
3. **`clientAccountsList` (admin's view of pet owners) duplicates fields already on the account itself** (name/email/phone/joined/orders count) — treating this as a computed admin view over `User`+`Order`, not a separate stored table, unless you know of a reason it needs to diverge.
4. **Microchip lookup gating**: prototype gates the *lookup* to signed-in Doctor/B2B/Admin but the *pet tag* QR landing page is fully public — confirming that split (microchip = sensitive, pet tag = intentionally public-by-design for lost-pet reunification) is correct and not just an oversight.
5. **"Doctor reconfirm" step**: the prototype has both `paymentApprovedAt` (admin) and an implied doctor reconfirm/finalize action but I didn't find a distinct timestamp field for it in the state dump — I'll add `doctorReconfirmedAt` explicitly; flagging in case the intended semantics differ from "doctor clicks confirm after admin approves payment."

## 10. Known gaps — confirming per your instructions, not inventing

- **Images/photography**: every product/pet/brand image is a placeholder `<image-slot>` in both prototypes. I'll build the upload pipeline (S3 + signed URLs + admin image manager) so real photography can be dropped in at any time, but I won't fabricate stock photography.
- **Mobile admin — Career/Users/Settings**: not in the mobile prototype; I'll port the website admin's versions of these three screens to the mobile admin app as instructed.
- **Payment gateway**: staying with manual QR + receipt upload + admin review, as built. Not integrating eSewa/Khalti/etc. unless you say so.

---

## 11. Decisions I'd like from you before I start feature code

See the accompanying question — mobile framework confirmation, hosting/infra preference, and whether the `Pet` entity addition (item 9.1 above) is approved — plus anything else you want to change in this doc.
