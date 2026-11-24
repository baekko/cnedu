import {CITYHALL,CITY_CLUE_RULE,CITY_CLUE_THRESHOLDS,CITY_DIALOGUE,cityClueCount} from './cityhall-core.js?v=144';

const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const lines=value=>esc(value).replace(/([.!?])\s+/g,'$1<br>');
const delta=n=>n>0?'+'+n:n<0?'−'+Math.abs(n):'0';

export function syncCityStats(g,find,coinMode=false){
 const count=cityClueCount(g.approval),next=CITY_CLUE_THRESHOLDS[count];
 for(const [id,value] of [['city-round',`${g.round} / ${CITYHALL.rounds}`],['city-approval',g.approval+'%'],
  ['city-target',`${count} / ${CITYHALL.maxClues}`],['city-next-clue',next===undefined?(coinMode?'금화 9개 기준 달성':'9장 기준 달성'):`${next}%에 ${count+1}${coinMode?'개':'장'}`]]){
  const el=find(id);if(el.textContent!==value)el.textContent=value;
 }
}
export function syncCityAction(g,button,active){
 const label=g.actionLabel,access={보고:'첫 보고 받기',결재:'선택한 정책 결재하기',다음:g.deskOpened?'다음 안건':'대화 다음',결과:'최종 지지율 보기'}[label];
 if(button.textContent!==label)button.textContent=label;
 if(button.getAttribute('aria-label')!==access)button.setAttribute('aria-label',access);
 const disabled=!active||!g.actionReady;if(button.disabled!==disabled)button.disabled=disabled;
}
function clueThresholds(){
 return `<table class="city-clue-goals" aria-label="단서별 최소 지지율"><tbody>
 <tr><th scope="row">단서</th>${CITY_CLUE_THRESHOLDS.map((_,i)=>`<td>${i+1}장</td>`).join('')}</tr>
 <tr><th scope="row">지지율</th>${CITY_CLUE_THRESHOLDS.map(n=>`<td>${n}%</td>`).join('')}</tr></tbody></table>`;
}
function dialogue(g){
 const rule=g.introPage===1?`<div class="city-clue-guide"><p>${lines(CITY_CLUE_RULE)}</p>${clueThresholds()}</div>`:'';
 return `<div class="city-kicker">첫날 · 시장 집무실</div><div class="city-dialogue"><span class="city-speaker" aria-hidden="true"></span><div><h2>비서실 직원</h2><p>${esc(CITY_DIALOGUE[g.introPage]).replace(/\.\s+/g,'.<br>')}</p></div></div>${rule}`;
}
export function citySummaryHTML(g){
 return `<div class="city-kicker">시장 집무실 · 결재 완료</div><h2 id="cityhall-summary-title">여섯 정책의 결과</h2><p class="city-summary-lead">시민의 평가를 확인하고 퇴근하세요.</p><ol class="city-summary-list">${g.history.map(r=>`<li><div><b>${esc(r.title)}</b><span>${r.before}% → ${r.after}% <strong class="${r.after<r.before?'city-down':'city-up'}">${delta(r.after-r.before)}%p</strong></span></div><p>${esc(r.policy)} · ${esc(r.reason)}</p></li>`).join('')}</ol><div class="city-summary-total"><span>최종 지지율</span><strong>${g.approval}%</strong><span>단서 ${g.clueCount}장</span></div>`;
}
function ledger(g){
 if(!g.history.length)return '';
 return `<details class="city-file"><summary>결재 기록</summary><ol>${g.history.map(r=>`<li><b>${esc(r.policy)}</b><span>${r.before}% → ${r.after}%</span></li>`).join('')}</ol></details>`;
}
function report(g){
 const recommended=g.advice?g.options.find(p=>p.change===8):null;
 return `<div class="city-case-report"><h2 tabindex="-1">${esc(g.case.agenda.title)}</h2>
 <div class="city-report-list">${g.reports.map((r,i)=>`<p class="${recommended&&i===1?'city-advised-fact':''}"><b>${recommended&&i===1?'전문가<br>조언':esc(r.from)}</b><span>${lines(r.text)}</span></p>`).join('')}</div></div>
 <div class="city-policy-sheet"><p class="city-policy-instruction" role="status">${recommended?`전문가 추천 · ${esc(recommended.name)}`:'네 정책을 비교하고 하나를 선택하세요'}</p>
 <div class="city-policy-list" role="group" aria-label="결재할 정책 네 개">${g.options.map(p=>`<button type="button" class="city-policy ${recommended?.id===p.id?'city-expert-pick':''}" data-city-policy="${p.id}" aria-pressed="${p.id===g.selectedPolicy}" ${recommended?.id===p.id?'aria-description="정책 전문가가 추천한 정책"':''}><span class="city-choice-dot" aria-hidden="true"></span><span class="city-choice-content"><span class="city-policy-heading"><strong>${esc(p.name)}</strong>${p.timing?`<small>${esc(p.timing)}</small>`:''}</span><span>${lines(p.text)}</span></span></button>`).join('')}</div></div>`;
}
function review(g){
 const r=g.review,trend=r.after-r.before,before=cityClueCount(r.before),after=cityClueCount(r.after);
 return `<div class="city-kicker">정책 시행 결과 · ${g.round} / ${CITYHALL.rounds}</div><h2 tabindex="-1">${esc(r.policy)}</h2>
 <div class="city-trend"><span>지지율</span><strong>${r.before}% → ${r.after}%</strong><b class="${trend<0?'city-down':'city-up'}">${delta(trend)}%p</b></div>
 <p class="city-rule">${lines(r.reason)}</p>
 <details class="city-file"><summary>예상 단서 <b>${before===after?`${after}장`:`${before}장 → ${after}장`}</b></summary>${clueThresholds()}</details>${ledger(g)}`;
}
export class CityHallUI{
 constructor(panel,game,onSelect){
  this.panel=panel;this.game=game;this.signature='';this.selected=null;
  panel.onclick=onSelect?event=>{
   const b=event.target.closest('button[data-city-policy]');
   if(b&&!b.disabled)onSelect(Number(b.dataset.cityPolicy));
  }:null;
 }
 render(active){
  const g=this.game,p=this.panel,intro=!g.deskOpened;
  const visible=active&&!g.ended&&!g.stamping&&(!intro||g.staffArrived);
  p.hidden=!visible;
  if(!visible)return;
  const key=intro?'intro:'+g.introPage:`${g.round}:${g.phase}:${g.adviceTurn}`;
  if(this.signature!==key){
   this.signature=key;p.classList.toggle('city-selecting',!intro&&g.phase==='report');p.innerHTML=intro?dialogue(g):g.phase==='report'?report(g):review(g);
   this.selected=null;p.scrollTop=0;
  }
  if(intro||this.selected===g.selectedPolicy)return;
  this.selected=g.selectedPolicy;
  const focused=document.activeElement;
  if(focused?.matches?.('[data-city-policy]')&&Number(focused.dataset.cityPolicy)!==g.selectedPolicy)focused.blur();
  const sheet=p.querySelector('.city-policy-sheet');
  for(const b of p.querySelectorAll('[data-city-policy]')){
   const selected=Number(b.dataset.cityPolicy)===g.selectedPolicy;
   b.setAttribute('aria-pressed',String(selected));
   if(selected&&sheet){
    if(b.offsetTop<sheet.scrollTop)sheet.scrollTop=b.offsetTop;
    if(b.offsetTop+b.offsetHeight>sheet.scrollTop+sheet.clientHeight)sheet.scrollTop=b.offsetTop+b.offsetHeight-sheet.clientHeight+6;
   }
  }
 }
}
