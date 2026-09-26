# Variants, WhatsApp checkout, full-site CMS

Branch: `feature/dynamic-crm` (continues the dynamic CRM work). Owner approved scope on 2026-09-27.

## Owner decisions
- Product variants: type ∈ {EDT, EDP, Perfume} × size ∈ {35ml, 50ml, 100ml}. **35ml has no type.**
  Every combination has its own price (+ optional compare-at price, in-stock flag).
- Existing 60 products start with one variant "Perfume 50ml" at today's price/compare price.
  The featured product (Musk Ul Hind) keeps today's 50ml / 100ml prices as two Perfume variants.
- Checkout → short form (name, phone, city, address, optional note) → opens WhatsApp to the shop's
  number (from CRM) with the full order (items, type, size, qty, line totals, subtotal, delivery note).
- Everything on the site comes from the CRM: hero video + poster + texts, marquee texts, section
  headings, trust badges, about-home intro, About page, Contact page, contact-form/newsletter texts,
  footer texts + social links, media grid, SEO title/description, announcements, WhatsApp, branches.
- Speed must stay as today (static pages, no layout blink).

## Data contract additions (public `GET /api/public/site`)
- `product.variants: { id: string; type: "EDT"|"EDP"|"Perfume"|null; size: "35ml"|"50ml"|"100ml";
   price: number; compareAtPrice?: number; inStock: boolean }[]` (ordered; ≥1).
  `product.price / compareAtPrice / size / inStock` stay = the first (default) variant, so every
  existing listing renders unchanged.
- `featuredProduct.variants` derived from the featured product's variants.
- `content: SiteContent` — every hard-coded storefront text/media, shape defined by
  `src/data/content.ts` (the fallback) and mirrored by a zod schema in the backend.
- `contact.orderWhatsappNumber` (defaults to `whatsappNumber`).

## Work split
1. frontend-developer: extract all hard-coded storefront text/media into `src/data/content.ts`
   (exact current values) + wire components to `content`; product page variant picker (35ml hides
   type); cart keyed by product+variant; `restoreCart` validates variant prices; WhatsApp checkout form.
2. backend-developer: `product_variants` table + migration from existing rows, variant CRUD in CRM
   product form (collection dropdown lists every collection), 35ml/type rule enforced server-side,
   `content` settings with strict schema + CRM "Site content" editor (grouped by page), hero video
   upload (mp4/webm, magic bytes, size cap), order WhatsApp number setting.
3. performance-engineer: Lighthouse before/after on home + product page (mobile).
4. code-reviewer + api-security-audit on the result; fix everything.
5. Full regression (me): tests, lint, build, baseline diff for unchanged pages, Playwright at
   375/1280 through every page and every CRM screen with test data (create/edit/delete product,
   variants, content edits, video change, checkout → WhatsApp URL), then restore data.
