import {awardClue,normalizeClueRewards,restoreSources} from './clue-order.js';
import {PURSUIT_CITIES,RETIRED_PURSUIT_CITIES} from './pursuit-cities.js?v243';
import {pursuitNextPin,removePursuitPin} from './pursuit-map.js?v235';

export const PURSUIT=Object.freeze({
 rounds:9,attempts:10,flashes:3,answer:'수갑',
 hints:['손목에 채우는 물건이에요.','경찰이 범인을 붙잡았을 때 쓰는 두 글자 물건이에요.','정답은 수갑이에요.'],
});
export const PURSUIT_START=Object.freeze({id:'incheon-airport',name:'인천공항',country:'대한민국',lat:37.4602,lon:126.4407});
export {PURSUIT_CITIES};
const cityById=new Map(PURSUIT_CITIES.map(city=>[city.id,city]));
const retiredCities=new Map(RETIRED_PURSUIT_CITIES.map(city=>[city.id,city]));
const easyOpenings=new Set([
 'paris','london','dubai','sydney','rome','venice','riodejaneiro','athens','agra','barcelona',
 'newyork','sanfrancisco','losangeles','beijing','osaka','singapore',
 'pisa','florence','edinburgh','washingtondc','kyoto','gyeongju','xian','siemreap',
]);
const mistakeAllowance=PURSUIT.attempts-PURSUIT.rounds;

export function getPursuitCity(id){
 return cityById.get(id)??retiredCities.get(id)??null;
}

function shuffle(values,random){
 const list=[...values];
 for(let i=list.length-1;i>0;i--){
  const j=Math.floor(random()*(i+1));
  [list[i],list[j]]=[list[j],list[i]];
 }
 return list;
}

export function normalizePursuitRunPlan(plan,{allowRetired=false}={}){
 return Array.isArray(plan)&&plan.length===PURSUIT.rounds&&new Set(plan).size===PURSUIT.rounds&&
  plan.every(id=>allowRetired?getPursuitCity(id):cityById.has(id))?[...plan]:null;
}

function newRunPlan(random){
 const deck=shuffle(PURSUIT_CITIES,random);
 const opening=deck.filter(city=>easyOpenings.has(city.id)).slice(0,2);
 return [...opening,...deck.filter(city=>!opening.includes(city))]
  .slice(0,PURSUIT.rounds).map(city=>city.id);
}

function nearby(a,b){
 const lon=(Math.abs(a.lon-b.lon)+360)%360;
 return Math.hypot(a.lat-b.lat,Math.min(lon,360-lon)*Math.cos((a.lat+b.lat)*Math.PI/360));
}

function candidateCities(answer,excluded,random){
 const pool=PURSUIT_CITIES.filter(city=>city.id!==answer.id&&!excluded.has(city.id));
 // Nearby distractors make a landmark worth inspecting. The remaining pins
 // keep the world map legible and show the wider scope of the case.
 const closest=[...pool].sort((a,b)=>nearby(answer,a)-nearby(answer,b)).slice(0,8);
 const local=shuffle(closest,random).slice(0,2);
 const open=pool.filter(city=>!local.includes(city));
 const others=[];
 for(const city of shuffle(open,random)){
  if([answer,...local,...others].some(p=>nearby(p,city)<6))continue;
  others.push(city);
  if(others.length===4)break;
 }
 if(others.length<4){
  others.push(...shuffle(open.filter(city=>!others.includes(city)),random).slice(0,4-others.length));
 }
 return shuffle([answer,...local,...others],random);
}

export class PursuitGame{
 constructor({onEvent=()=>{},runPlan,random=Math.random}={}){
  this.onEvent=onEvent;
  this.random=random;
  this.runPlan=normalizePursuitRunPlan(runPlan)||newRunPlan(random);
  this.elapsed=0;
  this.round=1;
  this.room=0;
  this.flashes=PURSUIT.flashes;
  this.health=3;
  this.phase='choosing';
  this.phaseLeft=0;
  this.ended=false;
  this.captured=null;
  this.origin=PURSUIT_START;
  this.banked=new Set();
  this.found=new Set();
  this.clueSources=new Set();
  this.trace=[];
  this.beginRound();
 }
 get attemptsUsed(){return this.trace.length+Number(this.phase==='flying');}
 get remainingAttempts(){return Math.max(0,PURSUIT.attempts-this.attemptsUsed);}
 get mistakes(){return this.trace.filter(leg=>!leg.correct).length;}
 get enlargedClue(){return this.zoomedClue;}
 get selectedCity(){return this.choices[this.selected]||null;}
 get canSelect(){return !this.ended&&this.phase==='choosing'&&this.remainingAttempts>0&&!this.zoomedClue;}
 get canAct(){return this.canSelect&&this.selectedCity!==null;}
 get canHint(){return !this.ended&&this.phase==='choosing'&&this.flashes>0&&!this.extraClue&&!this.zoomedClue;}
 get actionLabel(){return '비행';}
 get targetCity(){return getPursuitCity(this.runPlan[this.round-1]);}
 get currentClues(){
  if(!cityById.has(this.targetCity?.id))return [];
  const last=this.extraClue?4:3;
  return Array.from({length:last},(_,i)=>({id:this.targetCity.id,index:i+1}));
 }
 get flightProgress(){
  return this.flightTime?Math.max(0,Math.min(1,1-this.phaseLeft/this.flightTime)):0;
 }
 beginRound(){
  this.phase='choosing';
  this.phaseLeft=0;
  this.selected=-1;
  this.arrival=null;
  this.retryNotice=null;
  this.destination=null;
  this.departure=null;
  this.zoomedClue=0;
  this.extraClue=false;
  const excluded=new Set([this.origin.id,...this.runPlan.slice(this.round)]);
  this.choices=candidateCities(this.targetCity,excluded,this.random);
 }
 select(index){
  if(!this.canSelect||!Number.isInteger(index)||index<0||index>=this.choices.length)return false;
  this.selected=index;
  return true;
 }
 selectionIndex(dx,dy){
  return this.canSelect?pursuitNextPin(this.choices,this.selected,this.origin,dx,dy):-1;
 }
 canMoveSelection(dx,dy){
  return this.selectionIndex(dx,dy)>=0;
 }
 moveSelection(dx,dy){
  return this.select(this.selectionIndex(dx,dy));
 }
 toggleClue(index){
  if(this.ended||this.phase!=='choosing')return false;
  if(this.zoomedClue){this.zoomedClue=0;return true;}
  if(!Number.isInteger(index)||index<1||index>this.currentClues.length)return false;
  this.zoomedClue=index;
  return true;
 }
 closeClue(){
  if(!this.zoomedClue)return false;
  this.zoomedClue=0;
  return true;
 }
 flash(){
  if(!this.canHint)return false;
  this.flashes--;
  this.extraClue=true;
  this.onEvent({type:'pursuitClue'});
  return true;
 }
 act(){
  if(!this.canAct)return false;
  this.departure=this.origin;
  this.destination=this.selectedCity;
  this.flightTime=1.1;
  this.phaseLeft=this.flightTime;
  this.phase='flying';
  this.onEvent({type:'pursuitTakeoff'});
  return true;
 }
 beginAction(){return this.act();}
 releaseAction(){}
 land(){
  const expected=this.targetCity;
  const correct=this.destination.id===expected.id;
  this.origin=this.destination;
  this.arrival={city:this.origin,expected,correct};
  this.trace.push({city:this.origin.id,expected:expected.id,correct});
  this.phase='arrival';
  this.phaseLeft=correct&&this.round<PURSUIT.rounds?1.1:.85;
  if(correct){
   if(this.round===PURSUIT.rounds)this.captured=true;
   const id=awardClue(this,this.round);
   if(id)this.onEvent({type:'card',id,x:195,y:640});
  }else if(this.mistakes>mistakeAllowance)this.captured=false;
  this.onEvent({type:'pursuitArrival',correct,captured:this.captured});
 }
 continueAfterArrival(){
  if(this.captured!==null){this.finish();return;}
  if(this.arrival.correct){
   this.round++;this.beginRound();
   return;
  }
  this.choices=removePursuitPin(this.choices,this.arrival.city.id);
  this.selected=-1;
  this.retryNotice=this.arrival;
  this.arrival=null;
  this.departure=null;
  this.destination=null;
  this.phase='choosing';
  this.phaseLeft=0;
 }
 update(dt){
  if(this.ended||!Number.isFinite(dt)||dt<=0)return;
  let left=dt;
  while(left>1e-8&&!this.ended){
   if(this.phase==='choosing'){this.elapsed+=left;break;}
   const step=Math.min(left,this.phaseLeft);
   this.elapsed+=step;this.phaseLeft=Math.max(0,this.phaseLeft-step);left-=step;
   if(this.phaseLeft>1e-8)continue;
   if(this.phase==='flying')this.land();
   else this.continueAfterArrival();
  }
 }
 finish(){
  if(this.ended)return;
  this.ended=true;
  this.zoomedClue=0;
  this.phase='complete';
  this.onEvent({type:'end',survived:true,elapsed:this.elapsed,found:[...this.banked]});
 }
 restoreResult(record){
  const archivePlan=normalizePursuitRunPlan(record.runPlan,{allowRetired:true});
  if(archivePlan)this.runPlan=archivePlan;
  this.trace=(record.trace||[]).filter(s=>getPursuitCity(s.city)&&getPursuitCity(s.expected)).map(s=>({...s}));
  const last=this.trace.at(-1);
  if(last){
   this.origin=getPursuitCity(last.city);
   this.arrival={city:this.origin,expected:getPursuitCity(last.expected),correct:last.correct};
  }
  this.round=Math.min(PURSUIT.rounds,Math.max(1,record.round||this.trace.length));
  this.captured=record.captured??null;
  this.elapsed=Number.isFinite(record.elapsed)?Math.max(0,record.elapsed):0;
  this.flashes=record.flashes??PURSUIT.flashes;
  this.banked=new Set(normalizeClueRewards(record.clues));
  this.found=new Set(this.banked);
  this.clueSources=restoreSources(record);
  this.extraClue=false;
  this.zoomedClue=0;
  this.phase='complete';
  this.ended=true;
 }
}
