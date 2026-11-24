import {movedDuringStep} from './walk-cycle.js';
import {awardClue,hasSource} from './clue-order.js';
import {samplePool,poolIndexes,validPlan} from './random-pool.js';
import {ROBOT_RECIPE_PLANS} from './work-plans.js';
export const ROBOT=Object.freeze({duration:65,speed:132,carrySpeed:120,repairSeconds:.95,magnetSeconds:.65,flashes:3,answer:'펭귄',hints:['남반구에 주로 사는 새입니다.','날지 못하지만 물속에서 헤엄을 잘 칩니다.']});
export const PARTS=Object.freeze([
 {id:'arm',name:'로봇 팔',color:'#57a7a4',sprite:0},
 {id:'battery',name:'배터리',color:'#e6b45b',sprite:1},
 {id:'wheel',name:'바퀴',color:'#6f8c9d',sprite:2},
 {id:'gear',name:'톱니바퀴',color:'#ca9453',sprite:3},
 {id:'circuit',name:'회로판',color:'#4f9b70',sprite:4},
 {id:'sensor',name:'센서',color:'#8877c4',sprite:5}
].map(Object.freeze));
export const ROBOT_MODELS=Object.freeze([
 {id:'ivory',name:'아이보리 로봇',sheet:'robots',row:0},
 {id:'coral',name:'코랄 로봇',sheet:'robots',row:1},
 {id:'yellow',name:'노랑 로봇',sheet:'robots',row:2},
 {id:'black',name:'검정 로봇',sheet:'robots-new-a',row:0},
 {id:'purple',name:'보라 로봇',sheet:'robots-new-a',row:1},
 {id:'orange',name:'주황 로봇',sheet:'robots-new-a',row:2},
 {id:'blue',name:'파랑 로봇',sheet:'robots-new-b',row:0},
 {id:'green',name:'초록 로봇',sheet:'robots-new-b',row:1},
 {id:'silver',name:'은백색 로봇',sheet:'robots-new-b',row:2}
].map(Object.freeze));
// Columns are the three repair stations; each has a fixed, unique sequence.
export const ROBOT_ORDER=Object.freeze([[0,3,4],[1,5,6],[2,7,8]].map(Object.freeze));
export const robotTypeFor=(station,round)=>ROBOT_ORDER[station][Math.min(2,Math.max(0,round))];
export const LAB=Object.freeze({beltY:174,beltLeft:24,beltRight:366,beltSpeed:29,partGap:1.65,pickupRange:46,stationY:337,stationRange:50,stationX:[80,195,310],bounds:{left:38,right:352,top:208,bottom:470}});
export const REPAIRS=Object.freeze([
 [['arm'],['battery','sensor'],['circuit','gear']],
 [['battery'],['arm','wheel'],['sensor','circuit']],
 [['wheel'],['gear','circuit'],['arm','sensor']]
]);
export const REPAIR_RECIPES=Object.freeze([...PARTS.map(p=>[p.id]),...PARTS.flatMap((p,i)=>PARTS.slice(i+1).map(q=>[p.id,q.id]))].map(Object.freeze));
export const ROBOT_JOB_POOL=Object.freeze(ROBOT_MODELS.flatMap((model,type)=>REPAIR_RECIPES.map(parts=>Object.freeze({type,parts}))));
export const ROBOT_TUTORIAL_PLAN=Object.freeze(ROBOT_ORDER.flatMap((models,station)=>models.map((type,round)=>type*21+REPAIR_RECIPES.findIndex(parts=>parts.length===REPAIRS[station][round].length&&parts.every(p=>REPAIRS[station][round].includes(p))))));
export function makeRobotPlan(random=Math.random){
 const models=samplePool(poolIndexes(ROBOT_MODELS),9,random),recipes=ROBOT_RECIPE_PLANS[Math.min(ROBOT_RECIPE_PLANS.length-1,Math.floor(random()*ROBOT_RECIPE_PLANS.length))];
 return models.map((model,slot)=>model*21+recipes[slot]);
}
export const partInfo=id=>PARTS.find(p=>p.id===id);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const direction=(dx,dy)=>Math.abs(dx)>Math.abs(dy)?dx<0?'left':'right':dy<0?'up':'down';
export class RobotGame{
 constructor({onEvent=()=>{},random=Math.random,runPlan,tutorial=false}={}){
  this.runPlan=validPlan(runPlan,ROBOT_JOB_POOL)&&runPlan.every((id,i)=>ROBOT_JOB_POOL[id].parts.length===(i%3===0?1:2))?[...runPlan]:tutorial?[...ROBOT_TUTORIAL_PLAN]:makeRobotPlan(random);
  this.onEvent=onEvent;this.elapsed=0;this.ended=false;this.phase='repair';this.health=1;this.flashes=ROBOT.flashes;this.banked=new Set();this.clueSources=new Set();this.found=new Set();this.effects=[];
  this.player={x:195,y:453,dir:'up',moving:false,walk:0,hammerAge:99};this.held=null;this.job=null;this.actionWait=0;this.misfitLeft=0;this.completionLeft=null;this.spawnWait=LAB.partGap;this.partSerial=0;this.supplyCursor=0;this.parts=[];
  this.stations=LAB.stationX.map((x,i)=>({id:i,x,y:LAB.stationY,round:0,type:this.modelFor(i,0),installed:[],status:'waiting',age:0,errorLeft:0,arrivalLeft:0}));
  for(let i=0;i<7;i++)this.addPart(PARTS[i%PARTS.length].id,30+i*52);
 }
 get remaining(){return Math.max(0,ROBOT.duration-this.elapsed);}
 get canMove(){return !this.ended&&!this.job&&this.misfitLeft<=0&&this.completionLeft===null;}
 get repaired(){return this.banked.size;}
 jobFor(station,round){return ROBOT_JOB_POOL[this.runPlan[station*3+Math.min(2,Math.max(0,round))]];}
 modelFor(station,round){return this.jobFor(station,round).type;}
 requirements(s){return this.jobFor(s.id,s.round).parts;}
 needs(s){return s.status==='waiting'?this.requirements(s).filter(k=>!s.installed.includes(k)):[];}
 stationNear(){
  const p=this.player;
  // Reach is measured from the visible workbench, on all four sides. Retain
  // the old front service area, and prefer a compatible bench in a shared aisle.
  return this.stations.filter(s=>s.status==='waiting').map(s=>{
   const dx=Math.max(0,Math.abs(p.x-s.x)-43),dy=Math.max(s.y-56-p.y,0,p.y-(s.y+10));
   return {s,reach:Math.hypot(dx,dy)<=32||Math.hypot(p.x-s.x,p.y-(s.y+37))<=LAB.stationRange,d:Math.hypot(p.x-s.x,p.y-(s.y-10)),matches:this.held&&this.needs(s).includes(this.held.kind)?1:0};
  }).filter(o=>o.reach).sort((a,b)=>b.matches-a.matches||a.d-b.d)[0]?.s||null;
 }
 partNear(){return this.parts.filter(p=>p.x>=LAB.beltLeft-5&&p.x<=LAB.beltRight+5&&p.kind!==this.held?.kind).map(p=>({p,d:Math.hypot(p.x-this.player.x,p.y-this.player.y)})).filter(o=>o.d<=LAB.pickupRange).sort((a,b)=>a.d-b.d)[0]?.p||null;}
 get canMagnet(){return this.canMove&&!this.held&&!!this.stationNear()&&this.flashes>0;}
 get prompt(){
  if(this.ended)return '';
  if(this.job)return this.job.type==='magnet'?'필요한 부품을 끌어오는 중':'부품을 끼우고 조이는 중';
  if(this.misfitLeft>0)return '다른 부품이 필요해요';
  const s=this.stationNear();
  if(s){const names=this.needs(s).map(k=>partInfo(k).name).join(' · ');return this.held?(this.needs(s).includes(this.held.kind)?'작업을 눌러 부품을 장착하세요':'필요한 부품: '+names):'필요한 부품: '+names;}
  if(this.partNear())return this.held?'작업을 누르면 가까운 부품과 교환해요':'작업을 눌러 가까운 부품을 집으세요';
  return this.held?'필요한 로봇 가까이에서 작업을 눌러 주세요':'컨베이어에서 필요한 부품을 골라요';
 }
 addPart(kind,x=-28){this.parts.push({id:++this.partSerial,kind,x,y:LAB.beltY,wobble:this.partSerial*.9});}
 nextSupply(){
  // Every current requirement remains in circulation. An empty belt or repeated
  // misses cannot permanently remove the part needed by an unfinished robot.
  const wanted=[...new Set(this.stations.flatMap(s=>this.needs(s)))];
  const missing=wanted.filter(k=>!this.parts.some(p=>p.kind===k&&p.x<380));
  if(missing.length)return missing[this.supplyCursor++%missing.length];
  const kind=PARTS[this.supplyCursor%PARTS.length].id;this.supplyCursor++;return kind;
 }
 movePlayer(dt,input={}){
  const p=this.player;p.moving=false;if(!this.canMove)return;
  let dx=clamp(input.x||0,-1,1),dy=clamp(input.y||0,-1,1),n=Math.hypot(dx,dy);if(!n)return;dx/=n;dy/=n;
  const speed=this.held?ROBOT.carrySpeed:ROBOT.speed,b=LAB.bounds,oldX=p.x,oldY=p.y;
  const blocked=(x,y)=>this.stations.some(s=>Math.abs(x-s.x)<43&&y>s.y-56&&y<s.y+10);
  const x=clamp(p.x+dx*speed*dt,b.left,b.right);if(!blocked(x,p.y))p.x=x;
  const y=clamp(p.y+dy*speed*dt,b.top,b.bottom);if(!blocked(p.x,y))p.y=y;
  p.dir=direction(dx,dy);p.moving=movedDuringStep(p.x-oldX,p.y-oldY,dt);if(p.moving)p.walk+=dt;
 }
 work(){
  if(!this.canMove||this.actionWait>0)return false;
  const s=this.stationNear();
  if(s){
   if(!this.held){this.onEvent({type:'robotNote',message:this.prompt});return false;}
   if(!this.needs(s).includes(this.held.kind)){s.errorLeft=1.1;this.misfitLeft=.8;this.actionWait=.4;this.onEvent({type:'misfit'});return false;}
   this.job={type:'repair',station:s.id,kind:this.held.kind,age:0,duration:ROBOT.repairSeconds};this.held=null;this.player.dir=direction(s.x-this.player.x,s.y-20-this.player.y);this.player.moving=false;this.onEvent({type:'repairStart'});return true;
  }
  const part=this.partNear();if(!part){this.onEvent({type:'robotNote',message:this.prompt});return false;}
  const prior=this.held;this.held={kind:part.kind};if(prior)part.kind=prior.kind;else this.parts=this.parts.filter(p=>p.id!==part.id);
  this.player.dir='up';this.actionWait=.25;this.onEvent({type:'pickup',kind:this.held.kind});return true;
 }
 flash(){
  if(!this.canMagnet)return false;const s=this.stationNear(),kind=this.needs(s)[0];if(!kind)return false;
  let part=this.parts.filter(p=>p.kind===kind).sort((a,b)=>Math.abs(a.x-this.player.x)-Math.abs(b.x-this.player.x))[0];
  const from={x:part?.x??LAB.beltLeft,y:LAB.beltY};if(part)this.parts=this.parts.filter(p=>p.id!==part.id);
  this.flashes--;this.job={type:'magnet',kind,from,age:0,duration:ROBOT.magnetSeconds};this.player.moving=false;this.onEvent({type:'magnet'});return true;
 }
 update(dt,input={}){
  if(this.ended||!Number.isFinite(dt)||dt<=0)return;
  let left=Math.min(dt,ROBOT.duration);while(left>1e-9&&!this.ended){const step=Math.min(left,1/90,this.remaining);if(step<=0){this.finish(true);break;}this.step(step,input);left-=step;}
 }
 step(dt,input){
  this.elapsed+=dt;this.actionWait=Math.max(0,this.actionWait-dt);this.misfitLeft=Math.max(0,this.misfitLeft-dt);this.movePlayer(dt,input);
  for(const p of this.parts)p.x+=LAB.beltSpeed*dt;this.parts=this.parts.filter(p=>p.x<410);
  this.spawnWait-=dt;while(this.spawnWait<=0){this.addPart(this.nextSupply());this.spawnWait+=LAB.partGap;}
  for(const s of this.stations){
   s.age+=dt;s.errorLeft=Math.max(0,s.errorLeft-dt);s.arrivalLeft=Math.max(0,s.arrivalLeft-dt);
   if(s.status==='celebrate'&&s.age>=1.7){s.round++;s.installed=[];s.type=this.modelFor(s.id,s.round);s.status=s.round>=3?'done':'waiting';s.age=0;s.arrivalLeft=.7;}
  }
  this.effects.forEach(e=>e.age+=dt);this.effects=this.effects.filter(e=>e.age<1.5);
  if(this.job){const job=this.job;job.age+=dt;
   if(job.age+1e-9>=job.duration){this.job=null;
    if(job.type==='magnet')this.held={kind:job.kind};
    else{const s=this.stations[job.station];s.installed.push(job.kind);this.onEvent({type:'repairPart',kind:job.kind});
     if(!this.needs(s).length){const id=s.id*3+s.round+1;s.status='celebrate';s.age=0;const earned=awardClue(this,id);this.effects.push({type:'card',id:earned,x:s.x,y:s.y-80,age:0});this.onEvent({type:'card',id:earned,source:id,x:s.x,y:s.y+170-70});if(this.banked.size===9)this.completionLeft=1.4;}
    }
   }
  }
  if(this.completionLeft!==null){this.completionLeft-=dt;if(this.completionLeft<=0)this.finish(true);}
  if(this.remaining<=1e-8){this.elapsed=ROBOT.duration;this.finish(true);}
 }
 finish(survived){if(this.ended)return;this.ended=true;this.player.moving=false;this.phase=survived?'complete':'stopped';this.onEvent({type:'end',survived,elapsed:this.elapsed,found:[...this.banked]});}
}
