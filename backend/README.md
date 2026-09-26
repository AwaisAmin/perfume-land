# Haris Bhai Perfumes — Backend + Admin CRM

A small Node.js/Express backend that stores everything the website shows (collections, products,
the featured product, "shop the look", announcements, WhatsApp number, branches, brand text and
navigation) in MySQL, plus a simple admin panel (CRM) to edit it. The website reads this data
through one public endpoint and refreshes automatically after every change.

## What's here

- `src/app.js` / `src/server.js` — the Express app and its HTTP server.
- `src/db/` — `schema.sql` (the tables), `migrate.js`, `seed.js`, `seed-data.json` (today's real
  content, exported from the website's static files), `create-admin.js`.
- `src/repositories/` — all SQL lives here.
- `src/routes/public.js` — read-only endpoint the website calls.
- `src/routes/admin/` — the CRM's API (login required).
- `src/middleware/`, `src/services/` — auth, validation, image checks, error handling, telling the
  website to refresh.
- `admin/` — the CRM itself: plain HTML/CSS/JS, no build step. Open in a browser at `/admin`.
- `test/` — automated tests (`node:test` + `supertest`) against a separate test database.

## 1. Install

```
npm install
```
(Run from inside the `backend/` folder, or `npm --prefix backend install` from the repo root.)

## 2. Set up your `.env`

Copy the example file and fill in your own secrets:

```
cp .env.example .env
```

Generate the shared secret value:

```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Put the result into `REVALIDATE_SECRET` in `.env` (the website needs the same value).

`TRUST_PROXY` controls Express's `trust proxy` setting (which client IP to believe for rate
limiting, etc.). Leave it as `false` for local development. If you ever put this behind a reverse
proxy/load balancer in production, set it to the number of proxy hops in front of the app (usually
`1`) — never `true` unless you fully control every proxy in front of it.

The rest of the defaults match this project's local setup (XAMPP MySQL/MariaDB at
`127.0.0.1:3306`, user `root`, no password, database `perfume_land`).

## 3. Create the database tables

```
npm run migrate
```

Safe to run again any time — it only creates tables that don't already exist.

## 4. Load the starting content (seed)

```
npm run seed
```

This copies the website's current content (from `src/db/seed-data.json`) into the database. It
only runs on an empty database — if you already have data and want to start over, add `--force`
(this deletes everything in the content tables first):

```
npm run seed -- --force
```

## 5. Create your admin login

There is no default admin account — you must create one:

```
npm run create-admin -- --email you@example.com --password a-strong-password
```

Password must be at least 12 characters. Run it again with the same email to change the password
later.

## 6. Run it

```
npm run dev
```

- Backend API: `http://localhost:4000`
- Admin CRM: `http://localhost:4000/admin` — log in with the email/password from step 5.
- Public site data: `http://localhost:4000/api/public/site`

`npm start` runs the same thing without file-watching (use this in production).

## 7. Run the tests

Tests use a separate database (`perfume_land_test` by default, configured in `.env.test` if
present, otherwise falls back to `.env` with `NODE_ENV=test`). They wipe and reseed that database
each run, so never point them at your real data.

```
npm test
```

## How this connects to the website

- The Next.js site calls `GET /api/public/site` to get all its content. If this backend is down,
  the site falls back to its own bundled static data, so it never goes blank.
- Every time something is saved in the CRM, this backend:
  1. Updates the database.
  2. Bumps a stored `updatedAt` timestamp.
  3. Calls `POST {SITE_URL}/api/revalidate` with the shared `REVALIDATE_SECRET` so the website
     refreshes its cached content within seconds. If that call fails (e.g. the site is down), the
     failure is only logged — the admin's save still succeeds.
- Images: existing site images (e.g. `/products/...`) are left as-is (served by Next.js). Images
  uploaded through the CRM are stored in `backend/uploads/` and returned to the website as full
  URLs (`PUBLIC_BASE_URL/uploads/...`) so they work regardless of where the site is hosted.

## Security notes

- Sessions are httpOnly, `SameSite=Strict` cookies (also `Secure` when `NODE_ENV=production`).
- All state-changing admin requests (POST/PUT/DELETE, including login and logout) require the
  `X-Requested-With: perfume-land-admin` header as a CSRF defence — the CRM's own JS sends this
  automatically.
- Login is rate-limited both per IP and per email (10 attempts / 15 minutes each) and always
  returns a generic "Invalid email or password" message, whether the email exists or not. Expired
  sessions for an account are cleared out on every login, and a background sweep clears expired
  sessions for everyone every hour.
- Image and link fields (product/collection/look images, nav links, branch map links) are
  restricted to known-safe patterns (existing site paths, this backend's own `/uploads/...` files,
  site-relative nav links, and `https://` Google Maps links) — arbitrary URLs are rejected.
- Uploaded images/videos are checked by their actual file content (magic bytes), not just their
  claimed type or file extension: images (jpg/png/webp) are capped at 5MB, videos (mp4/webm,
  used for the homepage hero) at 30MB.
- Every product has one or more purchasable variants (type × size, e.g. "EDT · 50ml" or a
  type-less "35ml"); the product's own price/compare-at-price/size/in-stock always mirror its
  first variant. Editing variants goes through `PUT /api/admin/products/:id/variants`, which keeps
  each variant's id stable when it's included in the new list, adds rows without one, and removes
  rows that are missing.
- Every other storefront text/media item (hero video, marquee text, footer, about/contact page
  copy, checkout labels, etc.) lives in the `content` settings key, validated against a schema
  that mirrors `src/lib/types.ts`'s `SiteContent`, and is edited from the CRM's "Site content"
  screen.
- In production, the app refuses to start if `REVALIDATE_SECRET` is left at its placeholder value,
  or if `CORS_ORIGIN` isn't `https://`.

## Troubleshooting

- **"Invalid environment configuration" on startup** — check `.env` against `.env.example`; a
  required value is probably missing or too short.
- **Migration/seed can't connect** — make sure MySQL/MariaDB (XAMPP) is running on
  `127.0.0.1:3306` and the database named in `DB_NAME` exists.
- **Website not updating after a CRM save** — check the backend's console output for "Revalidate
  call failed" — it means the website's `SITE_URL`/`REVALIDATE_SECRET` don't match, or the site
  isn't running.
