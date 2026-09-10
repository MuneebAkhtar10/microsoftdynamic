# Dynamics 365 Integration Demo

A standalone demo of bidirectional sync between a portal and Microsoft Dynamics 365
Finance & Operations, over its OData API.

```bash
npm install
npm run dev
```

Open http://localhost:3000 — it runs immediately against a built-in mock F&O
environment, no credentials required.

## What it shows

- **F&O → Portal**: the dashboard pulls customers, sales orders and general ledger
  balances live from `src/lib/dynamics/client.ts`.
- **Portal → F&O**: "orders" on our side (`src/lib/portal/mock.ts`) can be pushed to
  become a Customer + Sales Order in F&O.
- **Scheduled sync**: `GET /api/dynamics/sync` pushes every unsynced order and pulls
  fresh stats — point a cron job (Vercel Cron, GitHub Actions, anything) at it.

## Going from mock to a real F&O sandbox

Copy `env.example` to `.env.local` and fill in:

```
DYNAMICS_TENANT_ID=
DYNAMICS_CLIENT_ID=
DYNAMICS_CLIENT_SECRET=
DYNAMICS_RESOURCE_URL=https://<org>.operations.dynamics.com
```

These come from an Azure AD app registration in the client's tenant, granted API
access to the F&O resource and admin-consented. `src/lib/dynamics/client.ts` switches
to `real.ts` (a working OAuth2 client-credentials + OData implementation) the moment
all four are set — nothing else in the app changes.

## Swapping the mock portal for the client's real one

`src/lib/portal/mock.ts` is a stand-in for whatever the client's actual system is.
Once that's known (a database, a REST API, another SaaS), replace `listOrders`,
`listUnsyncedOrders` and `markSynced` with real calls — `src/lib/dynamics/sync.ts`
doesn't need to change.

## Layout

| Path | Purpose |
| --- | --- |
| `src/lib/dynamics/types.ts` | Shapes matching real F&O OData entities |
| `src/lib/dynamics/mock.ts` | In-memory simulated F&O environment |
| `src/lib/dynamics/real.ts` | Live OAuth2 + OData client |
| `src/lib/dynamics/client.ts` | Picks mock vs. real from env vars |
| `src/lib/dynamics/sync.ts` | Pull stats, push an order, run a full sync |
| `src/lib/portal/mock.ts` | Stand-in for the client's own portal data |
| `src/app/page.tsx` | Dashboard: F&O stats + orders waiting to push |
| `src/app/api/dynamics/*` | `stats` (pull), `push` (one order), `sync` (scheduled) |
