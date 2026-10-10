# CLAUDE.md

Personal tech blog of Aarunish Sinha — "Aarunish's Engineering Notes" — at https://aarunishsinha.github.io/.

## Purpose & voice
- Tagline: notes from pulling at threads (databases, systems, data structures, algorithms) until it's actually understood. The author reads multiple sources and writes consolidated notes that "cut through the jargon without losing substance."
- First-person, conversational, curious. Posts end with an APA-ish **References** list.
- When asked to "add an article", **don't change the author's wording** (typos included) unless asked — only fix formatting. Point out typos/bugs separately instead.

## Stack
- Hugo (extended, local v0.163; CI uses `latest`) + **PaperMod** theme as a git submodule at `themes/PaperMod` (don't edit it; override in `layouts/` or `assets/`).
- Uses Hugo's newer layout dir names: `layouts/_partials/`, `layouts/_markup/`, `layouts/shortcodes/`.
- Deploy: `.github/workflows/hugo.yml` builds and publishes to GitHub Pages on every push to `main`. Pushing = publishing.
- Build check: `hugo --gc -d <scratch dir>` (don't write into `public/`; it's gitignored). Local preview: `hugo server -D`.

## Content layout
- `content/posts/` — the only published section (`mainSections = ["posts"]`). New articles go here as `content/posts/<slug>.md`.
- `content/_archive/` — parked drafts (deep-dives, scale-0-to-1m series); `_index.md` has `build.render: never`, so nothing under it is published.
- `data/sparks.json` — "Curiosity Spark" cards (`id`, `hook`, `writeup`, `origin{label,url}`); one is picked at random on the homepage by `layouts/_partials/curiosity_spark.html`.
- `archetypes/posts.md` is an old system-design template; real posts don't follow its sections.

## Post front matter (match existing posts)
```yaml
title: "Topic: Punchy Subtitle"     # e.g. "ACID: What Actually Matters", "Fibonacci: Can We Do Better?"
date: 2026-10-10T12:00:00+05:30     # IST
draft: false
description: "One-sentence summary shown in lists."
tags: ["lowercase", "hyphenated", "fundamentals"]
math: true                          # only if the post uses LaTeX (loads KaTeX CSS)
ShowToc: true
TocOpen: true
cover: { image: "", alt: "", caption: "" }
```

## Markdown conventions
- Body sections use `#` (H1) headings, subsections `##`/`###` (the page title is set by front matter).
- Notes/asides: blockquotes (`> **Prerequisites:** ...`) or italic `*Note: ...*`.
- Leave blank lines around headings, code fences, blockquotes and display math.
- Code fences always get a language; use `text` for ASCII diagrams.
- References: `---` then `# References` (or `## References`), numbered list. For in-text citations use `[[n]](#ref-key)` with `<span id="ref-key"></span>` at the start of the list item (inline HTML is enabled). Drafts often arrive in **Obsidian syntax** (`[[#^key | [n]]]`, trailing `^key` block IDs) — convert them to this.
- Multi-line blockquotes that must stay on separate lines need a trailing `\`.

## Math
- `$...$` / `\(...\)` inline and `$$...$$` / `\[...\]` block are passed through goldmark (`hugo.toml` → `markup.goldmark.extensions.passthrough`) and rendered **server-side** to KaTeX HTML by `layouts/_markup/render-passthrough.html`. Invalid LaTeX fails the build.
- The KaTeX stylesheet is included by `layouts/_partials/extend_head.html` only when front matter has `math: true`.
- Because `$` is a math delimiter site-wide, a literal dollar sign in prose must be escaped (`\$`) or put in backticks.

## Custom pieces
- `assets/css/extended/custom.css` — all styling overrides (Inter font, warm accent palette, header toggle, list card hover, Curiosity Spark card, tx-animation styles). Sections are marked with `/* ---- ... ---- */` comments.
- `layouts/list.html` — PaperMod list override that injects the Curiosity Spark on page 1 of the homepage.
- `layouts/shortcodes/tx-animation.html` — interactive step-through of two concurrent DB transactions (used in the ACID post). Takes a JSON body: `initialDb`, `steps[{actor: alice|bob, text, note?, db?}]`, `result{text, type}`.
- `layouts/shortcodes/fib-viz.html` + `assets/js/fib-viz.js` — Fibonacci-post widgets: `{{< fib-viz type="tree|dp|pow|doubling" n="…" >}}` (call tree with memo toggle, dp[] step-through, binary exponentiation step-through, fast-doubling path). The JS is loaded once per page via `.Page.Store`; widgets reuse the `.tx-anim` container/controls CSS so they match the ACID post.
- `layouts/shortcodes/fib-better.html` — "Can we do better?" callout with a progress strip: `{{< fib-better stage="1..5" >}}`.
- `hugo.toml` — site params, home intro copy (`params.homeInfoParams`), social icons, `Tags` menu, taxonomies `tags` + `series`.
