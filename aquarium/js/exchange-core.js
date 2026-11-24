import {movedDuringStep} from './walk-cycle.js';
import {EXCHANGE_ROUNDS} from './exchange-data.js';
export const EXCHANGE={answer:'하마',hints:['주로 풀을 먹는 동물입니다.','물속에서 바닥을 딛고 이동하며, 입이 아주 큽니다.'],initialCash:100};
// Room layout is shared with the renderer so the service circle, its caption,
// the desk and the dialogue trigger stay together when the room is rearranged.
export const EXCHANGE_ROOM=Object.freeze({deskX:70,deskY:116,deskWidth:250,counterX:195,counterY:350,counterRadiusX:35,counterRadiusY:12,labelY:379,walkTop:333,dialogueY:357,exitY:389,boardBottom:94});
export const cardPrice=()=>300;
export const money=n=>Math.trunc(n).toLocaleString('ko-KR');
export const shuffle=(a,rng=Math.random)=>{const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.min(i,Math.floor(rng()*(i+1)));[b[i],b[j]]=[b[j],b[i]];}return b;};
export function quote(cash,budget,stock,double=false){
 const cap=Math.min(Math.max(0,Math.floor(budget/10)*10),Math.floor(cash/10)*10),shares=Math.floor(cap/stock.start),cost=shares*stock.start;
 const profit=shares*(stock.end-stock.start)*(double?2:1);
 return {budget:cap,shares,cost,unused:cap-cost,remaining:cash-cost,profit,after:Math.max(0,cash+profit)};
}
export class ExchangeGame{
 constructor({random=Math.random,saved=null}={}){
  this.plan=EXCHANGE_ROUNDS.map(r=>({scenario:Math.min(r.scenarios.length-1,Math.floor(random()*r.scenarios.length)),order:shuffle([0,1,2,3],random),clueOrder:shuffle([0,1,2,3],random)}));
  this.cash=100;this.round=0;this.phase='walk';this.dialogue=0;this.selected=0;this.budget=0;this.focus='stock';this.doubleUsed=false;this.doubleArmed=false;this.specialUsed=false;this.specialRound=-1;this.phaseTime=0;this.ledger=[];this.banked=new Set();this.found=new Set();this.player={x:195,y:465,dir:'up',moving:false,walk:0,hammerAge:99};this.error='';
  if(saved)this.restore(saved);
 }
 get data(){return EXCHANGE_ROUNDS[this.round];}
 get scenario(){return this.data.scenarios[this.plan[this.round].scenario];}
 get stocks(){return this.plan[this.round].order.map(i=>this.scenario.stocks[i]);}
 get stock(){return this.stocks[this.selected];}
 get info(){return this.plan[this.round].clueOrder.map(i=>this.scenario.clues[i]);}
 get preview(){return quote(this.cash,this.budget,this.stock,this.doubleArmed);}
 get canAfford(){return this.stocks.some(s=>s.start<=this.cash);}
 movePlayer(dt,input={}){
  const p=this.player;p.moving=false;if(this.phase!=='walk')return;
  let x=Number(input.x)||0,y=Number(input.y)||0,n=Math.hypot(x,y);if(!n)return;
  x/=n;y/=n;const ox=p.x,oy=p.y;p.x=Math.max(64,Math.min(326,p.x+x*118*dt));p.y=Math.max(EXCHANGE_ROOM.walkTop,Math.min(470,p.y+y*118*dt));
  p.dir=Math.abs(x)>Math.abs(y)?x<0?'left':'right':y<0?'up':'down';p.moving=movedDuringStep(p.x-ox,p.y-oy,dt);if(p.moving)p.walk+=dt;
  if(Math.abs(p.x-EXCHANGE_ROOM.counterX)<46&&p.y<=EXCHANGE_ROOM.dialogueY){p.moving=false;this.phase='dialogue';this.phaseTime=0;}
 }
 update(dt,input={}){const elapsed=Math.min(10,Math.max(0,dt));this.phaseTime+=elapsed;if(this.phase==='walk')this.movePlayer(Math.min(.1,elapsed),input);if(this.phase==='information'&&this.phaseTime>=2)this.phase='select';if(this.phase==='travel'&&this.phaseTime>=2.5)this.settle();}
 startRound(){this.phase='information';this.phaseTime=0;this.selected=0;this.budget=0;this.focus='stock';this.doubleArmed=false;this.error='';}
 select(index){if(this.phase!=='select')return;this.selected=Math.max(0,Math.min(3,index));this.budget=0;this.focus='amount';this.error='';}
 adjust(delta){if(this.phase!=='select')return;this.budget=Math.max(0,Math.min(Math.floor(this.cash/10)*10,this.budget+delta*10));this.error='';}
 navigate(dir){if(this.phase!=='select')return;if(dir==='left'){this.focus='stock';return;}if(dir==='right'){this.focus=this.focus==='stock'?'amount':'confirm';return;}const d=dir==='up'?-1:1;if(this.focus==='stock'){this.selected=(this.selected+d+4)%4;this.budget=0;}else if(this.focus==='amount')this.adjust(-d);else this.focus=dir==='up'?'amount':'stock';}
 maxBudget(){if(this.phase!=='select')return;this.budget=Math.floor(this.cash/this.stock.start)*this.stock.start;this.focus='amount';this.error='';}
 previous(){if(this.phase==='dialogue')this.dialogue=Math.max(0,this.dialogue-1);}
 closeDialogue(){if(this.phase!=='dialogue')return;this.phase='walk';this.player.y=EXCHANGE_ROOM.exitY;this.player.dir='down';this.player.moving=false;this.phaseTime=0;}
 bankrupt(){if(!['information','select','settled','finished','shop'].includes(this.phase))return false;this.cash=0;this.phase='bankrupt';this.pending=null;this.doubleArmed=false;return true;}
 next(){if(this.phase==='dialogue'){this.dialogue=Math.min(3,this.dialogue+1);return;}if(this.phase==='select'){if(this.focus==='stock')this.focus='amount';else if(this.focus==='amount')this.focus='confirm';else this.commit();}else if(this.phase==='settled'){if(this.round===EXCHANGE_ROUNDS.length-1)this.phase='finished';else{this.round++;this.startRound();}}}
 toggleDouble(){if(this.phase!=='select'||this.doubleUsed)return false;this.doubleArmed=!this.doubleArmed;return true;}
 useSpecial(){if(!['information','select'].includes(this.phase)||this.specialUsed)return false;this.specialUsed=true;this.specialRound=this.round;return true;}
 commit(){if(this.phase!=='select')return false;const q=this.preview;
  if(!this.canAfford){this.pending={...quote(this.cash,0,this.stock),id:'cash',name:'현금 보유',sector:'현금',start:0,end:0,reason:'현재 자본으로 살 수 있는 종목이 없어 이번 회차에는 현금을 보관했어요. 자본은 그대로 다음 회차로 이어집니다.',double:false,before:this.cash,year:this.data.year,endYear:this.data.endYear};}
  else{if(this.budget%this.stock.start!==0){this.error=`${this.stock.start}만원짜리 주식은 ${this.stock.start}만원의 배수로 투자금액을 설정해 주세요.`;this.focus='amount';return false;}if(q.shares<1){this.error=`${this.stock.name} 1주를 사려면 ${this.stock.start}만원 이상 설정해 주세요.`;this.focus='amount';return false;}this.pending={...q,id:this.stock.id,name:this.stock.name,sector:this.stock.sector,start:this.stock.start,end:this.stock.end,reason:this.stock.reason,double:this.doubleArmed,before:this.cash,year:this.data.year,endYear:this.data.endYear};if(this.doubleArmed)this.doubleUsed=true;}
  this.phase='travel';this.phaseTime=0;this.error='';return true;}
 settle(){if(this.phase!=='travel'||!this.pending)return;this.cash=this.pending.after;this.ledger.push({...this.pending});this.pending=null;this.doubleArmed=false;this.phase=this.cash===0?'bankrupt':'settled';this.phaseTime=0;}
 openShop(){if(this.phase!=='finished')return;this.phase='shop';}
 buy(ids){if(this.phase!=='shop')return false;const unique=[...new Set(ids)].filter(i=>Number.isInteger(i)&&i>=1&&i<=9),cost=unique.reduce((s,i)=>s+cardPrice(i),0);if(cost>this.cash)return false;this.cash-=cost;this.banked=new Set(unique);this.found=new Set(unique);this.phase='complete';return true;}
 snapshot(){return {v:2,plan:this.plan,cash:this.cash,round:this.round,phase:this.phase,dialogue:this.dialogue,selected:this.selected,budget:this.budget,focus:this.focus,doubleUsed:this.doubleUsed,doubleArmed:this.doubleArmed,specialUsed:this.specialUsed,specialRound:this.specialRound,phaseTime:this.phaseTime,ledger:this.ledger,pending:this.pending,banked:[...this.banked],player:this.player};}
 restore(s){
  if(s.v!==2||!Array.isArray(s.plan)||s.plan.length!==EXCHANGE_ROUNDS.length||!Number.isSafeInteger(s.cash)||s.cash<0||s.cash>10000000)return;
  const permutation=a=>Array.isArray(a)&&a.length===4&&new Set(a).size===4&&a.every(v=>Number.isInteger(v)&&v>=0&&v<4);
  if(!s.plan.every((p,i)=>Number.isInteger(p.scenario)&&p.scenario>=0&&p.scenario<EXCHANGE_ROUNDS[i].scenarios.length&&permutation(p.order)&&permutation(p.clueOrder)))return;
  if(!Number.isInteger(s.round)||s.round<0||s.round>=EXCHANGE_ROUNDS.length||!['walk','dialogue','information','select','travel','settled','finished','shop','complete','bankrupt'].includes(s.phase))return;
  this.plan=s.plan;this.cash=s.cash;this.round=s.round;this.phase=s.phase;this.dialogue=Math.max(0,Math.min(3,s.dialogue||0));this.selected=Math.max(0,Math.min(3,s.selected||0));this.budget=Math.min(this.cash,Math.max(0,s.budget||0));this.focus=['stock','amount','confirm'].includes(s.focus)?s.focus:'stock';this.doubleUsed=!!s.doubleUsed;this.doubleArmed=!!s.doubleArmed&&!this.doubleUsed;this.specialUsed=!!s.specialUsed;this.specialRound=Number.isInteger(s.specialRound)?s.specialRound:-1;this.phaseTime=Math.max(0,Math.min(3,Number(s.phaseTime)||0));this.ledger=Array.isArray(s.ledger)?s.ledger.slice(0,EXCHANGE_ROUNDS.length):[];
  this.pending=s.pending&&Number.isSafeInteger(s.pending.after)?s.pending:null;if(this.phase==='travel'&&!this.pending)this.phase='select';
  this.banked=new Set((s.banked||[]).filter(n=>Number.isInteger(n)&&n>=1&&n<=9));this.found=new Set(this.banked);
  if(s.player&&Number.isFinite(s.player.x)&&Number.isFinite(s.player.y))this.player={...this.player,x:Math.max(64,Math.min(326,s.player.x)),y:Math.max(this.phase==='walk'?EXCHANGE_ROOM.exitY:EXCHANGE_ROOM.walkTop,Math.min(470,s.player.y)),dir:['up','down','left','right'].includes(s.player.dir)?s.player.dir:'up'};
 }
}
