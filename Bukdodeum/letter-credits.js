import { drawLetterWalk } from './letter-walk.js';

const W = 768;
const H = 512;
const files = {
 room: 'v16/room.webp',
 roomDusk: 'v16/room-dusk.webp',
 corridor: 'v8/corridor.webp',
 shelf: 'v14/shelf.webp',
 windowDay: 'v14/window-day.webp',
 windowDusk: 'v14/window-dusk.webp',
 windowRead: 'v15/window-read.png',
 windowWrite: 'v15/window-write.png',
 walk: 'v16/walk.png',
 transfer: 'v14/transfer.png',
 counterFront: 'v17/counter-front.webp',
 actions: 'v14/actions.png',
};
export const LETTER_CREDITS_ASSETS = Object.values(files).map(file => 'assets/cinema/' + file);
const bank = new Map();
const pending = new Map();

export function loadLetterCredits() {
 return Promise.all(Object.entries(files).map(([key, file]) => {
  if (bank.has(key)) return;
  if (pending.has(key)) return pending.get(key);
  const im = new Image();
  im.src = new URL('./assets/cinema/' + file, import.meta.url).href;
  const decoded = im.decode().then(() => { bank.set(key, im); })
   .catch(() => { throw new Error('편지 크레딧: ' + file); })
   .finally(() => { pending.delete(key); });
  pending.set(key, decoded);
  return decoded;
 }));
}

const clamp = (n, a = 0, b = 1) => Math.max(a, Math.min(b, n));
function background(ctx, key) {
 const im = bank.get(key);
 if (!im) return;
 ctx.imageSmoothingEnabled = true;
 ctx.drawImage(im, 0, 0, W, H);
 ctx.imageSmoothingEnabled = false;
}
function polygon(ctx, points) {
 ctx.beginPath();
 ctx.moveTo(...points[0]);
 for (const point of points.slice(1)) ctx.lineTo(...point);
 ctx.closePath();
 ctx.clip();
}
function foreground(ctx, key, points) {
 ctx.save();
 polygon(ctx, points);
 background(ctx, key);
 ctx.restore();
}
function cell(ctx, key, frame, x, y, size, flip = false) {
 const im = bank.get(key);
 if (!im) return;
 const cols = key === 'windowRead' || key === 'windowWrite' ? 2 : 4;
 const row = Math.floor(frame / cols);
 // The action poses straddle the nominal atlas rows by a few pixels.
 const actionRows = [[16, 241], [272, 244], [528, 245], [804, 185]];
 const [sourceY, sourceHeight] = key === 'actions' ? actionRows[row] : [row * 256, 256];
 ctx.save();
 ctx.translate(Math.round(x), Math.round(y));
 if (flip) {
  ctx.translate(size, 0);
  ctx.scale(-1, 1);
 }
 ctx.drawImage(im, frame % cols * 256, sourceY, 256, sourceHeight, 0, 0, size, Math.round(size * sourceHeight / 256));
 ctx.restore();
}

function corridor(ctx, t) {
 background(ctx, 'corridor');
 ctx.save();
 ctx.fillStyle = '#633d24';
 ctx.textAlign = 'center';
 ctx.textBaseline = 'middle';
 ctx.font = 'bold 20px sans-serif';
 ctx.fillText('도서관', 634, 37);
 ctx.restore();

 const distance = 530 * clamp(t / 3.8);
 drawLetterWalk(ctx, bank.get('walk'), {distance, x:70 + distance, floor:468, height:228});
}

const SERVICE_DESK = [[165,282],[212,276],[429,276],[456,266],[478,266],[477,339],[446,367],[166,349]];
const COUNTER_POSE = {x:367,y:201,size:144};
const COUNTER_FLOOR = 338;
const GIRL_HEIGHT = 123;
const FRONT_POSE = {x:357,y:194,width:171,height:226};
function atCounter(ctx, frame) {
 const {x,y,size} = COUNTER_POSE;
 cell(ctx, 'transfer', frame, x, y, size);
}
function transfer(ctx, t, returning = false) {
 const progress = clamp((t - .35) / 1.8);
 const frame = Math.floor(progress * 15);
 const pose = returning ? 15 - frame : frame;
 const {x,y,width,height} = FRONT_POSE;
 ctx.save();
 ctx.translate(384,256);
 ctx.scale(1.32,1.32);
 ctx.translate(-418,-268);
 background(ctx,returning ? 'roomDusk' : 'room');
 // Show both the front face of the counter and the student's feet in the public aisle.
 ctx.fillStyle='rgba(65,41,35,.17)';
 ctx.beginPath();
 ctx.ellipse(473,385,14,4,0,0,Math.PI*2);
 ctx.fill();
 if (returning) ctx.filter='sepia(0.14) brightness(0.92)';
 ctx.drawImage(bank.get('counterFront'),pose % 4 * width,Math.floor(pose / 4) * height,width,height,x,y,width,height);
 ctx.restore();
}
function book(ctx, t) {
 background(ctx, 'shelf');
 const stops = [0, .48, .75, 1.12, 1.56, 1.93, 2.22, 2.55];
 let frame = 0;
 stops.forEach((start, i) => { if (t >= start) frame = i; });
 const shelf = bank.get('shelf');
 if (shelf) {
  // The selected book sits on the row the hand can reach, then travels with the hand.
  ctx.drawImage(shelf, 462, 189, 17, 53, 441, 189, 17, 53);
  if (frame === 0) ctx.drawImage(shelf, 441, 192, 17, 48, 442, 255, 17, 48);
 }
 cell(ctx, 'actions', frame, 228, 132, 351, true);
}

const DAY_CHAIR = [[414,290],[425,281],[478,272],[489,278],[490,373],[478,384],[414,395]];
const DUSK_CHAIR = [[415,295],[422,285],[480,279],[490,281],[492,287],[490,374],[480,382],[415,392]];
const SEATED = {x:245, floor:466, size:284};
function seated(ctx, key, chair, drawStudent) {
 background(ctx, key);
 const {x,floor,size} = SEATED;
 // Register both complete poses at the shoe soles; the chair back occludes the same seat.
 ctx.fillStyle = 'rgba(74,47,33,.19)';
 ctx.beginPath();
 ctx.ellipse(347,floor,30,4,0,0,Math.PI*2);
 ctx.fill();
 ctx.save();
 ctx.translate(x, Math.round(floor - 243 * size / 256));
 ctx.scale(size / 256, size / 256);
 drawStudent(ctx);
 ctx.restore();
 foreground(ctx, key, chair);
}
function reading(ctx, t) {
 const frame = t < 1.6 ? 0 : t < 1.86 ? 1 : t < 2.12 ? 2 : 3;
 seated(ctx, 'windowDay', DAY_CHAIR, ctx => cell(ctx, 'windowRead', frame, 0, 0, 256));
}
const INK_ROWS = [
 {time:.6, strokes:[[69,94,74,94],[76,94,82,94],[86,94,94,94]]},
 {time:3, strokes:[[75,99,80,99],[82,99,89,99],[91,98,96,98]]},
];
const PENCIL_SHAFT = {x:90,y:64,width:14,height:14,pivotX:94,pivotY:78};
const INK_ROW_SECONDS = 1.42;
function writing(ctx, t) {
 seated(ctx, 'windowDusk', DUSK_CHAIR, ctx => {
  const {x,y,width,height,pivotX,pivotY} = PENCIL_SHAFT;
  const pen = bank.get('windowWrite');
  const row = INK_ROWS.find(row => t >= row.time && t < row.time + INK_ROW_SECONDS);
  const strokePhase = row ? ((t - row.time) / INK_ROW_SECONDS * row.strokes.length) % 1 : 0;
  // Hold the hand, sleeve and paper in one pose. Only the pencil above the grip pivots.
  ctx.save();
  ctx.beginPath();
  ctx.rect(0,0,256,256);
  ctx.rect(x,y,width,height);
  ctx.clip('evenodd');
  cell(ctx, 'windowWrite', 0, 0, 0, 256);
  ctx.restore();

  if (pen) {
   ctx.save();
   ctx.translate(pivotX,pivotY);
   ctx.rotate(.13 * Math.sin(strokePhase * Math.PI));
   ctx.drawImage(pen,x,y,width,height,x-pivotX,y-pivotY,width,height);
   ctx.restore();
  }

  ctx.strokeStyle = 'rgba(82,63,59,.56)';
  ctx.lineWidth = 1;
  for (const row of INK_ROWS) {
   const written = clamp((t - row.time) / INK_ROW_SECONDS) * row.strokes.length;
   row.strokes.forEach(([x1,y1,x2,y2], index) => {
    const length = clamp(written - index);
    if (length === 0) return;
    ctx.beginPath();
    ctx.moveTo(x1,y1);
    ctx.lineTo(x1 + (x2-x1)*length,y1 + (y2-y1)*length);
    ctx.stroke();
   });
  }
 });
}

function departure(ctx, t) {
 background(ctx, 'roomDusk');
 ctx.save();
 polygon(ctx, [[352,190],[460,190],[460,370],[352,370]]);
 atCounter(ctx, 1);
 ctx.restore();
 foreground(ctx, 'roomDusk', SERVICE_DESK);

 const distance = 261 * clamp(t / 3.9);
 ctx.save();
 // The door jamb masks the figure after the doorway at a constant projected height.
 ctx.beginPath();
 ctx.rect(0,0,709,H);
 ctx.clip();
 drawLetterWalk(ctx, bank.get('walk'), {distance,x:487 + distance,floor:COUNTER_FLOOR,height:GIRL_HEIGHT});
 ctx.restore();
}
function transition(ctx, t) {
 for (const time of [4, 8, 12, 18, 23, 26]) {
  const opacity = 1 - Math.abs(t - time) / .13;
  if (opacity <= 0) continue;
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = '#fff2d8';
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
 }
}
let pixels;
export function drawLetterCredits(output, time) {
 // All artwork, props and joints are composed on one pixel grid before scaling.
 pixels ||= Object.assign(document.createElement('canvas'), {width:W/2,height:H/2});
 const ctx = pixels.getContext('2d');
 const t = clamp(time, 0, 30);
 ctx.setTransform(.5,0,0,.5,0,0);
 ctx.imageSmoothingEnabled = false;
 ctx.clearRect(0,0,W,H);
 if (t < 4) corridor(ctx, t);
 else if (t < 8) transfer(ctx, t - 4);
 else if (t < 12) book(ctx, t - 8);
 else if (t < 18) reading(ctx, t - 12);
 else if (t < 23) writing(ctx, t - 18);
 else if (t < 26) transfer(ctx, t - 23, true);
 else departure(ctx, t - 26);
 transition(ctx, t);
 output.save();
 output.imageSmoothingEnabled = false;
 output.drawImage(pixels,0,0,W,H);
 output.restore();
}
