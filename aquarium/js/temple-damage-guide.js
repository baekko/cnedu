import {routeZ} from './temple-core.js?v268';
import {scyllaAttackPose} from './temple-scylla.js?v=157';
import {paintDamageGuide} from './damage-guide.js?v306';

const SEA_EDGE={fill:'#ecffe51a',edge:'#d8f6ebdb'};
const wetWarning={fill:'#f7d59d28',edge:'#ffe6b8e0'};

// The water art shows the wave, while the edge includes the boat's footprint.
export const templeFootprint=g=>g.isBoat?15:9;
export const templeWaveGap=(h,r)=>h.gapSize/2-r;
export const templeWaveThickness=r=>r+15;
export function templeWaveAreas(h,r,Y){
 const half=templeWaveGap(h,r),crest=templeWaveThickness(r);
 if(h.axis==='z'){
  const y=Y(h.z)-crest;
  return [{x:0,y,w:h.gap-half,h:crest*2},{x:h.gap+half,y,w:390-h.gap-half,h:crest*2}].filter(a=>a.w>0);
 }
 const span=h.span||200,top=Y(h.z+span),bottom=Y(h.z-span),gap=Y(h.gap),x=h.x-crest,w=crest*2;
 return [{x,y:top,w,h:Math.min(bottom,gap-half)-top},{x,y:Math.max(top,gap+half),w,h:bottom-Math.max(top,gap+half)}].filter(a=>a.h>0);
}
export function scyllaGuide(h,Y){
 const pose=scyllaAttackPose(h),active=pose.phase==='bite';
 if(h.bit||h.age>=h.life||pose.phase==='withdraw')return null;
 return {x:active?pose.mouth.x:h.x,y:Y(active?pose.mouth.z-30:h.z),rx:19,ry:20,active};
}
export function paintTempleHazard(c,h,g,Y){
 if(h.age>=h.life)return;
 const r=templeFootprint(g),active=h.age>=h.warn;
 if(h.kind==='head'){
  const guide=scyllaGuide(h,Y);
  if(guide)paintDamageGuide(c,guide,guide.active,wetWarning);
 }else if(h.kind==='wave'){
  for(const area of templeWaveAreas(h,r,Y))paintDamageGuide(c,area,active,SEA_EDGE);
 }else if(active)paintDamageGuide(c,{x:h.x,y:Y(h.z),r:h.r+r},true);
}
export function paintTempleEnvironmentDamage(c,g,Y){
 for(const b of g.orbs)if(b.age>=(b.launchDelay||0)&&b.age<5)paintDamageGuide(c,{x:b.x,y:Y(b.z),r:18},true,{fill:'#f4b6ff11',edge:'#eed5f9ab'});
 if(g.zone.id==='whirlpool'){
  paintDamageGuide(c,{x:150,y:Y(routeZ(3585)),r:34},g.whirlpoolStrength>.6,SEA_EDGE);
 }
 if(g.zone.id==='siren'&&g.mode==='sail'){
  const s=g.siren;
  if(s.active)paintDamageGuide(c,{x:s.x,y:Y(s.z),rx:38,ry:34},true,wetWarning);
 }
 if(g.windActive){
  c.save();
  c.strokeStyle=g.windBracing?'#e5ebc49e':'#f8d4a8da';
  c.lineWidth=2;
  c.setLineDash([4,5]);
  c.beginPath();
  c.moveTo(328,Y(routeZ(1500)));
  c.lineTo(328,Y(routeZ(1750)));
  c.stroke();
  c.restore();
 }
}
