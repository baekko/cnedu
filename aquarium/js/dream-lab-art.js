import {beginScene} from './layout.js';
const TAU=Math.PI*2,clamp=n=>Math.max(0,Math.min(1,n));
const box=(c,x,y,w,h,fill,r=4)=>{c.fillStyle=fill;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();};
const stroke=(c,color='#b99a63',w=1)=>{c.strokeStyle=color;c.lineWidth=w;c.stroke();};
const line=(c,x,y,xx,yy,color,w=1)=>{c.strokeStyle=color;c.lineWidth=w;c.lineCap='round';c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.stroke();};
const oval=(c,x,y,rx,ry,fill)=>{c.fillStyle=fill;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill();};
const text=(c,s,x,y,size=10,color='#4d546c')=>{c.font=`700 ${size}px sans-serif`;c.textAlign='center';c.textBaseline='middle';c.fillStyle=color;c.fillText(s,x,y);};
export class DreamLaboratoryArt {
 chair(c,x,y,size=130,character=null,t=0){
  c.save();c.translate(x,y);c.scale(size/130,size/130);oval(c,0,0,66,12,'#30495824');
  line(c,-40,-106,-40,-22,'#627c83',6);line(c,-40,-106,-14,-117,'#889fa0',6);line(c,-15,-117,16,-117,'#889fa0',6);
  box(c,-41,-19,82,18,'#71878b',7);stroke(c,'#516a76');box(c,-32,-13,65,7,'#a8bdb9',3);box(c,-29,-86,58,67,'#6596a0',12);stroke(c,'#4e7083');box(c,-25,-82,50,55,'#a1c9c8',10);line(c,-22,-52,21,-52,'#c8e0d4');
  box(c,-35,-28,70,18,'#d4d7bb',6);stroke(c,'#759294');box(c,-27,-26,54,12,'#a5c7bb',5);
  if(character){const i=['haru','doyun','narin','soi'].indexOf(character.id);c.drawImage(this.images.seated,(i%2)*256,Math.floor(i/2)*256,256,256,-39,-96+Math.sin(t*1.6)*.5,78,78);}
  for(const xx of[-38,30]){box(c,xx,-44,9,27,'#adc3bc',4);stroke(c,'#718b89');box(c,xx-3,-47,15,8,'#e4dfbf',3);}
  c.fillStyle='#9bc5cfa8';c.beginPath();c.ellipse(0,-100,30,19,0,Math.PI,TAU);c.lineTo(30,-96);c.quadraticCurveTo(0,-89,-30,-96);c.closePath();c.fill();stroke(c,'#526e7c',1.1);
  c.save();c.clip();oval(c,-9,-110,17,8,'#e3f0df88');oval(c,12,-94,22,6,'#6096aa66');c.restore();
  for(let i=0;i<5;i++)oval(c,-20+i*10,-99-Math.sin(i/4*Math.PI)*10,2.2,2.2,character?'#f5d990':'#bed1ce');
  box(c,45,-64,26,31,'#62818c',4);stroke(c,'#adc7bc');box(c,48,-61,20,20,'#243f58',2);c.strokeStyle='#92d4c3';c.lineWidth=1;c.beginPath();for(let i=0;i<20;i++){const yy=-51+Math.sin(i*.7+t*1.6)*3;i?c.lineTo(49+i*.9,yy):c.moveTo(49,yy);}c.stroke();line(c,58,-32,58,-6,'#6f8990',3);box(c,47,-6,23,5,'#8da5a3',2);
  c.restore();
 }
 entrance(c){this.chair(c,117,203,186);}
 briefing(c,character,t){this.chair(c,88,110,112,character,t);for(let i=0;i<3;i++){const u=(t*.3+i/3)%1;c.save();c.globalAlpha=Math.sin(u*Math.PI)*.7;text(c,'z',103+u*22,31-u*20,7+u*5,'#6f8aa1');c.restore();}}
 lab(c,character,t){
  c.fillStyle='#cadcda';c.fillRect(0,0,390,221);c.fillStyle='#d2cadd';c.fillRect(0,221,390,279);c.fillStyle='#e3ece3';c.fillRect(0,0,390,17);
  for(const x of [21,133,257,369])line(c,x,17,x,219,'#9ebbb9',1);
  line(c,0,216,390,216,'#e5ebe0',2);line(c,0,220,390,220,'#8795a8',1);
  box(c,34,46,322,174,'#88a6b1',12);stroke(c,'#526b7d',1.2);box(c,41,53,308,159,'#314c67',8);stroke(c,'#3d5367');
  for(let r=0;r<3;r++){line(c,55,84+r*42,333,84+r*42,'#607b8f',.6);c.strokeStyle=['#c7b8df','#90cbbf','#e6d39e'][r];c.lineWidth=1.4;c.beginPath();for(let x=0;x<275;x++){const y=82+r*42+Math.sin(x*.08+t+r)*8*Math.sin(x*.018);x?c.lineTo(57+x,y):c.moveTo(57+x,y);}c.stroke();}
  for(let z=250;z<500;z+=54)line(c,0,z,390,z,'#9d93ad80',.7);for(let x=-200;x<700;x+=95)line(c,195+(x-195)*.55,220,x,500,'#9d93ad80',.7);
  this.chair(c,180,390,230,character,t);text(c,'꿈연구소',195,25,14,'#526f7d');
 }
}
