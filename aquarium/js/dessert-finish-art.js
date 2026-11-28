import {stampTarget} from './dessert-finishing.js';
import {FINISH_SPRITES} from './dessert-art-sprites.js?v311';
let finishingAtlas=null;
export function setFinishingAtlas(image){finishingAtlas=image;}
export const hasFinishingAtlas=()=>!!finishingAtlas;
function sprite(c,index,x,y,w,h,stretch=false){
 if(!finishingAtlas)return false;const b=FINISH_SPRITES[index];if(!b)return false;
 if(!stretch){const scale=Math.min(w/b.sw,h/b.sh),dw=b.sw*scale,dh=b.sh*scale;x+=(w-dw)/2;y+=(h-dh)/2;w=dw;h=dh;}
 c.drawImage(finishingAtlas,b.sx,b.sy,b.sw,b.sh,x,y,w,h);return true;
}
const TAU=Math.PI*2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const oval=(c,x,y,rx,ry,color)=>{c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill();};
function gradient(c,x,y,r,stops){const g=c.createRadialGradient(x-r*.3,y-r*.4,r*.03,x,y,r);for(const [p,col]of stops)g.addColorStop(p,col);return g;}
function round(c,x,y,w,h,r,fill,stroke){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1;c.stroke();}}
function curve(c,pts,color,width=1){c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.beginPath();c.moveTo(pts[0],pts[1]);c.bezierCurveTo(...pts.slice(2));c.stroke();}
function label(c,s,x,y,size=9,color='#dce9dc'){c.font=`700 ${size}px sans-serif`;c.fillStyle=color;c.textAlign='center';c.fillText(s,x,y);}
function mat(c,height=132){
 round(c,3,3,294,height-6,11,'#224954','#e7d2a3');
 c.strokeStyle='#56787d';c.lineWidth=.5;for(let x=15;x<296;x+=14){c.beginPath();c.moveTo(x,8);c.lineTo(x,height-7);c.stroke();}for(let y=14;y<height-4;y+=14){c.beginPath();c.moveTo(8,y);c.lineTo(292,y);c.stroke();}
 for(const x of[10,290])for(const y of[10,height-10])oval(c,x,y,1.6,1.6,'#e7d2a3');
}
export function drawFruit(c,i,x,y,size=1){
 if(sprite(c,4+i,x-17*size,y-18*size,34*size,36*size))return;
 c.save();c.translate(x,y);c.scale(size,size);
 if(i===0){
  c.beginPath();c.moveTo(-11,-7);c.bezierCurveTo(-17,-20,17,-20,12,-6);c.bezierCurveTo(11,5,5,14,0,16);c.bezierCurveTo(-6,13,-11,4,-11,-7);c.fillStyle=gradient(c,0,-2,20,[[0,'#f6a08c'],[.35,'#df645d'],[1,'#993d43']]);c.fill();c.strokeStyle='#963e41';c.lineWidth=.7;c.stroke();
  for(let row=0;row<5;row++)for(let col=0;col<4-row*.45;col++){const xx=(col-(3-row*.45)/2)*5+(row%2)*1.3,yy=-9+row*4.5;oval(c,xx+.4,yy+.5,.85,1.25,'#9e4c40');oval(c,xx,yy,.55,.85,'#ffe1a0');}
  c.fillStyle='#669368';c.beginPath();c.moveTo(0,-13);for(let a=0;a<10;a++){const r=a%2?4:12;c.lineTo(Math.cos(a/10*TAU)*r,Math.sin(a/10*TAU)*r*.45-13);}c.closePath();c.fill();curve(c,[-7,-10,-10,-7,-8,-2,-8,0],'#ffccc1',1.3);
 }else if(i===1){
  oval(c,0,1,14,13,gradient(c,0,0,16,[[0,'#b7b3d4'],[.3,'#7e8ab8'],[1,'#414b75']]));
  oval(c,-5,-3,4.5,3,'#c1c6e0a0');c.fillStyle='#404765';c.beginPath();for(let a=0;a<10;a++){const r=a%2?3:6;c.lineTo(Math.cos(a/10*TAU)*r,Math.sin(a/10*TAU)*r-4);}c.closePath();c.fill();oval(c,0,-4,2,1.4,'#6978a0');curve(c,[-9,6,-5,10,5,11,9,6],'#68769d',1);
 }else{
  oval(c,0,1,15,14,'#8d6742');oval(c,0,0,14,13,'#b99463');oval(c,0,-.3,12.7,11.8,gradient(c,0,0,15,[[0,'#ecedbb'],[.3,'#c7d993'],[1,'#73a66f']]));
  for(let a=0;a<15;a++){const angle=a/15*TAU;c.strokeStyle='#eff0bf90';c.lineWidth=.7;c.beginPath();c.moveTo(Math.cos(angle)*3,Math.sin(angle)*3);c.lineTo(Math.cos(angle)*11,Math.sin(angle)*10);c.stroke();oval(c,Math.cos(angle)*7.8,Math.sin(angle)*7.3,.7,1,'#3f4e3b');}
  oval(c,0,0,3,2.7,'#fff0c3');curve(c,[-10,-4,-8,-8,-3,-11,1,-11],'#edf0c0',.9);
 }
 c.restore();
}
function cookie(c,x,y,stamped,active){
 if(finishingAtlas){if(active){c.strokeStyle='#bce6b8';c.lineWidth=1.4;c.beginPath();c.ellipse(x,y+1,38,29,0,0,TAU);c.stroke();}sprite(c,stamped?1:0,x-35,y-28,70,56);return;}
 oval(c,x,y+9,29,12,'#102d3866');oval(c,x,y+3,28,22,'#a56c38');
 c.beginPath();for(let n=0;n<=64;n++){const a=n/64*TAU,r=26+Math.sin(a*16)*.7;c.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r*.77);}c.closePath();c.fillStyle=gradient(c,x,y,32,[[0,'#f6d69a'],[.5,'#e5b76f'],[1,'#b77e42']]);c.fill();c.strokeStyle='#9c693a';c.lineWidth=.8;c.stroke();
 c.strokeStyle='#ffe2a399';c.beginPath();c.ellipse(x,y-1,23.7,17.8,0,Math.PI,TAU);c.stroke();
 for(let n=0;n<36;n++){const a=n*2.4,r=9+((n*17)%15);oval(c,x+Math.cos(a)*r,y+Math.sin(a)*r*.69,.35+(n%3)*.15,.35,n%3?'#9e71394d':'#fff0b97a');}
 if(stamped){
  for(let n=0;n<8;n++){const a=n/8*TAU;oval(c,x+Math.cos(a)*8,y+Math.sin(a)*6.4+1,4.8,3.6,'#a9764399');oval(c,x+Math.cos(a)*8,y+Math.sin(a)*6.4-.1,3.2,2.3,'#d6a466');}oval(c,x,y,4,3.3,'#a77743');oval(c,x-.5,y-1,2.5,1.7,'#efc383');
 }else{c.setLineDash([2,2]);c.strokeStyle=active?'#c6e8b3':'#c29257';c.lineWidth=1.2;c.beginPath();c.ellipse(x,y,13,10,0,0,TAU);c.stroke();c.setLineDash([]);}
 if(active){c.strokeStyle='#bce6b8';c.lineWidth=1.3;c.beginPath();c.ellipse(x,y+2,31,25,0,0,TAU);c.stroke();}
}
function stamp(c,x,y,press){
 if(sprite(c,7,x-17,y-35+press,34,45))return;
 c.save();c.translate(x,y+press);oval(c,0,7,12,5,'#16343e80');
 const wood=c.createLinearGradient(-6,0,6,0);wood.addColorStop(0,'#704b34');wood.addColorStop(.4,'#c39a68');wood.addColorStop(.75,'#9e744b');wood.addColorStop(1,'#674631');
 round(c,-5,-21,10,19,3,wood,'#67492f');oval(c,0,-21,7,4,'#ad895b');oval(c,-1,-22,4.4,1.6,'#d0ae79');
 oval(c,0,-1,14,6,'#a87348');oval(c,0,1,14,5,gradient(c,0,0,17,[[0,'#f2d19a'],[.5,'#cfaa70'],[1,'#946136']]));oval(c,0,1,9,3.2,'#b48752');c.strokeStyle='#f8e5b2';c.lineWidth=.7;c.beginPath();c.ellipse(0,0,12,3.4,0,Math.PI,TAU);c.stroke();c.restore();
}
function muffin(c,x,y,amount,active){
 const illustrated=sprite(c,2,x-32,y-18,64,57);
 if(!illustrated){
 oval(c,x,y+32,27,7,'#102d386b');
 const paper=c.createLinearGradient(x-23,0,x+23,0);paper.addColorStop(0,'#417a79');paper.addColorStop(.45,'#acd3be');paper.addColorStop(1,'#4f8a83');
 c.beginPath();c.moveTo(x-23,y);c.lineTo(x+23,y);c.lineTo(x+17,y+28);c.quadraticCurveTo(x,y+34,x-17,y+28);c.closePath();c.fillStyle=paper;c.fill();c.strokeStyle='#35676b';c.lineWidth=.8;c.stroke();
 for(let n=-4;n<=4;n++){const xx=n*4.6;curve(c,[x+xx,y+2,x+xx*.95,y+10,x+xx*.8,y+20,x+xx*.72,y+28],n%2?'#d0e5c466':'#356c6b70',1.1);}
 oval(c,x,y-2,24,11,gradient(c,x,y-3,27,[[0,'#f0c58a'],[.6,'#cd945c'],[1,'#946540']]));
 for(let n=0;n<18;n++){const a=n*2.4,r=5+n%15;oval(c,x+Math.cos(a)*r,y-3+Math.sin(a)*r*.37,.6,.5,n%2?'#a57046':'#f9d99b');}
 }
 if(amount>0&&illustrated){const h=61*clamp(amount,0,1.05);sprite(c,9,x-29,y-5-h,58,h+5,true);}
 else if(amount>0){
  const h=61*clamp(amount,0,1.05),base=y-5;c.save();c.translate(x,base);c.beginPath();c.moveTo(-24,0);c.bezierCurveTo(-30,-h*.14,-16,-h*.27,-18,-h*.4);c.bezierCurveTo(-20,-h*.56,-2,-h*.63,-5,-h*.76);c.quadraticCurveTo(-7,-h*.9,1,-h);c.quadraticCurveTo(12,-h*.8,7,-h*.65);c.bezierCurveTo(20,-h*.59,14,-h*.42,19,-h*.3);c.bezierCurveTo(17,-h*.19,29,-h*.12,24,0);c.quadraticCurveTo(0,8,-24,0);c.closePath();
  const cream=c.createLinearGradient(-26,0,25,-h);cream.addColorStop(0,'#b95170');cream.addColorStop(.35,'#ed91ab');cream.addColorStop(.65,'#ffc3d2');cream.addColorStop(1,'#d56c91');c.fillStyle=cream;c.fill();c.strokeStyle='#8c405d';c.lineWidth=1;c.stroke();
  c.save();c.clip();
  for(let n=1;n<5;n++){const f=n/5,yy=-h*f,ww=25*(1-f*.75);curve(c,[-ww,yy, -ww*.3,yy+5,ww*.7,yy+5,ww,yy-2],'#a8446b95',1.2);curve(c,[-ww+2,yy-2,-ww*.2,yy+1,ww*.6,yy+1,ww-2,yy-3],'#ffe4e8b0',1.2);}
  c.restore();
  c.restore();
 }
 if(active){const top=y-5-61*.84,bottom=y-5-61*.6;c.strokeStyle='#c5ed9f';c.lineWidth=2;c.setLineDash([3,2]);c.strokeRect(x-29,top,58,bottom-top);c.setLineDash([]);}
}
function pipingBag(c,x,tip){
 if(finishingAtlas){const b=FINISH_SPRITES[8],w=24,h=w*b.sh/b.sw;sprite(c,8,x-w*.5,tip-h,w,h,true);return;}
 c.save();c.translate(x,tip-5);c.rotate(-.17);const g=c.createLinearGradient(-16,-40,14,-4);g.addColorStop(0,'#fff3ea');g.addColorStop(.6,'#f3c8ce');g.addColorStop(1,'#ce93a9');c.beginPath();c.moveTo(-12,-38);c.quadraticCurveTo(20,-42,16,-22);c.lineTo(1,-1);c.lineTo(-4,-2);c.closePath();c.fillStyle=g;c.fill();c.strokeStyle='#bd879a';c.lineWidth=.8;c.stroke();curve(c,[-5,-34,-3,-20,-1,-12,-1,-7],'#fff5ec',1.4);round(c,-5,-4,7,8,1,'#a4bac0','#677c88');c.restore();
}
function tart(c,marks,step){
 if(finishingAtlas){sprite(c,11,60,55,180,107,true);sprite(c,3,77,60,146,99);for(let i=0;i<3;i++){const x=112+i*38;if(i<step)drawFruit(c,marks[i],x,96,.9);else{c.setLineDash([2,2]);c.strokeStyle=i===step?'#598463':'#c2a978';c.lineWidth=i===step?1.7:1;c.beginPath();c.ellipse(x,100,14,10,0,0,TAU);c.stroke();c.setLineDash([]);}}return;}
 oval(c,150,104,98,20,'#15333d80');oval(c,150,94,103,27,'#d1d9cc');oval(c,150,90,99,24,'#eff0dc');
 c.strokeStyle='#adb5a1';c.lineWidth=1;c.beginPath();c.ellipse(150,91,96,22,0,0,TAU);c.stroke();
 oval(c,150,92,83,24,'#a6723d');oval(c,150,85,85,22,gradient(c,150,84,92,[[0,'#f0c78a'],[.8,'#dfb06a'],[1,'#b08042']]));
 for(let n=0;n<42;n++){const a=n/42*TAU;oval(c,150+Math.cos(a)*79,85+Math.sin(a)*19.5,3.8,2.7,Math.sin(a)>0?'#d39b58':'#efcf94');}
 oval(c,150,83,74,17,gradient(c,150,80,80,[[0,'#fff4ca'],[.7,'#efd9a1'],[1,'#dabd7e']]));
 curve(c,[93,78,118,69,165,69,199,76],'#fff9de',1.8);
 for(let i=0;i<3;i++){const x=101+i*49;if(i<step)drawFruit(c,marks[i],x,78,1);else{c.setLineDash([2,2]);c.strokeStyle=i===step?'#598463':'#c2a978';c.lineWidth=i===step?1.7:1;c.beginPath();c.ellipse(x,81,16,11,0,0,TAU);c.stroke();c.setLineDash([]);}}
}
export function drawFinishing(c,t){
 c.setTransform(2,0,0,2,0,0);const height=t.kind==='tart'?168:132;c.clearRect(0,0,300,height);c.save();mat(c,height);
 if(t.kind==='cookie'){
  const target=20+260*stampTarget(t);round(c,17,24,266,12,6,'#142f38','#597777');round(c,target-15,21,30,18,7,'#85ac79','#c7e7a5');oval(c,target,30,7,6,'#dde9b9');
  for(const x of[28,66,104,142,180,218,256,274]){c.strokeStyle='#c4d2bd55';c.beginPath();c.moveTo(x,27);c.lineTo(x,32);c.stroke();}
  stamp(c,20+260*t.cursor,29,t.wait>0?Math.sin(Math.PI*Math.min(1,t.wait/.4))*5:0);
  for(let i=0;i<3;i++)cookie(c,62+i*88,91,i<t.step,i===t.step);
 }else if(t.kind==='muffin'){
  for(let i=0;i<3;i++){
   const x=62+i*88,amount=i<t.step?.72:i===t.step?t.amount:0;
   muffin(c,x,85,amount,i===t.step);
   if(i===t.step&&t.holding)pipingBag(c,x,80-61*amount);
   if(i<t.step){
    c.beginPath();c.moveTo(x-4,115);c.lineTo(x-1,118);c.lineTo(x+5,111);
    c.lineCap='round';c.lineJoin='round';c.strokeStyle='#435c34';c.lineWidth=3.5;c.stroke();
    c.strokeStyle='#d6eda9';c.lineWidth=1.9;c.stroke();
   }
  }
 }else{
  round(c,32,10,236,35,7,'#f4e5c7','#c9ae80');label(c,'견본',57,31,9,'#7c6046');
  t.pattern.forEach((f,i)=>{drawFruit(c,f,110+i*55,27,.76);if(i<2)label(c,'›',138+i*55,31,12,'#a78760');});tart(c,t.marks,t.step);
 }
 c.restore();
}
