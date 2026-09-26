@AGENTS.md

# Haris Bhai Perfumes (perfume-land) — Team Lead Instructions

The owner describes what they want in plain words (usually Roman Urdu). You deliver it
finished, tested and — only after the owner approves — live.
The owner is not a developer: never ask them something you can find out by reading the project.

- Any requirement (with or without `/banao`) → follow `.claude/commands/banao.md`.
- Going live → follow `.claude/commands/deploy.md` (update it for this project's host first).
- Any GitHub question (with or without `/github`) → use the `github-advisor` agent.

Reply in **Roman Urdu** with simple words. Code, comments, commit messages stay in English.

## What this project is

Online perfume shop "Haris Bhai Perfumes — Luxury Perfume Impressions" (site title in `src/app/layout.tsx`).
Next.js 16 (App Router) + React 19 + Tailwind CSS 4 + framer-motion. No backend/database yet:
the catalog is static data in `src/data/products.ts`.

Main pages: home (`/`), collections (`/collections`, `/collections/[handle]`), product
(`/products/[handle]`), search (`/search`), about (`/pages/about`), contact (`/pages/contact`).

Must not break: cart (`src/lib/cart-context.tsx`, `CartDrawer`, `cart-validation.ts`), product/collection
filters and search, contact form, header/announcement-bar height handling (no layout jump),
security headers + CSP in `next.config.ts`.

Pending content: see `PRODUCTS-PENDING.md` (74 product names not yet added).

## Brand

From `src/app/globals.css` (Tailwind tokens):
- Forest (dark green): 950 `#161f1a`, 900 `#233229`, 800 `#2c3530`, 700 `#3b463e`
- Gold: 600 `#ab8657`, 500 `#c29c6d`, 400 `#d6b78d`, 100 `#f1e6d6`
- Cream: 50 `#ffffff` (true white, used as page background), 100 `#f1ece4`, 200 `#e8e1d4`
- Ink (text): `#1c1c1a`
- Fonts: headings **Nunito Sans** (`--font-heading`), body **Montserrat** (`--font-body`), via `next/font/google`.

## Project map

- `src/app/` — routes (App Router). `src/app/api/admin/{products,session}` are empty folders (no routes yet).
- `src/components/` — `layout/`, `home/`, `collection/`, `product/`, `cart/`, `search/`, `shared/`, `ui/`
- `src/data/` — `products.ts`, `brand.ts`, `branches.ts`, `nav.ts`
- `src/lib/` — cart context, cart validation, currency, search, types
- `public/` — `brand/`, `products/`, `previews/`, `videos/`
- `database/` — empty. `output/imagegen/` — generated images.

Commands (npm):
- Install: `npm install`
- Preview locally: `npm run dev` → http://localhost:3000
- Build: `npm run build` (production check: `npm run build && npm start`)
- Lint: `npm run lint`
- Tests: TODO — no test runner or test script is set up yet.

Next.js 16 has breaking changes: read `node_modules/next/dist/docs/` before writing Next code (see `AGENTS.md`).

## Hosting

- Host: **Vercel** (project `perfume-land`, linked in `.vercel/project.json`, git-ignored).
- Domain: TODO — live domain not found in the project.
- GitHub: `https://github.com/AwaisAmin/perfume-land` (remote `origin`), main branch `main`.
- Deploys: TODO — confirm whether Vercel's Git integration auto-deploys pushes to `main`,
  or deploys are done with the Vercel CLI. See `.claude/commands/deploy.md`.

## The team (subagents in `.claude/agents/`)

| Agent | Call it when |
|---|---|
| github-advisor | Start of work (branch), end of every requirement, before and after deploy, any GitHub question |
| frontend-developer | Pages, sections, components, layout, interactions |
| backend-developer | Server code, form handling, integrations |
| fullstack-developer | A complete feature from server to UI in one go |
| backend-architect | New features that need a server side, APIs, integrations |
| typescript-pro | Type problems or shared types |
| seo-manager / seo-analyzer / seo-specialist | SEO work, every new or changed page |
| content-marketer / competitive-analyst | Content and competitor research |
| test-engineer | Tests for anything with logic |
| code-reviewer | After every requirement, before showing it to the owner |
| api-security-audit | Forms, uploads, anything that accepts user input |
| debugger | Any error, broken page or failing build |
| performance-engineer | Heavy pages, large images, slow loading |
| deployment-engineer | Build or deploy problems |
| hostinger-ops | Hostinger tasks (this project is on Vercel — normally not needed) |
| database-architect | Database design |

Run independent tasks in parallel with separate subagents.

## Rules

- Mobile first. Check every change at 375px and 1280px wide.
- Accessibility: semantic HTML, alt text, visible focus, AA contrast, full keyboard use.
- Never invent clients, numbers, testimonials, prices or legal text — ask or leave a `TODO`.
- No secrets in code or commits.
- Never push, pull, merge into `main`, tag or change GitHub settings without the owner's "haan".
