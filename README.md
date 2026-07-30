# The Beacon / Beacon Studio v1

A premium, serverless digital newspaper built for GitHub Pages with plain HTML, CSS, and JavaScript.

## Live routes

- `/` — current edition homepage
- `/edition/002/` — complete example edition
- `/article/<slug>/` — individual stories
- `/archive/` — edition archive
- `/about/` and `/subscribe/` — publication pages
- `/admin/` — Beacon Studio

The public site reads structured content from `content/editions/`. `index.json` is the newest-first edition index, and each `edition-NNN.json` follows `schema.json`.

## Local preview

Serve the directory through any static web server. To reproduce the GitHub Pages subdirectory locally, serve the parent folder and open `/The-Beacon/`.

## Creating and publishing editions

Open `/admin/` to edit an edition, save browser-local drafts, preview changes, export JSON, or generate a complete publish package. See [PUBLISHING.md](PUBLISHING.md) for the GitHub Desktop workflow.

## Hosting

No build, server, or database is required. GitHub Pages serves the committed files directly at `https://jburris04.github.io/The-Beacon/`.
