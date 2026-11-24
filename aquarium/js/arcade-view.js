import {CHARACTERS} from './config.js';
import {placeIcon,placeInfo} from './places.js?v231';
import {arcadePlaces,arcadePlayer,COINS_PER_GAME} from './arcade-run.js?v245';

export const ARCADE_SCREENS=new Set(['mode','arcade-choice','arcade-map','arcade-records','arcade-result']);
const root=()=>document.getElementById('arcade-screen');
const coin='<span class="arcade-coin" aria-hidden="true"></span>';
const button=(action,label,style='secondary-button')=>`<button type="button" class="${style}" data-arcade-action="${action}">${label}</button>`;
const title=(heading,note='')=>`<header><h1 id="arcade-title" tabindex="-1">${heading}</h1>${note?'<p>'+note+'</p>':''}</header>`;

export function drawArcadeChoices(screen,runs){
 if(screen==='mode'){
  root().innerHTML=`<div class="arcade-choice">${title('어떻게 플레이할까요?')}<div class="arcade-choices">${button('escape','미니게임 + 방탈출','primary-button')}${button('arcade','미니게임 챌린지','secondary-button')}</div></div>`;
  return;
 }
 const resumable=runs.run&&runs.completed<runs.run.places.length;
 root().innerHTML=`<div class="arcade-choice">${title('미니게임 챌린지')}<div class="arcade-choices">
 ${button('practice','미니게임 연습하기','primary-button')}
 ${button('challenge',resumable?'이어서 도전하기':'미니게임 챌린지','secondary-button')}
 </div><p class="arcade-note">${resumable?'완료한 게임과 점수는 이 브라우저에 저장돼요.':'원하는 순서로 모든 게임에 한 번씩 도전해요.'}<br>완주하면 캐릭터 이름과 기록이 공유돼요.</p>
 </div>`;
}

export function drawArcadeMap(mode,runs,{reset=false,notice=''}={}){
 const challenge=mode==='challenge';
 const places=arcadePlaces().filter(p=>!challenge||runs.run.places.includes(p.id));
 const previousScroll=reset?0:root().querySelector('.arcade-map-scroll')?.scrollTop||0;
 const stats=challenge?`<div class="arcade-tally"><span>완료 <b>${runs.completed} / ${places.length}</b></span><span>${coin} <b>${runs.total} / ${runs.maximum}점</b></span></div>`:'';
 root().innerHTML=`${title(challenge?'미니게임 챌린지':'미니게임 연습하기',challenge?'원하는 장소를 골라 한 번씩 도전하세요.':'어느 장소든 골라 연습할 수 있어요.')}
 ${stats}<p class="arcade-status" role="status" hidden></p>
 <div class="arcade-map-scroll" aria-label="미니게임 지도"><ol class="arcade-map">
 ${places.map((place,index)=>{
  const game=challenge?runs.run.games[place.id]:null;
  return `<li><button type="button" data-arcade-place="${place.id}"${game?' disabled':''}><span class="arcade-map-icon">${placeIcon(place.id)}</span><span class="arcade-map-name">${place.name}</span><small>${game?(game.abandoned?'중단':game.coins+' / '+COINS_PER_GAME+'점'):String(index+1).padStart(2,'0')}</small></button></li>`;
 }).join('')}</ol></div>
 <footer class="arcade-map-actions">
 ${challenge?button('reset','다시 도전하기')+button('records','기록보기'):''}
 ${button('title','처음으로 돌아가기')}${button('quit','게임 마치기')}
 </footer>`;
 root().querySelector('.arcade-map-scroll').scrollTop=previousScroll;
 if(!notice&&challenge&&!runs.canRecord&&Object.keys(runs.run.games).length===places.length)notice='중단한 게임이 있어 이번 기록은 저장되지 않았어요. 다시 도전할 수 있어요.';
 if(notice)showArcadeStatus(notice);
}
export function showArcadeStatus(text){
 const status=root().querySelector('.arcade-status');
 if(status){status.textContent=text;status.hidden=!text;}
}

const dateFormat=new Intl.DateTimeFormat('ko-KR',{dateStyle:'medium',timeStyle:'short'});
export function drawArcadeRecords(scope,records,message=''){
 root().innerHTML=`${title('챌린지 기록실')}<div class="arcade-record-tabs" role="group" aria-label="기록 종류">
 <button type="button" aria-pressed="${scope==='mine'}" data-arcade-action="records">내 기록</button>
 <button type="button" aria-pressed="${scope==='shared'}" data-arcade-action="shared">공유 기록</button>
 </div><div class="arcade-record-scroll" aria-live="polite"></div><footer>${button('map','게임맵으로 돌아가기')}</footer>`;
 fillArcadeRecords(records,message);
}
export function fillArcadeRecords(records,message){
 const list=root().querySelector('.arcade-record-scroll');
 if(!list)return;
 if(!records.length){
  const text=document.createElement('p');
  text.className='arcade-empty';text.textContent=message;
  list.replaceChildren(text);
  return;
 }
 const rows=records.map(row=>{
  const player=arcadePlayer(row.player);
  const character=CHARACTERS.find(c=>c.id===player.character);
  const article=document.createElement('article');article.className='arcade-record';
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
 root().innerHTML=`<div class="arcade-result">
 ${title(placeInfo(place).name+' 결과')}
 <div class="arcade-result-coin">${coin}<strong>${coins}<small> / ${COINS_PER_GAME}</small></strong><span>모은 금화</span></div>
 <p class="arcade-status" role="status"></p>
 ${mode==='challenge'?`<div class="arcade-tally"><span>완료 <b>${runs.completed} / ${runs.run.places.length}</b></span><span>총점 <b>${runs.total} / ${runs.maximum}점</b></span></div>`:''}
 <footer>${mode==='practice'?button('again','이 게임 다시하기'):''}${button('map','게임맵으로 돌아가기','primary-button')}</footer>
 </div>`;
 showArcadeStatus([detail,finished?'전체 게임을 완주했어요. 기록실에서 확인하세요.':''].filter(Boolean).join(' '));
}

export function popArcadeCoins(count,position){
 const target=document.getElementById('arcade-coin-effects');
 for(let i=0;i<count;i++){
  const effect=document.createElement('span');
  effect.className='arcade-coin-pop';effect.innerHTML=coin+'<small>+10point</small>';
  effect.style.left=position?.x ?? '50%';effect.style.top=position?.y ?? '36%';
  effect.style.setProperty('--pop-shift',(i-(count-1)/2)*19+'px');
  effect.style.animationDelay=Math.min(i,8)*65+'ms';
  effect.addEventListener('animationend',()=>effect.remove(),{once:true});
  target.append(effect);
 }
}
