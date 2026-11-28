// Paints the physical danger boundary, or the effective contact region when
// the game's rule already includes the player's footprint.
export function paintDamageGuide(c,area,active,{fill='#ffe2b022',edge='#fff0bfd6'}={}){
 c.save();
 c.beginPath();
 if(area.r)c.arc(area.x,area.y,area.r,0,2*Math.PI);
 else if(area.rx)c.ellipse(area.x,area.y,area.rx,area.ry,0,0,2*Math.PI);
 else c.rect(area.x,area.y,area.w,area.h);
 c.fillStyle=fill;
 c.fill();
 c.strokeStyle=edge;
 c.lineWidth=1.1;
 if(!active)c.setLineDash([4,4]);
 c.stroke();
 c.restore();
}
