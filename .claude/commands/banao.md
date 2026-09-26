---
description: Owner gives a requirement in plain words — build it end to end, test it, report GitHub status, and ask before going live
argument-hint: [apni requirement likhein]
---

Requirement from the owner:

$ARGUMENTS

If the requirement above is empty, reply "Batayein kya banana ya badalna hai?" and stop.

Work through these steps in order. Talk to the owner in Roman Urdu.

## 1. Understand

- Read CLAUDE.md. If its "Project map" section is not filled in yet, explore the project and fill it in first.
- Restate the requirement to the owner in 3–5 short bullets.
- Only if something important cannot be decided from the project itself (real content such as
  prices, contact details, client names, or a real either/or choice), ask all questions in ONE
  message, at most 3. Otherwise make sensible assumptions, list them, and continue.
- If the requirement needs a database, stop and follow the "Database" section of CLAUDE.md.

## 2. Plan

- Write the plan to `docs/plans/<YYYY-MM-DD>-<short-name>.md`: files to change, new files,
  which agent does what, how it will be tested.
- Small change (text, a section, styling): continue straight away.
- Big change (new page type, login, payments, new integration): show the plan summary and wait
  for the owner to say "haan" / "ok".

## 3. Prepare git (github-advisor)

- Ask github-advisor to check the state and prepare a branch `feature/<short-name>` or
  `fix/<short-name>` from `main`.
- If there is no git repo or GitHub repo yet, or GitHub has newer commits, show the advisor's
  🔴 items to the owner and handle them first (with the owner's "haan" where required).
- If there is uncommitted work from before, do not mix it in: ask the owner what to do with it.

## 4. Build

- Delegate to the right agents from the team table in CLAUDE.md; run independent parts in parallel.
- Follow the brand and rules in CLAUDE.md. Reuse existing components and CSS.
- Anything with logic gets tests first (test-driven-development skill).

## 5. Quality gate

- code-reviewer on all changes — fix everything it flags.
- api-security-audit if the change touches forms, user input, uploads or email.
- seo-analyzer for new or changed pages and blog posts.
- performance-engineer if images, video or new scripts were added.

## 6. Verify for real

- Run the build and all tests. Start the local preview.
- With the Playwright MCP, open every changed page at 375px and 1280px: no console errors,
  no broken links or images, forms work, nothing overlaps. Take screenshots.
- Follow the verification-before-completion skill: report real command output, not assumptions.
- If anything fails, use the debugger agent and the systematic-debugging skill, then verify again.

## 7. Report to the owner (Roman Urdu, short)

- github-advisor commits the finished work on the branch (local save point).
- Then send ONE message with:
  1. What was built or changed, in plain words.
  2. How to see it locally (the exact command or URL) plus the screenshots.
  3. Any TODOs or assumptions they should check.
  4. The full **GitHub Report** from github-advisor.
  5. The decision, exactly like this:
     "Aap ka faisla:
      - **haan** = GitHub par save + website live
      - **sirf github** = GitHub par save, abhi live nahi
      - **nahi** = abhi kuch nahi, sirf is computer par save rahega"

## 8. Act on the answer

- **haan** → follow `.claude/commands/deploy.md` (it includes the GitHub steps).
- **sirf github** → github-advisor pushes the branch only; `main` and the live site stay untouched.
- **nahi** → leave everything committed locally and say how to continue later (`/banao` or `/deploy`).
Never deploy or push without that answer in this session.
