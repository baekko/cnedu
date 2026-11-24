import {FLAT_WALK_SPEED,movedDuringStep} from './walk-cycle.js';
import {SIDE_HERO_SIZE} from './hero-scale.js';
import {writerCardBodyContact} from './writer-sprites-v99.js?v=155';
import {awardClue,hasSource} from './clue-order.js';
import {damage,collectRecovery,tickVitality} from './vitality.js';
import {GIANT_POSES} from './writer-giant-poses.js';
import {GiantSpritePlayback,giantCanDamage} from './writer-giant-sprites-v101.js';
import {giantHandsContact} from './writer-giant-collision.js?v=155';
export const WRITER=Object.freeze({duration:120,width:9600,height:500,speed:FLAT_WALK_SPEED,airSpeed:118,roomParallax:.2,gravity:640,flashes:3,stun:0,shieldSeconds:4,answer:'여우',hints:['꼬리가 풍성한 동물입니다.','동화에서 꾀가 많은 동물로 자주 등장합니다.']});
export const STORIES=Object.freeze([
 {id:'pigs',name:'아기 돼지 삼 형제',start:0,end:1700,cards:[1,2]},
 {id:'alice',name:'이상한 나라의 앨리스',start:1700,end:3400,cards:[3,4]},
 {id:'peter',name:'피터 팬',start:3400,end:5200,cards:[5,6]},
 {id:'pinocchio',name:'피노키오',start:5200,end:6800,cards:[7]},
 {id:'jack',name:'잭과 콩나무',start:6800,end:8200,cards:[8]},
 {id:'oz',name:'오즈의 마법사',start:8200,end:9600,cards:[9]}
].map(Object.freeze));
export const WRITER_CARDS=Object.freeze([
 {id:1,x:740,y:408,chapter:0},{id:2,x:1580,y:318,chapter:0},
 {id:3,x:2245,y:423,chapter:1},{id:4,x:3040,y:280,chapter:1},
 {id:5,x:4080,y:275,chapter:2},{id:6,x:4930,y:150,chapter:2},
 {id:7,x:6700,y:408,chapter:3},{id:8,x:7330,y:-612,chapter:4},
 {id:9,x:9485,y:408,chapter:5}
].map(Object.freeze));
export const ALICE_GATE=Object.freeze({x:2156,y:334,w:128,h:74.2});
export const WRITER_WIND=Object.freeze({warning:1.8,active:1,period:6.4,trigger:160});
export const NOSE=Object.freeze({x:5960,y:385,width:500,extend:1.2,hold:4,warning:1,retract:1.4,period:7.6});
export const PIRATES=Object.freeze([{x:3890,y:440},{x:4540,y:280},{x:5080,y:440}]);
export const VINE=Object.freeze({x:7220,bottom:440,top:-580,speed:170,grip:32});
export const GIANT=Object.freeze({size:300,warning:1.05,active:.26,retract:.24,cooldown:.65,lead:.95,triggerY:30,restDrop:58});
export const CASTLE=Object.freeze({x:9485,y:440,range:18,entryTime:.85});
// Room coordinates: the pet belongs to the author's room, not a story spread.
export const WRITER_CAT=Object.freeze({x:1378,y:406,scale:.63,wakeX:5155});
export const PUPPETS=Object.freeze([{x:6080,y:210,phase:0},{x:6380,y:210,phase:Math.PI}]);
export const OZ_FRIENDS=Object.freeze([{name:'허수아비',x:8350,text:'노란 벽돌길을 따라가요.'},{name:'양철 나무꾼',x:8770,text:'원숭이의 그림자를 피해요.'},{name:'겁쟁이 사자',x:9180,text:'용기 내요. 성이 가까워요!'}]);
export const POPPIES=Object.freeze([{x:8630,w:60},{x:9020,w:65}]);
export function giantGrip(giant){return GIANT_POSES[giant.hand===1?3:2].hands[0];}
export function giantHands(giant){const s=GIANT.size/512,grip=giantGrip(giant);return GIANT_POSES[giant.hand===1?3:2].hands.map(h=>{const r=h.rect;return {x:VINE.x+(r[0]-256)*s,y:giant.targetY+(r[1]-grip.palm[1])*s,w:r[2]*s,h:r[3]*s};});}
export function giantHand(giant){return giantHands(giant)[0];}
export function puppetAt(p,time){const angle=Math.sin(time*1.4+p.phase)*1.05,r=95;return {x:p.x-Math.sin(angle)*r,y:p.y+Math.cos(angle)*r,angle};}
export const WRITER_PLATFORMS=Object.freeze([
 {id:'garden',x:0,y:440,w:3640,kind:'desk'},
 {id:'brick-step',x:1430,y:399,w:70,kind:'book'},{id:'brick-roof',x:1515,y:352,w:125,kind:'brick'},
 {id:'cup',x:2975,y:338,w:130,kind:'cup'},
 {id:'ship',x:3800,y:440,w:1450,kind:'deck'},
 {id:'rig1',x:4000,y:351,w:100,kind:'rigging'},{id:'rig2',x:4490,y:280,w:120,kind:'rigging'},{id:'rig3',x:4870,y:352,w:120,kind:'rigging'},
 {id:'pier',x:5100,y:440,w:860,kind:'desk'},
 {id:'launch',x:5895,y:385,w:65,kind:'nose-launch'},
 {id:'island',x:6175,y:385,w:90,kind:'island'},
 {id:'village',x:6460,y:440,w:3140,kind:'desk'},
 {id:'vine-top',x:7105,y:-580,w:290,kind:'cloud'},
 {id:'cloud1',x:7390,y:-480,w:150,kind:'cloud'},
 {id:'cloud2',x:7540,y:-300,w:150,kind:'cloud'},
 {id:'cloud3',x:7690,y:-100,w:150,kind:'cloud'},
 {id:'cloud4',x:7840,y:100,w:150,kind:'cloud'},
 {id:'cloud5',x:7990,y:300,w:150,kind:'cloud'}
].map(Object.freeze));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const intersects=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
export const chapterAt=x=>Math.max(0,STORIES.findIndex(s=>x<s.end));
export function writerBody(p,size=p.size){const s=size*SIDE_HERO_SIZE/56;return {x:p.x-13*s,y:p.y-49*s,w:26*s,h:49*s};}
export class WriterGame{
 constructor({onEvent=()=>{},guardTouches=writerCardBodyContact,giantTouches=g=>giantHandsContact(g,VINE.x,GIANT.size)}={}){
  this.onEvent=onEvent;this.guardTouches=guardTouches;this.giantTouches=giantTouches;this.elapsed=0;this.ended=false;this.phase='explore';this.health=3;this.flashes=WRITER.flashes;
  this.found=new Set();this.banked=new Set();this.clueSources=new Set();this.effects=[];this.hooks=[];this.monkeys=[];this.nextHook=0;this.nextMonkey=0;
  this.shieldLeft=0;this.recoveryItems=[{kind:'goldenApple',x:3550,y:415}];this.hits=0;this.stunLeft=0;this.invincibleLeft=0;this.recoveryGlow=0;this.actionWait=0;this.message='';this.messageLeft=0;this.queuedMove=null;
  this.player={x:70,y:440,vx:0,vy:0,size:1,dir:'right',moving:false,walk:0,onGround:true,flying:false,hidden:false,platform:'garden',climbing:false,climbDistance:0,hammerAge:99};
  this.checkpoint={x:70,y:440,id:'garden'};this.camera={x:0,y:0};this.chapter=0;this.hiding=null;
  this.houses=[420,900,1380].map((x,i)=>({id:i,x,doorX:x+[-15.09,-26.33,-25.57][i],type:i,age:0,active:false,broken:false,lastHit:-1}));
  this.pigs=this.houses.map(h=>({id:h.id,houseId:h.id,targetHouse:h.id,x:h.doorX,mode:'invite',distance:0,delay:0}));
  this.catAge=-1;this.castleEntry=null;this.reachedCastle=false;
  this.guards=[{home:2490,range:110,speed:53,phase:0},{home:3070,range:100,speed:63,phase:2}];
  this.nose={active:false,age:0,length:0,phase:'rest'};
  this.giant={active:false,age:0,phase:'rest',frame:0,hand:0,targetY:-180,displayY:-95,fromY:-95,gripY:-95,attacks:0,cooldown:0};this.ozFriends=new Set();
  this.giantPlayback=new GiantSpritePlayback();this.giantPose=this.giantPlayback.sample(this.giant,0);
 }
 get remaining(){return Math.max(0,WRITER.duration-this.elapsed);}
 get canMove(){return !this.ended&&!this.castleEntry&&this.stunLeft<=0&&!this.player.hidden;}
 get canRecover(){return !this.ended&&!this.castleEntry&&this.shieldLeft<=0&&this.flashes>0;}
 get story(){return STORIES[this.chapter];}
 get actionLabel(){return this.chapter===0?this.player.hidden?'나오기':'숨기':this.chapter===1?'변신':this.chapter===2?'비행':this.chapter===3?'거짓말':'행동';}
 get canAct(){return !this.ended&&!this.castleEntry&&this.stunLeft<=0&&this.actionWait<=0&&(this.chapter===0?(!!this.hiding||!!this.nearHouse()):this.chapter<3||this.chapter===3&&this.nose.phase==='rest'&&(this.player.x>5740&&this.player.x<6000||this.player.platform==='island'));}
 nearCastle(){return this.player.onGround&&this.player.x>=CASTLE.x-CASTLE.range;}
 nearHouse(){return this.houses.find(h=>!h.broken&&this.player.onGround&&Math.abs(this.player.x-h.doorX)<=42)||null;}
 windPhase(h){const a=h.age%WRITER_WIND.period;return !h.active?'idle':a<WRITER_WIND.warning?'warning':a<WRITER_WIND.warning+WRITER_WIND.active?'gust':'rest';}
 guardAt(guard){const phase=this.elapsed*guard.speed/(guard.range*2)+guard.phase,t=phase%2;return {x:guard.home+guard.range*(t<1?-1+2*t:3-2*t),y:440,dir:t<1?'right':'left',walk:this.elapsed*guard.speed,moving:true};}
 platforms(){
  const list=WRITER_PLATFORMS.map(f=>f.kind==='leaf'?{...f,x:f.x+Math.sin(this.elapsed*1.8+f.x)*7}:f);
  if(this.nose.length>3)list.push({id:'nose',x:NOSE.x,y:NOSE.y,w:this.nose.length,kind:'nose'});
  return list;
 }
 get prompt(){
  if(this.castleEntry)return '에메랄드 성으로 들어가요';
  if(this.messageLeft>0)return this.message;
  if(this.chapter===0){
   if(this.hiding)return this.windPhase(this.hiding.house)==='gust'?'집 안은 안전해요 · 입김이 멎으면 나와요':'입김이 멎으면 나오기를 눌러요';
   if(this.nearHouse())return '문 앞이에요 · 숨기를 눌러 집 안으로!';
   const h=this.houses.find(h=>this.windPhase(h)==='warning'&&Math.abs(h.x-this.player.x)<260);
   return h?'늑대가 숨을 들이마셔요 · 집 문을 찾아요':'집 문 앞에서 숨기 · 높은 단서는 점프';
  }
  if(this.chapter===1)return this.player.x<2350?'작아져 낮은 문을 통과해요':'카드 병사를 피하고 · 커져서 높은 단서로!';
  if(this.chapter===2)return this.player.flying?'갈고리를 피하며 위아래로 날아요':'부두에서 비행을 눌러 날아올라요';
  if(this.chapter===3)return this.canAct?'거짓말을 눌러 코 다리를 펼쳐요':this.nose.phase==='warning'?'코가 줄어들어요 · 가운데 발판으로!':'흔들리는 인형을 피해 코 다리를 건너요';
  if(this.chapter===4){if(this.player.x<VINE.x-55)return '줄기 앞에서 ↑를 누르면 올라가요';return this.giant.phase==='warning'?'손 그림자를 피해 멈추거나 ↓로 내려가요':this.player.y<-550?'정상의 단서 · 오른쪽 구름길로 내려가요':'↑로 올라가요 · 손이 지나간 뒤 다시 출발!';}
  if(this.player.x>9310)return '성문 가까이 가면 탐험이 끝나요';
  const friend=OZ_FRIENDS.find(f=>Math.abs(f.x-this.player.x)<85);return friend?friend.name+' · '+friend.text:'세 친구와 노란 길을 따라 · 그림자는 옆으로';
 }
 say(message){this.message=message;this.messageLeft=1.5;}
 queueMove(input){if(this.canMove&&!this.queuedMove)this.queuedMove={x:input.x||0,y:input.y||0,left:.08};}
 movePlayer(dt,input){this.queueMove(input);}
 jump(){
  if(!this.canMove)return false;const p=this.player;
  if(p.flying){p.vy=-145;this.onEvent({type:'writerJump'});return true;}
  if(p.climbing){p.climbing=false;p.onGround=true;}
  if(!p.onGround)return false;p.vy=p.size>1.2?-390:p.size<.8?-285:-310;p.onGround=false;this.onEvent({type:'writerJump'});return true;
 }
 leaveHouse(){if(!this.hiding)return;this.player.hidden=false;this.player.y=440;this.player.onGround=true;this.hiding=null;this.actionWait=.25;}
 act(){
  if(!this.canAct)return false;const p=this.player;
  if(this.chapter===0){
   if(this.hiding){this.leaveHouse();return true;}
   const house=this.nearHouse();if(!house)return false;
   this.hiding={house,fromX:p.x,age:0};p.hidden=true;p.vx=0;p.vy=0;p.moving=false;this.queuedMove=null;this.actionWait=.3;this.onEvent({type:'writerHide'});return true;
  }
  if(this.chapter===1){
   const next=p.size===1?.56:p.size<1?1.55:1;
   if(intersects(writerBody(p,next),ALICE_GATE)){this.say('문 밖으로 나온 뒤에 커져요');return false;}
   p.size=next;this.actionWait=.28;this.effects.push({type:'magic',x:p.x,y:p.y-25,age:0});this.onEvent({type:'writerMagic'});return true;
  }
  if(this.chapter===2){p.flying=!p.flying;p.size=1;p.vy=p.flying?-65:0;p.onGround=false;this.actionWait=.28;this.onEvent({type:'writerMagic'});return true;}
  if(this.chapter===3){this.nose.active=true;this.nose.age=0;this.nose.phase='extend';this.actionWait=.3;this.say('코가 늘어나요 · 인형을 살펴봐요');this.onEvent({type:'writerMagic'});return true;}
  return false;
 }
 enterCastle(){if(this.ended||this.castleEntry||this.chapter!==5||this.stunLeft>0||!this.nearCastle())return false;this.castleEntry={age:0,fromX:this.player.x};this.queuedMove=null;this.player.moving=false;return true;}
 flash(){if(!this.canRecover)return false;this.flashes--;this.shieldLeft=WRITER.shieldSeconds;this.recoveryGlow=.7;this.effects.push({type:'bookmark',x:this.player.x,y:this.player.y-25,age:0});this.onEvent({type:'writerRecover'});return true;}
 hurt(kind){if(this.castleEntry||this.player.hidden)return false;const hit=damage(this,'writerHit',kind);if(hit)this.effects.push({type:kind,x:this.player.x,y:this.player.y-22,age:0});return hit;}

 fall(){
  this.hurt('fall');if(this.ended)return;const f=this.platforms().find(f=>f.id===this.checkpoint.id);
  Object.assign(this.player,{x:f?clamp(this.checkpoint.x,f.x+12,f.x+f.w-12):this.checkpoint.x,y:f?.y??this.checkpoint.y,vx:0,vy:0,onGround:true,flying:false,climbing:false,platform:this.checkpoint.id});
 }
 update(dt,input={}){
  if(this.ended||!Number.isFinite(dt)||dt<=0)return;let left=Math.min(dt,WRITER.duration);
  while(left>1e-8&&!this.ended){const step=Math.min(1/90,left,this.remaining);if(step<=0){this.finish(true);break;}this.step(step,input);left-=step;}
 }
 updateHazards(dt){
  const p=this.player;
  for(const h of this.houses){
   if(!h.active&&p.x>h.doorX-WRITER_WIND.trigger)h.active=true;if(!h.active)continue;h.age+=dt;
   const cycle=Math.floor(h.age/WRITER_WIND.period),phase=this.windPhase(h);
   if(phase==='gust'&&this.chapter===0&&h.lastHit!==cycle&&intersects(writerBody(p),{x:h.x-220,y:325,w:530,h:125})&&!p.hidden){if(this.hurt('wind'))h.lastHit=cycle;}
   if(h.age>=WRITER_WIND.warning+WRITER_WIND.active&&h.type<2&&!h.broken){h.broken=true;if(this.hiding?.house===h)this.leaveHouse();this.fleeHouse(h);this.effects.push({type:'house',x:h.x,y:420,age:0});}
  }
  for(const pig of this.pigs){if(pig.mode!=='run')continue;if(pig.delay>0){pig.delay-=dt;continue;}const target=this.houses[pig.targetHouse],d=Math.min(285*dt,Math.max(0,target.doorX-pig.x));pig.x+=d;pig.distance+=d;if(pig.x>=target.doorX){pig.houseId=target.id;pig.mode='safe';}}
  if(this.catAge>=0)this.catAge+=dt;else if(p.x>=WRITER_CAT.wakeX)this.catAge=0;
  if(this.chapter===1)for(const guard of this.guards){const q=this.guardAt(guard);if(this.guardTouches(p,q,this.elapsed,this))this.hurt('guard');}
  if(this.chapter===2&&p.x>3700&&this.elapsed>=this.nextHook){
   this.nextHook=this.elapsed+2.75;
   const pirate=PIRATES.find(q=>q.x>p.x-70)||PIRATES.at(-1),from={x:pirate.x-15,y:pirate.y-48},tx=p.x+p.vx*1.3,ty=p.y-25+p.vy*.6,angle=Math.atan2(ty-from.y,tx-from.x);
   this.hooks.push({...from,pirate:PIRATES.indexOf(pirate),sourceX:from.x,sourceY:from.y,vx:Math.cos(angle)*240,vy:Math.sin(angle)*240,age:0,warning:.8,life:4,tx,ty,hit:false});
  }
  for(const h of this.hooks){h.age+=dt;if(h.age>=h.warning){h.x+=h.vx*dt;h.y+=h.vy*dt;if(!h.hit&&intersects(writerBody(p),{x:h.x-10,y:h.y-10,w:20,h:20})){if(this.hurt('hook'))h.hit=true;}}}
  this.hooks=this.hooks.filter(h=>h.age<h.life&&h.x>3350&&h.y>-50&&h.y<550);
  if(this.nose.active){
   const n=this.nose;n.age+=dt;const a=n.age;
   if(a<NOSE.extend){n.length=NOSE.width*a/NOSE.extend;n.phase='extend';}
   else if(a<NOSE.extend+NOSE.hold){n.length=NOSE.width;n.phase='hold';}
   else if(a<NOSE.extend+NOSE.hold+NOSE.warning){n.length=NOSE.width;n.phase='warning';}
   else if(a<NOSE.extend+NOSE.hold+NOSE.warning+NOSE.retract){n.length=NOSE.width*(1-(a-NOSE.extend-NOSE.hold-NOSE.warning)/NOSE.retract);n.phase='retract';}
   else {n.length=0;n.phase='rest';n.active=false;}
  }
  if(this.chapter===3)for(const puppet of PUPPETS){const q=puppetAt(puppet,this.elapsed);if(intersects(writerBody(p),{x:q.x-19,y:q.y-12,w:38,h:66}))this.hurt('puppet');}
  const h=this.giant;h.cooldown=Math.max(0,h.cooldown-dt);
  if(!h.active&&h.cooldown===0&&this.chapter===4&&p.climbing&&p.y<GIANT.triggerY&&p.y>VINE.top+30&&this.stunLeft<=0){
   h.active=true;h.age=0;h.phase='warning';h.hand=h.attacks%2;h.attacks++;h.fromY=h.displayY;
   h.targetY=clamp(p.y-24+(p.climbDir||-1)*VINE.speed*GIANT.lead,VINE.top-15,GIANT.triggerY);
   h.gripY=h.targetY-(giantGrip(h).palm[1]-256)*GIANT.size/512;
  }
  if(h.active){
   h.age+=dt;const a=h.age;h.phase=a<GIANT.warning?'warning':a<GIANT.warning+GIANT.active?'sweep':'retract';
   h.frame=h.phase==='retract'?(h.hand?0:1):a<.2?(h.hand?1:0):(h.hand?3:2);
   if(h.phase==='warning'){const t=clamp(a/(GIANT.warning*.9),0,1),ease=t*t*(3-2*t);h.displayY=h.fromY+(h.gripY-h.fromY)*ease;}
   else if(h.phase==='sweep'){h.displayY=h.gripY;}
   else {const t=(a-GIANT.warning-GIANT.active)/(GIANT.retract+GIANT.cooldown);h.displayY=h.gripY+GIANT.restDrop*Math.min(1,t);}
   if(a>=GIANT.warning+GIANT.active+GIANT.retract){h.active=false;h.phase='rest';h.cooldown=GIANT.cooldown;}
  }else if(h.attacks){
   // Climb back down a short distance between grips, then reach with the other
   // hand. Whole-body movement keeps wrists, arms, head and legs connected.
   const t=clamp(1-h.cooldown/(GIANT.retract+GIANT.cooldown),0,1);h.displayY=h.gripY+GIANT.restDrop*t;h.frame=h.hand?0:1;
  }
  this.giantPose=this.giantPlayback.sample(h,this.elapsed);
  if(this.chapter===5){
   OZ_FRIENDS.forEach((f,i)=>{if(Math.abs(p.x-f.x)<75&&!this.ozFriends.has(i)){this.ozFriends.add(i);this.say(f.name+' · '+f.text);}});
  }
  if(this.chapter===5&&p.x>8410&&this.elapsed>=this.nextMonkey){this.nextMonkey=this.elapsed+3.7;const x=clamp(p.x+p.vx*1.4,8380,WRITER.width-70);this.monkeys.push({x,y:120,age:0,warning:1.05,dive:.35,hit:false});}
  for(const m of this.monkeys){m.age+=dt;const a=m.age-m.warning;m.y=a<0?120: a<m.dive?120+300*(a/m.dive)**2:420-Math.min(1,(a-m.dive)/.8)*330;if(a>=0&&!m.hit&&intersects(writerBody(p),{x:m.x-23,y:m.y-20,w:46,h:40})){if(this.hurt('monkey'))m.hit=true;}}
  this.monkeys=this.monkeys.filter(m=>m.age<m.warning+m.dive+.9);
 }
 fleeHouse(house){
  const target=this.houses.find(h=>h.id>house.id&&!h.broken);if(!target)return;
  let order=0;for(const pig of this.pigs){if(pig.targetHouse!==house.id&&pig.houseId!==house.id)continue;pig.targetHouse=target.id;pig.houseId=-1;pig.mode='run';pig.delay=order++*.13;}
 }
 step(dt,input){
  tickVitality(this,dt);this.shieldLeft=Math.max(0,this.shieldLeft-dt);
  const p=this.player;this.elapsed+=dt;
  for(const key of ['stunLeft','invincibleLeft','actionWait','messageLeft','recoveryGlow'])this[key]=Math.max(0,this[key]-dt);
  this.effects.forEach(e=>e.age+=dt);this.effects=this.effects.filter(e=>e.age<1.2);
  if(this.castleEntry){const e=this.castleEntry;e.age+=dt;p.x=e.fromX+(CASTLE.x-e.fromX)*Math.min(1,e.age/.55);p.walk+=dt;p.moving=true;this.camera.x+=(Math.min(WRITER.width-390,p.x-150)-this.camera.x)*(1-Math.exp(-10*dt));if(e.age>=CASTLE.entryTime||this.remaining<1e-8){this.reachedCastle=true;this.finish(true);}return;}
  this.updateHazards(dt);if(this.ended)return;
  let dx=clamp(Number(input.x)||0,-1,1),dy=clamp(Number(input.y)||0,-1,1);
  if(this.queuedMove){if(!dx&&!dy){dx=this.queuedMove.x;dy=this.queuedMove.y;}this.queuedMove.left-=dt;if(this.queuedMove.left<=0)this.queuedMove=null;}
  if(this.hiding){const h=this.hiding;h.age+=dt;const t=clamp(h.age/.22,0,1);p.x=h.fromX+(h.house.doorX-h.fromX)*t;p.y=438.4;p.moving=false;}
  else if(this.canMove){
   if(this.chapter===4&&Math.abs(p.x-VINE.x)<VINE.grip&&p.y<=VINE.bottom+1&&p.y>VINE.top&&dy<0&&!p.flying){p.climbing=true;p.vy=0;p.onGround=false;}
   if(p.climbing&&Math.abs(dx)>.25){p.climbing=false;p.vy=0;}
   if(p.climbing){
    const before=p.y;p.climbDir=dy;p.x+=(VINE.x-p.x)*Math.min(1,dt*18);p.y=clamp(p.y+dy*VINE.speed*dt,VINE.top,VINE.bottom);p.vx=0;p.vy=0;p.onGround=false;p.moving=movedDuringStep(0,p.y-before,dt);p.climbDistance+=Math.abs(p.y-before);p.walk+=p.moving?dt:0;
    if(p.y<=VINE.top||p.y>=VINE.bottom){p.climbing=false;p.onGround=true;p.platform=p.y<=VINE.top?'vine-top':'village';this.checkpoint={x:p.x,y:p.y,id:p.platform};}
   }else{
   const support=WRITER_PLATFORMS.find(f=>f.id===p.platform);
   if(p.onGround&&support?.kind==='leaf')p.x+=(Math.sin(this.elapsed*1.8+support.x)-Math.sin((this.elapsed-dt)*1.8+support.x))*7;
   const oldX=p.x,oldY=p.y;
   if(p.flying){const n=Math.hypot(dx,dy)||1;p.vx=dx/n*140;const target=dy?dy/n*115:13;p.vy+=(target-p.vy)*Math.min(1,dt*9);}
   else{p.vx=dx*(p.onGround?WRITER.speed:WRITER.airSpeed)*(p.size<.8?.94:1);p.vy+=WRITER.gravity*dt;}
   p.x=clamp(p.x+p.vx*dt,22,WRITER.width-25);if(intersects(writerBody(p),ALICE_GATE))p.x=oldX;
   p.y+=p.vy*dt;p.onGround=false;
   if(!p.flying&&p.vy>=0)for(const f of this.platforms()){if(p.x+10*p.size>f.x&&p.x-10*p.size<f.x+f.w&&oldY<=f.y+.5&&p.y>=f.y){p.y=f.y;p.vy=0;p.onGround=true;p.platform=f.id;if(f.kind!=='nose'&&this.invincibleLeft===0)this.checkpoint={x:p.x,y:p.y,id:f.id};break;}}
   if(p.flying)p.y=clamp(p.y,85,490);
   p.moving=movedDuringStep(p.x-oldX,p.flying?p.y-oldY:0,dt);if(dx)p.dir=dx<0?'left':'right';if(p.moving)p.walk+=dt;
   if(p.y>535)this.fall();
   }
  }else p.moving=false;
  const chapter=chapterAt(p.x);
  if(chapter!==this.chapter){this.chapter=chapter;p.size=1;p.flying=false;p.climbing=false;this.leaveHouse();this.say(STORIES[chapter].name);this.onEvent({type:'writerChapter',chapter});}
  if(this.chapter===4&&giantCanDamage(this.giant)&&this.invincibleLeft<=0&&this.shieldLeft<=0&&this.giantTouches(this)){this.hurt('hand');if(this.ended)return;}
  if(this.stunLeft<=0&&!p.hidden){const b=writerBody(p);for(const card of WRITER_CARDS){if(!hasSource(this,card.id)&&intersects(b,{x:card.x-11,y:card.y-14,w:22,h:28})){const earned=awardClue(this,card.id);this.effects.push({type:'card',x:card.x,y:card.y,age:0});this.onEvent({type:'card',id:earned,x:card.x-this.camera.x,y:card.y-this.camera.y+170});}}}
  collectRecovery(this,{x:p.x,y:p.y-25});
  // Pick up the doorway card before entering. Missing earlier cards never block the goal.
  this.enterCastle();
  const target=clamp(p.x-150,0,WRITER.width-390);this.camera.x+=(target-this.camera.x)*(1-Math.exp(-10*dt));
  const ty=this.chapter===4?clamp(p.y-310,-850,0):0;this.camera.y+=(ty-this.camera.y)*(1-Math.exp(-7*dt));
  if(this.remaining<1e-8){this.elapsed=WRITER.duration;this.finish(true);}
 }
 finish(survived=true){if(this.ended)return;this.ended=true;this.phase=survived?'complete':'stopped';this.player.moving=false;this.queuedMove=null;this.onEvent({type:'end',survived,elapsed:this.elapsed,found:[...this.banked]});}
}
