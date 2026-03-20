# ZJU Cat Merge Asset Guidelines

## Runtime Naming Rule

The game displays cat progression externally as `Lv.1` through `Lv.12`.

- Do not assign public meme names to the 12 runtime cats in V1.
- Any internal notes or nickname labels must remain optional metadata, not user-facing canonical names.
- The core progression identity is the level number plus the visual cat expression.

## Selected Main Chain

### Primary Mapping

- `Lv.1` -> source `1739669151740.gif` (candidate 15)
- `Lv.2` -> source `1739669468684.gif` (candidate 18)
- `Lv.3` -> source `1739669272399.gif` (candidate 22)
- `Lv.4` -> source `1739677373999.gif` (candidate 29)
- `Lv.5` -> source `1739669511858.gif` (candidate 03)
- `Lv.6` -> source `1739669611997.gif` (candidate 16)
- `Lv.7` -> source `1739669329312.gif` (candidate 11)
- `Lv.8` -> source `1739670504608.gif` (candidate 08)
- `Lv.9` -> source `1739669761027.gif` (candidate 09)
- `Lv.10` -> source `1739670687306.gif` (candidate 02)
- `Lv.11` -> source `1739670476430.gif` (candidate 04)
- `Lv.12` -> source `1739670012601.gif` (candidate 01)

### Backup Pool

- `1739670003873.gif` (candidate 14)
- `1739669996873.gif` (candidate 17)
- `1739670738094.gif` (candidate 23)
- `2458469307.gif` (candidate 31)
- `1739673225182.gif` (candidate 40)
- `1739675834438.gif` (candidate 48)

## Selection Logic

Primary-chain assets should favor:

- Cat silhouette remains readable after square framing
- Face or body posture still reads clearly at gameplay scale
- Subject is centered enough for circular-body composition
- Image still works when stacked tightly with other cats

Avoid for the main chain:

- Non-cat or ambiguous subjects
- Extreme close-ups with poor silhouette
- Wide horizontal crops that collapse badly into a square
- Meme screenshots where the cat is not the dominant readable subject
- Tiny low-resolution stickers that cannot scale cleanly

## Raw Asset Structure

- Keep original uploads in `assets/raw-gifs/`
- Copy approved source GIFs into `assets/selected-gifs/`
- Export runtime assets into `public/assets/cats/`

## PNG Export Rules

- Export filenames: `cat-1.png` through `cat-12.png`
- Use transparent background only
- Use a square working canvas, default target `512x512`
- Keep subject visually centered
- Subject should occupy roughly `78%-86%` of the canvas
- Do not add base plates, borders, or baked labels
- Do not redraw the cat with code at runtime

## Frame Selection Rule

- Default to the most representative frame, not automatically frame 0
- Choose the frame with the cleanest expression, strongest silhouette, and least motion blur
- For future animated support, keep a record of the chosen still frame index per source GIF

## Future Animated Upgrade Rule

- Runtime level numbering must remain stable
- If animation is added later, extend the asset form, not the level identity
- Acceptable future forms include `cat-1.gif`, `cat-1.webp`, or sprite-derived exports
- Do not rename or reshuffle level IDs after launch unless the whole progression table is intentionally rebuilt
