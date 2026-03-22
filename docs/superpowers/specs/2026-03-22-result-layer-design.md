# ZJU Cat Merge Result Layer Design

## Goal

Replace the current in-playfield game-over overlay with a dedicated result layer that feels like a proper end-of-run celebration sheet.

This iteration should:

- separate the result presentation from playfield HUD clutter
- make score the clear visual hero
- support different emotional states for new-best vs non-record runs
- preserve a faint memory of the finished board without letting it compete with the result layer

This iteration should not yet include:

- share actions
- leaderboard integration
- browser route changes or a separate HTML page
- extra reward systems or achievements beyond new-best presentation

## Product Direction

The result experience should feel like a standalone ending screen, not a warning card pasted on top of the board.

Chosen direction:

- use an in-game independent result layer or result scene
- keep only a faint playfield silhouette in the background
- treat the score as the primary headline
- visually celebrate only when the run sets a new best
- keep non-record runs clean and dignified rather than over-celebrated

## Player-Facing Behavior

### Transition

When the run ends:

1. gameplay freezes fully
2. tool buttons and in-playfield interaction visually step back
3. the finished board remains only as a subdued background memory
4. the dedicated result layer takes over the front-most visual hierarchy

### Result states

Two emotional variants are required.

#### New best run

- headline emphasizes that the player set a new best
- use brighter accent treatment and stronger celebratory emphasis
- score still remains the largest element on screen

#### Non-record run

- headline remains restrained, such as `Run Complete` or equivalent
- no forced celebration language
- the page should still feel polished and satisfying

### Information hierarchy

The result layer should prioritize these elements in order:

1. final score
2. run state headline (`New Best` or neutral completion message)
3. compact stat cards for `Score` and `Peak Lv.`
4. one clear primary action: `Restart`

### Background treatment

- keep a very faint silhouette of the finished board behind the result layer
- the board should feel distant and non-interactive
- tool buttons must visually fall behind the result layer rather than sitting beside it as peers

## Visual Design

### Layout

The result layer should behave like a centered poster sheet.

Recommended structure:

- subtle darkened background wash over the playfield
- one large central card with generous padding
- small eyebrow or status headline near the top
- oversized score block at the visual center
- two aligned stat cards beneath the main score
- one wide primary restart button at the bottom

### Scale

The current card is too small. The replacement should:

- be visibly larger than the current overlay
- have stronger outer margins from surrounding board clutter
- use larger internal spacing so text and stat blocks do not feel cramped

### Layering

- result card must render above all tool buttons and playfield clutter
- tool buttons should remain visible only as subdued background artifacts, or be dimmed enough that they no longer compete for attention
- restart is the only foreground action in this iteration

### Typography

- final score is the dominant type element
- supporting labels should be compact and quiet
- the page should avoid dense multi-line explanatory text
- if a short status line is used, keep it concise

## Architecture

### Integration approach

Do not build a browser-level separate page.

Instead:

- keep the game runtime inside the existing app shell
- introduce a dedicated result-layer component boundary inside the game presentation stack
- the gameplay scene should pass only the minimal end-of-run payload needed for rendering

Recommended payload:

- `score`
- `peakLevel`
- `isNewBest`

### Responsibilities

#### Gameplay scene

Owns:

- determining when the run is over
- freezing gameplay and score changes
- computing result data
- triggering result-layer visibility

Should not own:

- detailed end-screen layout logic
- long-form visual composition rules

#### Result layer

Owns:

- end-screen composition
- headline selection based on `isNewBest`
- score/stat rendering
- result-layer visibility and interaction surface

Should not own:

- gameplay state mutation beyond emitting `restart`

## State and Data

A persistent best-score source is now needed if it does not already exist.

This iteration should support:

- current run score
- current run peak level
- previous best score
- computed `isNewBest`

Behavior:

- `isNewBest` is true only when the finished run score exceeds the stored best
- once the run is over, score and peak-level values are frozen for the result layer
- restart clears the result layer and returns control to gameplay

## Interaction Rules

- once the result layer is visible, gameplay interaction remains locked
- tool buttons must not behave as active controls
- pointer input should be captured by the result layer or ignored outside the restart action
- restart remains the only supported foreground action in this phase

## Testing

Add or update coverage for:

- result layer visible only after game over
- score and peak level freeze once the run ends
- tool interactions do not react while the result layer is active
- restart cleanly exits the result layer and resets the run
- `isNewBest` correctly changes headline or celebration mode

## Success Criteria

This design is successful when:

- the end of a run feels like entering a distinct result state rather than reading a warning box
- the score is the first thing a player notices
- tool buttons no longer compete with the result presentation
- the result card feels large and intentional on mobile
- the layout can later absorb share or leaderboard actions without another redesign