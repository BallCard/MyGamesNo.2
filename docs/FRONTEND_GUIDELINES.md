# ZJU Cat Merge Frontend Guidelines

## Visual Tone

- Warm, healing, slightly silly
- No cold engineering-panel visual language
- Rounded, soft, playful, readable

## Color Palette

- Background cream: `#F7EFD9`
- Secondary cream: `#FFF7EA`
- Chocolate text: `#5B3A29`
- Warm accent orange: `#F2A65A`
- Peach highlight: `#F7C6A3`
- Danger red: `#D96C5F`
- Gentle success gold: `#E7B94C`

## Typography

- Chinese UI text should prioritize readability and friendliness
- Gameplay accent terms like `Combo`, `Next`, `Game Over` may remain English
- Headings should feel soft and round, not technical or esports-aggressive

## Shape Language

- Large rounded corners
- Soft shadows
- Pill-style buttons where possible
- Avoid sharp borders and dense linework

## Layout Rules

- Mobile portrait is the primary canvas
- Top area reserves spawn/aim line and danger line
- Center area is the physics container
- Lower area supports key HUD controls and tool actions
- Desktop uses centered playfield with supporting side space for panels if needed

## Motion Rules

- Prefer short, expressive motion over constant micro-animation
- Merge bounce should feel elastic, not spring-chaotic
- Camera shake must be short and directional
- Flash effects should stay on edges and avoid obscuring the stack

## Feedback Rules

- Do not over-animate ordinary collisions
- Strong motion is reserved for merges, combos, tools, and peak events
- Danger indicators should pulse softly rather than scream

## Accessibility and Usability

- Buttons must remain thumb-friendly on mobile
- Important UI must remain readable over a busy cat stack
- Audio needs independent music and SFX toggles
- Screenshots should hide low-value debug or utility clutter

## Cat Asset Presentation Rules

- Show level identity externally as `Lv.1` through `Lv.12`
- Do not clutter gameplay UI with extra cat nicknames in V1
- Cat art should supply the humor; text should supply only clarity
- Runtime cat sprites must come from preprocessed transparent PNG assets, not live GIF playback in V1
- Gameplay rendering should preserve visual readability even when multiple cats overlap tightly

## HUD and Tool Bar Rules

- Top HUD should prioritize `Next`, `Score`, and red-line danger readability
- Persistent UI should avoid covering the center stack
- Tool bar should sit in the lower reach zone and keep a stable order: `Refresh`, `Shake`, `Hammer`, `Bomb`
- Combo is primarily a transient center-screen effect, not a permanent scoreboard panel
