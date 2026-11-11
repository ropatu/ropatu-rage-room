# Ropatu: Virtual Rage Room

A local, dependency-light rebuild foundation for Ropatu's browser game. The live site was inspected on 2026-11-11. No source repository was available through the connected GitHub account at that time, so this is a clean-room implementation and does not claim to reproduce the original source.

## Run locally

Requires Node.js 20 or newer. No runtime or development dependencies are installed.

```sh
npm test
npm run check
python3 -m http.server 8000
```

Open `http://localhost:8000`. Opening `index.html` directly may work in some browsers, but ES modules are best served over HTTP.

## Current scope

- Keyboard and pointer aiming, smash, tool selection, and reset.
- Intro instructions presented as a modal dialog; the skip link targets the game, whose keyboard handling is disabled while the dialog is open.
- Distinct targets, tool damage strengths, impact marks, and lightweight debris feedback.
- Reduced-motion CSS preference, visible focus rings, and an announced smash counter.

This is a prototype foundation. Lifelike physics, sound, room selection, cross-browser assistive technology review, and production performance work remain future steps.

## Governance

- **License:** intentionally omitted pending confirmation of copyright ownership and desired reuse terms. Do not add an open-source license by assumption.
- **Contributions:** see [CONTRIBUTING.md](CONTRIBUTING.md).
- **Security:** see [SECURITY.md](SECURITY.md). No dependencies are currently required.
- Use pull requests for changes; CI runs syntax checks and unit tests. Protect the default branch and require review when a GitHub repository is created.
- Do not commit credentials, analytics identifiers, user data, generated build output, or private server configuration.

## Project structure

- `index.html`, `styles.css`: accessible page structure and presentation.
- `src/game.js`: deterministic game state functions.
- `src/main.js`: canvas rendering and browser interaction.
- `tests/`: dependency-free Node test suite.
