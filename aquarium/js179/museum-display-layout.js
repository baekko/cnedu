// Keep the original painted artifacts. Only their positions change.
// Source outlines refer to the unchanged 780×1000 history-v9/museum.webp.
// The entire cabinet row, including its sides, follows the teal strip's incline.
export const MUSEUM_SLOPE=-43/395;
export const museumBoundaryAt=y=>55.5+(y-105)*MUSEUM_SLOPE;
export const MUSEUM_DISPLAY_GAP=4;
const outlines=[
 [[24,193],[79,193],[81,257],[87,257],[86,345],[4,345],[8,301],[15,300],[16,223]],
 [[16,337],[70,337],[74,396],[83,396],[82,501],[1,501],[7,454],[9,367]],
 [[11,493],[70,493],[73,549],[82,549],[81,658],[1,658],[5,608],[7,523]],
 [[11,649],[69,649],[73,707],[82,707],[81,816],[1,816],[5,765],[7,680]],
 [[11,808],[69,808],[73,865],[81,865],[80,976],[1,976],[5,924],[7,839]]
];
export const MUSEUM_DISPLAYS=Object.freeze(outlines.map((outline,type)=>{
 const edge=Math.max(...outline.map(p=>p[0])),bottom=Math.max(...outline.map(p=>p[1]))/2;
 const inside=museumBoundaryAt(bottom)-MUSEUM_DISPLAY_GAP;
 return Object.freeze({type,outline,bottom,inside,offset:inside-edge/2,origin:inside-edge/2-MUSEUM_SLOPE*bottom});
}));
export function drawMuseumDisplays(c,image){
 for(const d of MUSEUM_DISPLAYS)for(const side of ['left','right']){
  c.save();
  // Apply the same floor-plane incline to every original case. Merely moving
  // each bounding box outward leaves its long edges upright (the v45 defect).
  c.transform(1,0,side==='left'?MUSEUM_SLOPE:-MUSEUM_SLOPE,1,side==='left'?d.origin:-d.origin,0);
  c.scale(.5,.5);
  c.beginPath();d.outline.forEach(([x,y],i)=>{
   const px=side==='left'?x:780-x;
   if(i)c.lineTo(px,y);else c.moveTo(px,y);
  });c.closePath();c.clip();
  // Retain both original paintings; do not mirror or replace the right artifacts.
  c.drawImage(image,0,0,780,1000);c.restore();
 }
}
