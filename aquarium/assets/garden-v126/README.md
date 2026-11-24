# Gardener helper sprite · v126

- Created with the built-in image generation tool for the approved one-use gardener-call item.
- Style references: `docs/art-source/hero-v10/haru-idle.webp`, `dist/assets/garden-v123/room0.webp`. Neither reference was modified.
- Original generation: 1448 × 1086 RGBA, true alpha, 4 × 3 cells.
- Runtime atlas: `gardener.webp`, 1024 × 768 RGBA lossless WebP, 256 × 256 cells; 333,986 bytes.
- `gardener.json` supplies source rectangles, normalized feet (128,238), visible bounds, animation rows and approximate connected nozzle anchors. `referenceHeight: 210`; suggested world height: 64 pixels.
- All twelve crops are nonempty and lie inside their cells. Inspected on a solid warm background for alpha artifacts. No flowers, leaves, vines, room background, labels or numbers were added.
- Row 0 is a short illustrative four-pose step sequence; it is not a verified full alternating-leg locomotion cycle. Use for brief approaches. Rows 1 and 2 are connected-body tending and trigger/spray poses. Mirror a whole pose when needed, rather than detached limbs.

## Generation brief

Create one consistent adult Korean gardener with an earthy sage apron, ivory rolled-sleeve shirt, brown trousers/shoes and simple tan hat in the established storybook game style. Transparent 4 × 3 sprite sheet: four upper-right walking poses, four upper-right tending poses using a small hand brush, four upper-left spraying poses holding the bottle in the connected hands. Keep equal scale and stable feet, normal connected anatomy, soft thin contour, readable painted detail. No text, grids, plants, decorative leaves/vines, ground or detached shadows.

Only atlas packing, equal-scale resizing and foot-anchor normalization were performed after generation.
