# Dynamic website + CRM (Node.js backend)

Branch: `feature/dynamic-crm` · Status: waiting for owner approval

## Goal
Everything that is hard-coded today (collections, 60 products, prices, images, featured product,
"shop the look", announcement bar, WhatsApp number, branches, brand values, navigation) moves into a
MySQL database, managed from an admin panel (CRM). The website looks exactly the same as now, but
reads its content from the backend, and a change saved in the CRM shows on the site within seconds.

## Decisions (owner)
- Database: MySQL (Hostinger MySQL for live; XAMPP MySQL on this computer for local work).
- Hosting: local only for now. Going live is a later decision.
- Backend lives in its own folder: `backend/`.

## New: `backend/` (Node.js 24, Express, ESM)
- `src/server.js`, `src/app.js` — Express app, helmet, CORS (only the site's origin), rate limits.
- `src/db/` — mysql2 pool, `schema.sql` (migrations), `seed.js` (imports today's exact content).
- Tables: `collections`, `products`, `featured_product`, `featured_variants`, `look_items`,
  `settings` (announcements, WhatsApp, branches, brand values, nav), `admins`, `media`.
- `src/routes/public/*` — read-only JSON for the website (`GET /api/collections`, `/api/products/:handle`, `/api/site`).
- `src/routes/admin/*` — full CRUD (create/read/update/delete) for products, collections, featured
  product, look items, settings; image upload (jpg/png/webp, size-limited, re-checked by file content).
- Auth: admin login with bcrypt-hashed password, httpOnly secure session cookie, login rate limit,
  CSRF protection. First admin created with `npm run create-admin` (no default password in code).
- Validation with zod on every input. After every change the backend tells the website to refresh
  (Next.js on-demand revalidation with a shared secret).
- `admin/` — the CRM UI served at `http://localhost:4000/admin` (brand colours, mobile-friendly):
  dashboard, products (search, filter by collection, add/edit/delete, image upload, stock, price,
  sale price, gender, size), collections, featured product, shop-the-look, site settings.
- Tests: `node:test` + supertest against a separate test database.
- `.env.example` (no real secrets), `README.md` with setup steps in plain words.

## Changes in the website (`src/`)
- `src/lib/api.ts` — typed fetch helpers; the current `src/data/*.ts` files become the seed + a
  fallback so the site never goes blank if the API is down.
- Pages/components that import from `src/data/*` switch to the API: home, collections,
  collection page, product page, search, header/nav, announcement bar, footer, about.
- Cart validation (`cart-validation.ts`) and search keep working with API data.
- `src/app/api/revalidate/route.ts` — secret-protected refresh endpoint.
- `next.config.ts` — allow backend image host in CSP / `images`.

## Team
- database-architect: schema · backend-developer: API + auth + uploads + tests
- frontend-developer: CRM UI + website switch to API · test-engineer: tests
- code-reviewer, api-security-audit (login, uploads, forms), performance-engineer (images).

## Testing
- Backend tests (CRUD, validation, auth, upload rejection).
- `npm run build` + `npm run lint` for the site.
- Playwright at 375px and 1280px: every page looks the same as before; edit a product price in the CRM
  → the product page shows the new price; delete/add product → collection page updates.

## Not included (ask later)
- Orders/checkout, customer accounts, payments. Going live on Hostinger/Vercel.
