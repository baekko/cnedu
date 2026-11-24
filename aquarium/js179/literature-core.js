import {movedDuringStep} from './walk-cycle.js';
import {roomSolids,ENTRY_POINTS,RETURN_POINTS} from './literature-layout.js';
import {awardClue,hasSource} from './clue-order.js';
import {walkable,moveOnFloor,nearestWalkable,EXITS,salvagePoints,raftPoint,windProps,knightPoint,ropePoints,valvePoints,elephantGates,elephantObstacles,surfAt,reelAt,sheepAt,patrolAt,tentacleAt,tentaclePose,tentacleTouches,patrolMembers,soldierTouches,ropeWorkPoint,patrolWorkWindow,valveWorkPoint,VALVE_SECONDS,FISHING,SEWING,LOCK_WORK,seamX,elephantStart} from './literature-rules.js';
export {windProps,ropePoints,valvePoints,reelAt} from './literature-rules.js';
// Nine small, distinct action scenes. World coordinates are shared by the
// continuous gallery; room-local coordinates keep telegraphs and collisions equal.
export const LITERATURE=Object.freeze({duration:130,speed:150,width:390,height:4500,roomHeight:500,stunSeconds:1.8,flashes:3,answer:'판다',hints:['대나무를 즐겨 먹는 동물입니다.','눈 주위와 귀, 팔다리가 검은색인 곰입니다.']});
export const BOOKS=Object.freeze([
 {id:'prince',name:'어린 왕자',author:'생텍쥐페리',goal:'추운 밤, 유리 덮개로 장미를 보호해요',action:'집기',total:1},
 {id:'crusoe',name:'로빈슨 크루소',author:'대니얼 디포',goal:'파도를 피해 나무 두 묶음을 로빈슨에게 가져가요',action:'집기',total:2},
 {id:'sea',name:'노인과 바다',author:'어니스트 헤밍웨이',goal:'물고기가 물면 당겨 버튼을 빠르게 연타해요',action:'당겨',total:1},
 {id:'anne',name:'빨강 머리 앤',author:'루시 모드 몽고메리',goal:'앤에게 선물할 부푼 소매 드레스를 재봉해요',action:'재봉',total:1},
 {id:'world',name:'80일간의 세계 일주',author:'쥘 베른',goal:'앞으로 걷는 코끼리를 좌우로 이끌어 숲길을 건너요',action:'탑승',total:1},
 {id:'nautilus',name:'해저 2만 리',author:'쥘 베른',goal:'촉수가 물러난 사이 두 밸브를 잠가요',action:'잠가',total:2},
 {id:'gulliver',name:'걸리버 여행기',author:'조너선 스위프트',goal:'소인국 병사가 지나가면 밧줄을 풀어요',action:'풀기',total:3},
 {id:'treasure',name:'보물섬',author:'로버트 루이스 스티븐슨',goal:'바늘이 금빛 홈에 오면 자물쇠를 열어요',action:'열기',total:3},
 {id:'holmes',name:'셜록 홈스',author:'아서 코넌 도일',goal:'마름모 발자국을 아래부터 순서대로 조사해요',action:'조사',total:3}
].map(Object.freeze));
export const BACK_PORTAL=Object.freeze({x:195,y:458});
export const roomBase=i=>(8-i)*500;
export const localPoint=(i,x,y)=>({x,y:roomBase(i)+y});
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export function segmentDistance(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,n=dx*dx+dy*dy,u=n?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/n)):0;return Math.hypot(p.x-a.x-u*dx,p.y-a.y-u*dy);}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const approach=(a,b,t)=>a+(b-a)*Math.min(1,t);
export const guardPoints=[{x:105,y:245},{x:285,y:245},{x:195,y:170}];
export const pressureAt=(t,k)=>{const u=((t+k*.7)%2.3)/2.3;return {value:u,good:u>.3&&u<.65};};
export const trainAt=t=>{const p=t%7.5;return p<2?{x:-85+280*p/2,stopped:false}:p<4.8?{x:195,stopped:true}:{x:195+(p-4.8)*170,stopped:false};};
export const lockAt=(t,step)=>{const a=(t*1.3)%(Math.PI*2),target=[1.6,4.45,3][Math.min(2,step)],d=Math.atan2(Math.sin(a-target),Math.cos(a-target));return {angle:a,target,good:Math.abs(d)<.58};};
export const windmillAt=t=>Array.from({length:4},(_,i)=>{const a=t*.72+i*Math.PI/2;return {a:{x:195+Math.cos(a)*24,y:245+Math.sin(a)*24},b:{x:195+Math.cos(a)*117,y:245+Math.sin(a)*117}};});
const makeScene=(i,random)=>({i,time:0,progress:0,solved:false,solvedAge:0,card:null,carrying:false,heldIndex:-1,built:0,build:null,mounted:false,unboundAt:[-1,-1,-1],retiringArms:[null,null],armTime:[-1,-1],fishBite:0,hooked:false,reelGauge:0,lastTap:-99,sewing:false,sewTime:0,needle:195,trailStep:0,boardAge:0,recoil:null,brace:0,braceCycle:-1,tugJudged:-1,flags:new Set(),hazards:[],nextHazard:1.5,guard:{phase:'idle',age:0,aim:{x:0,y:1},stagger:0},parry:0,parried:false,parryUsed:false,reelCycle:-1,reelCooldown:0,pullAge:99,valves:[0,0],job:null,footRoute:[0,1,2].map(()=>Math.floor(random()*3)),wrongFoot:-1,notice:'',noticeLeft:0});
export class LiteratureGame{
 constructor({onEvent=()=>{},random=Math.random}={}){
  this.onEvent=onEvent;this.player={x:195,y:4450,dir:'up',walk:0,moving:false,hammerAge:99};this.elapsed=0;this.health=3;this.flashes=LITERATURE.flashes;this.banked=new Set();this.clueSources=new Set();this.found=new Set();this.scenes=BOOKS.map((_,i)=>makeScene(i,random));this.camera={x:0,y:4000};this.effects=[];this.ended=false;this.phase='explore';this.stunLeft=0;this.invincibleLeft=0;this.actionWait=0;this.actionAge=99;this.actionType='';this.hits=0;this.visited=new Set([0]);this.reachedExit=false;this.endEmitted=false;this.lastInput={x:0,y:0};this.motion=null;this.queuedMove=null;this.transitionLeft=0;
 }
 get room(){return clamp(8-Math.floor(this.player.y/500),0,8);}
 get scene(){return this.scenes[this.room];}
 get local(){return {x:this.player.x,y:this.player.y-roomBase(this.room)};}
 get canMove(){return !this.ended&&this.stunLeft<=0&&!this.motion;}
 get canRecover(){return !this.ended&&this.stunLeft>0&&this.flashes>0;}
 get nearAction(){const s=this.scene,p=this.local;if(s.solved)return false;switch(this.room){case 0:return distance(p,s.carrying?{x:285,y:166}:{x:78,y:340})<43;case 1:return s.carrying?distance(p,raftPoint)<43:salvagePoints.some((v,k)=>!s.flags.has(k)&&distance(p,v)<35);case 2:return distance(p,{x:195,y:282})<68&&s.hooked;case 3:return s.sewing||distance(p,SEWING.point)<45;case 4:return !s.mounted&&distance(p,elephantStart)<60;case 5:return s.progress===2?distance(p,{x:195,y:203})<36:valvePoints.some((v,k)=>!s.flags.has(k)&&distance(p,valveWorkPoint(k))<28);case 6:return ropePoints.some((v,k)=>!s.flags.has(k)&&distance(p,ropeWorkPoint(k))<24);case 7:return distance(p,{x:195,y:211})<53&&lockAt(s.time,s.progress).good;case 8:return s.progress===3?distance(p,{x:195,y:174})<38:this.footprints().some(f=>f.row===s.progress&&distance(p,f)<30);default:return false;}}
 get actionLabel(){const s=this.scene;if(this.room===0&&s.carrying)return '덮기';if(this.room===1&&s.carrying)return '전달';if(this.room===3&&s.sewing)return '나와';if(this.room===4&&s.mounted)return s.braking?'출발':'멈춤';if(this.room===5&&s.progress===2||this.room===8&&s.progress===3)return '열기';return BOOKS[this.room].action;}
 get fishingCue(){
  if(this.room!==2||this.scene.solved||this.stunLeft>0||distance(this.local,{x:195,y:282})>=100)return null;
  return {mode:distance(this.local,{x:195,y:282})>=68?'approach':this.scene.hooked?'reel':'wait'};
 }
 get prompt(){const s=this.scene;
  if(this.stunLeft>0)return this.flashes?'책갈피를 누르면 바로 일어나요':'잠시 후 다시 움직일 수 있어요';
  if(s.noticeLeft>0)return s.notice;
  if(s.solved)return hasSource(this,this.room+1)?(this.room===8?'이전 이야기로 돌아가 남은 단서를 찾아요':'노란 점선 원으로 다음 이야기에 가요'):'단서 아래 점선 원으로 걸어가 주워요';
  if(s.job)return this.room===5?'촉수가 물러난 동안 밸브를 잠가요':'두 손으로 매듭을 풀고 있어요';
  if(this.room===0&&s.carrying)return '장미 가까이에서 덮기';
  if(this.room===1&&s.build)return '로빈슨이 나무를 엮고 있어요';
  if(this.room===1&&s.carrying)return '로빈슨 옆 점선 원에서 전달을 눌러요';
  if(this.room===2){const q=this.fishingCue;if(!q||q.mode==='approach')return '낚싯줄 앞으로 이동해요';return q.mode==='reel'?'물었어요! 당겨 버튼을 빠르게 연타해요':'찌가 움직여요 · 곧 물고기가 물어요';}
  if(this.room===3)return s.sewing?(Math.abs(s.needle-seamX(s.sewTime))>SEWING.tolerance?(s.needle<seamX(s.sewTime)?'오른쪽으로 바늘을 맞춰요 →':'← 왼쪽으로 바늘을 맞춰요'):'← → 바늘을 금빛 봉제선에 맞춰요'):'재봉틀 앞에서 재봉을 눌러요';
  if(this.room===4)return s.mounted?(s.braking?'좌우로 피한 뒤 위쪽이나 출발을 눌러요':'좌우로 길을 골라요 · 아래 방향키로 멈춰요'):'코끼리 가까이에서 탑승';
  if(this.room===5&&s.progress===2)return '가운데 해치를 열어요';
  if(this.room===5){const k=valvePoints.map((p,k)=>({k,d:distance(this.local,p)})).filter(q=>!s.flags.has(q.k)&&q.d<115).sort((a,b)=>a.d-b.d)[0]?.k;if(k!==undefined){const h=tentacleAt(s.armTime[k],k);return h.rest?'촉수가 물러났어요 · 지금 잠가요':h.warning?'촉수가 다가와요 · 한 걸음 물러나요':h.active?'촉수가 내려쳐요 · 옆으로 피하세요':'촉수가 빠져나가고 있어요';}}
  if(this.room===6){const k=ropePoints.findIndex((v,k)=>!s.flags.has(k)&&distance(this.local,ropeWorkPoint(k))<65);if(k>=0)return patrolWorkWindow(s.time,k)?'병사가 지나갔어요 · 지금 풀어요':'병사가 지나갈 때까지 한 걸음 물러나요';}
  if(this.room===7&&lockAt(s.time,s.progress).good)return '금빛 홈에 왔어요 · 지금 열기!';
  if(this.room===8&&s.progress===3)return '책상 앞 서랍을 열어요';return BOOKS[this.room].goal;
 }
 notice(text,seconds=1.15){this.scene.notice=text;this.scene.noticeLeft=seconds;}
 queueMove(input){this.queuedMove={input,time:.08};}
 movePlayer(dt,input={}){
  const p=this.player;p.moving=false;if(!this.canMove)return;
  let x=input.x||0,y=input.y||0,n=Math.hypot(x,y);const i=this.room,s=this.scene;
  if(s.lockWork){const w=s.lockWork;w.age+=dt;const u=clamp(w.age/.3,0,1);p.x=w.from.x+(LOCK_WORK.point.x-w.from.x)*u;p.y=roomBase(i)+w.from.y+(LOCK_WORK.point.y-w.from.y)*u;p.dir='left';p.moving=u<1;if(p.moving)p.walk+=dt;
   if(w.age>=.65&&!w.applied){w.applied=true;if(w.good){s.progress++;this.onEvent({type:'literatureSuccess'});if(s.progress>=3)this.solve(7,{x:195,y:220});else this.notice(s.progress+' / 3 · 다음 금빛 홈을 맞춰요');}else this.notice('금빛 홈을 기다려요 · 풀어 둔 잠금은 유지돼요');}
   if(w.age>=.8)s.lockWork=null;return;}
  if(i===3&&s.sewing){if(s.sewApproach<.35){s.sewApproach+=dt;const u=clamp(s.sewApproach/.35,0,1);p.x=s.sewFrom.x+(SEWING.work.x-s.sewFrom.x)*u;p.y=roomBase(i)+s.sewFrom.y+(SEWING.work.y-s.sewFrom.y)*u;p.moving=u<1;p.dir='up';if(p.moving)p.walk+=dt;return;}p.dir='left';s.needle=clamp(s.needle+x*SEWING.speed*dt,133,257);return;}
  if(i===4&&s.mounted&&!s.solved){if(y<-.3)s.braking=false;const base=roomBase(i),forward=y>.3||s.braking?0:32*clamp((s.boardAge-.8)/.7,0,1);s.steer=approach(s.steer||0,x*90,dt*8);const next=moveOnFloor(i,p.x,p.y-base,s.steer*dt,-forward*dt,19,roomSolids(i,s));p.moving=movedDuringStep(next.x-p.x,next.y-(p.y-base),dt);p.x=next.x;p.y=base+next.y;p.dir='up';if(p.moving)p.walk+=dt;return;}
  if(!n)return;if(n>1){x/=n;y/=n;}this.lastInput={x,y};
  const speed=(i===4&&s.mounted?140:150)*(s.carrying?.88:1),base=roomBase(i),r=i===4&&s.mounted?19:7;
  const next=moveOnFloor(i,p.x,p.y-base,x*speed*dt,y*speed*dt,r,roomSolids(i,s)),mx=next.x-p.x,my=next.y-(p.y-base);
  p.x=next.x;p.y=base+next.y;p.moving=movedDuringStep(mx,my,dt);
  if(p.moving){p.walk+=dt;p.dir=Math.abs(mx)>Math.abs(my)?mx<0?'left':'right':my<0?'up':'down';}
 }

 act(){if(!this.canMove||this.actionWait>0||this.scene.lockWork)return false;const s=this.scene,p=this.local;this.actionWait=this.room===2?FISHING.tapCooldown:.45;this.actionAge=0;this.actionType=this.actionLabel;this.onEvent({type:'literatureAction'});if(s.solved)return false;
  switch(this.room){
   case 0:if(!s.carrying&&distance(p,{x:78,y:340})<43){s.carrying=true;this.notice('장미에게 가져가요');return true;}if(s.carrying&&distance(p,{x:285,y:166})<43){s.carrying=false;this.solve(0,{x:285,y:172});return true;}break;
   case 1:if(s.carrying&&distance(p,raftPoint)<43){s.flags.add(s.heldIndex);s.progress=s.flags.size;s.carrying=false;s.heldIndex=-1;if(!s.build)s.build={age:0,duration:1.6};this.effects.push({type:'build',...this.player,age:0});this.notice('로빈슨이 나무를 엮고 있어요',1);return true;}if(!s.carrying){const k=salvagePoints.findIndex((v,k)=>!s.flags.has(k)&&distance(p,v)<35);if(k>=0){s.carrying=true;s.heldIndex=k;return true;}}break;
   case 2:if(distance(p,{x:195,y:282})<68&&s.hooked){s.lastTap=s.time;s.reelGauge=Math.min(FISHING.taps,s.reelGauge+1);s.pullAge=0;if(s.reelGauge>=FISHING.taps)this.solve(2,{x:195,y:280});return true;}break;
   case 3:if(s.sewing){s.sewing=false;this.player.y=roomBase(3)+SEWING.point.y;return true;}if(distance(p,SEWING.point)<45){s.sewing=true;s.sewApproach=0;s.sewFrom={...p};s.needle=seamX(s.sewTime);this.player.dir='up';this.notice('← → 봉제선을 따라 바늘을 움직여요',1.5);return true;}break;
   case 4:if(s.mounted){s.braking=!s.braking;this.notice(s.braking?'코끼리가 잠시 멈췄어요':'다시 앞으로 걸어가요');return true;}if(!s.mounted&&distance(p,elephantStart)<60){s.mounted=true;s.boardAge=0;this.player.x=elephantStart.x;this.player.y=roomBase(4)+elephantStart.y;this.notice('좌우로 길을 골라요 · 아래 방향키로 멈춰요',2);return true;}break;
   case 5:{const k=valvePoints.findIndex((v,i)=>!s.flags.has(i)&&distance(p,valveWorkPoint(i))<28);if(k>=0&&!s.job){s.job={type:'valve',k,age:0,approach:0,from:{...p}};return true;}if(s.valves.every(n=>n>=1)&&distance(p,{x:195,y:203})<36){this.solve(5,{x:195,y:213});return true;}break;}
   case 6:{const k=ropePoints.findIndex((v,i)=>!s.flags.has(i)&&distance(p,ropeWorkPoint(i))<24);if(k>=0&&!s.job){s.job={k,age:0,approach:0,from:{...p}};this.player.dir='left';return true;}break;}
   case 7:if(distance(p,{x:195,y:211})<53){s.lockWork={age:0,from:{...p},good:lockAt(s.time,s.progress).good,applied:false};return true;}break;
   case 8:{if(s.progress===3&&distance(p,{x:195,y:174})<38){this.solve(8,{x:195,y:193});return true;}const f=this.footprints().find(f=>f.row===s.progress&&distance(p,f)<30);if(f){if(f.correct){s.progress++;s.flags.add(f.row);this.onEvent({type:'literatureSuccess'});}else{s.wrongFoot=f.row*3+f.lane;this.hurt('다른 발자국이에요',1);this.notice('마름모가 있는 발자국을 찾아요');}return true;}break;}
  }return false;
 }
 footprints(){const s=this.scenes[8];return Array.from({length:9},(_,i)=>{const row=Math.floor(i/3),lane=i%3;return {row,lane,x:100+lane*95,y:379-row*82,correct:lane===s.footRoute[row],done:s.flags.has(row)};});}
 solve(i,point){const s=this.scenes[i];if(s.solved)return;s.solved=true;s.solvedAge=0;s.progress=BOOKS[i].total;const spot=this.landing(i,point);s.card={...localPoint(i,spot.x,spot.y),id:i+1};s.hazards=[];this.effects.push({type:'solve',...s.card,age:0});this.onEvent({type:'literatureSuccess'});}
 flash(){if(!this.canRecover)return false;this.flashes--;this.stunLeft=0;this.invincibleLeft=1.5;this.effects.push({type:'recover',...this.player,age:0});this.onEvent({type:'literatureRecover'});return true;}
 hurt(reason='',seconds=LITERATURE.stunSeconds){if(this.ended||this.invincibleLeft>0||this.motion)return false;this.hits++;this.scene.job=null;this.stunLeft=seconds;this.invincibleLeft=seconds+1.5;this.player.moving=false;this.actionAge=99;this.effects.push({type:'hit',...this.player,age:0});this.onEvent({type:'literatureHit',reason});return true;}
 spawnHazard(s,type,extra={}){s.hazards.push({type,age:0,hit:false,...extra});}
 updateHazards(s,dt,input={}){const p=this.local,t=s.time,i=this.room;if(s.solved)return;
  if(i===1){const w=surfAt(t);if(w.active&&Math.abs(p.x-w.x)<17&&p.y>215&&p.y<370&&Math.abs(p.y-w.gap)>w.gapWidth/2-9)this.hurt('난파선 해안의 파도');}
  if(i===4&&s.mounted&&!s.recoil){for(const o of elephantObstacles)if(((p.x-o.x)/(o.rx+14))**2+((p.y-o.y)/(o.ry+9))**2<1){if(this.hurt('숲길의 장애물',1)){s.recoil={age:0,from:{...p},to:nearestWalkable(4,{x:p.x,y:o.y+o.ry+14},19,roomSolids(4,s))};s.braking=true;s.steer=0;this.notice('안전하게 멈췄어요 · 길을 피한 뒤 출발해요',1.6);}}const target=elephantGates[s.trailStep];if(target&&p.y<target.y-10){s.trailStep++;if(s.trailStep===elephantGates.length){s.park={...p};this.motion={kind:'dismount',age:0,from:{...this.player},to:(()=>{const q=this.landing(4,{x:220,y:195},{...s,mounted:false});return localPoint(4,q.x,q.y);})()};}}}
  if(i===5)for(let k=0;k<2;k++){if(s.flags.has(k))continue;if(s.armTime[k]<0){if(distance(p,valveWorkPoint(k))<100)s.armTime[k]=0;}else s.armTime[k]+=dt;if(tentacleTouches(p,s.armTime[k],k))this.hurt('거대 오징어의 촉수',1.4);}
  if(i===6)for(let k=0;k<3;k++)if(patrolMembers(t,k).some(h=>soldierTouches(p,h)))this.hurt('소인국 병사와 부딪혔어요',1.3);
  if(i===7&&t>=s.nextHazard){s.nextHazard=t+2;this.spawnHazard(s,'barrel',{x:[100,195,290][Math.floor(t/2)%3],y:151,warn:.9,life:3.2,r:16});}
  for(const h of s.hazards){h.age+=dt;if(h.type==='barrel'&&h.age>h.warn)h.y+=145*dt;if(h.age>=h.warn&&h.age<h.life&&distance(p,h)<h.r+10&&!h.hit)h.hit=this.hurt(h.type);}
  s.hazards=s.hazards.filter(h=>h.age<h.life&&h.y<470);
  if(i===8&&p.y>190&&p.y<398&&t%3.6>1.65){const x=195+Math.sin(t*.92)*116;if(Math.abs(p.x-x)<21)this.hurt('순찰등',1.2);}
 }
 update(dt,input={x:0,y:0}){let left=Math.max(0,Number(dt)||0);while(left>1e-7&&!this.ended){const step=Math.min(1/90,left);this.step(step,input);left-=step;}}
 step(dt,input){this.elapsed=Math.min(LITERATURE.duration,this.elapsed+dt);this.stunLeft=Math.max(0,this.stunLeft-dt);this.invincibleLeft=Math.max(0,this.invincibleLeft-dt);this.actionWait=Math.max(0,this.actionWait-dt);this.actionAge+=dt;this.transitionLeft=Math.max(0,this.transitionLeft-dt);this.player.hammerAge=99;for(const e of this.effects)e.age+=dt;this.effects=this.effects.filter(e=>e.age<1);const beforeRoom=this.room;
  if(this.scene.recoil){const r=this.scene.recoil;r.age+=dt;const u=clamp(r.age/.35,0,1),e=u*u*(3-2*u);this.player.x=approach(r.from.x,r.to.x,e);this.player.y=roomBase(4)+approach(r.from.y,r.to.y,e);this.player.moving=false;if(u===1)this.scene.recoil=null;}
  else if(this.motion){const m=this.motion;m.age+=dt;const p=clamp(m.age/.62,0,1),ease=p*p*(3-2*p);this.player.x=approach(m.from.x,m.to.x,ease);this.player.y=approach(m.from.y,m.to.y,ease);this.player.moving=false;if(p===1){this.motion=null;this.scenes[4].mounted=false;this.solve(4,{x:195,y:225});}}
  else if(this.queuedMove){this.movePlayer(dt,this.queuedMove.input);this.queuedMove.time-=dt;if(this.queuedMove.time<=0)this.queuedMove=null;}else this.movePlayer(dt,input);
  if(!this.canMove)this.player.moving=false;const s=this.scene;s.time+=dt;s.reelCooldown=Math.max(0,s.reelCooldown-dt);s.pullAge+=dt;s.noticeLeft=Math.max(0,s.noticeLeft-dt);if(s.solved)s.solvedAge+=dt;
  if(this.room===2&&!s.solved){if(distance(this.local,{x:195,y:282})<68&&!s.hooked){s.fishBite+=dt;if(s.fishBite>=FISHING.biteSeconds){s.hooked=true;s.pullAge=0;this.onEvent({type:'literatureSuccess'});}}if(s.hooked&&s.time-s.lastTap>FISHING.graceSeconds)s.reelGauge=Math.max(0,s.reelGauge-FISHING.decayPerSecond*dt);}
  if(this.room===3&&s.sewing&&s.sewApproach>=.35&&!s.solved){if(Math.abs(s.needle-seamX(s.sewTime))<=SEWING.tolerance){s.sewTime+=dt;if(s.sewTime>=SEWING.seconds){s.sewing=false;this.player.y=roomBase(3)+SEWING.point.y;this.solve(3,{x:265,y:255});}}this.player.moving=false;this.actionAge=s.sewTime%.36;}
  if(this.room===4&&s.mounted)s.boardAge+=dt;
if(this.room===1&&s.build){s.build.age+=dt;if(s.build.age>=s.build.duration){s.built++;s.build=s.built<s.flags.size?{age:0,duration:1.6}:null;if(s.built===2)this.solve(1,{x:120,y:375});}}this.updateHazards(s,dt,input);if((this.room===5||this.room===6)&&s.job){const valve=this.room===5,p=valve?valveWorkPoint(s.job.k):ropeWorkPoint(s.job.k),required=valve?VALVE_SECONDS:1.6;
   if(distance(this.local,p)>(valve?30:27)||!this.canMove||Math.hypot(input.x||0,input.y||0)>.1)s.job=null;
   else{if(s.job.approach<.2){s.job.approach+=dt;const u=Math.min(1,s.job.approach/.2);this.player.x=approach(s.job.from.x,p.x,u);this.player.y=roomBase(this.room)+approach(s.job.from.y,p.y,u);this.player.dir=valve?'up':'left';}else s.job.age+=dt;
    this.actionAge=s.job.age%.38;if(s.job.age>=required){s.flags.add(s.job.k);if(valve){s.valves[s.job.k]=1;s.retiringArms[s.job.k]={started:s.time,pose:tentaclePose(s.armTime[s.job.k],s.job.k)};}else s.unboundAt[s.job.k]=s.time;s.progress=s.flags.size;s.job=null;this.onEvent({type:'literatureSuccess'});if(!valve&&s.progress===3)this.solve(6,{x:180,y:214});}}
  }
  if(beforeRoom!==this.room){this.actionWait=0;this.visited.add(this.room);this.lastInput={x:0,y:-1};this.onEvent({type:'literatureRoom',room:this.room});}
  for(const room of this.scenes)if(room.card&&!hasSource(this,room.card.id)&&this.stunLeft<=0&&distance(this.player,room.card)<25){const earned=awardClue(this,room.card.id);this.effects.push({type:'card',...room.card,id:earned,age:0});this.onEvent({type:'card',...room.card,id:earned});}
  if(this.banked.size===BOOKS.length){this.finish(true,'complete');return;}
  if(this.canMove&&this.room>0&&this.transitionLeft<=0&&distance(this.local,BACK_PORTAL)<21){const previous=this.room-1;this.scene.sewing=false;this.scene.job=null;this.scene.lockWork=null;const landing=this.landing(previous,RETURN_POINTS[previous]);this.player.x=landing.x;this.player.y=roomBase(previous)+landing.y;this.player.dir='down';this.actionWait=0;this.queuedMove=null;this.transitionLeft=.7;this.onEvent({type:'literatureRoom',room:previous});}
  if(this.canMove&&this.room<8&&this.transitionLeft<=0&&distance(this.local,EXITS[this.room])<21){const i=this.room;const landing=ENTRY_POINTS[i+1];this.player.x=landing.x;this.player.y=roomBase(i+1)+landing.y;this.player.dir='up';this.actionWait=0;this.queuedMove=null;this.transitionLeft=.65;this.visited.add(i+1);this.onEvent({type:'literatureRoom',room:i+1});}
  this.camera.y=approach(this.camera.y,roomBase(this.room),dt*11);if(Math.abs(this.camera.y-roomBase(this.room))<.1)this.camera.y=roomBase(this.room);
  if(this.elapsed>=LITERATURE.duration-1e-7){this.elapsed=LITERATURE.duration;this.finish(true);}
 }
 landing(i,point,scene=this.scenes[i]){return nearestWalkable(i,point,7,roomSolids(i,scene),p=>distance(p,BACK_PORTAL)>29&&(i===8||distance(p,EXITS[i])>29));}
 finish(survived=true,reason='timeout'){if(this.endEmitted)return;this.ended=true;this.phase='complete';this.player.moving=false;this.endEmitted=true;this.onEvent({type:'end',survived,elapsed:this.elapsed,found:[...this.found],reason});}
}
