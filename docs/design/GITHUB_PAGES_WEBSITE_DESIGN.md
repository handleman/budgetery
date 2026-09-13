---
title: GitHub Pages website
nav_order: 11
parent: Design docs
---

# GitHub Pages Website — Design Plan

## 1. Goal

A documentation website for Budgetery on GitHub Pages (`https://handleman.github.io/budgetery/`), authored **only in Markdown**:

- entry point is `README.md` (also the site homepage);
- `README.md` links into the files under `docs/`;
- all files under `docs/design/` appear as one **Design docs** section in the site menu;
- every page stays readable in both contexts: github.com repo view **and** the published site.

Plan only — no implementation. Target inventory (after the pending doc cleanup): `README.md`, `AGENTS.md`, `docs/test-plan.md`, `docs/WEB_VISUAL_TEST.md`, `docs/design/` (8 files: usecases, E2E ×2, paper/UX/persistence/fulfillment designs, Drive sync, Cloud setup, native plan) + 2 new section indexes (below).

## 2. Approach decision

**Jekyll on Pages, deploy-from-branch, root publishing source, `just-the-docs` remote theme (pinned).**

- Root source (not `/docs` publishing source): the site must include root `README.md`/`AGENTS.md`, so Jekyll root = repo root with `_config.yml` at root.
- Theme: `remote_theme: just-the-docs/just-the-docs` pinned to a release tag (e.g. `v0.10.1`) — gives the left-hand menu, search, and section hierarchy with zero custom CSS. `jekyll-remote-theme` is Pages-whitelisted.
- No custom Actions workflow: everything needed is built into standard Pages builds — notably `jekyll-relative-links`, which is **enabled by default** and rewrites relative `*.md` links to rendered URLs (permalink- and `baseurl`-aware). So the link rule is: *always relative inline links with `.md` extension* — valid on github.com and on the site. Avoid reference-style links (known plugin bug: they are not rewritten).
- Not the Expo web export: publishing the app (`dist/`) is a different goal; optionally link to it later once hosted. This plan covers the docs site only.

## 3. Homepage = README.md (no edits to README body for this)

`README.md` becomes the site root via `_config.yml` **defaults**, keeping the file pristine (no front-matter table leaking into the repo view):

```yaml
defaults:
  - scope: { path: "README.md" }
    values: { layout: "home", permalink: "/", title: "Budgetery", nav_order: 1 }
```

⚠️ Verify in M1; fallback if `permalink`-via-defaults misbehaves: add 3-line front matter to `README.md`. (Fallback ugliness is confined to one file.)

⚠️ Known theme gotcha (just-the-docs #1445): never use a blanket `defaults` scope `path: ""` with a `layout` — it corrupts the theme's own JS/assets. Scope defaults narrowly: one entry per content dir/file (see §6).

## 4. Structure & menu

New files (only 3): `_config.yml`, `docs/index.md`, `docs/design/index.md`. Menu target:

- Home → `README.md`
- Documentation → `docs/index.md` (new, short landing + links)
  - Test plan → `docs/test-plan.md`
  - Web visual testing → `docs/WEB_VISUAL_TEST.md`
- Design docs → `docs/design/index.md` (new, one-line summary + links per doc)
  - Use cases → `usecases.md`
  - E2E: Playwright design / implementation plan (2 files)
  - UX library decision, Paper migration, Persistence layer, Usecase fulfillment (4 files)
  - Drive sync design, Cloud setup, Native builds plan (3 files)
- `AGENTS.md`: published but **excluded from the menu** (`nav_exclude: true`) — contributor notes, still reachable from README's existing link.

Hierarchy is explicit front matter per file (JTD does not infer nesting from folders): section indexes carry `has_children: true`, children carry `parent: <section title>`.

## 5. Front matter table (exact values for implementation)

`layout` comes from `_config.yml` defaults; each file gets only navigation front matter:

| File | title | nav_order | parent / flags |
|---|---|---|---|
| `README.md` | Budgetery | 1 | (homepage via §3) |
| `docs/index.md` *(new)* | Documentation | 2 | `has_children: true` |
| `docs/test-plan.md` | Test plan | 1 | `parent: Documentation` |
| `docs/WEB_VISUAL_TEST.md` | Web visual testing | 2 | `parent: Documentation` |
| `docs/design/index.md` *(new)* | Design docs | 3 | `has_children: true` |
| `docs/design/usecases.md` | Use cases | 1 | `parent: Design docs` |
| `docs/design/E2E_PLAYWRIGHT_DESIGN.md` | E2E: Playwright design | 2 | `parent: Design docs` |
| `docs/design/E2E_IMPLEMENTATION_PLAN.md` | E2E: implementation plan | 3 | `parent: Design docs` |
| `docs/design/UX_LIBRARY_DECISION_DESIGN.md` | UX library decision | 4 | `parent: Design docs` |
| `docs/design/PAPER_MIGRATION_DESIGN.md` | Paper migration | 5 | `parent: Design docs` |
| `docs/design/PERSISTENCE_LAYER_DESIGN.md` | Persistence layer | 6 | `parent: Design docs` |
| `docs/design/USECASE_FULFILLMENT_PLAN.md` | Usecase fulfillment | 7 | `parent: Design docs` |
| `docs/design/GOOGLE_DRIVE_SYNC_DESIGN.md` | Drive sync | 8 | `parent: Design docs` |
| `docs/design/GOOGLE_CLOUD_SETUP.md` | Cloud setup | 9 | `parent: Design docs` |
| `docs/design/NATIVE_BUILDS_SETUP_PLAN.md` | Native builds | 10 | `parent: Design docs` |
| `AGENTS.md` | Contributor notes | — | `nav_exclude: true` |

## 6. `_config.yml` draft (implementation copies this)

```yaml
remote_theme: just-the-docs/just-the-docs@v0.10.1
title: Budgetery
description: Local-first budget tracking with Expo + React Native
url: "https://handleman.github.io"
baseurl: "/budgetery"
permalink: pretty
exclude:
  - node_modules
  - dist
  - .expo
  - .opencode
  - .playwright-mcp
  - test-results
  - playwright-report
  - Gemfile
  - "*.gemspec"
defaults:
  - scope: { path: "README.md" }
    values: { layout: "home", permalink: "/", title: "Budgetery", nav_order: 1 }
  - scope: { path: "docs" }
    values: { layout: "default" }
  - scope: { path: "AGENTS.md" }
    values: { layout: "default", title: "Contributor notes", nav_exclude: true }
plugins:
  - jekyll-relative-links # default-on; listed for explicitness
```

## 7. Interlinking (edits to file bodies)

- `README.md`: extend the Architecture section (or a new "Documentation" section) with relative links: `./docs/index.md` (Documentation), `./docs/design/index.md` (Design docs). Keep the existing `./AGENTS.md` link — it keeps working on both surfaces.
- `docs/index.md`, `docs/design/index.md` (new): H1 + one line per child with a relative `./<file>.md` link (duplicates the menu on-page; harmless and helps repo-view readers).
- Design docs interlink as needed with the same relative-inline-`.md` rule (e.g. sync design ↔ Cloud setup ↔ native plan already reference each other by name — convert to links).
- No content fixes needed otherwise: `localhost` mentions are shell commands, not links; no images to relocate.

## 8. Enablement (owner clicks, ~2 min)

Repo Settings → Pages → Build and deployment → Source: **Deploy from a branch** → Branch: `main`, folder: `/(root)` → Save. Site appears at `https://handleman.github.io/budgetery/` after the first `pages-build-deployment` run (Actions tab shows progress).

## 9. Milestones & verification

- **M1 — skeleton**: `_config.yml`, `docs/index.md`, `docs/design/index.md`, README links, front matter on 3–4 files; push to a branch and preview via a fork/PR? (Standard Pages builds only the configured branch — use a temporary `pages-preview` branch or accept verifying on `main`.) Verify: homepage renders README, menu shows sections, §3 permalink approach works (else fallback).
- **M2 — full nav**: front matter on all remaining files per §5; fix any body links; verify every menu entry + repo-view rendering unchanged.
- **M3 — polish**: `aux_links` (View on GitHub), footer, search check, final pass on mobile layout.
- Local preview is optional (needs Ruby/Bundler; document if used, don't commit Gemfile noise beyond `.gitignore`).

## 10. Risks & non-goals

- `permalink: /` via defaults is the one unverified trick — fallback (front matter in README) is ready.
- JTD pin: unpinned `remote_theme` can shift styling under us; keep the tag.
- Front-matter `defaults` must stay narrowly scoped (theme-corruption bug, §3).
- Repo-view vs site divergence: mitigated by the relative-links rule; no per-surface content forks.
- Non-goals: publishing the Expo app itself, custom Actions/Jekyll plugins, comments/analytics, versioned docs.
