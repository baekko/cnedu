import {movedDuringStep} from './walk-cycle.js';
import {socket} from './ai-art-layout.js';
import {awardClue} from './clue-order.js';
import {samplePool,validPlan} from './random-pool.js';
export const AI=Object.freeze({duration:130,speed:172,flashes:2,printSeconds:1,revealSeconds:.2,answer:'카멜레온',hints:['나뭇가지에 꼬리를 감고 다니는 파충류입니다.','긴 혀를 뻗어 벌레를 잡고 몸의 색을 바꿀 수 있습니다.']});
export const BODIES=['penguin','cat','whale','rabbit','fox','turtle'], POWERS=['rocket','octopus','wing','wheel','balloon','umbrella'], INKS=['snow','music','bubble','star'];
export const GROUPS=[BODIES,POWERS,INKS],SLOTS=['body','part','ink'],CAST=GROUPS.flat();
export const LABELS={penguin:'펭귄',cat:'고양이',whale:'고래',rabbit:'토끼',fox:'여우',turtle:'거북',rocket:'로켓',octopus:'문어발',wing:'날개',wheel:'바퀴',balloon:'풍선',umbrella:'우산',snow:'눈꽃',music:'음표',bubble:'물방울',star:'별빛'};
export const family=k=>SLOTS[GROUPS.findIndex(g=>g.includes(k))];
const order=(title,body,part,ink)=>({title,body,part,...(ink?{ink}:{}),slots:ink?SLOTS:SLOTS.slice(0,2)});
const land=['cat','rabbit','fox'],sea=['whale','turtle','penguin'],flight=['rocket','balloon','wing'];
export const ORDERS=[
 order('첫 비행을 선물해 줘!',BODIES,flight),
 order('들판을 달리는 배달부',land,['wheel','octopus']),
 order('바다 친구의 비 오는 날',sea,['umbrella']),
 order('바다 친구의 육상 경기',sea,['octopus','wheel']),
 order('눈 내리는 하늘 여행',BODIES,flight,['snow']),
 order('신나는 거리 악단',land,['wheel','octopus'],['music']),
 order('방울 속 공중 산책',BODIES,['umbrella','balloon'],['bubble']),
 order('별빛을 나르는 우체부',BODIES,['wing','rocket'],['star']),
 order('밤하늘의 마지막 공연',['whale','fox','rabbit'],['balloon','wing'],['music','star'])
];
function buildAIJobs(){const jobs=[],seen=new Set();for(const o of ORDERS)for(const body of o.body)for(const part of o.part)for(const ink of o.ink||[null])for(const powerLevel of [0,1,2])for(const inkLevel of ink?[0,1,2]:[1]){
 const key=[body,part,ink,powerLevel,inkLevel].join('/');if(seen.has(key))continue;seen.add(key);jobs.push(Object.freeze({order:o,reference:Object.freeze({body,part,...(ink?{ink}:{}),powerLevel,inkLevel})}));
}return Object.freeze(jobs);}
export const AI_JOB_POOL=buildAIJobs();
export function makeAIPlan(rng=Math.random){const two=[],three=[];AI_JOB_POOL.forEach((job,id)=>(job.reference.ink?three:two).push(id));return [...samplePool(two,4,rng),...samplePool(three,5,rng)];}
export const TABLES=[
 {id:'body',name:'형태 스캐너',x:74,y:246,w:124,h:77},
 {id:'part',name:'동작 스캐너',x:309,y:284,w:132,h:77},
 {id:'ink',name:'효과 프리즘',x:90,y:391,w:124,h:77},
 {id:'press',name:'AI 생성 코어',x:198,y:218,w:99,h:85}
];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function random(seed){return ()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
const choose=(a,r)=>a[Math.floor(r()*a.length)];
export function walkable(x,y){
 const edge=clamp(27-(y-115)*.095,8,31);if(y<130||y>451||x<edge||x>390-edge)return false;
 return !TABLES.some(b=>Math.abs(x-b.x)<b.w*.46+4&&y>b.y-30&&y<b.y+4);
}
export const matching=(g,s)=>!!g.photos[s]&&g.photos[s].kind===g.reference[s];
export class AIGame{
 constructor({onEvent=()=>{},seed=Math.floor(Math.random()*4294967296),runPlan,tutorial=false}={}){
  this.onEvent=onEvent;this.seed=seed;this.rng=random(seed);this.elapsed=0;this.ended=false;this.orderIndex=0;this.flashes=AI.flashes;this.banked=new Set();this.found=new Set();this.clueSources=new Set();this.health=3;
  this.runPlan=validPlan(runPlan,AI_JOB_POOL)&&runPlan.every((id,i)=>AI_JOB_POOL[id].order.slots.length===(i<4?2:3))?[...runPlan]:tutorial?null:makeAIPlan(this.rng);
  this.player={x:196,y:392,dir:'up',moving:false,walk:0,hammerAge:99};this.camera={x:0,y:0};this.queuedMove=null;this.photos={};this.album=[];this.print=null;this.synthesis=null;this.scanAge=99;this.receipt=null;this.notice='';this.noticeLeft=0;this.misses=0;this.history=new Set();this.setupOrder();
 }
 get order(){return this.runPlan?AI_JOB_POOL[this.runPlan[this.orderIndex]].order:ORDERS[this.orderIndex];}get remaining(){return Math.max(0,AI.duration-this.elapsed);}
 get canMove(){return !this.ended&&this.phase==='collect';}
 get canAct(){return !this.ended&&this.phase!=='print'&&this.scanAge>.22;}
 get canAutoMatch(){return !this.ended&&this.flashes>0&&['collect','infer'].includes(this.phase)&&!(this.phase==='infer'&&this.order.slots.every(s=>matching(this,s))&&this.draft.powerLevel===this.reference.powerLevel&&(!this.reference.ink||this.draft.inkLevel===this.reference.inkLevel));}
 get full(){return this.order.slots.every(k=>this.photos[k]);}
 get target(){
  if(!this.canMove)return null;
  const opts=[...this.samples,{type:'press',kind:'press',x:TABLES[3].x,y:TABLES[3].y+12}];
  return opts.map(a=>({a,d:Math.hypot((a.x-this.player.x)*1.03,a.y-this.player.y)})).filter(o=>o.d<39).sort((a,b)=>a.d-b.d)[0]?.a||null;
 }
 get actionLabel(){if(this.phase==='infer'||this.phase==='print')return '출력';return this.target?.type==='press'?'생성':'스캔';}
 setupOrder(){
  const o=this.order;this.reference={};if(this.runPlan)this.reference={...AI_JOB_POOL[this.runPlan[this.orderIndex]].reference};else for(let tries=0;tries<18;tries++){for(const s of o.slots)this.reference[s]=choose(o[s],this.rng);if(!this.history.has(Object.values(this.reference).join('/')))break;}
  this.history.add(Object.values(this.reference).join('/'));this.samples=[];
  if(!this.runPlan){this.reference.powerLevel=this.orderIndex===0?(this.rng()<.5?0:2):Math.floor(this.rng()*3);this.reference.inkLevel=o.ink?Math.floor(this.rng()*3):1;}
  o.slots.forEach((slot,j)=>{const b=TABLES[j],wanted=this.reference[slot],other=choose(GROUPS[j].filter(k=>k!==wanted),this.rng);
   const pair=this.rng()<.5?[wanted,other]:[other,wanted];pair.forEach((kind,i)=>{const w=socket(b,i);this.samples.push({type:'sample',slot,kind,bay:i,x:w.x,y:b.y+13,drawX:w.x,drawY:w.y});});});
  this.phase='collect';this.receipt=null;this.synthesis=null;this.print=null;this.displayed=null;
 }
 queueMove(d){this.queuedMove={x:d.x||0,y:d.y||0,left:.10};}
 peek(){if(this.phase==='infer'){this.phase='collect';this.synthesis=null;this.say('바꿀 특징을 다시 스캔하세요',1.6);return true;}return false;}
 flash(){
  if(!this.canAutoMatch)return false;
  this.flashes--;
  this.photos=Object.fromEntries(this.order.slots.map(slot=>{const a=this.samples.find(a=>a.slot===slot&&a.kind===this.reference[slot]);return [slot,{kind:this.reference[slot],x:a.drawX,y:a.drawY}];}));
  if(this.phase!=='infer')this.beginInference();
  Object.assign(this.synthesis,{powerLevel:this.reference.powerLevel,inkLevel:this.reference.inkLevel,age:1,input:'',repeat:0});
  this.queuedMove=null;this.receipt=null;this.scanAge=99;this.player.moving=false;
  this.say('원본과 맞췄어요 · 출력을 누르세요',2);this.onEvent({type:'studioAutoMatch'});return true;
 }
 say(s,sec=1.25){this.notice=s;this.noticeLeft=sec;}
 movePlayer(d,{x=0,y=0}={}){
  const p=this.player;p.moving=false;const n=Math.hypot(x,y);
  if(this.phase==='infer'){this.steerDraft(d,x,y);return;}if(!n)return;
  if(!this.canMove)return;const ox=p.x,oy=p.y,dx=x/n*AI.speed*d,dy=y/n*AI.speed*d;if(walkable(p.x+dx,p.y))p.x+=dx;if(walkable(p.x,p.y+dy))p.y+=dy;
  p.dir=Math.abs(x)>Math.abs(y)?(x<0?'left':'right'):(y<0?'up':'down');p.moving=movedDuringStep(ox-p.x,oy-p.y,d);if(p.moving)p.walk+=d;
 }
 get draft(){const a=this.synthesis;if(!a)return null;return {body:this.photos.body.kind,part:this.photos.part.kind,ink:this.photos.ink?.kind||null,powerLevel:a.powerLevel,inkLevel:a.inkLevel};}
 beginInference(){this.synthesis={channel:0,powerLevel:1,inkLevel:1,age:0,input:'',repeat:0};this.phase='infer';this.player.dir='up';this.player.moving=false;this.noticeLeft=0;this.onEvent({type:'studioGenerate'});}
 setInfluence(channel,level){if(this.phase!=='infer'||(channel!==0&&channel!==1)||!Number.isInteger(level)||level<0||level>2||(channel===1&&!this.photos.ink))return false;
  const a=this.synthesis,field=channel?'inkLevel':'powerLevel';a.channel=channel;if(a[field]!==level){a[field]=level;a.age=0;this.noticeLeft=0;this.onEvent({type:'studioRevise'});}return true;}
 steerDraft(dt,x,y){const a=this.synthesis;if(!a)return;a.age+=dt;a.repeat=Math.max(0,a.repeat-dt);
  const key=Math.abs(x)>=Math.abs(y)&&x?(x>0?'right':'left'):y?(y>0?'down':'up'):'';
  if(!key){a.input='';a.repeat=0;return;}if(key===a.input&&a.repeat>0)return;a.input=key;a.repeat=.35;
  if(key==='up'||key==='down'){a.channel=this.photos.ink&&key==='down'?1:0;return;}
  const field=a.channel?'inkLevel':'powerLevel',v=clamp(a[field]+(key==='right'?1:-1),0,2);
  if(v!==a[field])this.setInfluence(a.channel,v);
 }
 act(){
  if(!this.canAct)return false;
  if(this.phase==='infer'){
   const draft=this.draft,partsMatch=this.order.slots.every(s=>matching(this,s));
   if(partsMatch&&(draft.powerLevel!==this.reference.powerLevel||(draft.ink&&draft.inkLevel!==this.reference.inkLevel))){
    this.say('주문 원본과 맞지 않습니다',2);return false;
   }
   this.print={...this.photos,...{powerLevel:draft.powerLevel,inkLevel:draft.inkLevel},good:partsMatch,age:0,developed:false};this.synthesis=null;this.phase='print';this.scanAge=0;return true;
  }
  this.scanAge=0;const seen=this.displayed,a=seen&&this.elapsed-seen.t<.13&&Math.hypot(this.player.x-seen.px,this.player.y-seen.py)<4?seen.target:this.target;
  if(!a){this.say('스캐너 가까이 가서 특징을 읽으세요');return false;}
  if(a.type==='press'){
   if(!this.full){this.say('빈 입력칸의 특징부터 스캔하세요');return false;}
   this.beginInference();return true;
  }
  this.player.dir='up';this.receipt={...a};this.photos[a.slot]={kind:a.kind,x:a.drawX,y:a.drawY};this.say('특징 인식 · '+LABELS[a.kind]);this.onEvent({type:'studioScan'});return true;
 }
 reveal(){const r=this.print;if(!r||r.developed)return;r.developed=true;
  this.album.push({body:r.body.kind,part:r.part.kind,ink:r.ink?.kind||null,powerLevel:r.powerLevel,inkLevel:r.inkLevel,good:r.good});if(this.album.length>18)this.album.shift();
  this.onEvent({type:r.good?'studioPrint':'studioRemix'});if(r.good){const id=awardClue(this,this.orderIndex,this.orderIndex+1);r.card=id;this.onEvent({type:'card',id,x:195,y:390});}else this.misses++;
 }
 finishPrint(){const r=this.print;this.print=null;
  if(r.good){if(this.banked.size===9){this.finish();return;}this.orderIndex++;this.photos={};this.setupOrder();}
  else{for(const s of this.order.slots)if(!matching(this,s))delete this.photos[s];this.phase='collect';this.say('다른 특징만 다시 스캔하세요',2);}
 }
 finish(survived=true){if(this.ended)return;this.ended=true;this.phase='complete';this.player.moving=false;this.onEvent({type:'end',elapsed:this.elapsed,survived,found:[...this.banked]});}
 update(dt,input={}){let left=clamp(dt,0,AI.duration);while(left>1e-8&&!this.ended){const d=Math.min(left,1/60);left-=d;this.elapsed=Math.min(AI.duration,this.elapsed+d);this.scanAge+=d;this.noticeLeft=Math.max(0,this.noticeLeft-d);
   let m=input;if(!input.x&&!input.y&&this.queuedMove){m=this.queuedMove;this.queuedMove.left-=d;if(this.queuedMove.left<=0)this.queuedMove=null;}this.movePlayer(d,m);
   if(this.print){this.print.age+=d;if(this.print.age+1e-8>=AI.revealSeconds)this.reveal();if(this.print.age+1e-8>=AI.printSeconds)this.finishPrint();}
   if(this.elapsed>=AI.duration-1e-7&&!this.print){this.elapsed=AI.duration;this.finish();}
  }}
}
