import {FieldGame,clamp} from './field-base.js';
import {autoPhotoInput,trackPhotoBypass} from './photo-auto.js';
import {subjectPose} from './photo-motion.js';
export {subjectPose} from './photo-motion.js';
export const PHOTO=Object.freeze({duration:100,flashes:1,answer:'사진기',hints:['빛을 받아 모습을 남기는 물건이에요.','그림 속 물건의 이름은 ‘사진기’예요.']});
export const PHOTO_ROOMS=['초상 촬영실','동물 촬영실','햇빛 촬영실'];
const names=['불이 켜진 장난감 기차','귀를 세운 강아지','인사하는 곰 인형','걷는 고양이','달리는 강아지','뛰는 토끼','물고기가 나온 어항','꽃이 보이는 화병','가운데 모인 비눗방울'];
const locations=[[100,239],[285,239],[195,359]];
export const PHOTO_SUBJECTS=Object.freeze(names.map((name,i)=>Object.freeze({id:i+1,room:Math.floor(i/3),name,artIndex:i===0?4:i,x:locations[i%3][0],y:locations[i%3][1],period:5+(i%3)*.2,phase:i*.87,height:[37,39,44,35,40,30,39,47,43][i],animal:i>=3&&i<6?['cat','dog','rabbit'][i-3]:null,distance:[78,99,83][i%3],amp:i<6?40:5,view:i%3===1?-18:i%3===0?18:0})));
export function photoObstacles(){return [];}
export const PHOTO_AIM=Object.freeze({halfWidth:14,halfHeight:13,focusGain:.38,focusLoss:1.05,threshold:.95});
export const reflectionX=(s,time)=>Math.sin(time*.9+s.phase)*28;
export function photoLight(s,time){const phase=(time+s.phase)%8;return {active:phase>=1&&phase<3,warning:phase<1,left:phase<1?1-phase:phase<3?3-phase:8-phase};}
export function photoGlareAt(s,time,y){const q=subjectPose(s,time);return q.x+reflectionX(s,time)*(y-q.y+s.height/2)/(110+s.height/2);}
export function photoLens(subject,player){return {x:player.x-subject.view-72.5,y:player.y-subject.distance-subject.height/2-45,w:145,h:90};}
// Keep the picture inside the room, while its optical aim still follows the player.
export function photoFrame(lens){return {x:clamp(lens.x,0,390-lens.w),y:clamp(lens.y,0,500-lens.h),w:lens.w,h:lens.h,aimX:lens.x+lens.w/2,aimY:lens.y+lens.h/2};}
export function photoOcclusionRects(r){return r?[r]:[];}
export const photoRectsOverlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
export const wantedAlternate=s=>[1,2,3].includes(s.id);
export const photoPanel=p=>({x:p.x<195?278:12,y:9,w:100,h:76});
export const photoLivePanel=()=>({x:174,y:9,w:204,h:158});

export class PhotoGame extends FieldGame{
 constructor({onEvent=()=>{}}={}){super(PHOTO.duration,onEvent);this.speed=134;this.focus=0;this.focusing=false;this.focusId=null;this.selected=null;this.cameraTime=0;this.flashes=PHOTO.flashes;this.autoShot=null;this.cooldown=0;this.shots=0;this.misses=0;this.lastShot=null;}
 get subjects(){return PHOTO_SUBJECTS.filter(s=>s.room===this.room);}
 get target(){const p=this.player;return this.subjects.find(s=>s.id===this.focusId&&!this.clueSources.has(s.id))||this.subjects.find(s=>s.id===this.selected&&!this.clueSources.has(s.id))||this.subjects.filter(s=>!this.clueSources.has(s.id)).sort((a,b)=>Math.hypot(a.x-p.x,a.y+75-p.y)-Math.hypot(b.x-p.x,b.y+75-p.y))[0]||null;}
 pose(s){return subjectPose(s,this.cameraTime);}
 autoPosition(s){const q=this.pose(s),base=q.x+s.view,ray=photoGlareAt(s,this.cameraTime,q.y+s.distance),offset=s.room===2&&Math.abs(ray-base)<22?(ray>=base?-12:12):0;return {x:base+offset,y:q.y+s.distance};}
 quality(s=this.target){
  if(!s)return {range:false,framed:false,clear:false,ready:false,good:false};const p=this.player,q=this.pose(s),dy=p.y-q.y;
  const range=Math.hypot(p.x-q.x,dy)<160,framed=Math.abs(dy-s.distance)<=PHOTO_AIM.halfHeight&&Math.abs(p.x-(q.x+s.view))<=PHOTO_AIM.halfWidth;
  const glare=s.room===2&&photoLight(s,this.cameraTime).active&&Math.abs(p.x-photoGlareAt(s,this.cameraTime,p.y))<9;
  const lens=photoLens(s,p),blocked=photoObstacles(this.room,this.elapsed).flatMap(photoOcclusionRects).some(r=>photoRectsOverlap(lens,r));
  const clear=!glare&&!blocked;
  return {...q,range,framed,clear,glare,blocked,good:range&&framed&&clear&&q.ready&&this.focus>=PHOTO_AIM.threshold};
 }
 get canAct(){return !this.autoShot&&!this.ended&&this.cooldown<=0&&!!this.target;}
 get actionLabel(){if(this.autoShot)return '자동 촬영';return this.focusing?'놓아 찍기':'촬영';}
 get captureCue(){
  const s=this.target;if(!s)return {kind:'done',text:'이 촬영실 완료'};const q=this.quality(s),p=this.player;
  if(this.autoShot)return {kind:'auto',text:!q.framed?'자동 촬영 · 피사체를 따라가요':q.glare?'자동 촬영 · 반사빛을 기다려요':'자동으로 초점을 맞추고 촬영해요'};
  if(!q.range)return {kind:'move',text:'대상 앞 카메라 표시로 가요'};
  if(!q.framed){const dx=q.x+s.view-p.x,dy=q.y+s.distance-p.y;return {kind:'move',text:Math.abs(dx)>Math.abs(dy)?(dx>0?'오른쪽으로 조금 이동해요':'왼쪽으로 조금 이동해요'):(dy>0?'아래로 조금 이동해요':'위로 조금 이동해요')};}
  if(!q.clear)return {kind:'blocked',text:'반사빛이 꺼질 때 찍어요'};
  if(!this.focusing)return {kind:'press',text:'촬영을 누르고 있어요'};
  if(this.focus<PHOTO_AIM.threshold)return {kind:'focus',text:'누른 채 초점을 맞춰요'};
  return q.ready?{kind:'ready',text:'지금 손을 떼어 찍어요!'}:{kind:'pose',text:q.warning?'곧 견본과 같은 모습이에요':'견본과 같은 모습을 기다려요'};
 }
 get prompt(){
  if(this.messageLeft>0)return this.message;const t=this.target;if(!t)return '이 촬영실 완료 · 다른 촬영실로 가요';const q=this.quality(t);
  return this.captureCue.text;
 }
 selectSubject(id){if(this.autoShot||this.ended||!this.subjects.some(s=>s.id===id)||this.clueSources.has(id))return false;this.cancelAction();this.selected=id;return true;}
 selectAt(x,y){
  if(this.autoShot||this.ended)return false;const pane=photoPanel(this.player);
  const live=photoLivePanel();if(this.focusing&&x>=live.x&&x<=live.x+live.w&&y>=live.y&&y<=live.y+live.h)return false;
  if(this.lastShot?.age<1.2&&x>=pane.x&&x<=pane.x+pane.w&&y>=pane.y&&y<=pane.y+pane.h)return false;
  const s=this.subjects.find(s=>{const q=this.pose(s);return !this.clueSources.has(s.id)&&Math.abs(x-q.x)<35&&y>q.y-s.height-10&&y<q.y+27;});return s?this.selectSubject(s.id):false;
 }
 beginAction(){if(!this.canAct||this.focusing)return false;this.focusId=this.target.id;this.focusing=true;this.focus=0;this.player.dir='up';this.onEvent({type:'photoFocus'});return true;}
 releaseAction(automatic=false){
  if(this.autoShot&&!automatic)return false;
  if(!this.focusing)return false;const s=this.target,q=this.quality(s);this.focusing=false;this.shots++;this.cooldown=q.good?.42:1;
  const reason=!q.range||!q.framed?'구도 밖이에요':!q.clear?'반사빛이 들어왔어요':this.focus<PHOTO_AIM.threshold?'초점이 덜 맞았어요':!q.ready?'촬영 순간을 기다려요':'';
  this.autoShot=null;this.lastShot={id:s.id,automatic,good:q.good,reason,age:0,room:this.room,elapsed:this.elapsed,cameraTime:this.cameraTime,focus:this.focus,quality:{...q},player:{x:this.player.x,y:this.player.y},lens:photoLens(s,this.player)};this.effects.push({type:'shutter',age:0,x:q.x,y:q.y});this.onEvent({type:'photoShutter',good:q.good});
  if(q.good){this.award(s.id,q.x,q.y-55);this.say('찰칵! '+s.name,1.1);this.selected=null;}else{this.misses++;this.say(reason,1.25);}
  this.focus=0;this.focusId=null;return q.good;
 }
 act(){if(this.focusing)return this.releaseAction();return this.beginAction();}
 cancelAction(){if(this.autoShot&&!this.ended)return;this.autoShot=null;this.focusing=false;this.focusId=null;this.focus=0;}
 flash(){const s=this.target;if(this.ended||this.flashes<=0||this.autoShot||!s)return false;this.cancelAction();this.selected=s.id;this.cooldown=0;if(!this.beginAction())return false;this.flashes--;this.autoShot={id:s.id,room:this.room,stuck:0,bypass:null};this.say('자동 촬영 · 피사체를 따라가 한 장을 찍어요');this.onEvent({type:'photoAuto'});return true;}
 move(dt,input){if(!this.autoShot)return super.move(dt,input);const before={x:this.player.x,y:this.player.y};this.queuedMove=null;super.move(dt,autoPhotoInput(this,dt));trackPhotoBypass(this,before,dt);}
 goRoom(index){if(this.autoShot)return false;const changed=super.goRoom(index);if(changed){this.selected=null;this.lastShot=null;}return changed;}
 blocked(x,y){return this.subjects.some(s=>Math.abs(x-this.pose(s).x)<25&&y>this.pose(s).y-10&&y<this.pose(s).y+13);}
 tick(dt){
  this.cameraTime+=dt;this.cooldown=Math.max(0,this.cooldown-dt);if(this.lastShot)this.lastShot.age+=dt;
  if(this.focusing){const q=this.quality();const gain=q.range&&q.framed&&q.clear?(this.autoShot?.85:PHOTO_AIM.focusGain):q.framed&&q.glare?-.4:-PHOTO_AIM.focusLoss;this.focus=clamp(this.focus+gain*dt,0,1);if(!this.player.moving)this.player.dir='up';if(this.autoShot&&this.quality().good)this.releaseAction(true);}
 }
}
