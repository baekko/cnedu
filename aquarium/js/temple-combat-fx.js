// Discrete, cached painted effect frames: no collision geometry is changed here.
const TAU=Math.PI*2,N=8;
const noise=(n)=>{const s=Math.sin(n*127.1+311.7)*43758.5453;return s-Math.floor(s);};
let cached;
function strip(w,h,paint){const sheet=document.createElement('canvas');sheet.width=w*N;sheet.height=h;const c=sheet.getContext('2d');for(let f=0;f<N;f++){c.save();c.translate(w*f,0);c.beginPath();c.rect(0,0,w,h);c.clip();paint(c,f);c.restore();}return {sheet,w,h};}
function line(c,points,color,width){c.strokeStyle=color;c.lineWidth=width;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();}
export function makeCombatEffects(){
 if(cached)return cached;
 const bolt=strip(160,240,(c,f)=>{
  const core=[[80,3],[70+noise(f+4)*21,38],[91,61],[72+noise(f+9)*12,99],[89,122],[69,167],[82,181],[80,210]];
  c.lineJoin='round';c.lineCap='round';c.shadowColor='#ffd264';c.shadowBlur=15;line(c,core,'#f5b73c66',13);line(c,core,'#ffe98b',6);c.shadowBlur=0;line(c,core,'#fffef1',2.8);
  for(let i=1;i<5;i++){const [x,y]=core[i],d=i%2?1:-1,branch=[[x,y],[x+d*(18+noise(f+i)*13),y+14],[x+d*14,y+29],[x+d*33,y+43]];line(c,branch,'#ffdb70aa',3);line(c,branch,'#fff7c6',1.1);}
  const glow=c.createRadialGradient(80,210,0,80,210,33);glow.addColorStop(0,'#fff4b1bb');glow.addColorStop(.4,'#ffcc5555');glow.addColorStop(1,'#ffd05700');c.fillStyle=glow;c.fillRect(44,176,72,64);
  c.strokeStyle='#ffe9a7';c.lineWidth=1.4;c.beginPath();c.ellipse(80,210,16+f*2,7+f*.8,0,0,TAU);c.stroke();
  for(let i=0;i<12;i++){const a=i*TAU/12+f*.2,r=13+(f%4)*4+noise(i)*8,x=80+Math.cos(a)*r,y=210+Math.sin(a)*r*.6;line(c,[[x,y],[x+Math.cos(a)*5,y+Math.sin(a)*4]],i%2?'#fff4b5':'#e4a346',1.4);}
 });
 const orb=strip(64,64,(c,f)=>{
  c.translate(32,32);c.rotate(f/N*TAU);const gr=c.createRadialGradient(-2,-3,0,0,0,20);gr.addColorStop(0,'#fff6ff');gr.addColorStop(.3,'#e5b2ff');gr.addColorStop(.6,'#ac67dc');gr.addColorStop(1,'#9652d300');c.fillStyle=gr;c.fillRect(-22,-22,44,44);c.strokeStyle='#f6d9ff';c.lineWidth=1.2;for(let i=0;i<3;i++){c.rotate(TAU/3);c.beginPath();c.ellipse(0,0,13,5,.6,0,TAU);c.stroke();}for(let i=0;i<5;i++){const a=i*TAU/5;c.fillStyle='#efd5ff';c.fillRect(Math.cos(a)*18-1,Math.sin(a)*18-1,2,2);}
 });
 cached={draw(c,kind,frame,x,y,w,h,alpha=1){const s={bolt,orb}[kind];c.save();c.globalAlpha*=alpha;c.drawImage(s.sheet,((frame%N)+N)%N*s.w,0,s.w,s.h,x,y,w,h);c.restore();}};return cached;
}
export function drawBoltWarning(c,h){
 const ratio=Math.min(1,h.age/h.warn);c.save();c.scale(1,.76);const glow=c.createRadialGradient(0,0,7,0,0,h.r+5);glow.addColorStop(0,'#ffe8a022');glow.addColorStop(.7,'#ffd86230');glow.addColorStop(1,'#ffb63d77');c.fillStyle=glow;c.beginPath();c.arc(0,0,h.r,0,TAU);c.fill();c.strokeStyle='#c58c33';c.lineWidth=1;c.stroke();c.strokeStyle='#fff0ba';c.lineWidth=2;c.beginPath();c.arc(0,0,h.r+4,-Math.PI/2,-Math.PI/2+TAU*ratio);c.stroke();
 for(let i=0;i<6;i++){const a=i*TAU/6;c.save();c.rotate(a);line(c,[[0,-h.r+6],[2,-h.r+3],[0,-h.r],[-2,-h.r+3],[0,-h.r+6]],'#efd18b',1);c.restore();}
 c.fillStyle='#f4ce69';c.beginPath();c.moveTo(1,-11);c.lineTo(-7,2);c.lineTo(-1,2);c.lineTo(-3,12);c.lineTo(8,-3);c.lineTo(2,-3);c.closePath();c.fill();c.restore();
}
