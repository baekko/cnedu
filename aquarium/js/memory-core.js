import {FieldGame,clamp} from './field-base.js';
import {awardClue} from './clue-order.js';
import {MEMORY_SCENES} from './memory-scenes.js?v224';
import {memorySpotAt} from './memory-targets.js?v209';

const timing={observeSeconds:20,changeDelay:3,revisitSeconds:10,searchSeconds:20,feedbackSeconds:.8,revealBlinks:3,revealCycle:.72,revealOn:.43};
const rounds=3,revealSeconds=timing.revealBlinks*timing.revealCycle;
const duration=Math.ceil(rounds*(timing.observeSeconds+timing.changeDelay+timing.searchSeconds+revealSeconds)+timing.revisitSeconds)+1;
export const MEMORY=Object.freeze({
 ...timing,duration,revealSeconds,flashes:1,revisits:1,
 rounds,changes:3,attempts:4,answer:'사진첩',
 hints:['찍은 사진을 모아 두고 한 장씩 다시 보는 물건이에요.','사진으로 시작하고 첩으로 끝나는 세 글자예요.','정답은 사진첩이에요.'],
});
export const MEMORY_SIZE=Object.freeze({width:560,height:700});
export const MEMORY_BOARD=Object.freeze({x:24,y:34,w:342,h:427.5});
export const MEMORY_DEMO_PLAN=Object.freeze([
 {scene:'03',spots:[1,2,6]},{scene:'01',spots:[1,2,3]},{scene:'02',spots:[1,3,6]},
]);
const byId=new Map(MEMORY_SCENES.map(scene=>[scene.id,scene]));
const retiredSceneIds=new Set(["22", "23", "27", "30", "35", "43", "80", "83"]);

function sample(items,n,random){
 const draw=[...items];
 for(let i=0;i<n;i++){
  const j=i+Math.floor(random()*(draw.length-i));
  [draw[i],draw[j]]=[draw[j],draw[i]];
 }
 return draw.slice(0,n);
}
export function makeMemoryPlan(random=Math.random){
 return sample(MEMORY_SCENES,MEMORY.rounds,random)
  .map(scene=>({scene:scene.id,spots:sample(scene.spots,MEMORY.changes,random).map(spot=>spot.id)}));
}
export function normalizeMemoryPlan(plan){
 if(!Array.isArray(plan)||plan.length!==MEMORY.rounds)return null;
 // Replace withdrawn pictures in saved runs with distinct active pictures.
 if(plan.some(round=>retiredSceneIds.has(round?.scene))){
  const savedIds=plan.map(round=>round?.scene);
  if(new Set(savedIds).size!==savedIds.length)return null;
  const available=MEMORY_SCENES.filter(scene=>!savedIds.includes(scene.id)).values();
  plan=plan.map(round=>retiredSceneIds.has(round?.scene)
   ?{...round,scene:available.next().value.id}:round);
 }
 const scenes=new Set();
 for(const round of plan){
  const scene=byId.get(round?.scene);
  if(!scene||scenes.has(scene.id)||!Array.isArray(round.spots)||round.spots.length!==MEMORY.changes
    ||new Set(round.spots).size!==MEMORY.changes||round.spots.some(id=>!scene.spots.some(spot=>spot.id===id)))return null;
  scenes.add(scene.id);
 }
 return plan.map(round=>({scene:round.scene,spots:[...round.spots]}));
}

export function normalizeMemorySources(sources,plan){
 if(!Array.isArray(sources)||!plan)return [];
 const active=new Set(plan.flatMap(round=>round.spots.map(spot=>round.scene+'-'+spot)));
 return [...new Set(sources.filter(source=>active.has(source)))];
}

export function memoryBoardPoint(x,y){
 const {x:left,y:top,w,h}=MEMORY_BOARD;
 if(!Number.isFinite(x)||!Number.isFinite(y)||x<left||x>=left+w||y<top||y>=top+h)return null;
 return {x:(x-left)*MEMORY_SIZE.width/w,y:(y-top)*MEMORY_SIZE.height/h};
}

const startCursor=()=>({x:MEMORY_SIZE.width/2,y:MEMORY_SIZE.height/2,visible:false});
export const MEMORY_CURSOR_SPEED=415;
export class MemoryGame extends FieldGame{
 constructor({onEvent=()=>{},random=Math.random,runPlan,loadRound}={}){
  super(MEMORY.duration,onEvent);
  this.random=random;
  this.runPlan=normalizeMemoryPlan(runPlan)||makeMemoryPlan(random);
  this.loadRound=loadRound;
  this.flashes=MEMORY.flashes;
  this.revisits=MEMORY.revisits;
  this.startRound(0);
 }
 get canMove(){return this.canAct;}
 get canAct(){return !this.ended&&this.phase==='search';}
 get canHint(){return this.canAct&&this.flashes>0;}
 get canRevisit(){return !this.ended&&this.phase==='observe'&&this.revisits>0;}
 get itemKind(){return 'memorySearch';}
 get itemLabel(){return '범위 힌트';}
 get actionLabel(){return '찾기';}
 get remainingAttempts(){return MEMORY.attempts-this.attempts;}
 get clockTotal(){return {observe:this.observationTotal,countdown:MEMORY.changeDelay,search:MEMORY.searchSeconds}[this.phase]||0;}
 get revealing(){return this.phase==='review'&&this.foundSpots.size<MEMORY.changes;}
 get showMissing(){
  if(!this.revealing)return false;
  const elapsed=MEMORY.revealSeconds-this.phaseLeft;
  return elapsed%MEMORY.revealCycle<MEMORY.revealOn;
 }
 get statusDescription(){
  if(this.phase==='loading')return '그림 준비 중';
  if(this.phase==='error')return '다시하기로 그림을 불러오세요';
  if(this.phase==='observe')return '그림을 기억하세요';
  if(this.phase==='countdown')return '바뀐 그림을 준비해요';
  if(this.phase==='search')return '달라진 곳을 찾으세요';
  if(this.revealing)return '정답 공개 · 놓친 곳 '+(MEMORY.changes-this.foundSpots.size)+'개';
  return this.foundSpots.size+'곳을 찾았어요';
 }
 startRound(index,restoring=false){
  this.room=index;
  const plan=this.runPlan[index];
  this.scene=byId.get(plan.scene);
  this.targets=this.scene.spots.filter(spot=>plan.spots.includes(spot.id));
  this.foundSpots=new Set();
  this.attempts=0;
  this.cursor=startCursor();
  this.queuedMove=null;
  this.misses=[];
  this.hint=null;
  this.art=null;
  this.observationTotal=MEMORY.observeSeconds;
  this.phaseLeft=this.observationTotal;
  this.phase=this.loadRound?'loading':'observe';
  const load=Symbol();
  this.roundLoad=load;
  if(this.loadRound){
   this.loadRound(this.scene,plan.spots).then(art=>{
    if(this.roundLoad!==load||this.ended&&!restoring)return;
    this.art=art;if(!restoring)this.phase='observe';
   }).catch(()=>{if(this.roundLoad===load&&!this.ended)this.phase='error';});
  }
 }
 move(dt,input){
  if(!this.canMove)return;
  let {x=0,y=0}=input;
  if(this.queuedMove){
   if(!x)x=this.queuedMove.x;
   if(!y)y=this.queuedMove.y;
   this.queuedMove.left-=dt;
   if(this.queuedMove.left<=0)this.queuedMove=null;
  }
  const distance=Math.hypot(x,y);
  if(!distance)return;
  const step=MEMORY_CURSOR_SPEED*dt/Math.max(1,distance);
  this.cursor={x:clamp(this.cursor.x+x*step,1,MEMORY_SIZE.width-1),
   y:clamp(this.cursor.y+y*step,1,MEMORY_SIZE.height-1),visible:true};
 }
 movePlayer(dt,input){this.move(dt,input);}
 goRoom(){return false;}
 releaseAction(){return false;}
 beginAction(){return this.act();}
 act(){return this.guess(this.cursor);}
 pressPicture(x,y){
  const position=memoryBoardPoint(x,y);
  if(!position||!this.canAct)return false;
  this.cursor={...position,visible:false};
  return this.guess(position);
 }
 guess(point){
  const {x,y}=point;
  if(!this.canAct||!Number.isFinite(x)||!Number.isFinite(y)||x<0||x>=MEMORY_SIZE.width||y<0||y>=MEMORY_SIZE.height)return false;
  const spot=memorySpotAt(this.targets,point);
  if(spot&&this.foundSpots.has(spot.id))return false;
  this.attempts++;
  this.cursor.visible=false;
  if(spot){
   this.foundSpots.add(spot.id);
   if(this.hint?.spot===spot.id)this.hint=null;
   const id=awardClue(this,this.scene.id+'-'+spot.id);
   if(id)this.onEvent({type:'card',id,x:MEMORY_BOARD.x+spot.mark[0]/MEMORY_SIZE.width*MEMORY_BOARD.w,
    y:170+MEMORY_BOARD.y+spot.mark[1]/MEMORY_SIZE.height*MEMORY_BOARD.h});
  }else{
   this.misses.push({x,y});
   this.onEvent({type:'memoryMiss'});
  }
  if(!this.ended&&(this.remainingAttempts===0||this.foundSpots.size===MEMORY.changes))this.review();
  return true;
 }
 revisitOriginal(){
  if(!this.canRevisit)return false;
  this.revisits--;
  this.observationTotal+=MEMORY.revisitSeconds;
  this.phaseLeft+=MEMORY.revisitSeconds;
  return true;
 }
 flash(){
  if(!this.canHint)return false;
  const pending=this.targets.filter(spot=>!this.foundSpots.has(spot.id));
  const spot=pending[Math.floor(this.random()*pending.length)];
  const [x,y,w,h]=spot.patch;
  const width=Math.max(154,w+80),height=Math.max(170,h+84);
  const left=clamp(x-(width-w)*(.33+.34*this.random()),0,MEMORY_SIZE.width-width);
  const top=clamp(y-(height-h)*(.33+.34*this.random()),0,MEMORY_SIZE.height-height);
  this.hint={spot:spot.id,box:[left,top,width,height],left:3.2};
  this.flashes--;
  this.onEvent({type:'memoryHint'});
  return true;
 }
 review(){
  this.phase='review';this.phaseLeft=this.revealing?MEMORY.revealSeconds:MEMORY.feedbackSeconds;
  this.cursor.visible=false;this.queuedMove=null;this.hint=null;
 }
 restoreResult(record){
  this.startRound(clamp(record.room||0,0,MEMORY.rounds-1),true);
  super.restoreResult(record);
  this.clueSources=new Set(normalizeMemorySources(record.clueSources,this.runPlan));
  this.revisits=Math.max(0,Math.min(MEMORY.revisits,record.revisits??MEMORY.revisits));
  this.foundSpots=new Set(this.targets.filter(spot=>this.clueSources.has(this.scene.id+'-'+spot.id)).map(spot=>spot.id));
 }
 update(dt,input){
  if(this.phase==='loading'||this.phase==='error')return;
  super.update(dt,input);
 }
 tick(dt){
  if(this.hint&&(this.hint.left-=dt)<=0)this.hint=null;
  this.phaseLeft=Math.max(0,this.phaseLeft-dt);
  if(this.phaseLeft>1e-8)return;
  if(this.phase==='observe'){this.phase='countdown';this.phaseLeft=MEMORY.changeDelay;return;}
  if(this.phase==='countdown'){this.phase='search';this.phaseLeft=MEMORY.searchSeconds;return;}
  if(this.phase==='search'){this.review();return;}
  if(this.phase==='review'){
   if(this.room+1<MEMORY.rounds)this.startRound(this.room+1);
   else this.finish(true);
  }
 }
}
