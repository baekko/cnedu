// The head artwork contains a short neck at its lower-right edge. Join inside
// that painted neck, not at the centre of the face or the transparent margin.
export function scyllaHeadPose(image,x,y,width){
 const height=width*image.height/image.width,left=x-width/2,top=y+12-height*.6;
 return {left,top,width,height,joint:{x:left+width*.73,y:top+height*.91},neckWidth:width*.23};
}
function curve(a,b,c,d,t){const u=1-t;return {x:u*u*u*a.x+3*u*u*t*b.x+3*u*t*t*c.x+t*t*t*d.x,y:u*u*u*a.y+3*u*u*t*b.y+3*u*t*t*c.y+t*t*t*d.y};}
export function drawScyllaNeck(c,start,head,index){
 const end=head.joint,b={x:start.x-48-index*3,y:start.y+25},d={x:end.x+14,y:end.y+36},points=[];
 for(let i=0;i<=36;i++){
  const t=i/36,p=curve(start,b,d,end,t),next=curve(start,b,d,end,Math.min(1,t+.001)),prev=curve(start,b,d,end,Math.max(0,t-.001)),dx=next.x-prev.x,dy=next.y-prev.y,n=Math.max(.01,Math.hypot(dx,dy));
  points.push({...p,nx:-dy/n,ny:dx/n,r:(14+(head.neckWidth-14)*t)/2});
 }
 c.save();const gradient=c.createLinearGradient(start.x,start.y,end.x,end.y);gradient.addColorStop(0,'#236b66');gradient.addColorStop(.6,'#2c9d81');gradient.addColorStop(1,'#3bb28e');
 c.fillStyle=gradient;c.strokeStyle='#19535a';c.lineWidth=1.15;c.lineJoin='round';c.beginPath();
 for(const [side,list] of [[1,points],[-1,[...points].reverse()]])for(const [i,p] of list.entries()){const x=p.x+p.nx*p.r*side,y=p.y+p.ny*p.r*side;if(side===1&&i===0)c.moveTo(x,y);else c.lineTo(x,y);}
 c.closePath();c.fill();c.stroke();
 // A soft belly strip and small transverse scales meet the head's cream throat.
 c.lineCap='round';c.strokeStyle='#b9d78c';c.lineWidth=head.neckWidth*.42;c.beginPath();points.forEach((p,i)=>{const x=p.x-p.nx*1.4,y=p.y-p.ny*1.4;i?c.lineTo(x,y):c.moveTo(x,y);});c.stroke();
 c.strokeStyle='#78a978';c.lineWidth=.7;let travelled=0;
 for(let i=1;i<points.length-2;i++){const p=points[i],q=points[i-1];travelled+=Math.hypot(p.x-q.x,p.y-q.y);if(travelled<7)continue;travelled=0;c.beginPath();c.moveTo(p.x-p.nx*3.2,p.y-p.ny*3.2);c.lineTo(p.x+p.nx*.6,p.y+p.ny*.6);c.stroke();}
 c.restore();
}
