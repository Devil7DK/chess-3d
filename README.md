# 3D Chess

A Chess Titans-inspired 3D chess game for the browser - play locally, against
Stockfish, or against someone else over a shared room code.

**[Play it here](https://devil7dk.github.io/chess-3d/)**

Started around 2023 for practicing three.js and kept in the backlog until 2026. Finally finished with help from Claude.

Built with React, three.js (via react-three-fiber) and Vite. [chess.js](https://github.com/jhlywa/chess.js)
owns the rules, so the 3D scene stays a pure view of the game state.

Though the main goal was to make a 3D chess game, the app also has a 2D board view for accessibility and testing.

## Features

- **3D board** with animated piece movement and captures
- **2D board** as an alternative view
- **Full rules** via chess.js: legal moves with checks and pins, castling,
  en passant, promotion (with a picker), stalemate and draw detection
- **Single player vs Stockfish**: don't have a friend?
- **2 player, single screen**
- **2 player, remote**: shareable 6-character room codes, join by code or
  link
- Move history with click-to-replay board previews
- Basic time tracking
- Basic sound effects

## Running it

Requires Node 24 and Yarn.

```sh
yarn install
yarn start     # dev server
yarn build     # type-check + production build into dist/
yarn lint
```

Local and single-player modes work with no further setup.

### Remote play

Remote play needs a Firebase Realtime Database. Copy `.env.example` to
`.env.local` and fill in the web app config from the Firebase console, then
apply `database.rules.json` to the database. The rules are what enforce seat
claims, append-only moves and self-only resignation, so the app is not safe to
host without them.

The Firebase SDK is loaded through a dynamic import, so the other modes never
download it.

## Deployment

Pushing to `master` builds and publishes `dist/` to GitHub Pages. The
`VITE_FIREBASE_*` values come from the repository secrets of the same names.

## Layout

```
src/
  components/   one folder per component, barrel-exported
  utils/        chess state provider, helpers, Firebase, sounds, environments
  types/        shared types
  assets/       models, textures, hdri, sounds (each with its own README)
```

`src/utils/ChessState.tsx` is the single source of truth: every mutation goes
through it and the board components only render what it derives.

## Licensing & attribution

This project is Apache-2.0 (see `package.json`). The assets and engine it
ships with carry their own terms:

| Bundled      | Source                                                                                                                               | License             |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------- |
| Chess engine | [Stockfish](https://github.com/official-stockfish/Stockfish) via the [stockfish npm package](https://github.com/nmrugg/stockfish.js) | **GPL-3.0**         |
| Sounds       | [Mixkit](https://mixkit.co/free-sound-effects/)                                                                                      | Mixkit Free License |
| HDRIs        | [Poly Haven](https://polyhaven.com/hdris) via [@pmndrs/assets](https://github.com/pmndrs/assets)                                     | CC0-1.0             |

Stockfish is served as a standalone WebAssembly worker rather than linked into
the bundle, but it is distributed alongside this app, and GPL-3.0 terms apply
to it.

I don't exactly remember where I got the 3D models and textures from, but they were free to use and modify. If you know, please let me know so I can credit them properly.
