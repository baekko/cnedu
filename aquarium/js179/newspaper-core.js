import {movedDuringStep} from './walk-cycle.js';
import {awardClue,hasSource} from './clue-order.js';
import {EXTRA_ARTICLES} from './newspaper-pool.js';
import {samplePool,poolIndexes,validPlan} from './random-pool.js';
export const NEWSPAPER=Object.freeze({duration:65,speed:132,carrySpeed:120,flashes:3,printSeconds:1.05,correctionSeconds:3,answer:'기린',hints:['나뭇잎을 먹는 초식동물입니다.','목이 아주 길고 몸에 얼룩무늬가 있습니다.']});
export const NEWSROOM=Object.freeze({boardX:[102,288],boardY:281,serviceY:302,beltY:409,beltSpeed:53,beltGap:78,beltLength:468,bounds:{left:30,right:360,top:289,bottom:378}});
// Every article has one unambiguous photo/headline pair. Later articles share a
// subject, but the brief identifies both the place and the event.
export const ARTICLES=Object.freeze([
 {id:0,category:'동물',brief:['동물원에서 아기 펭귄이','태어났어요.'],title:['아기 펭귄','탄생'],photo:'아기 펭귄',decoy:1},
 {id:1,category:'과학',brief:['새 천문대에서 어린이들이','망원경으로 별을 봐요.'],title:['어린이 천문대','문 열다'],photo:'어린이 천문대',decoy:2},
 {id:2,category:'학교',brief:['학교 운동회에서 학생들이','달리기 경기를 해요.'],title:['학교 운동회','달리기 한마당'],photo:'학교 달리기',decoy:0},
 {id:3,category:'문화',brief:['이웃들이 도서관에','책 백 권을 기부했어요.'],title:['도서관에 책','백 권 기부'],photo:'책 기부',decoy:4},
 {id:4,category:'문화',brief:['새 도서관이 문을 열어','개관 리본을 잘랐어요.'],title:['새 도서관','문 열다'],photo:'도서관 개관',decoy:3},
 {id:5,category:'기술',brief:['소방 로봇이 훈련장에서','물을 뿌려 불을 껐어요.'],title:['소방 로봇','훈련 성공'],photo:'소방 로봇 훈련',decoy:1},
 {id:6,category:'환경',brief:['주민들이 강변에 모여','쓰레기를 주웠어요.'],title:['강변 쓰레기','함께 치웠어요'],photo:'강변 청소',decoy:7},
 {id:7,category:'지역',brief:['산책길과 벤치가 있는','새 공원이 문을 열었어요.'],title:['새 공원','문 열다'],photo:'공원 개장',decoy:6},
 {id:8,category:'학교',brief:['학생들이 학교 텃밭에','채소 모종을 심었어요.'],title:['학교 텃밭','채소 심기'],photo:'텃밭 가꾸기',decoy:7}
].map(a=>Object.freeze({...a,brief:Object.freeze(a.brief),title:Object.freeze(a.title)})));
export const ARTICLE_POOL=Object.freeze([...ARTICLES,...EXTRA_ARTICLES].map((a,artId)=>Object.freeze({...a,artId})));
export const materialName=(m,articles=ARTICLES)=>m?m.kind==='photo'?'사진 · '+articles[m.article].photo:'제목 · '+articles[m.article].title.join(' '):'빈손';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const same=(a,b)=>a&&b&&a.kind===b.kind&&a.article===b.article;
export class NewspaperGame{
 constructor({onEvent=()=>{},random=Math.random,runPlan,tutorial=false}={}){
  this.runPlan=validPlan(runPlan,ARTICLE_POOL)?[...runPlan]:tutorial?ARTICLES.map(a=>a.id):samplePool(poolIndexes(ARTICLE_POOL),9,random);
  this.articles=this.runPlan.map((contentId,id)=>({...ARTICLE_POOL[contentId],contentId,id,decoy:(id+1)%9}));
  this.onEvent=onEvent;this.elapsed=0;this.ended=false;this.phase='editing';this.health=1;this.flashes=NEWSPAPER.flashes;this.banked=new Set();this.clueSources=new Set();this.found=new Set();this.effects=[];
  this.player={x:195,y:343,dir:'up',moving:false,walk:0,hammerAge:99};this.held=null;this.packed=null;this.bagActive=false;this.bagLoaded=false;this.actionWait=0;this.motion=null;this.finishLeft=null;this.printerAge=99;this.note='';this.noteLeft=0;this.nextArticle=2;this.supplyCursor=0;this.mistakes=0;
  this.boards=NEWSROOM.boardX.map((x,i)=>({id:i,x,y:NEWSROOM.boardY,article:i,photo:null,title:null,status:'editing',age:0,errorFields:[]}));
  this.materials=Array.from({length:6},(_,i)=>({id:i,x:39+i*NEWSROOM.beltGap,y:NEWSROOM.beltY,kind:i%2?'title':'photo',article:i<4?Math.floor(i/2):2}));
 }
 get remaining(){return Math.max(0,NEWSPAPER.duration-this.elapsed);}
 get canMove(){return !this.ended&&this.finishLeft===null;}
 get carried(){return [this.held,this.packed].filter(Boolean);}
 get canUseBag(){return this.canMove&&this.flashes>0&&!this.bagActive;}
 setCarried(items){this.held=items[0]||null;this.packed=items[1]||null;if(this.bagActive&&items.length===2)this.bagLoaded=true;if(this.bagLoaded&&!items.length){this.bagActive=false;this.bagLoaded=false;}}
 get actionLabel(){if(this.held&&this.returnNear())return '반납';const b=this.boardNear();return b&&!this.held&&b.photo&&b.title?'인쇄':'작업';}
 returnNear(){return Math.hypot(this.player.x-350,this.player.y-347)<=25;}
 boardNear(){return this.boards.filter(b=>b.article!==null&&b.status==='editing').map(b=>({b,d:Math.hypot(this.player.x-b.x,this.player.y-NEWSROOM.serviceY)})).filter(o=>o.d<=67&&this.player.y<=335).sort((a,b)=>a.d-b.d)[0]?.b||null;}
 materialNear(){return this.materials.filter(m=>m.kind&&m.x>=20&&m.x<=370).map(m=>({m,d:Math.hypot(m.x-this.player.x,m.y-this.player.y)})).filter(o=>o.d<=58&&this.player.y>=350).sort((a,b)=>a.d-b.d)[0]?.m||null;}
 get prompt(){
  if(this.ended)return '';
  if(this.noteLeft>0)return this.note;
  if(this.held&&this.returnNear())return '반납 · 들고 있는 재료를 돌려놓아요';
  const b=this.boardNear(),m=this.materialNear();
  if(b){if(this.held)return this.packed?'작업 · 사진과 제목 함께 붙이기':'작업 · '+(this.held.kind==='photo'?'사진':'제목')+' 붙이기';if(b.photo&&b.title)return '사진과 제목을 확인하고 인쇄하세요';return '취재 메모에 맞는 사진과 제목을 찾아요';}
  if(m){const swap=this.bagActive?this.carried.some(c=>c.kind===m.kind):!!this.held;return materialName(m,this.articles)+(swap?' · 작업으로 교환':' · 작업으로 집기');}
  if(this.packed)return '취재 가방 · 사진과 제목을 함께 운반 중';
  if(this.held)return materialName(this.held,this.articles);
  return '기사판의 메모를 읽고 재료를 골라요';
 }
 say(text,seconds=1.7){this.note=text;this.noteLeft=seconds;}
 needed(){return this.boards.filter(b=>b.article!==null&&b.status==='editing').flatMap(b=>['photo','title'].filter(k=>b[k]?.article!==b.article).map(kind=>({kind,article:b.article}))).filter(m=>!this.carried.some(c=>same(m,c)));}
 isNeeded(m){return this.needed().some(n=>same(n,m));}
 refill(m){
  const missing=this.needed().filter(n=>!this.materials.some(p=>p!==m&&same(n,p)));
  let next=missing[0];
  if(!next){const b=this.boards.find(b=>b.status==='editing'&&b.article!==null);const a=b?this.articles[b.article].decoy:0;next={kind:this.supplyCursor++%2?'title':'photo',article:a};}
  Object.assign(m,next);
 }
 ensureSupply(){
  // A newly assigned article receives all missing materials immediately. Keep
  // positions on the belt, so no card jumps into the player's hands.
  for(const wanted of this.needed())if(!this.materials.some(m=>same(m,wanted))){
   const slot=this.materials.find(m=>!m.kind)||this.materials.find(m=>!this.isNeeded(m));
   if(slot)Object.assign(slot,wanted);
  }
 }
 returnCards(items){
  const used=new Set();
  for(const item of items){const slot=this.materials.find(m=>!used.has(m.id)&&!m.kind)||this.materials.find(m=>!used.has(m.id)&&!this.isNeeded(m));if(slot){Object.assign(slot,item);used.add(slot.id);}}
  this.ensureSupply();
 }
 movePlayer(dt,input={}){
  const p=this.player;p.moving=false;if(!this.canMove||this.motion)return;
  let dx=clamp(input.x||0,-1,1),dy=clamp(input.y||0,-1,1),n=Math.hypot(dx,dy);if(!n)return;dx/=n;dy/=n;
  const oldX=p.x,oldY=p.y,b=NEWSROOM.bounds,speed=this.held?NEWSPAPER.carrySpeed:NEWSPAPER.speed;
  p.x=clamp(p.x+dx*speed*dt,b.left,b.right);p.y=clamp(p.y+dy*speed*dt,b.top,b.bottom);p.dir=Math.abs(dx)>Math.abs(dy)?dx<0?'left':'right':dy<0?'up':'down';
  p.moving=movedDuringStep(p.x-oldX,p.y-oldY,dt);if(p.moving)p.walk+=dt;
 }
 act(){
  if(!this.canMove||this.motion||this.actionWait>0)return false;
  if(this.held&&this.returnNear()){
   const items=this.carried;this.setCarried([]);this.returnCards(items);this.actionWait=.28;this.say('재료를 돌려놓았어요');return true;
  }
  const b=this.boardNear();
  if(b){
   if(this.held){
    const items=this.carried.map(m=>({...m})),old=items.map(m=>b[m.kind]).filter(Boolean),usingBag=this.bagActive;
    for(const m of items){b[m.kind]=m;b.errorFields=b.errorFields.filter(k=>k!==m.kind);}
    this.motion={kind:'place',material:items[0],materials:items,board:b.id,age:0,duration:.3};
    // A bag delivers both cards with one press. Replaced cards return to the
    // conveyor, so ending the bag never strands two cards in one free hand.
    this.setCarried(usingBag?[]:old);if(usingBag)this.returnCards(old);
    this.actionWait=.34;this.player.dir='up';this.player.moving=false;this.onEvent({type:'newsPlace'});this.ensureSupply();return true;
   }
   if(!b.photo||!b.title){this.say('사진 한 장과 제목 한 장이 필요해요');return false;}
   const wrong=['photo','title'].filter(k=>b[k].article!==b.article);
   this.player.dir='up';this.motion={kind:'press',board:b.id,age:0,duration:.25};this.actionWait=.35;this.player.moving=false;
   if(wrong.length){b.errorFields=wrong;b.status='correcting';b.age=0;for(const kind of wrong){const slot=this.materials.find(m=>!m.kind)||this.materials.find(m=>!this.isNeeded(m));if(slot)Object.assign(slot,b[kind]);b[kind]=null;}this.mistakes++;this.say('내용이 달라요 · 표시된 칸을 고쳐요',2.4);this.onEvent({type:'misfit'});}
   else{b.status='printing';b.age=0;this.printerAge=0;this.onEvent({type:'newsPrint'});}
   return true;
  }
  const m=this.materialNear();
  if(m){
   const next={kind:m.kind,article:m.article},items=this.carried,index=this.bagActive?items.findIndex(c=>c.kind===m.kind):0,old=items[index];
   if(index<0)items.push(next);else items[index]=next;
   this.setCarried(items);if(old)Object.assign(m,old);else m.kind=null;
   this.motion={kind:'pick',material:next,from:{x:m.x,y:m.y},age:0,duration:.22};this.player.dir='down';this.actionWait=.28;this.player.moving=false;this.onEvent({type:'pickup'});this.ensureSupply();return true;
  }
  // Return a carried card anywhere along the accessible conveyor edge.
  if(this.held&&this.player.y>=350){const items=this.carried;this.setCarried([]);this.returnCards(items);this.actionWait=.28;this.say('컨베이어에 돌려놓았어요');return true;}
  this.say(this.held?'기사판 가까이에서 작업을 눌러요':'컨베이어 가까이에서 작업을 눌러요');return false;
 }
 flash(){if(!this.canUseBag)return false;this.flashes--;this.bagActive=true;this.bagLoaded=false;this.say('취재 가방 · 사진과 제목을 한 장씩 담아요',2);this.onEvent({type:'newsBag'});return true;}
 update(dt,input={}){
  if(this.ended||!Number.isFinite(dt)||dt<=0)return;
  let left=Math.min(dt,NEWSPAPER.duration);while(left>1e-9&&!this.ended){const step=Math.min(left,1/90,this.remaining);if(step<=0){this.finish(true);break;}this.step(step,input);left-=step;}
 }
 step(dt,input){
  this.elapsed=Math.min(NEWSPAPER.duration,this.elapsed+dt);this.actionWait=Math.max(0,this.actionWait-dt);this.noteLeft=Math.max(0,this.noteLeft-dt);this.printerAge+=dt;
  if(this.motion){this.motion.age+=dt;if(this.motion.age>=this.motion.duration)this.motion=null;}
  this.movePlayer(dt,input);
  for(const m of this.materials){m.x+=NEWSROOM.beltSpeed*dt;if(m.x>429){m.x-=NEWSROOM.beltLength;if(!m.kind||!this.isNeeded(m))this.refill(m);}}
  for(const b of this.boards){b.age+=dt;
   if(b.status==='correcting'&&b.age>=NEWSPAPER.correctionSeconds){b.status='editing';this.ensureSupply();}
   if(b.status==='printing'&&b.age>=NEWSPAPER.printSeconds){
    const id=b.article+1;const earned=awardClue(this,id);(this.publishedArticles ||= []).push(b.article);b.status='published';b.age=0;this.effects.push({type:'card',id:earned,x:b.x,y:213,age:0});this.onEvent({type:'card',id:earned,x:b.x,y:383});if(this.banked.size===9)this.finishLeft=.85;
   }
   if(b.status==='published'&&b.age>=.6){b.article=this.nextArticle<this.articles.length?this.nextArticle++:null;b.photo=null;b.title=null;b.errorFields=[];b.status=b.article===null?'done':'editing';b.age=0;this.ensureSupply();}
  }
  for(const e of this.effects)e.age+=dt;this.effects=this.effects.filter(e=>e.age<1.5);
  if(this.finishLeft!==null){this.finishLeft-=dt;if(this.finishLeft<=0)this.finish(true);}
  if(this.remaining<=1e-8){this.elapsed=NEWSPAPER.duration;this.finish(true);}
 }
 finish(survived){if(this.ended)return;this.ended=true;this.player.moving=false;this.phase=survived?'complete':'stopped';this.onEvent({type:'end',survived,elapsed:this.elapsed,found:[...this.banked]});}
}
