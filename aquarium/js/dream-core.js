import {FLAT_WALK_SPEED,movedDuringStep} from './walk-cycle.js';
import {awardClue,hasSource} from './clue-order.js';
import {damage,collectRecovery,tickVitality} from './vitality.js';
export const DREAM=Object.freeze({duration:90,speed:FLAT_WALK_SPEED,width:9600,height:500,roomWidth:3200,ceiling:80,floor:424,gravity:1000,jumpSpeed:460,halfHeight:21,halfWidth:11,flashes:1,eraseSeconds:4,stunSeconds:0,answer:'카멜레온',hints:['파충류입니다.','몸의 색을 바꿀 수 있습니다.']});
export const DREAM_ROOMS=Object.freeze(['거꾸로 된 침실','하늘에 떠 있는 거리','거대한 시계탑']);
export const DREAM_GAPS=Object.freeze([
 {side:1,x:2240,w:170},{side:-1,x:1970,w:105},
 {side:1,x:3560,w:550},{side:-1,x:3560,w:550},
 {side:1,x:4780,w:350},{side:-1,x:4780,w:350},
 {side:1,x:7870,w:410},{side:-1,x:7870,w:410},
 {side:1,x:8500,w:180}
].map(Object.freeze));
export const DREAM_PLATFORMS=Object.freeze([
 {id:'book-a',x:1480,y:354,w:100,h:16,kind:'book'},
 {id:'book-b',x:1610,y:284,w:100,h:16,kind:'book'},
 {id:'book-c',x:1740,y:214,w:130,h:16,kind:'book'},
 {id:'sky-a',x:3480,y:365,w:110,h:16,kind:'roof'},
 {id:'sky-ferry',x:3690,y:320,w:120,h:16,kind:'roof',moveX:95,period:3.6},
 {id:'sky-b',x:3890,y:258,w:130,h:16,kind:'roof'},
 {id:'sky-c',x:4070,y:340,w:100,h:16,kind:'roof'},
 {id:'traffic-a',x:4690,y:353,w:120,h:16,kind:'roof'},
 {id:'traffic-b',x:4860,y:310,w:95,h:16,kind:'roof',moveY:25,period:3.2},
 {id:'traffic-c',x:5020,y:270,w:100,h:16,kind:'roof'},
 {id:'clock-a',x:7770,y:355,w:100,h:16,kind:'brass'},
 {id:'clock-lift',x:7890,y:307,w:110,h:16,kind:'brass',moveY:62,period:3.8},
 {id:'clock-b',x:8050,y:225,w:120,h:16,kind:'brass'},
 {id:'clock-c',x:8230,y:330,w:110,h:16,kind:'brass'},
 {id:'primer',x:650,y:337,w:140,h:16,kind:'book'},
 {id:'pendulum-plinth',x:7050,y:337,w:120,h:16,kind:'brass'}
].map(Object.freeze));
// Solid lintels block the effortless ceiling-to-card shortcut; the open sides
// remain visible and reachable by jumping. They are part of the collision world.
export const DREAM_SOLIDS=Object.freeze([
 {x:615,y:224,w:215,h:18,kind:'book'},
 {x:1440,y:138,w:465,h:18,kind:'book'},
 {x:2634,y:268,w:220,h:18,kind:'book'}, {x:2842,y:286,w:12,h:138,kind:'book',untilCard:3},
 {x:3570,y:145,w:520,h:18,kind:'roof'},
 {x:4780,y:135,w:350,h:18,kind:'roof'},
 {x:5930,y:215,w:225,h:18,kind:'roof'}, {x:6143,y:80,w:12,h:135,kind:'roof',untilCard:6},
 {x:6970,y:185,w:270,h:18,kind:'brass'},
 {x:7870,y:133,w:410,h:18,kind:'brass'},
 {x:9100,y:270,w:220,h:18,kind:'brass'}
].map(Object.freeze));
export const DREAM_SWITCHES=Object.freeze([
 {id:'bed-switch',x:2480,y:80,side:-1,gate:'bed-lock'},
 {id:'sky-switch',x:5730,y:424,side:1,gate:'sky-lock'}
].map(Object.freeze));
export const DREAM_GATES=Object.freeze([
 {id:'bed-lock',x:2634,y:286,w:12,h:138,card:3,switch:'bed-switch',seconds:4.8},
 {id:'sky-lock',x:5930,y:80,w:12,h:135,card:6,switch:'sky-switch',seconds:4.8}
].map(Object.freeze));
export const DREAM_SPRINGS=Object.freeze([{x:2200,y:424},{x:8480,y:424}].map(Object.freeze));
export const DREAM_CARDS=Object.freeze([
 {id:1,x:720,y:307},{id:2,x:1800,y:185},{id:3,x:2750,y:367},
 {id:4,x:3955,y:229},{id:5,x:5070,y:241},{id:6,x:6050,y:119},
 {id:7,x:7110,y:307},{id:8,x:8110,y:196},{id:9,x:9200,y:365}
].map(c=>Object.freeze({...c,room:Math.floor(c.x/DREAM.roomWidth)})));
export function platformAt(f,time){const a=time*Math.PI*2/(f.period||1);return {...f,x:f.x+Math.sin(a)*(f.moveX||0),y:f.y+Math.sin(a)*(f.moveY||0)};}
export const DREAM_HAZARDS=Object.freeze([
 {id:'train-1',type:'train',x:435,y:404,range:60,rate:1.7,w:72,h:39},
 {id:'fan-1',type:'fan',x:1050,y:111,r:27},
 {id:'train-2',type:'train',x:1220,y:404,range:110,rate:1.8,w:72,h:39},
 {id:'fan-2',type:'fan',x:2170,y:111,r:27},
 {id:'train-3',type:'train',x:3090,y:404,range:40,rate:1.8,w:72,h:39},
 {id:'fan-3',type:'fan',x:2960,y:111,r:27},
 {id:'car-1',type:'car',x:4090,y:300,range:70,rate:1.3,sway:25,w:72,h:34},
 {id:'sign-1',type:'sign',x:4300,y:230,range:0,rate:1.5,sway:85,w:57,h:35},
 {id:'car-2',type:'car',x:4940,y:180,range:120,rate:1.65,sway:20,w:72,h:34},
 {id:'sign-2',type:'sign',x:5520,y:140,range:0,rate:1.4,sway:35,w:57,h:35},
 {id:'car-3',type:'car',x:4940,y:390,range:130,rate:1.9,sway:10,w:72,h:34},
 {id:'car-4',type:'car',x:6290,y:389,range:70,rate:1.5,sway:8,w:72,h:34},
 {id:'pendulum-1',type:'pendulum',x:7060,y:80,length:270,rate:1.5,phase:.5,r:24},
 {id:'gear-1',type:'gear',x:6820,y:408,r:29},
 {id:'gear-2',type:'gear',x:7440,y:103,r:29},
 {id:'shutter-1',type:'shutter',x:7530,y:252,phase:0,w:19,h:338},
 {id:'pendulum-2',type:'pendulum',x:7280,y:80,length:258,rate:1.65,phase:1.2,r:24},
 {id:'gear-3',type:'gear',x:8800,y:103,r:29},
 {id:'shutter-3',type:'shutter',x:9290,y:252,phase:2.8,w:19,h:338},
 {id:'shutter-2',type:'shutter',x:9120,y:252,phase:1.7,w:19,h:338}
].map(Object.freeze));
export const DREAM_EXIT=Object.freeze({x:9480,y:387,r:49});
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const overlap=(a,b)=>Math.abs(a.x-b.x)<(a.w+b.w)/2&&Math.abs(a.y-b.y)<(a.h+b.h)/2;
export function hazardAt(h,time){
 const t=time*(h.rate||1)+(h.phase||0);let x=h.x,y=h.y,active=true,warning=false,angle=0;
 if(h.type==='train')x+=Math.sin(t)*(h.range||0);
 if(h.type==='car'||h.type==='sign'){x+=Math.sin(t)*(h.range||0);y+=Math.sin(t*.83)*(h.sway||0);}
 if(h.type==='pendulum'){angle=Math.sin(t)*.72;x+=Math.sin(angle)*h.length;y+=Math.cos(angle)*h.length;}
 if(h.type==='shutter'){const q=(time+(h.phase||0))%4.6;warning=q>=2.8&&q<3.55;active=q>=3.55;}
 return {...h,x,y,angle,active,warning};
}
export function touchingHazard(player,h){
 if(!h.active)return false;const b={x:player.x,y:player.y,w:DREAM.halfWidth*2,h:DREAM.halfHeight*2};
 if(h.r){const dx=Math.max(0,Math.abs(b.x-h.x)-b.w/2),dy=Math.max(0,Math.abs(b.y-h.y)-b.h/2);return dx*dx+dy*dy<=h.r*h.r;}
 return overlap(b,h);
}
export function hasSurface(x,side,margin=0){return x>=0&&x<=DREAM.width&&!DREAM_GAPS.some(g=>g.side===side&&x>g.x-margin&&x<g.x+g.w+margin);}
export class DreamGame{
 constructor({onEvent=()=>{}}={}){
  this.onEvent=onEvent;this.elapsed=0;this.phase='entering';this.phaseAge=0;this.ended=false;this.health=3;this.flashes=DREAM.flashes;this.banked=new Set();this.clueSources=new Set();this.found=new Set();this.effects=[];this.erasedUntil=new Map();this.gateUntil=new Map();this.switchesUsed=new Set();this.platformRides=new Set();this.jumpCards=new Set();
  this.player={x:72,y:403,vx:0,vy:0,gravity:1,onGround:true,support:'floor',dir:'right',moving:false,walk:0,angle:0,landAge:99};
  this.camera={x:0,y:0};this.lastSafe={x:72,y:403,gravity:1,support:'floor'};this.stunLeft=0;this.invincibleLeft=0;this.springLeft=0;this.recoveryItems=[{kind:'moonCandy',x:4580,y:403}];this.hits=0;this.flipCount=0;this.jumpCount=0;this.queuedMove=null;this.reachedExit=false;this.visited=new Set([0]);this.notice='';this.noticeLeft=0;
 }
 get room(){return clamp(Math.floor(this.player.x/DREAM.roomWidth),0,2);}
 get remaining(){return Math.max(0,DREAM.duration-this.elapsed);}
 get canMove(){return !this.ended&&this.phase==='explore'&&this.stunLeft===0;}
 get canShift(){return this.canMove&&this.player.onGround;}
 get canJump(){return this.canShift;}
 get eraseTarget(){const p=this.player,dir=p.dir==='left'?-1:1;return this.hazards().filter(h=>!h.erased&&Math.hypot(h.x-p.x,h.y-p.y)<=250&&(h.x-p.x)*dir>=-30&&(h.x-p.x)*dir<=250&&h.x>=this.camera.x-35&&h.x<=this.camera.x+425).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0]||null;}
 get canErase(){return this.canMove&&this.flashes>0&&!!this.eraseTarget;}
 get prompt(){if(this.phase!=='explore'||this.ended)return '';if(this.noticeLeft>0)return this.notice;const x=this.player.x;if(x<840&&!hasSource(this,1))return '점프해서 책장 아래 단서를 잡아요';if(x>1410&&x<1900&&!hasSource(this,2))return '책 발판을 차례로 뛰어올라요';if(x>2400&&x<2855&&!hasSource(this,3))return '천장 스위치를 밟으면 문이 열려요';if(x>3480&&x<4110&&!hasSource(this,4))return '움직이는 발판에 올라타고 건너요';if(x>5660&&x<6160&&!hasSource(this,6))return '바닥 스위치를 밟고 천장으로 가요';if(x>7760&&x<8340&&!hasSource(this,8))return '승강 발판이 올라올 때 뛰어요';return '';}
 say(message,seconds=2){this.notice=message;this.noticeLeft=seconds;}
 queueMove(direction){this.queuedMove={x:direction.x||0,y:0,left:.075};}
 hazards(){return DREAM_HAZARDS.map(h=>({...hazardAt(h,this.elapsed),erased:(this.erasedUntil.get(h.id)||0)>this.elapsed,eraseLeft:Math.max(0,(this.erasedUntil.get(h.id)||0)-this.elapsed)}));}
 act(){
  if(!this.canShift)return false;const p=this.player;p.gravity*=-1;p.onGround=false;p.support=null;p.vy=p.gravity*35;this.flipCount++;this.effects.push({type:'flip',x:p.x,y:p.y,age:0});this.onEvent({type:'dreamShift'});return true;
 }
 jump(){if(!this.canJump)return false;const p=this.player;const spring=p.gravity===1&&p.support==='floor'&&DREAM_SPRINGS.some(s=>Math.abs(s.x-p.x)<28);p.vy=-p.gravity*(spring?650:DREAM.jumpSpeed);if(spring){this.effects.push({type:'spring',x:p.x,y:DREAM.floor,age:0});this.onEvent({type:'dreamSpring'});}p.onGround=false;p.support=null;this.jumpCount++;this.onEvent({type:'jump'});return true;}
 flash(){
  if(!this.canErase)return false;const h=this.eraseTarget;this.flashes--;this.erasedUntil.set(h.id,this.elapsed+DREAM.eraseSeconds);this.effects.push({type:'erase',x:h.x,y:h.y,age:0,id:h.id});this.onEvent({type:'dreamErase'});return true;
 }
 platforms(time=this.elapsed){return DREAM_PLATFORMS.map((f,i)=>({...platformAt(f,time),support:i}));}
 gates(){return DREAM_GATES.map(d=>({...d,open:hasSource(this,d.card)||(this.gateUntil.get(d.id)||0)>this.elapsed,left:Math.max(0,(this.gateUntil.get(d.id)||0)-this.elapsed)}));}
 solids(time=this.elapsed){return [...this.platforms(time),...DREAM_SOLIDS.map((r,i)=>({...r,support:'solid-'+i})).filter(r=>!r.untilCard||!hasSource(this,r.untilCard)),...this.gates().filter(d=>!d.open).map(d=>({...d,support:'gate-'+d.id}))];}
 supported(){
  const p=this.player;if(p.support==='floor')return hasSurface(p.x,1);if(p.support==='ceiling')return hasSurface(p.x,-1);const f=this.solids().find(f=>f.support===p.support);return !!f&&p.x+DREAM.halfWidth>f.x&&p.x-DREAM.halfWidth<f.x+f.w;
 }
 safeToRemember(){const p=this.player;if(!p.onGround)return false;if(typeof p.support==='number'&&(DREAM_PLATFORMS[p.support].moveX||DREAM_PLATFORMS[p.support].moveY))return false;if(this.gates().some(d=>!hasSource(this,d.card)&&p.x>d.x-15&&p.x<d.x+240))return false;if((p.support==='floor'||p.support==='ceiling')&&!hasSurface(p.x,p.gravity,27))return false;return !this.hazards().some(h=>!h.erased&&(h.r?Math.hypot(h.x-p.x,h.y-p.y)<h.r+65:Math.abs(h.x-p.x)<100&&Math.abs(h.y-p.y)<h.h/2+35));}
 updateSwitches(){const p=this.player;if(!this.canMove||!p.onGround)return;for(const s of DREAM_SWITCHES)if(p.gravity===s.side&&Math.abs(p.x-s.x)<24&&Math.abs(p.y+s.side*21-s.y)<3){const d=DREAM_GATES.find(d=>d.id===s.gate);if(!this.switchesUsed.has(s.id)){this.say('문이 열렸어요',1.3);this.onEvent({type:'dreamSwitch'});}this.switchesUsed.add(s.id);this.gateUntil.set(d.id,this.elapsed+d.seconds);}}
 hurt(reason='hit'){
  if(!this.canMove)return false;const p=this.player,hit=damage(this,'dreamHit',reason);
  if(hit)this.effects.push({type:'mist',x:p.x,y:p.y,age:0});
  if(reason==='fall'&&!this.ended)Object.assign(p,this.lastSafe,{vx:0,vy:0,onGround:true,angle:this.lastSafe.gravity===1?0:Math.PI});
  return hit;
 }

 land(y,support){const p=this.player;p.y=y;p.vy=0;p.onGround=true;p.support=support;p.landAge=0;this.effects.push({type:"land",x:p.x,y:p.y+p.gravity*21,age:0});}
 movePlayer(dt,input={}){
  const p=this.player,hw=DREAM.halfWidth,hh=DREAM.halfHeight;p.moving=false;if(!this.canMove){p.vx=0;return;}
  if(p.onGround&&typeof p.support==='number'){
   const f=DREAM_PLATFORMS[p.support],before=platformAt(f,this.elapsed-dt),now=platformAt(f,this.elapsed);p.x+=now.x-before.x;p.y+=now.y-before.y;if(f.moveX||f.moveY)this.platformRides.add(f.id);
  }
  const solids=this.solids(),dx=clamp(input.x||0,-1,1),oldX=p.x;p.vx=dx*DREAM.speed;p.x=clamp(p.x+p.vx*dt,22,DREAM.width-22);if(dx)p.dir=dx<0?'left':'right';
  for(const f of solids)if(p.y+hh>f.y+.1&&p.y-hh<f.y+f.h-.1){if(dx>0&&oldX+hw<=f.x+.1&&p.x+hw>f.x)p.x=f.x-hw;else if(dx<0&&oldX-hw>=f.x+f.w-.1&&p.x-hw<f.x+f.w)p.x=f.x+f.w+hw;}
  if(p.onGround&&!this.supported()){p.onGround=false;p.support=null;}
  p.moving=!!dx&&p.onGround&&movedDuringStep(p.x-oldX,0,dt);if(p.moving)p.walk+=dt;
  if(!p.onGround){const old=p.y;p.vy=clamp(p.vy+p.gravity*DREAM.gravity*dt,-680,680);const next=old+p.vy*dt;let candidates=[];
   const crossed=(before,after)=>before>=-.1&&after<=0;
   const add=(y,support,normal,before,after)=>candidates.push({y,support,normal,t:Math.max(0,before)/Math.max(.001,before-after)});
   if(p.vy>=0&&hasSurface(p.x,1)&&crossed(DREAM.floor-old-hh,DREAM.floor-next-hh))add(DREAM.floor-hh,'floor',1,DREAM.floor-old-hh,DREAM.floor-next-hh);
   if(p.vy<0&&hasSurface(p.x,-1)&&crossed(old-hh-DREAM.ceiling,next-hh-DREAM.ceiling))add(DREAM.ceiling+hh,'ceiling',-1,old-hh-DREAM.ceiling,next-hh-DREAM.ceiling);
   for(const f of solids)if(p.x+hw>f.x+.1&&p.x-hw<f.x+f.w-.1){
    const prev=typeof f.support==='number'?platformAt(DREAM_PLATFORMS[f.support],this.elapsed-dt):f;
    const topBefore=prev.y-old-hh,topAfter=f.y-next-hh,bottomBefore=old-hh-prev.y-prev.h,bottomAfter=next-hh-f.y-f.h;
    if(crossed(topBefore,topAfter))add(f.y-hh,f.support,1,topBefore,topAfter);
    if(crossed(bottomBefore,bottomAfter))add(f.y+f.h+hh,f.support,-1,bottomBefore,bottomAfter);
   }
   candidates.sort((a,b)=>a.t-b.t);
   if(candidates.length){const hit=candidates[0];if(hit.normal===p.gravity)this.land(hit.y,hit.support);else {p.y=hit.y;p.vy=0;}}else p.y=next;
  }
  if(p.y>555||p.y< -55){this.hurt('fall');return;}
  // A closing door cannot leave the hero trapped in its rectangle.
  if(this.gates().some(d=>!d.open&&overlap({x:p.x,y:p.y,w:hw*2,h:hh*2},{x:d.x+d.w/2,y:d.y+d.h/2,w:d.w,h:d.h}))){this.hurt('gate');return;}
  for(const h of this.hazards())if(!h.erased&&touchingHazard(p,h)){this.hurt(h.type);break;}
  this.updateSwitches();if(this.canMove&&this.safeToRemember())this.lastSafe={x:p.x,y:p.y,gravity:p.gravity,support:p.support};
 }
 collect(){if(!this.canMove)return;const p=this.player;for(const c of DREAM_CARDS)if(!hasSource(this,c.id)&&Math.abs(p.x-c.x)<26&&Math.abs(p.y-c.y)<34){const earned=awardClue(this,c.id);if(!p.onGround&&p.vy*p.gravity<0)this.jumpCards.add(c.id);this.effects.push({type:'card',id:earned,x:c.x,y:c.y,age:0});this.onEvent({type:'card',id:earned,x:c.x-this.camera.x,y:c.y+170});}}
 beginWake(){if(this.ended||this.phase==='waking')return;this.phase='waking';this.phaseAge=0;this.player.moving=false;this.queuedMove=null;}
 update(dt,input={}){if(this.ended||!Number.isFinite(dt)||dt<=0)return;let left=Math.min(dt,125);while(left>1e-8&&!this.ended){const step=Math.min(left,1/120);this.tick(step,input);left-=step;}}
 tick(dt,input){tickVitality(this,dt);
  if(this.phase==='entering'){this.phaseAge+=dt;if(this.phaseAge>=1.1){this.phase='explore';this.phaseAge=0;}return;}
  if(this.phase==='waking'){this.phaseAge+=dt;if(this.phaseAge>=.8)this.finish(true);return;}
  this.elapsed=Math.min(DREAM.duration,this.elapsed+dt);this.stunLeft=Math.max(0,this.stunLeft-dt);this.invincibleLeft=Math.max(0,this.invincibleLeft-dt);this.springLeft=Math.max(0,this.springLeft-dt);this.noticeLeft=Math.max(0,this.noticeLeft-dt);this.player.landAge+=dt;
  let move=input;if(this.queuedMove){if(!input.x)move=this.queuedMove;this.queuedMove.left-=dt;if(this.queuedMove.left<=0)this.queuedMove=null;}
  this.movePlayer(dt,move);if(this.ended)return;collectRecovery(this,this.player);this.collect();
  const p=this.player,target=p.gravity===1?0:Math.PI;p.angle+=(target-p.angle)*Math.min(1,dt*14);
  if(!this.visited.has(this.room)){this.visited.add(this.room);this.say(DREAM_ROOMS[this.room],2);this.onEvent({type:'dreamRoom'});}
  const wanted=clamp(p.x-125,0,DREAM.width-390);this.camera.x+=(wanted-this.camera.x)*Math.min(1,dt*10);
  for(const e of this.effects)e.age+=dt;this.effects=this.effects.filter(e=>e.age<1.1);
  if(this.canMove&&Math.hypot(p.x-DREAM_EXIT.x,p.y-DREAM_EXIT.y)<DREAM_EXIT.r){this.reachedExit=true;this.beginWake();}
  else if(this.elapsed>=DREAM.duration)this.beginWake();
 }
 finish(survived=true){if(this.ended)return;this.ended=true;this.phase=survived?'complete':'stopped';this.player.moving=false;this.onEvent({type:'end',survived,elapsed:this.elapsed,found:[...this.banked]});}
}
