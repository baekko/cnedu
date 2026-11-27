import {awardClue,normalizeClueRewards,restoreSources} from './clue-order.js';
import {HOSPITAL_FLOOR,HOSPITAL_VIEW} from './hospital-layout.js?v297';

const roundTime = 40;
const roundCount = 3;

export const HOSPITAL = Object.freeze({
  duration: roundTime * roundCount,
  roundCount,
  roundTime,
  speed: 172,
  flashes: 0,
  answer: '청진기',
  hints: ['동물의 심장 소리를 들을 때 쓰는 도구예요.', '귀에 꽂는 부분과 가슴에 대는 부분이 이어져 있어요.'],
});

export const HOSPITAL_SPECIES = Object.freeze(['dog', 'cat', 'rabbit']);
export const HOSPITAL_BREEDS = Object.freeze({
  dog: Object.freeze(['malamute', 'golden', 'husky', 'shiba', 'maltese', 'bichon', 'bulldog', 'yorkie', 'pomeranian', 'corgi', 'beagle', 'dachshund']),
  cat: Object.freeze(['fold', 'munchkin', 'persian', 'siamese', 'korean', 'british', 'norwegian', 'ragdoll', 'russian', 'tabby', 'tuxedo', 'calico']),
  rabbit: Object.freeze(['lop', 'dutch', 'rex', 'angora', 'lionhead', 'hotot', 'harlequin', 'gray']),
});
export const HOSPITAL_PET_SIZES = Object.freeze({
  malamute: 65, golden: 59, husky: 61, shiba: 43, maltese: 29, bichon: 33, bulldog: 43,
  yorkie: 29, pomeranian: 34, corgi: 41, beagle: 44, dachshund: 40,
  fold: 32, munchkin: 32, persian: 36, siamese: 33, korean: 34, british: 36,
  norwegian: 41, ragdoll: 41, russian: 33, tabby: 34, tuxedo: 34, calico: 34,
  lop: 29, dutch: 27, rex: 29, angora: 34, lionhead: 31, hotot: 25, harlequin: 30, gray: 27,
});

const STILL_ACTIONS = {
  dog: ['sit', 'sleep', 'bark', 'sniff'],
  cat: ['groom', 'curl', 'stretch', 'sit'],
  rabbit: ['nose', 'ear', 'sit', 'sleep'],
};
const DURATIONS = {idle: 2, sit: 3, sleep: 6, curl: 6, groom: 3, stretch: 1.9, sniff: 2.6, bark: 1.25, ear: 2.7, nose: 3.1};
const GRID = 24;
const MARGIN = 8;
const PLAYER_MARGIN = 10;
const CONTACT_GAP = .001;
const MAX_STEP = 1 / 30;
const LEAP_ARC = 25;
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const pick = (list, random) => list[Math.min(list.length - 1, Math.floor(random() * list.length))];

function seededRandom(seed) {
  let state = seed;
  return () => {
    state = (state + 0x6D2B79F5) >>> 0;
    let bits = Math.imul(state ^ (state >>> 15), state | 1);
    bits ^= bits + Math.imul(bits ^ (bits >>> 7), bits | 61);
    return ((bits ^ (bits >>> 14)) >>> 0) / 4294967296;
  };
}

export function hospitalRunPlan(random = Math.random) {
  return Array.from({length: HOSPITAL.roundCount}, () => ({
    counts: HOSPITAL_SPECIES.map(() => clamp(3 + Math.floor(random() * 7), 3, 9)),
    seed: Math.floor(random() * 4294967296) >>> 0,
  }));
}

export function normalizeHospitalPlan(plan) {
  if (!Array.isArray(plan) || plan.length !== HOSPITAL.roundCount) return null;
  const valid = plan.every(round => Array.isArray(round?.counts) && round.counts.length === HOSPITAL_SPECIES.length
    && round.counts.every(value => Number.isInteger(value) && value >= 3 && value <= 9)
    && Number.isInteger(round.seed) && round.seed >= 0 && round.seed < 4294967296);
  return valid ? plan.map(({counts,seed}) => ({counts: [...counts],seed})) : null;
}

function shuffled(list, random) {
  const values = [...list];
  for (let last = values.length - 1; last > 0; last--) {
    const index = Math.floor(random() * (last + 1));
    [values[last], values[index]] = [values[index], values[last]];
  }
  return values;
}

const geometry = new WeakMap();

function outsideRooms(rooms, {left,right,top,bottom}) {
  if (!rooms?.length) return [];
  const cuts = (min, max, coordinates) => [...new Set([min,max,...coordinates.filter(value => value > min && value < max)])].sort((a,b)=>a-b);
  const columns = cuts(left, right, rooms.flatMap(({x,w}) => [x,x+w]));
  const rows = cuts(top, bottom, rooms.flatMap(({y,h}) => [y,y+h]));
  const voids = [];
  for (let column = 0; column < columns.length - 1; column++) {
    const x = columns[column], rightEdge = columns[column + 1];
    const across = (x + rightEdge) / 2;
    const coverage = rooms.filter(room => across >= room.x && across <= room.x + room.w);
    for (let row = 0; row < rows.length - 1; row++) {
      const y = rows[row], bottomEdge = rows[row + 1];
      const down = (y + bottomEdge) / 2;
      if (!coverage.some(room => down >= room.y && down <= room.y + room.h)) {
        const previous = voids.at(-1);
        if (previous?.x === x && previous.y + previous.h === y) previous.h += bottomEdge - y;
        else voids.push({x,y,w:rightEdge - x,h:bottomEdge - y});
      }
    }
  }
  return voids;
}

function collisionGeometry(floor) {
  if (geometry.has(floor)) return geometry.get(floor);
  const {left = 33,right = floor.width - 33,top = 62,bottom = floor.height - 54} = floor.bounds || {};
  const bounds = {left,right,top,bottom};
  const voids = outsideRooms(floor.walkable, bounds);
  const pets = [...floor.solids,...voids];
  const player = [...(floor.playerSolids || floor.solids),...voids];
  const result = {bounds,pets,player};
  geometry.set(floor, result);
  return result;
}

function occupiesFloor(x, y, margin, solids, bounds) {
  const {left,right,top,bottom} = bounds;
  return x >= left + margin && x <= right - margin && y >= top + margin && y <= bottom - margin
    && !solids.some(solid => x >= solid.x - margin && x <= solid.x + solid.w + margin
      && y >= solid.y - margin && y <= solid.y + solid.h + margin);
}

export function hospitalFloorAt(x, y, margin = MARGIN, floor = HOSPITAL_FLOOR) {
  const {bounds,pets} = collisionGeometry(floor);
  return occupiesFloor(x, y, margin, pets, bounds);
}

export function hospitalPlayerFloorAt(x, y, floor = HOSPITAL_FLOOR) {
  const {bounds,player} = collisionGeometry(floor);
  return occupiesFloor(x, y, PLAYER_MARGIN, player, bounds);
}

function clearLine(a, b, floor) {
  if (!hospitalFloorAt(b.x, b.y, MARGIN, floor)) return false;
  return !collisionGeometry(floor).pets.some(rect => {
    const x = segmentInterval(a.x, b.x, rect.x - MARGIN, rect.x + rect.w + MARGIN);
    const y = segmentInterval(a.y, b.y, rect.y - MARGIN, rect.y + rect.h + MARGIN);
    return Math.max(0, x[0], y[0]) <= Math.min(1, x[1], y[1]);
  });
}

function playerContact(position, dx, dy, collision) {
  const {x,y} = position;
  const {left,right,top,bottom} = collision.bounds;
  const xEdge = dx > 0 ? (right - PLAYER_MARGIN - x) / dx : dx < 0 ? (left + PLAYER_MARGIN - x) / dx : Infinity;
  const yEdge = dy > 0 ? (bottom - PLAYER_MARGIN - y) / dy : dy < 0 ? (top + PLAYER_MARGIN - y) / dy : Infinity;
  let time = Math.min(xEdge, yEdge);
  let blockX = xEdge === time;
  let blockY = yEdge === time;
  for (const rect of collision.player) {
    const tx = segmentInterval(x, x + dx, rect.x - PLAYER_MARGIN, rect.x + rect.w + PLAYER_MARGIN);
    const ty = segmentInterval(y, y + dy, rect.y - PLAYER_MARGIN, rect.y + rect.h + PLAYER_MARGIN);
    const enter = Math.max(tx[0], ty[0]);
    if (enter < 0 || enter > 1 || enter > time || enter > Math.min(tx[1], ty[1])) continue;
    if (enter < time) {
      time = enter;
      blockX = false;
      blockY = false;
    }
    const entersHorizontally = tx[0] >= ty[0];
    blockX ||= entersHorizontally;
    blockY ||= !entersHorizontally;
  }
  return time <= 1 ? {time,blockX,blockY} : null;
}

function sweepPlayer(player, dx, dy, collision) {
  while (dx || dy) {
    const contact = playerContact(player, dx, dy, collision);
    if (!contact) {
      player.x += dx;
      player.y += dy;
      return;
    }
    const approach = Math.max(0, contact.time - CONTACT_GAP / Math.max(Math.abs(dx), Math.abs(dy)));
    player.x += dx * approach;
    player.y += dy * approach;
    const remaining = 1 - approach;
    dx = contact.blockX ? 0 : dx * remaining;
    dy = contact.blockY ? 0 : dy * remaining;
  }
}

function segmentInterval(start, end, low, high) {
  const delta = end - start;
  if (!delta) return start >= low && start <= high ? [-Infinity, Infinity] : [Infinity, -Infinity];
  const first = (low - start) / delta;
  const last = (high - start) / delta;
  return [Math.min(first, last), Math.max(first, last)];
}

function navigation(floor) {
  const cells = new Map();
  for (let y = GRID; y < floor.height; y += GRID) {
    for (let x = GRID; x < floor.width; x += GRID) {
      if (hospitalFloorAt(x, y, MARGIN, floor)) cells.set(`${x},${y}`, {x, y, edges: []});
    }
  }
  for (const cell of cells.values()) {
    for (const [dx, dy] of [[GRID, 0], [-GRID, 0], [0, GRID], [0, -GRID]]) {
      const neighbor = cells.get(`${cell.x + dx},${cell.y + dy}`);
      if (neighbor && clearLine(cell, neighbor, floor)) cell.edges.push(neighbor);
    }
  }
  return [...cells.values()];
}

function nearestCell(point, cells, floor) {
  let nearest = null;
  let best = GRID * 3;
  for (const candidate of cells) {
    const gap = distance(point, candidate);
    if (gap >= best || !clearLine(point, candidate, floor)) continue;
    best = gap;
    nearest = candidate;
  }
  return nearest;
}

function routeFor(from, to, cells, floor) {
  if (clearLine(from, to, floor)) return [to];
  const start = nearestCell(from, cells, floor);
  const end = nearestCell(to, cells, floor);
  if (!start || !end) return [];
  const queue = [start];
  const previous = new Map([[start, null]]);
  for (let index = 0; index < queue.length && !previous.has(end); index++) {
    for (const edge of queue[index].edges) {
      if (previous.has(edge)) continue;
      previous.set(edge, queue[index]);
      queue.push(edge);
    }
  }
  if (!previous.has(end)) return [];
  const reverse = [];
  for (let cell = end; cell; cell = previous.get(cell)) reverse.push(cell);
  const points = [...reverse.reverse(), to];
  const route = [];
  let anchor = from;
  while (points.length) {
    let index = points.length - 1;
    while (index > 0 && !clearLine(anchor, points[index], floor)) index--;
    anchor = points[index];
    route.push(anchor);
    points.splice(0, index + 1);
  }
  return route;
}

function facing(dx, dy, old) {
  const horizontal = dx < 0 ? 'left' : 'right';
  const vertical = dy < 0 ? 'up' : 'down';
  if (Math.abs(Math.abs(dx) - Math.abs(dy)) < .0001 && (old === horizontal || old === vertical)) return old;
  return Math.abs(dx) >= Math.abs(dy) ? horizontal : vertical;
}

// Pick an authored profile or 3/4 view from movement. A near-vertical path
// keeps the animal on its previous side of the camera axis.
function faceAnimal(animal, dx, dy) {
  if (Math.hypot(dx, dy) < .00001) return;
  if (Math.abs(dx) > Math.abs(dy) * .12) animal.dir = dx < 0 ? 'left' : 'right';
  const sideBefore = animal.facing === 'left' || animal.facing === 'right';
  animal.facing = Math.abs(dy) < Math.abs(dx) * (sideBefore ? .27 : .22) ? animal.dir
    : (dy < 0 ? 'b' : 'f') + (animal.dir === 'left' ? 'l' : 'r');
}

function pose(animal, action, seconds) {
  animal.action = action;
  animal.age = 0;
  animal.actionLeft = seconds;
  animal.moving = false;
  animal.jump = 0;
}

function cloneReport({round,guesses,counts,correct,score}) {
  return {round,guesses:[...guesses],counts:[...counts],correct:[...correct],score};
}

export function normalizeHospitalReports(reports) {
  if (!Array.isArray(reports)) return [];
  const accepted = [];
  const valid = (values, minimum) => Array.isArray(values) && values.length === HOSPITAL_SPECIES.length
    && values.every(value => Number.isInteger(value) && value >= minimum && value <= 9);
  for (const report of reports.slice(0, HOSPITAL.roundCount)) {
    if (report?.round !== accepted.length + 1 || !valid(report.guesses, 0) || !valid(report.counts, 3)) break;
    const correct = report.counts.map((count, index) => count === report.guesses[index]);
    accepted.push(cloneReport({...report, correct, score: correct.filter(Boolean).length}));
  }
  return accepted;
}

export class HospitalGame {
  constructor({onEvent = () => {},runPlan,random = Math.random,floor = HOSPITAL_FLOOR} = {}) {
    this.onEvent = onEvent;
    this.runPlan = normalizeHospitalPlan(runPlan) || hospitalRunPlan(random);
    this.floor = floor;
    this.stations = floor.stations.filter(station => hospitalFloorAt(station.x, station.y, MARGIN, floor));
    this.nav = navigation(floor);
    this.health = 1;
    this.flashes = 0;
    this.banked = new Set();
    this.found = new Set();
    this.clueSources = new Set();
    this.reports = [];
    this.elapsed = 0;
    this.ended = false;
    this.startRound(0);
  }

  get remaining() { return this.phase === 'explore' ? Math.max(0, HOSPITAL.roundTime - this.roundTime) : 0; }
  get canMove() { return this.phase === 'explore' && !this.ended; }
  get canAct() { return false; }
  get counts() { return this.runPlan[this.room].counts; }
  get report() { return this.reports.at(-1) || null; }

  startRound(index) {
    this.room = index;
    this.phase = 'explore';
    this.roundTime = 0;
    this.animationTime = 0;
    this.nextCatPlay = 2.4;
    this.guesses = [0, 0, 0];
    this.selectedSpecies = 0;
    this.queuedMove = null;
    this.player = {...this.floor.start, dir: 'up', moving: false, walk: 0, hammerAge: 99};
    this.camera = {x: 0, y: 0};
    this.updateCamera();
    this.random = seededRandom(this.runPlan[index].seed ^ Math.imul(index + 1, 0x9e3779b1));
    this.animals = this.placeAnimals();
    if (index) this.onEvent({type: 'hospitalRound', round: index + 1});
  }

  placeAnimals() {
    const animals = [];
    const roomPopulation = new Map();
    const stations = shuffled(this.stations, this.random);
    HOSPITAL_SPECIES.forEach((species, group) => {
      const breeds = shuffled(HOSPITAL_BREEDS[species], this.random);
      for (let index = 0; index < this.counts[group]; index++) {
        const breed = breeds[index % breeds.length];
        const scale = (index >= breeds.length ? .90 : .96) + this.random() * .08;
        const width = HOSPITAL_PET_SIZES[breed] * scale;
        const unoccupied = stations.filter(point => !animals.some(animal => animal.stationId === point.id));
        const separated = unoccupied.filter(point => distance(point, this.player) > 40
          && animals.every(other => distance(other, point) >= 8 + (width + other.width) * .31));
        const partner = species === 'cat' && index === 2 ? animals.at(-1) : null;
        const neighboring = partner ? separated.filter(point => point.room === partner.home.room && this.canFace(partner, point)) : [];
        const perching = species === 'cat' && index === 1;
        const highPerches = perching ? (this.floor.perches || []).filter(perch => this.validPerch(perch)) : [];
        const perches = highPerches.filter(perch => perch.kind === (this.room === 1 ? 'table' : 'desk'));
        const near = features => separated.filter(point => features.some(perch =>
          distance(point, perch.approach) < 115 && clearLine(point, perch.approach, this.floor)));
        const nearPerches = perches.length ? near(perches) : [];
        const choices = [neighboring, nearPerches, near(highPerches), separated, unoccupied].find(pool => pool.length) || [];
        const occupancy = point => (roomPopulation.get(point.room) || 0) / (point.room === 'hall' ? .70 : 1);
        const point = choices.reduce((best, candidate) => !best || occupancy(candidate) < occupancy(best) ? candidate : best, null);
        if (!point) throw new Error('Hospital floor has fewer stations than animals');
        roomPopulation.set(point.room, 1 + (roomPopulation.get(point.room) || 0));
        const side = this.random() < .5 ? 'l' : 'r';
        const view = (index + group + this.room) % 2 ? 'b' : 'f';
        const animal = {
          id: `${species}-${this.room + 1}-${index + 1}`, species, breed, width, scale,
          x: point.x, y: point.y, dir: side === 'l' ? 'left' : 'right', facing: view + side,
          stationId: point.id, home: point, elevation: 0, jump: 0, age: 0, walk: 0,
          moving: false, route: null, stuck: 0,
          roaming: index === 0 || (index % 4 === 3),
          venturesome: index === 0 && (species === 'dog' || species === 'cat'),
          perching, preferredPerches: perches,
          speed: species === 'dog' ? 53 + this.random() * 22 : species === 'cat' ? 55 + this.random() * 28 : 43 + this.random() * 17,
        };
        const action = STILL_ACTIONS[species][index % STILL_ACTIONS[species].length];
        const actionTime = animal.perching ? 1.9 + this.random() * 1.6 : animal.roaming ? 1 + this.random() * 3 : 2 + this.random() * 5;
        pose(animal, action, actionTime);
        animal.age = this.random() * .8;
        animals.push(animal);
      }
    });
    return animals;
  }

  updateCamera() {
    this.camera.x = clamp(this.player.x - HOSPITAL_VIEW.width / 2, 0, Math.max(0, this.floor.width - HOSPITAL_VIEW.width));
    this.camera.y = clamp(this.player.y - HOSPITAL_VIEW.height / 2, 0, Math.max(0, this.floor.height - HOSPITAL_VIEW.height));
  }

  queueMove({x, y}) {
    if (this.canMove) this.queuedMove = {x, y, left: .09};
  }

  movePlayer(dt, input = {}) {
    const player = this.player;
    player.moving = false;
    if (!this.canMove || !Number.isFinite(dt) || dt <= 0) return false;
    let dx = clamp(input.x || 0, -1, 1);
    let dy = clamp(input.y || 0, -1, 1);
    const length = Math.hypot(dx, dy);
    if (!length) return false;
    dx *= HOSPITAL.speed * dt / length;
    dy *= HOSPITAL.speed * dt / length;
    const {x, y} = player;
    sweepPlayer(player, dx, dy, collisionGeometry(this.floor));
    const traveled = Math.hypot(player.x - x, player.y - y);
    player.moving = traveled > .0001;
    if (player.moving) player.dir = facing(player.x - x, player.y - y, player.dir);
    player.walk += traveled / HOSPITAL.speed;
    this.updateCamera();
    return player.moving;
  }

  update(dt, input = {}) {
    if (!this.canMove || !Number.isFinite(dt) || dt <= 0) return;
    const active = Math.min(dt, this.remaining);
    let unsimulated = active;
    while (unsimulated > .000001) {
      const step = Math.min(MAX_STEP, unsimulated);
      this.movePlayer(step, input.x || input.y ? input : this.queuedMove || input);
      if (this.queuedMove) {
        this.queuedMove.left -= step;
        if (this.queuedMove.left <= 0) this.queuedMove = null;
      }
      this.animationTime += step;
      for (const animal of this.animals) this.updateAnimal(animal, step);
      if (this.animationTime >= this.nextCatPlay) this.maybeCatPlay();
      unsimulated -= step;
    }
    this.roundTime += active;
    this.elapsed = this.room * HOSPITAL.roundTime + this.roundTime;
    if (this.roundTime >= HOSPITAL.roundTime - .000001) {
      this.roundTime = HOSPITAL.roundTime;
      this.elapsed = (this.room + 1) * HOSPITAL.roundTime;
      this.phase = 'entry';
      this.queuedMove = null;
      this.player.moving = false;
      this.onEvent({type: 'hospitalTimeUp', round: this.room + 1});
    }
  }

  updateAnimal(animal, dt) {
    animal.age += dt;
    if (animal.leap) { this.performLeap(animal); return; }
    if (animal.route) { this.followAnimalRoute(animal, dt); return; }
    animal.actionLeft -= dt;
    if (animal.actionLeft > 0) return;
    if (animal.perch) { this.beginLeap(animal, animal.perch, false); return; }
    if (animal.perching && this.planPerch(animal)) return;
    if (animal.roaming && this.planAnimalRoute(animal)) return;
    this.restAnimal(animal);
  }

  restAnimal(animal) {
    const options = STILL_ACTIONS[animal.species].filter(action => action !== animal.action);
    const action = pick(options, this.random);
    pose(animal, action, DURATIONS[action] * (.75 + this.random() * .5));
    animal.route = null;
    animal.stuck = 0;
  }

  planAnimalRoute(animal) {
    const longWalk = animal.venturesome && this.random() < .53;
    const points = shuffled(this.stations.filter(point => distance(animal, point) > (longWalk ? 120 : 34)
      && (longWalk || distance(animal, point) < 155)
      && this.animals.every(other => other === animal || distance(other, point) > 22)), this.random);
    for (const point of points.slice(0, 6)) {
      const route = routeFor(animal, point, this.nav, this.floor);
      if (!route.length) continue;
      const action = animal.species === 'rabbit' ? (this.random() < .33 ? 'binky' : 'hop')
        : animal.species === 'cat' && this.random() < .48 ? 'run' : 'walk';
      pose(animal, action, 0);
      animal.route = route;
      animal.stuck = 0;
      return true;
    }
    return false;
  }

  followAnimalRoute(animal, dt) {
    const target = animal.route[0];
    const gap = distance(animal, target);
    const velocity = animal.speed * (animal.action === 'run' ? 1.6 : 1);
    const step = Math.min(gap, velocity * dt);
    const dx = gap ? (target.x - animal.x) * step / gap : 0;
    const dy = gap ? (target.y - animal.y) * step / gap : 0;
    const next = {x: animal.x + dx, y: animal.y + dy};
    const blocked = this.animals.some(other => other !== animal && !other.elevation
      && distance(other, next) < Math.min(19, .22 * (animal.width + other.width))
      && distance(other, next) < distance(other, animal));
    animal.moving = !blocked && step > 0;
    animal.stuck = blocked ? animal.stuck + dt : 0;
    if (blocked && animal.stuck < .5) return;
    if (blocked) { animal.upcomingPerch = null; this.restAnimal(animal); return; }
    Object.assign(animal, next);
    if (step) faceAnimal(animal, dx, dy);
    animal.walk += step / 60;
    if (animal.action === 'binky') animal.jump = Math.max(0, Math.sin(animal.age * 9)) * 9;
    if (step + .001 < gap) return;
    animal.route.shift();
    if (animal.route.length) return;
    if (animal.upcomingPerch) {
      this.beginLeap(animal, animal.upcomingPerch, true);
      animal.upcomingPerch = null;
      return;
    }
    this.restAnimal(animal);
  }

  planPerch(animal) {
    const perches = (this.floor.perches || []).filter(perch => this.validPerch(perch) && this.animals.every(other =>
      other === animal || (other.upcomingPerch !== perch && other.perch !== perch && other.leap?.perch !== perch
        && distance(other, perch.approach) > 15)));
    perches.sort((first, second) => {
      const a = animal.preferredPerches.includes(first) ? 0 : 100;
      const b = animal.preferredPerches.includes(second) ? 0 : 100;
      return a - b + distance(animal, first.approach) - distance(animal, second.approach);
    });
    for (const perch of perches) {
      const route = routeFor(animal, perch.approach, this.nav, this.floor);
      if (!route.length) continue;
      pose(animal, 'walk', 0);
      animal.upcomingPerch = perch;
      animal.route = route;
      return true;
    }
    return false;
  }

  validPerch(perch) {
    return perch.height > 0 && distance(perch, perch.approach) <= 70
      && hospitalFloorAt(perch.approach.x, perch.approach.y, MARGIN, this.floor)
      && this.floor.fixtures.some(fixture => fixture.kind === perch.kind
        && Math.abs(fixture.y - perch.y) < 1 && Math.abs(fixture.x - perch.x) <= fixture.width * .36);
  }

  beginLeap(animal, perch, up) {
    animal.route = null;
    const destination = up ? perch : perch.approach;
    const seconds = .45 + perch.height / 340;
    animal.leap = {from: {x: animal.x,y: animal.y,elevation: animal.elevation}, destination, up, perch, seconds};
    faceAnimal(animal, destination.x - animal.x, destination.y - animal.y);
    pose(animal, 'jump', seconds);
  }

  performLeap(animal) {
    const {from,destination,up,perch,seconds} = animal.leap;
    const ratio = Math.min(1, animal.age / seconds);
    animal.x = from.x + (destination.x - from.x) * ratio;
    animal.y = from.y + (destination.y - from.y) * ratio;
    animal.elevation = from.elevation + ((up ? perch.height : 0) - from.elevation) * ratio;
    animal.jump = LEAP_ARC * 4 * ratio * (1 - ratio);
    animal.depth = ratio > 0 && animal.elevation + animal.jump > 4 ? perch.depth : undefined;
    if (ratio < 1) return;
    animal.leap = null;
    animal.perch = up ? perch : null;
    if (up) {
      faceAnimal(animal, perch.approach.x - animal.x, perch.approach.y - animal.y);
      pose(animal, 'perch', 4.6 + this.random() * 2.4);
    }
    else {
      animal.perching = false;
      this.restAnimal(animal);
    }
  }

  maybeCatPlay() {
    this.nextCatPlay = this.animationTime + 3.5 + this.random() * 2;
    const cats = this.animals.filter(animal => animal.species === 'cat' && !animal.route && !animal.perch && !animal.leap);
    for (const first of cats) {
      const second = cats.find(other => other !== first && this.canFace(first, other));
      if (!second) continue;
      faceAnimal(first, second.x - first.x, second.y - first.y);
      faceAnimal(second, first.x - second.x, first.y - second.y);
      pose(first, 'fight', 1.1);
      pose(second, 'fight', 1.1);
      second.age = .15;
      return;
    }
  }

  canFace(first, second) {
    return Math.abs(first.x - second.x) >= 28 && Math.abs(first.y - second.y) < 28
      && distance(first, second) <= 65 && clearLine(first, second, this.floor);
  }

  selectSpecies(index) {
    if (this.phase !== 'entry' || !Number.isInteger(index) || index < 0 || index >= HOSPITAL_SPECIES.length) return false;
    this.selectedSpecies = index;
    return true;
  }

  adjustCount(species, delta) {
    if (this.phase !== 'entry' || !Number.isInteger(delta)) return false;
    const index = typeof species === 'string' ? HOSPITAL_SPECIES.indexOf(species) : species;
    if (!Number.isInteger(index) || index < 0 || index >= HOSPITAL_SPECIES.length) return false;
    const value = clamp(this.guesses[index] + delta, 0, 9);
    const changed = value !== this.guesses[index];
    this.guesses[index] = value;
    return changed;
  }

  moveSelection(dx, dy) {
    if (dy) return this.adjustCount(this.selectedSpecies, -Math.sign(dy));
    if (dx) return this.selectSpecies(clamp(this.selectedSpecies + Math.sign(dx), 0, HOSPITAL_SPECIES.length - 1));
    return false;
  }

  submitCounts() {
    if (this.phase !== 'entry') return false;
    this.phase = 'report';
    const correct = this.counts.map((count, group) => this.guesses[group] === count);
    const report = {round: this.room + 1, guesses: [...this.guesses], counts: [...this.counts], correct, score: correct.filter(Boolean).length};
    this.reports.push(report);
    correct.forEach((exact, group) => {
      if (!exact) return;
      const id = awardClue(this, this.room * HOSPITAL_SPECIES.length + group + 1);
      if (id !== null) this.onEvent({type: 'card', id, round: report.round, species: HOSPITAL_SPECIES[group],
        x: this.player.x - this.camera.x, y: this.player.y - this.camera.y + HOSPITAL_VIEW.top});
    });
    this.onEvent({type: 'hospitalReport', report: cloneReport(report)});
    return true;
  }

  nextRound() {
    if (this.phase !== 'report') return false;
    if (this.room + 1 < HOSPITAL.roundCount) this.startRound(this.room + 1);
    else {
      this.phase = 'ended';
      this.ended = true;
      this.onEvent({type: 'end', ...this.result()});
    }
    return true;
  }

  result() {
    return {survived: this.ended && this.reports.length === HOSPITAL.roundCount, elapsed: this.elapsed, found: [...this.found]};
  }

  restoreResult(record = {}) {
    this.banked = new Set(normalizeClueRewards(record.clues));
    this.clueSources = restoreSources(record);
    this.found = new Set();
    this.reports = normalizeHospitalReports(record.reports);
    this.elapsed = clamp(Number(record.elapsed) || HOSPITAL.duration, 0, HOSPITAL.duration);
    this.phase = 'ended';
    this.ended = true;
  }
}
