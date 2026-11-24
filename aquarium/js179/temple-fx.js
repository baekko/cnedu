// Eight hand-drawn 2D frames per effect, cached once. Decoration has no hitbox.
// Discrete playback gives the same readable rhythm as the character sprites.
const N=8,S=128,TAU=Math.PI*2;
// Ground-anchored gusts and litter cross the path from left to right. Nothing
// oscillates back against the wind, and the field ends at the challenge bounds.
export function drawWindField(c,Y,time,from,to){
 const top=Y(to),bottom=Y(from);if(bottom<0||top>500)return;
 c.save();c.beginPath();c.rect(0,top,390,bottom-top);c.clip();
 for(let i=0;i<22;i++){
  const z=from+(i+.35)*(to-from)/22,y=Y(z),x=((time*(180+i%4*15)+i*97)%580)-110,len=65+i%4*21;
  c.strokeStyle=i%3?'#edf6df':'#fff6dc';c.globalAlpha=.40+i%3*.075;c.lineWidth=i%4===0?1.9:1.1;c.lineCap='round';c.beginPath();c.moveTo(x-len,y+3);c.bezierCurveTo(x-len*.6,y-3,x-14,y-1,x,y);c.stroke();
  if(i%3===0){c.globalAlpha=.23;c.lineWidth=.75;c.beginPath();c.moveTo(x-len*.7,y+7);c.lineTo(x-10,y+6);c.stroke();}
 }
 for(let i=0;i<34;i++){
  const z=from+(i+.5)*(to-from)/34,x=((time*(132+i%5*19)+i*131)%490)-50,ground=Y(z),hop=1+Math.sin(time*9+i)**2*3;
  c.globalAlpha=.15;c.fillStyle='#544b31';c.beginPath();c.ellipse(x+2,ground+2,4.5,1.6,0,0,TAU);c.fill();
  c.save();c.translate(x,ground-hop);c.rotate(time*(4+i%3)+i);c.globalAlpha=.85;
  c.fillStyle=['#b18b42','#ccad65','#8b9759','#9d7742'][i%4];c.beginPath();c.moveTo(-4.5,0);c.quadraticCurveTo(-1,-3,4.8,0);c.quadraticCurveTo(0,3,-4.5,0);c.fill();c.strokeStyle='#e3ce8b';c.lineWidth=.5;c.beginPath();c.moveTo(-4,0);c.lineTo(4,0);c.stroke();c.restore();
 }
 c.restore();
}
export function makeTempleEffects(){
 const sheet=document.createElement('canvas');sheet.width=S*N;sheet.height=S*4;const c=sheet.getContext('2d');
 for(let f=0;f<N;f++)for(let row=0;row<4;row++){
  const t=f/N;c.save();c.translate(f*S,row*S);c.beginPath();c.rect(0,0,S,S);c.clip();
  if(row===0){ // Caustics and gentle foam swells.
   for(let i=0;i<4;i++){const x=16+i*28,y=27+i%2*58+Math.sin(t*TAU+i)*3;c.strokeStyle=i%2?'#d6ffff':'#78e4df';c.globalAlpha=.14+.10*Math.sin(t*TAU+i)**2;c.lineWidth=1.8;c.beginPath();c.moveTo(x-14,y);c.quadraticCurveTo(x,y+5,x+18,y-1);c.stroke();c.globalAlpha=.11;c.beginPath();c.ellipse(x+12,y+10,19,5,t*.08,0,Math.PI*1.7);c.stroke();}
  }else if(row===1){ // Wind streaks and olive leaves.
   for(let i=0;i<3;i++){const x=(t*128+i*51)%176-24,y=24+i*35;c.strokeStyle='#f2fae3';c.globalAlpha=.35;c.lineWidth=1.5;c.beginPath();c.moveTo(x-26,y);c.quadraticCurveTo(x,y-10,x+23,y);c.stroke();c.save();c.translate(x+12,y+6);c.rotate(t*TAU+i);c.fillStyle=i%2?'#bfc377':'#d5d494';c.globalAlpha=.8;c.beginPath();c.ellipse(0,0,4,1.6,0,0,TAU);c.fill();c.restore();}
  }else if(row===2){ // A crest breaks then disperses into droplets.
   const k=t;c.globalAlpha=(1-k)*.8;c.strokeStyle='#e4ffff';c.lineWidth=2.4;for(let i=0;i<3;i++){c.beginPath();c.ellipse(64,66+i*5,17+k*(27+i*7),5+k*9,0,Math.PI*.05,Math.PI*.95);c.stroke();}for(let i=0;i<7;i++){const a=i*TAU/7;c.fillStyle='#fff';c.beginPath();c.arc(64+Math.cos(a)*(15+k*28),57+Math.sin(a)*(8+k*17)-Math.sin(k*Math.PI)*11,1.8*(1-k)+.5,0,TAU);c.fill();}
  }else{ // Golden protection / pickup sparks.
   for(let i=0;i<5;i++){const a=i*TAU/5+t*.6,r=16+t*31,x=64+Math.cos(a)*r,y=64+Math.sin(a)*r;c.globalAlpha=1-t;c.strokeStyle='#ffe9a1';c.lineWidth=1.6;c.beginPath();c.moveTo(x-3,y);c.lineTo(x+3,y);c.moveTo(x,y-3);c.lineTo(x,y+3);c.stroke();}
  }c.restore();
 }
 return {sheet,draw(c,row,frame,x,y,w=128,h=w,alpha=1){c.save();c.globalAlpha*=alpha;c.drawImage(sheet,((frame%N)+N)%N*S,row*S,S,S,x,y,w,h);c.restore();}};
}
