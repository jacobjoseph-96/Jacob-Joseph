# Jacob Joseph — Portfolio

Personal portfolio site for Jacob Joseph, ADAS & Embedded Systems Specialist.
Static HTML + Tailwind CSS, no framework, no build server.

## Features

- Dark / light theme with a smooth cross-fade powered by the View Transitions API (with a per-property transition fallback for older browsers).
- Bilingual content (EN / DE).
- Responsive single-page layout: sidebar nav on desktop, top bar + drawer on mobile.
- Scroll-spy navigation, scroll-reveal animations, and a marquee ticker strip.
- Theme tokens centralized as CSS variables in `input.css` — one source of truth for both modes.

## Stack

- HTML (static)
- Tailwind CSS 3.4
- Vanilla JS (`assets/js/main.js`)

## Project layout

```
index.html              # Page markup
input.css               # Tailwind source + theme tokens + component CSS
style.css               # Compiled Tailwind output (do not edit by hand)
tailwind.config.js      # Tailwind config
assets/
  js/main.js            # Theme toggle, nav, scroll-spy, i18n, reveal
  Jacob-Joseph-2.png    # Hero photo
  ...
```

## Development

Install dependencies:

```
npm install
```

Watch and rebuild CSS on change:

```
npm run dev
```

One-off production build (minified):

```
npm run build
```

Then open `index.html` in a browser (or serve the directory with any static server).

## Theming

Theme variables live at the top of [input.css](input.css) under `html.dark` and `html.light`.
Add or change a token in both blocks; every component reads from `var(--token)` so no
class-level overrides are needed. Re-run `npm run build` after editing.

The theme toggle in [assets/js/main.js](assets/js/main.js) wraps the class swap in
`document.startViewTransition(...)` so the page cross-fades smoothly between modes.

## Internationalization

Strings are keyed via `data-i18n="..."` attributes in the markup and resolved from
the language files under `assets/i18n/` (`en.json`, `de.json`).
