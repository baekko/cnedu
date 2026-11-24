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

export function drawArcadeChoices(runs) {
 const total=runs.run?.places.length||0;
 const resumable=runs.canResume;
 const options=[
  {action:'practice',title:'미니게임 연습하기',description:'원하는 장소에서 마음껏 연습해요.',art:'submarine',tone:'blue'},
  {action:'challenge',title:resumable?'이어서 도전하기':'미니게임 챌린지',
   description:resumable?`완료한 게임 ${runs.completed} / ${total}`:'모든 게임에 한 번씩 도전해요.',art:'trophy',tone:'apricot',
   status:resumable?`<span class="mode-option-track" aria-hidden="true"><span style="--mode-progress:${runs.completed/total*100}%"></span></span>`:''},
 ];
 document.getElementById('arcade-screen').innerHTML=`<div class="mode-choice-shell">
  <nav class="mode-choice-nav" aria-label="화면 이동">
   <button type="button" class="mode-choice-back" data-arcade-action="title" aria-label="처음으로 돌아가기"><span aria-hidden="true"></span></button>
   <span class="mode-choice-brand">PLAY THE BOOK</span>
  </nav>
  <header class="mode-choice-header">
   <h1 class="arcade-title" id="arcade-title" tabindex="-1">미니게임<br>챌린지</h1>
  </header>
  <div class="mode-choice-options">${options.map(optionCard).join('')}</div>
  <p class="mode-choice-note">완주하면 캐릭터 이름과 기록이 공유돼요.</p>
 </div>`;
}
