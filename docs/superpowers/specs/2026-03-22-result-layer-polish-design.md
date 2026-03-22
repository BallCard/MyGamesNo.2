# ZJU Cat Merge Result Layer Polish Design

## Goal

Refine the new DOM result layer from a stable architecture checkpoint into a polished poster-style end screen that still preserves room for future expansion.

This iteration should:

- strengthen the poster feeling of the result layer
- keep the score as the unquestioned visual hero
- make `NEW BEST` feel meaningfully celebratory while keeping normal runs restrained
- introduce a two-slot action area so the layout can grow later without being redesigned again
- keep the current architecture boundary intact: gameplay data in Phaser, front-most result UI in DOM

This iteration should not yet include:

- a real share flow
- a real leaderboard button
- new routes or browser-level page transitions
- additional progression systems or rewards

## Product Direction

The result layer should feel like a celebratory score poster with a light product skeleton underneath it.

Chosen direction:

- preserve the poster-sheet feeling rather than turning the screen into a utility panel
- treat the bottom action area as future-facing structure, not as extra functionality in this iteration
- keep the screen emotionally expressive, but avoid noisy text or too many widgets

## Player-Facing Behavior

### Emotional split

Two variants remain required.

#### New best run

- use a brighter eyebrow treatment and slightly richer visual emphasis
- retain score as the largest element
- the mood should feel rewarding without turning into a fireworks screen

#### Normal run

- use restrained wording such as `RUN COMPLETE`
- maintain the same layout and dignity
- avoid fake celebration language

### Information hierarchy

The result layer should still read in this order:

1. final score as the largest and fastest-readable element
2. headline mood marker (`NEW BEST` or `RUN COMPLETE`) as a compact emotional cue above it
3. one short supporting label (`PERSONAL BEST` or `FINAL SCORE`)
4. two stat cards: `Score` and `Peak Lv.`
5. two-slot action area with one real action and one neutral placeholder

### Action area

The bottom action zone should become a stable two-slot layout.

- primary slot: `Restart`, fully interactive
- secondary slot: a neutral placeholder button style, visually present but disabled
- placeholder copy should stay generic, using `More Soon` for now
- placeholder must not imply a committed feature direction yet
- placeholder exists to establish future layout balance for share or leaderboard actions
- placeholder must render with `aria-disabled="true"`, stay out of the tab order, and emit no commands

## Visual Design

### Poster card

The result card should feel larger, calmer, and more deliberate than the current checkpoint.

Required changes:

- increase card scale slightly on mobile
- add more vertical breathing room above the eyebrow and below the action area
- make the bottom section deep enough that the primary button never feels pressed against the card edge
- keep the card centered and dominant against the faded board silhouette

### Score treatment

The score remains the hero.

- it should be the first readable object on screen
- its scale should clearly dominate headline, labels, and stat values
- spacing around the score should feel premium rather than packed

### Stat cards

The stat cards should read like badges embedded into the poster, not table cells.

- keep exactly two cards
- preserve strong alignment and equal size
- slightly soften their visual weight compared with the main score block
- maintain fast scan readability on mobile

### Action row

The action row should feel intentional even before the second action is implemented.

- place two aligned slots in a single row for the standard mobile layout
- if horizontal space becomes too tight, keep equal widths by reducing internal padding first rather than wrapping into two rows in this iteration
- keep `Restart` visually primary
- make the placeholder subdued, disabled, and clearly non-interactive
- do not add explanatory copy below the buttons

### Background and layering

- retain the faint board silhouette as a memory of the finished run
- keep the board non-competitive and visually distant
- result layer must remain above all active controls
- no gameplay or tool control should visually read as foreground once result mode is active

## Architecture

### Boundary stays the same

This iteration should refine presentation, not alter the checkpoint architecture.

- Phaser gameplay layer owns danger, score, result freezing, and restart reset
- DOM HUD layer owns persistent HUD rendering
- DOM result layer owns the end-screen foreground composition

During result mode, foreground ownership must be singular:

- the DOM result layer owns the hero score presentation and all foreground result messaging
- the persistent header may remain mounted only as a background shell, never as a competing foreground score surface
- if the header score remains visible, it must mirror the same frozen payload and be visually subordinate to the result card

### Single source of truth

The result layer should continue to render from one frozen payload only.

Payload remains:

- `score`
- `peakLevel`
- `isNewBest`

That payload is the only allowed source for result-mode score display. This means:

- the poster card hero score reads only from the frozen payload
- any header score that remains visible must mirror that same frozen payload
- no live gameplay score or peak-level state may continue updating once result mode begins

### Expansion seam

The new two-slot action row is an intentional seam for future work.

Later features may replace the placeholder with:

- share
- leaderboard
- extra replay mode

This iteration should only establish the seam, not implement those actions.

## Interaction Rules

- once result mode is active, only `Restart` remains actionable in the foreground
- placeholder action must be visibly disabled and must not emit commands
- tool buttons remain hidden or fully backgrounded with no active behavior
- no score changes or gameplay state changes may continue after result mode activates

## Testing

Add or preserve coverage for:

- result overlay rendering in result mode
- primary action still wired to restart
- placeholder action renders as disabled and is not bound to gameplay commands
- tool buttons are not rendered in result mode
- header score matches frozen result payload while result mode is active

## Success Criteria

This refinement is successful when:

- the result screen feels more like a score poster than a temporary overlay
- the layout already looks ready for future actions without adding clutter now
- the bottom section has enough space to feel intentional on mobile
- `Restart` is clear and dominant while the second slot feels reserved, not broken
- the architecture does not regress back into mixed foreground ownership between Phaser and DOM
