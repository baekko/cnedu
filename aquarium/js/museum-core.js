import {FLAT_WALK_SPEED,movedDuringStep} from './walk-cycle.js';
import {SIDE_HERO_SIZE} from './hero-scale.js';
import {awardClue,hasSource} from './clue-order.js';
export const MUSEUM = Object.freeze({duration:40, floors:[650,532,414,296], ladders:[29,137,361], speed:FLAT_WALK_SPEED, airSpeed:137, climbSpeed:100, jumpSpeed:294, gravity:900, shotCooldown:.62, freezeSeconds:3, freezes:3, answer:'사자', hints:['아프리카에 주로 서식하고 있습니다.','동물의 왕이라는 별명을 가지고 있습니다.']});
export const COLORS = [
 {name:'빨강',hex:'#f04451',speed:42,skill:'일정한 속도로 도망쳐요'},
 {name:'주황',hex:'#ff963e',speed:44,skill:'가끔 빠르게 달려요'},
 {name:'노랑',hex:'#ffdf49',speed:56,skill:'짧게 통통 뛰어요'},
 {name:'초록',hex:'#83c653',speed:34,skill:'사다리를 잘 타요'},
 {name:'파랑',hex:'#41c0ee',speed:47,skill:'방향을 바꿔 도망쳐요'},
 {name:'남색',hex:'#6358bd',speed:52,skill:'멈췄다가 달려요'},
 {name:'보라',hex:'#bc77e3',speed:43,skill:'2~4층을 빠르게 날아요'},
 {name:'하양',hex:'#ffffff',speed:39,skill:'층 사이를 대각선으로 날아요'},
 {name:'검정',hex:'#292c43',speed:53,skill:'사다리 없이 층 사이를 뛰어요'},
];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export class MuseumGame {
 constructor({onEvent=()=>{},random=Math.random}={}){
  this.onEvent=onEvent;this.random=random;this.elapsed=0;this.monsterTime=0;this.ended=false;
  this.flashes=MUSEUM.freezes;this.freezeLeft=0;this.health=3;this.banked=new Set();this.clueSources=new Set();this.found=new Set();
  this.player={x:47,y:MUSEUM.floors[0],floor:0,vy:0,face:1,climbing:false,walking:false,climbDistance:0,walkDistance:0,shotAge:99};
  this.shotCooldown=0;this.pendingShot=null;this.bullets=[];this.effects=[];this.successDelay=null;
  this.monsters=COLORS.map((c,i)=>({id:i+1,x:[83,195,302][i%3],y:MUSEUM.floors[1+Math.floor(i/3)],floor:1+Math.floor(i/3),dir:i%2?1:-1,age:i*.61,decision:1.4+i*.29,travel:null,alive:true}));
 }
 movePlayer(dt,input={}){
  const p=this.player,dx=clamp(input.x||0,-1,1),dy=clamp(input.y||0,-1,1);
  if(!dy)p.ladderLocked=false;
  p.walking=!!dx;
  if(p.climbing){
   if(dy){p.y+=dy*MUSEUM.climbSpeed*dt;p.climbDistance+=dy*MUSEUM.climbSpeed*dt;p.x=p.ladderX;}
   const low=MUSEUM.floors[p.lower],high=MUSEUM.floors[p.lower+1];
   if(p.y<=high){p.y=high;p.floor=p.lower+1;p.climbing=false;p.ladderLocked=true;}
   else if(p.y>=low){p.y=low;p.floor=p.lower;p.climbing=false;p.ladderLocked=true;}
   return;
  }
  if(dy && !p.ladderLocked && p.vy===0 && Math.abs(p.y-MUSEUM.floors[p.floor])<1){
   const lower=dy<0?p.floor:p.floor-1,ladder=MUSEUM.ladders.find(x=>Math.abs(x-p.x)<23);
   if(lower>=0&&lower<3&&ladder!==undefined){p.climbing=true;this.pendingShot=null;p.shotAge=99;p.lower=lower;p.ladderX=ladder;p.x=ladder;p.y+=dy*2;return;}
  }
  if(dx){
   p.face=Math.sign(dx);
   const oldX=p.x,onFloor=p.vy===0&&Math.abs(p.y-MUSEUM.floors[p.floor])<=1;
   p.x=clamp(p.x+dx*(onFloor?MUSEUM.speed:MUSEUM.airSpeed)*dt,22,368);
   p.walkDistance=(p.walkDistance||0)+Math.abs(p.x-oldX);p.walking=movedDuringStep(p.x-oldX,0,dt);
  }
 }
 jump(){const p=this.player;if(this.ended||p.climbing||p.vy!==0||Math.abs(p.y-MUSEUM.floors[p.floor])>1)return false;p.vy=-MUSEUM.jumpSpeed;this.onEvent({type:'jump'});return true;}
 shoot(){if(this.ended||this.player.climbing||this.shotCooldown>0)return false;this.shotCooldown=MUSEUM.shotCooldown;this.player.shotAge=0;this.player.shotFace=this.player.face;this.pendingShot={time:.14,dir:this.player.face};this.onEvent({type:'shoot'});return true;}
 flash(){if(this.ended||!this.flashes||this.freezeLeft>0)return false;this.flashes--;this.freezeLeft=MUSEUM.freezeSeconds;this.onEvent({type:'freeze'});return true;}
 update(dt,input={}){
  if(this.ended||!Number.isFinite(dt)||dt<=0)return;
  let left=Math.min(dt,100);
  while(left>0&&!this.ended){const step=Math.min(left,1/90);this.step(step,input);left-=step;}
 }
 step(dt,input){
  this.elapsed=Math.min(MUSEUM.duration,this.elapsed+dt);
  this.shotCooldown=Math.max(0,this.shotCooldown-dt);this.player.shotAge+=dt;
  this.movePlayer(dt,input);
  if(input.shoot)this.shoot();
  const p=this.player,ratio=this.sceneRatio||1,fit=this.sceneSpriteScale||1;
  if(!p.climbing){p.vy+=MUSEUM.gravity*dt;p.y+=p.vy*dt;const ground=MUSEUM.floors[p.floor];if(p.y>=ground){p.y=ground;p.vy=0;}}
  if(this.pendingShot){this.pendingShot.time-=dt;if(this.pendingShot.time<=0){this.bullets.push({x:p.x+this.pendingShot.dir*23,y:p.y-29*(this.sceneSpriteScale||1)/(this.sceneRatio||1),vx:this.pendingShot.dir*430,life:.55});this.pendingShot=null;}}
  // Only monsters stop: the player, projectile physics and the 40-second timer continue.
  if(this.freezeLeft>0)this.freezeLeft=Math.max(0,this.freezeLeft-dt);
  else{this.monsterTime+=dt;for(const m of this.monsters)if(m.alive)this.moveMonster(m,dt);}
  for(const m of this.monsters){
   if(m.alive && Math.abs(p.x-m.x)<((m.id===7?21:16)+14*SIDE_HERO_SIZE/64)*fit && (p.y-m.y)*ratio> -33*fit && (p.y-m.y)*ratio<50*SIDE_HERO_SIZE/64*fit){
    this.hitColor=m.id;this.health=0;p.walking=false;this.finish(false);return;
   }
  }
  for(const b of this.bullets){
   b.x+=b.vx*dt;b.life-=dt;
   for(const m of this.monsters){if(!m.alive||b.life<=0)continue;
    if(Math.abs(b.x-m.x)<(m.id===7?23:18)*fit&&Math.abs((b.y-m.y)*ratio+19*fit)<21*fit){this.capture(m);b.life=0;break;}
   }
  }
  this.bullets=this.bullets.filter(b=>b.life>0&&b.x>-10&&b.x<400);
  for(const e of this.effects)e.age+=dt;this.effects=this.effects.filter(e=>e.age<1.1);
  if(this.successDelay!==null){this.successDelay-=dt;if(this.successDelay<=0)this.finish(true);}
  else if(this.elapsed>=MUSEUM.duration)this.finish(true);
 }
 moveMonster(m,dt){
  m.age+=dt;m.decision-=dt;
  if(m.id===7||m.id===8){
   if(!m.flight || Math.hypot(m.flight.x-m.x,m.flight.y-m.y)<8){
    m.flightStep=(m.flightStep??(m.id===7?0:2))+1;
    const heights=m.id===7?[495,248,375,520]:[260,505,350,470];
    m.flight={x:m.x<195?275+this.random()*65:45+this.random()*70,y:heights[m.flightStep%4]};
   }
   const dx=m.flight.x-m.x,dy=m.flight.y-m.y,d=Math.hypot(dx,dy),speed=m.id===7?185:165,step=Math.min(d,speed*dt);
   if(d){m.x+=dx/d*step;m.y+=dy/d*step;m.dir=dx<0?-1:1;}
   m.floor=m.y>455?1:m.y>335?2:3;return;
  }
  if(m.travel){const t=m.travel;t.age+=dt;const f=clamp(t.age/t.duration,0,1);m.y=t.from+(MUSEUM.floors[t.to]-t.from)*f-(t.jump?Math.sin(f*Math.PI)*43:0);if(t.jump)m.x=t.x+(t.tx-t.x)*f;
   if(f===1){m.floor=t.to;m.y=MUSEUM.floors[m.floor];m.travel=null;m.decision=3+this.random()*3;}return;}
  const c=COLORS[m.id-1],base=MUSEUM.floors[m.floor];
  if(m.id===9&&m.decision<=0){const to=m.floor===3?2:m.floor===1?2:m.floor+(this.random()<.5?-1:1);m.travel={age:0,duration:1.15,from:m.y,to,jump:true,x:m.x,tx:clamp(m.x+m.dir*65,35,355)};m.decision=5;return;}
  if(m.decision<=0){
   if(m.id===5)m.dir*=-1;
   else if(Math.abs(this.player.y-m.y)<65&&Math.abs(this.player.x-m.x)<120)m.dir=Math.sign(m.x-this.player.x)||1;
   else if(this.random()<.35)m.dir*=-1;
   m.decision=1.3+this.random()*1.6;
   if(![7,9].includes(m.id)&&this.random()<(m.id===4||m.id===8 ? .85 : .22))m.wantsLadder=true;
  }
  if(m.wantsLadder){const x=MUSEUM.ladders.find(x=>Math.abs(x-m.x)<7);if(x!==undefined){const to=m.floor===3?2:m.floor===1?2:m.floor+(this.random()<.5?-1:1);m.x=x;m.travel={age:0,duration:1.6,from:base,to,jump:false};m.wantsLadder=false;return;}}
  const boost=m.id===2&&m.age%4<.8?1.65:m.id===6&&m.age%3.3<.65?.15:1;
  m.walkTime=(m.walkTime||0)+boost*dt;m.x+=m.dir*c.speed*2.35*boost*dt;if(m.x<24){m.x=24;m.dir=1;}if(m.x>366){m.x=366;m.dir=-1;}
  m.y=base-(m.id===7?45+Math.sin(m.age*2)*10:m.id===3?Math.max(0,Math.sin(m.age*3))*19:m.id===8?5+Math.sin(m.age*3)*3:0);
 }
 capture(m){if(!m.alive)return;m.alive=false;const earned=awardClue(this,m.id);this.effects.push({x:m.x,y:m.y-20,id:earned,sourceId:m.id,age:0});this.onEvent({type:'card',id:earned,x:m.x,y:m.y-20,color:COLORS[m.id-1].name});if(this.banked.size===9)this.successDelay=.85;}
 finish(survived){if(this.ended)return;this.ended=true;this.onEvent({type:'end',survived,elapsed:this.elapsed,found:[...this.found]});}
}

// Hue classification also restores the contrast of stolen white/black pixels.
export function pigment(r,g,b){
 const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;
 if(max<58)return 9;if(d<max*.17)return max>145?8:9;
 let h=max===r?((g-b)/d)%6:max===g?(b-r)/d+2:(r-g)/d+4;h=(h*60+360)%360;
 return h<15||h>=345?1:h<45?2:h<75?3:h<165?4:h<225?5:h<270?6:7;
}
