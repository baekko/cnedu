// Observe only the demonstration's own game. The player's inputs and save are untouched.
export const DEMO_ACTIONS={postal:['postal-map-button','postal-deliver'],pursuit:['field-act'],memory:['field-act'],cinema:['field-act'],gym:[],cityhall:['cityhall-act'],datacenter:['field-act'],conservation:['workshop-rotate','field-act'],photo:['field-act'],garden:['field-act'],monastery:['monastery-balance'],detective:['detective-hide','detective-act'],aquarium:[],museum:['jump-button','shoot-button'],history:['interact-button','hammer-button'],exchange:['ex-next','ex-previous'],temple:['interact-button'],robot:['work-button'],space:['brake-button'],writer:['writer-jump','writer-act'],language:['language-jump','language-act'],newspaper:['newspaper-act'],dessert:['dessert-act'],dream:['dream-jump','dream-act'],literature:['literature-act'],zoo:['zoo-act'],ai:['ai-original','ai-act']};
export function observeTutorial(t,place){
 const g=t.game,pressed=new Map(),input=t.inputDisplay={vector:{x:0,y:0},pressed,held:new Set(),events:[]};
 const pulse=(id,args=[])=>{pressed.set(id,t.age+.46);input.events.push({id,at:t.age,args});};
 const action=DEMO_ACTIONS[place]?.at(-1),jump=DEMO_ACTIONS[place]?.find(id=>id.includes('jump'));
 const methods={showMap:place==='postal'?'postal-map-button':null,closeMap:place==='postal'?'postal-map-button':null,rotate:place==='conservation'?'workshop-rotate':null,send:place==='datacenter'?'field-act':null,beginAction:['datacenter','conservation'].includes(place)?'field-act':null,hide:place==='detective'?'detective-hide':null,act:action,work:action,brake:action,jump,shoot:'shoot-button',hammer:'hammer-button',interact:'interact-button',flash:'flash-button',revisitOriginal:'memory-revisit',next:place==='exchange'?'ex-next':null,previous:'ex-previous',startRound:'panel:start',useSpecial:'ex-special',toggleDouble:'ex-double',maxBudget:'panel:max',select:'panel:stock',selectByOffset:['cityhall','cinema'].includes(place)?'down':null,commit:'panel:invest'};
 for(const [name,id]of Object.entries(methods)){if(!id||typeof g[name]!=='function')continue;const fn=g[name];g[name]=function(...args){pulse(id,args);return fn.apply(this,args);};}
 if(place==='pursuit'){
  const move=g.moveSelection;
  g.moveSelection=function(x,y){
   const direction=y<0?'up':y>0?'down':x<0?'left':'right';
   pulse(direction,[x,y]);
   return move.call(this,x,y);
  };
 }
 if(place==='monastery'&&g.beginBalance){
  const begin=g.beginBalance,release=g.releaseBalance;
  g.beginBalance=function(...args){const result=begin.apply(this,args);input.held.add('monastery-balance');pulse('monastery-balance');return result;};
  g.releaseBalance=function(...args){input.held.delete('monastery-balance');pressed.delete('monastery-balance');return release.apply(this,args);};
 }
 if(place==='photo'||place==='conservation'){
  const begin=g.beginAction,release=g.releaseAction,cancel=g.cancelAction;g.beginAction=function(...args){const result=begin.apply(this,args);if(this.focusing||this.holding)input.held.add('field-act');pulse('field-act');return result;};g.releaseAction=function(...args){input.held.delete('field-act');pressed.delete('field-act');return release.apply(this,args);};g.cancelAction=function(...args){input.held.delete('field-act');return cancel.apply(this,args);};
 }
 if(place==='detective'){
  const begin=g.beginAction,release=g.releaseAction;
  g.beginAction=function(...args){const result=begin.apply(this,args);if(this.holding)input.held.add('detective-act');pulse('detective-act');return result;};
  g.releaseAction=function(...args){input.held.delete('detective-act');return release.apply(this,args);};
 }
 if(g.beginThrow){const begin=g.beginThrow,release=g.releaseThrow;g.beginThrow=function(...args){const result=begin.apply(this,args);if(this.charging)input.held.add('zoo-act');pulse('zoo-act');return result;};g.releaseThrow=function(...args){input.held.delete('zoo-act');pressed.delete('zoo-act');input.events.push({id:'zoo-release',at:t.age});return release.apply(this,args);};}
 const update=g.update;g.update=function(dt,move={}){input.vector={x:move.x||0,y:move.y||0};return update.call(this,dt,move);};
 const advance=t.advance;t.advance=function(dt){input.vector={x:0,y:0};return advance.call(this,dt);};
 t.activeButtons=()=>{if(t.done||t.readingPause)return [];const set=new Set(input.held);if(t.previewPress)set.add(t.previewPress);for(const[id,until]of pressed)if(until>t.age)set.add(id);const {x,y}=input.vector;if(x<-.15)set.add('left');if(x>.15)set.add('right');if(y<-.15)set.add('up');if(y>.15)set.add('down');return [...set];};
 return t;
}
