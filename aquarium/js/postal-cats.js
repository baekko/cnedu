const POSE_COLUMNS = 4;
const SPRITE_SIZE = 36;
const WALK_SPEED = 13;
const REST_POSES = [
  [4, .35], [5, 1.5], [6, 2.15], [5, 2.85], [7, 4.55],
  [4, 4.85], [8, 5.04], [9, 5.30], [10, 5.84], [11, 6.11], [4, 6.32],
];

export function postalCatPose(cat, time) {
  const {x, roam = 0, variant = 0} = cat;
  const walkTime = roam * 2 / WALK_SPEED;
  const legTime = walkTime + REST_POSES.at(-1)[1];
  const cycle = (time + x * .37 + cat.y * .17 + variant * 2.7) % (legTime * 2);
  const left = cycle >= legTime;
  const phase = cycle - (left ? legTime : 0);
  if (phase < walkTime) {
    const distance = phase * WALK_SPEED;
    return {x: x + (left ? roam - distance : distance - roam), left, frame: Math.floor(distance / 2.5) % 4};
  }
  const rest = REST_POSES.find(([, end]) => phase - walkTime < end);
  return {x: x + (left ? -roam : roam), left, frame: rest?.[0] ?? 4};
}

export function drawPostalCat(c, asset, cat, pose) {
  const tile = asset.width / POSE_COLUMNS;
  const coat = (cat.variant ?? 0) % 3;
  const row = coat * 3 + Math.floor(pose.frame / POSE_COLUMNS);
  const column = pose.frame % POSE_COLUMNS;
  c.save();
  c.translate(pose.x, cat.y);
  if (pose.left) c.scale(-1, 1);
  c.drawImage(asset, column * tile, row * tile, tile, tile,
    -SPRITE_SIZE / 2, -SPRITE_SIZE * .87, SPRITE_SIZE, SPRITE_SIZE);
  c.restore();
}
