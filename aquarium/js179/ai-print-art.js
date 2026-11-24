// A postcard has a painted landscape, an unobscured subject and an effect in the surrounding air.
const tau=2*Math.PI, clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const SKY={snow:2,music:3,bubble:4,star:5};
export function skyCell(work){return SKY[work.ink]??(['wheel','octopus'].includes(work.part)?1:0);}
// The viewpoint and the subject's anchor are composed together for each location.
export const SUBJECTS=[[.55,.47],[.43,.54],[.42,.48],[.41,.54],[.57,.46],[.42,.47]];
const FOCAL=[[.49,.48],[.48,.58],[.48,.47],[.46,.55],[.58,.39],[.49,.48]];
export function landscape(c,img,work,x,y,w,h){
 const cell=skyCell(work),sw=img.width/2,sh=img.height/3,col=cell%2,row=Math.floor(cell/2);
 const scale=Math.max(w/sw,h/sh),ww=w/scale,hh=h/scale;
 const [cx,cy]=FOCAL[cell];c.drawImage(img,col*sw+(sw-ww)*cx,row*sh+(sh-hh)*cy,ww,hh,x,y,w,h);
}
// Each print has its own flow rather than distributing identical marks in every sky.
const FLOWS={
 snow:[[.16,.19],[.78,.42],[.75,.80],[.37,.27],[.89,.51],[.16,.73],[.23,.37],[.54,.12],[.87,.65],[.10,.53],[.54,.78]],
 bubble:[[.21,.76],[.78,.30],[.86,.64],[.15,.55],[.73,.14],[.80,.81],[.10,.39],[.80,.43],[.27,.86],[.90,.56],[.68,.09]],
 star:[[.13,.74],[.79,.26],[.90,.53],[.29,.66],[.62,.38],[.16,.20],[.45,.54],[.87,.21],[.70,.80],[.26,.12],[.55,.21]]
};
function particle(c,sheet,id,x,y,size,angle){
 c.save();c.translate(x,y);c.rotate(angle);c.drawImage(sheet,id*144,0,144,144,-size/2,-size/2,size,size);c.restore();
}
function stroke(c,fn,color,weight){
 c.beginPath();fn();c.strokeStyle=color;c.lineWidth=weight;c.stroke();
}
export function air(c,sheet,work,x,y,w,h,t){
 const kind=work.ink;if(!kind)return;const env=work.inkLevel??1,u=Math.min(w,h),n=[3,6,11][env];
 c.save();c.lineCap='round';c.lineJoin='round';
 if(kind==='music'){
  const pathY=v=>.74-.44*v+.128*Math.sin(v*5.8+.4);
  for(let k=0;k<5;k++)stroke(c,()=>{for(let j=0;j<=40;j++){const v=j/40,xx=x+w*v,yy=y+h*(pathY(v)+(k-2)*.017);if(!j)c.moveTo(xx,yy);else c.lineTo(xx,yy);}},'#eed095b0',Math.max(.55,u*.006));
  const ix=[.11,.82,.28,.91,.19,.70,.37,.06,.77,.96,.58];
  for(let j=0;j<n;j++){const v=ix[j],Y=y+h*(pathY(v)-.024)+Math.sin(t*1.3+j)*u*.013;particle(c,sheet,1+j%2,x+w*v,Y,u*(.111+.027*(j%3)+env*.008),Math.sin(t+j)*.09-.08);}
 }else{
  if(kind==='star'){
   stroke(c,()=>{c.moveTo(x+w*.06,y+h*.75);c.bezierCurveTo(x+w*.21,y+h*.81,x+w*.62,y+h*.18,x+w*.90,y+h*.18);},'#e8bd79b5',Math.max(.5,u*.009));
  }else if(kind==='snow'){
   for(let j=0;j<env;j++)stroke(c,()=>{const dx=x+w*(.06+j*.56),dy=y+h*(.30-j*.12);c.moveTo(dx,dy);c.bezierCurveTo(dx+u*.075,dy-u*.05,dx+u*.18,dy+u*.012,dx+u*.23,dy-u*.022);},'#eef3e5ce',Math.max(.65,u*.009));
  }
  for(let i=0;i<n;i++){
   const [a,b]=FLOWS[kind][i],v=(i%3)/2,xx=x+w*a+Math.sin(t*.68+i)*u*.014,yy=y+h*b+Math.sin(t*(kind==='bubble'?.65:.83)+i)*u*(kind==='bubble'?.028:.016);
   const id=kind==='snow'?0:kind==='bubble'?3+i%3:6,sz=kind==='bubble'?.13:kind==='snow'?.111:.099;
   particle(c,sheet,id,xx,yy,u*(sz+v*.045+env*.006),kind==='snow'?t*.18+i*.28:kind==='star'?Math.sin(t+i)*.12:.08*Math.sin(t+i));
  }
 }
 c.restore();
}
export function motionTrail(c,work,x,y,w,h,t){
 const lev=work.powerLevel??1,midY=y+h*.58,u=Math.min(w,h);c.save();c.lineCap='round';
 if(work.part==='rocket'){
  const left=x+w*(.24-.032*lev),end=x+w*.43,yy=midY+h*.035;
  const g=c.createLinearGradient(left,yy,end,yy);g.addColorStop(0,'#ff7c5600');g.addColorStop(.57,'#ffa75dcc');g.addColorStop(1,'#ffefa8');c.fillStyle=g;c.beginPath();c.moveTo(end,yy-u*.05);c.quadraticCurveTo(left+u*.05,yy+u*.002,left,yy+u*.09);c.quadraticCurveTo(left+u*.12,yy+u*.068,end,yy+u*.045);c.fill();
  for(let j=0;j<3+lev;j++){const q=(j*.29+t*.46)%1;c.beginPath();c.arc(end-(end-left)*q,yy+q*u*.075,Math.max(.5,u*.015*(1-q)),0,tau);c.fillStyle='#ffe09c';c.fill();}
 }else if(work.part==='wheel'){
  c.strokeStyle='#fff0c9c4';c.lineWidth=Math.max(.7,u*.011);
  for(let j=0;j<2+lev;j++){const from=x+w*(.15+j*.027),Y=y+h*(.65+j*.035);c.beginPath();c.moveTo(from,Y);c.quadraticCurveTo(from+u*.11,Y-u*.024,from+u*(.21+lev*.045),Y-u*.016);c.stroke();}
 }c.restore();
}
