// Reuse the actual trading panels without binding them to the player's live account.
import {ExchangeUI} from './exchange-ui.js?v=161';
export class TutorialFinance{
 constructor(game,character,target){this.game=game;this.target=target;this.root=document.createElement('div');const noop=()=>{};this.ui=new ExchangeUI({root:this.root,game,character,onChange:noop,onComplete:noop,onFailure:noop,onHome:noop,onPause:noop,onHelp:noop});this.signature='';}
 render(){const g=this.game,sign=[g.phase,g.dialogue,g.selected,g.budget,g.specialUsed,g.doubleArmed,g.cash].join('/');
  if(sign!==this.signature){this.signature=sign;this.ui.render();this.target.replaceChildren();if(g.phase!=='walk'){
   const panel=this.root.querySelector('#ex-panel').cloneNode(true);panel.removeAttribute('id');for(const el of panel.querySelectorAll('[id]'))el.removeAttribute('id');panel.classList.add('tutorial-trading-panel');panel.hidden=false;this.target.append(panel);
  }}
  // One logical 378×476 panel inside the 390×500 scene. Only the outer
  // device scales, never individual dialogue, trading or result panels.
  const panel=this.target.firstElementChild;if(panel)panel.dataset.phase=g.phase;
 }
}
