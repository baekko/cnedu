import {PLACES,placeInfo,placeIcon} from './places.js?v231';
import {icon} from './icons.js?v245';

export const HEADER_ACTIONS=Object.freeze([
 ['score','점수','score','장소별 점수와 전체 점수를 봐요.'],
 ['items','아이템','backpack','아이템 가방을 열어요.'],
 ['howto','플레이 시범','howto','움직이는 하우투를 다시 봐요.'],
 ['help','게임 방법','help','이 장소의 규칙을 읽어요.'],
 ['sound','소리','sound','게임 소리를 켜거나 꺼요.'],
 ['restart','다시하기','restart','이 게임을 처음부터 시작해요.'],
 ['replay','지난 게임 다시하기','replay','지나온 장소를 골라 다시 해요.'],
 ['quit','게임 마치기','exit','확인한 뒤 게임을 마쳐요.'],
]);
export function headerActionsHTML(prefix=''){
 return `<button id="${prefix}menu-button" type="button" class="icon-button status-menu-button" aria-haspopup="dialog" aria-expanded="false" aria-controls="utility-overlay" data-shell-action="menu">menu</button>`;
}
export function statusMenuHTML(exclusions=[]){
 return HEADER_ACTIONS.filter(([action])=>!exclusions.includes(action)).map(([action,label,shape,description])=>{
  const id='menu-action-'+action;
  return `<button type="button" id="${id}" class="menu-action" data-menu-action="${action}" aria-labelledby="${id}-label" aria-describedby="${id}-description"><span class="menu-action-icon" aria-hidden="true">${icon(shape)}</span><span class="menu-action-copy"><b id="${id}-label">${label}</b><small id="${id}-description">${description}</small></span></button>`;
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
