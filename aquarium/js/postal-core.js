import {awardClue} from './clue-order.js';
import {POSTAL_VILLAGES} from './postal-maps.js?v268';

const ROUNDS = Object.freeze([
  Object.freeze({letters: 4, seconds: 60}),
  Object.freeze({letters: 5, seconds: 70}),
]);

export const POSTAL = Object.freeze({
  duration: ROUNDS.reduce((total, round) => total + round.seconds, 0),
  villageCount: ROUNDS.length,
  rounds: ROUNDS,
  speed: 264,
  flashes: 0,
  answer: '우편함',
  hints: ['집 앞에서 편지를 넣는 물건이에요.', '편지를 받아 두는 작은 상자예요. 우○함.'],
});

export const POSTAL_VIEW = Object.freeze({width: 390, height: 500, top: 170});
export const POSTAL_POSE_TIME = Object.freeze({mount: .82, dismount: .74, mail: .7});
export const POSTAL_SIDE_MOUNT_FRAME_ENDS = Object.freeze([12, 21, 30, 40, 49, 58, 68, 78, 87, 96, 106, 115, 124, 135, 147, 181]);
export const POSTAL_WALK_SPEED = 118;
export const POSTAL_PEDAL_DISTANCE = 171;
export const POSTAL_MAIL_SLOT_Y = -18.4;
// Standing foot anchor relative to the bicycle. The atlas uses these same
// offsets in the first boarding frame and the last dismount frame.
export const POSTAL_BIKE_STANDS = {down: [20.7, -3.7], up: [-21.2, -3.7], right: [-10, 3], left: [10, 3]};
// Grounded feet in the first vertical pose of each courier.
const COURIER_AXIS_STANDS = {
  doyun: {down: [18.0, -4.23], up: [-21.0, -4.23]},
  narin: {down: [23.73, -4.74], up: [-23.6, -5.78]},
  soi: {down: [21.12, -3.7], up: [-21.78, -4.74]},
};
// Player action hand positions registered to the mailbox slot at the normal avatar size.
const MAIL_STANDS = {
  haru: {up: [-12.1, -1.1], down: [-8.8, -4]},
  doyun: {up: [-13.8, .9], down: [-14, 0]},
  narin: {up: [-13.8, 2.2], down: [-14.7, 1.1]},
  soi: {up: [-12, 2.8], down: [-1.5, -2.2]},
};

export function postalDepartureMountTime(direction, characterId) {
  return characterId && (direction === 'left' || direction === 'right')
    ? POSTAL_SIDE_MOUNT_FRAME_ENDS.at(-1) / 100
    : POSTAL_POSE_TIME.mount;
}

const villagesById = new Map(POSTAL_VILLAGES.map(village => [village.id, village]));
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const deliveryPhases = new Set(['park', 'dismount', 'approach', 'mail', 'return', 'remount']);
const walkingPhases = new Set(['walkout', 'approach', 'return']);
function besideBike(bike, characterId) {
  const [x, y] = COURIER_AXIS_STANDS[characterId]?.[bike.dir] ?? POSTAL_BIKE_STANDS[bike.dir];
  return {x: bike.x + x, y: bike.y + y};
}

function sample(items, count, random) {
  const options = [...items];
  return Array.from({length: count}, () => {
    const index = clamp(Math.floor(random() * options.length), 0, options.length - 1);
    return options.splice(index, 1)[0];
  });
}

export function postalRunPlan(random = Math.random) {
  return sample(POSTAL_VILLAGES, ROUNDS.length, random).map((village, index) => ({
    villageId: village.id,
    destinations: sample(village.candidateIds, ROUNDS[index].letters, random),
  }));
}

export function normalizePostalPlan(plan) {
  if (!Array.isArray(plan) || plan.length !== POSTAL.villageCount) return;
  if (new Set(plan.map(leg => leg?.villageId)).size !== POSTAL.villageCount) return;
  if (!plan.every((leg, index) => {
    const village = villagesById.get(leg?.villageId);
    const {letters} = ROUNDS[index];
    return village && Array.isArray(leg.destinations) && leg.destinations.length === letters
      && new Set(leg.destinations).size === letters
      && leg.destinations.every(id => village.candidateIds.includes(id));
  })) return;
  return plan.map(leg => ({villageId: leg.villageId, destinations: [...leg.destinations]}));
}

export function postalRoadAt(village, x, y, margin = 9) {
  return village.roads.some(road => {
    const halfWidth = road.width / 2 - margin;
    return x >= Math.min(road.x1, road.x2) - halfWidth && x <= Math.max(road.x1, road.x2) + halfWidth
      && y >= Math.min(road.y1, road.y2) - halfWidth && y <= Math.max(road.y1, road.y2) + halfWidth;
  });
}

function direction(dx, dy, previous) {
  const horizontal = dx < 0 ? 'left' : 'right';
  const vertical = dy < 0 ? 'up' : 'down';
  if (Math.abs(Math.abs(dx) - Math.abs(dy)) < .0001 && (previous === horizontal || previous === vertical)) return previous;
  return Math.abs(dx) >= Math.abs(dy) ? horizontal : vertical;
}

export class PostalGame {
  constructor({onEvent = () => {}, runPlan, characterId, random = Math.random} = {}) {
    this.onEvent = onEvent;
    this.characterId = characterId;
    this.runPlan = normalizePostalPlan(runPlan) || postalRunPlan(random);
    this.banked = new Set();
    this.found = new Set();
    this.clueSources = new Set();
    this.reports = [];
    this.elapsed = 0;
    this.animationTime = 0;
    this.flashes = 0;
    this.health = 3;
    this.ended = false;
    this.startVillage(0);
  }

  get round() { return ROUNDS[this.room]; }
  get remaining() { return Math.max(0, this.round.seconds - this.villageTime); }
  get lettersLeft() { return this.round.letters - this.delivered.length; }
  get canMove() { return !this.mapOpen && this.phase === 'ride' && this.remaining > 0; }
  get canViewMap() {
    return !this.ended && this.remaining > 0 && (this.phase === 'ride' || deliveryPhases.has(this.phase));
  }
  get canAct() { return this.canMove && this.lettersLeft > 0 && !!this.nearHouse; }
  get deliveryNotice() {
    if (this.noticeLeft <= 0) return '';
    return this.noticeWrong ? '잘못 배달했어요' : '배달 완료';
  }

  get nearHouse() {
    let closest = null;
    let closestDistance = 59;
    for (const house of this.village.houses) {
      if (this.delivered.includes(house.id) || Math.abs(this.player.x - house.stop.x) > 39
        || Math.abs(this.player.y - house.stop.y) > Math.abs(house.stop.y - house.box.y) + 1) continue;
      const gap = distance(house.box, this.player);
      if (gap < closestDistance) {
        closest = house;
        closestDistance = gap;
      }
    }
    return closest;
  }

  startVillage(index) {
    this.room = index;
    const leg = this.runPlan[index];
    this.village = villagesById.get(leg.villageId);
    this.destinations = new Set(leg.destinations);
    this.villageTime = 0;
    this.delivered = [];
    this.noticeLeft = 0;
    this.noticeWrong = false;
    this.delivery = null;
    this.mapOpen = false;
    this.queuedMove = null;
    this.bike = {...this.village.office.bike, dir: 'left'};
    this.player = {...this.village.office.door, dir: 'down', moving: false, walk: 0, pedal: 0, hammerAge: 99};
    this.camera = {x: 0, y: 0};
    this.followCamera(1);
    const stand = besideBike(this.bike, this.characterId);
    this.walkTo('walkout', stand, 'down');
  }

  showMap() {
    if (!this.canViewMap || this.mapOpen) return false;
    this.mapOpen = true;
    this.queuedMove = null;
    return true;
  }

  closeMap() {
    if (!this.mapOpen) return false;
    this.mapOpen = false;
    return true;
  }

  queueMove({x, y}) {
    if (this.canMove) this.queuedMove = {x, y, left: .07};
  }

  act() {
    if (!this.canAct) return false;
    const house = this.nearHouse;
    const side = house.side === 'north' ? 'up' : 'down';
    const [dx, dy] = MAIL_STANDS[this.characterId]?.[side] ?? [0, side === 'up' ? 11 : -5];
    this.delivery = {house, side, stand: {x: house.box.x + dx, y: house.box.y + dy}};
    this.bike = {x: this.player.x, y: this.player.y, dir: this.player.dir};
    this.queuedMove = null;
    this.parkPedal = this.player.pedal;
    this.animate('park', .27, this.bike, this.bike.dir);
    return true;
  }

  walkTo(phase, target, fallback) {
    const p = this.player;
    const dir = direction(target.x - p.x, target.y - p.y, fallback);
    p.walk = 0;
    this.animate(phase, distance(p, target) / POSTAL_WALK_SPEED, target, dir);
  }

  animate(phase, duration, target = this.player, dir = this.player.dir) {
    this.phase = phase;
    this.phaseAge = 0;
    this.motion = {from: {x: this.player.x, y: this.player.y}, target: {x: target.x, y: target.y}, duration: Math.max(.001, duration)};
    this.player.dir = dir;
    this.player.moving = walkingPhases.has(phase);
  }

  get poseProgress() { return this.motion ? clamp(this.phaseAge / this.motion.duration, 0, 1) : 0; }

  nextMotion() {
    const post = this.delivery;
    switch (this.phase) {
      case 'walkout':
      case 'return': {
        const phase = this.phase === 'walkout' ? 'mount' : 'remount';
        Object.assign(this.player, this.bike);
        const duration = phase === 'mount'
          ? postalDepartureMountTime(this.bike.dir, this.characterId)
          : POSTAL_POSE_TIME.mount;
        this.animate(phase, duration);
        break;
      }
      case 'park': this.animate('dismount', POSTAL_POSE_TIME.dismount); break;
      case 'dismount':
        Object.assign(this.player, besideBike(this.bike, this.characterId));
        this.walkTo('approach', post.stand, post.side);
        break;
      case 'approach': this.animate('mail', POSTAL_POSE_TIME.mail, post.stand, post.side); break;
      case 'mail': {
        this.delivered.push(post.house.id);
        const correct = this.destinations.has(post.house.id);
        this.noticeLeft = 1.28;
        this.noticeWrong = !correct;
        this.onEvent({type: 'postalDelivery', correct});
        const stand = besideBike(this.bike, this.characterId);
        this.walkTo('return', stand, post.side === 'up' ? 'down' : 'up');
        break;
      }
      case 'mount':
      case 'remount':
        this.motion = null;
        this.delivery = null;
        this.player.moving = false;
        this.player.pedal = 0;
        this.phase = 'ride';
        if (!this.lettersLeft || this.remaining <= 0) this.finishVillage();
        break;
    }
  }

  followCamera(dt) {
    const {x, y, dir, moving} = this.player;
    const lookAhead = moving ? (dir === 'left' ? -35 : dir === 'right' ? 35 : 0) : 0;
    const cx = clamp(x - POSTAL_VIEW.width / 2 + lookAhead, 0, this.village.width - POSTAL_VIEW.width);
    const cy = clamp(y - POSTAL_VIEW.height * .56, 0, this.village.height - POSTAL_VIEW.height);
    const blend = 1 - Math.exp(-dt * 12);
    this.camera.x += (cx - this.camera.x) * blend;
    this.camera.y += (cy - this.camera.y) * blend;
  }

  ride(dt, input) {
    let dx = Number(input.x) || 0;
    let dy = Number(input.y) || 0;
    if (this.queuedMove) {
      if (!dx && !dy) ({x: dx, y: dy} = this.queuedMove);
      this.queuedMove.left -= dt;
      if (this.queuedMove.left <= 0) this.queuedMove = null;
    }
    const p = this.player;
    const length = Math.max(1, Math.hypot(dx, dy));
    const x = p.x + dx / length * POSTAL.speed * dt;
    const y = p.y + dy / length * POSTAL.speed * dt;
    const oldX = p.x;
    const oldY = p.y;
    if (postalRoadAt(this.village, x, y)) Object.assign(p, {x, y});
    else {
      if (postalRoadAt(this.village, x, p.y)) p.x = x;
      if (postalRoadAt(this.village, p.x, y)) p.y = y;
    }
    const travel = Math.hypot(p.x - oldX, p.y - oldY);
    p.moving = travel > .0001;
    if (p.moving) {
      p.dir = direction(p.x - oldX, p.y - oldY, p.dir);
      p.pedal = (p.pedal + travel / POSTAL_PEDAL_DISTANCE) % 1;
    }
  }

  spendTime(delta) {
    const spend = Math.min(delta, this.remaining);
    this.elapsed += spend;
    this.villageTime += spend;
  }

  update(delta, input = {}) {
    if (this.ended || this.phase === 'report' || !Number.isFinite(delta) || delta <= 0) return;
    if (this.mapOpen) {
      this.spendTime(delta);
      if (this.remaining <= 1e-7) this.finishVillage();
      return;
    }
    while (delta > 1e-7 && !this.ended && this.phase !== 'report') {
      const step = Math.min(delta, 1 / 60, this.motion ? this.motion.duration - this.phaseAge : this.remaining);
      if (step <= 1e-7) {
        if (this.motion) this.nextMotion();
        else this.finishVillage();
        continue;
      }
      this.animationTime += step;
      this.noticeLeft = Math.max(0, this.noticeLeft - step);
      if (this.phase === 'ride' || deliveryPhases.has(this.phase)) this.spendTime(step);
      if (this.motion) {
        this.phaseAge += step;
        const {from, target} = this.motion;
        const progress = this.poseProgress;
        const k = this.phase === 'park' ? progress * (2 - progress) : progress;
        this.player.x = from.x + (target.x - from.x) * k;
        this.player.y = from.y + (target.y - from.y) * k;
        if (this.player.moving) this.player.walk += step;
        if (this.phase === 'park') {
          const turn = this.parkPedal < .5 ? -this.parkPedal : 1 - this.parkPedal;
          this.player.pedal = (this.parkPedal + turn * k + 1) % 1;
        }
        if (progress >= 1 - 1e-6) this.nextMotion();
      } else {
        this.ride(step, input);
        if (this.remaining <= 1e-7) this.finishVillage();
      }
      this.followCamera(step);
      delta -= step;
    }
  }

  finishVillage() {
    if (this.phase === 'report' || this.ended) return;
    const good = this.delivered.filter(id => this.destinations.has(id));
    // Saved journey records expect the village field.
    const report = {village: `${this.room + 1}회차`, correct: good.length,
      wrong: this.delivered.length - good.length, unmailed: this.lettersLeft};
    this.phase = 'report';
    this.mapOpen = false;
    this.motion = null;
    this.player.moving = false;
    this.queuedMove = null;
    this.reports.push(report);
    // Each round awards its clues when it ends.
    good.forEach((_, index) => {
      const id = awardClue(this, (this.room ? ROUNDS[0].letters : 0) + index + 1);
      if (id) this.onEvent({type: 'card', id, x: this.player.x - this.camera.x,
        y: POSTAL_VIEW.top + this.player.y - this.camera.y - 54});
    });
    this.onEvent({type: 'postalReport'});
  }

  nextVillage() {
    if (this.phase !== 'report') return false;
    if (this.room + 1 < this.runPlan.length) this.startVillage(this.room + 1);
    else this.complete();
    return true;
  }

  complete() {
    if (this.ended) return;
    this.ended = true;
    this.phase = 'complete';
    this.mapOpen = false;
    const result = {survived: true, elapsed: this.elapsed, found: [...this.banked]};
    this.onEvent({type: 'end', ...result});
    return result;
  }

  restoreResult(record) {
    this.startVillage(clamp(record.room || 0, 0, this.runPlan.length - 1));
    this.reports = Array.isArray(record.reports) ? [...record.reports] : [];
    this.phase = 'complete';
    this.motion = null;
    this.ended = true;
  }

  flash() { return false; }
  beginAction() { return this.act(); }
  releaseAction() {}
}
