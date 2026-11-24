const clamp=x=>Math.max(0,Math.min(1,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
// One continuous head and jaw, not a series of separately painted silhouettes.
export function hippoMotion(a){
 let lift=1,jaw=1,motion=0;
 if(a.chew>0){
  const t=.9-a.chew;
  if(a.fed>=2){jaw=1-smooth(t/.28);lift=1-smooth((t-.28)/.62);motion=Math.sin(Math.PI*clamp((t-.28)/.62));}
  else{jaw=t<.26?1-.96*smooth(t/.26):t<.6?.04+.07*Math.sin((t-.26)/.34*Math.PI)**2:.04+.96*smooth((t-.6)/.3);}
 }else if(a.fed>=2){lift=jaw=0;}
 else{
  const q=a.clock%4.9;
  lift=q<1.45?smooth((q-.55)/.9):1-smooth((q-3.45)/1.2);
  jaw=smooth((q-1.45)/.4)*(1-smooth((q-3)/.45));
  motion=q<1.45?Math.sin(Math.PI*clamp((q-.55)/.9)):Math.sin(Math.PI*clamp((q-3.45)/1.2));
 }
 return{lift,jaw,motion};
}
// The rounded CLOSED jaw is authored, never made by compressing an open mouth.
// Head translation is rigid above the neck; the rear water anchor stays fixed.
export function hippoVertex(x,y,rig){
 const neck=1-smooth((x-205)/125);
 return {x,y:y+85*(1-rig.lift)*neck};
}
export function hippoMouth(rig){
 const jaw=rig.jaw*7,lo=Math.floor(jaw),hi=Math.min(7,lo+1),k=jaw-lo;
 const anchors=HIPPO_MOUTH_ANCHORS,p=anchors[lo],q=anchors[hi];
 return hippoVertex(p.x+(q.x-p.x)*k,p.y+(q.y-p.y)*k,rig);
}
export function hippoFrameIndex(rig){return rig.lift<1?Math.round(rig.lift*64):65+Math.round(rig.jaw*7);}
const HIPPO_MOUTH_ANCHORS=[{"x":68,"y":252.42},{"x":77.84,"y":253.23999999999998},{"x":75.38,"y":265.53999999999996},{"x":75.38,"y":266.36},{"x":77.02,"y":261.44},{"x":77.02,"y":262.26},{"x":77.02,"y":264.72},{"x":73.74,"y":261.44000000000005}];
