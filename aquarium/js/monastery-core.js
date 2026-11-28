import {FLAT_WALK_SPEED,movedDuringStep} from './walk-cycle.js';
import {awardClue,hasSource,normalizeClueRewards,restoreSources} from './clue-order.js';
import {SIDE_HERO_SIZE} from './hero-scale.js';

export const MONASTERY=Object.freeze({duration:100,width:6300,height:500,speed:FLAT_WALK_SPEED,balanceSpeed:.44,flashes:2,shieldSeconds:5,answer:'목탁',hints:['사찰에서 두드려 소리를 내는 나무 악기예요.','둥근 몸통과 손잡이가 있고, 나무 채로 두드려요.']});
export const MONASTERY_ZONES=Object.freeze([
 {name:'산문과 돌다리',start:0,end:2100},
 {name:'연못과 목교',start:2100,end:4200},
 {name:'회랑과 법당',start:4200,end:6300}
].map(Object.freeze));
export const LANTERN_ROUTE=Object.freeze(Array.from({length:9},(_,i)=>{
 const zone=Math.floor(i/3),slot=i%3,start=zone*2100+170+slot*630;
 return Object.freeze({id:i+1,zone,pickup:start,hook:start+480,color:i%3,windStart:start+90,windEnd:start+420,direction:i%2?-1:1,pickupLane:slot===1?0:1,hookLane:slot===2?0:slot===1?0:1,pattern:i%3});
}));
export const MONASTERY_BRIDGES=Object.freeze([{x:2690,w:918,phase:.4}].map(Object.freeze));
export const CORRIDOR_PILLARS=Object.freeze([4260,4510,4790,5080,5360,5650,5930,6200]);
export const TEMPLE_CARTS=Object.freeze([{id:1,from:990,to:1200,lane:0,period:5.2,phase:.3},{id:2,from:1580,to:1800,lane:1,period:4.9,phase:2.4}].map(Object.freeze));
export const TEMPLE_SPLASHES=Object.freeze([{id:1,x:2640,lane:1,period:3.7},{id:2,x:3100,lane:0,period:3.4},{id:3,x:3770,lane:1,period:3.9}].map(Object.freeze));
export const TEMPLE_BELLS=Object.freeze([{id:1,x:4630,period:9.2,phase:.7},{id:2,x:5260,period:9.6,phase:1.5},{id:3,x:5890,period:10,phase:2.1}].map(Object.freeze));
export const CART_GEOMETRY=Object.freeze({width:768,height:456,drawWidth:90,anchorX:301.971,anchorY:448.827});
const SIMULATION_STEP=1/90;
const GUST_LIMIT=1.5;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const approach=(a,b,d)=>a<b?Math.min(b,a+d):Math.max(b,a-d);
export const laneOffset=lane=>-10+22*lane;
export function bridgePose(bridge,time){return {y:440+Math.sin(time*1.55+bridge.phase)*2,angle:Math.sin(time*1.55+bridge.phase+.3)*.023};}
export function monasteryFloor(x,time){const b=MONASTERY_BRIDGES.find(b=>x>=b.x&&x<=b.x+b.w);if(!b)return 440;const q=bridgePose(b,time);return q.y+(x-b.x-b.w/2)*Math.tan(q.angle);}
export function corridorShelter(x){return CORRIDOR_PILLARS.some(px=>Math.abs(px-x)<30);}
export function windPhase(age){return age<0?'idle':age%6<1.25?'warning':age%6<3.25?'gust':'calm';}
export function routeWind(r,age){
 if(!r||age<0)return {phase:'idle',direction:r?.direction||1,force:0};
 if(r.pattern!==1){const phase=windPhase(age),u=(age%6-1.25)/2;return {phase,direction:r.direction,force:phase==='gust'?r.direction*Math.sin(Math.PI*u)*(r.pattern===2?8.6:7.8):0};}
 const t=age%5.2,second=t>=2,warning=t<.8||t>=2&&t<2.55,gust=t>=.8&&t<1.6||t>=2.55&&t<3.5,u=second?(t-2.55)/.95:(t-.8)/.8,direction=r.direction*(second?-1:1);
 return {phase:warning?'warning':gust?'gust':'calm',direction,force:gust?direction*Math.sin(Math.PI*u)*8.2:0};
}
export function cartPose(cart,time){const a=(time+cart.phase)*Math.PI*2/cart.period;return {x:(cart.from+cart.to)/2+Math.sin(a)*(cart.to-cart.from)/2,lane:cart.lane,dir:Math.cos(a)>0?1:-1};}
export function cartContact(cart,time,player,lane){
 const q=cartPose(cart,time);
 if(Math.abs(lane-q.lane)>=.34)return false;
 const fromAnchor=(player.x-q.x)*q.dir,halfWidth=8*SIDE_HERO_SIZE/56;
 const foot=monasteryFloor(q.x,time)+laneOffset(q.lane),top=player.y-39*SIDE_HERO_SIZE/56-foot,bottom=player.y-3-foot;
 const overlaps=(left,right,upper,lower)=>fromAnchor+halfWidth>left&&fromAnchor-halfWidth<right&&top<lower&&bottom>upper;
 return overlaps(-34,34,-43,-14)||overlaps(-27,27,-23,0)||overlaps(33,53,-27,-23);
}
export function splashPose(splash,age){const t=age<0?-1:age%splash.period;return {x:splash.x,lane:splash.lane,phase:t<0?'idle':t<1?'warning':t<1.7?'splash':'calm',u:t<1?t:(t-1)/.7};}
// Chime ring, bronze body and fish move as ONE rigid illustrated pendant.
// At the lowest point the visible art still ends at the old 427.5px baseline.
export const BELL_GEOMETRY=Object.freeze({pivotY:310,rope:64,amplitude:1.18,bodyOffset:26,fishOffset:53.5,bodyRx:13,bodyRy:16,fishRx:8,fishRy:5,reaction:.8});
export function bellPose(bell,time){const k=BELL_GEOMETRY,omega=Math.PI*2/bell.period,a=time*omega+bell.phase,angle=Math.sin(a)*k.amplitude,s=Math.sin(angle),co=Math.cos(angle),x=bell.x+s*k.rope,y=k.pivotY+co*k.rope,vy=-k.rope*s*k.amplitude*Math.cos(a)*omega;return {angle,x,y,bodyX:x+s*k.bodyOffset,bodyY:y+co*k.bodyOffset,fishX:x+s*k.fishOffset,fishY:y+co*k.fishOffset,vy};}
export function hookPose(r,time){const moving=r.zone===2,a=(time-r.id*.37)*Math.PI*2/(3.1+(r.id-7)*.3),offset=moving?Math.sin(a)*26:0,vx=moving?Math.cos(a)*26*Math.PI*2/(3.1+(r.id-7)*.3):0;return {x:r.hook+offset,offset,vx,ready:!moving||Math.abs(vx)<26,lane:r.hookLane};}
// Exact ellipse/rectangle overlap in the chime's rotated local space. Thin
// chain and the empty swept area never count as a collision.
function ellipseBodyHit(x,y,rx,ry,angle,p){
 const half=p.halfWidth??8*SIDE_HERO_SIZE/56,left=p.x-half,right=p.x+half,top=p.y-39*SIDE_HERO_SIZE/56-(p.collisionPadding||0),bottom=p.y-3+(p.collisionPadding||0);
 if(x>=left&&x<=right&&y>=top&&y<=bottom)return true;
 const co=Math.cos(angle),si=Math.sin(angle),v=[[left,top],[right,top],[right,bottom],[left,bottom]].map(([xx,yy])=>({x:(co*(xx-x)-si*(yy-y))/rx,y:(si*(xx-x)+co*(yy-y))/ry}));
 for(let i=0;i<4;i++){const a=v[i],b=v[(i+1)%4],dx=b.x-a.x,dy=b.y-a.y,t=clamp(-(a.x*dx+a.y*dy)/(dx*dx+dy*dy),0,1);if((a.x+t*dx)**2+(a.y+t*dy)**2<1)return true;}return false;
}
export function bellContact(bell,time,p){const q=bellPose(bell,time),k=BELL_GEOMETRY;if(ellipseBodyHit(q.bodyX,q.bodyY,k.bodyRx,k.bodyRy,q.angle,p))return 'body';if(ellipseBodyHit(q.fishX,q.fishY,k.fishRx,k.fishRy,q.angle,p))return 'fish';return null;}
export function bellPassage(bell,time,player,canMove=true){
 const q=bellPose(bell,time),motion=q.vy<-.5?'up':q.vy>.5?'down':'turn',arrow=motion==='up'?'↑':motion==='down'?'↓':'↔',label=motion==='up'?'↑ 올라가는 중':motion==='down'?'↓ 내려오는 중':'↔ 방향 전환';
 const travel=Math.abs(player.vx||0)>12?Math.sign(player.vx):player.x>bell.x?-1:1;
 const finish=bell.x+travel*135,dt=SIMULATION_STEP;let fast=player.x,slow=player.x,fv=player.vx||0,sv=fv,safe=canMove&&motion==='up'&&Math.abs(player.x-bell.x)<190;
 // At each instant test the entire horizontal envelope between an immediate
 // start and a 0.6s reaction. Every intermediate start lies inside this range.
 if(safe)for(let future=0;future<4;future+=dt){const left=Math.min(fast,slow),right=Math.max(fast,slow);if(bellContact(bell,time+future,{x:(left+right)/2,y:player.y,halfWidth:8*SIDE_HERO_SIZE/56+(right-left)/2+.75,collisionPadding:.75})){safe=false;break;}if(travel*(slow-finish)>=0&&travel*(fast-finish)>=0)break;fv=approach(fv,travel*MONASTERY.speed,460*dt);sv=approach(sv,future<BELL_GEOMETRY.reaction?0:travel*MONASTERY.speed,(future<BELL_GEOMETRY.reaction?900:460)*dt);fast+=fv*dt;slow+=sv*dt;}
 const outer=player.y<441&&travel*(player.x-bell.x)<-60;
 return {motion,arrow,label,safe,travel,outer,text:label+' · '+(safe?'지금 통과':outer?'바깥길로 ↓':'기다려요')};
}

export class MonasteryGame{
 constructor({onEvent=()=>{}}={}){
  this.onEvent=onEvent;this.elapsed=0;this.stepRemainder=0;this.ended=false;this.phase='explore';this.health=3;this.flashes=MONASTERY.flashes;this.shieldLeft=0;
  this.found=new Set();this.banked=new Set();this.clueSources=new Set();this.effects=[];this.hits=0;this.mistakes=0;this.queuedMove=null;this.balancing=false;
  this.player={x:70,y:440,vx:0,dir:'right',walk:0,moving:false,hammerAge:99};
  this.camera={x:0};this.angle=0;this.angularVelocity=0;this.held=null;this.hangProgress=0;this.retryLeft=0;this.gustExposure=0;this.recoveryLeft=0;
  this.windAges=Array(9).fill(-1);this.message='';this.messageLeft=0;this.shelter=false;this.windForce=0;this.bridgeForce=0;this.completedAt=null;
  this.lane=1;this.laneTarget=1;this.stunLeft=0;this.contactGuard=0;this.splashAges=Array(3).fill(-1);this.hazardHits={cart:0,splash:0,bell:0};this.player.y+=laneOffset(this.lane);
 }
 get remaining(){return Math.max(0,MONASTERY.duration-this.elapsed);}
 get zoneIndex(){return Math.min(2,Math.floor(this.player.x/2100));}
 get zone(){return MONASTERY_ZONES[this.zoneIndex];}
 get target(){
  if(this.held)return this.held;
  let nearest=null,distance=Infinity;
  for(const r of LANTERN_ROUTE)if(!hasSource(this,r.id)){const d=Math.abs(this.player.x-r.pickup);if(d<distance){nearest=r;distance=d;}}
  return nearest;
 }
 get hook(){return this.target?hookPose(this.target,this.elapsed):null;}
 get canMove(){return !this.ended&&this.retryLeft<=0;}
 get canShield(){return !this.ended&&!!this.held&&this.retryLeft<=0&&this.flashes>0&&this.shieldLeft<=0;}
 get stability(){return clamp(1-Math.max((Math.abs(this.angle)+Math.abs(this.angularVelocity)*.14)/1.12,this.gustExposure/GUST_LIMIT),0,1);}
 get wind(){
  const r=this.held||this.target,x=this.player.x;
  if(!r||x<r.windStart-55||x>=r.windEnd||this.shelter)return {phase:'idle',direction:0,force:0};
  const wind=routeWind(r,this.windAges[r.id-1]);
  return x<=r.windStart&&wind.phase==='gust'?{...wind,phase:'warning',force:0}:wind;
 }
 get nearbyHazard(){
  const x=this.player.x;if(this.zoneIndex===0)return TEMPLE_CARTS.map(c=>({type:'cart',...cartPose(c,this.elapsed)})).find(c=>Math.abs(c.x-x)<170)||null;
  if(this.zoneIndex===1){const s=TEMPLE_SPLASHES.find(s=>Math.abs(s.x-x)<160);return s?{type:'splash',...splashPose(s,this.splashAges[s.id-1])}:null;}
  const b=TEMPLE_BELLS.find(b=>Math.abs(b.x-x)<170&&!(x>b.x+112&&this.player.vx>=0&&this.player.dir!=='left'));return b?{type:'bell',id:b.id,...bellPose(b,this.elapsed),cue:bellPassage(b,this.elapsed,this.player,this.stunLeft<=0&&this.retryLeft<=0&&!this.ended)}:null;
 }
 get prompt(){
  if(this.messageLeft>0)return this.message;
  if(this.retryLeft>0)return '받침대에서 다시 불을 켜고 있어요';
  if(this.stunLeft>0)return '부딪혔어요 · 연등의 균형을 되찾아요';
  const r=this.target;if(!r)return '산사에 아홉 연등이 모두 켜졌어요';
  if(!this.held&&Math.abs(this.player.x-r.pickup)<70&&Math.abs(this.lane-r.pickupLane)>.35)return r.pickupLane===0?'↑ 안쪽 받침대에서 연등을 받아요':'↓ 바깥쪽 받침대에서 연등을 받아요';
  if(!this.held)return (this.player.x>r.pickup+30?'연등을 받으려면 ← 보급대':'앞쪽 보급대에서 연등을 받아요');
  if(Math.abs(this.player.x-r.hook)<65){if(Math.abs(this.lane-r.hookLane)>.35)return r.hookLane===0?'↑ 안쪽 연등걸이로 가요':'↓ 바깥쪽 연등걸이로 가요';return this.hangProgress>0?'안정됐어요 · 잠깐 멈추면 걸려요':r.zone===2?'걸이를 따라가 초록색일 때 멈춰요':'걸이 앞에서 멈추고 균형을 잡아요';}
  const hazard=this.nearbyHazard;if(hazard?.type==='cart')return '↑ ↓ 길을 바꿔 수레를 비켜 가요';
  if(hazard?.type==='splash'&&['warning','splash'].includes(hazard.phase))return hazard.lane===0?'↓ 바깥쪽 길로 물보라를 피해요':'↑ 안쪽 길로 물보라를 피해요';
  if(hazard?.type==='bell')return hazard.cue.safe?`초록 ${hazard.cue.travel>0?'→':'←'} · 균형을 놓고 빠르게 통과하세요`:hazard.cue.outer?'↓ 바깥쪽 길로 옮겨 초록 신호를 기다려요':'주황 Ⅱ · 풍경 앞에서 기다려요';
  if(this.player.x>r.hook+28)return '연등을 걸려면 ← 지나온 걸이';
  if(this.shieldLeft>0)return '바람막이가 연등을 보호해요 · 앞으로!';
  if(this.shelter)return '풍경 아래 처마가 바람을 막아줘요';
  if(this.wind.phase==='warning')return '천이 펄럭여요 · 바람 구간 앞에서 기다려요';
  if(this.wind.phase==='gust')return '바람이 불어요 · 균형을 잡아 불을 지켜요';
  return Math.abs(this.angle)>.55?'흔들려요 · 균형을 잡아 주세요':'잔잔할 때는 앞으로 · 바람 앞에서는 균형!';
 }
 say(message){this.message=message;this.messageLeft=1.3;}
 queueMove(input){if(this.canMove&&!this.queuedMove)this.queuedMove={x:input.x||0,y:input.y||0,left:.08};}
 movePlayer(dt,input){this.queueMove(input);}
 beginBalance(){if(!this.ended)this.balancing=true;}
 releaseBalance(){this.balancing=false;}
 releaseAction(){this.releaseBalance();}
 flash(){
  if(!this.canShield)return false;this.flashes--;this.shieldLeft=MONASTERY.shieldSeconds;this.angle*=.15;this.angularVelocity=0;this.gustExposure=0;
  this.onEvent({type:'monasteryShield'});return true;
 }
 extinguishLantern(cause='wind'){
  if(!this.held||this.retryLeft>0||this.ended)return false;
  const h=this.held;this.mistakes++;this.hits++;this.retryLeft=Math.abs(this.player.x-h.pickup)/200+1.6;
  this.angle=0;this.angularVelocity=0;this.gustExposure=0;this.hangProgress=0;this.player.vx=0;this.balancing=false;this.queuedMove=null;
  const reasons={wind:'돌풍에 연등이 꺼졌어요',cart:'수레에 부딪혀 연등이 꺼졌어요',splash:'물보라에 연등이 꺼졌어요',bell:'풍경에 닿아 연등이 꺼졌어요'};
  this.say(reasons[cause]+' · 받침대에서 다시 켜요');
  this.onEvent({type:'monasteryFumble',id:h.id,cause});return true;
 }
 bump(type,dir=1){
  if(this.contactGuard>0||this.retryLeft>0)return false;this.hazardHits[type]++;this.contactGuard=1.3;this.stunLeft=.75;this.player.x=clamp(this.player.x+dir*25,26,MONASTERY.width-40);this.player.vx=0;
  this.extinguishLantern(type);
  this.effects.push({type,age:0,x:this.player.x,y:this.player.y});this.onEvent({type:'monasteryBump',kind:type});return true;
 }
 checkHazards(){
  const p=this.player;if(this.contactGuard>0||this.retryLeft>0)return;
  for(const c of TEMPLE_CARTS){if(cartContact(c,this.elapsed,p,this.lane)){this.bump('cart',cartPose(c,this.elapsed).dir);return;}}
  for(const s of TEMPLE_SPLASHES){const q=splashPose(s,this.splashAges[s.id-1]);if(q.phase==='splash'&&Math.abs(p.x-q.x)<43&&Math.abs(this.lane-q.lane)<.38){this.bump('splash',-1);return;}}
  for(const b of TEMPLE_BELLS){const q=bellPose(b,this.elapsed);if(bellContact(b,this.elapsed,p)){this.bump('bell',p.x<q.x?-1:1);return;}}
 }
 update(dt,input={}){
  if(this.ended||!Number.isFinite(dt)||dt<=0)return;
  // Only complete simulation ticks affect contacts and hanging time.
  this.stepRemainder+=Math.min(dt,MONASTERY.duration);
  const steps=Math.floor((this.stepRemainder+1e-9)/SIMULATION_STEP);
  this.stepRemainder=Math.max(0,this.stepRemainder-steps*SIMULATION_STEP);
  for(let i=0;i<steps&&!this.ended;i++){
   const step=Math.min(SIMULATION_STEP,this.remaining);
   if(step<=0){this.finish(true);break;}
   this.step(step,input);
  }
 }
 step(dt,input){
  const p=this.player;this.elapsed+=dt;this.shieldLeft=Math.max(0,this.shieldLeft-dt);this.messageLeft=Math.max(0,this.messageLeft-dt);this.recoveryLeft=Math.max(0,this.recoveryLeft-dt);this.stunLeft=Math.max(0,this.stunLeft-dt);this.contactGuard=Math.max(0,this.contactGuard-dt);
  this.effects.forEach(e=>e.age+=dt);this.effects=this.effects.filter(e=>e.age<1.2);
  for(const r of LANTERN_ROUTE){if(this.windAges[r.id-1]<0&&p.x>r.pickup-12)this.windAges[r.id-1]=0;else if(this.windAges[r.id-1]>=0)this.windAges[r.id-1]+=dt;}
  for(const s of TEMPLE_SPLASHES){if(this.splashAges[s.id-1]<0&&Math.abs(p.x-s.x)<180)this.splashAges[s.id-1]=0;else if(this.splashAges[s.id-1]>=0)this.splashAges[s.id-1]+=dt;}
  if(this.retryLeft>0){
   const returning=this.retryLeft>1.6;this.retryLeft=Math.max(0,this.retryLeft-dt);p.vx=0;p.moving=returning&&Math.abs(p.x-this.held.pickup)>1;
   if(returning){p.dir=p.x<this.held.pickup?'right':'left';p.x=approach(p.x,this.held.pickup,200*dt);p.walk+=dt;}
   this.lane=approach(this.lane,this.held.pickupLane,dt*4.2);this.laneTarget=this.held.pickupLane;p.y=monasteryFloor(p.x,this.elapsed)+laneOffset(this.lane);this.camera.x+=(clamp(p.x-140,0,MONASTERY.width-390)-this.camera.x)*(1-Math.exp(-9*dt));
   if(!this.retryLeft){this.angle=0;this.angularVelocity=0;this.gustExposure=0;this.recoveryLeft=.7;this.say('다시 켰어요 · 바람을 살펴 출발해요');}
   if(this.remaining<1e-8){this.elapsed=MONASTERY.duration;this.finish(true);}return;
  }
  let dx=clamp(Number(input.x)||0,-1,1),dy=clamp(Number(input.y)||0,-1,1);
  if(this.queuedMove){if(!dx)dx=this.queuedMove.x;if(!dy)dy=this.queuedMove.y;this.queuedMove.left-=dt;if(this.queuedMove.left<=0)this.queuedMove=null;}
  if(dy)this.laneTarget=dy<0?0:1;const oldLane=this.lane;this.lane=approach(this.lane,this.laneTarget,dt*4.2);
  const beforeV=p.vx,slow=this.balancing&&!!this.held?MONASTERY.balanceSpeed:1;
  const targetSpeed=this.canMove&&this.stunLeft<=0?dx*MONASTERY.speed*slow:0;
  p.vx=approach(p.vx,targetSpeed,(dx?460:900)*dt);
  const rightEdge=MONASTERY.width-40;
  const oldX=p.x;p.x=clamp(p.x+p.vx*dt,26,rightEdge);if(p.x===rightEdge&&p.vx>0)p.vx=0;
  p.y=monasteryFloor(p.x,this.elapsed)+laneOffset(this.lane);p.moving=movedDuringStep(p.x-oldX,laneOffset(this.lane)-laneOffset(oldLane),dt);if(p.moving){p.walk+=dt*Math.max(.45,Math.abs(p.vx)/MONASTERY.speed);if(Math.abs(p.vx)>5)p.dir=p.vx<0?'left':'right';else if(this.lane!==oldLane)p.dir=this.lane<oldLane?'up':'down';}
  const r=!this.held&&LANTERN_ROUTE.find(r=>!hasSource(this,r.id)&&Math.abs(p.x-r.pickup)<24&&Math.abs(this.lane-r.pickupLane)<.3);
  if(r&&this.retryLeft<=0){
   this.held=r;this.angle=0;this.angularVelocity=0;this.hangProgress=0;this.onEvent({type:'monasteryPickup',id:r.id});
  }
  this.shelter=this.zoneIndex===2&&(this.lane<.3&&corridorShelter(p.x)||TEMPLE_BELLS.some(b=>Math.abs(p.x-b.x)<170));
  this.checkHazards();
  let force=0;this.bridgeForce=0;
  if(this.held&&this.retryLeft<=0){
   const h=this.held,wind=routeWind(h,this.windAges[h.id-1]),hook=hookPose(h,this.elapsed);
   if(wind.phase==='gust'&&p.x>h.windStart&&p.x<h.windEnd&&!this.shelter)force=wind.force*(this.lane<.3?.45:1);
   const bridge=MONASTERY_BRIDGES.find(b=>p.x>=b.x&&p.x<=b.x+b.w);
   if(bridge)this.bridgeForce=Math.cos(this.elapsed*1.55+bridge.phase)*1.1;
   const protectedFromWind=this.shieldLeft>0||this.recoveryLeft>0;
   if(protectedFromWind)force=0;
   this.windForce=force;
   const damping=this.balancing?8.5:1.25,stiffness=this.balancing?10:7.2,windScale=this.balancing?.18:1;
   const accel=(p.vx-beforeV)/dt;
   this.angularVelocity+=(-stiffness*Math.sin(this.angle)-damping*this.angularVelocity+force*windScale+this.bridgeForce-(this.balancing?.001:.0035)*accel)*dt;
   this.angle=clamp(this.angle+this.angularVelocity*dt,-1.35,1.35);
   // Accumulate only the gust that reaches the carried lamp. Short, strong
   // gusts can extinguish it even before the pendulum swings to its limit.
   const exposedWind=this.balancing?0:Math.abs(force);
   this.gustExposure=exposedWind>0?this.gustExposure+exposedWind*dt:Math.max(0,this.gustExposure-dt*5);
   if(this.gustExposure>=GUST_LIMIT)this.extinguishLantern('wind');
   else if(Math.abs(p.x-hook.x)<(h.zone===2?16:24)&&Math.abs(this.lane-h.hookLane)<.3&&hook.ready&&Math.abs(p.vx)<12&&Math.abs(this.angle)<.23&&Math.abs(this.angularVelocity)<.4&&this.stunLeft<=0){
    this.hangProgress+=dt;
    if(this.hangProgress>=.38){
     const earned=awardClue(this,h.id);this.held=null;this.hangProgress=0;this.angle=0;this.angularVelocity=0;this.gustExposure=0;
     this.onEvent({type:'card',id:earned,x:h.hook-this.camera.x,y:p.y-62+170});this.onEvent({type:'monasteryHang',id:h.id});this.say('연등을 걸었어요 · 산사에 불빛이 켜져요');
     if(this.banked.size===9){this.completedAt=this.elapsed;this.finish(true);}
    }
   }else this.hangProgress=Math.max(0,this.hangProgress-dt*2);
  }else this.windForce=0;
  const cam=clamp(p.x-140,0,MONASTERY.width-390);this.camera.x+=(cam-this.camera.x)*(1-Math.exp(-9*dt));
  if(this.remaining<1e-8){this.elapsed=MONASTERY.duration;this.finish(true);}
 }
 restoreResult(rec){this.elapsed=clamp(rec.elapsed||0,0,MONASTERY.duration);this.flashes=rec.flashes??MONASTERY.flashes;this.mistakes=rec.mistakes||0;this.banked=new Set(normalizeClueRewards(rec.clues));this.found=new Set(this.banked);this.clueSources=Array.isArray(rec.clueSources)?restoreSources(rec):rec.lit?.length?new Set(rec.lit):restoreSources(rec);const last=LANTERN_ROUTE.find(r=>r.id===[...this.clueSources].at(-1))||LANTERN_ROUTE[0];this.player.x=last.hook;this.lane=this.laneTarget=last.hookLane;this.player.y=monasteryFloor(this.player.x,this.elapsed)+laneOffset(this.lane);this.camera.x=clamp(this.player.x-140,0,MONASTERY.width-390);this.held=null;this.ended=true;this.phase='complete';}
 finish(survived=true){if(this.ended)return;this.ended=true;this.phase=survived?'complete':'stopped';this.player.moving=false;this.player.vx=0;this.balancing=false;this.queuedMove=null;this.onEvent({type:'end',survived,elapsed:this.elapsed,found:[...this.banked]});}
}
