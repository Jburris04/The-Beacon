# Beacon publishing API contract (mock)

GitHub Pages cannot execute server endpoints. `mock.js` therefore exposes the future contract as `BeaconAPI.request(method, path, body)` for local integrations and tests.

## `POST /api/import`

Accepts `{ "markdown": "..." }` or `{ "text": "..." }`. Returns `{ edition, warnings }`, where `edition` conforms to `content/editions/schema.json`.

## `POST /api/publish`

Accepts `{ "edition": { ... } }` or `{ "edition_number": "003" }`. The static mock validates the request but does not persist it. The browser publisher performs the authorized GitHub write.

## `GET /api/edition/latest`

Returns the first record from `content/editions/index.json`.

When a serverless or hosted API is introduced, these paths and payloads can be implemented without changing the edition schema, parser, generator, or Studio workflow.
