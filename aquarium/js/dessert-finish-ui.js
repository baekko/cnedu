import {FRUITS,stampTarget} from './dessert-finishing.js';
import {drawFinishing,drawFruit,hasFinishingAtlas} from './dessert-finish-art.js?v311';
export class DessertFinishUI{
 constructor(root,{getGame=()=>null,active=()=>false,onChange=()=>{},demo=false}={}){
  Object.assign(this,{root,getGame,active,onChange,demo});this.panel=document.createElement('section');this.panel.className='dessert-finish';this.panel.hidden=true;this.panel.setAttribute('aria-label','디저트 마무리 작업대');
  this.panel.innerHTML='<header><b></b><button type="button" data-close>오븐 보기</button></header><p class="finish-instruction"></p><canvas class="finish-art" width="600" height="264" role="img"></canvas><div class="cream-readout" hidden><div><b class="cream-amount">현재 0%</b><span>목표 60~84%</span></div><div class="cream-meter" role="progressbar" aria-label="짜고 있는 크림의 양" aria-valuemin="0" aria-valuemax="100"><i></i><em></em></div></div><div class="finish-inputs"><button type="button" data-stamp>도장 찍기</button><button type="button" data-cream>누르고 크림 짜기</button><div class="fruit-choices">'+FRUITS.map((f,i)=>'<button type="button" data-fruit="'+i+'" aria-label="'+f+' 올리기"><canvas class="fruit-art" width="72" height="72" aria-hidden="true"></canvas><span>'+f+'</span></button>').join('')+'</div></div><footer><span class="finish-note" aria-live="polite"></span><button type="button" data-remote>오븐 정지</button></footer>';
  root.append(this.panel);this.canvas=this.panel.querySelector('canvas');this.c=this.canvas.getContext('2d');
  this.paintFruitButtons();
  const change=(a,v)=>{if(active()){getGame().decorate(a,v);onChange();}};
  this.panel.querySelector('[data-stamp]').onclick=()=>change('stamp');
  this.panel.querySelectorAll('[data-fruit]').forEach(b=>b.onclick=()=>change('fruit',Number(b.dataset.fruit)));
  const cream=this.panel.querySelector('[data-cream]');cream.onpointerdown=e=>{e.preventDefault();cream.setPointerCapture(e.pointerId);change('press');};cream.onpointerup=e=>{e.preventDefault();change('release');};cream.onpointercancel=()=>{const t=getGame()?.finishing;if(t){t.holding=false;t.amount=0;}};
  cream.onkeydown=e=>{if(['Space','Enter'].includes(e.code)){e.preventDefault();e.stopPropagation();if(!e.repeat)change('press');}};cream.onkeyup=e=>{if(['Space','Enter'].includes(e.code)){e.preventDefault();e.stopPropagation();change('release');}};
  this.panel.querySelector('[data-close]').onclick=()=>{if(active()){getGame().leaveFinishing();onChange();}};
  this.panel.querySelector('[data-remote]').onclick=()=>{if(active()){getGame().flash();onChange();}};
 }
 paintFruitButtons(){this.iconsHaveAtlas=hasFinishingAtlas();this.panel.querySelectorAll('.fruit-art').forEach((el,i)=>{const c=el.getContext('2d');c.setTransform(2,0,0,2,0,0);c.clearRect(0,0,36,36);drawFruit(c,i,18,17,.9);});}
 render(g,visible=true){
  if(!this.iconsHaveAtlas&&hasFinishingAtlas())this.paintFruitButtons();
  const t=g?.finishing;this.panel.hidden=!visible||!t;if(this.panel.hidden)return;
  const names={cookie:'쿠키 · 도장 찍기',muffin:'머핀 · 크림 짜기',tart:'타르트 · 과일 올리기'};
  this.panel.querySelector('header b').textContent=names[t.kind]+' '+t.step+'/3';
  this.panel.querySelector('.finish-instruction').textContent={cookie:'도장이 초록 원과 겹칠 때 찍어요',muffin:'누르고 있다가 크림이 초록 높이에 오면 손을 떼요',tart:'왼쪽부터 견본과 같은 과일을 골라요'}[t.kind];
  this.panel.querySelector('[data-stamp]').hidden=t.kind!=='cookie';this.panel.querySelector('[data-cream]').hidden=t.kind!=='muffin';this.panel.querySelector('.fruit-choices').hidden=t.kind!=='tart';
  this.panel.querySelector('[data-stamp]').disabled=t.wait>0;this.panel.querySelectorAll('[data-fruit]').forEach(b=>b.disabled=t.wait>0);
  const remote=this.panel.querySelector('[data-remote]');remote.textContent='오븐 정지 ×'+g.flashes;remote.disabled=!g.canFreeze;
  this.panel.querySelector('.finish-note').textContent=t.noteLeft>0?t.note:g.ovens.some(o=>['baking','ready'].includes(o.status))?'다른 오븐도 계속 굽고 있어요':'세 곳을 꾸미면 자동으로 포장돼요';
  this.panel.querySelector('[data-cream]').classList.toggle('is-holding',t.holding);
  this.canvas.setAttribute('aria-label',t.kind==='tart'?'견본: '+t.pattern.map(i=>FRUITS[i]).join(', ')+' · '+t.step+'곳 완료':t.kind==='muffin'?'크림 '+Math.round(t.amount*100)+'퍼센트 · 초록 높이 60에서 84퍼센트': '도장 위치 '+Math.round(t.cursor*100)+' · 초록 원 위치 '+Math.round(stampTarget(t)*100));
  const amount=Math.min(100,Math.round(t.amount*100)),readout=this.panel.querySelector('.cream-readout');readout.hidden=t.kind!=='muffin';
  if(t.kind==='muffin'){const inRange=t.amount>=.6&&t.amount<=.84;readout.querySelector('.cream-amount').textContent='현재 '+amount+'%'+(inRange?' · 지금 놓아요':'');readout.classList.toggle('in-range',inRange);const meter=readout.querySelector('.cream-meter');meter.setAttribute('aria-valuenow',String(amount));meter.setAttribute('aria-valuetext',amount+'퍼센트, 목표 60에서 84퍼센트');meter.querySelector('i').style.width=amount+'%';}
  const artHeight=t.kind==='tart'?168:132;if(this.canvas.height!==artHeight*2)this.canvas.height=artHeight*2;this.canvas.classList.toggle('tart-art',t.kind==='tart');
  drawFinishing(this.c,t);
 }
 destroy(){this.panel.remove();}
}
