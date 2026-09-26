# CineReel — Offline Movie Recommender

A fully offline, file-based movie recommendation engine. No build step, no server, no API keys.

## Structure
```
movie-recommender/
├── index.html        entry point, markup only
├── css/
│   └── styles.css     all styling (dark cinematic theme)
├── js/
│   ├── data.js         MOVIES catalog + MOODS presets
│   ├── engine.js        pure recommendation functions (filter, score, recommend)
│   └── app.js           DOM wiring: renders UI, handles clicks, calls Engine
└── README.md
```

## How the engine works
- `Engine.filter()` — narrows the catalog by selected genres, mood tags, and search text.
- `Engine.scoreAgainst()` — scores a candidate movie against a set of liked movies (+2 per shared genre, +3 per shared tag).
- `Engine.recommendFor()` — ranks the whole catalog against everything you've liked → powers "Recommended for you".
- `Engine.similarTo()` — ranks the catalog against one movie → powers "Because you're looking at X" inside the detail modal.

Likes are stored in `localStorage` under `mr_liked`, so recommendations persist between sessions in the same browser.

## Run it
Just open `index.html` in a browser — everything is static files, so double-clicking it works, or serve the folder with any static server (`npx serve .`).

## Extend it
Add a movie by appending an object to `MOVIES` in `js/data.js` with the same shape (`t, y, g, r, tags, dir, rt, c1, c2, icon, blurb`) — no other file needs to change.
