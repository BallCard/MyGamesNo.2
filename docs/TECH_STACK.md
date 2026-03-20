# ZJU Cat Merge Tech Stack

## Target Architecture

- Frontend: browser-based game client
- Backend: lightweight serverless API
- Database: hosted relational or serverless SQL store
- Deployment: GitHub + Vercel

## Recommended Stack

### Frontend

- `TypeScript`
- `Vite`
- `Phaser 3` for scene/game loop/rendering
- `Matter.js` via Phaser physics integration
- `HTML Canvas` rendering

### UI Shell

- Lightweight DOM overlay for menus, settings, and leaderboard UI
- CSS variables for theme control

### Backend

- `Vercel Functions`
- `TypeScript`
- Minimal REST-style endpoints

### Database

- `Postgres`-compatible hosted database
- Suggested candidates:
  - `Neon`
  - `Supabase Postgres`

### Tooling

- `npm`
- `ESLint`
- `Prettier`
- `Vitest` for unit tests
- Playwright or equivalent browser E2E for critical flows

## Deployment Model

- GitHub repository as source of truth
- Preview deploys per branch through Vercel
- Production deploy from main branch

## Runtime Constraints

- Mobile portrait browsers are primary target
- WeChat in-app browser must remain playable
- Desktop remains supported as secondary

## Asset Pipeline Constraints

- Raw GIFs processed offline into transparent PNG runtime assets
- Future animated asset support should not require changing gameplay asset identifiers
