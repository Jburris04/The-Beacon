# CHATGPT PUBLISHING HANDOFF

## Contract

Produce exactly one JSON object satisfying [`docs/chatgpt-edition-schema.json`](docs/chatgpt-edition-schema.json). The canonical edition is committed as `content/editions/NNN.json`; never duplicate article copy in HTML.

Required top-level fields: `schema_version`, `edition`, `publication_date`, `display_date`, `theme`, `summary`, `reading_time`, `editor_note`, `sections`, `stories`, `radar`, and `closing_thought`. Each story requires `slug`, `section`, `category`, `headline`, `standfirst`, paragraph-array `body`, HTTPS `sources`, `pull_quote`, `bottom_line`, `why_it_matters.providers`, `why_it_matters.patients`, and `image.src/caption/credit/alt`.

## Files changed by one publish

- Create `content/editions/NNN.json`.
- Update `content/editions/index.json`, `content/search-index.json`, and `content/related.json`.
- Create/update `edition/NNN/index.html` and `article/SLUG/index.html` route shells.
- Update `rss.xml` and `sitemap.xml`.

The homepage and archive HTML are stable renderers and normally do not change.

## Publish

Local dry run and confirmed publish:

```sh
npm run publish-edition -- path/to/edition.json --dry-run
npm run publish-edition -- path/to/edition.json
```

The second command requires typing `PUBLISH NNN`, creates one commit, pushes `main`, and prints the commit SHA and live URLs. Authentication is the machine’s existing Git credential or a repository-limited fine-grained PAT with **Contents: Read and write**. Never put a token in JSON or frontend JavaScript.

For GitHub Actions, base64-encode the compact JSON and dispatch `.github/workflows/publish-edition.yml`:

```sh
gh workflow run publish-edition.yml --repo Jburris04/The-Beacon -f edition_json_base64="$(base64 < path/to/edition.json | tr -d '\n')"
```

Actions validates, rejects duplicate edition numbers, runs tests, generates files, commits, pushes, and polls GitHub Pages. Success reports the commit and links in the workflow summary. Expected URLs are `https://jburris04.github.io/The-Beacon/`, `/edition/NNN/`, `/archive/`, and `/article/SLUG/`.

ChatGPT can invoke the local command or workflow only when running in an authenticated environment with repository permission. The static ChatGPT/Studio browser session cannot securely publish directly. The remaining manual step is approving the edition and running/dispatching the authenticated publisher.

## Rollback

```sh
npm run rollback -- PUBLISH_COMMIT_SHA --dry-run
npm run rollback -- PUBLISH_COMMIT_SHA
```

Rollback requires typing `ROLLBACK SHA` and creates a new revert commit; it never rewrites history.

## Complete valid sample payload

```json
{
  "schema_version": 2,
  "edition": "003",
  "publication_date": "2026-07-30",
  "display_date": "Thursday, July 30, 2026",
  "theme": "The Systems Behind the Breakthrough",
  "summary": "Three stories about the systems that turn ideas into durable progress.",
  "reading_time": "8 minutes",
  "editor_note": "Good morning. Today we look past the breakthrough toward the systems that make it last.",
  "sections": [{"name":"Technology","story_slugs":["the-infrastructure-test"]}],
  "stories": [{
    "slug": "the-infrastructure-test",
    "section": "Technology",
    "category": "Feature",
    "headline": "The next technology race will be won behind the scenes.",
    "standfirst": "Infrastructure is becoming as important as the software it supports.",
    "body": ["The most visible products depend on systems most people never see.", "That makes infrastructure a strategic choice."],
    "sources": [{"title":"Example primary source","url":"https://example.com/source"}],
    "pull_quote": "Every digital breakthrough has a physical foundation.",
    "bottom_line": "Resilient foundations determine which breakthroughs last.",
    "why_it_matters": {"providers":"Reliable systems support safer clinical work.","patients":"Dependable systems improve access and continuity."},
    "image": {"src":"","caption":"Infrastructure makes innovation possible.","credit":"The Beacon","alt":"A network supporting digital services"}
  }],
  "radar": [{"title":"The next infrastructure cycle","detail":"Watch what capital spending reveals."}],
  "closing_thought": "Breakthroughs get headlines. Systems decide what lasts."
}
```
