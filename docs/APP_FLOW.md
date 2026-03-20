# ZJU Cat Merge App Flow

## Main Screens

- Loading / asset warmup
- Home screen
- Nickname prompt / settings entry
- Gameplay screen
- Tool targeting overlay states
- Pause / settings modal
- Game over / result screen
- Leaderboard screen

## Primary User Flow

1. Open shared link in mobile or desktop browser
2. Load assets and initialize anonymous player ID
3. Optionally set or edit nickname
4. Start run from home screen
5. Play drop / merge loop
6. Use tools when needed
7. Trigger game over after danger threshold fills
8. Submit final score
9. View result card
10. Save or share screenshot
11. Open total or weekly leaderboard
12. Start another run

## Gameplay State Flow

- `Ready`
- `Aiming`
- `Dropping`
- `Resolving physics`
- `Merge event`
- `Combo active / combo timeout`
- `Danger accumulation`
- `Tool target mode` when needed
- `Game over`
- `Score submit`
- `Result presentation`

## Error / Edge Flows

- If score submission fails:
  - keep local result visible
  - surface retry action
  - avoid blocking screenshot export
- If leaderboard load fails:
  - show fallback message
  - allow replay without waiting
- If nickname is empty:
  - auto-assign anonymous default until user edits it

## UX Notes

- Input blocking is critical during bomb / hammer targeting
- Danger state must remain readable without feeling panicked
- Screenshot CTA should be prominent on result screen
