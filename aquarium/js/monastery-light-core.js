import {awardClue} from './clue-order.js';

export const MONASTERY=Object.freeze({duration:80,width:390,height:500,speed:150,reach:46,flashes:2,shieldSeconds:5.5,cardLight:5,answer:'목탁',hints:['사찰에서 두드려 소리를 내는 나무 악기예요.','둥근 몸통과 손잡이가 있고, 나무 채로 두드려요.']});
export const LAMP_SPOTS=Object.freeze([220,320,420].flatMap((y,row)=>[75,195,315].map((x,col)=>Object.freeze({id:row*3+col,x,y,color:(row+col)%3}))));
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const ANCHORS=[0,8,2,6,4,1,7,3,5];
export const lightRate=n=>n<5?0:(n/9)**2;
export class MonasteryGame{
 constructor({onEvent=()=>{}}={}){
  this.onEvent=onEvent;this.elapsed=0;this.ended=false;this.phase='explore';this.health=3;this.hits=this.mistakes=0;this.flashes=MONASTERY.flashes;this.shieldLeft=0;this.brightness=0;this.lightsRestored=0;
  this.banked=new Set();this.found=new Set();this.clueSources=new Set();this.effects=[];this.camera={x:0,y:0};
  this.player={x:195,y:469,dir:'up',moving:false,walk:0,hammerAge:99};this.lamps=LAMP_SPOTS.map(p=>({...p,lit:true,guard:0,igniteAge:99}));
  this.wind={phase:'calm',left:1.5,targets:[],cycle:0,direction:1};this.actionWait=0;this.actionAge=99;this.message='';this.messageLeft=0;
 }
 get remaining(){return Math.max(0,MONASTERY.duration-this.elapsed);}
 get canMove(){return !this.ended;}
 get zoneIndex(){return this.elapsed<18?0:this.elapsed<42?1:2;}
 get zone(){return {name:'산사의 연등 마당'};}
 get litCount(){return this.lamps.filter(l=>l.lit).length;}
 get nextLight(){return clamp((this.brightness-this.banked.size*MONASTERY.cardLight)/MONASTERY.cardLight,0,1);}
 get nearest(){return this.lamps.filter(l=>!l.lit).map(l=>({lamp:l,d:Math.hypot(l.x-this.player.x,l.y-this.player.y)})).filter(o=>o.d<=MONASTERY.reach).sort((a,b)=>a.d-b.d||a.lamp.id-b.lamp.id)[0]?.lamp||null;}
 get canAct(){return !this.ended&&this.actionWait<=0&&!!this.nearest;}
 get canShield(){return !this.ended&&this.flashes>0&&this.shieldLeft<=0;}
 get prompt(){if(this.ended)return this.banked.size===9?'아홉 단서를 모두 모았어요':'산사의 불빛을 지켰어요';if(this.messageLeft>0)return this.message;if(this.shieldLeft>0)return '바람막이 · 불빛이 보호되고 있어요';if(this.wind.phase==='warning')return '바람 예고 · 깃발이 흔들리는 연등을 살펴요';if(this.nearest)return '점화 버튼으로 꺼진 연등을 켜요';return '불빛을 많이 지킬수록 단서가 빨리 모여요';}
 say(s){this.message=s;this.messageLeft=1.2;}
 releaseAction(){}
 queueMove(v){this.update(.08,v);}
 blocked(x,y){return this.lamps.some(l=>Math.abs(x-l.x)<16&&Math.abs(y-l.y)<12);}
 move(dt,input){const p=this.player;let x=Number(input.x)||0,y=Number(input.y)||0,n=Math.hypot(x,y);p.moving=false;if(!n)return;x/=n;y/=n;const ox=p.x,oy=p.y,nx=clamp(p.x+x*MONASTERY.speed*dt,24,366),ny=clamp(p.y+y*MONASTERY.speed*dt,196,478);if(!this.blocked(nx,p.y))p.x=nx;if(!this.blocked(p.x,ny))p.y=ny;p.moving=Math.hypot(p.x-ox,p.y-oy)>.001;if(p.moving){p.walk+=dt;p.dir=Math.abs(x)>Math.abs(y)?x<0?'left':'right':y<0?'up':'down';}}
 act(){
  if(!this.canAct)return false;const l=this.nearest;l.lit=true;l.guard=2.4;l.igniteAge=0;this.actionWait=.18;this.actionAge=0;this.lightsRestored++;
  const dx=l.x-this.player.x,dy=l.y-this.player.y;this.player.dir=Math.abs(dx)>Math.abs(dy)?dx<0?'left':'right':dy<0?'up':'down';
  this.effects.push({type:'ignite',x:l.x,y:l.y-42,age:0});this.onEvent({type:'monasteryIgnite',id:l.id,x:l.x,y:l.y+128});return true;
 }
 flash(){if(!this.canShield)return false;this.flashes--;this.shieldLeft=MONASTERY.shieldSeconds;this.onEvent({type:'monasteryShield'});return true;}
 planWind(){
  const w=this.wind,anchor=LAMP_SPOTS[ANCHORS[w.cycle%ANCHORS.length]],lit=this.lamps.filter(l=>l.lit).sort((a,b)=>Math.hypot(a.x-anchor.x,a.y-anchor.y)-Math.hypot(b.x-anchor.x,b.y-anchor.y)||a.id-b.id);
  const count=this.zoneIndex===2?3:2;let selected=lit.slice(0,2);
  if(count===3&&lit.length>2){const rest=lit.filter(l=>!selected.includes(l)).sort((a,b)=>Math.min(...selected.map(s=>Math.hypot(b.x-s.x,b.y-s.y)))-Math.min(...selected.map(s=>Math.hypot(a.x-s.x,a.y-s.y)))||a.id-b.id);selected.push(rest[0]);}
  w.targets=selected.map(l=>l.id);w.phase='warning';w.left=2.1;w.direction=w.cycle%2?1:-1;this.onEvent({type:'monasteryWindWarning',targets:[...w.targets]});
 }
 advanceWind(){const w=this.wind;if(w.phase==='calm'){this.planWind();return;}if(w.phase==='warning'){w.phase='gust';w.left=.95;let out=0;for(const id of w.targets){const l=this.lamps[id];if(l.lit&&l.guard<=0&&this.shieldLeft<=0){l.lit=false;out++;}}this.onEvent({type:'monasteryWind',out,protected:this.shieldLeft>0});return;}w.phase='calm';w.left=2.6;w.targets=[];w.cycle++;}
 update(dt,input={}){
  if(this.ended||!Number.isFinite(dt)||dt<=0)return;let left=Math.min(dt,this.remaining);
  while(left>1e-9&&!this.ended){const d=Math.min(left,1/60,this.wind.left);left-=d;this.elapsed+=d;this.move(d,input);this.actionWait=Math.max(0,this.actionWait-d);this.actionAge+=d;this.messageLeft=Math.max(0,this.messageLeft-d);this.shieldLeft=Math.max(0,this.shieldLeft-d);
   for(const l of this.lamps){l.guard=Math.max(0,l.guard-d);l.igniteAge+=d;}for(const e of this.effects)e.age+=d;this.effects=this.effects.filter(e=>e.age<1.2);
   this.brightness+=lightRate(this.litCount)*d;
   while(this.banked.size<9&&this.brightness+1e-8>=(this.banked.size+1)*MONASTERY.cardLight){const id=awardClue(this,this.banked.size+1);this.effects.push({type:'card',id,x:195,y:88,age:0});this.onEvent({type:'card',id,x:195,y:258});if(this.banked.size===9){this.finish(true);break;}}
   this.wind.left-=d;if(this.wind.left<=1e-8&&!this.ended)this.advanceWind();
  }
  if(!this.ended&&this.remaining<1e-8){this.elapsed=MONASTERY.duration;this.finish(true);}
 }
 restoreResult(rec){this.elapsed=clamp(rec.elapsed||0,0,MONASTERY.duration);this.flashes=rec.flashes??MONASTERY.flashes;this.banked=new Set((rec.clues||[]).filter(id=>id>=1&&id<=9));this.found=new Set(this.banked);this.clueSources=new Set((rec.lit?.length?rec.lit:Array.from({length:this.banked.size},(_,i)=>i+1)).filter(id=>id>=1&&id<=9));this.brightness=this.banked.size*MONASTERY.cardLight;this.ended=true;this.phase='complete';}
 finish(survived=true){if(this.ended)return;this.ended=true;this.phase=survived?'complete':'stopped';this.player.moving=false;this.onEvent({type:'end',survived,elapsed:this.elapsed,found:[...this.banked]});}
}
