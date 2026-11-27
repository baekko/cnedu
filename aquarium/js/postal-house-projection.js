// Left and right lot boundaries measured at rows 60 and 191 in each artwork.
// Front artwork meets the road at its bottom edge, rear artwork at the top.
const LOT_SIDES = [
  [12, 223, 3, 231], [11, 207, 3, 215], [11, 225, 3, 233], [11, 212, 6, 215],
  [16, 204, 4, 214], [13, 195, 3, 205], [14, 204, 6, 212], [13, 204, 5, 215],
  [11, 215, 4, 222], [10, 215, 3, 222], [9, 217, 3, 223], [9, 217, 4, 222],
  [13, 205, 3, 215], [10, 204, 3, 214], [13, 207, 4, 216], [11, 205, 3, 215],
];

// Two styles have photographed-looking diagonal eaves. Level the original
// roofs between stable garden/facade rows, preserving the textures and gates.
const ROOF_LINES = {
  2: { top: 23, eave: 57, topSlope: .148, eaveSlope: .046, upper: 0, lower: 70 },
  7: { top: 24, eave: 52, topSlope: -.149, eaveSlope: -.162, upper: 0, lower: 69 },
  10: { top: 92, eave: 130, topSlope: -.132, eaveSlope: -.090, upper: 54, lower: 143 },
  15: { top: 80, eave: 118, topSlope: .147, eaveSlope: .179, upper: 42, lower: 139 },
};

const cache = new WeakMap();

function canvasFor(source) {
  const canvas = document.createElement('canvas');
  canvas.width = source.width;
  canvas.height = source.height;
  return canvas;
}

function levelRoof(source, roof) {
  const canvas = canvasFor(source);
  const ctx = canvas.getContext('2d');
  const {width, height} = source;
  const {top, eave, topSlope, eaveSlope, upper, lower} = roof;
  if (upper > 0) ctx.drawImage(source, 0, 0, width, upper, 0, 0, width, upper);
  ctx.drawImage(source, 0, lower, width, height - lower, 0, lower, width, height - lower);
  for (let x = 0; x < width; x++) {
    const offset = x + .5 - width / 2;
    const originalTop = Math.max(upper + 1, top + topSlope * offset);
    const originalEave = Math.min(lower - 1, eave + eaveSlope * offset);
    ctx.drawImage(source, x, upper, 1, originalTop - upper, x, upper, 1, top - upper);
    ctx.drawImage(source, x, originalTop, 1, originalEave - originalTop, x, top, 1, eave - top);
    ctx.drawImage(source, x, originalEave, 1, lower - originalEave, x, eave, 1, lower - eave);
  }
  return canvas;
}

function straightenLot(source, style) {
  const {width, height} = source;
  const roof = ROOF_LINES[style];
  const artwork = roof ? levelRoof(source, roof) : source;
  const canvas = canvasFor(source);
  const ctx = canvas.getContext('2d');
  const [farLeft, farRight, nearLeft, nearRight] = LOT_SIDES[style];
  const margin = 4;
  for (let y = 0; y < height; y++) {
    const depth = (y + .5 - 60) / (191 - 60);
    const left = farLeft + (nearLeft - farLeft) * depth;
    const right = farRight + (nearRight - farRight) * depth;
    const scale = (width - 2 * margin) / (right - left);
    ctx.drawImage(artwork, 0, y, width, 1, margin - left * scale, y, width * scale, 1);
  }
  return canvas;
}

export function drawPostalHouseProjection(ctx, asset, style, {x, y, width, height}) {
  let artwork = cache.get(asset);
  if (!artwork) {
    artwork = straightenLot(asset, style);
    cache.set(asset, artwork);
  }
  ctx.drawImage(artwork, x + 1, y, width - 2, height);
}
