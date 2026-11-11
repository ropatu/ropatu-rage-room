# Implementation plan

## Outcome and acceptance criteria

Rebuild Ropatu as a maintainable browser game with a reliable skip-to-game flow, visible keyboard instructions, accessible focus and status, and more physical, target-specific destruction. Keep the work local until the repository owner and intended GitHub visibility are confirmed.

## Assessment

- Live site inspected 2026-11-11: virtual rage-room game, visible tool/room controls, skip link and introductory overlay.
- Connected GitHub identity: `ropatu`; accessible repository list returned zero repositories. Repository search for `ropatu.com` returned none.
- Current local workspace had no project files and was not a Git repository.
- Source status: not found in the connected account or workspace. Existing-site code and deployment pipeline remain unknown.

## Phases and ownership

1. **Foundation (Tech Lead):** accessible single-room prototype, deterministic game rules, local tests, governance and CI. Done in this workspace; see `README.md` and tests.
2. **Interaction review (Frontend Eng):** define acceptance checks for focus, keyboard, responsive behavior and damage feedback. Checklist received; it is advice and has not been run against this prototype.
3. **Product/source recovery (Ronan + Tech Lead):** locate the original owner/source or confirm this is a clean replacement. Needed before migration, branding/assets reuse, or choosing a license.
4. **Gameplay polish (Frontend Eng):** implement richer break stages, varied debris and reduced-motion alternatives; test screen readers and mobile touch.
5. **Repository setup (Tech Lead after owner/visibility choice):** create GitHub repo, configure branch protection, secret/dependency alerts and CI; open PRs for further work. No remote repository was created.
6. **Release (Ronan + release owner):** test desktop/mobile/browser matrix, approve production destination, then plan deployment and rollback separately.

## Verification and release safeguards

- Local automated: Node built-in tests cover damage bounds, distinct tools, nearest-target selection, and miss behavior.
- Manual still required: skip link and dialog focus flow, keyboard-only play, rapid input, screen reader status, reduced-motion behavior, narrow viewport/zoom, multiple browsers, console/network errors, and mobile touch.
- Before a release, capture current production behavior and deployment configuration, then stage changes separately. Keep rollback as a revert to the previous immutable build. No deployment or remote publication is part of this foundation.

## Decisions and open constraints

- License intentionally omitted until ownership and reuse terms are confirmed.
- No production assets copied; current visuals are original CSS/canvas shapes.
- The static Google Fonts import is optional presentation enhancement and falls back to system fonts; consider self-hosting fonts or removing the request for a fully offline/privacy-minimal build.
- One specific blocker to a proper GitHub repository: the connected `ropatu` account has no accessible matching repo and the intended owner/visibility are not confirmed. Local work can proceed without that choice.
