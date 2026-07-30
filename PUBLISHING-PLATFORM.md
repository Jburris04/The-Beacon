# Beacon Studio publishing platform

Beacon Studio is a static editor and previewer. It never stores a GitHub credential and cannot publish by itself because GitHub Pages cannot execute server endpoints.

The production path is: ChatGPT JSON → Studio validation and approval → GitHub Actions or the local CLI → committed canonical JSON and generated indexes/routes → GitHub Pages.

## Studio workflow

1. Ask ChatGPT to return a JSON object conforming to `docs/chatgpt-edition-schema.json`.
2. Open `/admin/`, paste or drop the JSON, and fix any path-specific validation errors.
3. Preview desktop, tablet, phone, and print layouts. Save drafts locally or export the validated JSON.
4. Select **Prepare secure publish**. Studio creates a `gh workflow run` command and links to the repository Actions page. It does not receive a token.
5. Run the command in an authenticated terminal, or use the Actions page to dispatch the workflow with the base64 payload.

See `docs/chatgpt-publishing.md` for the authoring contract and `CHATGPT_PUBLISHING_HANDOFF.md` for the complete operational handoff.

## Source of truth and generated files

`content/editions/NNN.json` is the only canonical copy of an edition. Public route shells fetch it at runtime. The publisher derives `content/editions/index.json`, search and related-article data, RSS, sitemap, and lightweight edition/article route shells.

## Authentication

GitHub Actions uses its repository-scoped `GITHUB_TOKEN` with `contents: write`. The local CLI uses the user’s existing Git/GitHub CLI authentication. A fine-grained PAT, if used locally, should be limited to `Jburris04/The-Beacon` with **Contents: Read and write** and must never be pasted into Studio or committed.

## Rollback

Every publish is one Git commit. `npm run rollback -- COMMIT_SHA` creates and pushes a new revert commit, preserving history. Add `--dry-run` to inspect it first.

## No runtime API

There are deliberately no `/api/import`, `/api/publish`, or `/api/edition/latest` endpoints in this GitHub Pages release. They are future interface names only; implementing them requires an authenticated backend, GitHub App, or serverless service outside static Pages.
