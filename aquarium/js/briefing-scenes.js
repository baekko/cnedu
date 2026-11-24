import {drawPlayerAction,actionFrame,leverStandpoint} from './player-actions.js?v=155';
import {ROOM_HERO_SIZE} from './hero-scale.js';
const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x));
function line(c,points,color,width=1){c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();}
function panel(c,x,y,w,h,color,r=3){c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();}
function dot(c,x,y,r,color){c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();}
function stars(c,x,y,t){for(let i=0;i<4;i++){const a=i*TAU/4+t*.5,r=8+t*12;line(c,[[x+Math.cos(a)*r,y+Math.sin(a)*r-2],[x+Math.cos(a)*r,y+Math.sin(a)*r+2]],'#caa55b',1.3);}}

export function exchangeBriefing(r,c,character,t){
 const u=t%4.8,press=u>=1&&u<2.1,frame=press?Math.min(3,Math.floor((u-1)/.275)):0;
 // A rear-facing child operates a trading terminal; the active fingertip is
 // registered to its screen rather than animated separately from the arm.
 const b=actionFrame(r.images,character,'leverUp',1),tip=b.palms?.[0]||b.tip,k=ROOM_HERO_SIZE/256,p={x:71,y:110,moving:false};
 const tx=p.x+(tip[0]-128)*k,ty=p.y+(tip[1]-244)*k;
 panel(c,tx-20,ty-20,57,34,'#466e6a',4);panel(c,tx-17,ty-17,51,27,'#e3efda',2);
 for(let i=0;i<4;i++)line(c,[[tx-12,ty-11+i*6],[tx+29,ty-11+i*6]],'#a2b9a64d',.6);
 const gain=clamp((u-1.8)/1.1);line(c,[[tx-12,ty+3],[tx-4,ty-3],[tx+4,ty],[tx+13,ty-8-gain*4],[tx+27,ty-10-gain*6]],'#629b7e',1.8);
 panel(c,tx+4,ty+14,7,13,'#9a9473',1);panel(c,tx-2,ty+25,20,3,'#7b836c',1);
 drawPlayerAction(c,r.images,character,p,'leverUp',frame);
 if(u>2.1&&u<4.1){const a=(u-2.1)/2;c.save();c.globalAlpha=Math.min(1,(4.1-u)*3);for(let i=0;i<3;i++){const y=ty-3-a*18-i*5,x=tx+39+i*5;dot(c,x,y,4,'#dab96a');line(c,[[x-1,y-2],[x-1,y+2]],'#fff1b9',1);}c.restore();}
}

export function templeBriefing(r,c,character,t){
 // Use the same coherent seated rowing poses and oar pivots as live sailing.
 const g={player:{moving:true,walk:t},stunLeft:0};
 c.save();c.translate(90+Math.sin(t*.65)*5,88);c.scale(1.2,1.2);
 for(let i=0;i<3;i++){const y=4+i*5,shift=((t*8+i*5)%20)-10;line(c,[[-40+shift,y],[-28+shift,y-1],[-15+shift,y]],'#81b5b39c',.7);line(c,[[17-shift,y],[28-shift,y-1],[40-shift,y]],'#81b5b39c',.7);}
 r.boat(c,g,character,t,true);c.restore();
}

export function photoBriefing(r,c,character,t){
 const u=t%4.5,ready=u>=1.15,shot=u>=1.85&&u<2.12,pose={x:98+(ready?0:Math.sin(u*3)*7),y:51,groundY:51,rotation:0,ready:true};
 const b=r.images.atlas.subjects[2];r.sprite(c,'subjects',b,pose.x,pose.y,36);
 const p={x:82,y:111,moving:false};
 // These are the real rear-camera poses: no lens painted toward the viewer.
 drawPlayerAction(c,r.images,character,p,'photoBack',shot?1:0);
 if(u<2.12){const a=ready?'#5c9b79':'#c6a45e';for(const [x,y,sx,sy]of [[pose.x-19,13,1,1],[pose.x+19,13,-1,1],[pose.x-19,54,1,-1],[pose.x+19,54,-1,-1]])line(c,[[x,y+sy*5],[x,y],[x+sx*5,y]],a,1.4);}
 if(shot){c.save();c.globalAlpha=(2.12-u)/.27;dot(c,91,76,10,'#fff2bc');stars(c,91,76,.1);c.restore();}
 if(u>=2.12&&u<4.15){panel(c,128,53,29,35,'#fff9e9',2);c.strokeStyle='#c5b687';c.lineWidth=.8;c.strokeRect(128,53,29,35);r.sprite(c,'subjects',b,142,79,23);line(c,[[147,83],[150,86],[155,80]],'#609b79',1.6);}
}

export function gardenBriefing(r,c,character,t){
 const u=t%4.4,trigger=u>=.75&&u<1.6,p={x:54,y:109,dir:'right',moving:false,walk:0,hammerAge:99},g={room:2,player:p,sprayAge:trigger?.1:99};
 r.object(c,'sprout',129,107,50);
 const beetle=r.images.beetle;if(u<1.9)c.drawImage(beetle,126,72,13,13*beetle.height/beetle.width);
 r.hero(c,g,character);
 const f=r.images.sprayHeroes.characters[character.id].frames.find(f=>f.direction==='right'&&f.pose===(trigger?'trigger':'holding')),k=ROOM_HERO_SIZE/256,n=f.nozzle,origin={x:p.x+(n.x-128)*k,y:p.y+(n.y-r.images.sprayHeroes.footY)*k};
 if(trigger){for(let i=0;i<10;i++){const a=((u-.75)*1.9+i/10)%1;dot(c,origin.x+(130-origin.x)*a,origin.y+(77-origin.y)*a+Math.sin(i*2)*a*4,.6+a*.6,'#8cc8c4b8');}}
 if(u>1.9&&u<3.8){stars(c,130,75,(u-1.9)*.5);}
}

export function dataBriefing(r,c,character,t){
 c.save();c.translate(0,22);
 const u=t%4.6,work=u>=.65&&u<1.7,state=u>=1.2?1:0,lever={x:83,y:84,state};
 // Match the exact live lever/hand registration for the selected character.
 const p=leverStandpoint(r.images,character,lever,r.images.propsAtlas.frames.leverLeft),frame=work?Math.min(3,Math.floor((u-.65)/.26)):0;
 const node=[83,62],ends=[[119,30],[150,53]];
 for(const [i,end]of ends.entries())line(c,[node,[104,62],end],i===state?'#78a99b':'#b0bca778',i===state?3:2);
 for(const [i,[x,y]]of ends.entries()){panel(c,x-9,y-13,19,26,'#526f70',3);for(let k=0;k<3;k++){line(c,[[x-5,y-7+k*7],[x+5,y-7+k*7]],'#b1d1c5',1);dot(c,x+5,y-7+k*7,1,i===state?'#d9cf85':'#86a99a');}}
 const base=r.images.propsAtlas.frames.leverLeft,k=30/(base.opaqueBounds[3]-base.opaqueBounds[1]),cut=base.pivot[1],f=actionFrame(r.images,character,'leverUp',frame),palms=f.palms?.length?f.palms:[f.tip],hand=palms.reduce((a,v)=>[a[0]+v[0]/palms.length,a[1]+v[1]/palms.length],[0,0]),hx=p.x+(hand[0]-128)*ROOM_HERO_SIZE/256,hy=p.y+(hand[1]-244)*ROOM_HERO_SIZE/256,px=lever.x+(base.pivot[0]-base.anchor[0])*k,py=lever.y+(base.pivot[1]-base.anchor[1])*k;
 // Keep the painted housing fixed; its shaft pivots to the actual joined hands.
 r.images.props&&c.drawImage(r.images.props,base.sx,base.sy+cut,base.sw,base.sh-cut,lever.x-base.anchor[0]*k,lever.y+(cut-base.anchor[1])*k,base.sw*k,(base.sh-cut)*k);
 line(c,[[px,py],[hx,hy]],'#6e6854',3);line(c,[[px-.5,py-.5],[hx-.5,hy-.5]],'#d8cda6',1.2);dot(c,hx,hy,2.4,'#b3985f');
 drawPlayerAction(c,r.images,character,{...p,moving:false},'leverUp',frame);
 if(u>=1.7&&u<3.8){const v=clamp((u-1.7)/1.5),end=ends[1],x=node[0]+(end[0]-node[0])*v,y=node[1]+(end[1]-node[1])*v;r.record(c,'star',x-7,y-7,14);if(v===1)stars(c,end[0],end[1],(u-3.2)*.5);}
 c.restore();
}
