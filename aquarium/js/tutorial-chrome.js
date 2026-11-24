import {syncPursuitStats} from './pursuit-renderer.js?v245';
import {syncMemoryStats} from './memory-renderer.js?v245';
import {syncCinemaStats} from './cinema-ui.js?v204-final40';
import {DessertFinishUI} from './dessert-finish-ui.js';
import {icon} from './icons.js?v245';
import {syncCityStats,syncCityAction} from './cityhall-ui.js?v245';
import {DEMO_ACTIONS} from './tutorial-input.js?v232';
const ITEMS={cinema:'filmInfo',gym:'whistle',cityhall:'special',datacenter:'virusClear',conservation:'bookSupport',photo:'autoCamera',garden:'gardenerBell',monastery:'shield',detective:'decoy',aquarium:'light',museum:'time',history:'run',temple:'shield',robot:'magnet',space:'booster',writer:'bookmark',language:'magnet',newspaper:'satchel',dream:'eraser',literature:'bookmark',zoo:'whistle',ai:'autoChip',dessert:'remote'};
function copy(source){const el=source.cloneNode(true);for(const node of [el,...el.querySelectorAll('[id]')])if(node.id){node.dataset.sourceId=node.id;node.removeAttribute('id');}for(const b of el.querySelectorAll('button')){b.tabIndex=-1;b.disabled=false;}return el;}
export class TutorialChrome{
 constructor(root,place,lesson,source,duration){
  Object.assign(this,{root,place,lesson,source,duration});root.inert=true;this.nodes=[];this.exchange=place==='exchange';
  this.header=copy(source.querySelector(this.exchange?'.ex-header':'.game-header'));this.header.classList.add('demo-header');
  this.hud=copy(source.querySelector(this.exchange?'.ex-hud':'.hud'));this.hud.classList.add('demo-hud');
  this.dock=document.createElement('div');this.dock.className='demo-dock';this.dock.append(copy(source.querySelector(this.exchange?'.ex-pad':'.dpad')));
  const actions=document.createElement('div');actions.className='demo-actions';
  const items=this.exchange?['ex-double','ex-special']:place==='memory'?['memory-revisit','flash-button']:['flash-button'];
  for(const id of [...DEMO_ACTIONS[place],...items]){const b=copy(source.querySelector('#'+id));b.dataset.demoControl=id;b.disabled=false;b.tabIndex=-1;b.hidden=id==='ai-original';actions.append(b);}
  this.dock.append(actions);this.nodes=[this.header,this.hud,this.dock];root.append(...this.nodes);root.style.setProperty('--demo-scene-height',place==='aquarium'?'536px':'500px');this.height=70+(place==='aquarium'?536:500)+138;
  if(place==='dessert')this.finishing=new DessertFinishUI(root,{demo:true});
  this.observer=new ResizeObserver(()=>this.fit());this.observer.observe(root.parentElement);this.fit();
 }
 find(id){return this.root.querySelector('[data-source-id="'+id+'"]');}
 text(id,value){const el=this.find(id);if(el)el.textContent=value;}
 fit(){const host=this.root.parentElement;const scale=Math.min(Math.max(1,host.clientWidth-88)/390,host.clientHeight/this.height);this.root.style.transform=`translate(-50%,-50%) scale(${scale})`;}
 render(){const {lesson:t,place,source}=this,g=t.game;this.finishing?.render(g);
  if(this.exchange){for(const id of ['ex-year','ex-capital','ex-round','ex-next','ex-previous','ex-double','ex-special']){const src=source.querySelector('#'+id),dst=this.find(id);dst.innerHTML=src.innerHTML;dst.disabled=src.disabled;}}
  else if(place==='pursuit'){
   syncPursuitStats(g,id=>this.find(id));
   const action=this.find('field-act'),item=this.find('flash-button');
   action.textContent=g.actionLabel;action.disabled=!g.canAct;
   item.innerHTML=icon('memorySearch')+'<span class="flash-count"><strong>'+g.flashes+'</strong></span>';
   item.disabled=!g.canHint;item.hidden=t.step!==t.total-1;
  }
  else if(place==='memory'){
   syncMemoryStats(g,id=>this.find(id));
   const item=this.find('flash-button');
   item.innerHTML=icon('memorySearch')+`<span class="flash-count"><strong>${g.flashes}</strong></span>`;
   item.disabled=!g.canHint;this.text('field-act','찾기');this.find('field-act').disabled=!g.canAct;
   const extension=this.find('memory-revisit');
   item.hidden=extension.hidden=t.step!==t.total-1;
   this.text('memory-revisit-value',g.revisits);extension.disabled=!g.canRevisit;
  }
  else if(place==='cinema'){
   syncCinemaStats(g,id=>this.find(id));
   const item=this.find('flash-button');item.innerHTML=icon('filmInfo')+`<span class="flash-count"><strong>${g.flashes}</strong></span>`;item.disabled=g.flashes<1;this.text('field-act','결정');this.find('field-act').disabled=!g.canAct;
  }
  else if(place==='cityhall'){
   syncCityStats(g,id=>this.find(id));
   syncCityAction(g,this.find('cityhall-act'),true);
   const item=this.find('flash-button');
   if(item.dataset.cityAdvice!==String(g.flashes)){item.dataset.cityAdvice=String(g.flashes);item.innerHTML=icon('special')+`<span class="flash-count"><strong>${g.flashes}</strong></span>`;}
   item.disabled=!g.canAsk;
  }else{
   const remaining=Math.max(0,place==='history'?g.remaining:this.duration-(g.elapsed||0)),seconds=Math.ceil(remaining);
   this.text('time-value',place==='history'&&!['explore','ended'].includes(g.phase)?(g.phase==='travel'?'이동 중':'대기'):String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0'));
   const track=this.find('time-fill');track.style.width='100%';track.style.transform=`scaleX(${Math.max(0,remaining/this.duration)})`;this.find('time-value').closest('.timer').classList.toggle('urgent',remaining<=10);
   this.text('clue-value',g.banked.size);
   for(const [i,pip]of [...this.find('health-value').children].entries())pip.classList.toggle('empty',i>=g.health);
   this.find('health-value').setAttribute('aria-label',(place==='aquarium'?'내구도':'체력')+' '+g.health+'칸');
   const era=place==='datacenter'?g.packets.length+' / 2':place==='conservation'?['먼지','종이','압착'][g.book.mode]:['photo','garden'].includes(place)?`${g.room+1} / 3`:place==='monastery'?`${g.zoneIndex+1} / 3`:place==='detective'?`${g.roomIndex+1} / 3`:place==='history'?(g.eraIndex<0?'박물관':`${g.eraIndex+1} / 3`):place==='ai'?`${g.orderIndex+1} / 9`:place==='zoo'||place==='literature'?`${g.room+1} / 9`:place==='dessert'?g.handLabel:place==='newspaper'?(g.held?'운반 중':'빈손'):place==='robot'?(g.held?'부품 운반':'빈손'):'';
   this.text('history-era',era);
   if(place==='museum'){const colors=['#ec5555','#f49948','#f4d75c','#72ae6b','#66aed8','#5e75b9','#ae78c0','#eff1df','#535660'];this.find('museum-colors').innerHTML=colors.map((c,i)=>`<i style="background:${c};opacity:${g.monsters.some(m=>m.id===i+1&&m.alive)?'.3':'1'}"></i>`).join('');}
   const item=this.find('flash-button');item.innerHTML=icon(place==='garden'?g.itemKind:ITEMS[place])+`<span class="flash-count"><strong>${g.flashes??0}</strong></span>`;item.disabled=g.flashes<=0;
   const actId=DEMO_ACTIONS[place].at(-1);if(g.actionLabel&&actId)this.text(actId,g.actionLabel);
   if(place==='detective')this.text('detective-hide',g.hidden?'나오기':'숨기');
   if(place==='conservation')this.find('workshop-rotate').hidden=g.book.mode!==1;
   if(place==='photo')this.find('field-act').classList.toggle('action-ready',g.focusing&&g.quality().good);
   if(place==='history'||place==='temple')this.text('interact-button',g.interaction?.startsWith('하차')?'하차':'탑승');
   if(place==='museum'){this.find('shoot-button').disabled=!!g.player.climbing;this.find('shoot-button').innerHTML=icon('slingshot');this.find('jump-button').innerHTML=icon('jump');}
   if(place==='history')this.find('hammer-button').innerHTML=icon('hammer');
   if(place==='ai')this.find('ai-original').hidden=g.phase!=='infer';
  }
  const active=t.activeButtons();for(const b of this.root.querySelectorAll('button')){let key=b.dataset.demoControl||b.dataset.direction;if(!b.dataset.demoControl&&b.dataset.action)key='panel:'+b.dataset.action;if(b.dataset.stock!==undefined)key=Number(b.dataset.stock)===g.selected?'panel:stock':'';const on=active.includes(key);b.classList.toggle('demo-pressed',on);b.setAttribute('aria-pressed',String(on));}
 }
 destroy(){this.finishing?.destroy();this.observer.disconnect();for(const el of this.nodes)el.remove();}
}
