import {movedDuringStep} from './walk-cycle.js';
import{FieldGame,clamp}from'./field-base.js';
import{samplePool,validPlan}from'./random-pool.js';
import{DATA_ROUTE_PLANS}from'./work-plans.js';
export const DATACENTER=Object.freeze({duration:100,flashes:2,answer:'서버',hints:['많은 자료를 저장하고 다른 컴퓨터로 보내는 장치예요.','데이터센터 안에 줄지어 서 있는 컴퓨터예요.']});
export const DATA_RECEIVERS=Object.freeze([{x:102.5,y:134,name:'청록 서버',color:'#5cb5b5'},{x:197.5,y:134,name:'금빛 서버',color:'#dfb45b'},{x:292.5,y:134,name:'보라 서버',color:'#a891c2'}].map(Object.freeze));
export const DATA_NODES=Object.freeze({source:{x:195,y:422},fork:{x:195,y:330},left:{x:85,y:264},right:{x:305,y:264},...Object.fromEntries(DATA_RECEIVERS.map((r,i)=>['out'+i,{x:r.x,y:r.y}]))});
export const DATA_FILES=Object.freeze([
 {id:0,name:'지도 기록',targets:[0],symbol:'map'}, {id:1,name:'관측 기록',targets:[1],symbol:'star'}, {id:2,name:'소리 기록',targets:[2],symbol:'sound'},
 {id:3,name:'지도 사본',targets:[0,2],symbol:'map'}, {id:4,name:'관측 사본',targets:[1],symbol:'star'}, {id:5,name:'소리 사본',targets:[2,1],symbol:'sound'},
 {id:6,name:'지도 묶음',targets:[0,1],symbol:'map'}, {id:7,name:'관측 묶음',targets:[1,2],symbol:'star'}, {id:8,name:'소리 묶음',targets:[2,0],symbol:'sound'}
].map(s=>Object.freeze({...s,targets:Object.freeze(s.targets)})));
const recordGroups={map:['지도 기록','지도 사본','지도 묶음','해안 지도','산길 지도','철도 지도','도시 지도','항해 지도','옛길 지도'],star:['관측 기록','관측 사본','관측 묶음','달 관측지','행성 관측지','유성 관측지','은하 관측지','혜성 관측지','별자리 관측지'],sound:['소리 기록','소리 사본','소리 묶음','새소리 기록','파도 소리','숲속 소리','악기 소리','빗소리 기록','종소리 기록']};
export const DATA_RECORDS=Object.freeze(Object.entries(recordGroups).flatMap(([symbol,names])=>names.map(name=>({name,symbol}))));
const routes=[[0],[1],[2],[0,1],[0,2],[1,0],[1,2],[2,0],[2,1]];
export const DATA_FILE_POOL=Object.freeze(DATA_RECORDS.flatMap((record,contentId)=>routes.map(targets=>Object.freeze({...record,contentId,targets:Object.freeze(targets)}))));
export function makeDataPlan(random=Math.random){
 const records=samplePool(DATA_RECORDS.map((_,i)=>i),9,random),plan=DATA_ROUTE_PLANS[Math.min(DATA_ROUTE_PLANS.length-1,Math.floor(random()*DATA_ROUTE_PLANS.length))];
 return records.map((id,i)=>id*9+plan[i]);
}
export const DATA_TUTORIAL_PLAN=Object.freeze(DATA_FILES.map(f=>DATA_FILE_POOL.findIndex(p=>p.name===f.name&&p.targets.join()===f.targets.join())));
export const DATA_VIRUSES=Object.freeze([{edge:['left','out0'],offset:2.8},{edge:['right','out2'],offset:8.2},{edge:['left','out1'],offset:13.2},{edge:['right','out1'],offset:17.4}].map(Object.freeze));
export function dataVirusPose(v,time){
 const phase=((time-v.offset)%22+22)%22,warning=phase>=0&&phase<2.6,active=phase>=2.6&&phase<5.8,u=clamp((phase-2.6)/3.2,0,1),a=DATA_NODES[v.edge[1]],b=DATA_NODES[v.edge[0]];
 return {warning,active,x:a.x+(b.x-a.x)*u,y:a.y+(b.y-a.y)*u,phase};
}
const nextNode=(g,node)=>node==='source'?'fork':node==='fork'?(g.levers[0].state?'right':'left'):node==='left'?(g.levers[1].state?'out1':'out0'):node==='right'?(g.levers[2].state?'out2':'out1'):null;
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export class DataCenterGame extends FieldGame{
 constructor({onEvent=()=>{},random=Math.random,runPlan,tutorial=false}={}){
  super(DATACENTER.duration,onEvent);this.flashes=DATACENTER.flashes;this.speed=155;this.player.y=450;
  this.runPlan=validPlan(runPlan,DATA_FILE_POOL)&&runPlan.every((id,i)=>DATA_FILE_POOL[id].targets.length===DATA_FILES[i].targets.length)?[...runPlan]:tutorial?[...DATA_TUTORIAL_PLAN]:makeDataPlan(random);
  this.files=this.runPlan.map((index,id)=>({...DATA_FILE_POOL[index],id,received:[],retryUntil:0}));this.selected=0;this.packets=[];this.work=null;this.workAge=99;this.packetSerial=0;this.failures=0;this.clearedEdges=new Set();
  this.levers=['fork','left','right'].map((node,id)=>({id,node,...DATA_NODES[node],state:random()<.5?0:1}));
 }
 get file(){return this.files[this.selected];}
 get connectedServer(){const side=this.levers[0].state;return side?(this.levers[2].state?2:1):(this.levers[1].state?1:0);}
 get nearbyLever(){return this.levers.filter(l=>dist({x:l.x,y:l.y+24},this.player)<43).sort((a,b)=>dist(a,this.player)-dist(b,this.player))[0]||null;}
 get atSource(){return dist(this.player,{x:195,y:445})<48;}
 get outstanding(){return this.packets.length;}
 get canAct(){return !this.ended&&!this.work&&(!!this.nearbyLever||this.atSource&&this.canSend);}
 get canSend(){return !this.clueSources.has(this.selected)&&this.file.retryUntil<=this.elapsed&&!this.packets.some(p=>p.file===this.selected)&&this.packets.length+this.file.targets.length-this.file.received.length<=2;}
 get actionLabel(){return this.work?'조작 중':this.nearbyLever?'레버':this.atSource?'전송':'조작';}
 get connectedRoute(){const side=this.levers[0].state?'right':'left';return [['source','fork'],['fork',side],[side,'out'+this.connectedServer]];}
 isVirusCleared(v){return this.clearedEdges.has(v.edge.join(':'));}
 get canCleanVirus(){return !this.ended&&this.flashes>0&&this.connectedRoute.some(edge=>DATA_VIRUSES.some(v=>v.edge.join(':')===edge.join(':')&&!this.isVirusCleared(v)));}
 get itemKind(){return'virusClear';}get itemLabel(){return'바이러스 제거';}get itemTip(){return'현재 연결된 경로의 바이러스를 없애요 · 2회';}
 get statusDescription(){return this.file.name+' · '+this.file.received.length+'/'+this.file.targets.length+' 도착 · 전송 중 '+this.packets.length;}
 get prompt(){
  if(this.messageLeft>0)return this.message;if(this.work)return'손잡이를 바꿔 데이터의 다음 길을 정해요';
  if(this.nearbyLever)return'레버 앞에서 조작 · 데이터가 분기점에 닿기 전에 바꿔요';
  if(this.atSource)return this.canSend?'전송을 누르면 위에 표시된 자료가 출발해요':this.packets.length?'같은 색 서버로 보내세요 · 레버로 길을 바꿔요':'잠시 뒤 빠진 데이터만 다시 전송해요';
  return this.packets.length?'데이터보다 앞서 다음 분기를 준비해요':'아래 전송 단말기로 이동해요';
 }
 goRoom(){return false;}
 queueMove(input){if(!this.ended)this.queuedMove={x:input.x||0,y:input.y||0,left:.08};}
 move(dt,input={}){
  const p=this.player;p.moving=false;if(this.work)return;
  let x=input.x||0,y=input.y||0;if(this.queuedMove){if(!x&&!y)({x,y}=this.queuedMove);this.queuedMove.left-=dt;if(this.queuedMove.left<=0)this.queuedMove=null;}
  const n=Math.hypot(x,y)||1;if(n>1){x/=n;y/=n;}const ox=p.x,oy=p.y;p.x=clamp(p.x+x*this.speed*dt,25,365);p.y=clamp(p.y+y*this.speed*dt,205,466);
  p.moving=movedDuringStep(p.x-ox,p.y-oy,dt);if(p.moving){p.walk+=dt;p.dir=Math.abs(x)>Math.abs(y)?x<0?'left':'right':y<0?'up':'down';}
 }
 send(){
  if(!this.atSource||!this.canSend)return false;const f=this.file;
  let queued=0;f.targets.forEach((target,piece)=>{if(f.received.includes(piece))return;this.packets.push({id:this.packetSerial++,file:f.id,piece,target,from:'source',to:'fork',distance:0,wait:queued++*2.8,speed:84,x:195,y:422});});
  this.say(f.targets.length===2?'두 데이터의 목적지를 각각 확인해요':'색이 같은 서버까지 길을 연결해요',1.8);this.onEvent({type:'dataSend',id:f.id});return true;
 }
 beginAction(){
  if(!this.canAct)return false;const l=this.nearbyLever;if(!l)return this.send();
  this.work={lever:l.id,from:{x:this.player.x,y:this.player.y},...(this.leverContact?.(l)||{x:l.x,y:l.y+4}),flipped:false};this.workAge=0;this.player.moving=false;this.player.dir='up';return true;
 }
 act(){return this.beginAction();}releaseAction(){}cancelAction(){}
 flash(){if(!this.canCleanVirus)return false;const route=this.connectedRoute;this.flashes--;for(const edge of route)this.clearedEdges.add(edge.join(':'));this.effects.push({type:'dataCleanse',route,age:0});this.onEvent({type:'dataCleanse'});this.say('현재 경로의 바이러스를 제거했어요 · 이 길은 계속 안전해요');return true;}
 failPacket(p,why){const f=this.files[p.file];f.retryUntil=this.elapsed+1.4;this.failures++;p.dead=true;this.say(why+' · 빠진 데이터만 다시 전송해요',1.5);this.effects.push({type:'dataFail',x:p.x,y:p.y,age:0});this.onEvent({type:'dataFail',id:p.file});}
 arrive(p){
  const actual=Number(p.to.slice(3));if(actual!==p.target){this.failPacket(p,'목적지가 다른 서버예요');return;}
  const f=this.files[p.file];if(!f.received.includes(p.piece))f.received.push(p.piece);p.dead=true;this.onEvent({type:'dataArrive',id:p.file,piece:p.piece});
  if(f.received.length===f.targets.length&&!this.clueSources.has(f.id)){
   this.award(f.id,DATA_RECEIVERS[actual].x,DATA_RECEIVERS[actual].y);
   if(!this.ended)this.selected=Math.min(8,f.id+1);
   this.say(f.name+' 완료'+(!this.ended?' · 다음 자료가 준비됐어요':''),1.2);
  }
 }
 tick(dt){
  this.workAge+=dt;
  if(this.work){const w=this.work,u=clamp(this.workAge/.16,0,1);this.player.x=w.from.x+(w.x-w.from.x)*u;this.player.y=w.from.y+(w.y-w.from.y)*u;
   if(this.workAge>=.22&&!w.flipped){w.flipped=true;this.levers[w.lever].state^=1;this.onEvent({type:'dataLever',id:w.lever,state:this.levers[w.lever].state});}if(this.workAge>=.46)this.work=null;
  }
  for(const p of this.packets){
   if(p.dead)continue;if(p.wait>0){p.wait=Math.max(0,p.wait-dt);continue;}
   const a=DATA_NODES[p.from],b=DATA_NODES[p.to],len=dist(a,b);p.distance+=p.speed*dt;const u=clamp(p.distance/len,0,1);p.x=a.x+(b.x-a.x)*u;p.y=a.y+(b.y-a.y)*u;
   for(const v of DATA_VIRUSES){if(this.isVirusCleared(v))continue;const q=dataVirusPose(v,this.elapsed);if(q.active&&v.edge[0]===p.from&&v.edge[1]===p.to&&dist(p,q)<16){this.failPacket(p,'바이러스에 데이터가 손상됐어요');break;}}
   if(p.dead)continue;if(p.distance>=len){if(p.to.startsWith('out'))this.arrive(p);else{p.from=p.to;p.to=nextNode(this,p.from);p.distance=0;}}
  }
  this.packets=this.packets.filter(p=>!p.dead);
 }
 restoreResult(rec){super.restoreResult(rec);for(const f of this.files)if(this.clueSources.has(f.id))f.received=f.targets.map((_,i)=>i);this.packets=[];}
}
