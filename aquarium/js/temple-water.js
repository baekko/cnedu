// Sea effects share the actual background pixels. No separate blue medallion or
// opaque circular sprite is laid over the water. Frames are prepared only once.
const TAU=Math.PI*2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
// Small water highlights follow the current. None outlines a danger region.
function flecks(c,x,y,width,height,time,color,opacity,count){
 c.save();c.translate(x,y);c.strokeStyle=color;c.lineCap='round';
 for(let i=0;i<count;i++){
  const a=i*2.39996+time*2,r=.2+(i*7%13)/17;
  const px=Math.cos(a)*r*width,py=Math.sin(a)*r*height*.75;
  c.globalAlpha=opacity*(.35+.65*Math.sin(i*2.3+time*3)**2);
  c.lineWidth=i%4===0?1.2:.7;c.beginPath();c.moveTo(px-2,py);c.quadraticCurveTo(px+2,py-1.4,px+4,py-.2);c.stroke();
 }
 c.restore();
}
export function makeSeaEffects(sea,waves){
 const softWaves=document.createElement('canvas');softWaves.width=1024;softWaves.height=1152;
 const wc=softWaves.getContext('2d');wc.drawImage(waves,0,0);wc.globalCompositeOperation='destination-in';
 for(let f=0;f<4;f++){wc.save();wc.beginPath();wc.rect(0,f*288,1024,288);wc.clip();const mask=wc.createLinearGradient(0,f*288,0,(f+1)*288);mask.addColorStop(0,'#0000');mask.addColorStop(.23,'#000');mask.addColorStop(.77,'#000');mask.addColorStop(1,'#0000');wc.fillStyle=mask;wc.fillRect(0,f*288,1024,288);wc.restore();}
 const size=288,frames=24,cols=6,source=document.createElement('canvas');
 source.width=source.height=size;const sc=source.getContext('2d',{willReadFrequently:true});
 const sourceSide=sea.width*.68;sc.drawImage(sea,(sea.width-sourceSide)/2,sea.height*.37,sourceSide,sourceSide,0,0,size,size);
 const pixels=sc.getImageData(0,0,size,size).data,sheet=document.createElement('canvas');sheet.width=size*cols;sheet.height=size*frames/cols;
 const ctx=sheet.getContext('2d'),frame=document.createElement('canvas');frame.width=frame.height=size;const fc=frame.getContext('2d');
 for(let f=0;f<frames;f++){
  const out=fc.createImageData(size,size),phase=f/frames*TAU;
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
   const dx=x-size/2,dy=y-size/2,r=Math.hypot(dx,dy),q=r/(size/2);if(q>=1)continue;
   const a=Math.atan2(dy,dx)+4.4*(1-q)**1.35+phase,sr=r*.91;
   const sx=clamp(Math.round(size/2+Math.cos(a)*sr),0,size-1),sy=clamp(Math.round(size/2+Math.sin(a)*sr),0,size-1),i=(y*size+x)*4,j=(sy*size+sx)*4;
   const dark=1-.43*(1-q)**2,alpha=clamp((1-q)/.24,0,1)*.82;
   out.data[i]=pixels[j]*dark;out.data[i+1]=pixels[j+1]*dark;out.data[i+2]=pixels[j+2]*dark;out.data[i+3]=255*alpha;
  }
  fc.putImageData(out,0,0);fc.save();fc.translate(size/2,size/2);
  // Broken, fine foam follows inward spiral arms; no heavy circular outer rim.
  for(let arm=0;arm<7;arm++)for(let part=0;part<26;part++){
   const u=part/26,r=18+u*121,a=arm*TAU/7+phase+3.4*(1-u),length=.045+.08*u;
   if((part+arm)%4===0)continue;
   fc.strokeStyle=(part+arm)%3?'#bfeee2':'#edf9df';fc.globalAlpha=(.18+.35*Math.sin(u*Math.PI))*(1-u*.4);fc.lineWidth=.55+u*.85;fc.lineCap='round';fc.beginPath();
   for(let k=0;k<=5;k++){const v=k/5,rr=r+v*1.2,aa=a+v*length;const px=Math.cos(aa)*rr,py=Math.sin(aa)*rr;k?fc.lineTo(px,py):fc.moveTo(px,py);}fc.stroke();
  }
  fc.restore();ctx.drawImage(frame,(f%cols)*size,Math.floor(f/cols)*size);
 }
 return {
  whirlpool(c,x,y,t,strength){
   const f=Math.floor(t*8)%frames;c.save();c.globalAlpha=.84+strength*.16;c.drawImage(sheet,(f%cols)*size,Math.floor(f/cols)*size,size,size,x-size/2,y-size/2,size,size);c.restore();
   const pull=Math.max(0,(strength-.6)/.4);
   if(pull>0){
    c.save();c.translate(x,y);c.globalAlpha=pull*.55;
    const depth=c.createRadialGradient(0,0,4,0,0,34);
    depth.addColorStop(0,'#1c3a4d');depth.addColorStop(.58,'#25526484');depth.addColorStop(1,'#25526400');
    c.fillStyle=depth;c.fillRect(-34,-34,68,68);c.restore();
    flecks(c,x,y,33,33,-t*1.8,'#c9f5e6',pull*.58,11);
   }
  },
  sirenReflection(c,x,y,t){
   c.save();c.translate(x,y);c.scale(1,34/38);
   const light=c.createRadialGradient(0,0,0,0,0,38);
   light.addColorStop(0,'#efd4f763');light.addColorStop(.54,'#e6bdf335');light.addColorStop(1,'#e6bdf300');
   c.fillStyle=light;c.fillRect(-38,-38,76,76);c.restore();
   flecks(c,x,y,34,34,t,'#e8c6f2',.42,10);
  },
  scyllaWake(c,x,y,charge){
   c.save();c.translate(x,y);c.scale(19/20,1);
   const shade=c.createRadialGradient(0,0,0,0,0,20);
   shade.addColorStop(0,'#152b42b0');shade.addColorStop(.56,'#152b4262');shade.addColorStop(1,'#152b4200');
   c.globalAlpha=.44+charge*.56;c.fillStyle=shade;c.fillRect(-20,-20,40,40);c.restore();
   flecks(c,x,y,17,18,charge,'#bceae0',.24+charge*.24,7);
  },
  wave(c,h,Y,half,crest){
   const horizontal=h.axis==='z',position=horizontal?Y(h.z):h.x;
   const lo=horizontal?0:Y(h.z+(h.span||200)),hi=horizontal?390:Y(h.z-(h.span||200));
   const gap=horizontal?h.gap:Y(h.gap),active=h.age>=h.warn;
   if(horizontal&&(position<-150||position>650))return;if(!horizontal&&(position<-150||position>540))return;
   const span=hi-lo,width=Math.max(390,span),height=crest*2,left=(lo+hi-width)/2;
   const cycle=[1,2,2,2,3,2],time=Math.max(0,h.age-h.warn)*5.5,step=Math.floor(time),mix=time-step;
   const first=active?cycle[step%cycle.length]:0,second=active?cycle[(step+1)%cycle.length]:1;
   c.save();if(horizontal)c.translate(0,position);else{c.translate(position,0);c.transform(0,1,h.v>0?1:-1,0,0,0);}
   // Clip the moving crest at the physical edge, avoiding any foam in the gap.
   c.beginPath();
   if(gap-half>lo)c.rect(lo,-crest,Math.min(hi,gap-half)-lo,height);
   if(gap+half<hi)c.rect(Math.max(lo,gap+half),-crest,hi-Math.max(lo,gap+half),height);
   c.clip();
   for(let x=lo;x<hi;x+=6){
    const end=Math.min(x+6,hi),mid=(x+end)/2,edge=Math.abs(mid-gap)-half;if(edge<=0)continue;
    const opacity=clamp(edge/12,0,1)*(active?1:.3+.45*clamp(h.age/h.warn,0,1));
    const sx=(x-left)/width*1024,sw=(end-x)/width*1024,roll=Math.sin(x*.026-time*1.4)*2.4;
    // The crest, and therefore contact, is centred on the hazard's own position.
    const top=-crest+roll;
    c.globalAlpha=opacity*(1-mix);c.drawImage(softWaves,sx,first*288,sw,288,x,top,end-x,height);
    c.globalAlpha=opacity*mix;c.drawImage(softWaves,sx,second*288,sw,288,x,top,end-x,height);
   }
   // Short lived foam spreads behind the advancing crest, slowing as it fades.
   if(active)for(let i=0;i<34;i++){
    const x=lo+((i*47.3)%span),age=(h.age*.7+i*.137)%1,edge=Math.abs(x-gap)-half;if(edge<8)continue;
    c.globalAlpha=(1-age)*.46*clamp(edge/15,0,1);c.strokeStyle='#e4f7e5';c.lineWidth=.65;c.beginPath();
    const y=-7-age*45;c.moveTo(x,y);c.quadraticCurveTo(x+3,y+1.8,x+5+age*4,y-.6);c.stroke();
   }
   c.restore();
  }
 };
}
