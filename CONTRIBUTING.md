# Contributing

## Development

1. Install Node.js 20 or newer.
2. Run `npm run check` before opening a pull request.
3. Serve the repository locally (for example, `npx http-server .`) and manually check the changed interaction in a current desktop browser and a narrow viewport.

Keep game-state rules in `src/game.js` when they can be tested without a browser. Keep interaction code in `src/main.js`. Add tests for new or changed rules. Avoid new dependencies unless they materially simplify maintenance; explain the need and review package health before adding one.

## Pull requests

Use the pull request template. Describe user-visible behavior, accessibility effects, risks, and manual verification. Include screenshots for visual changes. Keep changes focused and do not publish or deploy from a pull request.
