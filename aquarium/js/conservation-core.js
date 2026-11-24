import{FieldGame,clamp}from'./field-base.js';
import{PAPER_PATTERNS,choosePaperPatterns,paperPattern}from'./conservation-patterns.js';
export const CONSERVATION=Object.freeze({duration:100,flashes:2,answer:'붓',hints:['책의 먼지를 부드럽게 털 때 쓰는 도구예요.','손잡이 끝에 부드러운 털이 달려 있어요.']});
export const BOOK_NAMES=Object.freeze(['산수첩','별자리책','꽃그림책','옛 지도책','동물도감','기행문집','시문집','악보집','그림일기']);
export const BOOK_WORK=Object.freeze({left:69,right:321,top:205,bottom:351,pressLeft:{x:96,y:282},pressRight:{x:294,y:282}});
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export function bookWorm(book,time){
 const phase=(time+book.id*1.07)%7.2,warning=phase<1,active=phase>=1&&phase<3.6,u=clamp((phase-1)/2.6,0,1);
 return {x:88+216*(book.id%2?1-u:u),y:251+Math.sin(u*Math.PI*2)*16+book.id%3*15,warning,active};
}
export function patchTarget(book,time){const t=paperPattern(book).target;return{x:t.x+(book.pinned?0:Math.sin(time*1.1+book.id)*3),y:t.y+(book.pinned?0:Math.cos(time*.9+book.id)*2)};}
export function createBook(id,tearId=0){
 const mode=Math.floor(id/3),dust=Array.from({length:12},(_,i)=>({x:96+(i%4)*66+(id%2?5:0),y:227+Math.floor(i/4)*39+(id%3)*3,left:1}));
 return{id,name:BOOK_NAMES[id],mode,tearId,dust,rotation:(id%3)+1,pinned:false,pinProgress:0,seams:Array(PAPER_PATTERNS[tearId].seams.length).fill(0),pressure:[.18+id%3*.04,.3+id%2*.08],stable:0,done:false,protected:false,mistakes:0};
}
export function patchSeams(book){const t=patchTarget(book,0);return paperPattern(book).seams.map(([x,y])=>({x:t.x+x,y:t.y+y}));}
export class ConservationGame extends FieldGame{
 constructor({onEvent=()=>{},random=Math.random,runPlan,tutorial=false}={}){
  super(CONSERVATION.duration,onEvent);this.flashes=CONSERVATION.flashes;
  const saved=Array.isArray(runPlan)&&runPlan.length===9&&runPlan.every(n=>Number.isInteger(n)&&n>=0&&n<PAPER_PATTERNS.length)&&(tutorial||new Set(runPlan.slice(3,6)).size===3),patterns=tutorial?[0,0,0]:choosePaperPatterns(random);
  this.runPlan=saved?[...runPlan]:Array.from({length:9},(_,i)=>i>=3&&i<6?patterns[i-3]:Math.floor(random()*PAPER_PATTERNS.length));
  this.books=Array.from({length:9},(_,i)=>createBook(i,this.runPlan[i]));this.selected=0;
  this.player={x:157,y:300,dir:'up',moving:false,walk:0,hammerAge:99};this.holding=false;this.motion=0;this.pauseWork=0;this.badHold=0;this.mistakes=0;this.lastPressSide=0;this.workAge=0;
 }
 get book(){return this.books[this.selected];}get cursor(){return this.player;}
 get canAct(){return !this.ended&&!this.book.done&&this.pauseWork<=0;}
 get actionLabel(){return this.book.mode===0?'붓질':this.book.mode===1?(this.book.pinned?'붙이기':'고정'):'압착';}
 get itemKind(){return'bookSupport';}get itemLabel(){return'보호 받침';}get itemTip(){return'지금 펼친 책의 작업 실수 한 번 보호 · 2회';}
 get statusDescription(){const b=this.book;return b.name+' · '+['먼지 털기','찢어진 종이 붙이기','들뜬 책장 펴기'][b.mode]+(b.done?' · 복원 완료':'');}
 get progress(){const b=this.book;if(b.done)return 1;if(b.mode===0)return b.dust.reduce((s,d)=>s+1-d.left,0)/b.dust.length;if(b.mode===1)return(b.pinned?1:0)/4+b.seams.reduce((s,x)=>s+x,0)/b.seams.length*.75;return Math.min(1,b.stable/1.15);}
 get prompt(){
  if(this.messageLeft>0)return this.message;const b=this.book;if(b.done)return'아홉 권의 복원을 마쳤어요';if(this.pauseWork>0)return'잠깐 손을 떼어 종이를 보호해요';
  if(b.mode===0)return'붓질을 누른 채 방향키로 쓸어요 · 벌레가 오면 손을 떼요';
  if(b.mode===1)return b.pinned?'주걱으로 반짝이는 가장자리를 따라 붙여요':'방향키로 종이를 맞추고 회전 · 초록 테두리에서 고정해요';
  return'왼쪽과 오른쪽 압착판을 번갈아 눌러 두 표시를 초록에 맞춰요';
 }
 get patchAligned(){const b=this.book,t=patchTarget(b,this.elapsed);return b.rotation===0&&dist(this.player,t)<13;}
 resetTool(){this.cancelAction();Object.assign(this.player,{x:157,y:300,moving:false});this.queuedMove=null;this.pauseWork=0;this.badHold=0;this.motion=0;}
 goRoom(){return false;}
 rotate(){if(this.ended||this.book.mode!==1||this.book.pinned||this.book.done)return false;this.book.rotation=(this.book.rotation+1)%4;this.badHold=0;this.onEvent({type:'bookRotate',id:this.selected});return true;}
 move(dt,input={}){
  const p=this.player;let x=input.x||0,y=input.y||0;if(this.queuedMove){if(!x&&!y)({x,y}=this.queuedMove);this.queuedMove.left-=dt;if(this.queuedMove.left<=0)this.queuedMove=null;}
  const n=Math.hypot(x,y)||1;if(n>1){x/=n;y/=n;}const before={x:p.x,y:p.y};p.x=clamp(p.x+x*145*dt,BOOK_WORK.left,BOOK_WORK.right);p.y=clamp(p.y+y*145*dt,BOOK_WORK.top,BOOK_WORK.bottom);this.motion=dist(before,p);p.moving=this.motion>.01;if(p.moving)p.walk+=dt;
 }
 pointAt(x,y){if(this.ended)return false;const p=this.player;this.motion=dist(p,{x,y});p.x=clamp(x,BOOK_WORK.left,BOOK_WORK.right);p.y=clamp(y,BOOK_WORK.top,BOOK_WORK.bottom);return true;}
 beginAction(){if(!this.canAct)return false;this.holding=true;this.workAge=0;this.onEvent({type:'bookWork',id:this.selected});return true;}
 act(){return this.beginAction();}releaseAction(){this.holding=false;this.badHold=0;}cancelAction(){this.releaseAction();}
 flash(){if(this.ended||this.flashes<=0||this.book.done||this.book.protected)return false;this.flashes--;this.book.protected=true;this.say('보호 받침이 이 책의 실수 한 번을 막아요');this.onEvent({type:'bookSupport',id:this.selected});return true;}
 mistake(why){const b=this.book;if(this.pauseWork>0)return;if(b.protected){b.protected=false;this.pauseWork=.22;this.say('보호 받침이 종이를 지켰어요');this.onEvent({type:'bookProtected',id:b.id});return;}
  b.mistakes++;this.mistakes++;this.pauseWork=.65;this.badHold=0;this.say(why,1.25);this.onEvent({type:'bookMistake',id:b.id});
 }
 complete(){const b=this.book;if(b.done)return;b.done=true;this.holding=false;this.award(b.id,195,261);this.onEvent({type:'bookRestored',id:b.id});if(!this.ended){this.selected=Math.min(8,b.id+1);this.resetTool();}this.say(b.name+' 완료'+(!this.ended?' · 다음 책을 펼쳤어요':''),1.1);}
 tick(dt){
  this.pauseWork=Math.max(0,this.pauseWork-dt);this.workAge+=dt;const b=this.book,p=this.player;if(b.done)return;
  if(b.mode===0){
   const worm=bookWorm(b,this.elapsed);
   if(this.holding&&this.pauseWork<=0){if(worm.active&&dist(p,worm)<21){this.mistake('책벌레가 지나갈 때는 붓을 들어요');return;}
    const sweep=Math.min(this.motion,145*dt);for(const d of b.dust)if(dist(p,d)<26)d.left=Math.max(0,d.left-sweep*.095);
   }
   if(b.dust.every(d=>d.left<=.001))this.complete();
  }else if(b.mode===1){
   if(this.holding&&this.pauseWork<=0){
    if(!b.pinned){if(this.patchAligned){b.pinProgress+=dt;if(b.pinProgress>=.38){b.pinned=true;this.say('한쪽이 고정됐어요 · 주걱으로 가장자리를 붙여요');this.onEvent({type:'bookPinned',id:b.id});}}else{b.pinProgress=0;this.badHold+=dt;if(this.badHold>.65)this.mistake('종이 방향과 찢어진 테두리를 먼저 맞춰요');}}
    else for(const[i,s]of patchSeams(b).entries())if(dist(p,s)<18)b.seams[i]=Math.min(1,b.seams[i]+dt*9);
   }
   if(b.pinned&&b.seams.every(v=>v>=1))this.complete();
  }else{
   const active=this.holding&&this.pauseWork<=0,side=dist(p,BOOK_WORK.pressLeft)<40?0:dist(p,BOOK_WORK.pressRight)<40?1:-1;
   if(active&&side>=0){this.lastPressSide=side;b.pressure[side]=clamp(b.pressure[side]+dt*.43,0,1);}
   for(let i=0;i<2;i++)if(!(active&&side===i))b.pressure[i]=Math.max(0,b.pressure[i]-dt*.055);
   if(b.pressure.some(v=>v>.88)){this.mistake('압착이 너무 세요 · 손을 떼어 힘을 줄여요');for(let i=0;i<2;i++)b.pressure[i]=Math.min(.74,b.pressure[i]);b.stable=0;}
   const good=b.pressure.every(v=>v>=.43&&v<=.7);b.stable=good?b.stable+dt:Math.max(0,b.stable-dt*1.8);if(b.stable>=1.15)this.complete();
  }
 }
 restoreResult(rec){super.restoreResult(rec);for(const b of this.books)if(this.clueSources.has(b.id))b.done=true;this.selected=this.books.findIndex(b=>!b.done);if(this.selected<0)this.selected=8;}
}
