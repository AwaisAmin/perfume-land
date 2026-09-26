# Contract: backend ⇄ website (dynamic CRM)

Both sides MUST follow this. Seed/source of truth for today's content:
`backend/src/db/seed-data.json` (exported from `src/data/*.ts`, 10 collections / 60 products).

## Local setup
- MySQL: XAMPP MariaDB 10.4 at `127.0.0.1:3306`, user `root`, empty password (local only).
  Databases: `perfume_land` (dev), `perfume_land_test` (tests). Both already exist.
- Backend: `http://localhost:4000`. Website: `http://localhost:3000`.

## Public endpoint (website reads this)
`GET /api/public/site` → `200 application/json`, `Cache-Control: no-store`. Shape = exactly the
seed file's shape (same keys, same field names as `src/lib/types.ts`):

```ts
{
  collections: Collection[];          // ordered by sort_order; each with products[] ordered by sort_order
  featuredProduct: FeaturedProductData;
  shopTheLookGroups: ShopTheLookGroup[];   // { image, items: { handle,title,price,image,top,left }[] }
  beforeAfterImages: { him: string; her: string };
  bottleImage: string;
  brand: { journeyImage: string; brandValues: {title,body}[]; brandCraft: {title,body}[] };
  contact: { whatsappNumber: string; branches: { name, address, mapUrl? }[] };
  nav: { brandImpressionsGroups: {title, links:{label,href}[]}[]; primaryNavStart: {label,href}[]; primaryNavEnd: {label,href}[] };
  announcements: string[];
  freeShippingThreshold: number;
  updatedAt: string;                  // ISO time of last CRM change
}
```
Rules:
- Optional fields that are empty are OMITTED (not `null`), matching the seed JSON exactly, so the
  seeded API response deep-equals `seed-data.json` (except `updatedAt`). A backend test asserts this.
- Product `id` is a string (`"product-<n>"`), stable across edits. `handle` is unique across all products
  and never changes silently (URLs depend on it).
- Hidden products (`inStock` false) are still returned (site already handles out-of-stock).
- Image paths: existing ones stay site-relative (`/products/...`, `/brand/...`, served by Next from
  `public/`). Images uploaded through the CRM are returned as ABSOLUTE URLs
  `${PUBLIC_BASE_URL}/uploads/<random>.webp|jpg|png` (backend serves `/uploads`).
- Also `GET /api/public/health` → `{ ok: true }`.

## Refreshing the website after a CRM change
After every successful admin write, backend calls (fire-and-forget, logged on failure):
`POST ${SITE_URL}/api/revalidate` with header `x-revalidate-secret: ${REVALIDATE_SECRET}`.
Website route checks the secret (constant-time compare) and invalidates the `site` cache tag
(read Next 16 docs in `node_modules/next/dist/docs/` for the correct `revalidateTag` signature),
returns `{ revalidated: true }`, else 401.

## Env vars
Backend `backend/.env`: `PORT=4000`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`,
`PUBLIC_BASE_URL=http://localhost:4000`, `SITE_URL=http://localhost:3000`,
`CORS_ORIGIN=http://localhost:3000`, `SESSION_SECRET`, `REVALIDATE_SECRET`, `NODE_ENV`.
Website `.env.local` additions: `API_URL=http://localhost:4000`, `REVALIDATE_SECRET` (same value),
`NEXT_PUBLIC_API_ORIGIN=http://localhost:4000` (for CSP/img allow-list).

## Website fallback
If the API is unreachable or returns invalid data at build/render time, the website uses the
bundled static data in `src/data/*.ts` (unchanged), so it never renders empty or crashes.
