import {ROCKY_CHAIN_ENDPOINTS} from './cinema-contact.js?v178';
import {ROCKY_BAG_TOPS178} from './asset-performance178.js?v178';
const mod=(n,m)=>((n%m)+m)%m;
export function drawCinemaPanorama(c,image,x){
 const w=image.width,h=image.height,k=180/h,wide=w*k,left=-mod(x,wide);
 for(let at=left;at<320;at+=wide)c.drawImage(image,0,0,w,h,at,0,wide,180);
}
export function drawCinemaAmbience(c,film,time,pose,front=false){
 if(film.id==='rocky'&&!front){
  const [bx,by]=pose.extra?.bag?.ring||ROCKY_BAG_TOPS178[pose.performanceIndex]||ROCKY_CHAIN_ENDPOINTS[pose.frame],ax=165,ay=19;
  c.fillStyle='#413830';c.fillRect(ax-2,ay-2,4,3);
  for(let i=0;i<=Math.ceil(by-ay);i++){
   const t=i/(by-ay),x=Math.round(ax+(bx-ax)*t),y=ay+i;
   c.fillStyle=i%4<2?'#bca58a':'#534a41';c.fillRect(x-(i%4===0?1:0),y,i%4===0?3:1,1);
  }
 }
 if(film.id==='gravity'&&!front&&pose.extra){
  const [bx,by]=pose.extra.back,ax=245,ay=74,sag=Math.max(5,Math.abs(ax-bx)*.16);
  c.fillStyle='#c9cbd2';
  for(let i=0;i<=70;i++){const t=i/70,x=ax+(bx-ax)*t,y=ay+(by-ay)*t+Math.sin(Math.PI*t)*sag;c.fillRect(Math.round(x),Math.round(y),1,1)}
 }
 if(film.id==='loveactually'&&front){
  c.fillStyle='#f3f7ecb8';
  for(let i=0;i<30;i++){const x=mod(i*71+time*3,320),y=mod(i*37+time*(8+i%4),190)-5;c.fillRect(Math.floor(x),Math.floor(y),1,1)}
 }
 if(film.id==='interstellar'){
  if(!front){
   c.fillStyle='#ccebf399';
   // Small shifting foam follows the fixed giant wave and shallow water.
   for(let i=0;i<27;i++){const x=mod(i*47-time*10,320),y=117+mod(i*17,57);c.fillRect(Math.floor(x),y,3+i%5,1)}
  }else if(pose.extra){
   const [x,y]=pose.extra.feet;
   for(let i=0;i<6;i++){
    const p=mod(time*1.6+i/6,1),rx=7+p*15,ry=1+p*3;
    c.fillStyle=p<.6?'#b8e2e2bd':'#70c1d27a';
    for(let j=0;j<12;j++){const a=j/12*Math.PI*2;c.fillRect(Math.round(x+Math.cos(a)*rx),Math.round(y+Math.sin(a)*ry),2,1)}
   }
  }
 }
}

// Continuous consequences belong to each shot: wake, fire, copied data,
// projected film, rain and musical effort never undo a completed event.
export function drawCinemaConsequences(c,film,elapsed,pose,front=false){
 const t=pose.time,id=film.id;
 const px=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),w,h)};
 const water=(y,count,speed,color)=>{for(let i=0;i<count;i++){const x=mod(i*47-elapsed*speed,320);px(x,y+i%5*6,3+i%5,1,color)}};
 if(!front){
  if(id==='titanic')water(69,23,3,'#e6a9a941');
  if(id==='jaws')water(103,27,12,'#b3dce793');
  if(id==='pi')water(135,28,9,'#d7b0a84d');
  if(id==='showman'){
   const x=153+Math.sin(t*.7)*35;
   for(let y=43;y<164;y+=3){const w=(y-40)*.37;px(x-w/2,y,w,3,'#fff2bc09')}
  }
  if(id==='cinemaparadiso'&&t>2.25){
   for(let i=0;i<39;i++)px(218+i*2,106-i*.2,2,3+i*.6,'#fff5cf0b');
   for(let i=0;i<14;i++)px(225+i*6+Math.sin(t+i),109+Math.sin(t*.6+i*3)*8,1,1,'#f6e6bc55');
  }
  if(id==='armageddon'&&t>1.3){
   c.save();c.beginPath();c.rect(168,126,7,31);c.clip();for(let n=0;n<11;n++){const phase=t*16+n*.7,y=128+n*2.5;c.fillStyle=n%2?'#626d74':'#e3e3d9';c.fillRect(169+Math.sin(phase)*1.4,y,3.5,.65)}c.restore();
   const force=Math.min(1,(t-1.3)/3);
   for(let i=0;i<22*force;i++){const p=mod(t*1.1+i*.13,1),x=171+(i%2?-1:1)*(3+p*19),y=154-p*10+9*p*p;px(x,y,2,2,i%3?'#968975':'#b6a486')}
   if(t>5){for(let i=0;i<15*(t-5)/3;i++)px(171+i*2,159+Math.sin(i)*2,2,1,'#292c31')}
  }
  if(id==='topgun'){for(let i=0;i<14;i++){const x=mod(i*73-elapsed*48,340)-10;px(x,80+i%6*11,6,1,'#e9f4f540')}}
 }
 if(front){
  if(id==='jaws'&&t>4.75){
   const p=Math.min(1,(t-4.75)/3.25);for(let i=0;i<20;i++){const x=238+Math.cos(i*.6)*(12+p*53),y=145+Math.sin(i*.6)*(3+p*8);px(x,y,4,1,'#e4f6f3b0')}
  }
  if(id==='pi'){for(let i=0;i<11;i++){const x=130+pose.offset[0]+i*8,y=151+pose.offset[1]+Math.sin(t*3+i)*1.5;px(x,y,4,1,'#dab8a873')}}
  if(id==='castaway'&&t>2){
   const x=177,y=165,lit=t>=5.15;
   for(let i=0;i<7;i++){const q=mod(t*.52+i*.17,1);px(x+Math.sin(i+t)*q*4,y-3-q*(lit?28:15),1.8,1.3,'#bab9aa70')}
   if(lit){const h=8+12*Math.min(1,(t-5.15)/1.1),f=Math.sin(t*15)*1.1;
    c.fillStyle='#b94e28';c.beginPath();c.moveTo(x-5,y);c.lineTo(x-4,y-h*.55);c.lineTo(x-1,y-h*.6);c.lineTo(x+f,y-h);c.lineTo(x+3,y-h*.5);c.lineTo(x+5,y-3);c.lineTo(x+4,y);c.closePath();c.fill();
    c.fillStyle='#f0a340';c.beginPath();c.moveTo(x-3.5,y);c.lineTo(x-2,y-h*.4);c.lineTo(x+.6+f*.5,y-h*.76);c.lineTo(x+3,y-h*.33);c.lineTo(x+3.5,y);c.closePath();c.fill();
    c.fillStyle='#ffe4a0';c.beginPath();c.moveTo(x-1.8,y);c.lineTo(x+.6,y-h*.42);c.lineTo(x+2,y);c.closePath();c.fill();
   }
  }
  if(id==='cinemaparadiso'&&t>2.25){
   for(const [x,y,r] of [[198,91,8],[204,111,6]])for(let j=0;j<5;j++){const a=t*4+j/5*Math.PI*2;px(x+Math.cos(a)*r*.55,y+Math.sin(a)*r*.55,2,2,'#413d37')}
  }
  if(id==='bohemian'&&t>3.6){for(let i=0;i<28;i++){const x=94+i*7,y=116+Math.sin(i*3)*5;px(x,y,1,1,(i+Math.floor(t*3))%4?'#f3cf9c66':'#fff0cf')}}
  if(id==='lesmis'){for(let i=0;i<7;i++)px(mod(i*51+elapsed*8,320),143-i%3*4,2,1,'#a8947960')}
  if(id==='peterpan'){
   for(let i=0;i<15;i++){const old=Math.max(0,t-i*.09),x=201+68-old*17+i*.5,y=100+Math.sin(old/8*Math.PI*2)*8;px(x,y,1,1,i%3?'#f6d99088':'#fff1ba')}
  }
 }
}
