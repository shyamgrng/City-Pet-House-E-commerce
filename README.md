# City Pet House & Animal Clinic (CPH) — Platform

Pet-shop, veterinary telehealth, and pet-adoption platform for Kathmandu,
Nepal: one backend serving a public website, native mobile apps (iOS +
Android), and an admin panel, plus B2B supplier / courier / doctor portals.

## Status

Pre-implementation. The design reference package has been read in full and
an architecture + data model proposal has been written up for approval
before any feature code is written.

- **[docs/ARCHITECTURE_PROPOSAL.md](docs/ARCHITECTURE_PROPOSAL.md)** — proposed stack, data model, API surface, realtime strategy, auth model, and build order.
- **[design/](design/)** — the original design handoff package (interactive HTML prototypes for website+admin and mobile, plus brand assets). These are *design references only*; see `design/README.md` for how to read them. Their prototype-only templating runtime (`support.js` etc.) has no production equivalent and is not to be reused.

## Repo layout (planned)

Once the architecture proposal is approved, this will become a Turborepo
monorepo:

```
apps/
  api/      # NestJS backend
  web/      # Next.js storefront + admin + portals
  mobile/   # Expo React Native app (iOS + Android)
packages/
  shared-types/
  api-client/
  ui-tokens/
```
