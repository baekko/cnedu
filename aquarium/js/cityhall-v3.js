import {AGENDAS,AGENDA_BY_ID,DEPARTMENTS,FACILITIES,WARDS} from './cityhall-cases.js';
import {CityHallGame as CityHallV2Game} from './cityhall-v2.js';
import {awardClue} from './clue-order.js';

export const CITYHALL=Object.freeze({
 rounds:6,start:50,firstClue:52,step:3,maxClues:9,goal:76,changes:[8,4,-1,-3],classification:359,
 answer:'도장',hints:['결재할 때 종이에 표시를 남기는 물건이에요.','인주를 묻히고 종이에 꾹 눌러 찍어요. 이름은 두 글자예요.']
});
export const CITY_ROOM=Object.freeze({mayorX:195,mayorY:193,seatSeconds:.72,staffSeconds:1.32,stampSeconds:.48});
export const CITY_CLUE_THRESHOLDS=Object.freeze(Array.from({length:CITYHALL.maxClues},(_,i)=>CITYHALL.firstClue+i*CITYHALL.step));
export const CITY_CLUE_RULE=`${CITYHALL.firstClue}%에서 단서 1장, 이후 ${CITYHALL.step}%p마다 1장씩 늘어요. ${CITYHALL.goal}%에서 ${CITYHALL.maxClues}장을 얻어요.`;
export const CITY_DIALOGUE=[
 '시장님, 당선을 축하드립니다. 시민들께서 시장님의 첫 결재를 기다리고 계십니다.',
 '여섯 안건의 보고를 읽고, 현장 상황과 정책을 비교해 정책을 결재하세요.'
];
const types=Object.keys(DEPARTMENTS);
const arrangements=[];
for(const a of [0,1,2,3])for(const b of [0,1,2,3])for(const c of [0,1,2,3]){
 if(a!==b&&a!==c&&b!==c)arrangements.push([a,b,c,6-a-b-c]);
}
const pick=(list,random)=>list[Math.floor(random()*list.length)];
function shuffled(list,random){
 const out=[...list];
 for(let i=out.length-1;i>0;i--){
  const j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]];
 }
 return out;
}

export function cityClueCount(approval){
 return Math.max(0,Math.min(CITYHALL.maxClues,1+Math.floor((approval-CITYHALL.firstClue)/CITYHALL.step)));
}
export function normalizeCityPlan(plan){
 if(!Array.isArray(plan?.initial)||!Array.isArray(plan.cases)||plan.cases.length!==CITYHALL.rounds)return null;
 const departments=new Set(),cases=[];
 for(const entry of plan.cases){
  if(!Array.isArray(entry))return null;
  const [id,variant,order]=entry,agenda=AGENDA_BY_ID.get(id);
  if(!agenda||departments.has(agenda.dept)||!Number.isInteger(variant)||variant<0||variant>2||!Number.isInteger(order)||!arrangements[order])return null;
  departments.add(agenda.dept);cases.push([id,variant,order]);
 }
 const initial=[...new Set(plan.initial)].filter(id=>Object.hasOwn(FACILITIES,id)).slice(0,3);
 return {initial,cases};
}
export function dealCityPlan(random=Math.random){
 const agendas=shuffled(types,random).map(dept=>pick(AGENDAS.filter(a=>a.dept===dept),random));
 const initial=[];
 return {initial,cases:agendas.map(a=>[a.id,Math.floor(random()*3),Math.floor(random()*arrangements.length)])};
}

export const CITY_DEMO_PLAN={
 initial:['parking','hall'],
 cases:[['market-flood',0,0],['school-crossing',1,6],['gym',1,15],['waste',0,11],['outer-service',1,4],['fair',1,9]]
};

export class CityHallGame{
 constructor({saved,plan,random=Math.random}={}){
  if(saved?.rules===2)return new CityHallV2Game({saved});
  const data=saved?.rules===3?saved:null;
  this.plan=normalizeCityPlan(data?.plan)||normalizeCityPlan(plan)||dealCityPlan(random);
  this.turn=0;this.phase='report';this.approval=CITYHALL.start;
  this.facilities=new Set(this.plan.initial);this.choices=[];this.history=[];this.review=null;
  this.banked=new Set();this.found=new Set();this.clueSources=new Set();this.ended=false;this.elapsed=0;
  this.introPage=data?.introPage===1?1:0;
  this.deskOpened=data?.deskOpened===true||!!data?.choices?.length;
  this.introAge=this.deskOpened||this.introPage?this.arrivalSeconds:0;
  this.selectedPolicy=null;this.stampAge=CITY_ROOM.stampSeconds;
  this.adviceTurn=null;
  if(Array.isArray(data?.choices)){
   for(const id of data.choices.slice(0,CITYHALL.rounds)){
    if(this.phase==='review')this.next();
    if(!this.choose(id))break;
   }
   if(this.phase==='review'&&data.phase==='report'&&this.choices.length<CITYHALL.rounds)this.next();
   if(this.phase==='review'&&data.phase==='complete'&&this.choices.length===CITYHALL.rounds)this.next();
   if(this.deskOpened&&Number.isInteger(data.adviceTurn)&&data.adviceTurn>=0&&data.adviceTurn<=this.turn)this.adviceTurn=data.adviceTurn;
  }
 }
 get round(){return this.turn+1;}
 get arrivalSeconds(){return CITY_ROOM.seatSeconds+CITY_ROOM.staffSeconds;}
 get staffArrived(){return this.introAge>=this.arrivalSeconds;}
 get canGoBack(){return !this.deskOpened&&this.staffArrived&&this.introPage>0;}
 get stamping(){return this.stampAge<CITY_ROOM.stampSeconds;}
 get flashes(){return this.adviceTurn===null?1:0;}
 get canAsk(){return this.deskOpened&&this.phase==='report'&&this.flashes>0;}
 get clueCount(){return cityClueCount(this.approval);}
 get actionLabel(){
  if(!this.deskOpened)return this.introPage===0?'다음':'보고';
  return this.phase==='report'?'결재':this.round===CITYHALL.rounds?'결과':'다음';
 }
 get actionReady(){
  return !this.ended&&!this.stamping&&(this.deskOpened?this.phase==='review'||this.selectedPolicy!==null:this.staffArrived);
 }
 get case(){
  const [id,variant,order]=this.plan.cases[this.turn],agenda=AGENDA_BY_ID.get(id);
  return {agenda,variant,order,scenario:agenda.scenarios[variant]};
 }
 get options(){
  const {agenda,order,scenario}=this.case;
  return arrangements[order].map(id=>{
   const rank=scenario.order.indexOf(id);
   return {...agenda.policies[id],id,change:CITYHALL.changes[rank],reason:scenario.reasons[rank]};
  });
 }
 get reports(){
  const {agenda,scenario}=this.case;
  return [{from:DEPARTMENTS[agenda.dept],text:scenario.report},{from:'현장 확인',text:scenario.fact}];
 }
 get advice(){
  if(this.adviceTurn!==this.turn||this.phase!=='report')return '';
  const {agenda,scenario}=this.case;
  return `“${agenda.policies[scenario.order[0]].name}”을 권합니다. ${scenario.fact}`;
 }
 flash(){
  if(!this.canAsk)return false;
  this.adviceTurn=this.turn;return true;
 }
 previous(){
  if(!this.canGoBack)return false;
  this.introPage--;return true;
 }
 selectPolicy(id){
  if(!this.deskOpened||this.phase!=='report'||!Number.isInteger(id)||id<0||id>3)return false;
  this.selectedPolicy=id;return true;
 }
 selectByOffset(step){
  if(!this.deskOpened||this.phase!=='report'||!step)return false;
  const ids=arrangements[this.case.order],i=ids.indexOf(this.selectedPolicy);
  return this.selectPolicy(ids[i<0?(step>0?0:3):(i+step+ids.length)%ids.length]);
 }
 act(){
  if(!this.actionReady)return false;
  if(!this.deskOpened){
   if(this.introPage<CITY_DIALOGUE.length-1)this.introPage++;
   else this.deskOpened=true;
   return true;
  }
  if(this.phase==='review')return this.next();
  if(!this.choose(this.selectedPolicy))return false;
  this.selectedPolicy=null;this.stampAge=0;return true;
 }
 update(dt){
  const seconds=Math.max(0,dt);
  this.introAge=Math.min(this.arrivalSeconds,this.introAge+seconds);
  this.stampAge=Math.min(CITY_ROOM.stampSeconds,this.stampAge+seconds);
 }
 snapshot(){
  return {rules:3,plan:this.plan,choices:[...this.choices],phase:this.phase,introPage:this.introPage,deskOpened:this.deskOpened,adviceTurn:this.adviceTurn};
 }
 choose(id){
  if(this.phase!=='report')return false;
  const policy=this.options.find(p=>p.id===id);if(!policy)return false;
  const before=this.approval;
  this.approval+=policy.change;this.choices.push(id);
  this.review={round:this.round,title:this.case.agenda.title,policy:policy.name,reason:policy.reason,before,after:this.approval};
  this.history.push(this.review);this.phase='review';return true;
 }
 next(){
  if(this.phase!=='review')return false;
  if(this.round===CITYHALL.rounds){
   for(let i=1;i<=this.clueCount;i++)awardClue(this,i);
   this.phase='complete';this.ended=true;return true;
  }
  this.turn++;this.phase='report';return true;
 }
}
