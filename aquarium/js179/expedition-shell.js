import {PLACES,placeInfo,placeIcon} from './places.js?v=164';
import {icon} from './icons.js?v206';

export const HEADER_ACTIONS=Object.freeze([
 ['score','점수','score'],['items','아이템','backpack'],['howto','플레이 시범','howto'],['help','게임 방법','help'],['sound','소리 켜기','sound'],['restart','다시하기','restart'],['pause','일시정지','pause']
]);
export function headerActionsHTML(prefix=''){
 return HEADER_ACTIONS.map(([action,label,shape])=>{
  const id=prefix+(action==='items'?'items':action==='sound'?'sound':action)+'-button';
  const delegated=['score','items','howto','restart'].includes(action)?` data-shell-action="${action}"`:prefix&&['help','pause'].includes(action)?` data-action="${action}"`:'';
  return `<button id="${id}" type="button" class="icon-button${action==='sound'?' sound-button':''}" aria-label="${label}" title="${label}"${delegated}>${icon(shape)}</button>`;
 }).join('');
}
export function placeHeadingHTML(place){const p=placeInfo(place);return `${placeIcon(p.id)}<span>${p.name}</span>`;}
export function syncPlaceHeaders(root,place){
 for(const heading of root.querySelectorAll('.game-header h1,.ex-header h1')){
  const id=heading.closest('.ex-header')?'exchange':placeInfo(place).id;
  if(heading.dataset.place===id)continue;heading.dataset.place=id;heading.innerHTML=placeHeadingHTML(id);
 }
}
export function scoresHTML(scores,place){
 const current=placeInfo(place),active=scores.get(current.id);
 return `<div class="score-summary"><span>전체 점수<strong>${scores.total}<small>점</small></strong></span><span>${current.name}<strong>${active.total}<small> / 15점</small></strong></span></div><p class="panel-note">단서 1장에 1점 · 문제 정답은 최대 6점</p><div class="score-table-wrap"><table class="score-table"><thead><tr><th>장소</th><th>게임</th><th>문제</th><th>합계</th></tr></thead><tbody>${PLACES.map(p=>{const r=scores.get(p.id);return `<tr${p.id===current.id?' aria-current="location"':''}><th>${placeIcon(p.id)}<span>${p.name}</span></th><td>${r.played?r.game:'—'}<small> / 9</small></td><td>${r.solved?r.problem:'—'}<small> / 6</small></td><td>${r.total}<small> / 15</small></td></tr>`;}).join('')}</tbody></table></div><p class="panel-note">게임은 가장 최근 결과로 바뀌어요.<br>문제 힌트는 이 기기에서 본 횟수가 유지돼요.<br>힌트 0 / 1 / 2 / 3개 → 문제 6 / 4 / 2 / 0점</p>`;
}
export function emptyInventoryHTML(){return `<p class="panel-note">여덟 개의 작은 발견을 담을 가방이에요.</p><ol class="inventory-grid" aria-label="아이템 여덟 칸">${Array.from({length:8},(_,i)=>`<li aria-label="${i+1}번 빈 아이템 칸"><span class="empty-pocket" aria-hidden="true">${icon('pocket')}</span><small>비어 있어요</small></li>`).join('')}</ol><p class="panel-note">아직 모은 아이템이 없어요.</p>`;}
