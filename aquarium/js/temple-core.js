import {movedDuringStep} from './walk-cycle.js';
import {awardClue,hasSource} from './clue-order.js';
import {damage,collectRecovery,tickVitality} from './vitality.js';
import {SCYLLA,scyllaAttackPose,scyllaBiteContact,scyllaGrabPose} from './temple-scylla.js?v=157';
import {SIREN,sirenWaveContact,sirenCaptureContact} from './temple-siren.js?v=157';
export const TEMPLE_ROUTE_SCALE=1.5;
export const routeZ=z=>z*TEMPLE_ROUTE_SCALE;
export const TEMPLE_DOCK=Object.freeze({x:195,left:140,right:250,approach:routeZ(1830),boardFrom:routeZ(1855),walkEnd:routeZ(1880),boatZ:routeZ(1910)});
export const TEMPLE_TEMPO=1.2;
export const CIRCE_ORB_SPEED=147.84*TEMPLE_TEMPO;
export const TEMPLE=Object.freeze({duration:110,speed:168*TEMPLE_TEMPO,boatSpeed:192*TEMPLE_TEMPO,forwardSpeed:routeZ(46.8)*TEMPLE_TEMPO,stunSeconds:0,pigSeconds:3,shieldSeconds:4,recoveries:1,recoveryGrace:1,goal:routeZ(5110),answer:'올빼미',hints:['주로 밤에 활동하는 새입니다.','큰 눈과 둥근 얼굴이 특징입니다.']});
export const TEMPLE_ZONES=[
 {id:'temple',name:'제우스의 신전',from:0,to:850,tip:'앞길의 번개 표시를 보고 옆으로 피해요',color:'#b89957'},
 {id:'circe',name:'키르케의 숲',from:850,to:1460,tip:'마법 구슬을 피하고 단서를 주워요',color:'#9377b4'},
 {id:'wind',name:'바람의 절벽',from:1460,to:1850,tip:'왼쪽 + 위쪽을 함께 누르고 걸어가요',color:'#61a9aa'},
 {id:'siren',name:'사이렌의 바다',from:1850,to:2550,tip:'음파에 닿으면 느려져요 · 반대쪽으로 벗어나요',color:'#b581b3'},
 {id:'scylla',name:'스킬라의 해협',from:2550,to:3340,tip:'머리 그림자에서 벗어나요',color:'#55947d'},
 {id:'whirlpool',name:'카리브디스',from:3340,to:3930,tip:'소용돌이의 중심을 피해요',color:'#467da1'},
 {id:'poseidon',name:'포세이돈의 바다',from:3930,to:4700,tip:'파도의 빈틈으로 지나가요',color:'#408da0'},
 {id:'ithaca',name:'이타카',from:4700,to:5400,tip:'항구에 내려 마지막 단서를 찾아요!',color:'#b69b62'}
].map(zone=>({...zone,from:routeZ(zone.from),to:routeZ(zone.to)}));
export const TEMPLE_CARDS=[{id:1,x:112,z:350},{id:2,x:272,z:680},{id:3,x:170,z:1315},{id:4,x:190,z:1780},{id:5,x:112,z:2250},{id:6,x:104,z:3010,locked:true},{id:7,x:215,z:3585},{id:8,x:200,z:4410},{id:9,x:195,z:5090}].map(c=>({...c,z:routeZ(c.z)}));
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export const templeZoneAt=z=>TEMPLE_ZONES.find(q=>z>=q.from&&z<q.to)||TEMPLE_ZONES.at(-1);
export function hazardHits(h,p,r=12){
 if(h.kind==='head')return scyllaBiteContact(h,p);
 if(h.kind==='wave')return h.axis==='z'?Math.abs(p.z-h.z)<r+15&&Math.abs(p.x-h.gap)>h.gapSize/2-r:Math.abs(p.x-h.x)<r+15&&Math.abs(p.z-h.gap)>h.gapSize/2-r&&Math.abs(p.z-h.z)<(h.span||200);
 return Math.hypot(h.x-p.x,h.z-p.z)<h.r+r;
}
export class TempleGame{
 constructor({onEvent=()=>{},random=Math.random}={}){
  this.onEvent=onEvent;this.random=random;this.elapsed=0;this.health=3;this.delays=0;this.stunLeft=0;this.lostSeconds=0;this.reachedIthaca=false;this.songExposure=0;this.flashes=TEMPLE.recoveries;this.recoveries=0;this.shieldLeft=0;this.invulnerable=0;this.pigLeft=0;this.charmed=0;this.ended=false;this.failureReason=null;this.velocity={x:0,z:0};this.casts={};
  this.player={x:195,z:routeZ(80),y:routeZ(80),dir:'up',walk:0,moving:false,hammerAge:99};this.cameraZ=routeZ(80)-80;this.mode='walk';this.transitionLeft=0;this.phase='explore';this.banked=new Set();this.clueSources=new Set();this.found=new Set();this.cards=TEMPLE_CARDS.map(c=>({...c,collected:false}));this.effects=[];this.hazards=[];this.orbs=[];this.lightningStrikes=[];this.lightningSerial=0;this.recoveryNoticeLeft=0;
  this.recoveryItems=[{kind:'ambrosia',x:215,z:routeZ(3835)}];this.scyllaGrab=null;this.scyllaWithdrawn=new Set();this.sirenSlowLeft=0;
  this.zone=templeZoneAt(routeZ(80));this.zoneAge=0;this.zoneClock=0;this.attackWait=1.2;this.attackSerial=0;this.windDone=false;this.windBracing=false;this.headsLanded=new Set();
 }
 get remaining(){return Math.max(0,TEMPLE.duration-this.elapsed);}
 get isBoat(){return ['sail','boarding','landing'].includes(this.mode);}
 get windActive(){return !this.windDone&&this.player.z>=routeZ(1500)&&this.player.z<routeZ(1750)&&this.mode==='walk';}
 get interaction(){if(this.ended)return null;if(this.mode==='walk'&&this.player.z>=TEMPLE_DOCK.boardFrom&&this.player.z<=TEMPLE_DOCK.walkEnd&&this.player.x>=TEMPLE_DOCK.left+16&&this.player.x<=TEMPLE_DOCK.right-16)return '탑승';if(this.mode==='sail'&&this.player.z>=routeZ(4630)&&Math.abs(this.player.x-195)<95)return '하차';return null;}
 get canMove(){return !this.ended&&!this.scyllaGrab&&this.stunLeft<=0&&!['boarding','landing'].includes(this.mode);}
 get whirlpoolStrength(){return .5+.5*Math.sin(this.elapsed*1.35*TEMPLE_TEMPO);}
 get siren(){const phase=this.zoneClock%6.4,left=phase<3.2;return {x:left?28:362,z:routeZ(left?2190:2410),side:left?-1:1,age:phase%3.2,active:phase%3.2>=.85&&phase%3.2<2.95};}
 get canShield(){return !this.ended&&!this.scyllaGrab&&this.flashes>0&&this.shieldLeft<=0;}
 flash(){if(!this.canShield)return false;this.flashes--;this.shieldLeft=TEMPLE.shieldSeconds;this.charmed=0;this.songExposure=0;this.sirenSlowLeft=0;this.effects.push({kind:'recovery',x:this.player.x,z:this.player.z,age:0});this.onEvent({type:'recovery'});return true;}
 queueMove(input){if(this.canMove&&!this.windActive)this.queuedMove={input:{...input},left:.08};}
 interact(){if(!this.canMove||!this.interaction)return false;this.mode=this.mode==='walk'?'boarding':'landing';this.transitionLeft=.7;this.transit={x:this.player.x,z:this.player.z,targetZ:routeZ(this.mode==='boarding'?1910:4750)};this.player.moving=false;this.onEvent({type:'templeBoard'});return true;}
 movePlayer(dt,input={}){
  const p=this.player;p.moving=false;this.velocity={x:0,z:0};this.windBracing=false;if(!this.canMove)return;
  if(this.windActive){
   const oldX=p.x,oldZ=p.z,bracing=(input.x||0)<-.3,forward=(input.y||0)<-.3;
   this.windBracing=bracing;p.dir=forward?'up':bracing?'left':'right';
   // Left counters the rightward gust. Up moves forward only while braced.
   if(!bracing)p.x+=52*TEMPLE_TEMPO*dt*(1+Math.max(0,input.x||0)*.45);
   if(bracing&&forward)p.z+=TEMPLE.forwardSpeed*dt;
   else if((input.y||0)>.3)p.z-=TEMPLE.forwardSpeed*dt;
   p.x=clamp(p.x,56,328);
   if(!bracing&&p.x>=328)this.hit('wind');
   if(p.z>=routeZ(1750)){this.windDone=true;this.onEvent({type:'windClear'});}
   p.moving=this.stunLeft<=0&&movedDuringStep(p.x-oldX,p.z-oldZ,dt);
   if(p.moving)p.walk+=dt;
   p.y=p.z;this.velocity={x:(p.x-oldX)/dt,z:(p.z-oldZ)/dt};return;
  }
  let dx=clamp(input.x||0,-1,1),dz=-clamp(input.y||0,-1,1),n=Math.hypot(dx,dz);// Horizontal dodging remains responsive; forward pace is the same on land and sea.

  if(this.mode==='sail'&&this.zone.id==='siren'&&this.shieldLeft<=0&&sirenWaveContact(this.siren,p))this.sirenSlowLeft=SIREN.slowSeconds;
  const slow=this.sirenSlowLeft>0&&this.shieldLeft<=0?SIREN.speedRatio:1;
  const speed=(this.mode==='sail'?TEMPLE.boatSpeed:TEMPLE.speed)*slow,old={x:p.x,z:p.z};
  p.x+=dx*speed*dt;p.z+=dz*TEMPLE.forwardSpeed*slow*dt;
  if(this.zone.id==='siren'&&this.shieldLeft<=0){
   const s=this.siren,d=Math.hypot(p.x-s.x,p.z-s.z);
   if(s.active&&d<180&&Math.abs(p.z-s.z)<150){
    // Keep countersteering possible even at the slowest speed, near the singer.
    const f=Math.min(88*(1-d/260),TEMPLE.boatSpeed*slow*.72);
    p.x+=(s.x-p.x)/Math.max(d,1)*f*dt;p.z+=(s.z-p.z)/Math.max(d,1)*f*dt;this.charmed=.12;
   }
  }
  if(this.zone.id==='whirlpool'&&this.shieldLeft<=0){const dx=150-p.x,dz=routeZ(3585)-p.z,d=Math.hypot(dx,dz);if(d<142){const f=12+this.whirlpoolStrength*20;p.x+=dx/Math.max(1,d)*f*dt;p.z+=dz/Math.max(1,d)*f*dt;}}
  // Currents cannot accelerate forward travel and undermine the time budget.
  p.z=clamp(p.z,old.z-TEMPLE.forwardSpeed*slow*dt,old.z+TEMPLE.forwardSpeed*slow*dt);
  const sea=this.mode==='sail',left=sea?40:56,right=sea?(this.zone.id==='scylla'?280:350):334;
  p.x=clamp(p.x,left,right);p.z=clamp(p.z,routeZ(sea?1910:this.mode==='shore'?4750:40),sea?routeZ(4670):this.mode==='walk'?TEMPLE_DOCK.walkEnd:TEMPLE.goal);
  if(sea&&this.zone.id==='siren'&&sirenCaptureContact(this.siren,p)&&this.hit('siren')){
   // A real contact pushes the boat clear, leaving a fair chance to steer away.
   p.x=this.siren.side<0?74:316;this.songExposure=0;
  }
  // Walk along the actual pier to the stern; the water on either side stays closed.
  if(this.mode==='walk'&&p.z>TEMPLE_DOCK.approach){
   if(old.z<=TEMPLE_DOCK.approach&&(p.x<TEMPLE_DOCK.left+16||p.x>TEMPLE_DOCK.right-16))p.z=TEMPLE_DOCK.approach;
   else p.x=clamp(p.x,TEMPLE_DOCK.left+16,TEMPLE_DOCK.right-16);
  }
  if(!this.windDone&&p.z>=routeZ(1500)&&old.z<routeZ(1500)){p.z=routeZ(1500);}
  if(n)p.dir=Math.abs(dx)>Math.abs(dz)?dx<0?'left':'right':dz>0?'up':'down';
  p.moving=movedDuringStep(p.x-old.x,p.z-old.z,dt);if(p.moving)p.walk+=dt;p.y=p.z;this.velocity={x:(p.x-old.x)/dt,z:(p.z-old.z)/dt};
 }
 hit(reason){
  if(this.ended||this.invulnerable>0||this.shieldLeft>0||this.scyllaGrab?.hitApplied)return false;
  this.failureReason=reason;
  if(reason==='pig')this.pigLeft=TEMPLE.pigSeconds;
  const hit=damage(this,reason==='pig'?'pig':'templeHit',reason,'invulnerable');
  if(hit){this.delays++;this.effects.push({kind:'hit',x:this.player.x,z:this.player.z,age:0});}return hit;
 }
 grabByScylla(h){
  if(this.scyllaGrab||this.ended||this.invulnerable>0||this.shieldLeft>0)return false;
  this.scyllaGrab={head:h.head,from:scyllaAttackPose(h),boat:{x:this.player.x,z:this.player.z},cameraZ:this.cameraZ,age:0,defeated:false,hitApplied:false};
  if(!this.hit('head')){this.scyllaGrab=null;return false;}
  this.scyllaGrab.hitApplied=true;this.player.moving=false;this.queuedMove=null;this.velocity={x:0,z:0};return true;
 }
 advanceScyllaGrab(dt){
  const grab=this.scyllaGrab;grab.age+=dt;
  if(grab.age>=SCYLLA.enter)this.scyllaWithdrawn.add(grab.head);
  // Follow the carried explorer even when the first attack is far below the cave.
  // The return follows the same camera path back to the unchanged boat.
  this.cameraZ=grab.cameraZ+scyllaGrabPose(grab).hero.z-(grab.boat.z+11);
  this.advanceHazards(dt,false);
  if(grab.defeated&&grab.age>=SCYLLA.release){grab.done=true;this.finish(false);return;}
  if(grab.age>=SCYLLA.return){this.scyllaGrab=null;this.invulnerable=Math.max(this.invulnerable,1.3);this.attackWait=Math.max(this.attackWait,.8);if(this.remaining<=1e-6)this.finish(true);}
 }
 advanceHazards(dt,contacts=true){
  for(const h of this.hazards){
   h.age+=dt*TEMPLE_TEMPO;
   if(h.kind==='wave'&&h.age>=h.warn){if(h.axis==='z')h.z+=h.v*dt*TEMPLE_TEMPO;else h.x+=h.v*dt*TEMPLE_TEMPO;}
   if(h.age<h.warn||h.age>=h.life)continue;
   if(h.kind==='bolt'&&!h.applied){h.applied=true;this.lightningStrikes.push({id:++this.lightningSerial,x:h.x,z:h.z,r:h.r});if(this.lightningStrikes.length>12)this.lightningStrikes.shift();}
   if(h.kind==='head'){
    if(!h.applied&&h.age>=h.warn+SCYLLA.reach){h.applied=true;this.headsLanded.add(h.head);if(this.headsLanded.size===6)this.cards[5].locked=false;}
    if(contacts&&!this.scyllaGrab&&scyllaBiteContact(h,this.player)){h.bit=true;this.grabByScylla(h);}
   }else if(contacts&&!this.scyllaGrab&&hazardHits(h,this.player,this.isBoat?15:9))this.hit(h.kind);
   if(this.ended)break;
  }
  this.hazards=this.hazards.filter(h=>h.age<h.life);
 }

 collect(){for(const c of this.cards)if(!c.collected&&!c.locked&&Math.hypot(c.x-this.player.x,c.z-this.player.z)<25){c.collected=true;const earned=awardClue(this,c.id);this.effects.push({kind:'card',x:c.x,z:c.z,age:0});this.onEvent({type:'card',id:earned,x:c.x,y:c.z});}}
 spawnAttack(){
  const p=this.player,id=this.zone.id,n=this.attackSerial++;
  if(id==='temple'){
   const warn=1.05,moving=Math.hypot(this.velocity.x,this.velocity.z)>1;
   // Lock the predicted arrival point once. A sidestep after the warning is safe.
   this.hazards.push({kind:'bolt',x:clamp(p.x+this.velocity.x*warn/TEMPLE_TEMPO,56,334),z:clamp(p.z+(moving?this.velocity.z*warn/TEMPLE_TEMPO:0),routeZ(60),routeZ(825)),r:27,age:0,warn,life:1.45,applied:false});this.casts.zeus=0;this.attackWait=2.6;
  }
  if(id==='circe'){
   const x=308,z=routeZ(1290),speed=CIRCE_ORB_SPEED,lead=Math.min(1.4,.36+Math.hypot(p.x-x,p.z-z)/speed),targetX=clamp(p.x+this.velocity.x*lead,56,334),targetZ=clamp(p.z+this.velocity.z*lead,routeZ(870),routeZ(1450)),dx=targetX-x,dz=targetZ-z,d=Math.max(1,Math.hypot(dx,dz));
   this.orbs.push({x,z,vx:dx/d*speed,vz:dz/d*speed,age:0,launchDelay:.36,targetX,targetZ});this.casts.circe=0;this.attackWait=1.9;
  }
  if(id==='scylla'){
   const other=clamp(p.x+(n%2?95:-95),65,325);for(let i=0;i<2;i++){const head=(n*2+i)%6;this.hazards.push({kind:'head',head,fromCave:this.scyllaWithdrawn.has(head),x:i?other:p.x,z:clamp(p.z+(i?routeZ(64):0),routeZ(2620),routeZ(3280)),r:25,age:0,warn:1.1+i*.16,life:1.92+i*.16,applied:false});}this.attackWait=2.4;
  }
  if(id==='poseidon'){this.casts.poseidon=0;
   if(n%3===2)this.hazards.push({kind:'wave',axis:'x',x:n%2?-65:455,z:p.z+routeZ(100),gap:p.z+routeZ(65),gapSize:routeZ(115),span:routeZ(200),v:n%2?150:-150,age:0,warn:1.1,life:4.95});
   else this.hazards.push({kind:'wave',axis:'z',x:195,z:p.z+routeZ(325),gap:[102,272,195][n%3],gapSize:125,v:-routeZ(145),age:0,warn:.35,life:5.2});this.attackWait=2.3;
  }
 }
 update(dt,input={}){if(this.ended||!Number.isFinite(dt)||dt<=0)return;let left=Math.min(dt,TEMPLE.duration);while(left>1e-9&&!this.ended){const step=Math.min(left,1/90);this.step(step,input);left-=step;}}
 step(dt,input){
  tickVitality(this,dt);
  this.recoveryNoticeLeft=Math.max(0,this.recoveryNoticeLeft-dt);
  this.sirenSlowLeft=Math.max(0,this.sirenSlowLeft-dt);
  this.lostSeconds+=Math.min(dt,this.stunLeft);this.stunLeft=Math.max(0,this.stunLeft-dt);
  this.elapsed=Math.min(TEMPLE.duration,this.elapsed+dt);this.zoneAge+=dt;this.zoneClock+=dt*TEMPLE_TEMPO;this.shieldLeft=Math.max(0,this.shieldLeft-dt);this.invulnerable=Math.max(0,this.invulnerable-dt);this.pigLeft=Math.max(0,this.pigLeft-dt);this.charmed=Math.max(0,this.charmed-dt);
  this.effects.forEach(e=>e.age+=dt);this.effects=this.effects.filter(e=>e.age<.9);
  for(const id of Object.keys(this.casts))this.casts[id]+=dt*TEMPLE_TEMPO;
  if(this.scyllaGrab){this.advanceScyllaGrab(dt);return;}
  if(this.remaining<=1e-6){this.finish(true);return;}
  if(this.transitionLeft>0){
   this.transitionLeft=Math.max(0,this.transitionLeft-dt);const f=1-this.transitionLeft/.7,ease=f*f*(3-2*f),p=this.player;
   p.x=this.transit.x+(195-this.transit.x)*ease;p.z=this.transit.z+(this.transit.targetZ-this.transit.z)*ease;p.y=p.z;
   this.cameraZ+=(Math.max(0,p.z-80)-this.cameraZ)*Math.min(1,dt*8);
   if(this.transitionLeft<=0){if(this.mode==='landing')this.dockedBoat={x:this.transit.x,z:this.transit.z};this.mode=this.mode==='boarding'?'sail':'shore';this.transit=null;}return;
  }
  if(this.queuedMove){if(input.x||input.y)this.queuedMove=null;else{input=this.queuedMove.input;this.queuedMove.left-=dt;if(this.queuedMove.left<=0)this.queuedMove=null;}}
  this.movePlayer(dt,input);const next=templeZoneAt(this.player.z);if(next.id!==this.zone.id){this.zone=next;this.zoneAge=0;this.zoneClock=0;this.attackWait=1.4;this.attackSerial=0;this.hazards=this.hazards.filter(h=>h.kind==='bolt'&&h.age<h.life);this.orbs=[];this.onEvent({type:'templeZone',zone:next.id});}
  this.cameraZ+=(Math.max(0,this.player.z-80)-this.cameraZ)*Math.min(1,dt*8);
  this.attackWait-=dt*TEMPLE_TEMPO;if(['temple','circe','scylla','poseidon'].includes(this.zone.id)&&this.attackWait<=0&&(this.zone.id!=='scylla'||this.player.z>=routeZ(2720)))this.spawnAttack();
  this.advanceHazards(dt);if(this.ended||this.scyllaGrab)return;
  for(const b of this.orbs){b.age+=dt*TEMPLE_TEMPO;if(b.age<(b.launchDelay||0))continue;b.x+=b.vx*dt;b.z+=b.vz*dt;
   if(b.age<5&&Math.hypot(b.x-this.player.x,b.z-this.player.z)<18){b.age=9;this.hit('pig');}
  }this.orbs=this.orbs.filter(b=>b.age<5);
  if(this.zone.id==='whirlpool'&&this.whirlpoolStrength>.6&&Math.hypot(this.player.x-150,this.player.z-routeZ(3585))<34)this.hit('whirlpool');
  if(this.ended)return;collectRecovery(this,this.player);this.collect();if(this.mode==='shore'&&this.cards[8].collected){this.reachedIthaca=true;this.finish(true);}
 }
 finish(survived){if(this.ended)return;if(!survived&&this.scyllaGrab&&!this.scyllaGrab.done){this.scyllaGrab.defeated=true;return;}this.ended=true;this.player.moving=false;this.phase=survived?'returned':'failed';this.onEvent({type:'end',survived,elapsed:this.elapsed,found:[...this.found],reason:this.failureReason,reachedIthaca:this.reachedIthaca,delays:this.delays});}
}
