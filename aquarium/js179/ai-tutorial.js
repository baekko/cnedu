// The lesson is a second game instance. It never writes storage, dispatches live reward events,
// or advances the player's timer. The same movement, scanner, auto-match, tuning and print rules drive it.
import {AIGame,LABELS} from './ai-core.js';
const steps=[
 ['주문 읽기','벽 모니터에서 눈 속을 나는 여우를 찾아보세요.'],
 ['특징 스캔','모니터와 같은 특징을 스캐너에서 골라요.'],
 ['초안 바꾸기','모은 세 특징을 중앙 코어에서 그림으로 만들어요.'],
 ['그림 출력','원본과 같아지면 출력해요. 단서 한 장을 받았어요.']
];
export class AITutorial{
 constructor(){
  this.game=new AIGame({seed:142,tutorial:true});const g=this.game;g.orderIndex=4;g.setupOrder();
  this.step=0;this.caption=steps[0][1];this.age=0;this.done=false;this.i=0;this.ageHere=0;
  const seq=this.seq=[],hold=(s,txt,sec)=>seq.push({s,txt,sec}),action=(s,txt,fn)=>seq.push({s,txt,fn}),walk=(s,txt,...points)=>points.forEach(p=>seq.push({s,txt,p})),waitScan=(s,slot)=>{const k=g.reference[slot],m=LABELS[k]+' 그림 가까이에서 스캔을 눌러요.';hold(s,m,.52);action(s,m,()=>g.act());hold(s,LABELS[k]+' 특징이 코어로 들어갔어요.',.8);};
  hold(0,steps[0][1],2.9);
  walk(1,'형태 스캐너의 여우에게 다가가요.',[193,321],[100.35,262]);waitScan(1,'body');
  walk(1,'다음은 동작 스캐너의 날개예요.',[185,307],[284.25,299]);waitScan(1,'part');
  walk(1,'눈꽃은 아래쪽 효과 프리즘에 있어요.',[188,331],[166,410],[65.2,406]);waitScan(1,'ink');
  walk(2,steps[2][1],[167,412],[202,329],[198,234]);hold(2,steps[2][1],.55);action(2,steps[2][1],()=>g.act());
  hold(2,'왼쪽은 주문 원본, 오른쪽은 방금 만든 초안이에요.',2.3);
  seq.push({s:2,txt:'좌우 방향키로 원본처럼 날개를 길게 바꿔요.',sec:.25,input:()=>({x:Math.sign(g.reference.powerLevel-1)})});
  hold(2,'원본처럼 날개를 길게 바꿔요.',1.65);
  action(2,'자동완성 칩으로 한 번에 맞출 수도 있어요.',()=>g.setInfluence(0,(g.reference.powerLevel+1)%3));
  hold(2,'동작과 효과를 모두 원본에 맞춰 볼게요.',.55);
  action(2,'자동완성 칩을 누르면 바로 원본과 같아져요.',()=>g.flash());
  hold(2,'이제 출력만 누르면 돼요.',.9);
  action(3,'이제 출력을 눌러 완성된 그림을 받아요.',()=>g.act());
  hold(3,'완성된 그림은 1초 동안 보여요.',1.02);
  // Show the next order after the same one-second output used in the real game.
  seq.push({s:3,txt:'원본을 재현해서 단서 한 장을 받았어요.',sec:1.7,still:true});
 }
 get title(){return this.titles?.[this.step]||steps[this.step][0];}
 update(dt){const limit=Math.min(.20,Math.max(0,dt));let t=0;while(t<limit-1e-9&&!this.done){const d=Math.min(1/60,limit-t);t+=d;this.advance(d);}}
 advance(d){const op=this.seq[this.i];if(!op){this.done=true;return;}
  this.age+=d;this.ageHere+=d;this.step=op.s;this.caption=op.txt;
  const next=()=>{this.i++;this.ageHere=0;if(this.i===this.seq.length)this.done=true;};
  if(op.p){const p=this.game.player,dx=op.p[0]-p.x,dy=op.p[1]-p.y,h=Math.hypot(dx,dy);if(h<=3){next();return;}this.game.update(Math.min(d,h/172),{x:dx/h,y:dy/h});return;}
  if(op.fn){op.fn();next();return;}
  if(!op.still)this.game.update(d,op.input?op.input():{});if(this.ageHere>=op.sec)next();
 }
}
