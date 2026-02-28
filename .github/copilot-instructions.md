## Goal
Short, focused guidance to help AI coding agents be productive in this small static repo (GymScreen).

## Big picture
- This is a static, single-page site that displays a horizontal carousel of exercise "cards" and a details panel with an embedded preview (iframe).
- No build system, server, or bundler. Files served directly: `index.html`, `css/style.css`, `js/script.js`, and `data/exercises.json`.

## Key files
- `index.html` — page structure, Hebrew (`lang="he"`), main DOM nodes: `#carousel`, `#exerciseTitle`, `#exerciseDescription`, `#exerciseFrame`.
- `js/script.js` — client logic that fetches `data/exercises.json`, normalizes entries, and builds the carousel; it wires click handlers to update the details pane and provides a small fallback when the fetch fails.
- `css/style.css` — dark theme styles; cards live inside `.carousel`, active state uses `.card.active` to scale.
- `data/exercises.json` — now the primary runtime data source. Must be valid JSON and follow the `id,name,description,link` shape.

## How to run & test (developer workflow)
- No build: open `index.html` in a browser. For CORS-safe iframe previews (Google Drive, external embeds) serve files over HTTP instead of file:// to avoid mixed/content issues. Example quick server:

  - Use VS Code Live Server extension, or
  - From project root (PowerShell):

    python -m http.server 8000

  then open http://localhost:8000

## Data & integration patterns
- Current runtime source of truth: `data/exercises.json` (loaded at runtime by `js/script.js`). Each item must contain: `id`, `name`, `description`, `link`.
  - Note: `js/script.js` will fetch `data/exercises.json` and normalize entries; it also ships a small fallback list when the fetch fails (useful when testing via file://).
- Ensure `data/exercises.json` is valid and uses the shape below. `js/script.js` will fetch and normalize entries (it will map `details` arrays into `description` if needed):

  [
    {"id":1, "name":"סקוואט", "description":"...", "link":"https://..."},
    ...
  ]

## Common edits & examples
- To add an exercise quickly, edit `js/script.js` and append an object to the `exercises` array (ensure unique `id` and proper `link` to an embeddable preview).
- To change the active-card visual, update `.card.active` in `css/style.css` (currently scales and darkens the background).
- To change which DOM elements update on click, see the variables at top of `js/script.js` (`carousel`, `title`, `description`, `frame`) — keep IDs in `index.html` in sync.

## Gotchas & project-specific notes
- Language & layout: `index.html` uses `lang="he"`. Expect right-to-left content; CSS does not currently set `direction` explicitly — adjust if adding RTL layout rules.
- Embeds: many exercise previews are Google Drive preview links. Those must be shareable and embeddable — broken or private links will not show in the iframe.
- Broken JSON: `data/exercises.json` contains JSON syntax errors and a different property layout; do not assume it is the source of truth until fixed.

## Search hints for maintainers / agents
- Look for `#carousel`, `.card`, and `exerciseFrame` when changing interaction code.
- When converting to fetch-based data, update both `data/exercises.json` and `js/script.js` to use the same property names.

## Minimal acceptance criteria for changes
- UI: clicking a card updates title, description, and iframe src.
- Data: if using `data/exercises.json`, JSON must be valid and the fields must be normalized to `id`,`name`,`description`,`link` before rendering.

If anything above is unclear or you want me to normalize `data/exercises.json` and switch `script.js` to fetch it, say so and I'll make that change and add a tiny test page/verification step.
