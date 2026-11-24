import {movedDuringStep} from './walk-cycle.js';
import {awardClue,normalizeClueRewards,restoreSources} from './clue-order.js';
export const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export class FieldGame{
 constructor(duration,onEvent=()=>{}){
  this.duration=duration;this.onEvent=onEvent;this.elapsed=0;this.room=0;this.ended=false;this.phase='explore';
  this.player={x:195,y:466,dir:'up',moving:false,walk:0,hammerAge:99};this.banked=new Set();this.found=new Set();this.clueSources=new Set();
  this.health=3;this.flashes=2;this.effects=[];this.message='';this.messageLeft=0;this.transitionLeft=0;this.queuedMove=null;
 }
 get remaining(){return Math.max(0,this.duration-this.elapsed);}
 get canMove(){return !this.ended&&this.transitionLeft<=0;}
 queueMove(input){if(this.canMove)this.queuedMove={x:input.x||0,y:input.y||0,left:.08};}
 movePlayer(dt,input){this.queueMove(input);}
 goRoom(index){
  if(this.ended||!Number.isInteger(index)||index<0||index>2||index===this.room)return false;
  this.cancelAction?.();this.room=index;Object.assign(this.player,{x:195,y:466,moving:false,dir:'up'});this.transitionLeft=.25;this.queuedMove=null;this.onEvent({type:'fieldRoom',room:index});return true;
 }
 say(s,seconds=1.5){this.message=s;this.messageLeft=seconds;}
 move(dt,input){
  const p=this.player;let x=Number(input.x)||0,y=Number(input.y)||0;
  if(this.queuedMove){if(!x)x=this.queuedMove.x;if(!y)y=this.queuedMove.y;this.queuedMove.left-=dt;if(this.queuedMove.left<=0)this.queuedMove=null;}
  if(!this.canMove)x=y=0;const n=Math.hypot(x,y);if(n>1){x/=n;y/=n;}
  const old={x:p.x,y:p.y},speed=this.speed||134;
  const nx=clamp(p.x+x*speed*dt,18,372),ny=clamp(p.y+y*speed*dt,179,472);
  if(!this.blocked?.(nx,p.y))p.x=nx;if(!this.blocked?.(p.x,ny))p.y=ny;
  p.moving=movedDuringStep(p.x-old.x,p.y-old.y,dt);if(p.moving){p.walk+=dt;if(Math.abs(x)>.2)p.dir=x<0?'left':'right';else p.dir=y<0?'up':'down';}
  if(p.y>439&&(p.x<23||p.x>367))this.goRoom((this.room+(p.x<23?2:1))%3);
 }
 update(dt,input={}){
  if(this.ended||!Number.isFinite(dt)||dt<=0)return;let left=Math.min(dt,this.remaining);
  while(left>1e-8&&!this.ended){const d=Math.min(1/60,left);this.elapsed+=d;left-=d;this.messageLeft=Math.max(0,this.messageLeft-d);this.transitionLeft=Math.max(0,this.transitionLeft-d);this.effects.forEach(e=>e.age+=d);this.effects=this.effects.filter(e=>e.age<1.2);this.move(d,input);this.tick(d);if(this.remaining<1e-8){this.elapsed=this.duration;this.finish(true);}}
 }
 award(source,x,y){const id=awardClue(this,source);if(!id)return false;this.effects.push({type:'card',id,x,y,age:0});this.onEvent({type:'card',id,x,y:y+170});if(this.banked.size===9)this.finish(true);return true;}
 restoreResult(rec){this.banked=new Set(normalizeClueRewards(rec.clues));this.found=new Set(this.banked);this.clueSources=restoreSources(rec);this.elapsed=clamp(rec.elapsed||0,0,this.duration);this.room=clamp(rec.room||0,0,2);this.flashes=Math.min(this.flashes,rec.flashes??this.flashes);this.ended=true;this.phase='complete';this.cancelAction?.();}
 finish(survived=true){if(this.ended)return;this.ended=true;this.phase='complete';this.player.moving=false;this.queuedMove=null;this.cancelAction?.();this.onEvent({type:'end',survived,elapsed:this.elapsed,found:[...this.banked]});}
}
