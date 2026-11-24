import {CinemaMovies179} from './cinema-video179.js?v180';
import {CINEMA_MOVIES179} from './cinema-movies179.js?v204-final40';
import {FieldRenderer,box,text} from './field-renderer.js?v245';
import {beginScene} from './layout.js';
import {drawClueCard} from './clue-card-art.js?v245';
import {CINEMA_FILMS,FILM_BY_ID} from './cinema-films.js?v204-final40';
import {CINEMA_SCREEN,CINEMA_CHOICES} from './cinema-ui.js?v204-final40';
import {cinemaScene} from './cinema-scenes.js?v180';
import {drawCinemaRain} from './cinema-rain.js?v180';
import {drawCinemaPanorama,drawCinemaAmbience,drawCinemaConsequences} from './cinema-effects.js?v180';
import {drawCinemaStory} from './cinema-story-renderer.js?v180';
const asset=path=>new URL('../assets/'+path,import.meta.url).href;
// Register the hands to the two armrests of the middle foreground seat.
// Its position also keeps the viewer below the four answer choices.
const auditoriumViewer={x:194,y:480,scale:.18};
async function picture(path){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(Error('영화관 그림을 불러오지 못했어요: '+path));im.src=asset(path);});}
async function json(path){const r=await fetch(asset(path));if(!r.ok)throw Error('영화관 그림 정보 오류: '+path);return r.json();}
export async function loadCinemaAssets(character){
 const images={films:{},filmExtras:{},movies:new CinemaMovies179(CINEMA_MOVIES179,{maxLoaded:3})};
 images.ensureFilm=async id=>{const q=await images.movies.ensure(id);for(const old of Object.keys(images.films))if(!images.movies.ready(old))delete images.films[old];images.films[id]=q.video;return q.video;};
 await Promise.all([
  ...[['cinema-v167/auditorium.webp','room0'],['cinema-v165/auditorium.webp','originalSeats'],['cinema/projector.webp','entrance'],['cinema-v166/seated/'+character.id+'.webp','seated'],['cinema-v165/chairs-foreground.webp','chairs']].map(async([p,k])=>images[k]=await picture(p)),
  images.ensureFilm('matrix'),json('cinema-v165/seating.json').then(v=>images.seating=v),json('cinema-v166/seated/seating.json').then(v=>images.spectator=v)
 ]);return images;
}
function lines(c,s,x,y,width,size=11,color='#fff1d0',max=2){
 c.font='700 '+size+'px sans-serif';c.fillStyle=color;c.textAlign='center';c.textBaseline='middle';let line='',out=[];
 for(const word of s.split(' ')){const next=line?line+' '+word:word;if(line&&c.measureText(next).width>width){out.push(line);line=word;}else line=next;}if(line)out.push(line);
 out.slice(0,max).forEach((v,i)=>c.fillText(v,x,y+i*(size+4)));
}
export class CinemaRenderer extends FieldRenderer{
 film(c,film,age,screen=CINEMA_SCREEN){
  if(this.images.movies){c.save();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.fillStyle='#070a0b';c.fillRect(screen.x-2,screen.y-2,screen.w+4,screen.h+4);if(!this.images.movies.draw(c,film.id,screen)){this.images.ensureFilm(film.id).catch(()=>{});text(c,this.images.movies.error||'영화를 불러오고 있어요',screen.x+screen.w/2,screen.y+screen.h/2,10,'#eadbbc');}c.restore();return;}
  // Historical composition below is retained for formula regression fixtures.
  // Production loader always supplies finite v179 native movies.

  if(!this.images.films[film.id]){
   this.images.ensureFilm?.(film.id).catch(()=>{});
   c.save();c.fillStyle='#111e23';c.fillRect(screen.x,screen.y,screen.w,screen.h);text(c,this.images.error||'영화를 불러오고 있어요',screen.x+screen.w/2,screen.y+screen.h/2,10,'#eadbbc');c.restore();return;
  }
  const pose=cinemaScene(film,age);
  c.save();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
  // Cover the painted white projection surface all the way to its black mask.
  // The aperture is separate from the video: it never follows a flying actor.
  c.fillStyle='#070a0b';c.fillRect(screen.x-2,screen.y-2,screen.w+4,screen.h+4);
  c.beginPath();c.rect(screen.x,screen.y,screen.w,screen.h);c.clip();
  const extras=this.images.filmExtras?.[film.id]||{};
  if(extras.plate){c.drawImage(extras.plate,0,0,extras.plate.width,extras.plate.height,screen.x,screen.y,screen.w,screen.h);
  }else if(extras.panorama&&pose.panoramaX!==null){
   c.save();c.translate(screen.x,screen.y);c.scale(screen.w/320,screen.h/180);
   drawCinemaPanorama(c,extras.panorama,pose.panoramaX);c.restore();
  }else{const im=this.images.films[film.id],k=(im.width||960)/960;c.drawImage(im,...pose.background.map(v=>v*k),screen.x,screen.y,screen.w,screen.h);}
  // Keep one320×180 movie coordinate system and whole-body actions.
  // Only the explicit travelling camera reads a wider fixed world painting.
  c.save();c.translate(screen.x,screen.y);c.scale(screen.w/320,screen.h/180);
  if(film.id==='inception'){
   c.fillStyle='#17121c38';c.beginPath();c.ellipse(160,164,24,3,0,0,Math.PI*2);c.fill();
  }
  if(film.id==='shawshank')drawCinemaRain(c,age,film.seconds,'back');
  if(['jurassic','singinrain'].includes(film.id))drawCinemaRain(c,age,film.seconds,'back');
  drawCinemaAmbience(c,film,age,pose);
  drawCinemaConsequences(c,film,age,pose);
  if(extras.case&&pose.extra?.caseOnWater)c.drawImage(extras.case,0,0,extras.case.width,extras.case.height,0,0,320,180);
  if(film.id==='cinderella'){const im=this.images.films[film.id],k=(im.width||960)/960;c.drawImage(im,856*k,290*k,18*k,14*k,216,110,18,14);}
  c.save();
  c.translate(pose.offset[0],pose.offset[1]);
  if(pose.rotation){c.translate(...pose.pivot);c.rotate(pose.rotation);c.translate(-pose.pivot[0],-pose.pivot[1]);}
  if(drawCinemaStory.call(this,c,film,pose,extras,this.images.films[film.id])){
   // The film-specific shot owns complete bodies and independent rigid props.
  }else if(pose.flip&&['wizardoz','leon','peterpan'].includes(film.id)){
   // Turn each COMPLETE character about its own position. Reflecting the
   // entire four-person layer would incorrectly swap their order at the turn.
   const figures=film.id==='leon'?[[125,174,155],[174,215,188]]:film.id==='peterpan'?[[85,153,120],[160,237,201]]:[[30,85,58],[86,150,120],[150,219,184],[220,285,252]];
   for(const [left,right,anchor] of figures){
    c.save();c.translate(anchor*2,0);c.scale(-1,1);
    c.drawImage(this.images.films[film.id],pose.source[0]+left,pose.source[1],right-left,180,left,0,right-left,180);c.restore();
   }
  }else{
   if(pose.flip){c.translate(320,0);c.scale(-1,1);}
   const im=pose.actionSheet&&extras[pose.actionSheet]||this.images.films[film.id],k=(im.width||960)/960;c.drawImage(im,...pose.source.map(v=>v*k),0,0,320,180);
  }
  c.restore();
  if(film.id==='shawshank')drawCinemaRain(c,age,film.seconds,'front');
  if(['jurassic','singinrain'].includes(film.id))drawCinemaRain(c,age,film.seconds,'front');
  drawCinemaAmbience(c,film,age,pose,true);
  drawCinemaConsequences(c,film,age,pose,true);
  c.restore();
  c.restore();
 }
 seated(c,x,y,k){
  const m=this.images.spectator;
  c.save();c.translate(x-m.anchor[0]*k,y-m.anchor[1]*k);c.scale(k,k);
  c.drawImage(this.images.seated,0,0,...m.sourceCell);c.restore();
 }
 seatedInAuditorium(c){
  c.save();
  c.beginPath();
  // The visible head ends at the curved top of the painted centre chair.
  c.moveTo(150,400);c.lineTo(239,400);c.lineTo(239,470);c.lineTo(219,470);
  c.bezierCurveTo(217,463,210,459.1,195,459.1);
  c.bezierCurveTo(180,459.1,173,463,171,470);
  c.lineTo(150,470);c.closePath();
  // The hands can rest over the armrests on either side of the backrest.
  c.moveTo(161,479);c.quadraticCurveTo(163,474,168,474.5);
  c.lineTo(172.5,475.5);c.lineTo(172.2,481.5);c.lineTo(163,481.5);c.closePath();
  c.moveTo(217.5,475.5);c.lineTo(223,474.5);c.quadraticCurveTo(227.5,474.5,229,479);
  c.lineTo(227,481.5);c.lineTo(218.5,481.5);c.closePath();
  c.clip();
  const {x,y,scale}=auditoriumViewer;
  this.seated(c,x,y,scale);
  c.restore();
 }
 draw(g,character,_time=0,_dt=0,active=false){
  this.images.movies?.sync(g.film.id,active&&!document.hidden&&!g.ended&&['watch','choose'].includes(g.phase),g.clipAge,g);
  const c=this.c;beginScene(c);c.clearRect(0,0,390,844);c.save();c.translate(0,170);
  // Register the new thin cinema masking to an exact 16:9 projected picture.
  c.drawImage(this.images.room0,0,0,780,450,0,0,390,242);
  c.drawImage(this.images.room0,0,450,780,375,0,242,390,170.5);
  // Keep the approved fourteen chairs and their contact coordinates unchanged.
  c.drawImage(this.images.originalSeats,0,825,780,175,0,412.5,390,87.5);
  this.film(c,g.film,g.clipAge);
  const chair=this.images.seating.foreground;c.drawImage(this.images.chairs,...chair.source,...chair.target);
  this.seatedInAuditorium(c);
  this.copy(c,g);
  for(const e of g.effects)if(e.type==='card'){c.save();c.globalAlpha=Math.max(0,1-e.age);drawClueCard(c,195,242-e.age*24,16,21);c.restore();}
  c.restore();
 }
 copy(c,g){
  if(g.phase==='feedback'||g.ended&&g.feedback){
   box(c,25,243,340,27,g.feedback.correct?'#e7f4e7f5':'#fae9cef5',7);
   text(c,(g.feedback.correct?'맞았어요!  ':'정답은 ')+g.feedback.title,195,256,11,g.feedback.correct?'#426a54':'#815137');
  }else if(g.hintShown){box(c,25,240,340,31,'#fff3d5f5',7);lines(c,g.film.hint,195,248,320,10,'#69523b',2);}
  else{const left=Math.max(0,3-g.clipAge);text(c,g.phase==='watch'?`${Math.max(1,Math.ceil(left))}초 뒤에 보기가 나와요`:'어떤 영화일까요?',195,256,11,'#f8e4ba');}
  if(!g.choicesVisible&&!g.ended)return;
  const b=CINEMA_CHOICES;
  for(let i=0;i<4;i++){
   const y=b.y+i*(b.h+b.gap),id=g.options[i],chosen=g.selected===i,correct=!!g.feedback&&id===g.film.id;
   box(c,b.x,y,b.w,b.h,correct?'#e0efdc':chosen?'#f8dea0':'#f5eddcf5',7);
   c.strokeStyle=correct?'#72a583':chosen?'#d5a84b':'#b5ad9355';c.lineWidth=chosen||correct?2:1;c.stroke();
   text(c,FILM_BY_ID[id].title,195,y+b.h/2,12,correct?'#3a6348':'#455b54');
  }
 }

 briefing(c,character,time=0){
  box(c,19,5,142,70,'#111719',2);box(c,23,9,134,62,'#192b39',0);
  this.film(c,FILM_BY_ID.matrix,time,{x:25,y:11,w:130,h:58});
  this.seated(c,90,95,55/this.images.spectator.sourceCell[1]);
 }
}
