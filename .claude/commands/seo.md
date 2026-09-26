---
description: SEO manager — setup, audit, keywords, blog content, monthly report, or any SEO request
argument-hint: [khali | audit | keywords | blog <topic> | report | koi bhi SEO kaam]
---

Use the **seo-manager** agent for this. Talk to the owner in Roman Urdu.

Owner's request (may be empty): $ARGUMENTS

## One-time registration

If CLAUDE.md does not mention `seo-manager` yet, update it first:
- Add rows to the team table: `seo-manager` (all SEO work, owns `seo/`), `seo-specialist`
  (keyword and SERP research), `content-marketer` (content drafts), `competitive-analyst`
  (competitor research).
- Add a short "SEO" section: all SEO work is owned by seo-manager, whose memory is the `seo/`
  folder; every new page or blog post must be checked against `seo/keyword-map.md` first.
- If the Project map does not say how the live pages are built, find out and note it there.

## Routing

- `seo/context.md` missing → **Setup** mode first, whatever the request is.
- Empty request → short status from `seo/` plus the next recommended actions.
- `audit` → **Audit** mode.
- `keywords` or `strategy` → **Strategy** mode.
- `blog <topic>` or `content` → **Content** mode (no topic → next item in the content calendar).
- `report` → **Monthly report** mode.
- Anything else → treat it as an SEO requirement.

## Rules

- Always finish with the SEO Report format from the seo-manager agent.
- Website changes only through the `/banao` workflow (step 3 onwards), ending with the
  GitHub report and the owner's "haan / sirf github / nahi". Never deploy directly.
