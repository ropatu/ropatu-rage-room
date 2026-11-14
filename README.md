# Ropatu: Virtual Rage Room

A small, browser based 3D destruction game. The room, lighting, props, tools, and flying debris are rendered as real WebGL geometry with Three.js. It is a static site: Vite bundles the app into `dist/` for Cloudflare Pages.

## Run on Windows

Requires Node.js 20 or newer and PowerShell.

```powershell
# Open PowerShell in the project folder
npm install
npm run dev
```

Open the `Local` URL printed by Vite, usually `http://localhost:5173`. Keep PowerShell open while playing. Press `Ctrl+C` to stop the server. Do not open `index.html` as a file; the app uses JavaScript modules.

To make a production build locally:

```powershell
npm run build
npm run preview
```

The generated `dist` folder is ready for static hosting. For Cloudflare Pages, connect the repository, set the build command to `npm run build`, and the output directory to `dist`. No server runtime or secrets are needed.

## Play

Choose a target button or click the 3D object. Choose a bat, crowbar, or sledge; the stronger tools remove more health per hit. Use **Smash** or press Space/Enter. Arrow keys cycle targets, 1–3 select tools, and R resets the room. The buttons remain usable on touch screens and without a keyboard.

The canvas has a text alternative, visible focus treatment, labelled target/tool controls, and live status updates. Reduced-motion preference disables the animated impact/debris loop. On lower-core devices, antialiasing and shadows are reduced.

## Development

```powershell
npm test
npm run check
npm run build
```

The game is an original, playful scene with no accounts, analytics, sound, or server-side data. License remains intentionally unspecified pending the copyright owner's decision.
