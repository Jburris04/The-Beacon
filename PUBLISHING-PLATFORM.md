# Beacon Studio publishing platform

Beacon Studio turns a ChatGPT-written edition into a complete static publication and publishes it directly to GitHub Pages. No application server, database, paid hosting, or external CMS is involved.

## The editorial flow

1. Ask ChatGPT: **“Build today’s Beacon.”**
2. Ask for the complete edition in Markdown. Consistent labels improve accuracy, but the importer tolerates ordinary headings, alternate labels, missing fields, and plain text.
3. Open `https://jburris04.github.io/The-Beacon/admin/` and select **Import from ChatGPT**.
4. Paste the response, drag a `.md` file onto the importer, or choose a Markdown/text file.
5. Beacon Studio recognizes the edition metadata, stories, editorial components, healthcare impact, Radar items, and images. It converts them to the canonical Beacon JSON schema and opens the review screen.
6. Review the public-site preview at desktop, tablet, phone, and print widths.
7. Select **Publish to GitHub**.

## Recommended ChatGPT format

```markdown
# The Beacon — Edition 003
Date: July 30, 2026
Theme: The defining idea
Summary: One clear sentence connecting the edition.
Reading Time: 18 minutes

## Editor's Note
The opening note.

## Politics
### Story headline
Standfirst: The concise setup.

First body paragraph.

Second body paragraph.

Pull Quote: A memorable line.
The Bottom Line: The essential conclusion.
Why It Matters — Providers: Provider impact, when relevant.
Why It Matters — Patients: Patient impact, when relevant.
Hero Image: https://example.com/image.jpg
Alt Text: A precise description of the image.
Caption: Image context.
Credit: Photographer or source.

## Already on Our Radar
- What we are watching — Why it matters next.
```

## What Studio generates

Each publish creates or updates:

- `content/editions/edition-NNN.json` and the newest-first edition index;
- the complete edition route and every individual article route;
- homepage and archive publication entry points;
- `rss.xml` and `sitemap.xml`;
- the search index and related-article map;
- story image, caption, credit, and alt-text fields;
- a Git commit that permanently records the release.

Missing images use the Beacon’s branded parchment placeholder. Related stories are selected from the same edition, favoring matching sections.

## Connecting GitHub

GitHub Pages cannot safely store a permanent credential. Beacon Studio therefore uses a fine-grained GitHub personal access token kept only in the current browser tab.

1. In Studio, select **GitHub**.
2. Follow the link to create a fine-grained token.
3. Limit repository access to `jburris04/The-Beacon`.
4. Grant **Contents: Read and write** permission. Metadata read access is added automatically by GitHub.
5. Paste the token into Studio and connect.

The token is stored in `sessionStorage`, is not included in edition data, never enters a generated file, and disappears when the browser tab/session closes. Repository coordinates are stored locally for convenience.

## Publishing and GitHub Pages

Studio reads the current `main` branch, creates Git blobs and a new tree, creates one publication commit, and fast-forwards `main`. It then polls the live edition JSON until GitHub Pages serves the new release. The success screen links to the homepage, edition, archive, every article, and the Git commit.

GitHub Pages normally updates within a minute. If deployment takes longer, the commit remains safely published and Pages will catch up automatically.

## Draft states

- **Draft** — actively being written.
- **Review** — editorially complete and awaiting approval.
- **Scheduled** — approved for a future date; v1 records the state but requires the editor to click Publish at the intended time.
- **Published** — committed to GitHub and verified on Pages.
- **Archived** — retained locally or in history but no longer active.

Draft state is browser-local. Export JSON for portable backups.

## Version history and rollback

Every publication is a Git commit. Studio’s **Version history** reads those commits. Rollback creates a new commit using the selected release’s complete tree; it never rewrites or destroys existing history. GitHub Pages then deploys the restored version normally.

## Future API publishing

The parser, generator, and GitHub publisher are independent modules. `api/mock.js` exposes a fetch-like contract today:

- `POST /api/import`
- `POST /api/publish`
- `GET /api/edition/latest`

GitHub Pages cannot execute POST endpoints, so these are intentionally mocked. A future authenticated service can implement the same paths and payloads without changing the Beacon schema or public site. ChatGPT could then submit Markdown to `/api/import`, review the normalized edition, and call `/api/publish` using scoped service credentials.

See `api/README.md` for request details.
