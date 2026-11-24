// Preserves the score and earned clue cards of completed three-policy saves.
import {AGENDA_BY_ID,FACILITIES,WARDS} from './cityhall-agendas.js';
import {CITY_PLANS} from './cityhall-plans.js';
import {awardClue} from './clue-order.js';

export const CITYHALL=Object.freeze({
 rounds:6,budget:10,start:50,firstClue:52,step:3,maxClues:9,classification:359,
 answer:'도장',hints:['결재할 때 종이에 표시를 남기는 물건이에요.','인주를 묻히고 종이에 꾹 눌러 찍어요. 이름은 두 글자예요.']
});
const wardKeys=Object.keys(WARDS);
const cap=n=>Math.max(0,Math.min(100,n));
const orders=[[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];

export function cityClueCount(approval){
 return Math.max(0,Math.min(CITYHALL.maxClues,1+Math.floor((approval-CITYHALL.firstClue)/CITYHALL.step)));
}
export function normalizeCityPlan(plan){
 if(!Array.isArray(plan?.initial)||!Array.isArray(plan.cases)||plan.cases.length!==CITYHALL.rounds)return null;
 const ids=new Set();
 const cases=[];
 for(const entry of plan.cases){
  if(!Array.isArray(entry))return null;
  const [id,variant,order]=entry;
  if(!AGENDA_BY_ID.has(id)||ids.has(id)||!Number.isInteger(variant)||variant<0||variant>2||!Number.isInteger(order)||!orders[order])return null;
  if(cases.length===CITYHALL.rounds-1&&variant===0)return null;
  ids.add(id);cases.push([id,variant,order]);
 }
 const initial=[...new Set(plan.initial)].filter(id=>Object.hasOwn(FACILITIES,id)).slice(0,3);
 return {initial,cases};
}

export const CITY_DEMO_PLAN={
 initial:['parking','hall'],
 cases:[['market-flood',0,0],['school-crossing',1,1],['gym',1,5],['waste',0,2],['heat',1,4],['library-seats',1,3]]
};

export class CityHallGame{
 constructor({saved,plan,random=Math.random}={}){
  this.plan=normalizeCityPlan(saved?.plan)||normalizeCityPlan(plan)||
   CITY_PLANS[Math.floor(random()*CITY_PLANS.length)]||CITY_DEMO_PLAN;
  this.turn=0;this.phase='report';this.budget=CITYHALL.budget;
  this.scores=Object.fromEntries(wardKeys.map(id=>[id,CITYHALL.start]));
  this.facilities=new Set(this.plan.initial);this.projects=[];this.events=[];this.expirations=[];
  this.protected={};this.choices=[];this.history=[];this.followUp=[];this.review=null;
  this.banked=new Set();this.found=new Set();this.clueSources=new Set();this.ended=false;this.elapsed=0;
  this.deskOpened=saved?.deskOpened===true||!!saved?.choices?.length;
  if(Array.isArray(saved?.choices)){
   for(const id of saved.choices.slice(0,CITYHALL.rounds)){
    if(this.phase==='review')this.next();
    if(!this.choose(id))break;
   }
   if(this.phase==='review'&&saved.phase==='report'&&this.choices.length<CITYHALL.rounds)this.next();
   if(this.phase==='review'&&saved.phase==='complete'&&this.choices.length===CITYHALL.rounds)this.next();
  }
 }
 get round(){return this.turn+1;}
 get wardApproval(){return Object.fromEntries(wardKeys.map(id=>[id,cap(this.scores[id])]));}
 get approval(){return Math.round(wardKeys.reduce((sum,id)=>sum+cap(this.scores[id]),0)/wardKeys.length);}
 get case(){
  const [id,variant,order]=this.plan.cases[this.turn];
  const agenda=AGENDA_BY_ID.get(id);
  const later=variant===0;
  const wards=variant===2?agenda.wards.slice(0,1):agenda.wards;
  return {agenda,variant,order,wards,later,due:this.turn+(later?1:0),severity:variant===2?6:9};
 }
 get options(){
  const {agenda,variant,order,wards,later,severity}=this.case;
  return orders[order].map(id=>{
   const action=agenda.policies[id];
   const reuse=action.kind==='adjust'&&this.facilities.has(action.uses);
   const scoped=action.kind==='project'||action.both||reuse?wards:wards.slice(0,1);
   const amount=action.kind==='adjust'&&!reuse?3:action.kind==='response'&&action.both?6:severity;
   const temporary=action.kind==='response'&&later;
   const completeAfter=this.turn+action.delay>=CITYHALL.rounds;
   const covers=agenda.id==='market-flood'&&action.kind==='adjust'&&!reuse?[]:scoped;
   const name=action.builds&&this.facilities.has(action.builds)?FACILITIES[action.builds]+' 보강':action.name;
   return {...action,name,id,reuse,scoped,covers,amount,temporary,completeAfter,
    affordable:this.budget>=action.cost,
    text:variant===2&&(action.kind==='project'||action.both||reuse)
     ?`${WARDS[wards[0]]}에 ${reuse?FACILITIES[action.uses]+' 시설을 활용해':'범위를 좁혀'} 시행해요.`
     :reuse?action.reuse:action.text};
  });
 }
 get actionLabel(){return '결과';}
 snapshot(){return {plan:this.plan,choices:[...this.choices],phase:this.phase,...(this.deskOpened?{deskOpened:true}:{})};}

 change(ward,points,reason,log){
  this.scores[ward]+=points;
  log.push({ward,points,reason});
 }
 deliver(policy,caseTurn,log){
  for(const ward of policy.scoped)this.change(ward,policy.amount,policy.name+(policy.kind==='project'?' 완공':' 시행'),log);
  this.protected[caseTurn]=policy.covers;
  if(policy.builds)this.facilities.add(policy.builds);
  if(policy.temporary)this.expirations.push({
   due:caseTurn+1,caseTurn,wards:policy.scoped,points:policy.amount,reason:policy.name+' 종료'
  });
 }
 resolveEvents(log){
  for(const event of this.events.filter(e=>e.due===this.turn)){
   const safe=this.protected[event.caseTurn]||[];
   for(const ward of event.wards){
    const flooding=event.caseId==='market-flood';
    if(safe.includes(ward))log.push({ward,points:0,reason:event.title+(flooding?' · 침수를 막았어요':' · 문제를 해소했어요')});
    else this.change(ward,-event.penalty,event.title+(flooding?' · 빗물 피해':' · 불편이 남았어요'),log);
   }
  }
  this.events=this.events.filter(e=>e.due>this.turn);
 }
 choose(id){
  if(this.phase!=='report')return false;
  const policy=this.options.find(a=>a.id===id);
  if(!policy?.affordable)return false;
  const situation=this.case,log=[],before=this.approval;
  this.budget-=policy.cost;this.choices.push(id);
  this.events.push({caseTurn:this.turn,caseId:situation.agenda.id,due:situation.due,wards:situation.wards,penalty:situation.variant===2?3:6,title:situation.agenda.title});
  if(policy.delay){
   this.projects.push({policy,caseTurn:this.turn,due:this.turn+policy.delay});
   const ward=situation.wards[0];
   this.change(ward,-3,policy.name+' · 공사 중 불편',log);
   this.expirations.push({due:this.turn+policy.delay,wards:[ward],points:-3,reason:policy.name+' · 공사 불편 해소'});
  }else this.deliver(policy,this.turn,log);
  this.resolveEvents(log);
  this.review={round:this.round,title:situation.agenda.title,policy:policy.name,cost:policy.cost,
   pending:policy.delay?this.round+policy.delay:null,later:situation.later,before,after:this.approval,log};
  this.history.push(this.review);this.phase='review';return true;
 }
 next(){
  if(this.phase!=='review')return false;
  if(this.round===CITYHALL.rounds){
   for(let i=1;i<=cityClueCount(this.approval);i++)awardClue(this,i);
   this.phase='complete';this.ended=true;return true;
  }
  this.turn++;
  const log=[],before=this.approval;
  for(const end of this.expirations.filter(e=>e.due===this.turn)){
   for(const ward of end.wards)this.change(ward,-end.points,end.reason,log);
   if(end.caseTurn!==undefined)delete this.protected[end.caseTurn];
  }
  this.expirations=this.expirations.filter(e=>e.due>this.turn);
  for(const work of this.projects.filter(p=>p.due===this.turn))this.deliver(work.policy,work.caseTurn,log);
  this.projects=this.projects.filter(p=>p.due>this.turn);
  this.resolveEvents(log);
  this.followUp=log;
  if(log.length)this.review.followUp={before,after:this.approval,log};
  this.phase='report';return true;
 }
}
