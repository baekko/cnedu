import {FLAT_WALK_SPEED,movedDuringStep} from './walk-cycle.js';
import {awardClue,hasSource} from './clue-order.js';
import {ANIMAL_ART} from './zoo-feed-art-v65.js';
import {releasePoint} from './zoo-hero-pose.js?v=155';
import {hippoMotion,hippoMouth} from './zoo-hippo-motion.js';
import {lakeWorldOffset} from './zoo-scenery.js';

export const ZOO=Object.freeze({duration:120,width:3780,penWidth:420,ground:438,speed:FLAT_WALK_SPEED,gravity:430,flashes:2,answer:'레서판다',hints:['붉은 갈색 털과 줄무늬가 있는 긴 꼬리를 가진 동물입니다.','이름에 판다가 들어가며, 나무를 잘 탑니다.']});
export const ZOO_SUPPORT={monkey:{treeX:165,treeWidth:220,lowX:223,highX:292,lowY:350,highY:350-(.65496-.34091)*(220*484/475)},iceY:390,fishY:386};
export const ZOO_ZONES=['초원 먹이 시간','숲속 먹이 시간','물가 먹이 시간'];
export const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=t=>{t=clamp(t);return t*t*(3-2*t);};
const specs=[
 ['zebra','얼룩말','leaf',205,'돌아오는 얼룩말 앞쪽을 겨냥해요'],
 ['giraffe','기린','leaf',310,'높은 입까지 큰 포물선으로!'],
 ['lion','사자','meat',194,'하품하며 입을 크게 벌릴 때!'],
 ['elephant','코끼리','apple',335,'올라가는 코끝을 겨냥해요'],
 ['tiger','호랑이','meat',256,'머리 위로 던져 뛰어오르게 해요'],
 ['monkey','원숭이','banana',115,'가지 사이로 뛸 때 손에 던져요'],
 ['hippo','하마','melon',260,'거품 다음, 큰 입이 나와요'],
 ['penguin','펭귄','fish',78,'얼음 앞쪽에 떨어뜨려 미끄러뜨려요'],
 ['otter','수달','fish',122,'낮은 바위 다음엔 높은 바위예요']
];
export const FEED_ANIMALS=Object.freeze(specs.map(([kind,name,food,size,tip],i)=>Object.freeze({id:i+1,kind,name,food,size,tip,start:i*420,zone:Math.floor(i/3)})));
export function segmentDistance(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,k=clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1));return Math.hypot(p.x-a.x-dx*k,p.y-a.y-dy*k);}
export function receivingPoint(pose){const art=ANIMAL_ART[pose.kind];let [nx,ny]=art.anchors[pose.spriteFrame];if(pose.rig){const m=hippoMouth(pose.rig);nx=m.x/384;ny=m.y/384;}return {x:pose.x+(nx-.5)*pose.size*(pose.flip?-1:1),y:pose.y+(ny-(art.baseline??350)/384)*pose.size};}

// A route is always completed before eating, resting or obeying the whistle.
// In particular the monkey can never be paused at an unsupported point in a jump.
export function animalPose(a){
 const s=a.spec,t=a.clock;let x=s.start+284,y=399,frame=0,moving=false,open=false,ready=false,water=0,airborne=false,flip=false,phase='';
 let freezeSafe=true, mode='mouth', progress=0;
 switch(s.kind){
 case 'zebra':{
  const q=t%5.2,forward=q<2.3,u=forward?q/2.3:(q-2.3)/2.9;
  x=s.start+(forward?225+85*smooth(u):310-85*smooth(u));moving=true;flip=forward;
  ready=!forward;open=ready&&a.reach>0;frame=open?3:0;phase=forward?'돌아서 돌아와요':'오는 방향 앞쪽으로';break;
 }
 case 'giraffe':{
  x=s.start+282;frame=Math.sin(t*.7)>.6?2:Math.sin(t*.7)<-.6?1:0;
  ready=true;open=a.reach>0;if(open)frame=3;phase='높은 입을 겨냥해요';break;
 }
 case 'lion':{
  const q=t%4.8; x=s.start+287; y=357;
  if(q<1.2){x-=27*(1-smooth(q/1.2));moving=true;flip=true;phase='바위에 올라와요';}
  else if(q<1.9){phase='하품할 준비';}
  else if(q<3.25){frame=3;open=ready=true;phase='입이 열렸어요';progress=(3.25-q)/1.35;}
  else {x-=27*smooth((q-3.25)/1.55);moving=true;phase='잠깐 기다려요';}
  break;
 }
 case 'elephant':{
  const q=t%4.8;x=s.start+266;
  frame=q<1?0:q<1.65?1:q<2.25?2:q<3.45?3:q<3.9?2:q<4.4?1:0;
  ready=open=frame===2||frame===3;freezeSafe=ready;phase=ready?'올라온 코끝으로':'코를 들어 올려요';progress=ready?(3.9-q)/2.25:0;mode='trunk';break;
 }
 case 'tiger':{
  x=s.start+253+22*Math.sin(t*1.5);moving=true;flip=Math.cos(t*1.5)>0;
  phase='머리보다 높이 던져요';
  if(a.jump){const u=clamp(a.jump.age/(a.jump.duration||1.12));x=a.jump.x-46*Math.sin(Math.PI*u);y=399-91*Math.sin(Math.PI*u);frame=u<.12?2:u>.9?1:3;moving=false;flip=false;airborne=u>0&&u<1;ready=open=u>.12&&u<.9;phase='뛰어올라 받아요';}
  freezeSafe=!airborne;break;
 }
 case 'monkey':{
  const q=t%5.5,b=ZOO_SUPPORT.monkey;let u=0;
  if(q<.8){x=s.start+b.lowX;y=b.lowY;phase='다음 가지를 보고 있어요';}
  else if(q<2){u=(q-.8)/1.2;x=s.start+b.lowX+(b.highX-b.lowX)*smooth(u);y=b.lowY+(b.highY-b.lowY)*smooth(u)-55*Math.sin(Math.PI*u);airborne=true;phase='뻗은 손을 겨냥해요';}
  else if(q<2.75){x=s.start+b.highX;y=b.highY;phase='다시 뛸 준비';}
  else if(q<3.95){u=(q-2.75)/1.2;x=s.start+b.highX+(b.lowX-b.highX)*smooth(u);y=b.highY+(b.lowY-b.highY)*smooth(u)-55*Math.sin(Math.PI*u);airborne=true;phase='뻗은 손을 겨냥해요';}
  else{x=s.start+b.lowX;y=b.lowY;phase='다음 가지를 보고 있어요';}
  frame=airborne?(u<.12?2:u>.88?1:3):0;ready=open=airborne&&u>.12&&u<.88;freezeSafe=!airborne;mode='hands';break;
 }
 case 'hippo':{
  const q=t%4.9;x=s.start+256+lakeWorldOffset(a.cameraX);
  // The back stays at the same waterline. Only the anatomical head poses change.
  water=q<.55?1:q<1.65?1-smooth((q-.55)/1.1):q<3.2?0:q<4.65?smooth((q-3.2)/1.45):1;
  y=335;ready=open=q>=1.85&&q<3;frame=open?3:0;freezeSafe=ready||a.fed>=2;
  phase=q<1?'거품 뒤에 올라와요':q<1.85?'올라오는 중':open?'큰 입이 열렸어요':'물속으로 들어가요';progress=open?(3-q)/1.15:0;break;
 }
 case 'penguin':{
  const q=t%4.6,u=q<.5?0:q<2.1?smooth((q-.5)/1.6):q<2.65?1:1-smooth((q-2.65)/1.95);
  x=s.start+254+99*u;y=ZOO_SUPPORT.iceY;moving=q>.5&&q<2.1||q>2.65;flip=q>.5&&q<2.1;
  ready=true;open=a.reach>0;frame=open?3:0;if(open){moving=false;flip=false;}
  phase='얼음 위로 미끄러뜨려요';mode='slide';break;
 }
 case 'otter':{
  const q=t%5.2;let u=0;
  if(q<1.35){x=s.start+246;y=402;ready=a.fed===0;phase=a.fed===0?'낮은 바위의 앞발로':'높은 바위로 갈 거예요';}
  else if(q<2.45){u=(q-1.35)/1.1;x=s.start+246+87*smooth(u);y=402-59*smooth(u)-36*Math.sin(Math.PI*u);airborne=true;moving=true;flip=true;phase='바위 사이로 뛰어요';}
  else if(q<3.8){x=s.start+333;y=343;ready=a.fed===1;phase=a.fed===1?'이번엔 높은 바위!':'먼저 낮은 바위에서';}
  else {u=(q-3.8)/1.4;x=s.start+333-87*smooth(u);y=343+59*smooth(u)-36*Math.sin(Math.PI*u);airborne=true;moving=true;phase='바위 사이로 뛰어요';}
  open=ready;frame=open?3:0;freezeSafe=!moving;mode='hands';break;
 }
 }
 if(a.attention>0&&freezeSafe&&!['otter','tiger'].includes(s.kind)){
  // Airborne animals must land; a submerged hippo must surface; the trunk must rise.
  open=ready=true;frame=s.kind==='monkey'?0:3;moving=false;flip=false;phase='잠깐 기다려 줄게요';
 }
 if(a.chew>0&&!airborne&&freezeSafe){open=ready=false;moving=false;flip=false;frame=['monkey','tiger'].includes(s.kind)?4:a.chew>.42?3:4;phase='냠냠!';}
 if(a.fed>=2&&!airborne&&freezeSafe){open=ready=false;moving=false;flip=false;frame=a.chew>0?4:5;phase='단서 획득';}
 const art=ANIMAL_ART[s.kind];const spriteFrame=moving&&frame===0?art.walk[Math.floor((a.walkDistance||0)/7)%art.walk.length]:art.map[frame];
 const pose={...s,x,y,frame,spriteFrame,moving,open:open&&a.chew<=0&&a.fed<2,ready:ready&&a.fed<2,water,airborne,flip,freezeSafe,mode,phase,progress,attention:a.attention,fed:a.fed};
 if(s.kind==='hippo'){pose.rig=hippoMotion(a);pose.spriteFrame=4;pose.surface={x:x-24,y:335};pose.headMotion=pose.rig.motion;}
 pose.target=receivingPoint(pose);pose.radius=s.kind==='hippo'?20:s.kind==='lion'?15:s.kind==='giraffe'?12:s.kind==='penguin'?9:13;
 return pose;
}
export function shotVelocity(angle,power){const speed=240+255*clamp(power),r=angle*Math.PI/180;return {vx:Math.cos(r)*speed,vy:-Math.sin(r)*speed};}
export function trajectory(origin,angle,power,step=.065){const v=shotVelocity(angle,power),out=[];for(let t=0;t<3;t+=step){const p={x:origin.x+v.vx*t,y:origin.y+v.vy*t+ZOO.gravity*t*t/2,t};if(p.y>443||p.x>origin.x+540)break;out.push(p);}return out;}
export function feedTrajectory(origin,angle,power,spec){
 const path=trajectory(origin,angle,power,.05);if(spec.kind!=='penguin')return path;
 for(let i=1;i<path.length;i++){
  const prev=path[i-1],point=path[i];
  if(prev.y<ZOO_SUPPORT.fishY&&point.y>=ZOO_SUPPORT.fishY&&point.x>spec.start+202&&point.x<spec.start+390){
   const k=(ZOO_SUPPORT.fishY-prev.y)/(point.y-prev.y),x0=prev.x+(point.x-prev.x)*k,t0=prev.t+(point.t-prev.t)*k;
   const result=path.slice(0,i),v=shotVelocity(angle,power).vx*.64;
   for(let u=0;u<1.4;u+=.07){const x=x0+v*u-27*u*u;if(x>spec.start+409)break;result.push({x,y:ZOO_SUPPORT.fishY,t:t0+u,sliding:true});}
   return result;
  }
 }
 return path;
}
export class ZooGame{
 constructor({onEvent=()=>{},character='haru'}={}){this.character=character;this.onEvent=onEvent;this.elapsed=0;this.ended=false;this.phase='feed';this.health=3;this.flashes=2;this.banked=new Set();this.clueSources=new Set();this.found=new Set();this.player={x:62,y:ZOO.ground,moving:false,walkDistance:0,face:1,shotAge:99};this.camera={x:0,y:0};this.angle=48;this.charge=0;this.charging=false;this.chargeAge=0;this.cooldown=0;this.pending=null;this.shots=[];this.effects=[];this.animals=FEED_ANIMALS.map(spec=>({spec,clock:0,fed:0,chew:0,attention:0,reach:0,jump:null,activated:false,walkDistance:0,waterPulses:[]}));this.queuedMove=null;this.notice='';this.noticeLeft=0;this.lastRoom=0;this.throwCount=0;this.hitCount=0;this.lastTrail=null;this.lastPower=.48;}
 get room(){return clamp(Math.floor(this.player.x/ZOO.penWidth),0,8);}
 get zone(){return Math.floor(this.room/3);}
 get active(){return this.animals[this.room];}
 get progress(){return this.banked.size/9;}
 get remaining(){return Math.max(0,ZOO.duration-this.elapsed);}
 get canMove(){return !this.ended;}
 get canShield(){return !this.ended&&this.flashes>0&&this.active.fed<2&&this.active.attention<=0;}
 get canThrow(){return !this.ended&&this.cooldown<=0&&!this.pending&&this.active.fed<2;}
 get inFeedSpot(){const x=this.player.x-this.active.spec.start;return x>=24&&x<=154;}
 get origin(){return releasePoint(this.character,this.player);}
 get prompt(){return this.noticeLeft>0?this.notice:this.banked.size===9?'오른쪽 끝으로 걸어가요':'';}
 get preview(){return feedTrajectory(this.origin,this.angle,this.charging?this.charge:this.lastPower,this.active.spec);}
 say(text,left=1.8){this.notice=text;this.noticeLeft=left;}
 queueMove(d){this.queuedMove={x:d.x||0,y:d.y||0,left:.13};}
 beginThrow(){if(!this.canThrow||this.charging)return false;if(!this.inFeedSpot){this.say('발자국 자리에서 던져요');return false;}if(this.origin.x>animalPose(this.active).target.x-18){this.say('조금 왼쪽에서 던져요');return false;}this.charging=true;this.chargeAge=0;this.charge=.16;this.player.face=1;return true;}
 cancelThrow(){this.charging=false;this.charge=0;}
 releaseThrow(){if(!this.charging)return false;const power=this.charge;this.cancelThrow();if(!this.canThrow)return false;this.lastPower=power;this.player.shotAge=0;this.pending={delay:.14,power,angle:this.angle,food:this.active.spec.food,id:this.active.spec.id};this.cooldown=.48;this.throwCount++;return true;}
 act(){if(this.charging)return this.releaseThrow();if(!this.beginThrow())return false;this.charge=this.lastPower;return this.releaseThrow();}
 flash(){if(!this.canShield)return false;this.flashes--;this.active.attention=4;this.say('호루라기 · 착지한 뒤 기다려 줘요');this.onEvent({type:'zooWhistle'});return true;}
 feed(a,pose){if(a.fed>=2||a.chew>0||!pose.open)return false;a.fed++;a.chew=.9;if(a.spec.kind==='hippo')a.waterPulses.push({age:0,strength:.7});this.hitCount++;this.effects.push({kind:'heart',x:pose.target.x,y:pose.target.y,age:0});this.onEvent({type:'zooFeed',id:a.spec.id});if(a.fed===2){const earned=awardClue(this,a.spec.id);this.effects.push({kind:'card',id:earned,x:pose.x,y:pose.y-a.spec.size*.84,age:0});this.say(a.spec.name+' · 단서 획득!',1.4);this.onEvent({type:'card',id:earned,x:pose.x-this.camera.x,y:170+pose.y-a.spec.size*.84});}return true;}
 update(dt,input={}){if(this.ended)return;let left=clamp(dt,0,65);while(left>1e-8&&!this.ended){const h=Math.min(left,1/90);left-=h;this.step(h,input);}}
 step(dt,input){
  this.elapsed=Math.min(ZOO.duration,this.elapsed+dt);this.cooldown=Math.max(0,this.cooldown-dt);this.noticeLeft=Math.max(0,this.noticeLeft-dt);this.player.shotAge+=dt;
  let move=input;if(!input.x&&!input.y&&this.queuedMove){move=this.queuedMove;this.queuedMove.left-=dt;if(this.queuedMove.left<=0)this.queuedMove=null;}
  const dx=clamp(move.x||0,-1,1)*ZOO.speed*dt*(this.charging?.5:1)*(this.player.shotAge<.26?0:1);const oldX=this.player.x;this.player.x=clamp(oldX+dx,32,ZOO.width-35);const moved=Math.abs(this.player.x-oldX);this.player.moving=movedDuringStep(moved,0,dt);this.player.walkDistance+=moved;if(dx&&!this.charging)this.player.face=dx<0?-1:1;
  this.angle=clamp(this.angle-(move.y||0)*48*dt,12,82);if(this.charging){this.chargeAge+=dt;this.charge=clamp(.16+this.chargeAge*.84/.95);}
  if(this.room!==this.lastRoom){this.cancelThrow();this.lastRoom=this.room;this.say(this.active.spec.name+' · '+this.active.spec.tip,2.5);}
  const target=clamp(this.inFeedSpot?this.active.spec.start:this.player.x-62,0,ZOO.width-390),k=1-Math.exp(-dt*9);this.camera.x+=(target-this.camera.x)*k;
  for(const a of this.animals){
   a.cameraX=this.camera.x;
   if(Math.abs(a.spec.start+200-this.player.x)<360)a.activated=true;if(!a.activated)continue;
   a.reach=Math.max(0,a.reach-dt);a.attention=Math.max(0,a.attention-dt);
   const oldClock=a.clock;const p=animalPose(a);if(a.chew>0&&!p.airborne&&p.freezeSafe)a.chew=Math.max(0,a.chew-dt);
   if(a.jump){a.jump.age+=dt;if(a.jump.age>=(a.jump.duration||1.12))a.jump=null;}
   else if((!p.freezeSafe||p.airborne||(a.chew===0&&a.fed<2&&(a.attention<=0||a.spec.kind==='tiger'))||(!p.ready&&a.attention>0))&&!(a.reach>0&&['zebra','penguin'].includes(a.spec.kind)))a.clock+=dt;
   if(a.spec.kind==='hippo'){
    a.waterPulses=a.waterPulses.filter(r=>(r.age+=dt)<3);
    for(const at of [.55,3.2])if(Math.floor((a.clock-at)/4.9)>Math.floor((oldClock-at)/4.9))a.waterPulses.push({age:0,strength:1});
   }
   const after=animalPose(a);if(after.moving&&!after.airborne)a.walkDistance+=Math.abs(after.x-p.x);
  }
  if(this.pending){this.pending.delay-=dt;if(this.pending.delay<=0){const p=this.pending,o=this.origin,v=shotVelocity(p.angle,p.power);this.shots.push({...o,...v,food:p.food,id:p.id,age:0,trail:[{...o}],best:999,sliding:false});this.pending=null;this.onEvent({type:'zooThrow'});}}
  for(const b of this.shots){
   if(b.dead)continue;const old={x:b.x,y:b.y},a=this.animals[b.id-1],s=a.spec;b.age+=dt;
   if(b.sliding){b.x+=b.vx*dt;b.vx=Math.max(0,b.vx-54*dt);b.y=ZOO_SUPPORT.fishY;}
   else{b.x+=b.vx*dt;b.y+=b.vy*dt+ZOO.gravity*dt*dt/2;b.vy+=ZOO.gravity*dt;}
   if(Math.floor(b.age*30)>b.trail.length-1)b.trail.push({x:b.x,y:b.y});
   let pose=animalPose(a);b.best=Math.min(b.best,Math.hypot(b.x-pose.target.x,b.y-pose.target.y));
   if(s.kind==='penguin'&&!b.sliding&&b.vy>0&&old.y<ZOO_SUPPORT.fishY&&b.y>=ZOO_SUPPORT.fishY&&b.x>s.start+202&&b.x<s.start+390){b.sliding=true;b.y=ZOO_SUPPORT.fishY;b.vx*=.64;b.vy=0;this.effects.push({kind:'ice',x:b.x,y:393,age:0});}
   if(['zebra','giraffe'].includes(s.kind)&&pose.ready&&Math.hypot(b.x-pose.target.x,b.y-pose.target.y)<83){a.reach=.25;pose=animalPose(a);}
   if(s.kind==='penguin'&&b.sliding&&Math.abs(b.x-(pose.x-20))<70){a.reach=.4;pose=animalPose(a);}
   if(s.kind==='tiger'&&!a.jump&&a.chew===0&&a.fed<2&&b.age>.13&&b.x>pose.x-190&&b.x<pose.x-40&&b.y<pose.target.y-40&&b.vy<120){a.jump={age:.001,x:pose.x,y:399,duration:a.attention>0?1.5:1.12};pose=animalPose(a);}
   const catches=pose.open&&(pose.mode!=='slide'||b.sliding)&&segmentDistance(pose.target,old,b)<pose.radius+5;
   if(catches&&this.feed(a,pose))b.dead=true;
   else if(s.kind==='lion'&&!pose.open&&a.chew<=0&&segmentDistance(pose.target,old,b)<pose.radius+7){b.dead=true;this.effects.push({kind:'crumb',x:b.x,y:b.y,age:0});if(this.room===s.id-1)this.say('입을 크게 벌릴 때 던져요',1.4);}
   else if(b.y>444||b.age>3.5||b.x>s.start+414||(b.sliding&&b.vx<15)){
    b.dead=true;this.effects.push({kind:b.sliding?'ice':'crumb',x:b.x,y:Math.min(439,b.y),age:0});this.lastTrail={points:b.trail,age:0};
   }
  }
  this.shots=this.shots.filter(s=>!s.dead);this.effects=this.effects.filter(e=>(e.age+=dt)<(e.duration||1.3));if(this.lastTrail&&(this.lastTrail.age+=dt)>1.4)this.lastTrail=null;
  if(this.elapsed>=ZOO.duration||this.player.x>=ZOO.width-36)this.finish(true);
 }
 finish(survived=true){if(this.ended)return;this.ended=true;this.phase='complete';this.cancelThrow();this.pending=null;this.player.moving=false;this.queuedMove=null;this.onEvent({type:'end',survived,elapsed:this.elapsed,found:[...this.banked]});}
}
