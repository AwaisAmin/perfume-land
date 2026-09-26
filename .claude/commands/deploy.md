---
description: Put the current, verified version of the website live on Vercel and save it on GitHub (only after the owner says yes)
---

> TODO: confirm how this project deploys — (A) Vercel Git integration auto-deploys pushes to `main`,
> or (B) Vercel CLI (`vercel --prod`). The live domain is also still a TODO in CLAUDE.md → Hosting.

Deploy the project to its live domain (see CLAUDE.md → Hosting). Talk to the owner in Roman Urdu.
Stop and report if any step fails — do not improvise with other hosting or GitHub actions.

The project is on **Vercel** (project `perfume-land`, linked in `.vercel/project.json`).

## 0. Permission check

- Only continue if the owner said "haan" (or clearly asked to deploy) in this session.
  Otherwise ask: "Kya main GitHub par save karke live kar doon? (haan / nahi)" and stop.
- That "haan" covers: merging the finished branch into `main`, pushing `main`, the deploy itself,
  and pushing the release tag. Nothing else.

## 1. Pre-flight

- github-advisor check: no 🔴 items left (everything committed, no secrets, no files over 100 MB,
  local `main` not behind GitHub). If there are 🔴 items, show them and stop.
- Run `npm run lint` and `npm run build` again; they must pass right now.
- Environment variables live in the Vercel dashboard, never in the repo. If the change needs a new
  variable, ask the owner to add it in Vercel (Project → Settings → Environment Variables) first.
- Choose the mode:
  - **Mode A — Git integration** (Vercel project connected to the GitHub repo): step 2A.
  - **Mode B — Vercel CLI** (no Git integration): step 2B. Check `npx vercel whoami` works first;
    if not logged in, ask the owner to run `npx vercel login` themselves.

## 2A. Git integration mode

- Merge the feature/fix branch into `main` and push `main` (no force push, ever).
  This push starts the production deployment on Vercel.
- Follow it with `npx vercel ls perfume-land` (or `npx vercel inspect <url>`) until the newest
  production deployment is `Ready` or `Error`.

## 2B. Vercel CLI mode

- Merge the branch into `main` and push `main` (no force push). If there is no GitHub repo access,
  skip the push and mention it in the final report as a 🔴 item.
- Run `npx vercel --prod` from the project root and wait for the result.

## 3. If the deployment fails

- Read the build logs (`npx vercel inspect <url> --logs`), explain the cause to the owner in simple
  words, fix it locally on a `fix/` branch, verify again, and retry at most 2 times.

## 4. Check the live site

- Open the home page and every changed page on the live domain (Playwright MCP or curl):
  HTTP 200, the new content is visible, no console errors, key features (cart, search, contact form,
  menus) still work.

## 5. Finish on GitHub and report

- Tag the deployed commit on `main` as `release-<YYYYMMDD-HHMM>` and push the tag.
- Delete the merged feature/fix branch locally and on GitHub.
- Tell the owner in Roman Urdu: live, which pages changed, the links to check,
  followed by a short **GitHub Report** from github-advisor.

## Rollback (only if the live site is broken)

- Tell the owner what broke first.
- Fastest: `npx vercel rollback` to the previous production deployment (or "Instant Rollback" in the
  Vercel dashboard).
- Then fix the code: `git revert` the release commit on `main` and push (never force push).
- Confirm the site works again and report.

## Never, during a deploy

Force push; purchase, upgrade or delete anything; change domains, DNS, environment variables,
team/billing settings, or the Vercel Git connection.
