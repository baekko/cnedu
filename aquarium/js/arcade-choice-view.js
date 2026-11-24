import {CHARACTERS} from './config.js';

function optionCard({action,title,description,art,tone,status=''}) {
 return `<button type="button" class="mode-option mode-option--${tone}" data-arcade-action="${action}"
  aria-labelledby="mode-option-${action}" aria-describedby="mode-info-${action}">
  <span class="mode-option-copy">
   <strong id="mode-option-${action}">${title}</strong>
   <span class="mode-option-description" id="mode-info-${action}">${description}</span>
   ${status}
  </span>
  <span class="mode-option-art" data-art="${art}" aria-hidden="true"></span>
 </button>`;
}

export function drawArcadeChoices(screen,runs) {
 const adventure=screen==='mode';
 const total=runs.run?.places.length||0;
 const resumable=runs.canResume;
 const options=adventure?[
  {action:'escape',title:'미니게임 + 방탈출',description:'단서를 찾아 다음 장소를 열어요.',art:'door',tone:'mint'},
  {action:'arcade',title:'미니게임 챌린지',description:'좋아하는 게임을 골라 금화를 모아요.',art:'coin',tone:'apricot'},
 ]:[
  {action:'practice',title:'미니게임 연습하기',description:'원하는 장소에서 마음껏 연습해요.',art:'submarine',tone:'blue'},
  {action:'challenge',title:resumable?'이어서 도전하기':'미니게임 챌린지',
   description:resumable?`완료한 게임 ${runs.completed} / ${total}`:'모든 게임에 한 번씩 도전해요.',art:'trophy',tone:'apricot',
   status:resumable?`<span class="mode-option-track" aria-hidden="true"><span style="--mode-progress:${runs.completed/total*100}%"></span></span>`:''},
 ];
 document.getElementById('arcade-screen').innerHTML=`<div class="mode-choice-shell">
  <nav class="mode-choice-nav" aria-label="화면 이동">
   <button type="button" class="mode-choice-back" data-arcade-action="${adventure?'title':'mode'}" aria-label="${adventure?'처음으로 돌아가기':'모드 선택으로 돌아가기'}"><span aria-hidden="true"></span></button>
   <span class="mode-choice-brand">PLAY THE BOOK</span>
  </nav>
  <header class="mode-choice-header">
   <h1 class="arcade-title" id="arcade-title" tabindex="-1">${adventure?'어떻게<br>플레이할까요?':'미니게임<br>챌린지'}</h1>
  </header>
  <div class="mode-choice-options">${options.map(optionCard).join('')}</div>
  ${adventure?'':'<p class="mode-choice-note">완주하면 캐릭터 이름과 기록이 공유돼요.</p>'}
 </div>`;
}

export function drawResumeChoices(entries){
 const root=document.getElementById('arcade-screen');
 const options=entries.map(({mode})=>optionCard({
  action:'resume-'+mode,
  title:mode==='escape'?'미니게임 + 방탈출':'미니게임 챌린지',
  description:'',
  art:mode==='escape'?'door':'trophy',
  tone:mode==='escape'?'mint':'apricot',
 }));
 root.innerHTML=`<div class="mode-choice-shell">
  <nav class="mode-choice-nav" aria-label="화면 이동">
   <button type="button" class="mode-choice-back" data-arcade-action="title" aria-label="처음으로 돌아가기"><span aria-hidden="true"></span></button>
   <span class="mode-choice-brand">PLAY THE BOOK</span>
  </nav>
  <header class="mode-choice-header"><h1 id="arcade-title" tabindex="-1">이어서<br>도전하기</h1></header>
  <div class="mode-choice-options">${options.join('')}</div>
 </div>`;
 for(const entry of entries){
  const info=root.querySelector('#mode-info-resume-'+entry.mode);
  const avatar=document.createElement('img');
  avatar.src='./assets/'+CHARACTERS.find(character=>character.id===entry.character).asset;
  avatar.alt='';
  const status=document.createElement('span');
  status.textContent=entry.name+' · '+entry.progress;
  info.classList.add('mode-resume-profile');
  info.append(avatar,status);
 }
}
