# Professor profile site

A fast, dependency-free personal website for an academic: research themes, searchable publications with one-click BibTeX, lab and openings, teaching, news, funding and contact. The hero is a live spike-raster simulation that you can stimulate with the pointer.

> The person, institute, papers and figures in `assets/js/content.js` are **demo placeholders**. Replace them before publishing.

## Stack and why

- **Plain HTML, CSS and vanilla JS, with no framework and no build step.** It runs on GitHub Pages, Netlify, or a university web server that only serves static files. Nothing goes stale, and the site loads in one request round.
- **All content lives in one file** (`assets/js/content.js`). Editing the site means editing data, not markup.
- Google Fonts: Newsreader (display), IBM Plex Sans (body), IBM Plex Mono (data and labels).

## Features

- Live spike raster (canvas, 48 units, 1 s window, population rate in Hz). It pauses off-screen and when the tab is hidden, and starts paused for users who prefer reduced motion.
- Publications: full-text search with highlighting, type chips, theme filter and a "Selected" toggle. Grouped by year, with the professor's name bolded and generated BibTeX that you can copy.
- Command palette (`Ctrl/⌘ K` or `/`) to jump to sections, find papers, copy the email address and toggle the theme.
- Light and dark themes (follows the OS; manual choice is remembered), sticky header with scrollspy, skip link, visible focus states, print stylesheet.
- SEO: meta and Open Graph tags, plus schema.org `Person` JSON-LD generated from the content file.

## Edit content

Open `assets/js/content.js`:

- `person.links`: add Scholar, ORCID, GitHub, LinkedIn or CV URLs. Empty links are hidden.
- `publications[]`: `type` is `journal | conference | preprint | book`. Set `selected: true` to feature a paper. `pdf`, `doi` and `code` show as links when filled in.
- `person.citeName` must match how the name appears in `authors`, so that it is bolded.
- Update the `<title>` and meta description in `index.html` to match.

## Run locally

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Build a single-file version (optional)

```bash
node scripts/build.mjs        # -> dist/index.html with CSS and JS inlined
```

## Deploy

Push to GitHub and enable **Settings → Pages → Deploy from branch** (root). Any static host works.
