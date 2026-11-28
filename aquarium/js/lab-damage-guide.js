import {paintDamageGuide} from './damage-guide.js?v306';

export function dreamHazardArea(h){
 if(h.erased||!h.active&&!h.warning)return null;
 return h.r?{x:h.x,y:h.y,r:h.r}:{x:h.x-h.w/2,y:h.y-h.h/2,w:h.w,h:h.h};
}
export function paintDreamHazard(c,h){
 const area=dreamHazardArea(h);
 if(area)paintDamageGuide(c,area,h.active,{fill:'#ead0b01a',edge:h.active?'#eac59cb4':'#f9dc9bd4'});
}
export function languageBotBody(b){
 return {x:b.x-24,y:b.y-25,w:48,h:22};
}
export function paintLanguageBot(c,b){
 paintDamageGuide(c,languageBotBody(b),true,{fill:'#d6b0a000',edge:'#b246647a'});
}
