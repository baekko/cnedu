import {movedDuringStep} from './walk-cycle.js';
import {awardClue} from './clue-order.js';
import {DETECTIVE_DOORS,atDetectiveDoor} from './detective-door-layout.js';
export const DETECTIVE=Object.freeze({duration:110,speed:142,chaseSpeed:166,noticeSeconds:.48,contact:17,hearing:72,flashes:3,decoySeconds:4.8,answer:'타자기',hints:['종이에 글자를 찍어 원고를 만드는 오래된 기계예요.','건반을 누르면 활자가 종이 위에 글자를 남겨요.']});
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),TAU=Math.PI*2;
export const ROOM_SPECS=Object.freeze([
 {id:'study',name:'첫 번째 방 · 서재',covers:[{id:0,x:105,y:275,w:96,h:43,art:0},{id:1,x:279,y:320,w:84,h:36,art:2},{id:2,x:274,y:188,w:94,h:38,art:1}],evidence:[{x:105,y:315,name:'책상 위 서류',type:'paper',seconds:2,cover:0},{x:279,y:354,name:'잠긴 서랍',type:'drawer',seconds:3.2,noise:true,cover:1},{x:72,y:168,name:'벽에 남은 흔적',type:'painting',seconds:2.3}],guards:[{route:[[332,178],[195,178],[195,367],[333,367]],speed:54,range:160,wait:.6}]},
 {id:'gallery',name:'두 번째 방 · 응접실',covers:[{id:0,x:110,y:325,w:108,h:42,art:1},{id:1,x:282,y:224,w:78,h:42,art:0},{id:2,x:91,y:181,w:70,h:35,art:2}],evidence:[{x:110,y:365,name:'소파 아래 쪽지',type:'paper',seconds:2.2,cover:0},{x:282,y:263,name:'작은 보관함',type:'drawer',seconds:3.2,noise:true,cover:1},{x:91,y:216,name:'찬장 속 사진',type:'painting',seconds:2.3,cover:2}],guards:[{route:[[330,385],[40,385],[40,146],[327,146]],speed:57,range:166,wait:.6},{route:[[225,276],[350,276],[350,390],[225,390]],speed:46,range:145,wait:.8}]},
 {id:'archive',name:'마지막 방 · 문서보관실',covers:[{id:0,x:111,y:224,w:84,h:42,art:2},{id:1,x:281,y:319,w:83,h:40,art:3},{id:2,x:143,y:367,w:94,h:40,art:0}],evidence:[{x:143,y:406,name:'사라진 원고 목록',type:'paper',seconds:2.2,cover:2},{x:281,y:359,name:'금고의 봉투',type:'drawer',seconds:4,noise:true,cover:1},{x:111,y:264,name:'문서철의 기록',type:'paper',seconds:2,cover:0}],guards:[{route:[[330,170],[57,170],[57,313],[197,313],[197,170]],speed:56,range:158,wait:.7},{route:[[331,402],[225,402],[225,274],[331,274]],speed:49,range:146,wait:.8}]}
]);
export const coverRect=o=>({left:o.x-o.w/2,right:o.x+o.w/2,top:o.y-o.h/2,bottom:o.y+o.h/2});
export function lineHitsRect(a,b,r,pad=0){
 const dx=b.x-a.x,dy=b.y-a.y,p=[-dx,dx,-dy,dy],q=[a.x-r.left+pad,r.right+pad-a.x,a.y-r.top+pad,r.bottom+pad-a.y];let lo=0,hi=1;
 for(let i=0;i<4;i++){if(Math.abs(p[i])<1e-9){if(q[i]<0)return false;}else{const t=q[i]/p[i];if(p[i]<0)lo=Math.max(lo,t);else hi=Math.min(hi,t);if(lo>hi)return false;}}return true;
}
const angleDiff=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
export function canSee(guard,player,covers){
 const dx=player.x-guard.x,dy=player.y-guard.y,d=Math.hypot(dx,dy);if(d>guard.range||Math.abs(angleDiff(Math.atan2(dy,dx),guard.angle))>.77)return false;
 return !covers.some(o=>lineHitsRect(guard,player,coverRect(o),1));
}
export function visionEnd(guard,angle,covers){let end={x:guard.x+Math.cos(angle)*guard.range,y:guard.y+Math.sin(angle)*guard.range};for(let d=5;d<=guard.range;d+=4){const p={x:guard.x+Math.cos(angle)*d,y:guard.y+Math.sin(angle)*d};if(p.x<20||p.x>370||p.y<125||p.y>450||covers.some(o=>{const r=coverRect(o);return p.x>r.left&&p.x<r.right&&p.y>r.top&&p.y<r.bottom;})){end=p;break;}}return end;}
export function walkable(room,x,y,r=8){return x>=24&&x<=366&&y>=132&&y<=440&&!room.covers.some(o=>{const b=coverRect(o);return x>b.left-r&&x<b.right+r&&y>b.top-r&&y<b.bottom+r;});}
// Small navigation grid is used only when a sound interrupts a patrol.
export function soundPath(room,from,to){
 const step=18,cols=20,rows=18,point=(x,y)=>({x:24+x*step,y:134+y*step}),key=(x,y)=>y*cols+x;
 const nearest=p=>{let best=null,dist=Infinity;for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const q=point(x,y),d=Math.hypot(q.x-p.x,q.y-p.y);if(d<dist&&walkable(room,q.x,q.y,9)){best={x,y};dist=d;}}return best;};
 const a=nearest(from),b=nearest(to);if(!a||!b)return[];const start=key(a.x,a.y),goal=key(b.x,b.y),queue=[start],prev=new Map([[start,null]]);
 for(let n=0;n<queue.length&&!prev.has(goal);n++){const v=queue[n],x=v%cols,y=Math.floor(v/cols);for(const [dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const xx=x+dx,yy=y+dy,k=key(xx,yy);if(xx<0||xx>=cols||yy<0||yy>=rows||prev.has(k))continue;const q=point(xx,yy);if(!walkable(room,q.x,q.y,9))continue;prev.set(k,v);queue.push(k);}}
 if(!prev.has(goal))return[];const path=[];for(let v=goal;v!==start;v=prev.get(v))path.push(point(v%cols,Math.floor(v/cols)));return path.reverse();
}
export class DetectiveGame{
 constructor({onEvent=()=>{}}={}){
  this.onEvent=onEvent;this.elapsed=0;this.ended=false;this.phase='investigate';this.roomIndex=0;this.health=3;this.flashes=DETECTIVE.flashes;this.banked=new Set();this.found=new Set();this.clueSources=new Set();this.effects=[];this.caught=0;this.hidden=false;this.hideCover=null;this.job=null;this.holding=false;this.noise=null;this.decoy=null;this.immunity=1.5;this.transitionLeft=0;this.note='';this.noteLeft=0;this.inspectCount=0;this.hideCount=0;this.pursuitCount=0;this.footClock=0;this.hideEscapes=0;
  this.rooms=ROOM_SPECS.map((r,j)=>({...r,covers:r.covers.map(o=>({...o})),evidence:r.evidence.map((e,i)=>({...e,id:j*3+i,collected:false,progress:0})),guards:[]}));this.player={x:195,y:432,dir:'up',moving:false,walk:0,hammerAge:99};this.enterRoom(0);
 }
 get room(){return this.rooms[this.roomIndex];}get remaining(){return Math.max(0,DETECTIVE.duration-this.elapsed);}get canMove(){return !this.ended&&this.transitionLeft<=0;}
 get pursued(){return this.room.guards.some(g=>g.mode==='chase'||g.mode==='search');}
 get watched(){return !this.hidden&&this.immunity<=0&&this.room.guards.some(g=>canSee(g,this.player,this.room.covers));}
 get roomCollected(){return this.room.evidence.filter(e=>e.collected).length;}get suspicion(){return Math.max(0,...this.room.guards.map(g=>g.mode==='chase'?1:g.alert));}
 get target(){return this.room.evidence.filter(e=>!e.collected&&Math.hypot(e.x-this.player.x,e.y-this.player.y)<31).sort((a,b)=>Math.hypot(a.x-this.player.x,a.y-this.player.y)-Math.hypot(b.x-this.player.x,b.y-this.player.y))[0]||null;}
 get nearbyCover(){return this.room.covers.find(o=>{const r=coverRect(o),p=this.player;return Math.hypot(Math.max(r.left-p.x,0,p.x-r.right),Math.max(r.top-p.y,0,p.y-r.bottom))<30;})||null;}
 get exit(){return DETECTIVE_DOORS[this.roomIndex];}
 get atDoor(){return atDetectiveDoor(this.player,this.exit);}
 get canExit(){return this.roomCollected===3;}
 get canAct(){return this.canMove&&!this.hidden&&!!this.target;}
 get canHide(){return this.canMove&&(this.hidden||!!this.nearbyCover&&!this.watched);}
 get canDecoy(){return this.canMove&&this.flashes>0&&!this.decoy;}
 get actionLabel(){return '조사';}
 get prompt(){
  if(this.hidden)return this.pursued?'숨어서 수색이 끝나길 기다려요 · 조사 진행은 유지돼요':'숨는 중 · 경비원이 지나가면 다시 조사해요';if(this.pursued)return this.watched?'추격 중! 가구를 돌아 시선을 끊으세요':'시선이 끊겼어요! 가까운 가구에 숨어 수색을 피하세요';if(this.noteLeft>0)return this.note;if(this.job)return this.job.evidence.noise?'조사 소리! 경비원이 오면 멈추고 숨으세요':'조사 버튼을 계속 누르세요 · 발소리도 들킬 수 있어요';
  if(this.atDoor&&!this.canExit)return '이 방의 증거를 먼저 모아요 · '+this.roomCollected+' / 3';
  if(this.target)return this.target.name+' · 조사 버튼을 누르고 있어요'+(this.target.noise?' · 소음 주의':'')+(this.target.progress>0?' · 이어서 조사':'');
  if(this.canExit)return this.roomIndex<this.rooms.length-1?'증거 3개 확보! 오른쪽 위 문으로 가요':'모든 증거를 모았어요! 오른쪽 위 문으로 나가요';if(this.nearbyCover)return this.watched?'경비원이 보고 있어요 · 먼저 시선을 끊으세요':'가구 뒤에서 숨을 수 있어요 · 조사 진행은 유지돼요';return '금빛 시야를 피해 종이 표식이 있는 물건을 조사해요';
 }
 say(s,t=2){this.note=s;this.noteLeft=t;}
 enterRoom(index){
  this.roomIndex=index;this.hidden=false;this.hideCover=null;this.job=null;this.holding=false;this.noise=this.decoy=null;this.immunity=1.6;this.footClock=0;
  Object.assign(this.player,{x:195,y:432,dir:'up',moving:false});
  this.room.guards=ROOM_SPECS[index].guards.map((s,i)=>({...s,route:s.route.map(([x,y])=>({x,y})),x:s.route[0][0],y:s.route[0][1],next:1,angle:Math.atan2(s.route[1][1]-s.route[0][1],s.route[1][0]-s.route[0][0]),waitLeft:.8+i*.6,alert:0,mode:'patrol',path:[],lookLeft:0,walk:0,moving:false,dir:'left',priority:0,repath:0,lost:0,lastSeen:null,sees:false,baseAngle:0,id:i}));
  for(const g of this.room.guards)g.path=soundPath(this.room,g,g.route[g.next]);
  this.say(this.room.name+' · 원하는 단서를 조사하세요',2.5);
 }
 beginAction(){
  if(!this.canAct)return false;
  const e=this.target;if(!e)return false;this.holding=true;if(!this.job||this.job.evidence!==e){this.job={evidence:e,age:e.progress||0,noiseWait:1.05};if(e.noise)this.makeNoise(e.x,e.y,2.3,{kind:'investigate',priority:2,radius:235});this.onEvent({type:'detectiveSearch'});}return true;
 }
 releaseAction(){this.holding=false;this.job=null;}
 act(){return this.beginAction();}
 hide(){if(!this.canHide)return false;this.releaseAction();if(this.hidden){this.hidden=false;this.hideCover=null;return true;}this.hidden=true;this.hideCover=this.nearbyCover?.id;if(this.pursued)this.hideEscapes++;this.player.moving=false;this.hideCount++;this.say('가구 뒤에 숨었어요 · 시야가 지나가면 이동하세요',1.6);return true;}
 flash(){
  if(!this.canDecoy)return false;this.flashes--;const dir={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[this.player.dir],start={x:this.player.x,y:this.player.y};let dest={x:clamp(start.x+dir[0]*158,30,360),y:clamp(start.y+dir[1]*158,138,432)};
  if(!walkable(this.room,dest.x,dest.y,5)){const path=soundPath(this.room,start,dest);dest=path.at(-1)||{x:start.x,y:start.y-45};}
  this.decoy={from:start,to:dest,age:0,landed:false};this.say('태엽쥐가 소리를 내요 · 경비원이 돌아보면 이동하세요',2.2);this.onEvent({type:'detectiveDecoy'});return true;
 }
 makeNoise(x,y,seconds=DETECTIVE.decoySeconds,{kind='decoy',priority=3,radius=330}={}){
  if(!this.noise||this.noise.left<=0||priority>=(this.noise.priority||0))this.noise={x,y,age:0,left:seconds,kind,priority};let heard=0;
  for(const g of this.room.guards){
   const distracted=priority===3&&!g.sees;if((g.mode==='chase'||g.mode==='search')&&!distracted||g.priority>priority&&!distracted||Math.hypot(g.x-x,g.y-y)>radius)continue;if(distracted){g.alert=Math.min(g.alert,.25);g.lost=0;}
   const fresh=g.mode!=='sound'||Math.hypot((g.soundAt?.x??-999)-x,(g.soundAt?.y??-999)-y)>22;
   g.mode='sound';g.priority=priority;g.soundAt={x,y};g.path=soundPath(this.room,g,{x,y});g.lookLeft=seconds;if(fresh)g.waitLeft=.28;heard++;
  }return heard;
 }
 startChase(g){
  if(g.mode!=='chase'){this.pursuitCount++;this.onEvent({type:'detectiveChase'});this.say('발견! 가구를 돌아 시선을 끊고 숨으세요',1.5);}
  g.mode='chase';g.alert=1;g.priority=4;g.waitLeft=0;g.repath=0;g.lost=0;g.lastSeen={x:this.player.x,y:this.player.y};
 }
 move(dt,input){
  const p=this.player;p.moving=false;if(!this.canMove)return;let dx=Number(input.x)||0,dy=Number(input.y)||0,n=Math.hypot(dx,dy);if(!n)return;if(this.hidden){this.hidden=false;this.hideCover=null;}this.releaseAction();dx/=n;dy/=n;const ox=p.x,oy=p.y,nx=p.x+dx*DETECTIVE.speed*dt,ny=p.y+dy*DETECTIVE.speed*dt;if(walkable(this.room,nx,p.y))p.x=nx;if(walkable(this.room,p.x,ny))p.y=ny;p.moving=movedDuringStep(p.x-ox,p.y-oy,dt);p.dir=Math.abs(dx)>Math.abs(dy)?dx<0?'left':'right':dy<0?'up':'down';if(p.moving)p.walk+=dt;
 }
 movePlayer(dt,input){this.move(dt,input);}
 updateGuard(g,dt){
  g.moving=false;g.sees=!this.hidden&&this.immunity<=0&&canSee(g,this.player,this.room.covers);
  if(g.sees){g.lastSeen={x:this.player.x,y:this.player.y};g.lost=0;if(g.mode!=='chase'){g.alert=clamp(g.alert+dt/DETECTIVE.noticeSeconds,0,1);if(g.alert>=1)this.startChase(g);}}
  else if(g.mode==='chase'){g.lost+=dt;if(g.lost>=2.2){g.mode='search';g.path=soundPath(this.room,g,g.lastSeen);g.lookLeft=1.5;g.priority=4;}}
  else if(g.mode!=='search')g.alert=Math.max(0,g.alert-dt*.95);
  if(g.mode==='chase'){
   g.repath-=dt;if(g.repath<=0){g.path=soundPath(this.room,g,g.lastSeen);g.repath=.3;}
  }
  if(g.waitLeft>0){g.waitLeft=Math.max(0,g.waitLeft-dt);return;}
  let target;
  if(g.mode==='chase')target=g.path[0]||g.lastSeen;
  else if(g.mode==='sound'||g.mode==='search'){
   if(g.path.length)target=g.path[0];
   else{g.lookLeft-=dt;g.angle+=Math.sin(this.elapsed*3+g.id)*dt*.9;g.alert=Math.max(0,g.alert-dt*.35);if(g.lookLeft<=0){g.mode='patrol';g.priority=0;g.path=soundPath(this.room,g,g.route[g.next]);}return;}
  }else target=g.path[0]||g.route[g.next];
  if(!target)return;
  const dx=target.x-g.x,dy=target.y-g.y,d=Math.hypot(dx,dy),wanted=Math.atan2(dy,dx);
  g.angle+=clamp(angleDiff(wanted,g.angle),-dt*(g.mode==='chase'?6:3.7),dt*(g.mode==='chase'?6:3.7));
  if(d<2){if(g.path.length)g.path.shift();else if(g.mode==='patrol'){g.next=(g.next+1)%g.route.length;g.path=soundPath(this.room,g,g.route[g.next]);g.waitLeft=g.wait;}return;}
  const speed=g.mode==='chase'?DETECTIVE.chaseSpeed:g.mode==='sound'||g.mode==='search'?73:g.speed,step=Math.min(d,speed*dt),ox=g.x,oy=g.y,nx=g.x+dx/d*step,ny=g.y+dy/d*step;
  if(walkable(this.room,nx,g.y,6))g.x=nx;if(walkable(this.room,g.x,ny,6))g.y=ny;
  g.moving=movedDuringStep(g.x-ox,g.y-oy,dt);if(g.moving)g.walk+=dt*Math.min(speed/54,1.6);g.dir=Math.abs(dx)>Math.abs(dy)?dx<0?'left':'right':dy<0?'up':'down';
 }

 catchPlayer(){
  this.caught++;this.health--;this.hidden=false;this.hideCover=null;this.releaseAction();this.immunity=2;Object.assign(this.player,{x:195,y:432,moving:false,dir:'up'});for(const g of this.room.guards){g.alert=0;g.mode='patrol';g.priority=0;g.path=soundPath(this.room,g,g.route[g.next]);g.waitLeft=1;g.sees=false;}this.elapsed=Math.min(DETECTIVE.duration,this.elapsed+3);this.effects.push({type:'caught',age:0});this.say('붙잡혔어요! 입구에서 다시 이동하세요 · 기회 '+this.health+'번',2.5);this.onEvent({type:'detectiveCaught'});if(this.health<=0)this.finish(false,'caught');
 }
 update(dt,input={}){if(this.ended||!Number.isFinite(dt)||dt<=0)return;let left=Math.min(dt,DETECTIVE.duration);while(left>1e-8&&!this.ended){const step=Math.min(left,1/60,this.remaining);if(step<=1e-8){this.elapsed=DETECTIVE.duration;this.finish(true,'timeout');break;}this.step(step,input);left-=step;}}
 step(dt,input){
  this.elapsed=Math.min(DETECTIVE.duration,this.elapsed+dt);this.immunity=Math.max(0,this.immunity-dt);this.noteLeft=Math.max(0,this.noteLeft-dt);this.transitionLeft=Math.max(0,this.transitionLeft-dt);this.move(dt,input);
  if(this.canMove&&!this.hidden&&this.atDoor&&this.canExit){
   if(this.roomIndex<this.rooms.length-1){this.enterRoom(this.roomIndex+1);this.transitionLeft=.65;this.onEvent({type:'detectiveRoom',room:this.roomIndex});}
   else this.finish(true,'exit');
   return;
  }
  if(this.decoy){this.decoy.age+=dt;if(!this.decoy.landed&&this.decoy.age>=.35){this.decoy.landed=true;this.makeNoise(this.decoy.to.x,this.decoy.to.y);}if(this.decoy.age>=5-1e-8)this.decoy=null;}
  if(this.noise){this.noise.age+=dt;this.noise.left-=dt;if(this.noise.left<=0)this.noise=null;}
  if(this.player.moving&&this.immunity<=0){this.footClock-=dt;if(this.footClock<=0){this.footClock=.6;const heard=this.makeNoise(this.player.x,this.player.y,1.3,{kind:'footstep',priority:1,radius:DETECTIVE.hearing});if(heard)this.effects.push({type:'footstep',x:this.player.x,y:this.player.y,age:0});}}
  for(const g of this.room.guards){if(this.transitionLeft<=0)this.updateGuard(g,dt);if(!this.hidden&&this.immunity<=0&&Math.hypot(g.x-this.player.x,g.y-this.player.y)<DETECTIVE.contact){this.catchPlayer();break;}}
  if(this.ended)return;
  if(this.job&&this.holding){const j=this.job;if(this.hidden||Math.hypot(j.evidence.x-this.player.x,j.evidence.y-this.player.y)>32)this.releaseAction();else{j.age+=dt;j.evidence.progress=j.age;j.noiseWait-=dt;if(j.evidence.noise&&j.noiseWait<=0){this.makeNoise(j.evidence.x,j.evidence.y,2.3,{kind:'investigate',priority:2,radius:235});j.noiseWait=1.05;}if(j.age+1e-8>=j.evidence.seconds){const e=j.evidence;e.collected=true;this.inspectCount++;this.releaseAction();const id=awardClue(this,e.id,e.id+1);this.effects.push({type:'card',id,x:e.x,y:e.y,age:0});this.onEvent({type:'card',id,x:e.x,y:e.y+170});this.say('증거 확보! 이 방 '+this.roomCollected+'/3',1.6);}}}
  for(const e of this.effects)e.age+=dt;this.effects=this.effects.filter(e=>e.age<1.3);if(this.remaining<=1e-8){this.elapsed=DETECTIVE.duration;this.finish(true,'timeout');}
 }
 finish(survived,reason='complete'){if(this.ended)return;this.ended=true;this.failureReason=reason;this.player.moving=false;this.releaseAction();this.onEvent({type:'end',survived,elapsed:this.elapsed,found:[...this.banked]});}
}
