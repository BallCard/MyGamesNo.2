# ZJU Cat Merge HUD and Tool Bar Guidelines

## HUD Goal

The gameplay HUD must help the player read the run at a glance without covering the cat stack or turning the screen into a dashboard. Every visible element should answer one of these questions:

- what am I dropping next?
- how well am I doing?
- am I in danger?
- what tools can still save me?

## Core Principles

- The playfield remains the visual priority
- HUD should stay readable in motion
- Avoid placing dense UI over the center stack
- Mobile thumb reach matters more than symmetry
- Tool actions must feel immediate and safe

## Information Priority

1. Danger state
2. Next cat
3. Current score
4. Tool availability
5. Combo burst feedback
6. Secondary controls such as pause

If the screen feels crowded, preserve this order.

## Layout Zones

### Top Zone

Reserved for high-urgency and high-context information:

- Red line and danger indicator
- `Next` preview
- Current score
- Pause / settings entry if shown during gameplay

### Center Zone

Reserved primarily for the physics stack and transient feedback:

- Cat bodies
- Aim line
- Merge effects
- Combo floating text
- Peak flashes and camera motion

Persistent HUD should avoid living here.

### Bottom Zone

Reserved for player actions:

- Tool bar
- Tool counts
- Optional helper affordances for target mode

## Top HUD Rules

### Next Preview

- Must stay visible at all times during active play
- Label as `Next`
- Preview card should feel soft and toy-like, not boxed like a debugger
- Keep visual size compact enough not to steal focus from the playfield

### Score

- Show current run score only
- Label can use `Score` or `Final Score` only on the result screen
- During gameplay, prefer `Score`
- Score should be large enough to read quickly but smaller than result-screen treatment

### Danger Indicator

- The danger bar or timer must appear near the red-line context, not detached at the bottom
- It should pulse softly when active
- It should remain absent or visually dormant when no danger is accumulating
- Do not use loud alarm styling unless the threshold is close to full

### Pause / Settings

- Small, low-emphasis entry in the top corner
- Must not compete with `Next` or `Score`

## Combo Presentation Rules

- Combo should appear near the center without covering the exact merge point for too long
- Use transient floating presentation, not a persistent corner meter as the main treatment
- High combo can briefly increase scale, warmth, and animation energy
- Combo UI must disappear cleanly when the chain breaks

## Tool Bar Structure

### Tool Order

Keep the tool order stable across the whole game:

1. `Refresh`
2. `Shake`
3. `Hammer`
4. `Bomb`

### Tool Button Content

Each button should include:

- emoji or icon
- short label or recognizable symbol
- remaining count

Recommended visible order:

- `??`
- `??`
- `??`
- `??`

### Tool Button States

- `Available`: full color, readable count
- `Empty`: visibly dimmed, not hidden
- `Target mode active`: highlighted clearly with an obvious selected state
- `Locked during resolution`: only if absolutely necessary, and visually distinct from empty state

## Tool Bar Layout Rules

- Tool bar belongs in the lower portion of the screen for thumb access
- Buttons should be evenly spaced but not oversized
- Keep enough separation to avoid mis-taps
- Do not mix tool buttons with unrelated navigation controls

## Target Mode UX

When `Hammer` or `Bomb` is activated:

- Normal drop input must be suspended
- Selected tool button stays visibly active
- Show one short helper line such as:
  - `点击一只猫使用锤子`
  - `点击一只猫引爆周围`
- Provide an obvious cancel path by tapping the active tool again or a small cancel affordance

## Danger and Tool Interaction

- Destructive tool immunity should be implied by game behavior, not explained with long text during play
- If red-line immunity is active, a subtle temporary visual cue is acceptable
- Avoid showing multiple warning systems at once if one clear cue can do the job

## Mobile Usability Rules

- Tool buttons must stay reachable with one thumb in portrait mode
- Counts must remain readable even on smaller phones
- Important top HUD elements must not collide with phone notches or browser chrome
- The center stack must stay visible above the tool bar even in chaotic late-game states

## What Not to Do

- Do not pin combo permanently in a corner like a sports scoreboard
- Do not place heavy panels behind the cat stack
- Do not over-label every tool with long explanatory text during active play
- Do not hide remaining tool counts
- Do not place leaderboard or social controls on the gameplay HUD
