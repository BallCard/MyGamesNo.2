# Project Closeout - 2026-03-31

## Current State
- Project: ZJU Cat Merge
- Current branch: `release/front-size-readability`
- Latest branch commit: `a6ca671 tune: improve early cat size readability`
- Latest main release commit: `6b0a075 release: prepare vercel beta build`
- Latest redeploy trigger on main: `95a667e chore: trigger vercel redeploy`
- Recommended public deploy target: Vercel

## What Is In The Playable Build
- Homepage, game loop, result page, share preview, player guide, and BGM are working
- Leaderboard is currently release-safe seeded ranking data plus local player insertion
- Combo system is capped and tuned for a more stable score curve
- Cat progression extends to level 18
- Early-level size readability has been increased on this branch

## Recommended Release Branches
- `main`
  Use this if you want the currently deployed beta build without the extra front-size readability tuning.
- `release/front-size-readability`
  Use this if you want the newer version where early cat size differences are easier to distinguish.

## Known Non-Blocking Follow-Ups
- Replace seeded leaderboard with a real backend leaderboard later if needed
- Refine seeded leaderboard copy so it does not imply live network competition
- Fix any remaining encoded seeded nickname strings before a broader public release
- Continue tuning early-level readability only after more player feedback

## Files Future Work Should Treat Carefully
- `src/main.ts`
- `src/game/hud/domHud.ts`
- `src/styles.css`
- `src/game/config/cats.ts`
- `src/lib/bgmManager.ts`
- `src/lib/playerGuide.ts`

## Local Run
```powershell
npm install
npm run dev -- --host 0.0.0.0 --port 4184
```

## Verification Commands
```powershell
npm test -- tests/smoke/app-start.test.ts
npm test -- tests/game/dom-hud.test.ts
npm test -- tests/game/run-state.test.ts
npm test -- tests/game/cat-sizing.test.ts
npm run build
```

## Release Checklist
- Confirm the branch you want to publish
- Push the branch to GitHub
- In Vercel, set the production branch if needed
- Verify homepage, start game, result page, share preview, and BGM on mobile
- Post the Vercel link for testers

## Notes
- `.data/` and temporary dev logs should stay local and not be committed
- `docs/README.md` currently has separate local edits and was intentionally left untouched during closeout
