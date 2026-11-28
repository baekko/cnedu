import {movedDuringStep} from './walk-cycle.js';
import {awardClue,hasSource} from './clue-order.js';
export const HISTORY=Object.freeze({duration:20,travelSeconds:5,speed:118,boostSeconds:5,boosts:1,hammerCooldown:.4,hammerImpact:.18,hammerRange:38,answer:'독수리',hints:['날아다니는 생물입니다.','맹금류입니다.']});
// Mechanical choreography never spends exploration time.
export const MACHINE_TIMING=Object.freeze({seat:.75,fold:.65,close:.65,power:.45,open:.65,unfold:.65,exit:.8});
export const BOARD_SECONDS=MACHINE_TIMING.seat+MACHINE_TIMING.fold+MACHINE_TIMING.close+MACHINE_TIMING.power;
export const EXIT_SECONDS=MACHINE_TIMING.open+MACHINE_TIMING.unfold+MACHINE_TIMING.exit;
// Every era has its own clue route and breakable position. Spawn clearances are
// measured from every enemy, not just the one owning that territory.
export const ERAS=[
 {id:'jerusalem',name:'중세 예루살렘',tag:'첫 번째 시간 여행',container:'나무상자',row:0,guardian:2,guardNotice:.4,cards:[[145,205],[290,266]],box:[138,325],mobs:[['knight',70,105,[60,100,126,146],.5],['knight',320,110,[218,100,110,210],.5],['knight',64,290,[60,218,156,196],1]]},
 {id:'pyramid',name:'고대 이집트 피라미드',tag:'두 번째 시간 여행',container:'관',row:1,guardian:3,guardNotice:.4,cards:[[160,140],[260,255]],box:[130,320],mobs:[['mummy',64,205,[60,100,126,146],.5],['mummy',320,110,[210,100,118,186],.5],['mummy',315,365,[248,292,80,113],.5],['anubis',75,270,[52,210,164,172],1]]},
 {id:'prehistoric',name:'공룡 시대',tag:'세 번째 시간 여행',container:'빈 공룡알',row:2,guardian:3,guardians:[1,3],cards:[[150,230],[240,140]],box:[270,305],mobs:[['dino0',70,105,[60,100,126,180],.5],['dino1',320,225,[198,100,142,258],.5],['dino2',70,370,[60,292,110,120],.5],['dino3',320,405,[198,218,142,210],1]]},
];
// v183 museum painting, in the shared 390×500 room coordinates. The green
// inlay's inner edge starts at y110, x47..343 and widens by .232px per depth px.
// Contact belongs to the shoes (12×3px half-footprint), not the hero's head.
export const MUSEUM_FLOOR=Object.freeze({top:110,left:47,right:343,spread:.232,footX:12,footY:3});
export const HISTORY_BOUNDS=Object.freeze({museum:{left:12,right:378,top:114,bottom:496},era:{left:64,right:326,top:100,bottom:466}});
export function museumWalkBounds(y){
 const b=HISTORY_BOUNDS.museum,f=MUSEUM_FLOOR,depth=Math.max(0,y-f.footY-f.top);
 return {...b,left:Math.max(b.left,f.left-depth*f.spread+f.footX),right:Math.min(b.right,f.right+depth*f.spread-f.footX)};
}
export function containerDistance(p,box,row,ratio=1){
 // The front-facing hand sits above the foot anchor; include its 12px reach.
 const w=row===1?65:55;
 const dx=Math.max(Math.abs(p.x-box.x)-w/2,0),dy=Math.max((box.y-p.y)*ratio-w*.84,(p.y-box.y)*ratio-w*.16-12,0);
 return Math.hypot(dx,dy);
}
const DINOSAUR_SCALE=.8;
export const HISTORY_ACTORS=Object.freeze({heroSize:56,personSize:60,dinosaurSize:168*DINOSAUR_SCALE,dinosaurStride:98*DINOSAUR_SCALE,walkFps:4,personContact:20,dinosaurContact:26*DINOSAUR_SCALE});
export const inside=(p,z)=>p.x>=z[0]&&p.x<=z[0]+z[2]&&p.y>=z[1]&&p.y<=z[1]+z[3];
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const facing=(dx,dy,old='down')=>Math.abs(dx)>Math.abs(dy)?dx<0?'left':'right':dy?dy<0?'up':'down':old;
export class HistoryGame{
 constructor({onEvent=()=>{}}={}){
  this.onEvent=onEvent;this.phase='intro';this.phaseTime=0;this.eraIndex=-1;this.destination=0;this.remaining=20;this.elapsed=0;this.ended=false;this.health=1;this.flashes=HISTORY.boosts;this.boostLeft=0;this.banked=new Set();this.clueSources=new Set();this.found=new Set();this.effects=[];this.mobs=[];this.cards=[];this.box=null;
  this.player={x:195,y:456,dir:'up',walk:0,moving:false,hammerAge:99};this.machine={x:195,y:275};this.hammerWait=0;this.pendingHit=false;this.failureReason=null;
 }
 get era(){return ERAS[this.eraIndex];}
 get scene(){return this.era?.id||'museum';}
 get canMove(){return ['intro','ready','explore'].includes(this.phase)&&!this.ended;}
 get nearMachine(){return Math.hypot(this.player.x-this.machine.x,(this.player.y-this.machine.y)*(this.sceneRatio||1)-18)<43;}
 get interaction(){if(this.phase==='docked')return '하차하기';if((this.phase==='ready'||this.phase==='explore')&&this.nearMachine)return '탑승하기';return null;}
 movePlayer(dt,input={}){
  const p=this.player;p.moving=false;if(!this.canMove)return;
  let dx=clamp(input.x||0,-1,1),dy=clamp(input.y||0,-1,1);const n=Math.hypot(dx,dy);if(!n)return;
  dx/=n;dy/=n;const speed=HISTORY.speed*(this.boostLeft>0?2:1);const old={x:p.x,y:p.y};
  const bounds=this.eraIndex<0?HISTORY_BOUNDS.museum:HISTORY_BOUNDS.era;
  p.y=clamp(p.y+dy*speed*dt,bounds.top,bounds.bottom);
  const sides=this.eraIndex<0?museumWalkBounds(p.y):bounds;
  p.x=clamp(p.x+dx*speed*dt,sides.left,sides.right);
  if(this.box&&this.box.hits<3&&Math.hypot(p.x-this.box.x,(p.y-this.box.y)*1.3*(this.sceneRatio||1))<24){p.x=old.x;p.y=old.y;}
  p.dir=facing(dx,dy,p.dir);p.moving=movedDuringStep(p.x-old.x,p.y-old.y,dt);if(p.moving)p.walk+=dt*(this.boostLeft>0?1.7:1);
 }
 hammer(){if(!this.canMove||this.hammerWait>0)return false;this.hammerWait=HISTORY.hammerCooldown;if(this.box&&containerDistance(this.player,this.box,this.era.row,this.sceneRatio||1)<=HISTORY.hammerRange)this.player.dir=facing(this.box.x-this.player.x,this.box.y-15-this.player.y,this.player.dir);this.player.hammerAge=0;this.pendingHit=true;this.onEvent({type:'hammer'});return true;}
 flash(){if(this.phase!=='explore'||this.ended||this.boostLeft>0||!this.flashes)return false;this.flashes--;this.boostLeft=HISTORY.boostSeconds;this.onEvent({type:'boost'});return true;}
 interact(){
  if(this.ended)return false;
  if(this.phase==='docked'){this.phase='disembarking';this.phaseTime=0;this.player.moving=false;this.onEvent({type:'doorOpen',era:this.eraIndex});return true;}
  if((this.phase==='ready'||this.phase==='explore')&&this.nearMachine){if(this.phase==='explore'&&this.remaining<=0)return false;this.destination=this.eraIndex+1;this.departure={...this.player};this.phase='boarding';this.phaseTime=0;this.pendingHit=false;this.boostLeft=0;this.player.moving=false;this.onEvent({type:'boarding',destination:this.destination});return true;}return false;
 }
 arrive(){
  if(this.destination>=3){this.eraIndex=-1;this.machine={x:195,y:275};this.player={...this.player,x:195,y:321,dir:'down',moving:false,hammerAge:99};this.mobs=[];this.cards=[];this.box=null;this.phase='disembarking';this.phaseTime=0;this.onEvent({type:'return'});return;}
  this.eraIndex=this.destination;const era=this.era;this.machine={x:195,y:428};this.remaining=20;this.phase='docked';this.phaseTime=0;this.player={...this.player,x:195,y:425,dir:'down',moving:false,hammerAge:99};
  this.cards=era.cards.map(([x,y],i)=>({x,y,id:this.eraIndex*3+i+1,collected:false}));this.box={x:era.box[0],y:era.box[1],hits:0,flash:0};
  this.mobs=era.mobs.map(([kind,x,y,zone,factor],i)=>({kind,x,y,home:{x,y},zone,factor,dir:'down',walk:0,moving:false,status:'home',id:i,guardian:(era.guardians||[era.guardian]).includes(i),alert:false,noticeLeft:0}));
  this.onEvent({type:'arrival',era:this.eraIndex});
 }
 update(dt,input={}){if(this.ended||!Number.isFinite(dt)||dt<=0)return;let left=Math.min(dt,65);while(left>0&&!this.ended){const step=Math.min(left,1/90);this.step(step,input);left-=step;}}
 step(dt,input){
  this.phaseTime+=dt;this.hammerWait=Math.max(0,this.hammerWait-dt);this.player.hammerAge+=dt;
  if(this.phase==='intro'&&this.phaseTime>=5){this.phase='ready';this.phaseTime=0;this.onEvent({type:'boardPrompt'});}
  if(this.phase==='boarding'){
   if(this.phaseTime+1e-9>=BOARD_SECONDS){this.phase='travel';this.phaseTime=0;this.onEvent({type:'travel',destination:this.destination});}return;
  }
  if(this.phase==='travel'){if(this.phaseTime+1e-9>=HISTORY.travelSeconds)this.arrive();return;}
  if(this.phase==='disembarking'){
   if(this.phaseTime+1e-9>=EXIT_SECONDS){
    this.player={...this.player,x:this.machine.x,y:this.eraIndex<0?321:463,dir:'down',moving:false,hammerAge:99};this.phaseTime=0;
    if(this.eraIndex<0){this.phase='returned';this.finish(true);}else{this.phase='explore';this.remaining=HISTORY.duration;this.onEvent({type:'disembark',era:this.eraIndex});}
   }return;
  }
  if(this.phase==='returned')return;
  if(this.phase==='docked')return;
  this.movePlayer(dt,input);
  if(input.hammer)this.hammer();
  if(this.pendingHit&&this.player.hammerAge>=HISTORY.hammerImpact){this.pendingHit=false;this.strike();}
  if(this.box)this.box.flash=Math.max(0,this.box.flash-dt);
  this.effects.forEach(e=>e.age+=dt);this.effects=this.effects.filter(e=>e.age<.8);
  if(this.phase!=='explore')return;
  this.boostLeft=Math.max(0,this.boostLeft-dt);this.elapsed+=dt;this.remaining=Math.max(0,this.remaining-dt);
  for(const m of this.mobs){this.moveMob(m,dt);if(inside(this.player,m.zone)&&Math.hypot(m.x-this.player.x,(m.y-this.player.y)*1.2*(this.sceneRatio||1))<(m.kind.startsWith('dino')?HISTORY_ACTORS.dinosaurContact:HISTORY_ACTORS.personContact)){this.failureReason='caught';this.caughtBy=m.kind;this.finish(false);return;}}
  for(const card of this.cards)if(!card.collected&&Math.hypot(card.x-this.player.x,(card.y-this.player.y)*1.2*(this.sceneRatio||1))<20){card.collected=true;const earned=awardClue(this,card.id);this.effects.push({x:card.x,y:card.y,age:0,type:'card'});this.onEvent({type:'card',id:earned,x:card.x,y:card.y});}
  if(this.remaining<=.00001){this.remaining=0;this.failureReason='timeout';this.finish(false);}
 }
 strike(){
  if(!this.box||this.box.hits>=3)return;const p=this.player,b=this.box;
  if(containerDistance(p,b,this.era.row,this.sceneRatio||1)>HISTORY.hammerRange)return;
  b.hits++;b.flash=.2;this.effects.push({x:b.x,y:b.y,age:0,type:'debris'});this.onEvent({type:'break',hits:b.hits,name:this.era.container});
  if(b.hits===3)this.cards.push({x:b.x,y:b.y,id:this.eraIndex*3+3,collected:false});
 }
 moveMob(m,dt){
  const inZone=inside(this.player,m.zone);
  // Container guards notice an approach only within hammer reach. They stay alert
  // until the explorer leaves their territory, so retreating still matters.
  if(!inZone){m.alert=false;m.noticeLeft=0;}
  const nearContainer=this.box&&containerDistance(this.player,this.box,this.era.row,this.sceneRatio||1)<=HISTORY.hammerRange;
  const nearFloorCard=this.cards.some(c=>!c.collected&&c.id%3!==0&&inside(c,m.zone)&&Math.hypot(c.x-this.player.x,c.y-this.player.y)<90);
  if(m.guardian&&inZone&&(nearContainer||nearFloorCard)&&!m.alert){m.alert=true;m.noticeLeft=this.era.guardNotice||0;}
  const chasing=inZone&&(!m.guardian||m.alert),target=chasing?this.player:m.home;const dx=target.x-m.x,dy=target.y-m.y,d=Math.hypot(dx,dy);m.status=chasing?'chase':d>1?'return':'home';m.moving=d>1;
  // A short turn-to-notice gives an approaching explorer time for one impact.
  // It is spent once per approach, never refreshed while staying in the zone.
  if(chasing&&m.noticeLeft>0){const wait=Math.min(dt,m.noticeLeft);m.noticeLeft-=wait;dt-=wait;m.dir=facing(dx,dy,m.dir);if(dt<1e-9){m.moving=false;return;}}
  if(d>1){const ox=m.x,oy=m.y,step=Math.min(d,HISTORY.speed*m.factor*dt);m.x=clamp(m.x+dx/d*step,m.zone[0],m.zone[0]+m.zone[2]);m.y=clamp(m.y+dy/d*step,m.zone[1],m.zone[1]+m.zone[3]);m.dir=facing(dx,dy,m.dir);const travelled=Math.hypot(m.x-ox,m.y-oy);m.moving=movedDuringStep(travelled,0,dt);if(m.moving)m.walk+=travelled/(HISTORY.speed*m.factor);}
 }
 finish(survived){if(this.ended)return;this.ended=true;this.player.moving=false;this.mobs.forEach(m=>m.moving=false);this.onEvent({type:'end',survived,elapsed:this.elapsed,found:[...this.found],reason:this.failureReason});}
}
