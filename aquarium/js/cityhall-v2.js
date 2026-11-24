import {AGENDAS,AGENDA_BY_ID,DEPARTMENTS,FACILITIES,WARDS} from './cityhall-agendas.js';
import {EXTRA_POLICIES,SPECIAL_CASES} from './cityhall-policies.js';
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
 '여섯 안건의 보고를 읽고, 대응 시점과 범위를 비교해 정책을 결재하세요.'
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
 const initial=shuffled(new Set(agendas.map(a=>a.policies[2].uses)),random).slice(0,2);
 return {initial,cases:agendas.map(a=>[a.id,Math.floor(random()*3),Math.floor(random()*arrangements.length)])};
}

export const CITY_DEMO_PLAN={
 initial:['parking','hall'],
 cases:[['market-flood',0,0],['school-crossing',1,6],['gym',1,15],['waste',0,11],['outer-service',1,4],['fair',1,9]]
};

export class CityHallGame{
 constructor({saved,plan,random=Math.random}={}){
  const data=saved?.rules===2?saved:null;
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
  const special=SPECIAL_CASES[id];
  return {agenda,variant,order,special:special?.variant===variant?special:null,wards:variant===2?agenda.wards.slice(0,1):agenda.wards};
 }
 get options(){
  const {agenda,variant,order,wards,special}=this.case,[project,response,adjust]=agenda.policies;
  const reuse=this.facilities.has(adjust.uses);
  // Outcome order follows the facts in the report: prepare ahead, act today,
  // or focus on the one affected site. Existing facilities change the tradeoff.
  const priority=special?.order||(variant===0?(reuse?[2,0,3,1]:[0,2,3,1]):
   variant===1?(reuse?[2,1,0,3]:[1,2,0,3]):
   agenda.id==='market-flood'&&!reuse?[1,3,2,0]:[2,1,3,0]);
  const [name,text,note]=EXTRA_POLICIES[agenda.id];
  const policies=[project,response,adjust,{name,text,note,kind:'extra'}];
  const local=WARDS[wards[0]],near=wards.map(w=>WARDS[w]).join('·'),facility=FACILITIES[adjust.uses];
  const timing=[
   '다음 회차부터 · 두 곳',
   special&&variant===2?'준비 뒤 · 오늘만':`오늘만 · ${response.both?'두 곳':'한 곳'}`,
   reuse?'오늘부터 · 기존 시설':'오늘부터 · 한 곳',
   special?`바로 · ${variant===1?'두 곳':'한 곳'}`:'보완 대책'
  ];
  return arrangements[order].map(id=>{
   const policy=policies[id],rank=priority.indexOf(id);
   const change=CITYHALL.changes[rank];
   let reason=special?.reason||policy.note;
   if(id===0){
    reason=variant===0
     ?(reuse?`${near}에 쓸 시설을 마련했어요. 이미 쓸 수 있는 시설이 있어 새로 준비하는 일이 더 들었어요.`:`문제가 시작되는 다음 회차에 맞춰 ${near} 두 곳에서 계속 쓸 시설을 마련했어요.`)
     :variant===1?`시설은 다음 회차에 열렸어요. 오늘 ${near}에서 생긴 불편에는 늦었어요.`:`${local}의 한 곳만 불편했는데 두 곳에서 공사를 진행해 불편이 늘었어요.`;
   }else if(id===1){
    if(variant===0)reason='오늘만 쓰는 임시 대책이었어요. 다음 회차에 문제가 시작될 때는 이미 철수했어요.';
    else if(special&&variant===1)reason='오늘 장터 쪽 대기 줄을 줄였어요. 두 행사에 각각 쓸 문을 열면 혼잡을 더 줄일 수 있었어요.';
    else if(special)reason=agenda.id==='parking-shortage'
     ?'새로 빌린 주차장을 준비하는 동안 시장 입구의 차량 대기가 이어졌어요.'
     :'임시 돌봄반을 새로 편성하는 동안 하교한 아이들이 계속 기다렸어요.';
    else if(agenda.id==='market-flood'&&rank===0)reason=variant===2
     ?'펌프로 장터 입구에 고인 물을 빼서 통행을 바로 회복했어요.'
     :'가장 먼저 물이 차던 장터 입구에서 펌프로 빗물을 뺐어요. 옆 골목으로 번지는 물도 줄었어요.';
    else if(variant===2)reason=`오늘 ${local}의 불편을 줄였어요. 한 곳의 운영을 조정하는 방법은 새 인력이나 장비를 투입하는 수고를 줄일 수 있었어요.`;
    else if(reuse)reason=response.both
     ?'두 곳에 오늘 바로 대응했어요. 기존 시설을 활용하면 이후에도 서비스를 이어 갈 수 있었어요.'
     :`${local} 현장부터 도왔어요. 기존 시설을 활용하면 다른 쪽도 함께 도울 수 있었어요.`;
    else reason=response.both?`오늘 기다리던 ${near} 두 곳에 바로 대응했어요.`:`가장 급했던 ${local}부터 오늘 바로 대응했어요.`;
   }else if(id===2){
    reason=special?(agenda.id==='calendar'?'시작 시간을 바꿨지만 이미 한 입구에 모인 줄은 남았어요.'
     :agenda.id==='aftercare'?'일부 학생의 돌봄 시간을 맞췄어요. 빈 교실을 바로 열면 하교 직후부터 아이들을 받을 수 있었어요.'
     :'주차 회전을 늘려 대기를 줄였어요. 바로 갈 수 있는 북쪽 주차장의 빈자리도 있었어요.')
     :reuse?(variant===2?`기존 시설(${facility})을 활용해 ${local}의 불편을 줄였어요.`:`기존 시설(${facility})을 활용해 ${near} 두 곳에 필요한 서비스를 이어 갔어요.`)
     :variant===2?(change>0?`${local} 한 곳의 운영만 바꿔 필요한 시간과 장소에 대응했어요.`:'장터 이용 시간을 바꿨지만 입구에 고인 물은 빠지지 않았어요.')
     :`${local} 쪽 운영을 조정해 불편을 줄였어요. 다른 동네까지 대응할 시설은 아직 없었어요.`;
   }else if(agenda.id==='market-flood'&&variant===2){
    reason=change>0?'물막이로 가게에 번지는 물을 줄였어요. 입구에 이미 고인 물을 빼는 데는 펌프가 더 효과적이었어요.':'입구 일부는 가렸어요. 정비된 배수로를 활용하면 고인 물이 더 빨리 빠질 수 있었어요.';
   }else if(agenda.id==='market-flood'&&variant===0){
    reason='장터 가게 앞에 물막이를 뒀어요. 이틀 동안 비가 이어지면서 주택가의 빗물은 그대로 남았어요.';
   }else if(agenda.id==='calendar'&&variant===2){
    reason='출입구는 두 곳으로 나뉘었어요. 같은 시간대에 겹친 장터 공연 일정은 그대로였어요.';
   }
   return {id,name:policy.name,text:id===2&&reuse?adjust.reuse:policy.text,builds:policy.builds,
    timing:timing[id],change,reason};
  });
 }
 get reports(){
  const {agenda,variant,special}=this.case,facility=agenda.policies[2].uses;
  const rows=[{from:DEPARTMENTS[agenda.dept],text:agenda.reports[variant]},
   {from:variant===0?'전망':'현장',text:agenda.field[variant]}];
  if(special)rows.push({from:'확인',text:special.fact});
  else if(this.facilities.has(facility))rows.push({from:'시설',text:`오늘과 다음 회차에 쓸 수 있는 시설은 ${FACILITIES[facility]}입니다.`});
  return rows;
 }
 get advice(){
  if(this.adviceTurn!==this.turn||this.phase!=='report')return '';
  const {agenda,variant,special}=this.case,facility=agenda.policies[2].uses;
  if(special)return special.advice;
  if(this.facilities.has(facility))return FACILITIES[facility]+'를 이미 쓸 수 있습니다. 새로 짓거나 잠깐 빌리는 대책과 비교해 보세요.';
  if(variant===0)return '문제가 시작되는 회차와 대책이 끝나는 때를 비교하세요. 오늘만 운영하는 대책은 다음 회차까지 이어지지 않습니다.';
  if(variant===1)return '오늘 생긴 불편입니다. 다음 회차 공사보다 현장에 바로 도착할 인력이나 장비가 도움이 됩니다.';
  if(agenda.id==='market-flood')return '짧은 비로 한 곳에 물이 고였습니다. 이용 시간을 바꾸는 대책과 물을 실제로 빼는 대책을 비교하세요.';
  return '한 곳만 영향을 받습니다. 대규모 시설을 새로 만드는 것보다 필요한 장소나 시간에 맞춰 운영해 보세요.';
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
  return this.selectPolicy(ids[i<0?(step>0?0:3):(i+Math.sign(step)+ids.length)%ids.length]);
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
  return {rules:2,plan:this.plan,choices:[...this.choices],phase:this.phase,introPage:this.introPage,deskOpened:this.deskOpened,adviceTurn:this.adviceTurn};
 }
 choose(id){
  if(this.phase!=='report')return false;
  const policy=this.options.find(p=>p.id===id);if(!policy)return false;
  const before=this.approval;
  this.approval+=policy.change;this.choices.push(id);
  if(policy.builds&&policy.change>0)this.facilities.add(policy.builds);
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
