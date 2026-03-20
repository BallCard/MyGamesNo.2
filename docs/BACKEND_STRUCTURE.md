# ZJU Cat Merge Backend Structure

## Backend Role

The backend is intentionally thin. It stores player identity, accepts final run submissions, serves leaderboards, and applies basic anti-cheat checks.

## Core Entities

### players

- `id` UUID primary key
- `anon_token` unique generated identity token
- `nickname` text
- `created_at` timestamp
- `updated_at` timestamp

### runs

- `id` UUID primary key
- `player_id` foreign key to players
- `score` integer
- `highest_cat_level` integer
- `highest_combo` integer
- `duration_ms` integer
- `submitted_at` timestamp
- `client_version` text
- `is_suspicious` boolean
- `suspicious_reason` text nullable

### leaderboard_weekly

- Logical view or query over `runs` scoped to current leaderboard week

### leaderboard_global

- Logical view or query over `runs` scoped to all-time best records

## API Surface

### `POST /api/player/init`

Creates or restores anonymous player identity.

Request:
- optional local token

Response:
- player token
- nickname

### `POST /api/player/nickname`

Updates player nickname.

Request:
- player token
- nickname

### `POST /api/runs`

Submits final run result.

Request:
- player token
- score
- highest cat level
- highest combo
- duration
- client version

Server checks:
- token validity
- rate limit
- payload shape
- score / duration sanity

### `GET /api/leaderboard/global`

Returns ranked all-time results.

### `GET /api/leaderboard/weekly`

Returns ranked weekly results.

## Anti-Cheat Rules

- Reject malformed payloads
- Limit submit frequency by player token and IP heuristics where available
- Flag impossible score / level / duration combinations
- Hide flagged runs from public boards by default

## Operational Notes

- Score upload occurs only after game over
- Gameplay is still client-authoritative in V1
- Server logic should remain simple enough to maintain on Vercel serverless functions
