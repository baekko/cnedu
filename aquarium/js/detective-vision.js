import {coverRect} from './detective-core.js';

// The visibility test pads each cover by one pixel. Trace exact entry rays
// against those same rectangles, including around their projecting corners.
const FOV=.77,TAU=Math.PI*2;
const room={left:20,top:125,right:370,bottom:450};
function rayRect(guard,dx,dy,rect){
 let lo=-Infinity,hi=Infinity;
 for(const [p,d,near,far] of [[guard.x,dx,rect.left,rect.right],[guard.y,dy,rect.top,rect.bottom]]){
  if(Math.abs(d)<1e-9){if(p<near||p>far)return null;continue;}
  const a=(near-p)/d,b=(far-p)/d;
  lo=Math.max(lo,Math.min(a,b));hi=Math.min(hi,Math.max(a,b));
  if(lo>hi)return null;
 }
 return hi<0?null:[Math.max(lo,0),hi];
}
export function detectiveVisionRays(guard,covers){
 const coversWithMargin=covers.map(o=>{
  const r=coverRect(o);
  return {left:r.left-1,top:r.top-1,right:r.right+1,bottom:r.bottom+1};
 });
 const angles=Array.from({length:65},(_,i)=>-FOV+i*FOV/32);
 for(const r of [room,...coversWithMargin])for(const x of [r.left,r.right])for(const y of [r.top,r.bottom]){
  const absolute=Math.atan2(y-guard.y,x-guard.x),a=(absolute-guard.angle+TAU*2+Math.PI)%TAU-Math.PI;
  for(const v of [a-1e-7,a,a+1e-7])if(Math.abs(v)<FOV)angles.push(v);
 }
 return angles.sort((a,b)=>a-b).map(relative=>{
  const a=guard.angle+relative,dx=Math.cos(a),dy=Math.sin(a),wall=rayRect(guard,dx,dy,room);
  let d=Math.min(guard.range,wall?.[1]??guard.range);
  for(const r of coversWithMargin){const contact=rayRect(guard,dx,dy,r);if(contact)d=Math.min(d,contact[0]);}
  return {x:guard.x+dx*d,y:guard.y+dy*d};
 });
}
