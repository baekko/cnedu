import {awardClue,hasSource,normalizeClueRewards,restoreSources} from './clue-order.js';
import { GAME, SHARKS, CLUES, FAST_SHARK } from './config.js';

export function validClues(values) {
  return [...new Set(Array.isArray(values) ? values.filter(n => Number.isInteger(n) && n >= 1 && n <= CLUES.length) : [])].sort((a, b) => a - b);
}
export function puzzleTiles(values) {
  const owned=new Set(validClues(values));
  return CLUES.map((card,i)=>({...card,row:Math.floor(i/3),column:i%3,owned:owned.has(card.id)}));
}
export function readProgress(storage) {
  try {
    const data = JSON.parse(storage.getItem(GAME.storageKey) || '{}');
    return { clues: normalizeClueRewards(data.clues), clueSources:[...restoreSources(data)], character: ['haru', 'doyun', 'narin', 'soi'].includes(data.character) ? data.character : 'haru', sound: data.sound === true };
  } catch { return { clues: [], clueSources:[], character: 'haru', sound: false }; }
}
export function saveProgress(storage, data) {
  try { storage.setItem(GAME.storageKey, JSON.stringify({ ...data, clues: validClues(data.clues) })); return true; }
  catch { return false; }
}
export const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

// 그림이나 기기에 의존하지 않는 게임 진행. 시간은 초, 위치는 화면 좌표입니다.
export class AquariumGame {
  constructor({ random = Math.random, onEvent = () => {}, collides = null } = {}) {
    this.random = random;
    this.onEvent = onEvent;
    this.banked = new Set();this.clueSources=new Set();
    this.collides = collides;
    this.found = new Set();
    this.elapsed = 0;
    this.ended = false;
    this.health = GAME.health;
    this.flashes = GAME.flashes;
    this.invincible = 0;
    this.lightCooldown = 0;
    this.player = { x: 98, y: 410 };
    this.enemies = [];
    this.pickups = [];
    this.warnings = [];
    this.nextEnemy = 2 / GAME.sharkSpawnRate;
    this.enemyIndex = 0;
    this.nextFast=FAST_SHARK.start / GAME.sharkSpawnRate;this.fastLane=-3;
    this.healTimes = [18, 39];
    // 모든 모험은 빈 보관함으로 시작하고 아홉 장 모두 다시 등장합니다.
    this.cardQueue = CLUES.map((card, i) => ({ id: card.id, time: 3.5 + i * 4.8 }));
  }
  emit(type, extra = {}) { this.onEvent({ type, ...extra }); }
  yForPickup() {
    let y = 220 + this.random() * 340;
    for (let tries = 0; tries < 8; tries++) {
      if (!this.enemies.some(e => e.x > 230 && Math.abs(e.y - y) < 65)) break;
      y = 215 + this.random() * 350;
    }
    return y;
  }
  spawnEnemy(forcedType=null,stream=false) {
    const order = ['basic', 'sturgeon', 'basic', 'hammer', 'big', 'sturgeon', 'hammer'];
    const type = forcedType||order[this.enemyIndex++ % order.length];
    const cfg = SHARKS[type];
    let y = 198 + this.random() * 390;
    for (let i = 0; i < 6; i++) {
      if (!this.enemies.some(e => e.x > 260 && Math.abs(e.y - y) < 80)) break;
      y = 198 + this.random() * 390;
    }
    if(stream){this.fastLane=(this.fastLane+3)%FAST_SHARK.lanes.length;y=FAST_SHARK.lanes[this.fastLane];}
    const enemy = { stream,type, x: 390 + cfg.width / 2 + 10, y, baseY: y, age: 0, phase: this.random() * Math.PI * 2, flee: false };
    if (cfg.warning) this.warnings.push({ remaining: cfg.warning, y, enemy });
    else this.enemies.push(enemy);
  }
  collect(pickup) {
    if (this.ended) return;
    if (pickup.type === 'card') {
      if (!validClues([pickup.id]).length || hasSource(this,pickup.id)) return;
      const earned=awardClue(this,pickup.id);
      this.emit('card', { id: earned, source:pickup.id, x: pickup.x, y: pickup.y });
    } else if (pickup.type === 'heal') {
      const previous = this.health;
      this.health = Math.min(GAME.health, this.health + 1);
      this.emit('heal', { recovered: this.health > previous, x: pickup.x, y: pickup.y });
    }
  }
  hit() {
    if (this.ended || this.invincible > 0) return false;
    this.health = Math.max(0, this.health - 1);
    this.invincible = GAME.invincibleSeconds;
    this.emit('hit', { health: this.health });
    if (this.health === 0) this.finish(false);
    return true;
  }
  flash() {
    if (this.ended || this.flashes === 0 || this.lightCooldown > 0) return false;
    this.flashes--;
    this.lightCooldown = 0.6;
    this.invincible = Math.max(this.invincible, 0.5);
    for (const enemy of this.enemies) {
      if (Math.hypot(enemy.x - this.player.x, (enemy.y - this.player.y)*(this.sceneRatio||1)) < 195) {
        enemy.flee = true;
        enemy.fleeY = enemy.y < this.player.y ? -70 : 70;
      }
    }
    this.emit('flash', { x: this.player.x, y: this.player.y });
    return true;
  }
  finish(survived) {
    if (this.ended) return;
    this.ended = true;
    this.emit('end', { survived, elapsed: Math.min(GAME.duration, this.elapsed), found: [...this.found], collected: [...this.banked] });
  }
  movePlayer(dt, input) {
    if (this.ended) return;
    const length = Math.hypot(input.x, input.y);
    if (length > 0) {
      this.player.x = clamp(this.player.x + input.x / Math.max(1, length) * GAME.speed * dt, GAME.field.left, GAME.field.right);
      this.player.y = clamp(this.player.y + input.y / Math.max(1, length) * GAME.speed * dt, Math.max(GAME.field.top,142+44/(this.sceneRatio||1)), Math.min(GAME.field.bottom,678-44/(this.sceneRatio||1)));
    }
  }
  update(seconds, input = { x: 0, y: 0 }) {
    if (this.ended || seconds <= 0) return;
    // 프레임이 느려져도 제한 시간을 지키며 작은 시간 단위로 충돌을 확인합니다.
    let left = Math.min(seconds, GAME.duration - this.elapsed + 1 / 60);
    while (left > 0 && !this.ended) {
      const dt = Math.min(left, 1 / 60);
      this.step(dt, input);
      left -= dt;
    }
  }
  step(dt, input) {
    this.elapsed += dt;
    if (this.elapsed >= GAME.duration) { this.elapsed = GAME.duration; this.finish(true); return; }
    this.invincible = Math.max(0, this.invincible - dt);
    this.lightCooldown = Math.max(0, this.lightCooldown - dt);
    this.movePlayer(dt, input);
    if (this.elapsed >= this.nextEnemy) {
      this.spawnEnemy();
      this.nextEnemy = this.elapsed + (this.elapsed < 20 ? 2.35 : this.elapsed < 42 ? 1.95 : 1.65) / GAME.sharkSpawnRate;
    }
    if(this.elapsed>=this.nextFast){
      this.spawnEnemy('baby',true);
      this.nextFast+=((390+SHARKS.baby.width+10)/SHARKS.baby.speed+FAST_SHARK.gap) / GAME.sharkSpawnRate;
    }
    while (this.cardQueue.length && this.cardQueue[0].time <= this.elapsed) {
      const card = this.cardQueue.shift();
      this.pickups.push({ type: 'card', id: card.id, x: 410, y: this.yForPickup(), phase: this.random() * 6 });
    }
    while (this.healTimes.length && this.healTimes[0] <= this.elapsed) {
      this.healTimes.shift();
      this.pickups.push({ type: 'heal', x: 412, y: this.yForPickup(), phase: 0 });
    }
    for (const warning of this.warnings) {
      warning.remaining -= dt;
      if (warning.remaining <= 0) this.enemies.push(warning.enemy);
    }
    this.warnings = this.warnings.filter(w => w.remaining > 0);
    for (const enemy of this.enemies) {
      const cfg = SHARKS[enemy.type];
      enemy.age += dt;
      if (enemy.flee) {
        enemy.x += 220 * dt;
        enemy.y += enemy.fleeY * dt;
      } else {
        enemy.x -= cfg.speed * dt;
        enemy.y = enemy.baseY + (cfg.wave ? Math.sin(enemy.age * 2.2 + enemy.phase) * cfg.wave : 0);
        // 실제 플레이에서는 그림의 불투명 윤곽(꼬리·지느러미 포함)으로 접촉을 판정합니다.
        const touching = this.collides ? this.collides(enemy, this.player, this.elapsed, this.sceneRatio||1) :
          Math.abs(this.player.x-enemy.x) <= cfg.width/2+GAME.hitRadius && Math.abs(this.player.y-enemy.y)*(this.sceneRatio||1) <= cfg.height/2+GAME.hitRadius;
        // 계속 겹친 접촉은 한 번만, 떨어졌다 다시 닿으면 새 접촉입니다.
        if (touching && !enemy.hitPlayer && this.hit()) enemy.hitPlayer = true;
        if (!touching) enemy.hitPlayer = false;
        if (this.ended) return;
      }
    }
    this.enemies = this.enemies.filter(e => e.x > -150 && (!e.flee || e.x < 560));
    for (const pickup of this.pickups) {
      pickup.x -= 68 * dt;
      if (!pickup.taken && Math.hypot(pickup.x - this.player.x, (pickup.y - this.player.y)*(this.sceneRatio||1)) < 40) {
        pickup.taken = true;
        this.collect(pickup);
      }
    }
    this.pickups = this.pickups.filter(p => !p.taken && p.x > -30);
  }
}
