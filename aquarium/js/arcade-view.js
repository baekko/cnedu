import {CHARACTERS} from './config.js';
import {icon} from './icons.js?v245';
import {placeIcon,placeInfo} from './places.js?v231';
import {arcadePlaces,arcadePlayer,COINS_PER_GAME} from './arcade-run.js?v246';
import {placeEntryArt} from './place-entry-art.js?v246';

export const ARCADE_SCREENS=new Set(['mode','arcade-choice','resume-choice','arcade-map','arcade-records','arcade-result']);
const root=()=>document.getElementById('arcade-screen');
const coin='<span class="arcade-coin" aria-hidden="true"></span>';
const scrollPositions={practice:0,challenge:0};

function button(action,label,{symbol='',primary=false}={}){
 return `<button type="button" class="atlas-button${primary?' atlas-button-primary':''}" data-arcade-action="${action}">${symbol?icon(symbol):''}<span>${label}</span></button>`;
}
function heading(title,note='',emblem=''){
 return `<header class="atlas-heading"><div><h1 id="arcade-title" tabindex="-1">${title}</h1>${note?'<p>'+note+'</p>':''}</div>${emblem?'<span class="atlas-emblem" aria-hidden="true">'+emblem+'</span>':''}</header>`;
}
function tally(runs,total){
 return `<div class="atlas-tally">
 <span>완료 <b>${runs.completed} / ${total}</b></span>
 <span>${coin} <b>${runs.total} / ${runs.maximum}점</b></span>
 <progress aria-label="도전 완료 수" value="${runs.completed}" max="${total}"></progress>
 </div>`;
}
function placeIllustration(place){
 const art=placeEntryArt(place);
 const image=art.thumbnail||art.image;
 const position=art.thumbnail?art.thumbnailPosition:art.position;
 return `<span class="atlas-illustration" aria-hidden="true" style="--atlas-picture:${art.tone};--atlas-picture-position:${position}">${image?`<img src="${image}" alt="" loading="lazy" decoding="async">`:placeIcon(place.id)}</span>`;
}
function mapButton(action,label){
 return `<button type="button" class="secondary-button" data-arcade-action="${action}">${label}</button>`;
}

export function drawArcadeMap(mode,runs,{reset=false,notice=''}={}){
 const challenge=mode==='challenge';
 const places=arcadePlaces().filter(place=>!challenge||runs.run.places.includes(place.id));
 const title=challenge?'미니게임 챌린지':'미니게임 연습하기';
 const instructions=challenge?'원하는 장소를 골라 한 번씩 도전하세요.':'어느 장소든 골라 연습할 수 있어요.';
 const stats=challenge?`<div class="arcade-tally"><span>완료 <b>${runs.completed} / ${places.length}</b></span><span>${coin} <b>${runs.total} / ${runs.maximum}점</b></span></div>`:'';
 root().innerHTML=`<header><h1 id="arcade-title" tabindex="-1">${title}</h1><p>${instructions}</p></header>
 ${stats}<p class="arcade-status" role="status" hidden></p>
 <div class="arcade-map-scroll" aria-label="미니게임 지도"><ol class="arcade-map">
 ${places.map((place,index)=>{
  const game=challenge?runs.run.games[place.id]:null;
  const status=game?(game.abandoned?'중단':game.coins+' / '+COINS_PER_GAME+'점'):String(index+1).padStart(2,'0');
  return `<li><button type="button" data-arcade-place="${place.id}"${game?' disabled':''}>
  <span class="arcade-map-icon">${placeIcon(place.id)}</span><span class="arcade-map-name">${place.name}</span><small>${status}</small>
  </button></li>`;
 }).join('')}
 </ol></div>
 <footer class="arcade-map-actions">
 ${challenge?mapButton('reset','다시 도전하기')+mapButton('records','기록보기'):''}
 ${mapButton('title','처음으로 돌아가기')}${mapButton('quit','게임 마치기')}
 </footer>`;
 const scroll=root().querySelector('.arcade-map-scroll');
 if(reset)scrollPositions[mode]=0;
 const savedScroll=scrollPositions[mode];
 if(savedScroll)requestAnimationFrame(()=>{if(scroll.isConnected)scroll.scrollTop=savedScroll;});
 scroll.addEventListener('scroll',()=>{scrollPositions[mode]=scroll.scrollTop;},{passive:true});
 if(!notice&&challenge&&!runs.canRecord&&Object.keys(runs.run.games).length===places.length)notice='중단한 게임이 있어 이번 기록은 저장되지 않았어요. 다시 도전할 수 있어요.';
 if(notice)showArcadeStatus(notice);
}
export function showArcadeStatus(text){
 const status=root().querySelector('.arcade-status');
 if(status){status.textContent=text;status.hidden=!text;}
}

const dateFormat=new Intl.DateTimeFormat('ko-KR',{dateStyle:'medium',timeStyle:'short'});
export function drawArcadeRecords(scope,records,message=''){
 root().innerHTML=`<div class="arcade-atlas atlas-records">${heading('챌린지 기록실','',icon('score'))}
 <div class="arcade-record-tabs atlas-tabs" role="group" aria-label="기록 종류">
 <button type="button" aria-pressed="${scope==='mine'}" data-arcade-action="records">내 기록</button>
 <button type="button" aria-pressed="${scope==='shared'}" data-arcade-action="shared">공유 기록</button>
 </div><div class="arcade-record-scroll atlas-record-scroll" aria-live="polite"></div>
 <footer class="atlas-actions">${button('map','게임맵으로 돌아가기',{primary:true})}</footer></div>`;
 fillArcadeRecords(records,message);
}
export function fillArcadeRecords(records,message){
 const list=root().querySelector('.arcade-record-scroll');
 if(!list)return;
 if(!records.length){
  const empty=document.createElement('div');
  empty.className='atlas-empty';
  empty.innerHTML=`<span class="atlas-emblem" aria-hidden="true">${icon('score')}</span><p></p>`;
  empty.querySelector('p').textContent=message;
  list.replaceChildren(empty);
  return;
 }
 const rows=records.map(row=>{
  const player=arcadePlayer(row.player);
  const character=CHARACTERS.find(c=>c.id===player.character);
  const article=document.createElement('article');article.className='arcade-record atlas-record';
  article.innerHTML=`<div class="arcade-avatar"><img src="./assets/${character.asset}" alt=""></div><div><h2></h2><time></time></div><strong></strong>`;
  article.querySelector('h2').textContent=player.name;
  const time=article.querySelector('time'),when=new Date(row.finishedAt);
  if(!Number.isNaN(+when)){time.dateTime=when.toISOString();time.textContent=dateFormat.format(when);}
  article.querySelector('strong').textContent=`${row.score} / ${row.maximum}점`;
  return article;
 });
 list.replaceChildren(...rows);
}

export function drawArcadeResult({place,mode,coins,detail,finished},runs){
 root().innerHTML=`<div class="arcade-result atlas-result">
 ${heading(placeInfo(place).name+' 결과')}
 <div class="atlas-result-stamp">
 <div class="atlas-result-picture">${placeIllustration(placeInfo(place))}</div>
 <div class="atlas-result-score">${coin}<strong>${coins}<small> / ${COINS_PER_GAME}</small></strong><span>모은 금화</span></div>
 <div class="atlas-coin-track" aria-hidden="true">${Array.from({length:COINS_PER_GAME},(_,index)=>index<coins?coin:'<span class="atlas-empty-coin"></span>').join('')}</div>
 </div>
 <p class="arcade-status atlas-result-detail" role="status" hidden></p>
 ${mode==='challenge'?tally(runs,runs.run.places.length):''}
 <footer class="atlas-actions">${mode==='practice'?button('again','이 게임 다시하기',{symbol:'restart'}):''}${button('map','게임맵으로 돌아가기',{primary:true})}</footer>
 </div>`;
 showArcadeStatus([detail,finished?'전체 게임을 완주했어요. 기록실에서 확인하세요.':''].filter(Boolean).join(' '));
}

export function popArcadeCoins(count,position){
 const target=document.getElementById('arcade-coin-effects');
 for(let i=0;i<count;i++){
  const effect=document.createElement('span');
  effect.className='arcade-coin-pop';effect.innerHTML=coin+'<small>+10point</small>';
  effect.style.left=position?.x ?? '50%';effect.style.top=position?.y ?? '36%';
  if(position&&parseFloat(position.x)>target.clientWidth-55)effect.classList.add('arcade-coin-pop-inward');
  effect.style.setProperty('--pop-shift',(i-(count-1)/2)*13+'px');
  effect.style.animationDelay=Math.min(i,8)*65+'ms';
  effect.addEventListener('animationend',()=>effect.remove(),{once:true});
  target.append(effect);
 }
}
