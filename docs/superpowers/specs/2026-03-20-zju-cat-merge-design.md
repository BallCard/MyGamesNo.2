# ZJU Cat Merge Design Spec

## Overview

`ZJU Cat Merge (Õã´óë£ñóÃ¨)` is a warm, cute, slightly chaotic web merge game for Zhejiang University students and alumni. The target play session is 2-4 minutes, optimized for mobile portrait play and direct opening inside WeChat browser links.

The product hook is a mix of stress relief, light frustration, and shareable peak moments: cute cat stacks, strong combo feedback, and screenshot-worthy end states.

## Product Boundaries

### In Scope for V1

- Mobile-browser-first web game with desktop compatibility
- GitHub for source control and Vercel deployment
- Core drop / collide / merge gameplay loop
- Grace-based red-line failure system with 2.2s danger accumulation
- Four consumable tools per run:
  - `Refresh x2`
  - `Shake x1`
  - `Hammer x1`
  - `Bomb x1`
- Audio feedback plus prototype-stage BGM
- Anonymous player identity with editable nickname
- Global leaderboard and weekly leaderboard
- Screenshot-first sharing flow
- Static transparent PNG cats (`cat-1.png` to `cat-12.png`) generated from source GIF assets

### Explicitly Out of Scope for V1

- WeChat Mini Program
- Real-name or school identity verification
- Department / grade / alumni tags
- Social profile systems
- Replay-grade anti-cheat
- Battle record share pages
- Monetization, shops, or energy systems

## Core Gameplay

### Player Input

- The whole page blocks native scrolling and accidental page gestures.
- The player can press anywhere on screen and drag horizontally.
- A vertical dotted aiming guide shows the current drop lane.
- Releasing input drops the next cat from a fixed top spawn height.
- Drop input has a short cooldown to avoid spam taps breaking pacing.

### Core Loop

1. Aim from the top
2. Drop a cat
3. Let physics settle
4. Merge same-level cats on collision
5. Gain score and continue toward higher-level cats

### Run Length

- Average run target: `2-4 minutes`
- Strong runs may exceed `5 minutes`

## Failure System

The game uses a forgiving red-line rule instead of instant death.

- A cat crossing the red line does not immediately end the run.
- Danger starts only when a cat is both:
  - above the red line
  - considered stable, meaning below a speed threshold for a short continuous time
- Once danger starts, the run accumulates toward a `2.2 second` failure threshold.
- If the dangerous cat falls back down, merges, or is removed, danger decays quickly.
- Game over occurs only when the accumulated danger reaches the full threshold.

### System Safeguards

- Temporary motion spikes do not count as danger.
- Newly merged, bounced, or exploded cats are excluded until they settle.

## Tool System

The tool layer adds self-rescue and tactical decision-making without becoming a full economy system.

### Tool Economy

- Tools are fixed per run.
- No score recharge, gacha, or store in V1.

### Tool Rules

- `Refresh`: instantly rerolls the next cat.
- `Shake`: applies upward random impulse to all settled cats.
- `Hammer`: enter target mode, then destroy one selected cat.
- `Bomb`: enter target mode, destroy one selected cat, and apply strong outward impulse to nearby cats.

### Safety Rules

- Destructive tools must grant `1.5-2 seconds` of red-line immunity.
- While `Hammer` or `Bomb` target mode is active, normal drop input is locked to avoid misdrops.

## Combo and Feedback

### Combo Rule

- A merge extends combo if the next merge happens within a `0.9-1.2 second` combo window.
- If no qualifying merge occurs before timeout, combo resets.

### Four-Layer Feedback Model

1. `Presence feedback`
   - Light collision sounds only
   - No noisy overreaction on every contact
2. `Merge confirmation`
   - Clear merge sound
   - New cat squash-and-bounce tween
   - Soft particles or ripple for stronger merges
3. `Combo escalation`
   - Center-screen combo text
   - Warmer color treatment
   - Rising audio pitch / intensity
4. `Peak moments`
   - Triggered by high combo or creating the current highest cat in the run
   - Short directional camera shake
   - Edge-only warm flash, not full-screen white flash

## Visual Direction

- Warm cream / beige background
- Chocolate-brown typography
- Rounded UI, soft shadows, emoji-friendly iconography
- No cold debug-panel aesthetic
- Language tone: Chinese-first with selective English gameplay terms like `Combo`, `Next`, `Game Over`

## Asset Pipeline

### Source Assets

- User-provided cat GIFs act as raw source material.

### V1 Runtime Assets

- Export `12` transparent static PNGs for gameplay runtime.
- The engine only scales and renders these images on physics bodies.
- No complex runtime cropping or base redraw logic.

### Future-Proofing

- Keep source GIFs archived
- Standardize naming and export dimensions
- Leave room for later animated asset support without renaming the gameplay catalog

## Online Features

### Player Model

- Anonymous generated player ID
- Editable nickname
- No school identity fields in V1

### Leaderboards

- Global all-time leaderboard
- Weekly reset leaderboard
- Upload only final run results, not live match telemetry

### Anti-Cheat Boundary

V1 uses lightweight protection:

- Basic payload validation
- Submit rate limiting
- Score and level sanity checks
- Suspicious-result filtering or isolation

## Sharing

- Sharing is screenshot-first
- Result card should include:
  - nickname
  - final score
  - highest cat reached
  - highest combo
  - recognizable stack composition
- The screenshot should look like a polished share card, not a raw debug capture

## Technical Shape

- Frontend owns gameplay, rendering, input, audio, screenshot generation
- Lightweight backend owns player records, leaderboard reads/writes, and anti-cheat checks
- Deployment shape: GitHub + Vercel

## Success Criteria

- The game is smooth on mobile portrait browsers
- Red-line grace logic feels fair and never "cheap"
- All four tools work without causing accidental run loss
- One run reliably fits the intended short-session window
- Leaderboards are stable enough for public use
- End-of-run screenshots are attractive enough to share in WeChat groups

## Approved V1 Cat Progression

The public runtime naming for cat progression is numeric only: `Lv.1` through `Lv.12`. V1 does not use public meme names for the cat levels. The cat image itself carries the personality; the level number carries the progression meaning.

### Main Source Mapping

- `Lv.1` -> `1739669151740.gif`
- `Lv.2` -> `1739669468684.gif`
- `Lv.3` -> `1739669272399.gif`
- `Lv.4` -> `1739677373999.gif`
- `Lv.5` -> `1739669511858.gif`
- `Lv.6` -> `1739669611997.gif`
- `Lv.7` -> `1739669329312.gif`
- `Lv.8` -> `1739670504608.gif`
- `Lv.9` -> `1739669761027.gif`
- `Lv.10` -> `1739670687306.gif`
- `Lv.11` -> `1739670476430.gif`
- `Lv.12` -> `1739670012601.gif`

### Backup Source Pool

- `1739670003873.gif`
- `1739669996873.gif`
- `1739670738094.gif`
- `2458469307.gif`
- `1739673225182.gif`
- `1739675834438.gif`

### Export Constraints

- Export runtime assets to `cat-1.png` through `cat-12.png`
- Use transparent square PNGs, default `512x512`
- Center the subject and avoid runtime image surgery
- Choose the most representative still frame per GIF rather than always using frame 0

## Result, Leaderboard, and Share Presentation

V1 result presentation should use concise Chinese-first copy with selective English stat labels such as `Final Score`, `Highest Cat`, and `Best Combo`. The result screen must prioritize immediate comprehension: headline, score, highest cat, best combo, nickname, and screenshot action should all appear without requiring extra navigation.

Leaderboard presentation should remain compact and legible, using `×Ü°ñ` and `ÖÜ°ñ` as the primary tabs. Public ranking copy should stay short and readable rather than overly meme-heavy.

The share card is a portrait-first polished result artifact, not a raw screen capture. It should center the cat stack visually, show score as the strongest text element, and include nickname, highest cat, and best combo. Rank appears only when already confirmed by backend response; otherwise it is omitted cleanly.

## Home Screen Direction

The home screen should act as a low-friction launch pad rather than a content hub. It needs a dominant `¿ªÊ¼ÎüÃ¨` primary action, a visible but lower-priority leaderboard entry, lightweight nickname editing, and a short one-line hook that explains the tone without over-explaining the rules. V1 should avoid heavy tutorial overlays on first launch and instead rely on a single concise helper line plus obvious visual affordances.

## HUD Direction

The gameplay HUD should stay light and functional. The top area needs to preserve context for `Next`, `Score`, and the red-line danger state, while the lower area holds the tool bar in a stable left-to-right order: `Refresh`, `Shake`, `Hammer`, `Bomb`. Combo feedback should behave as transient center-screen celebration rather than a permanent dashboard widget.
