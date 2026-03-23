# ZJU Cat Merge High-Resolution Share Card Design

## Goal

Upgrade the current dynamic share-card flow from a functional prototype into a higher-quality export path with real cat art and noticeably sharper output.

This iteration should:

- replace the current placeholder cat rendering with real cat image assets for export and real cat frame assets for preview where available
- preserve the existing low/mid/high score-band composition logic
- keep the preview workflow intact while improving the exported output quality
- allow the preview and export layers to use different rendering techniques while sharing the same composition rules
- separate preview rendering from export rendering so the export no longer feels like a low-resolution page capture
- keep the `Share` interaction model unchanged: native share first, automatic download fallback

This iteration should not yet include:

- a fully new canvas-only share system
- remote image hosting or upload
- multiple cat families or many theme variants
- a new share flow entry point outside the result page

## Product Direction

The feature goal is no longer just “generate a share card.” It is to generate a share card that feels intentional enough to circulate.

Chosen direction:

- keep the current share preview UX and modal behavior
- introduce a dedicated high-resolution export rendering path
- use real cat assets as the share card hero instead of placeholder shapes
- preserve the meme-like score interaction by composition rather than by redrawing the whole feature from scratch

## Player-Facing Behavior

### Preview behavior

- the share preview still opens from the result layer
- the preview remains a strict modal above the result page
- the player still sees the card before exporting
- the preview may remain DOM-based and lightweight as long as it accurately reflects the composition rules

### Export behavior

- pressing `Share` should still be a single action
- export should generate a higher-resolution image than the on-screen preview size
- after export succeeds, the preview remains open and shows the same light success hint as the current share flow
- native share remains preferred when supported; download remains the automatic fallback

## Rendering Strategy

### Two-layer rendering model

Use separate rendering responsibilities for preview and export.

#### Preview layer

- optimized for interactive viewing inside the app
- continues using the current DOM-based layout
- may use a short multi-frame cat sequence from the same cat asset family to add lightweight motion
- should be visually faithful to the final exported composition
- does not need to equal final export pixel density

#### Export layer

- optimized for final image quality
- is explicitly allowed to use a dedicated export-only canvas renderer
- should render at a fixed high-resolution target
- should not depend on the currently displayed preview size on screen
- should produce a stable result across supported mobile browsers as much as practical
- uses a single static high-resolution cat image rather than preview motion frames

### Export resolution

MVP export target:

- aspect ratio: `9:16`
- fixed export size: `1080 x 1920`

This becomes the source image for native share or download.

## Cat Asset Strategy

### Real cat assets

This iteration should replace the placeholder cat art with real project cat assets.

Requirements:

- use a real cat image asset as the share-card hero in export output
- keep one clear hero cat path for MVP rather than introducing a large asset matrix
- support a matching preview asset family made of a few ordered frames for lightweight motion
- preserve future flexibility to add more pose-specific assets later

MVP asset contract:

- export hero asset: one static PNG with transparency, suitable for `1080 x 1920` card rendering
- preview hero assets: a small ordered frame set from the same cat family, also with transparency
- if the real asset or preview frames fail to load, fall back to the current placeholder cat rendering rather than breaking share

### Pose implementation for MVP

Do not block the feature on having three perfect pose illustrations.

Recommended first version:

- use one real primary cat asset family
- preview uses lightweight frame switching from that family
- export uses one corresponding static hero image from that family
- vary layout through position, scale, rotation, and score anchor rules per band
- if additional real pose-specific assets already exist, they may be used, but they are not required for MVP

This keeps the score-band logic intact:

- low band: score under the cat / stepped-on feel
- mid band: score beside the cat / balanced feel
- high band: score above the cat / lifted feel

## Visual Design

### Fidelity target

The result should stop looking like a blurry web screenshot.

That means:

- the exported card must be generated from a fixed-resolution surface
- text should remain crisp at the export size
- cat art should not be stretched beyond its acceptable source quality
- gradients, shadows, and badges should survive export without visibly collapsing

### Safe area

The `1080 x 1920` card should reserve clear margins so platform crops or UI overlays do not break legibility.

Requirements:

- keep all critical content inside a stable inner safe area
- use a default safe-area inset of `96px` left/right and `120px` top/bottom on the `1080 x 1920` export surface
- score, cat face, badge, and short copy must all sit within that safe area
- footer branding should remain visible without competing with the hero composition

## Architecture

### Existing boundaries remain

- gameplay still freezes result data
- the DOM result layer still owns end-of-run UI
- the share flow still starts from the result page

### New export boundary

Introduce a dedicated export rendering unit separate from the lightweight preview unit. Preview remains DOM-driven; export is allowed to be canvas-driven.

Responsibilities of the export renderer:

- consume the existing share-card view model
- render a fixed `1080 x 1920` card with real cat assets
- return an image blob suitable for native share or download

It should not own:

- score-band classification
- result freezing
- result-layer UI state

### Policy remains authoritative

The existing `shareCardPolicy` remains the single source of pose/composition intent.

It should continue deciding:

- score band
- pose mode
- score anchor
- short copy
- badge visibility intent

The new high-resolution export renderer should only interpret that model at a larger resolution.

## Export Pipeline

Preferred approach:

- keep the preview renderer for UI
- add a dedicated export renderer that creates a larger off-screen canvas target
- generate the final image blob from that off-screen target
- pass that blob into the existing native-share-first export path
- if real cat assets are unavailable during export, degrade to a placeholder-cat export card rather than failing the share action

This avoids tying final image sharpness to viewport size.

## Testing

Add or update coverage for:

- export renderer uses fixed `1080 x 1920` output sizing
- export path no longer depends on the preview element size for final image dimensions
- preview and export stay compositionally aligned, with only small detail-level differences allowed
- real cat asset path is used instead of placeholder cat text/shape rendering when assets are available
- placeholder-cat fallback still produces a working export when real assets fail to load
- low/mid/high score-band composition rules still map correctly with the real cat asset
- native share / download fallback still work with the new high-resolution export blob

## Success Criteria

This design is successful when:

- the exported image looks materially sharper than the current DOM-capture result
- the cat hero is a real project asset rather than a placeholder graphic
- the score still visibly interacts with the cat according to score band
- the preview flow remains familiar while the exported output quality clearly improves
- the architecture stays extensible for future richer share templates without rewriting result flow again
