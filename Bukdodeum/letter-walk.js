const SIZE = 256;
const DRAWN_HEIGHT = 216;
const ANCHOR_X = 128;
const SOLE_Y = 236;

const STEPS = [
 {length:78, frame:0, lead:169, advances:[0,28,45,70]},
 {length:87, frame:4, lead:175, advances:[0,32,43,79]},
];
const CYCLE = STEPS[0].length + STEPS[1].length;

export function letterWalkFrame(distance, height) {
 const scale = height / DRAWN_HEIGHT;
 const travel = Math.max(0, distance) / scale;
 const phase = travel % CYCLE;
 const left = phase >= STEPS[0].length;
 const step = STEPS[Number(left)];
 const elapsed = left ? phase - STEPS[0].length : phase;
 let pose = 0;
 while (pose < 3 && elapsed >= (step.advances[pose] + step.advances[pose + 1]) / 2) pose++;
 return {
  frame: step.frame + pose,
  offset: (step.advances[pose] - elapsed) * scale,
  sole: step.lead - step.advances[pose],
  scale,
 };
}

export function drawLetterWalk(ctx, atlas, {distance, x, floor, height}) {
 if (!atlas) return;
 const {frame,offset,sole,scale} = letterWalkFrame(distance,height);
 const left = x + offset - ANCHOR_X * scale;
 const width = SIZE * scale;
 ctx.save();
 ctx.fillStyle = 'rgba(67,43,34,.18)';
 ctx.beginPath();
 ctx.ellipse(left + sole * scale, floor + 1, height * .15, height * .023, 0, 0, Math.PI * 2);
 ctx.fill();
 ctx.drawImage(atlas,frame % 4 * SIZE,Math.floor(frame / 4) * SIZE,SIZE,SIZE,
  left,floor - SOLE_Y * scale,width,width);
 ctx.restore();
}
