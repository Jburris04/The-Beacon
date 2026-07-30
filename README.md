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

Open `/admin/` to import ChatGPT Markdown or plain text, normalize it into the Beacon schema, review exact public previews, manage editorial states, and publish directly to GitHub. See [PUBLISHING-PLATFORM.md](PUBLISHING-PLATFORM.md) for the complete workflow. The earlier ZIP/GitHub Desktop fallback remains documented in [PUBLISHING.md](PUBLISHING.md).

## Hosting

No build, server, or database is required. GitHub Pages serves the committed files directly at `https://jburris04.github.io/The-Beacon/`.
