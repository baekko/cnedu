import {movedDuringStep} from './walk-cycle.js';
import {createFinishing,advanceFinishing,finishInput} from './dessert-finishing.js';
import {awardClue} from './clue-order.js';

export const DESSERT=Object.freeze({duration:85,speed:166,flashes:3,pauseSeconds:4,packSeconds:.55,answer:'마카롱',hints:['아몬드가루로 만든 동그란 과자 두 장 사이에 크림을 넣어요.','이 디저트의 이름은 마로 시작하는 세 글자예요.']});
export const PASTRIES=Object.freeze([
 Object.freeze({id:'cookie',name:'쿠키',bake:6,window:8,color:'#cb9765'}),
 Object.freeze({id:'muffin',name:'머핀',bake:9,window:9,color:'#82a99a'}),
 Object.freeze({id:'tart',name:'타르트',bake:12,window:10,color:'#c88e91'})
]);
export const WORKSHOP=Object.freeze({ovens:Object.freeze([74,195,316]),ovenY:205,serviceY:229,bounds:Object.freeze({left:25,right:365,top:215,bottom:453})});
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export class DessertGame{
 constructor({onEvent=()=>{}}={}){
  this.onEvent=onEvent;this.elapsed=0;this.ended=false;this.phase='baking';this.health=1;this.flashes=DESSERT.flashes;this.freezeLeft=0;
  this.player={x:195,y:320,dir:'up',moving:false,walk:0,hammerAge:99};
  this.ovens=WORKSHOP.ovens.map((x,id)=>({id,x,y:WORKSHOP.ovenY,kind:PASTRIES[id].id,status:'baking',age:0,doorAge:99}));
  this.delivered={cookie:0,muffin:0,tart:0};this.banked=new Set();this.found=new Set();this.clueSources=new Set();this.packages=[];this.effects=[];
  this.finishing=null;this.motion=null;this.actionWait=0;this.note='';this.noteLeft=0;this.burned=0;this.finishLeft=null;
 }
 needs(kind){return Math.max(0,3-(this.delivered[kind]||0));}
 get handLabel(){const t=this.target;return t?PASTRIES[t.id].name:'오븐 앞으로';}
 get remaining(){return Math.max(0,DESSERT.duration-this.elapsed);}
 get canMove(){return !this.ended&&this.finishLeft===null&&!this.motion&&!this.finishing;}
 get canAct(){return this.canMove&&this.actionWait<=0;}
 get canFreeze(){return !this.ended&&this.finishLeft===null&&this.flashes>0&&this.freezeLeft<=0&&this.ovens.some(o=>['baking','ready'].includes(o.status));}
 get target(){
  const p=this.player;return this.ovens.map(o=>({type:'oven',id:o.id,x:o.x,y:WORKSHOP.serviceY,d:Math.hypot(p.x-o.x,p.y-WORKSHOP.serviceY)})).filter(t=>t.d<=50).sort((a,b)=>a.d-b.d)[0]||null;
 }
 get actionLabel(){const o=this.target&&this.ovens[this.target.id];return o?.status==='done'?'완료':o?.status==='finishing'?'꾸미기':'꺼내기';}
 get prompt(){
  if(this.ended)return '';if(this.finishing)return '작업대에서 장식을 완성해요';if(this.noteLeft>0)return this.note;
  const o=this.target&&this.ovens[this.target.id];
  if(o?.status==='finishing')return '꾸미기를 눌러 남은 장식을 마무리해요';
  if(o?.status==='ready')return '지금 꺼내요! 초록 구간에서는 모두 성공이에요';
  if(o?.status==='baking')return PASTRIES[o.id].name+' 굽는 중 · 바늘이 초록 구간에 오면 꺼내요';
  if(o?.status==='burnt')return '새 반죽으로 자동 교체 중이에요';
  if(o?.status==='cooling')return '포장 완료! 다음 반죽을 준비하고 있어요';
  if(o?.status==='done')return PASTRIES[o.id].name+' 3상자 완료 · 다른 오븐으로 가요';
  return '초록불이 켜진 오븐 앞으로 가서 꺼내요';
 }
 say(text,seconds=1.6){this.note=text;this.noteLeft=seconds;}
 blocked(){return false;}
 movePlayer(dt,input={}){
  const p=this.player;p.moving=false;if(!this.canMove)return;
  let dx=clamp(Number(input.x)||0,-1,1),dy=clamp(Number(input.y)||0,-1,1),n=Math.hypot(dx,dy);if(!n)return;dx/=n;dy/=n;
  const b=WORKSHOP.bounds,ox=p.x,oy=p.y;p.x=clamp(p.x+dx*DESSERT.speed*dt,b.left,b.right);p.y=clamp(p.y+dy*DESSERT.speed*dt,b.top,b.bottom);
  p.dir=Math.abs(dx)>Math.abs(dy)?dx<0?'left':'right':dy<0?'up':'down';p.moving=movedDuringStep(p.x-ox,p.y-oy,dt);if(p.moving)p.walk+=dt;
 }
 act(){
  if(!this.canAct)return false;const t=this.target;if(!t){this.say('오븐 가까이로 가요');return false;}
  const o=this.ovens[t.id];this.player.dir='up';
  if(o.status==='finishing'){this.finishing=o.task;return true;}
  if(o.status!=='ready'){this.say(o.status==='baking'?'아직 덜 익었어요 · 초록 구간을 기다려요':o.status==='done'?'이 오븐은 3상자 모두 완성했어요':'새 반죽을 준비하고 있어요');this.actionWait=.18;return false;}
  o.status='finishing';o.age=0;o.doorAge=0;o.task=createFinishing(o.kind,this.delivered[o.kind]);this.finishing=o.task;this.player.moving=false;return true;
 }
 decorate(action,value){
  if(this.ended||!this.finishing||this.motion)return false;
  const t=this.finishing,ok=finishInput(t,action,value);
  if(t.step===3){const o=this.ovens.find(o=>o.task===t);this.finishing=null;o.task=null;o.status='cooling';o.age=0;
   this.motion={kind:'pack',from:{x:o.x,y:o.y-40},to:{x:o.x,y:o.y-8},material:{kind:o.kind,raw:false},age:0,duration:DESSERT.packSeconds};this.actionWait=.6;this.onEvent({type:'dessertPack'});
  }
  return ok;
 }
 leaveFinishing(){if(!this.finishing)return false;this.finishing.holding=false;this.finishing.amount=0;this.finishing=null;return true;}

 flash(){if(!this.canFreeze)return false;this.flashes--;this.freezeLeft=4;this.say('오븐만 4초 정지 · 지금 꺼낼 수 있어요');this.onEvent({type:'dessertFreeze'});return true;}
 pack(material){
  if(material.raw||!this.needs(material.kind))return;
  const id=awardClue(this,'dessert-box-'+(this.packages.length+1),this.packages.length+1);if(id===null)return;
  this.packages.push({id,kind:material.kind});this.delivered[material.kind]++;
  const o=this.ovens.find(o=>o.kind===material.kind);this.effects.push({type:'card',id,x:o.x,y:o.y-25,age:0});this.onEvent({type:'card',id,x:o.x,y:o.y+145});
  this.say(PASTRIES[o.id].name+' 포장 완료! '+this.delivered[o.kind]+'/3',1.1);
  if(!this.needs(o.kind))o.status='done';
  if(this.packages.length===9)this.finishLeft=.6;
 }
 update(dt,input={}){
  if(this.ended||!Number.isFinite(dt)||dt<=0)return;let left=Math.min(dt,DESSERT.duration);
  while(left>1e-9&&!this.ended){const step=Math.min(left,1/60,this.remaining);if(step<=1e-9){this.finish(true);break;}this.step(step,input);left-=step;}
 }
 step(dt,input){
  this.elapsed=Math.min(DESSERT.duration,this.elapsed+dt);this.noteLeft=Math.max(0,this.noteLeft-dt);this.actionWait=Math.max(0,this.actionWait-dt);
  const ovenDt=Math.max(0,dt-this.freezeLeft);this.freezeLeft=Math.max(0,this.freezeLeft-dt);
  for(const o of this.ovens){
   o.doorAge+=dt;const p=PASTRIES[o.id];
   if(o.status==='baking'){o.age+=ovenDt;if(o.age+1e-8>=p.bake){o.age=0;o.status='ready';this.onEvent({type:'dessertReady',oven:o.id});}}
   else if(o.status==='ready'){o.age+=ovenDt;if(o.age+1e-8>=p.window){o.status='burnt';o.age=0;this.burned++;this.onEvent({type:'dessertBurn',oven:o.id});}}
   else if(o.status==='burnt'||o.status==='cooling'){o.age+=dt;if(o.age+1e-8>=2){o.status=this.needs(o.kind)?'baking':'done';o.age=0;}}
  }
  if(this.finishing)advanceFinishing(this.finishing,dt);
  if(this.motion){const m=this.motion;m.age+=dt;if(m.age+1e-8>=m.duration){this.motion=null;this.pack(m.material);}}
  this.movePlayer(dt,input);for(const e of this.effects)e.age+=dt;this.effects=this.effects.filter(e=>e.age<1.5);
  if(this.finishLeft!==null){this.finishLeft-=dt;if(this.finishLeft<=0)this.finish(true);}
  if(this.remaining<=1e-8){this.elapsed=DESSERT.duration;this.finish(true);}
 }
 finish(survived){if(this.ended)return;this.ended=true;this.player.moving=false;this.phase=survived?'complete':'stopped';this.onEvent({type:'end',survived,elapsed:this.elapsed,found:[...this.banked]});}
}
