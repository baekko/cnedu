import {PLACES,placeIcon} from './places.js?v231';
import {placeEntryArt} from './place-entry-art.js?v246';

function addArtwork(container,source,style){
 if(!source)return;
 const image=document.createElement('img');
 image.alt='';
 image.decoding='async';
 image.draggable=false;
 image.className=style;
 image.src=source;
 image.addEventListener('error',()=>image.hidden=true,{once:true});
 container.append(image);
}

export function drawPlaceEntry(screen,{place,character,enterButton}){
 const entry=placeEntryArt(place);
 const card=document.createElement('article');
 card.className='stage-entry-card';
 card.innerHTML=`
  <header class="stage-entry-header">
   <span class="wordmark">PLAY THE BOOK</span>
   <span class="stage-entry-progress"></span>
  </header>
  <figure class="stage-entry-scene" aria-hidden="true">
   <div class="stage-entry-picture"></div>
   <span class="stage-entry-icon">${placeIcon(place.id)}</span>
  </figure>
  <div class="stage-entry-heading">
   <p>어서오세요, 이곳은</p>
   <h1 id="stage-title" tabindex="-1"></h1>
  </div>
  <div class="stage-entry-brief">
   <span class="stage-entry-avatar"><img id="stage-character" alt="" draggable="false"></span>
   <div><strong id="stage-companion"></strong><p class="stage-placeholder" aria-live="polite"></p></div>
  </div>
  <footer class="stage-entry-actions"></footer>`;
 const figure=card.querySelector('.stage-entry-picture');
 figure.classList.toggle('no-object',!entry.object);
 addArtwork(figure,entry.image,'stage-entry-setting');
 addArtwork(figure,entry.object,'stage-entry-object');
 if(!entry.image&&!entry.object)figure.insertAdjacentHTML('beforeend',`<span class="stage-entry-fallback">${placeIcon(place.id)}</span>`);
 const stage=PLACES.findIndex(item=>item.id===place.id)+1;
 const progress=card.querySelector('.stage-entry-progress');
 progress.textContent=stage+' / '+PLACES.length;
 progress.setAttribute('aria-label','전체 '+PLACES.length+'곳 중 '+stage+'번째 장소');
 card.querySelector('#stage-title').textContent=place.name;
 const hero=card.querySelector('#stage-character');
 if(character?.asset)hero.src='./assets/'+character.asset;
 else hero.hidden=true;
 card.querySelector('#stage-companion').textContent=character?.name||'모험가';
 card.querySelector('.stage-placeholder').textContent=place.description;
 enterButton.hidden=!place.playable;
 enterButton.disabled=false;
 enterButton.textContent=place.name+' 입장하기';
 card.querySelector('.stage-entry-actions').append(enterButton);
 screen.dataset.place=place.id;
 screen.style.setProperty('--entry-position',entry.position);
 screen.style.setProperty('--entry-ink',entry.ink);
 screen.style.setProperty('--entry-paper',entry.paper);
 screen.style.setProperty('--entry-tone',entry.tone);
 screen.replaceChildren(card);
}
