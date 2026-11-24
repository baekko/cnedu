import {FILM_BY_ID} from './cinema-films.js?v204-final40';
export const CINEMA_SCREEN=Object.freeze({x:29,y:49,w:332,h:186.75});
export const CINEMA_CHOICES=Object.freeze({x:25,y:274,w:340,h:33,gap:3});
export class CinemaUI{
 constructor(root,onChoose){
  this.root=root;this.buttons=Array.from({length:4},(_,i)=>{const b=document.createElement('button');b.type='button';b.dataset.choice=String(i);b.className='cinema-choice-hit';b.style.height=CINEMA_CHOICES.h+'px';b.style.top=(CINEMA_CHOICES.y+i*(CINEMA_CHOICES.h+CINEMA_CHOICES.gap))+'px';b.addEventListener('click',()=>onChoose(i));root.append(b);return b;});
 }
 render(g,active){
  this.root.hidden=!active;
  if(!active||!g)return;
  this.buttons.forEach((b,i)=>{b.hidden=!g.choicesVisible;b.disabled=g.phase!=='choose';const title=FILM_BY_ID[g.options[i]].title;b.textContent=title;b.setAttribute('aria-label',title+' 선택');b.setAttribute('aria-pressed',String(g.selected===i));});
 }
}
export function syncCinemaStats(g,find){
 const time=find('time-value');time.textContent='시간 제한 없음';time.closest('.timer').querySelector('.hud-label').textContent='관람 안내';time.closest('.timer').classList.remove('urgent');
 find('time-fill').style.transform='scaleX(0)';find('clue-value').textContent=String(g.banked.size);
 find('history-era').textContent=Math.min(9,g.round+1)+' / 9';find('history-era').hidden=false;find('health-value').hidden=true;
 const item=find('flash-value');if(item)item.textContent=String(g.flashes);
}
