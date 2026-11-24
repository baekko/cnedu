// Measurements are in source pixels of the three 320 px wide scanner illustrations.
// Only the recessed band gets extra depth. Draw the bitmap and the sockets with the same mapping.
export const PODS={
 body:{height:247,band:[40,124],stretch:1.38,holes:[[92,83,55,32],[228,83,55,32]]},
 part:{height:268,band:[104,183],stretch:1.40,holes:[[100,138,43,23],[199,155,43,23]]},
 ink:{height:287,band:[143,214],stretch:1.42,holes:[[96,181,48,27],[216,181,48,27]]}
};
export function podY(p,y){const [lo,hi]=p.band;return y+Math.max(0,Math.min(hi,y)-lo)*(p.stretch-1);}
export function socket(b,i){
 const p=PODS[b.id],scale=b.w/320,[cx,cy,rx,ry]=p.holes[i];
 return {x:b.x+(cx-160)*scale,y:b.y+(podY(p,cy)-podY(p,p.height))*scale,rx:rx*scale,ry:ry*p.stretch*scale};
}
// Fit the entire visible specimen rectangle inside the ellipse, not just its center.
export function sampleRect(well,source){
 const [, ,w,h]=source,scale=.94/Math.hypot(w/(well.rx*2),h/(well.ry*2)),W=w*scale,H=h*scale;
 return {x:well.x-W/2,y:well.y-H/2,w:W,h:H};
}
// Use the common silhouette across all strength levels so a stronger subject can grow without being cropped.
// The guard band also contains the animated tip of the wing or tentacle.
export function fitArtwork(bounds,cell,x,y,width,height,cx=.5,cy=.5){
 const [l,t,w,h]=bounds,guard=.041*cell;
 const scale=Math.min(width*Math.min(.875,2*Math.min(cx,1-cx)-.09)/(w+2*guard),
  height*Math.min(.86,2*Math.min(cy,1-cy)-.09)/(h+2*guard));
 return {x:x+width*cx-(l+w/2)*scale,y:y+height*cy-(t+h/2)*scale,size:cell*scale};
}
