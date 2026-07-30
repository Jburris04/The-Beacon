# ChatGPT edition authoring contract

Return one JSON object only—no Markdown fence or explanatory text. It must validate against `docs/chatgpt-edition-schema.json` (the same schema as `content/editions/schema.json`). Use `schema_version: 2`, a unique three-digit edition number, an ISO publication date, and globally unique lowercase story slugs.

Body copy is an array of paragraphs. Sources are `{title,url}` objects using complete HTTPS URLs. `why_it_matters.providers` and `.patients` must exist; use an empty string only when genuinely inapplicable. Every image object must contain `src`, `caption`, `credit`, and meaningful `alt`; `src` may be empty to invoke the Beacon placeholder. Every story must appear exactly once in `sections[].story_slugs`.

Validate before handoff:

```sh
npm run validate -- path/to/edition.json
```

The complete example is `examples/edition-003.example.json`. Import that JSON into Beacon Studio for editorial review, then publish through the secure workflow described in `CHATGPT_PUBLISHING_HANDOFF.md`.
