# ZJU Cat Merge Implementation Plan

## Phases

### Phase 1: Project Foundation

- Initialize repo and frontend app shell
- Set up Phaser + Matter.js integration
- Define theme variables and core layout shell
- Add linting, formatting, and test tooling

### Phase 2: Core Gameplay

- Build aim, drop, and cooldown loop
- Add physics world and merge resolution
- Implement scoring and cat progression
- Add stable-danger red-line failure logic

### Phase 3: Tool System and Juice

- Implement Refresh, Shake, Hammer, Bomb
- Add target-mode input locking
- Add combo timing and combo state
- Add layered feedback, animation, audio, and camera effects

### Phase 4: Asset Pipeline

- Process source GIFs into 12 transparent PNG runtime assets
- Standardize asset names and export specs
- Integrate runtime asset loading

### Phase 5: Online Features

- Add anonymous player initialization
- Add nickname management
- Add final-score submission
- Build total and weekly leaderboard views
- Add lightweight anti-cheat checks

### Phase 6: Sharing and Polish

- Build result card and screenshot export flow
- Add settings toggles for music and SFX
- Tune mobile layout and WeChat-browser behavior
- Verify run duration and gameplay pacing targets

## Acceptance Gates

- Core loop playable on mobile
- Red-line grace feels fair
- All four tools work safely
- Score submission and leaderboards function end-to-end
- Result screenshots look intentional and shareable

## Risks

- GIF source cleanup may take longer than gameplay code
- Physics tuning can easily affect fairness and run length
- Unlicensed prototype BGM must be replaced before public deployment
