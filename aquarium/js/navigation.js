import {PLACES,placeId} from './places.js?v231';
export function previousScene(screen,place='aquarium'){
 place=placeId(place);
 if(screen==='title'||screen==='loading')return null;
 if(screen==='select')return {screen:'title'};
 if(['naming','welcome'].includes(screen))return {screen:'select'};
 if(screen==='stage'){const i=PLACES.findIndex(p=>p.id===place);return i>0?{screen:'result',place:PLACES[i-1].id}:{screen:'select'};}
 if(screen==='feedback')return {screen:'result',place};
 if(screen==='result')return {screen:'play',place};
 if(screen==='tutorial')return {screen:'briefing',place};
 if(PLACES.some(p=>p.id===place&&p.playable)&&['playing','countdown','exchange','failed','ending','stopped'].includes(screen))return {screen:'tutorial',place};
 if(screen==='briefing')return {screen:'stage',place};
 // Keep the explanation between a run and its entrance, including deep links.
 return {screen:'briefing',place};
}
// A semantic Back handler needs a genuine, activated browser-history entry.
// Entries pushed on initial page load alone can be skipped by mobile browsers.
export function installBackNavigation(win,onBack){
 let depth=Number.isInteger(win.history.state?.ptbDepth)?win.history.state.ptbDepth:win.history.state?.ptbScene==='current'?1:0;
 const push=()=>{depth++;win.history.pushState({ptbScene:'current',ptbDepth:depth},'',win.location.href);};
 if(win.history.state?.ptbScene!=='current'){
  win.history.replaceState({ptbScene:'base',ptbDepth:depth},'',win.location.href);push();
 }
 let busy=false,exiting=false,activated=false;
 const activate=event=>{
  if(activated||exiting||event.isTrusted===false)return;
  activated=true;
  // Create the guard during the first real interaction, before async asset loads.
  win.history.replaceState({ptbScene:'base',ptbDepth:depth},'',win.location.href);push();
 };
 win.addEventListener('pointerup',activate,{capture:true});
 win.addEventListener('keydown',activate,{capture:true});
 win.addEventListener('popstate',async event=>{
  if(exiting)return;
  depth=Math.max(0,Number(event.state?.ptbDepth)||0);
  if(busy){push();return;}
  busy=true;push();
  try{if(await onBack()===false){exiting=true;win.history.go(-(depth+1));}}
  finally{busy=false;}
 });
}
