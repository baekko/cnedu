// World-local floor positions, including the explorer's contact allowance.
export function literatureSurfAreas(wave){
 const halfGap=wave.gapWidth/2-9,x=wave.x-17;
 const upperEnd=Math.min(370,wave.gap-halfGap),lowerStart=Math.max(215,wave.gap+halfGap);
 return [{x,y:215,w:34,h:upperEnd-215},{x,y:lowerStart,w:34,h:370-lowerStart}].filter(area=>area.h>0);
}
export function literatureSearchlightAt(time){
 return {x:195+Math.sin(time*.92)*116-21,y:190,w:42,h:208,active:time%3.6>1.65};
}
export function literatureProjectileArea(h){
 return {x:h.x,y:h.y,r:h.r+10};
}
