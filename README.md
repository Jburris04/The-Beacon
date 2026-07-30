# The Beacon

A static premium newspaper and secure publishing workflow for GitHub Pages.

Each edition has one canonical source file at `content/editions/NNN.json`. The public homepage, edition and article views load structured content; the publisher derives archive data, search, related stories, RSS, sitemap, and route shells.

## Commands

```sh
npm test
npm run validate -- examples/edition-003.example.json
npm run generate -- examples/edition-003.example.json
npm run publish-edition -- path/to/edition.json --dry-run
npm run publish-edition -- path/to/edition.json
npm run rollback -- COMMIT_SHA --dry-run
```

Serve the repository through a static HTTP server and open it under `/The-Beacon/` to reproduce GitHub Pages subdirectory paths. Beacon Studio is at `/admin/`.

Read [CHATGPT_PUBLISHING_HANDOFF.md](CHATGPT_PUBLISHING_HANDOFF.md) for the exact publishing contract and [PUBLISHING-PLATFORM.md](PUBLISHING-PLATFORM.md) for the human workflow.
