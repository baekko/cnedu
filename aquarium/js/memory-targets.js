export const MEMORY_CELL = 4;
export const MEMORY_MARK_RADIUS = 22;
export const MEMORY_MARK_INSET = MEMORY_MARK_RADIUS + 6;

const decodedRegions = new WeakMap();

function regionValue(spot, point) {
 const [left, top, width, height, encoded] = spot.region;
 const x = Math.floor(point.x / MEMORY_CELL) - left;
 const y = Math.floor(point.y / MEMORY_CELL) - top;
 if (x < 0 || x >= width || y < 0 || y >= height) return 0;
 let bytes = decodedRegions.get(spot);
 if (!bytes) {
  bytes = atob(encoded);
  decodedRegions.set(spot, bytes);
 }
 const index = y * width + x;
 return (bytes.charCodeAt(index >> 2) >> ((index & 3) * 2)) & 3;
}

// A change itself takes priority over the small touch margin of a neighbor.
export function memorySpotAt(spots, point) {
 let match = null, priority = 0, distance = Infinity;
 for (const spot of spots) {
  const value = regionValue(spot, point);
  if (!value || value < priority) continue;
  const delta = (point.x - spot.mark[0]) ** 2 + (point.y - spot.mark[1]) ** 2;
  if (value > priority || delta < distance) {
   match = spot;
   priority = value;
   distance = delta;
  }
 }
 return match;
}
