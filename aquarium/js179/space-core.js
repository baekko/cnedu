import {awardClue,hasSource} from './clue-order.js';
import {damage,collectRecovery,tickVitality} from './vitality.js';
import {SPACE_EXIT} from './space-geometry.js';
import {SPACE_DEBRIS} from './space-sprites.js';
export const SPACE=Object.freeze({duration:80,width:1650,height:1975,speed:96,acceleration:5.8,drag:.45,stunSeconds:0,boostSeconds:3,boostMultiplier:1.5,flashes:3,answer:'토끼',hints:['귀가 긴 동물입니다.','깡충깡충 뛰며, 동화에서 거북이와 경주하는 동물입니다.']});
export const SPACE_CARDS=Object.freeze([
 {id:1,x:720,y:1310,kind:'fixed'},
 {id:2,x:205,y:1180,kind:'drift',rx:43,ry:22,phase:.4},
 {id:3,x:170,y:725,kind:'guard'},
 {id:4,x:310,y:300,kind:'fixed'},
 {id:5,x:710,y:185,kind:'drift',rx:50,ry:21,phase:2},
 {id:6,x:1140,y:390,kind:'guard'},
 {id:7,x:1170,y:870,kind:'drift',rx:31,ry:48,phase:3.4},
 {id:8,x:1030,y:1310,kind:'guard'},
 {id:9,x:650,y:850,kind:'fixed'}
].map(c=>Object.freeze({...c,x:c.x*1.25,y:c.y*1.25})));
export const SPACE_DRONES=Object.freeze([
 {id:0,x:170,y:725,rx:91,ry:56,period:7.2,phase:1.7},
 {id:1,x:1140,y:390,rx:83,ry:73,period:6.3,phase:.4},
 {id:2,x:1030,y:1310,rx:98,ry:54,period:6.8,phase:2.8},
 {id:3,x:667,y:686,rx:118,ry:89,period:9.1,phase:4}
].map(c=>Object.freeze({...c,x:c.x*1.25,y:c.y*1.25})));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function cardPosition(card,t){return card.kind==='drift'?{x:card.x+Math.sin(t*.55+card.phase)*card.rx,y:card.y+Math.cos(t*.55+card.phase)*card.ry}:{x:card.x,y:card.y};}
export function dronePosition(drone,t){const a=t*Math.PI*2/drone.period+drone.phase;return {x:drone.x+Math.cos(a)*drone.rx,y:drone.y+Math.sin(a*2)*drone.ry,angle:Math.atan2(2*Math.cos(a*2)*drone.ry,-Math.sin(a)*drone.rx)};}
export function spaceCamera(x,y){return {x:clamp(x-195,0,SPACE.width-390),y:clamp(y-275,0,SPACE.height-500)};}
export class SpaceGame{
 constructor({onEvent=()=>{},collides=null}={}){
  this.onEvent=onEvent;this.collides=collides||((kind,o,p)=>Math.hypot(p.x-o.x,p.y-o.y)<(kind==='debris'?42:44));this.elapsed=0;this.ended=false;this.health=3;this.flashes=SPACE.flashes;this.phase='depart';this.launchAge=0;this.banked=new Set();this.clueSources=new Set();this.found=new Set();this.cards=SPACE_CARDS.map(c=>({...c}));this.effects=[];this.debris=[];this.serial=0;this.seed=941;this.nextDebris=6;this.hits=0;this.stunLeft=0;this.invincibleLeft=0;this.recoveryGlow=0;this.brakeLeft=0;this.boostLeft=0;this.recoveryItems=[{kind:'oxygen',x:1015,y:1160}];this.queuedMove=null;
  this.player={x:SPACE_EXIT.x,y:SPACE_EXIT.y,vx:0,vy:0,dir:'down',walk:0,moving:false,thrust:false,hammerAge:99};this.camera=spaceCamera(this.player.x,this.player.y);
 }
 get remaining(){return Math.max(0,SPACE.duration-this.elapsed);}
 get canMove(){return !this.ended&&this.phase==='explore'&&this.stunLeft<=0;}
 get canRecover(){return !this.ended&&this.phase==='explore'&&this.boostLeft<=0&&this.flashes>0;}
 get prompt(){return this.phase==='depart'?'출입구에서 우주로 나가요':this.elapsed<7?'지도 속 노란 카드를 찾아요 · 제동으로 멈춰요':'';}
 random(){this.seed=(this.seed*1664525+1013904223)>>>0;return this.seed/4294967296;}
 queueMove(input){if(!this.canMove||this.queuedMove)return;this.queuedMove={x:input.x||0,y:input.y||0,left:.08};}
 movePlayer(dt,input){this.queueMove(input);}
 brake(){if(!this.canMove||this.brakeLeft>0)return false;this.player.vx=0;this.player.vy=0;this.player.thrust=false;this.player.moving=false;this.queuedMove=null;this.brakeLeft=.15;this.effects.push({type:'brake',x:this.player.x,y:this.player.y,age:0});this.onEvent({type:'brake'});return true;}
 flash(){if(!this.canRecover)return false;this.flashes--;this.boostLeft=SPACE.boostSeconds;this.effects.push({type:'recover',x:this.player.x,y:this.player.y,age:0});this.onEvent({type:'spaceRecover'});return true;}
 hit(x,y){if(this.phase!=='explore')return false;const hit=damage(this,'spaceHit');if(hit)this.effects.push({type:'hit',x:this.player.x,y:this.player.y,age:0});return hit;}
 spawnDebris(){const p=this.player,horizontal=this.serial%3!==2,side=this.serial%2?1:-1,offset=(this.random()-.5)*115;let x,y,vx,vy;
  if(horizontal){x=clamp(p.x+side*260,30,SPACE.width-30);y=clamp(p.y+p.vy*2.55+offset,70,SPACE.height-70);vx=-side*168;vy=(this.random()-.5)*18;}
  else{x=clamp(p.x+p.vx*2.55+offset,70,SPACE.width-70);y=clamp(p.y-320,30,SPACE.height-30);vx=(this.random()-.5)*26;vy=172;}
  this.debris.push({id:this.serial++,x,y,startX:x,startY:y,vx,vy,age:0,warning:1.15,life:4.65,kind:(this.serial-1)%SPACE_DEBRIS.length});
 }
 update(dt,input={}){if(this.ended||!Number.isFinite(dt)||dt<=0)return;let left=Math.min(dt,SPACE.duration);while(left>1e-8&&!this.ended){const step=Math.min(1/60,left,this.remaining);if(step<=0){this.finish(true);break;}this.step(step,input);left-=step;}}
 step(dt,input){
  tickVitality(this,dt);this.boostLeft=Math.max(0,this.boostLeft-dt);
  const p=this.player;this.elapsed+=dt;this.stunLeft=Math.max(0,this.stunLeft-dt);this.invincibleLeft=Math.max(0,this.invincibleLeft-dt);this.recoveryGlow=Math.max(0,this.recoveryGlow-dt);this.brakeLeft=Math.max(0,this.brakeLeft-dt);
  this.effects.forEach(e=>e.age+=dt);this.effects=this.effects.filter(e=>e.age<1.2);
  if(this.phase==='depart'){this.launchAge=Math.min(SPACE_EXIT.seconds,this.launchAge+dt);const n=this.launchAge/SPACE_EXIT.seconds,ease=n*n*(3-2*n);p.x=SPACE_EXIT.x+SPACE_EXIT.dx*ease;p.y=SPACE_EXIT.y+SPACE_EXIT.dy*ease;p.walk+=dt*.6;p.moving=true;p.thrust=n>.35;if(this.launchAge>=SPACE_EXIT.seconds-1e-8){this.phase='explore';p.moving=false;p.thrust=false;}this.followCamera(dt);return;}
  let dx=Number(input.x)||0,dy=Number(input.y)||0;if(this.queuedMove){if(!dx&&!dy){dx=this.queuedMove.x;dy=this.queuedMove.y;}this.queuedMove.left-=dt;if(this.queuedMove.left<=0)this.queuedMove=null;}
  const length=Math.hypot(dx,dy);if(length>1){dx/=length;dy/=length;}
  if(this.canMove&&this.brakeLeft===0){if(dx||dy){const k=1-Math.exp(-SPACE.acceleration*dt);p.vx+=(dx*SPACE.speed*(this.boostLeft>0?SPACE.boostMultiplier:1)-p.vx)*k;p.vy+=(dy*SPACE.speed*(this.boostLeft>0?SPACE.boostMultiplier:1)-p.vy)*k;p.dir=Math.abs(dx)>Math.abs(dy)?dx<0?'left':'right':dy<0?'up':'down';p.thrust=true;}else{const k=Math.exp(-SPACE.drag*dt);p.vx*=k;p.vy*=k;p.thrust=false;}
   p.x+=p.vx*dt;p.y+=p.vy*dt;const x=clamp(p.x,35,SPACE.width-35),y=clamp(p.y,45,SPACE.height-45);if(x!==p.x)p.vx=0;if(y!==p.y)p.vy=0;p.x=x;p.y=y;p.moving=Math.hypot(p.vx,p.vy)>3;p.walk+=dt*(p.moving?1:.3);
  }else{p.thrust=false;p.moving=false;}
  if(this.elapsed>=this.nextDebris){this.spawnDebris();this.nextDebris+=5.6;}
  for(const d of this.debris){d.age+=dt;if(d.age>=d.warning){d.x+=d.vx*dt;d.y+=d.vy*dt;if(this.collides('debris',d,p,this.elapsed))this.hit(d.x,d.y);}}
  this.debris=this.debris.filter(d=>d.age<d.life&&d.x>-100&&d.x<SPACE.width+100&&d.y>-100&&d.y<SPACE.height+100);
  for(const d of SPACE_DRONES){const q=dronePosition(d,this.elapsed);if(this.collides('drone',{...d,...q},p,this.elapsed))this.hit(q.x,q.y);}
  if(this.ended)return;collectRecovery(this,this.player);
  if(this.stunLeft<=0)for(const card of this.cards){if(hasSource(this,card.id))continue;const q=cardPosition(card,this.elapsed);if(Math.hypot(p.x-q.x,p.y-q.y)<23){const earned=awardClue(this,card.id);this.effects.push({type:'card',id:earned,x:q.x,y:q.y,age:0});this.onEvent({type:'card',id:earned,x:q.x,y:q.y});}}
  this.followCamera(dt);
  if(this.banked.size===9||this.remaining<=1e-8){if(this.remaining<=1e-8)this.elapsed=SPACE.duration;this.finish(true);}
 }
 followCamera(dt){const target=spaceCamera(this.player.x,this.player.y),smooth=1-Math.exp(-9*dt);this.camera.x+=(target.x-this.camera.x)*smooth;this.camera.y+=(target.y-this.camera.y)*smooth;}
 finish(survived=true){if(this.ended)return;this.ended=true;this.phase=survived?'returned':'stopped';this.player.moving=false;this.player.thrust=false;this.queuedMove=null;this.onEvent({type:'end',survived,elapsed:this.elapsed,found:[...this.banked]});}
}
