import {FieldGame,clamp} from './field-base.js';
import {awardClue} from './clue-order.js';
import {HISTORY} from './history-core.js?v307';
import {movedDuringStep} from './walk-cycle.js';

export const GYM=Object.freeze({duration:50,health:2,speed:HISTORY.speed,flashes:2,freezeSeconds:3,invincibleSeconds:1.35,ballRadius:7.5,windup:1.05,lockSeconds:.4,answer:'호루라기',hints:['경기를 시작하거나 멈출 때 입으로 부는 도구예요.','심판이 불면 삑! 소리가 나요. 호로 시작하는 네 글자예요.']});
export const gymBallSpeed=elapsed=>(176+Math.min(24,elapsed*.55))*1.05;
export const GYM_BOUNDS=Object.freeze({left:61,right:329,top:193,bottom:433});
export const GYM_THROWERS=Object.freeze([
 {x:109,y:153,dir:'down',row:0},{x:281,y:153,dir:'down',row:3},
 // The near sidelines leave no room for a full56px throwing stance. Stand
 // in the wider outer lanes near the back, with both shoes clear in all poses.
 {x:15,y:225,dir:'right',row:2},{x:375,y:208,dir:'left',row:2},
 {x:109,y:474,dir:'up',row:1},{x:281,y:474,dir:'up',row:1}
].map(Object.freeze));
export const GYM_CARD_SPOTS=Object.freeze([
 {x:94,y:219},{x:295,y:219},{x:195,y:305},
 {x:87,y:326},{x:299,y:402},{x:195,y:209},
 {x:98,y:414},{x:301,y:309},{x:195,y:419}
].map(Object.freeze));
// Same measured hand offsets as throwers.json; renderer verifies the art registration.
const handOffsets=[[-7.4375,-22.9688],[15.0938,-26.25],[14,-25.1562],[-4.375,-23.4062]];
const defaultRelease=t=>({x:t.x+handOffsets[t.row][0]*(t.dir==='left'?-1:1),y:t.y+handOffsets[t.row][1]+20});
export const gymThrowPose=t=>t.phase==='windup'?1:t.phase==='release'?2:t.phase==='recover'?3:0;
export function gymBodyTouches(ball,p){
 // Ground coordinates: the ball and the child's chest are both drawn 20px up.
 const dx=(ball.x-p.x)/16,dy=(ball.y-p.y)/23;
 return dx*dx+dy*dy<1;
}
export class GymGame extends FieldGame{
 constructor({onEvent=()=>{},random=Math.random,tutorial=false}={}){
  super(GYM.duration,onEvent);this.edition='dodgeball';this.health=GYM.health;this.speed=GYM.speed;this.flashes=GYM.flashes;this.tutorial=tutorial;
  this.random=random;this.throwClock=0;this.nextThrow=1.7;this.throwCount=0;this.lastThrower=-1;this.ballSerial=0;
  this.freezeLeft=0;this.invincible=0;this.hits=0;this.balls=[];this.releasePoint=defaultRelease;this.touches=gymBodyTouches;
  this.player.x=195;this.player.y=371;this.player.dir='up';this.player.vx=0;this.player.vy=0;
  this.throwers=GYM_THROWERS.map((t,id)=>({...t,id,phase:'ready',age:0,target:null,locked:false}));
  // Content varies only by a horizontal reflection. Travel distance and cadence stay equal.
  const reflected=random()<.5;
  // Spread all nine clues through the run; the last arrives with five seconds left.
  this.cards=GYM_CARD_SPOTS.map((p,id)=>({id,x:reflected?390-p.x:p.x,y:p.y,at:1+id*(GYM.duration-6)/(GYM_CARD_SPOTS.length-1),collected:false}));
 }
 get itemLabel(){return '타임아웃 휘슬';}
 get itemKind(){return 'whistle';}
 get itemTip(){return '공과 상대를 3초 멈춰요 · 2회 사용 가능';}
 get actionLabel(){return '';}
 get canAct(){return false;}
 get prompt(){return this.messageLeft>0?this.message:this.freezeLeft>0?'휘슬이 울리는 동안 단서를 모아요':'';}
 get activeCards(){return this.cards.filter(c=>!c.collected&&this.elapsed>=c.at);}
 get statusDescription(){return '피구 코트 · 체력 '+this.health+'칸';}
 beginAction(){return false;} releaseAction(){return false;} cancelAction(){} act(){return false;} goRoom(){return false;}
 move(dt,input){
  const p=this.player;let x=Number(input.x)||0,y=Number(input.y)||0;
  if(this.queuedMove){if(!x)x=this.queuedMove.x;if(!y)y=this.queuedMove.y;this.queuedMove.left-=dt;if(this.queuedMove.left<=0)this.queuedMove=null;}
  const n=Math.hypot(x,y);if(n>1){x/=n;y/=n;}if(!this.canMove)x=y=0;
  const ox=p.x,oy=p.y,b=GYM_BOUNDS;
  p.x=clamp(p.x+x*GYM.speed*dt,b.left,b.right);p.y=clamp(p.y+y*GYM.speed*dt,b.top,b.bottom);
  p.vx=(p.x-ox)/dt;p.vy=(p.y-oy)/dt;p.moving=movedDuringStep(p.x-ox,p.y-oy,dt);
  if(p.moving){p.walk+=dt;p.dir=Math.abs(x)>Math.abs(y)?(x<0?'left':'right'):(y<0?'up':'down');}
 }
 aim(t){
  const p=this.player,lead=this.elapsed>18?.22:0;
  t.target={x:clamp(p.x+p.vx*lead,GYM_BOUNDS.left,GYM_BOUNDS.right),y:clamp(p.y+p.vy*lead,GYM_BOUNDS.top,GYM_BOUNDS.bottom)};
 }
 beginThrow(id,target=null){
  if(this.ended||this.freezeLeft>0)return false;const t=this.throwers[id];if(!t||t.phase!=='ready')return false;
  Object.assign(t,{phase:'windup',age:0,locked:!!target,target:target?{...target}:null});if(!target)this.aim(t);
  this.onEvent({type:'gymWarning',thrower:id});return true;
 }
 release(t){
  const start=this.releasePoint(t),dx=t.target.x-start.x,dy=t.target.y-start.y,n=Math.hypot(dx,dy)||1;
  const speed=gymBallSpeed(this.elapsed);
  this.balls.push({id:++this.ballSerial,x:start.x,y:start.y,px:start.x,py:start.y,vx:dx/n*speed,vy:dy/n*speed,age:0,thrower:t.id});
  t.phase='release';t.age=0;this.onEvent({type:'gymThrow',thrower:t.id});
 }
 schedule(){
  if(this.tutorial||this.throwClock<this.nextThrow||this.freezeLeft>0)return;
  const available=this.throwers.filter(t=>t.phase==='ready'&&t.id!==this.lastThrower);
  if(!available.length){this.nextThrow+=.15;return;}
  // Alternate the court edges, with a second staggered throw later in the game.
  const order=[0,3,4,1,2,5];let t=available.find(t=>t.id===order[this.throwCount%6])||available[0];
  this.beginThrow(t.id);this.lastThrower=t.id;this.throwCount++;
  const spacing=(this.elapsed<15?1.68:this.elapsed<30?1.37:1.18)*.95;
  this.nextThrow=this.throwClock+spacing;
  if(this.elapsed>21&&this.throwCount%5===0){
   const second=available.find(v=>v.id!==t.id&&Math.hypot(v.x-t.x,v.y-t.y)>240);
   if(second){second.delayed=.47;second.phase='waiting';}
  }
 }
 tick(dt){
  this.invincible=Math.max(0,this.invincible-dt);
  for(const card of this.activeCards){
   if(Math.hypot(card.x-this.player.x,card.y-this.player.y)>=18)continue;
   card.collected=true;
   const id=awardClue(this,card.id);
   if(!id)continue;
   const y=card.y-12;
   this.effects.push({type:'card',id,x:card.x,y,age:0});
   this.onEvent({type:'card',id,x:card.x,y:y+170});
  }
  if(this.freezeLeft>0){this.freezeLeft=Math.max(0,this.freezeLeft-dt);if(this.freezeLeft===0)this.invincible=Math.max(this.invincible,.5);return;}
  this.throwClock+=dt;this.schedule();
  for(const t of this.throwers){
   if(t.phase==='waiting'){t.delayed-=dt;if(t.delayed<=0){t.phase='ready';this.beginThrow(t.id);}continue;}
   t.age+=dt;
   if(t.phase==='windup'){
    if(!t.locked){this.aim(t);if(t.age>=GYM.windup-GYM.lockSeconds)t.locked=true;}
    if(t.age>=GYM.windup)this.release(t);
   }else if(t.phase==='release'&&t.age>=.18){t.phase='recover';t.age=0;}
   else if(t.phase==='recover'&&t.age>=.72){t.phase='ready';t.age=0;t.target=null;}
  }
  for(const b of this.balls){
   b.px=b.x;b.py=b.y;b.x+=b.vx*dt;b.y+=b.vy*dt;b.age+=dt;
   if(b.hit||this.invincible>0)continue;
   if(this.touches(b,this.player)){
    b.hit=true;this.health--;this.hits++;this.invincible=GYM.invincibleSeconds;
    this.effects.push({type:'hit',x:this.player.x,y:this.player.y-20,age:0});
    this.say('공에 맞았어요!',.8);this.onEvent({type:'gymHit',health:this.health});
    if(this.health<=0){this.finish(false);break;}
   }
  }
  this.balls=this.balls.filter(b=>!b.hit&&b.x>-20&&b.x<410&&b.y>110&&b.y<510&&b.age<4);
 }
 flash(){
  if(this.ended||this.flashes<=0||this.freezeLeft>0)return false;
  this.flashes--;this.freezeLeft=GYM.freezeSeconds;this.say('타임아웃! 3초 동안 움직일 수 있어요',1.3);
  this.onEvent({type:'gymWhistle',remaining:this.flashes});return true;
 }
 restoreResult(rec){super.restoreResult(rec);this.health=rec.survived===false?0:GYM.health;this.cards.forEach(c=>c.collected=this.clueSources.has(c.id));}
}
