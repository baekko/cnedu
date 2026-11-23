/**
 * Opening-only motion on the centre of the mirror's stone bridge.
 * The existing whole-body drawings are never split into independent limbs.
 * Depth, apparent size and the ground point share one pinhole projection.
 */
export const RABBIT_OPENING_TIMING = Object.freeze({
  approachStart: 1.6,
  approachEnd: 5.1,
  greetingEnd: 8.3, // The original 1.2-second greeting, plus the requested two seconds.
  turnEnd: 8.8,
  departureEnd: 12.3,
  titleStart: 12.4,
  titleFull: 13.2,
  end: 14.5,
});

const HORIZON_Y = 153;
const NEAR_GROUND_Y = 445;
const NEAR_SIZE = 320;
const FAR_SIZE = 24;
const HOPS = 7;
const TAKEOFF = .18;
const TOUCHDOWN = .8;
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const lerp = (a, b, amount) => a + (b - a) * amount;
const smooth = value => { const p = clamp(value); return p * p * (3 - 2 * p); };

// Bottom edge of the opaque hind soles in each 256px authored frame.
// Rear flight frames already sit higher in their source cells. Registering
// their soles here removes that baked offset before applying ONE flight arc.
const DEPTH_SOLES = Object.freeze([
  245, 245, 245, 245, 245, 245, 245, 245,
  236, 236, 236, 208, 200, 234, 237, 237,
]);
const TURN_SOLES = Object.freeze([244, 245, 244, 245]);

// Progressively shorter world strides let the rabbit slow as it reaches us.
// They are world-depth coordinates, not independent size/y animation tracks.
const DEPTH_STOPS = Object.freeze([NEAR_SIZE / FAR_SIZE, 8.4, 5.4, 3.6, 2.5, 1.8, 1.33, 1]);

function projected(depth) {
  return {
    x: 384,
    groundY: HORIZON_Y + (NEAR_GROUND_Y - HORIZON_Y) / depth,
    size: NEAR_SIZE / depth,
    depth,
  };
}

function actor(sprite, frame, depth, extra = {}) {
  return {
    ...projected(depth),
    sprite,
    frame,
    anchor: [128, sprite === 'turn' ? TURN_SOLES[frame] : DEPTH_SOLES[frame]],
    air: 0,
    grounded: true,
    visible: true,
    ...extra,
  };
}

function hopFrame(phase) {
  if (phase < .12) return 1; // hind legs compress; soles remain planted
  if (phase < TAKEOFF) return 0; // thrust from those same planted feet
  if (phase < .34) return 2; // extension just after takeoff
  if (phase < .5) return 3; // tuck on ascent
  if (phase < .64) return 4; // tucked at / just after the apex
  if (phase < TOUCHDOWN) return 5; // unfold both hind feet for landing
  if (phase < .91) return 6; // absorb the landing at its fixed ground point
  return 7; // recover before the next crouch
}

// During approach the forepaws catch the landing before the hind feet gather.
function frontHopFrame(phase) {
  if (phase < .12) return 1;
  if (phase < .30) return 0;
  if (phase < .43) return 2;
  if (phase < .58) return 3;
  if (phase < .70) return 4;
  if (phase < .86) return 5;
  if (phase < .94) return 6;
  return 7;
}

function hop(local, duration, departing) {
  const progress = clamp(local / duration);
  if (progress === 1) {
    return actor('depth', departing ? 15 : 7, departing ? DEPTH_STOPS[0] : 1, {
      phase: departing ? 'departing' : 'approaching',
      hop: HOPS - 1,
      hopPhase: 1,
    });
  }
  const cycle = progress * HOPS;
  const index = Math.floor(cycle);
  const phase = cycle - index;
  const from = departing ? DEPTH_STOPS[HOPS - index] : DEPTH_STOPS[index];
  const to = departing ? DEPTH_STOPS[HOPS - index - 1] : DEPTH_STOPS[index + 1];
  const flight = clamp((phase - TAKEOFF) / (TOUCHDOWN - TAKEOFF));
  const depth = lerp(from, to, flight);
  const pose = actor('depth', departing ? 8 + hopFrame(phase) : frontHopFrame(phase), depth, {
    phase: departing ? 'departing' : 'approaching',
    hop: index,
    hopPhase: phase,
    grounded: phase <= TAKEOFF || phase >= TOUCHDOWN,
  });
  // A ballistic arc in world height, projected by the same depth as the body.
  // Ground motion is exactly zero during compression, thrust and recovery.
  pose.air = 38 * 4 * flight * (1 - flight) / depth;
  return pose;
}

/** Pure, seekable opening state. No influence on portal, reward or credits. */
export function rabbitOpeningState(time = 0) {
  const t = Number.isFinite(time) ? Math.max(0, time) : 0;
  const timing = RABBIT_OPENING_TIMING;
  let state;
  if (t < timing.approachStart) {
    state = actor('depth', 7, DEPTH_STOPS[0], { phase: 'waiting' });
  } else if (t < timing.approachEnd) {
    state = hop(t - timing.approachStart, timing.approachEnd - timing.approachStart, false);
  } else if (t < timing.greetingEnd) {
    const local = t - timing.approachEnd;
    // Two unhurried greetings; one intact waving pose alternates with rest.
    const waving = (local >= .2 && local < .95) || (local >= 1.35 && local < 1.8);
    state = actor(local < .2 ? 'depth' : 'turn', local < .2 ? 7 : waving ? 0 : 1, 1, { phase: 'greeting' });
  } else if (t < timing.turnEnd) {
    const local = t - timing.greetingEnd;
    state = local < .2
      ? actor('turn', 2, 1, { phase: 'turning' })
      : local < .4
        ? actor('turn', 3, 1, { phase: 'turning' })
        : actor('depth', 8, 1, { phase: 'turning' });
  } else if (t < timing.departureEnd) {
    state = hop(t - timing.turnEnd, timing.departureEnd - timing.turnEnd, true);
  } else {
    // Remain at the remote end until the title begins; never fade mid-bridge.
    state = actor('depth', 15, DEPTH_STOPS[0], { phase: 'finished', visible: t < timing.titleStart });
  }
  state.titleAlpha = smooth((t - timing.titleStart) / (timing.titleFull - timing.titleStart));
  return state;
}

// The rear set was authored with a grayer palette than the turn poses.
// Match its fur palette at render time; registration, alpha and anatomy stay intact.
const rearBanks = new WeakMap();
function matchedRearAtlas(image) {
  if(rearBanks.has(image)) return rearBanks.get(image);
  const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;
  const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);
  const frame=ctx.getImageData(0,512,image.width,image.height-512),p=frame.data;
  for(let i=0;i<p.length;i+=4){const r=p[i],g=p[i+1],b=p[i+2];if(p[i+3]>128&&r>105&&b>105&&r>g+12&&b>g+12&&g<225){p[i]=Math.min(255,r+4);p[i+1]=Math.max(0,g-4);p[i+2]=Math.min(255,b+21)}}
  ctx.putImageData(frame,0,512);rearBanks.set(image,canvas);return canvas;
}

/**
 * Draw only the rabbit and its contact shadow into the fixed 768x512 bridge.
 * Pass {depth: bank.get('depth'), turn: bank.get('turn')} from cinema-scenes.
 * The caller retains its existing background, mirror clip, camera and title.
 */
export function drawRabbitOpeningActor(ctx, time, images) {
  const state = rabbitOpeningState(time);
  if (!state.visible) return state;
  let image = images[state.sprite];
  if (!image) return state;
  if(state.sprite === 'depth' && state.frame >= 8) image=matchedRearAtlas(image);
  const { x, groundY, size, air, frame, anchor } = state;
  const lift = air / Math.max(size, 1);
  ctx.save();
  ctx.fillStyle = '#483052';
  ctx.globalAlpha = .16 * (1 - lift * 3);
  ctx.beginPath();
  ctx.ellipse(x, groundY + 1, size * .135 * (1 - lift * 1.5), size * .024, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(image, frame % 4 * 256, Math.floor(frame / 4) * 256, 256, 256,
    x - anchor[0] * size / 256, groundY - air - anchor[1] * size / 256, size, size);
  ctx.restore();
  return state;
}
