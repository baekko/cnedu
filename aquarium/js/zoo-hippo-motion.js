const clamp=x=>Math.max(0,Math.min(1,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
export const HIPPO_CELL={width:256,height:176,top:96,scale:1.5};
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
// Use a common vertical translation for the complete animal and its mouth.
export const hippoSink=rig=>260*(1-rig.lift);
export const hippoVertex=(x,y,rig)=>({x,y:y+hippoSink(rig)});
export const hippoFrameIndex=rig=>Math.round(rig.jaw*(HIPPO_MOUTH_ANCHORS.length-1));

export function hippoMouth(rig){
 const [x,y]=HIPPO_MOUTH_ANCHORS[hippoFrameIndex(rig)];
 return hippoVertex(x*HIPPO_CELL.scale,HIPPO_CELL.top+y*HIPPO_CELL.scale,rig);
}
const HIPPO_MOUTH_ANCHORS=[[50.54,61.5],[58.94,75.38],[50.17,82.31],[57,105]];
