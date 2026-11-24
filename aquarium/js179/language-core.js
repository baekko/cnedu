import {LANGUAGE_THROW,languageThrowPoint} from './language-throw.js';
import {FLAT_WALK_SPEED,movedDuringStep} from './walk-cycle.js';
import {SIDE_HERO_SIZE} from './hero-scale.js';
import {awardClue,hasSource} from './clue-order.js';
import {damage,collectRecovery,tickVitality} from './vitality.js';
// Nine linked word-powered obstacles in one continuous side-view route.
export const LANGUAGE=Object.freeze({duration:90,width:5150,floor:440,speed:FLAT_WALK_SPEED,airSpeed:180,jump:335,gravity:850,answer:'얼룩말',hints:['아프리카에 사는 초식동물입니다.','몸에 검은색과 흰색 줄무늬가 있습니다.']});
export const LAB_LADDER=Object.freeze({center:100,left:87,right:111,platform:82,card:280,top:245});
export const LAB_EXIT=Object.freeze({x:LANGUAGE.width-95,openDistance:125,enterDistance:32,openTime:.55,walkTime:1.2});
export const LAB_ROOMS=Object.freeze(['문자 자료실','소리와 문장 실험실','언어 기록 보관실']);
export const EXPERIMENTS=Object.freeze([
 ['다리','bridge','물 위를 건너요','나'],['계단','steps','높은 길로 올라가요','문'],['사다리','ladder','위층으로 올라가요','마'],
 ['밀다','push','큰 상자를 밀어요','끌'],['돌다','turn','다리를 돌려요','날'],['열다','open','문을 열어요','닫'],
 ['작다','small','좁은 길을 통과해요','크'],['가볍다','float','승강기가 떠올라요','무'],['밝다','light','어두운 길을 밝혀요','맑']
].map(([word,kind,prompt,decoy],i)=>Object.freeze({id:i+1,word,kind,prompt,decoy,room:Math.floor(i/3),x:220+i*540})));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export class LanguageGame{
 constructor({onEvent=()=>{},character='haru',characterId=character}={}){
  this.onEvent=onEvent;this.characterId=characterId;this.pendingThrow=null;this.elapsed=0;this.ended=false;this.phase='explore';this.flashes=3;this.health=3;this.banked=new Set();this.clueSources=new Set();this.found=new Set();this.effects=[];this.shots=[];this.camera={x:0,y:0};this.stunLeft=0;this.invincibleLeft=0;this.actionWait=0;this.notice='';this.noticeLeft=0;this.held=null;this.queuedMove=null;this.reachedExit=false;this.hits=0;
  this.player={x:45,y:440,vy:0,dir:'right',moving:false,walk:0,onGround:true,climbing:false,climbDistance:0,throwAge:99,support:'floor-0',small:false};this.exit={open:0,age:0,from:null};
  this.stations=EXPERIMENTS.map(s=>({...s,inserted:[],solved:false,solvedAge:0,errorLeft:0,cardTaken:false,used:false,push:0,sink:0,lift:0}));
  this.blocks=this.stations.flatMap(s=>[...s.word,s.decoy].map((char,i)=>{const order=s.word.length===3?[1,3,0,2]:[1,0,2],homeX=s.x-133+order[i]*31;return{id:`${s.id}-${i}`,station:s.id,char,homeX,homeY:420,x:homeX,y:420,phase:'rest',age:0,offset:i*.9,motion:s.room===2?4:0};}));
  this.bots=[2,3,5,6].map(i=>({station:i+1,x:this.stations[i].x+([2,5].includes(i)?70:-100),y:440,home:this.stations[i].x+([2,5].includes(i)?65:-90),range:[2,5].includes(i)?38:52,speed:.8,offset:i*1.1}));
 }
 get room(){return clamp(Math.floor(this.player.x/1620),0,2);}
 get canMove(){return !this.ended&&this.phase==='explore'&&this.stunLeft<=0;}
 get actionLabel(){return this.held?'던짐':'집기';}
 get prompt(){if(this.phase==='exiting'||this.ended)return '';if(this.noticeLeft>0)return this.notice;if(this.held)return this.nearestStation(85,true)?'판을 향해 던져요':'글자를 들고 실험판 가까이 가요';if(this.blockNear())return '집기 → 실험판 가까이에서 던지기';const s=this.nearestStation(340);if(s?.solved&&!hasSource(this,s.id)){if(s.kind==='ladder')return '사다리에서 ↑를 눌러 올라가요';if(s.kind==='steps')return '계단을 차례로 올라가요';if(s.kind==='push')return '상자를 향해 →를 눌러 밀어요';if(s.kind==='float')return '승강기 위에 올라서요';return '열린 길을 지나 단서를 찾아요';}return this.player.x>4900?'열린 출구 가까이 가면 나갈 수 있어요':'그림을 보고 알맞은 낱말을 만들어요';}
 nearestStation(range=260,unsolved=false){return this.stations.filter(s=>(!unsolved||!s.solved)&&Math.abs(s.x-this.player.x)<=range).sort((a,b)=>Math.abs(a.x-this.player.x)-Math.abs(b.x-this.player.x))[0]||null;}
 blockNear(){const p=this.player;return this.blocks.filter(b=>b.phase==='rest'&&distance({x:p.x,y:p.y-20},b)<35).sort((a,b)=>distance({x:p.x,y:p.y-20},a)-distance({x:p.x,y:p.y-20},b))[0]||null;}
 magnetTarget(){const s=this.nearestStation(240,true);return s&&this.blocks.find(b=>b.station===s.id&&b.char===[...s.word][s.inserted.length]&&b.phase==='rest');}
 get canMagnet(){return this.canMove&&!this.held&&this.actionWait<=0&&this.flashes>0&&!!this.magnetTarget();}
 ready(s){return s.solved&&s.solvedAge>=(s.kind==='turn'?1.2:.8);}
 say(text,seconds=1.8){this.notice=text;this.noticeLeft=seconds;}
 queueMove(dir){this.queuedMove={...dir,left:.075};}
 jump(){const p=this.player;if(!this.canMove||(!p.onGround&&!p.climbing))return false;p.climbing=false;p.onGround=false;p.support=null;p.vy=-LANGUAGE.jump;this.onEvent({type:'languageJump'});return true;}
 act(){if(!this.canMove||this.actionWait>0||this.player.climbing)return false;const p=this.player;
  if(!this.held){const b=this.blockNear();if(!b){this.say('글자 가까이에서 집기를 눌러요');return false;}b.phase='held';this.held=b;p.throwAge=99;this.actionWait=.16;this.onEvent({type:'pickup'});return true;}
  const b=this.held,s=this.nearestStation(85,true),face=s?Math.sign(s.x-p.x)||1:p.dir==='left'?-1:1;p.throwAge=0;p.throwFace=face;this.actionWait=.43;p.dir=face<0?'left':'right';b.phase='throw-ready';this.pendingThrow={block:b,station:s?.id||null,to:s?{x:s.x,y:292}:{x:p.x+face*76,y:420}};return true;
 }
 flash(){if(!this.canMagnet)return false;const b=this.magnetTarget();this.flashes--;b.phase='magnet';this.held=b;this.player.throwAge=99;this.actionWait=.4;this.effects.push({type:'magnet',x:b.x,y:b.y,age:0});this.onEvent({type:'magnet'});return true;}
 landShot(shot){const b=shot.block,s=this.stations.find(s=>s.id===shot.station);if(s&&!s.solved&&b.char===[...s.word][s.inserted.length]){s.inserted.push(b.char);b.phase=b.station===s.id?'used':'rest';this.effects.push({type:'spark',x:s.x,y:292,age:0});this.onEvent({type:'languageCorrect'});if(s.inserted.length===[...s.word].length){s.solved=true;s.solvedAge=0;this.onEvent({type:'languageSolved'});}}else{b.phase='bounce';b.age=0;b.x=shot.to.x;b.y=shot.to.y;b.bounceFrom={...shot.to};if(s){s.errorLeft=.7;this.say('순서가 달라요. 그림을 다시 살펴봐요');this.onEvent({type:'misfit'});}}}
 hurt(){if(!this.canMove)return false;return damage(this,'languageHit');}
 recoverFall(){const p=this.player,s=[...this.stations].reverse().find(s=>p.x>=s.x+60)||this.stations[0];this.hurt();if(this.ended)return;Object.assign(p,{x:s.x+40,y:440,vy:0,onGround:true,climbing:false,support:null,small:false});if(s.kind==='float')s.lift=0;}
 gaps(){return this.stations.flatMap(s=>{const x=s.x;if(['bridge','turn'].includes(s.kind))return [[x+90,x+330]];if(s.kind==='ladder')return [[x+120,x+330]];if(s.kind==='push')return [[x+250,x+330]];if(s.kind==='float')return [[x+110,x+330]];if(s.kind==='light')return [[x+100,x+150],[x+205,x+255]];return [];});}
 crate(s){return {id:s.id+'crate',x:s.x+110+s.push*140,y:280+s.sink*160,w:80,h:160};}
 solids(){return this.stations.flatMap(s=>{const x=s.x,r=this.ready(s);if(s.kind==='steps')return [{id:s.id+'ledge',x:x+210,y:280,w:120,h:160},...(r?[0,1,2].map(i=>({id:s.id+'step'+i,x:x+90+i*40,y:400-i*40,w:40,h:40+i*40})):[])];if(s.kind==='push')return [this.crate(s)];if(s.kind==='open'&&!r)return [{id:s.id+'door',x:x+180,y:0,w:38,h:440}];if(s.kind==='small')return [{id:s.id+'roof',x:x+90,y:90,w:240,h:322}];if(s.kind==='float')return [{id:s.id+'ledge',x:x+230,y:270,w:100,h:170}];if(s.kind==='light'&&!r)return [{id:s.id+'shutter',x:x+80,y:0,w:16,h:440}];return [];});}
 platforms(){let from=0,floors=[];for(const [a,b] of this.gaps()){floors.push({id:'floor-'+floors.length,x:from,y:440,w:a-from});from=b;}floors.push({id:'floor-'+floors.length,x:from,y:440,w:LANGUAGE.width-from});
  for(const s of this.stations){const x=s.x;if(['bridge','turn'].includes(s.kind)&&this.ready(s))floors.push({id:s.id+'bridge',x:x+90,y:440,w:240});if(s.kind==='ladder')floors.push({id:s.id+'catwalk',x:x+82,y:245,w:248});if(s.kind==='float')floors.push({id:s.id+'lift',x:x+110,y:440-s.lift*170,w:120});}
  return floors.concat(this.solids().map(r=>({id:r.id,x:r.x,y:r.y,w:r.w})));
 }
 cardFor(s){const offset={bridge:[305,418],steps:[280,258],ladder:[280,223],push:[310,418],turn:[305,418],open:[285,418],small:[290,427],float:[280,248],light:[310,418]}[s.kind];return{id:s.id,x:s.x+offset[0],y:offset[1]};}
 updateDevices(dt,input){const p=this.player;for(const s of this.stations){if(s.solved)s.solvedAge+=dt;s.errorLeft=Math.max(0,s.errorLeft-dt);if(!this.ready(s))continue;if(s.kind==='push'){const crate=this.crate(s);if(this.canMove&&input.x>0&&p.onGround&&Math.abs(p.x+12-crate.x)<5&&p.y>crate.y+30)s.push=Math.min(1,s.push+dt*115/140);if(s.push===1)s.sink=Math.min(1,s.sink+dt/.7);if(s.sink===1)s.used=true;}if(s.kind==='float'){if(p.support===s.id+'lift')s.lift=Math.min(1,s.lift+dt*.9);else if(p.x<s.x+105&&p.y>360)s.lift=Math.max(0,s.lift-dt);if(p.support===s.id+'lift'&&s.lift>.85)s.used=true;}}}
 movePlayer(dt,input={}){const p=this.player;p.moving=false;if(!this.canMove)return;const dx=clamp(input.x||0,-1,1),dy=clamp(input.y||0,-1,1),oldY=p.y;
  p.small=this.stations.some(s=>s.kind==='small'&&this.ready(s)&&p.x>=s.x+55&&p.x<=s.x+355);
  const ladder=this.stations.find(s=>s.kind==='ladder'&&this.ready(s)&&Math.abs(p.x-(s.x+LAB_LADDER.center))<23&&p.y>=LAB_LADDER.top-3&&p.y<=445);
  if(dy&&ladder&&!this.held){p.climbing=true;p.x=ladder.x+LAB_LADDER.center;p.vy=0;p.onGround=false;p.support=null;}
  if(p.climbing){if(dx||!ladder)p.climbing=false;else{const next=clamp(p.y+dy*145*dt,LAB_LADDER.top,440);p.climbDistance+=Math.abs(next-p.y);p.y=next;p.moving=!!dy;if(p.y<=LAB_LADDER.top+3)ladder.used=true;if(p.y===440){p.climbing=false;p.onGround=true;}return;}}
  const ratio=SIDE_HERO_SIZE/58,half=(p.small?6:12)*ratio,height=(p.small?23:50)*ratio,rects=this.solids();
  const speed=p.onGround?LANGUAGE.speed:LANGUAGE.airSpeed;
  let nx=clamp(p.x+dx*speed*dt,18,LANGUAGE.width-20);
  for(const r of rects){if(p.y<=r.y+1||p.y-height>=r.y+r.h-1)continue;if(dx>0&&p.x+half<=r.x+2&&nx+half>r.x)nx=Math.min(nx,r.x-half);if(dx<0&&p.x-half>=r.x+r.w-2&&nx-half<r.x+r.w)nx=Math.max(nx,r.x+r.w+half);}
  if(dx)p.dir=dx<0?'left':'right';p.moving=movedDuringStep(nx-p.x,0,dt)&&p.onGround;if(p.moving)p.walk+=dt;p.x=nx;
  const floors=this.platforms(),support=floors.find(f=>f.id===p.support&&p.x>=f.x&&p.x<=f.x+f.w);
  if(support&&p.onGround){p.y=support.y;p.vy=0;this.recordDeviceUse();return;}
  p.support=null;p.vy+=LANGUAGE.gravity*dt;let ny=p.y+p.vy*dt;p.onGround=false;
  if(p.vy<0)for(const r of rects)if(p.x+half>r.x&&p.x-half<r.x+r.w&&oldY-height>=r.y+r.h-1&&ny-height<r.y+r.h){ny=r.y+r.h+height;p.vy=0;}
  if(p.vy>=0)for(const f of floors.sort((a,b)=>a.y-b.y))if(p.x>=f.x&&p.x<=f.x+f.w&&oldY<=f.y+2&&ny>=f.y){ny=f.y;p.vy=0;p.onGround=true;p.support=f.id;break;}
  p.y=ny;this.recordDeviceUse();if(p.y>535)this.recoverFall();
 }
 recordDeviceUse(){const p=this.player;for(const s of this.stations){if(!this.ready(s))continue;if(['bridge','turn'].includes(s.kind)&&p.support===s.id+'bridge')s.used=true;if(s.kind==='steps'&&p.support?.startsWith(s.id+'step'))s.used=true;if(s.kind==='small'&&p.small&&p.x>s.x+110)s.used=true;if(['open','light'].includes(s.kind)&&p.x>s.x+(s.kind==='open'?220:200))s.used=true;}}
 update(dt,input={}){if(this.ended||!Number.isFinite(dt))return;let remain=Math.max(0,dt);while(remain>1e-7&&!this.ended){const untilRelease=this.pendingThrow?LANGUAGE_THROW.release-this.player.throwAge:Infinity;const step=Math.min(remain,1/60,untilRelease>1e-8?untilRelease:1/60);this.tick(step,input);remain-=step;}}
 tick(dt,input){tickVitality(this,dt);if(this.phase==='exiting'){this.walkOut(dt);return;}const p=this.player;this.elapsed=Math.min(LANGUAGE.duration,this.elapsed+dt);this.actionWait=Math.max(0,this.actionWait-dt);p.throwAge+=dt;this.noticeLeft=Math.max(0,this.noticeLeft-dt);this.stunLeft=Math.max(0,this.stunLeft-dt);this.invincibleLeft=Math.max(0,this.invincibleLeft-dt);
  let move=input;if(this.queuedMove){if(!input.x&&!input.y)move=this.queuedMove;this.queuedMove.left-=dt;if(this.queuedMove.left<=0)this.queuedMove=null;}this.updateDevices(dt,move);
  for(const b of this.blocks){b.age+=dt;if(b.phase==='rest'){b.x=b.homeX+Math.sin(this.elapsed*1.4+b.offset)*b.motion;b.y=b.homeY;}else if(b.phase==='bounce'){const u=Math.min(1,b.age/.6);b.x=b.bounceFrom.x+(b.homeX-b.bounceFrom.x)*u;b.y=b.bounceFrom.y+(b.homeY-b.bounceFrom.y)*u-Math.sin(u*Math.PI)*50;if(u===1){b.phase='rest';b.age=0;}}else if(b.phase==='magnet'){b.x+=(p.x+16-b.x)*Math.min(1,dt*14);b.y+=(p.y-27-b.y)*Math.min(1,dt*14);if(this.actionWait===0)b.phase='held';}}
  for(const shot of [...this.shots]){shot.age+=dt;if(shot.age>=shot.duration-1e-9){this.landShot(shot);this.shots.splice(this.shots.indexOf(shot),1);}}
  this.movePlayer(dt,move);
  if(this.pendingThrow&&p.throwAge>=LANGUAGE_THROW.release-1e-9){const sh=this.pendingThrow;this.pendingThrow=null;this.held=null;sh.block.phase='flight';this.shots.push({...sh,from:languageThrowPoint(this.characterId,p),age:0,duration:LANGUAGE_THROW.flight});this.onEvent({type:'languageThrow'});}
  for(const bot of this.bots){bot.x=bot.home+Math.sin(this.elapsed*bot.speed+bot.offset)*bot.range;if(this.canMove&&Math.abs(p.x-bot.x)<24&&p.y-3>bot.y-25&&p.y-SIDE_HERO_SIZE*.86<bot.y-3)this.hurt();}
  if(this.ended)return;
  for(const s of this.stations)if(this.ready(s)&&s.used&&!hasSource(this,s.id)){const card=this.cardFor(s),h=p.small?26:51;if(Math.abs(p.x-card.x)<20&&card.y>=p.y-h&&card.y<=p.y+6){const earned=awardClue(this,s.id);s.cardTaken=true;this.effects.push({type:'spark',...card,age:0});this.onEvent({type:'card',...card,id:earned});}}
  for(const e of this.effects)e.age+=dt;this.effects=this.effects.filter(e=>e.age<1);this.camera.x=clamp(p.x-140,0,LANGUAGE.width-390);
  if(Math.abs(p.x-LAB_EXIT.x)<=LAB_EXIT.openDistance)this.exit.open=Math.min(1,this.exit.open+dt/LAB_EXIT.openTime);
  if(this.elapsed>=LANGUAGE.duration)this.finish(true);else if(this.exit.open===1&&Math.abs(p.x-LAB_EXIT.x)<=LAB_EXIT.enterDistance&&p.onGround&&this.canMove){this.phase='exiting';this.exit.from={x:p.x,y:p.y};this.exit.age=0;this.queuedMove=null;p.throwAge=99;p.vy=0;p.climbing=false;p.dir='up';p.moving=true;}
 }
 walkOut(dt){const p=this.player,e=this.exit;e.age=Math.min(LAB_EXIT.walkTime,e.age+dt);const u=e.age/LAB_EXIT.walkTime;p.x=e.from.x+(LAB_EXIT.x-e.from.x)*Math.min(1,u/.5);p.y=e.from.y-29*u;p.walk+=dt;p.moving=true;this.camera.x=clamp(p.x-140,0,LANGUAGE.width-390);if(u===1){this.reachedExit=true;this.finish(true);}}
 finish(survived=true){if(this.ended)return;this.ended=true;this.phase='complete';this.player.moving=false;this.onEvent({type:'end',survived,elapsed:this.elapsed,found:[...this.found]});}
}
