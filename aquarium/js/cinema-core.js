import {FieldGame} from './field-base.js';
import {FILM_BY_ID,makeCinemaPlan,normalizeCinemaPlan,filmChoices} from './cinema-films.js?v204-final40';
export const CINEMA=Object.freeze({duration:Infinity,timed:false,flashes:2,choiceDelay:3,feedbackSeconds:.85,answer:'영사기',hints:['영화 필름의 그림을 빛으로 스크린에 비추는 기계예요.','영으로 시작하는 세 글자예요. 카메라는 찍고, 이것은 보여 줘요.']});
export class CinemaGame extends FieldGame{
 constructor({onEvent=()=>{},random=Math.random,plan=null,runPlan=null,filmReady=()=>true,filmTime=null}={}){
  super(CINEMA.duration,onEvent);this.edition='moviequiz';this.random=random;this.runPlan=normalizeCinemaPlan(plan||runPlan)||makeCinemaPlan(random);
  this.filmReady=filmReady;this.filmTime=filmTime;this.flashes=CINEMA.flashes;this.round=0;this.clipAge=0;this.phase='watch';this.selected=-1;this.answers=[];this.hintShown=false;this.feedback=null;this.feedbackLeft=0;this.options=filmChoices(this.film.id,random);
  Object.assign(this.player,{x:195,y:474,dir:'up',moving:false});
 }
 get film(){return FILM_BY_ID[this.runPlan[Math.min(8,this.round)]];}
 get canMove(){return false;}
 get canAct(){return !this.ended&&this.phase==='choose'&&this.selected>=0;}
 get choicesVisible(){return ['choose','feedback'].includes(this.phase);}
 get itemKind(){return 'filmInfo';}get itemLabel(){return '영화 정보';}get itemTip(){return '지금 영화의 이야기 힌트 · 2회';}
 get actionLabel(){return '결정';}get prompt(){return '';}
 get statusDescription(){return `${Math.min(9,this.round+1)} / 9 · ${this.phase==='watch'?'상영 중':this.phase==='choose'?'제목 고르기':'정답 확인'}`;}
 move(){} goRoom(){return false;} cancelAction(){} releaseAction(){return false;}
 movePlayer(_dt,input){return this.selectByOffset(input.y||input.x);}
 selectByOffset(offset){if(this.ended||this.phase!=='choose'||!offset)return false;this.selected=this.selected<0?(offset>0?0:3):(this.selected+(offset>0?1:3))%4;return true;}
 select(index){if(this.ended||this.phase!=='choose'||!Number.isInteger(index)||index<0||index>3)return false;this.selected=index;return true;}
 choose(index){return this.select(index)&&this.act();}
 beginAction(){return this.act();}
 act(){
  if(!this.canAct)return false;
  const chosen=this.options[this.selected],correct=chosen===this.film.id;
  this.feedback={correct,title:this.film.title,chosen,reason:this.film.reason};this.answers.push({film:this.film.id,chosen,correct});
  this.phase='feedback';this.feedbackLeft=CINEMA.feedbackSeconds;
  if(correct)this.award(this.round,195,238);
  this.onEvent({type:'cinemaAnswer',correct,title:this.film.title});return true;
 }
 flash(){if(this.ended||this.flashes<1||this.hintShown||this.phase==='feedback')return false;this.flashes--;this.hintShown=true;this.onEvent({type:'cinemaHint'});return true;}
 tick(dt){
  if(this.phase==='feedback'){
   this.feedbackLeft=Math.max(0,this.feedbackLeft-dt);
   if(this.feedbackLeft>1e-8)return;
   if(this.round===8){this.finish(true);return;}
   this.round++;this.clipAge=0;this.phase='watch';this.selected=-1;this.hintShown=false;this.feedback=null;this.options=filmChoices(this.film.id,this.random);return;
  }
  if(!this.filmReady(this.film.id))return;
  if(this.filmTime){const t=this.filmTime(this.film.id);if(!Number.isFinite(t))return;this.clipAge=Math.max(this.clipAge,Math.min(8,t));}else this.clipAge=Math.min(8,this.clipAge+dt);
  if(this.phase==='watch'&&this.clipAge+1e-8>=CINEMA.choiceDelay){this.phase='choose';this.onEvent({type:'cinemaChoices'});}
 }
 restoreResult(rec){super.restoreResult(rec);this.round=Math.min(8,Math.max(0,(rec.answered||1)-1));}
}
