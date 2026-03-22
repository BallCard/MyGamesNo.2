# ZJU Cat Merge Dynamic Share Card Design

## Goal

Introduce a dedicated share-card flow from the result layer so players can generate a more viral, cat-led score card instead of sharing a plain result-screen screenshot.

This iteration should:

- replace the current placeholder secondary action with a real `Share` entry point
- generate a dedicated share-card preview instead of reusing the result page directly
- make the cat the visual hero of the share card
- make the score visually interact with the cat pose rather than sitting as an isolated number block
- vary the cat pose and score composition by score band

This iteration should not yet include:

- platform-specific social APIs
- remote image upload or cloud persistence
- a full template system for many cats or many card families
- complex video-like animations or recorded motion exports

## Product Direction

The share card should feel like a meme-friendly battle record, not a generic poster.

Chosen direction:

- use a dedicated share-card template rather than screenshotting the result page
- make the cat the first thing players notice
- let the score become an object the cat interacts with
- use score bands to change pose and composition rather than picking a fixed layout for every run

## Player-Facing Behavior

### Entry point

- the result page secondary action becomes `Share`
- tapping `Share` opens a share-card preview layer above the result page
- the player can dismiss the preview and return to the result page without losing state

### Preview flow

The MVP preview should provide:

- a large visual preview of the generated share card
- one save/export action
- one close/back action

The preview should not yet attempt direct posting to WeChat, X, or other platforms.

### Visual hierarchy

The share card should read in this order:

1. dynamic cat pose
2. score interacting with that cat pose
3. short share-line copy
4. supporting info such as `Peak Lv.` and `NEW BEST` badge
5. small product branding

## Score-Band Rules

Use three score bands.

### Low score band: `0 - 39,999`

- cat visually presses or steps on the score
- composition should feel playful and slightly self-mocking
- score remains readable but clearly treated as an object under the cat

### Mid score band: `40,000 - 99,999`

- cat and score appear in a balanced side-by-side interaction
- composition should feel confident and stable
- this is the default ¡°solid run¡± share pose

### High score band: `100,000+`

- cat visually lifts or presents the score above its head
- composition should feel more triumphant
- if `isNewBest` is also true, the badge treatment can intensify slightly, but the cat-score pose remains the primary signal

## Content Rules

### Required data

The share card should render from frozen result data only:

- `score`
- `peakLevel`
- `isNewBest`

No live gameplay state may continue changing the card after result mode activates.

### Copy

The copy should stay short and expressive.

MVP content blocks:

- one short score-band-dependent share line
- `Peak Lv.` as a compact supporting metric
- `NEW BEST` badge only when `isNewBest` is true
- `ZJU MERGE` brand mark or equivalent small footer mark

Copy should not become paragraph text or explain gameplay.

## Visual Design

### Template structure

The share card should be a separate template from the result poster.

Recommended structure:

- warm branded background with light texture or shape treatment
- central cat hero area
- score placed relative to the cat according to pose rules
- short copy line placed near the cat-score interaction cluster
- compact support row for `Peak Lv.` and `NEW BEST`
- small bottom brand mark

### Cat-first composition

The cat is the hero, not the score.

That means:

- the cat should occupy the largest visual mass
- score size remains large but must serve the cat interaction layout
- support text should never compete with the cat-score cluster

### Pose system

This iteration should implement a small pose system, not many unrelated templates.

Recommended first version:

- one shared card background and general spacing system
- three cat-score composition modes keyed by score band
- fixed art asset selection can stay simple in MVP, but layout logic should already support future pose expansion

## Architecture

### Boundary

Keep the current result architecture intact.

- `GameScene` continues freezing result data
- DOM result layer continues owning end-of-run foreground UI
- share-card generation becomes a new presentation concern that consumes frozen result payload

### New unit

Introduce a dedicated share-card presentation unit.

Responsibilities:

- map frozen result data into a score band
- choose the corresponding cat-score composition mode
- render the share-card preview
- provide save/export surface and close action

It should not own:

- gameplay mutation
- score calculation
- result freezing

### Policy split

The score-band rules and copy selection should live in a focused policy module rather than inside the result-page component.

Recommended policy responsibilities:

- score band classification
- pose mode selection
- short copy selection
- optional badge visibility helpers

## Export Behavior

MVP export behavior should be practical and local.

Preferred path:

- render the share card in a dedicated DOM preview layer
- provide a save/export action that converts the card into an image for local saving or sharing

If a browser capability fallback is needed, it should degrade to the simplest local-save path rather than blocking the feature entirely.

## Interaction Rules

- the share preview opens from the result layer and returns to it cleanly on close
- the result payload remains frozen while preview is open
- closing the preview must not reset the run
- restart remains available only after leaving the preview or from the result layer itself
- share preview controls must not leak gameplay interaction through to the board

## Testing

Add or update coverage for:

- score band classification for `0-39999`, `40000-99999`, and `100000+`
- correct pose/copy mode selection per band
- result page secondary action changes from placeholder to `Share`
- share preview opens from frozen result data and closes cleanly
- `NEW BEST` badge visibility follows `isNewBest`
- no gameplay/tool controls become active while share preview is open

## Success Criteria

This design is successful when:

- the generated card feels like a purpose-built share artifact rather than a screenshot
- the cat is the unmistakable visual hero
- the score meaningfully interacts with the cat pose
- low/mid/high score runs produce visibly different compositions
- the feature creates a clean bridge from result page to future viral loops without disturbing the gameplay architecture
